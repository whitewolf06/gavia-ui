"""Read-only TrueType master preflight; uses only the Python standard library.

This compares committed outlines, never instantiates or rewrites a font. Passing
the structural checks is necessary, but does not prove optical interpolation.
"""
from __future__ import annotations

import argparse
import ast
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[2]
AXIS = {"tag": "wght", "minimum": 100, "default": 400, "maximum": 700}


class FontDataError(ValueError):
    """A font cannot safely participate in the outline audit."""


def unpack(data, offset, pattern):
    size = struct.calcsize(">" + pattern)
    if offset < 0 or offset + size > len(data):
        raise FontDataError("Truncated TrueType data")
    return struct.unpack_from(">" + pattern, data, offset)


def tables(data):
    if data[:4] != b"\x00\x01\x00\x00":
        raise FontDataError("Expected an uncompressed TrueType sfnt font")
    count, = unpack(data, 4, "H")
    result = {}
    for index in range(count):
        tag, _, offset, length = unpack(data, 12 + index * 16, "4sIII")
        name = tag.decode("ascii")
        if name in result or offset + length > len(data):
            raise FontDataError("Invalid or duplicate table: " + name)
        result[name] = data[offset:offset + length]
    for required in ("head", "maxp", "loca", "glyf", "cmap", "OS/2"):
        if required not in result:
            raise FontDataError("Missing table: " + required)
    return result


def unicode_map(cmap):
    """Read Unicode cmap formats 4/12; retain character labels for diagnostics."""
    result = {}
    count, = unpack(cmap, 2, "H")
    for index in range(count):
        platform, encoding, offset = unpack(cmap, 4 + index * 8, "HHI")
        if platform != 0 and not (platform == 3 and encoding in (1, 10)):
            continue
        form, = unpack(cmap, offset, "H")
        if form == 12:
            groups, = unpack(cmap, offset + 12, "I")
            for group in range(groups):
                start, end, glyph = unpack(cmap, offset + 16 + group * 12, "III")
                if start > end or end > 0x10FFFF:
                    raise FontDataError("Invalid cmap character group")
                for char in range(start, end + 1):
                    result[char] = glyph + char - start
        elif form == 4:
            segment_bytes, = unpack(cmap, offset + 6, "H")
            segments = segment_bytes // 2
            ends = offset + 14
            starts = ends + 2 * segments + 2
            deltas = starts + 2 * segments
            ranges = deltas + 2 * segments
            for segment in range(segments):
                end, = unpack(cmap, ends + 2 * segment, "H")
                start, = unpack(cmap, starts + 2 * segment, "H")
                delta, = unpack(cmap, deltas + 2 * segment, "h")
                distance, = unpack(cmap, ranges + 2 * segment, "H")
                if start > end:
                    raise FontDataError("Invalid cmap segment")
                for char in range(start, min(end, 0xFFFE) + 1):
                    if distance:
                        glyph, = unpack(cmap, ranges + 2 * segment + distance + 2 * (char - start), "H")
                        if glyph:
                            glyph = (glyph + delta) & 0xFFFF
                    else:
                        glyph = (char + delta) & 0xFFFF
                    if glyph:
                        result.setdefault(char, glyph)
    if not result:
        raise FontDataError("No supported Unicode cmap")
    return result


def glyph_topology(data):
    if not data:
        return {"kind": "empty"}
    contours, = unpack(data, 0, "h")
    if contours >= 0:
        ends = list(unpack(data, 10, "H" * contours))
        if any(first >= second for first, second in zip(ends, ends[1:])):
            raise FontDataError("Non-increasing contour endpoints")
        count = ends[-1] + 1 if ends else 0
        instruction_length, = unpack(data, 10 + contours * 2, "H")
        cursor = 12 + contours * 2 + instruction_length
        flags = []
        while len(flags) < count:
            flag, = unpack(data, cursor, "B")
            cursor += 1
            repeats = 0
            if flag & 8:
                repeats, = unpack(data, cursor, "B")
                cursor += 1
            flags.extend([flag] * (repeats + 1))
        if len(flags) != count:
            raise FontDataError("Repeated point flags exceed outline length")
        coordinate_bytes = sum((1 if flag & 2 else 0 if flag & 16 else 2)
                               + (1 if flag & 4 else 0 if flag & 32 else 2) for flag in flags)
        if cursor + coordinate_bytes > len(data):
            raise FontDataError("Truncated glyph coordinates")
        return {"kind": "simple", "contours": contours, "points": count,
                "endPoints": ends, "onCurve": "".join("1" if flag & 1 else "0" for flag in flags)}
    components = []
    cursor = 10
    while True:
        flags, glyph = unpack(data, cursor, "HH")
        cursor += 4
        arguments = 4 if flags & 1 else 2
        transform = 8 if flags & 128 else 4 if flags & 64 else 2 if flags & 8 else 0
        unpack(data, cursor, "B" * (arguments + transform))
        cursor += arguments + transform
        components.append({"glyph": glyph, "argumentMode": "xy" if flags & 2 else "points",
                           "transformBytes": transform, "useMetrics": bool(flags & 512)})
        if not flags & 32:
            break
    if flags & 256:
        instruction_length, = unpack(data, cursor, "H")
        if cursor + 2 + instruction_length > len(data):
            raise FontDataError("Truncated composite instructions")
    return {"kind": "composite", "components": components}


