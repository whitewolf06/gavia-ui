"""Focused preflight tests; synthetic fonts stay in temporary directories."""
from __future__ import annotations

import copy
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import struct
import tempfile
import unittest

from audit_variable import FontDataError, ROOT, audit, compare_masters, glyph_topology, inspect_font
from build_variable import destination, preflight


@contextmanager
def fixture_directory():
    parent = (ROOT / ".tmp").resolve()
    parent.mkdir(exist_ok=True)
    temporary = tempfile.TemporaryDirectory(prefix="gavia-font-audit-", dir=parent)
    path = Path(temporary.name).resolve()
    if path.parent != parent or not path.name.startswith("gavia-font-audit-"):
        raise ValueError("Temporary font fixture escaped its workspace directory")
    try:
        yield str(path)
    finally:
        temporary.cleanup()


def simple(flags):
    return struct.pack(">hhhhhHH", 1, 0, 0, 10, 10, len(flags) - 1, 0) + bytes(flags)


def synthetic_font(weight=400):
    head = bytearray(54)
    struct.pack_into(">H", head, 18, 1000)
    struct.pack_into(">h", head, 50, 1)
    outline = simple([49, 49, 49])
    cmap = struct.pack(">HHHHIHHIIIIII", 0, 1, 3, 10, 12, 12, 0, 28, 0, 1, 48, 48, 1)
    os2 = bytearray(64)
    struct.pack_into(">H", os2, 4, weight)
    data = {"head": bytes(head), "maxp": struct.pack(">IH", 0x10000, 2),
            "loca": struct.pack(">III", 0, 0, len(outline)), "glyf": outline,
            "cmap": cmap, "OS/2": bytes(os2)}
    offset = 12 + 16 * len(data)
    records = bytearray()
    payload = bytearray()
    for name, content in data.items():
        records.extend(struct.pack(">4sIII", name.encode("ascii"), 0, offset, len(content)))
        padding = (4 - len(content) % 4) % 4
        payload.extend(content + b"\0" * padding)
        offset += len(content) + padding
    return struct.pack(">IHHHH", 0x10000, len(data), 0, 0, 0) + records + payload


class VariablePreflightTests(unittest.TestCase):
    def test_compressed_and_expanded_point_flags_describe_the_same_topology(self):
        compressed = struct.pack(">hhhhhHH", 1, 0, 0, 10, 10, 2, 0) + bytes([57, 2])
        self.assertEqual(glyph_topology(simple([49, 49, 49])), glyph_topology(compressed))

    def test_different_point_kinds_and_contour_counts_are_incompatible(self):
        first = {"file": "regular.ttf", "weight": 400, "glyphs": 1, "unitsPerEm": 1000,
                 "cmap": {48: 0}, "outlines": [glyph_topology(simple([49, 49, 49]))]}
        second = copy.deepcopy(first)
        second["file"], second["weight"] = "bold.ttf", 700
        second["outlines"] = [glyph_topology(simple([48, 49, 49]))]
        self.assertEqual(compare_masters([first, second])[0]["characters"], ["U+0030 0"])
        second["outlines"] = [{"kind": "empty"}]
        self.assertEqual(len(compare_masters([first, second])), 1)

    def test_composite_component_identity_and_order_are_part_of_contract(self):
        header = struct.pack(">hhhhh", -1, 0, 0, 10, 10)
        components = struct.pack(">HHhhHHhh", 35, 1, 0, 0, 3, 2, 10, 0)
        result = glyph_topology(header + components)
        self.assertEqual([component["glyph"] for component in result["components"]], [1, 2])
        self.assertEqual(result["components"][0]["argumentMode"], "xy")

    def test_truncated_and_invalid_flag_runs_fail_closed(self):
        for data in (b"\0", simple([57, 20]), simple([1, 1, 1])):
            with self.subTest(data=data), self.assertRaises(FontDataError):
                glyph_topology(data)

    def test_sfnt_cmap_glyph_offsets_and_hash_are_read_without_dependencies(self):
        with fixture_directory() as temp:
            path = Path(temp) / "font.ttf"
            data = synthetic_font()
            path.write_bytes(data)
            result = inspect_font(path)
            self.assertEqual(result["sha256"], hashlib.sha256(data).hexdigest())
            self.assertEqual((result["weight"], result["glyphs"], result["cmap"]), (400, 2, {48: 1}))
            path.write_bytes(data[:-10])
            with self.assertRaises(FontDataError):
                inspect_font(path)

    def test_manifest_mismatched_master_hash_is_rejected(self):
        with fixture_directory() as temp:
            root = Path(temp)
            directory = root / "packages/ui-kit/fonts/gavia"
            directory.mkdir(parents=True)
            (directory / "font.ttf").write_bytes(synthetic_font())
            manifest = {"family": "Fixture", "version": "0", "faces": [{"style": "normal", "weight": 400,
                "ttf": {"file": "font.ttf", "sha256": "0" * 64}}]}
            (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaisesRegex(FontDataError, "accepted manifest"):
                audit(root)

    def test_build_destination_refuses_sources_specimens_and_existing_paths(self):
        with fixture_directory() as temp:
            root = Path(temp)
            for name in ("packages/ui-kit/fonts/gavia/variable", "apps/playground/public/fonts", "scripts/fonts/sources", "."):
                with self.subTest(name=name), self.assertRaises(ValueError):
                    destination(root, root / name)
            self.assertEqual(destination(root, root / "draft"), root / "draft")

    def test_committed_masters_fail_preflight_without_writing_any_asset(self):
        directory = ROOT / "packages/ui-kit/fonts/gavia"
        before = {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in directory.iterdir() if path.is_file()}
        result = audit()
        self.assertFalse(result["ready"])
        self.assertEqual(result["acceptedAxis"]["maximum"], 700)
        for group in result["styles"].values():
            self.assertEqual(group["incompatibleGlyphs"], 24)
        with self.assertRaisesRegex(ValueError, "No output was written"):
            preflight()
        after = {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in directory.iterdir() if path.is_file()}
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main()