def inspect_font(path):
    data = path.read_bytes()
    font = tables(data)
    count, = unpack(font["maxp"], 4, "H")
    loca_format, = unpack(font["head"], 50, "h")
    if loca_format not in (0, 1):
        raise FontDataError("Invalid loca format")
    positions = unpack(font["loca"], 0, ("H" if loca_format == 0 else "I") * (count + 1))
    positions = [position * (2 if loca_format == 0 else 1) for position in positions]
    if positions[-1] > len(font["glyf"]) or any(a > b for a, b in zip(positions, positions[1:])):
        raise FontDataError("Invalid glyph offsets")
    weight, = unpack(font["OS/2"], 4, "H")
    cmap = unicode_map(font["cmap"])
    if any(glyph >= count for glyph in cmap.values()):
        raise FontDataError("cmap references a missing glyph")
    return {"sha256": hashlib.sha256(data).hexdigest(), "weight": weight, "glyphs": count,
            "unitsPerEm": unpack(font["head"], 18, "H")[0], "cmap": cmap,
            "glyphNames": hashlib.sha256(font.get("post", b"")[32:]).hexdigest(),
            "outlines": [glyph_topology(font["glyf"][a:b]) for a, b in zip(positions, positions[1:])]}


def compare_masters(masters):
    """Return every incompatible glyph; never normalize, reorder or fit contours."""
    reference = masters[0]
    issues = []
    for master in masters[1:]:
        for key in ("glyphs", "unitsPerEm", "cmap", "glyphNames"):
            if master.get(key) != reference.get(key):
                issues.append({"type": key, "master": master["file"], "reference": reference["file"]})
    labels = defaultdict(list)
    for char, glyph in reference["cmap"].items():
        labels[glyph].append(f"U+{char:04X} {chr(char)}")
    for glyph in range(min(master["glyphs"] for master in masters)):
        variants = [master["outlines"][glyph] for master in masters]
        if any(variant != variants[0] for variant in variants[1:]):
            issues.append({"type": "outline", "glyph": glyph, "characters": labels[glyph],
                           "masters": [{"file": master["file"], "weight": master["weight"], **variant}
                                       for master, variant in zip(masters, variants)]})
    return issues


def audit(root=ROOT):
    directory = root / "packages/ui-kit/fonts/gavia"
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    groups = defaultdict(list)
    for face in manifest["faces"]:
        filename = face["ttf"]["file"]
        if Path(filename).name != filename or not filename.endswith(".ttf"):
            raise FontDataError("Unsafe master filename")
        master = inspect_font(directory / filename)
        if master["sha256"] != face["ttf"]["sha256"] or master["weight"] != face["weight"]:
            raise FontDataError("Master differs from its accepted manifest: " + filename)
        groups[face["style"]].append({"file": filename, **master})
    # Read the frozen identities as literals; importing the verifier would load
    # optional FontTools/HarfBuzz dependencies and is unnecessary for preflight.
    verifier = ast.parse((root / "scripts/fonts/verify_fonts.py").read_text(encoding="utf-8"))
    approved = next((ast.literal_eval(node.value) for node in verifier.body if isinstance(node, ast.Assign)
                     and any(isinstance(target, ast.Name) and target.id == "APPROVED_SANS_0600_SHA256"
                             for target in node.targets)), None)
    if not approved:
        raise FontDataError("Frozen accepted font identities are missing")
    for masters in groups.values():
        for master in masters:
            if approved.get(master["file"]) != master["sha256"]:
                raise FontDataError("Master differs from frozen drawing acceptance: " + master["file"])
    report = {"family": manifest["family"], "version": manifest["version"], "acceptedAxis": AXIS,
              "futureWeight900": "No accepted master or authored stroke calibration; never extrapolate the current drawing",
              "scope": "Necessary structural compatibility only; no optical or contour-correspondence approval",
              "styles": {}, "ready": True}
    for style in ("normal", "italic"):
        masters = sorted(groups[style], key=lambda master: master["weight"])
        if not masters:
            raise FontDataError("Missing masters: " + style)
        issues = compare_masters(masters)
        available = [master["weight"] for master in masters]
        for weight in (AXIS["minimum"], AXIS["default"], AXIS["maximum"]):
            if weight not in available:
                issues.append({"type": "missingWeight", "weight": weight})
        if len(set(available)) != len(available):
            issues.append({"type": "duplicateWeight"})
        report["styles"][style] = {"weights": available, "glyphs": masters[0]["glyphs"],
            "masters": [{"file": master["file"], "sha256": master["sha256"]} for master in masters],
            "incompatibleGlyphs": sum(issue["type"] == "outline" for issue in issues), "issues": issues}
        report["ready"] = report["ready"] and not issues
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--report", type=Path, help="Optional JSON report; no font files are written")
    args = parser.parse_args()
    report = audit(args.root.resolve())
    source = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(source, encoding="utf-8")
    else:
        print(source, end="")
    return 0 if report["ready"] else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FontDataError, OSError, KeyError, ValueError) as error:
        print("Variable font preflight: " + str(error), file=sys.stderr)
        sys.exit(2)
