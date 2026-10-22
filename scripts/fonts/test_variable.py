"""Focused preflight tests; synthetic fonts stay in temporary directories."""
from __future__ import annotations

import copy
from contextlib import contextmanager
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch

from audit_variable import FontDataError, ROOT, audit, compare_masters, glyph_topology, inspect_font
from build_variable import (
    core_size_budget,
    destination,
    draft_css,
    nodal_supports,
    preflight,
    subset_coverage,
    unicode_range,
)
from variable_geometry import (
    exact_segments,
    four_contours,
    materialize,
    pad_parts,
    parts_in_order,
    point_blocks,
    verify_endpoint,
)


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


def contour(points):
    """Small exact outlines on the derived grid; no compiled font dependency."""
    return [{"xy": xy, "flag": flag, "source": index}
            for index, (xy, flag) in enumerate(points)]


class VariableEndpointTests(unittest.TestCase):
    def test_implied_midpoints_preserve_the_directed_quadratic_stream(self):
        original = contour([((0, 0), 65), ((2, 4), 0), ((6, 4), 0),
                            ((8, 0), 1), ((8, -2), 1)])
        before = copy.deepcopy(original)
        normalized = materialize(original)
        midpoint = next(point for point in normalized if point.get("kind") == "midpoint")
        self.assertEqual(midpoint["xy"], (4, 4))
        self.assertEqual(midpoint["sourcePair"], (1, 2))
        self.assertEqual([polynomial for polynomial, _ in exact_segments(original)],
                         [polynomial for polynomial, _ in exact_segments(normalized)])
        report = verify_endpoint([original], [normalized])
        self.assertTrue(report[0]["fullFlagsAndDirectedPolynomialStreamRecovered"])
        self.assertEqual(original, before)

    def test_line_degree_elevation_adds_no_curvature(self):
        original = contour([((0, 0), 1), ((8, 0), 1), ((8, 8), 1), ((0, 8), 1)])
        normalized = materialize(original, elevate_lines=True)
        self.assertEqual(len(normalized), 8)
        self.assertEqual([polynomial for polynomial, _ in exact_segments(original)],
                         [polynomial for polynomial, _ in exact_segments(normalized)])
        self.assertTrue(verify_endpoint([original], [normalized])[0]
                        ["fullFlagsAndDirectedPolynomialStreamRecovered"])

    def test_named_span_padding_is_algebraically_constant(self):
        original = contour([((0, 0), 1), ((4, 8), 0), ((8, 0), 1)])
        blocks = point_blocks(original)
        parts = parts_in_order(original, ("bowl", "close"), [[blocks[0]], [blocks[1]]], {0})
        normalized, spans = pad_parts(original, parts, [3, 1])
        self.assertEqual(spans[0]["constantQuadratics"], 2)
        report = verify_endpoint([original], [normalized])
        self.assertEqual(report[0]["constantSegments"], 2)
        self.assertEqual([point for point in normalized if point["source"] is not None], original)
        corrupted = copy.deepcopy(normalized)
        corrupted[1]["xy"] = (2, 0)
        with self.assertRaisesRegex(ValueError, "not algebraically constant"):
            verify_endpoint([original], [corrupted])

    def test_endpoint_recovery_rejects_point_kind_flags_order_and_grid_corruption(self):
        original = contour([((0, 0), 65), ((2, 4), 0), ((6, 4), 0),
                            ((8, 0), 1), ((8, -2), 1)])
        normalized = materialize(original)
        midpoint_index = next(index for index, point in enumerate(normalized)
                              if point.get("kind") == "midpoint")
        corruptions = []
        moved = copy.deepcopy(normalized)
        moved[midpoint_index]["xy"] = (5, 4)
        corruptions.append(moved)
        wrong_kind = copy.deepcopy(normalized)
        wrong_kind[midpoint_index]["flag"] = 0
        corruptions.append(wrong_kind)
        wrong_full_flag = copy.deepcopy(normalized)
        wrong_full_flag[0]["flag"] = 1
        corruptions.append(wrong_full_flag)
        reordered = copy.deepcopy(normalized)
        reordered[-1], reordered[-2] = reordered[-2], reordered[-1]
        corruptions.append(reordered)
        floating = copy.deepcopy(normalized)
        floating[midpoint_index]["xy"] = (4.0, 4)
        corruptions.append(floating)
        unknown = copy.deepcopy(normalized)
        unknown[midpoint_index]["kind"] = "fitted-control"
        corruptions.append(unknown)
        for candidate in corruptions:
            with self.subTest(candidate=candidate), self.assertRaises(ValueError):
                verify_endpoint([original], [candidate])

    def test_half_grid_midpoint_is_rejected_instead_of_rounded(self):
        original = contour([((0, 0), 1), ((1, 4), 0), ((2, 4), 0), ((4, 0), 1)])
        with self.assertRaisesRegex(ValueError, "not integral"):
            materialize(original)

    def test_cyclic_seam_can_move_but_direction_cannot_reverse(self):
        original = contour([((0, 0), 1), ((8, 0), 1), ((8, 8), 1), ((0, 8), 1)])
        rotated = copy.deepcopy(original[2:] + original[:2])
        self.assertEqual(verify_endpoint([original], [rotated])[0]["sourceSeam"], 2)
        with self.assertRaisesRegex(ValueError, "cyclic order changed"):
            verify_endpoint([original], [list(reversed(original))])

    def test_constant_counter_can_appear_without_changing_an_endpoint(self):
        original = contour([((0, 0), 1), ((8, 0), 1), ((8, 8), 1), ((0, 8), 1)])
        counter = [{"xy": (4, 4), "flag": 1, "source": None, "kind": "collapsed-counter"}
                   for _ in range(4)]
        self.assertTrue(verify_endpoint([original], [original, counter])[1]["constantCounter"])
        expanded_counter = copy.deepcopy(counter)
        expanded_counter[1]["xy"] = (5, 4)
        with self.assertRaisesRegex(ValueError, "entirely constant"):
            verify_endpoint([original], [original, expanded_counter])
        outside_counter = copy.deepcopy(counter)
        for point in outside_counter:
            point["xy"] = (10, 4)
        with self.assertRaisesRegex(ValueError, "coordinate bounds"):
            verify_endpoint([original], [original, outside_counter])

    def test_four_k_duplicates_preserve_original_vertices_and_counter(self):
        outer = contour([((0, 0), 1), ((0, 8), 1), ((2, 10), 1), ((6, 10), 1),
                         ((8, 8), 1), ((10, 4), 1), ((8, 0), 1), ((6, -2), 1), ((2, -2), 1)])
        counter = contour([((2, 2), 1), ((4, 2), 1), ((4, 4), 1), ((2, 4), 1)])
        original = [outer, counter]
        before = copy.deepcopy(original)
        normalized = four_contours(original, 700, "normal", "default")
        self.assertEqual(list(map(len, normalized)), [12, 4])
        self.assertEqual(verify_endpoint(original, normalized)[0]["constantSegments"], 3)
        self.assertEqual(normalized[1], counter)
        self.assertEqual(original, before)

    def test_disconnected_semantic_spans_and_fixed_span_padding_fail_closed(self):
        original = contour([((0, 0), 1), ((4, 8), 0), ((8, 0), 1)])
        blocks = point_blocks(original)
        with self.assertRaisesRegex(ValueError, "Disconnected semantic span"):
            parts_in_order(original, ("close", "bowl"), [[blocks[1]], [blocks[0]]], {1})
        parts = parts_in_order(original, ("bowl", "close"), [[blocks[0]], [blocks[1]]], set())
        with self.assertRaisesRegex(ValueError, "fixed semantic span"):
            pad_parts(original, parts, [2, 1])


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

    def test_exact_normalization_permission_does_not_relabel_raw_master_compatibility(self):
        report = {"ready": False, "styles": {
            style: {"incompatibleGlyphs": 24, "weights": [100, 300, 400, 500, 600, 700],
                    "issues": [{"type": "outline"} for _ in range(24)]}
            for style in ("normal", "italic")}}
        with patch("build_variable.audit", return_value=copy.deepcopy(report)):
            allowed = preflight(allow_normalization=True)
        self.assertFalse(allowed["ready"])
        self.assertFalse(allowed["sourceCompatible"])
        self.assertTrue(allowed["normalizationRequired"])
        self.assertEqual(allowed["normalizationGrid"], 2000)
        with patch("build_variable.audit", return_value=report):
            with self.assertRaisesRegex(ValueError, "No output was written"):
                preflight()

    def test_normalization_cannot_waive_unknown_master_or_axis_defects(self):
        report = {"ready": False, "styles": {
            style: {"incompatibleGlyphs": 24, "weights": [100, 300, 400, 500, 600, 700],
                    "issues": [{"type": "outline"} for _ in range(24)]}
            for style in ("normal", "italic")}}
        corruptions = []
        coverage = copy.deepcopy(report)
        coverage["styles"]["normal"]["issues"].append({"type": "cmap"})
        corruptions.append(coverage)
        axis = copy.deepcopy(report)
        axis["styles"]["normal"]["weights"][-1] = 900
        corruptions.append(axis)
        unknown_outline = copy.deepcopy(report)
        unknown_outline["styles"]["italic"]["incompatibleGlyphs"] = 25
        corruptions.append(unknown_outline)
        for broken in corruptions:
            with self.subTest(broken=broken), patch("build_variable.audit", return_value=broken):
                with self.assertRaisesRegex(ValueError, "No output was written"):
                    preflight(allow_normalization=True)

    def test_compatible_sources_do_not_require_normalization_permission(self):
        with patch("build_variable.audit", return_value={"ready": True, "styles": {}}):
            report = preflight()
        self.assertTrue(report["sourceCompatible"])
        self.assertFalse(report["normalizationRequired"])


class VariableDeliveryTests(unittest.TestCase):
    @staticmethod
    def tent_scalar(coordinate, support):
        """Evaluate a region independently with exact rational arithmetic."""
        lower, peak, upper = map(Fraction, support)
        if coordinate == peak:
            return Fraction(1)
        if coordinate <= lower or coordinate >= upper:
            return Fraction(0)
        if coordinate < peak:
            return (coordinate - lower) / (peak - lower)
        return (upper - coordinate) / (upper - peak)

    def test_nodal_tents_recover_every_accepted_integer_endpoint_without_residual_rounding(self):
        supports = nodal_supports()
        knots = {100: Fraction(-1), 300: Fraction(-5461, 16384), 400: Fraction(0),
                 500: Fraction(5461, 16384), 600: Fraction(10923, 16384), 700: Fraction(1)}
        self.assertEqual(set(supports), set(knots) - {400})
        values = {100: 1, 300: 5, 400: 11, 500: 17, 600: 23, 700: 31}
        for weight, knot in knots.items():
            with self.subTest(weight=weight):
                scalars = {master: self.tent_scalar(knot, support) for master, support in supports.items()}
                self.assertEqual(scalars, {master: Fraction(master == weight) for master in supports})
                actual = values[400] + sum((values[master] - values[400]) * scalar
                                           for master, scalar in scalars.items())
                self.assertEqual(actual, values[weight])
                if weight != 400:
                    self.assertEqual(Fraction(supports[weight][1]), knot)

    def test_nodal_interpolation_is_bounded_to_adjacent_masters_including_the_default(self):
        supports = nodal_supports()
        knots = {100: Fraction(-1), 300: Fraction(-5461, 16384), 400: Fraction(0),
                 500: Fraction(5461, 16384), 600: Fraction(10923, 16384), 700: Fraction(1)}
        values = {100: 3, 300: 23, 400: 7, 500: 41, 600: 5, 700: 29}
        weights = list(knots)
        for lower, upper in zip(weights, weights[1:]):
            for progress in (Fraction(1, 4), Fraction(1, 2), Fraction(3, 4)):
                with self.subTest(lower=lower, upper=upper, progress=progress):
                    coordinate = knots[lower] * (1 - progress) + knots[upper] * progress
                    scalars = {master: self.tent_scalar(coordinate, support)
                               for master, support in supports.items()}
                    self.assertTrue({master for master, scalar in scalars.items() if scalar}
                                    <= {lower, upper} - {400})
                    self.assertTrue(all(0 <= scalar <= 1 for scalar in scalars.values()))
                    actual = values[400] + sum((values[master] - values[400]) * scalar
                                               for master, scalar in scalars.items())
                    expected = values[lower] * (1 - progress) + values[upper] * progress
                    self.assertEqual(actual, expected)

    def test_core_retains_latin1_and_common_cyrillic_and_defers_combining_clusters_to_full(self):
        marks = {0x301, 0x1AB0, 0x1DC0, 0x20D0, 0xFE20, 0xFE2E}
        coverage = {0x41, 0xAB, 0xBB, 0xD7, 0xF7, 0xE9, 0x130, 0x401, 0x416, 0x451, 0x1C80, 0x1E00, 0x2014,
                    0x20BD, 0x2713, 0xA641, 0xFFFD} | marks
        before = coverage.copy()
        subsets = subset_coverage(coverage)
        self.assertEqual(set(subsets), {"core"})
        self.assertTrue(subsets["core"] <= coverage)
        self.assertFalse(subsets["core"] & marks)
        self.assertTrue({0x41, 0xAB, 0xBB, 0xD7, 0xF7, 0xE9, 0x2014, 0x20BD, 0xFFFD,
                         0x401, 0x416, 0x451} <= subsets["core"])
        self.assertFalse({0x130, 0x1E00, 0x2713, 0x1C80, 0xA641, 0xFE2E} & subsets["core"])
        self.assertEqual(coverage, before)

    def test_ordinary_english_russian_and_latin1_use_core_without_claiming_combining_marks(self):
        text = 'Gavia UI: «Ёж, йога, съёмка» café Í Ï 0123456789 — ₽ × ÷'
        extra = 'Ĩ Ī Қ Ӝ Ґ Ѣ a\u0301'
        coverage = {ord(char) for char in text + extra}
        subsets = subset_coverage(coverage)
        self.assertTrue({ord(char) for char in text} <= subsets["core"])
        self.assertFalse({ord(char) for char in extra if char not in " a"} & subsets["core"])
        self.assertIn(0x301, coverage)
        self.assertNotIn(0x301, subsets["core"])

    def test_budget_counts_the_one_core_request_and_never_hides_an_oversized_file(self):
        records = [{"style": "normal", "subset": "full", "bytes": 132000},
                   {"style": "normal", "subset": "core", "bytes": 80000},
                   {"style": "italic", "subset": "full", "bytes": 140000},
                   {"style": "italic", "subset": "core", "bytes": 78000}]
        before = copy.deepcopy(records)
        budget = core_size_budget(records)
        self.assertEqual(budget["normalCoreBytes"], 80000)
        self.assertTrue(budget["coreAssetBudgetPassed"])
        self.assertIn("browser transfer", budget["status"])
        self.assertEqual(records, before)
        records[1]["bytes"] = 80001
        with self.assertRaisesRegex(ValueError, "exceeds"):
            core_size_budget(records)
        records[1]["bytes"] = 76000
        records[3]["bytes"] = 80001
        with self.assertRaisesRegex(ValueError, "italic core font exceeds"):
            core_size_budget(records)
        with self.assertRaisesRegex(ValueError, "single measured"):
            core_size_budget([before[1], before[1]])
        with self.assertRaisesRegex(ValueError, "single measured"):
            core_size_budget([])

    def test_unicode_range_never_claims_a_gap_in_retained_coverage(self):
        self.assertEqual(unicode_range({0x41, 0x42, 0x44, 0xE9, 0x1F600}),
                         "U+0041-0042, U+0044, U+00E9, U+1F600")
        self.assertEqual(unicode_range(set()), "")

    def test_draft_css_keeps_static_faces_aliases_paths_and_separate_styles(self):
        static_css = '@font-face { font-family: "Gavia"; src: url("../../fonts/gavia/Gavia-Regular.woff2"); }\n'
        files = [{"file": "Gavia-Variable.woff2", "style": "normal", "subset": "full",
                  "unicodeRange": "U+0041, U+0410"},
                 {"file": "Gavia-Variable-Core.woff2", "style": "normal", "subset": "core",
                  "unicodeRange": "U+0041"},
                 {"file": "Gavia-Variable-Italic.woff2", "style": "italic", "subset": "full",
                  "unicodeRange": "U+0410"}]
        before = copy.deepcopy(files)
        metrics = {"unitsPerEm": 2000, "ascent": 2000, "descent": -500, "lineGap": 0}
        css = draft_css(static_css, files, metrics)
        self.assertTrue(css.startswith('@supports not (font-variation-settings: normal) {'))
        self.assertIn(static_css.rstrip(), css)
        self.assertIn('@supports (font-variation-settings: normal)', css)
        for family in ('font-family: "Gavia Sans";', 'font-family: "Gavia";'):
            self.assertIn(family, css)
        self.assertIn('../../fonts/gavia/Gavia-Variable-Core.woff2', css)
        self.assertIn('../../fonts/gavia/Gavia-Variable-Italic.woff2', css)
        self.assertIn('url("../../fonts/gavia/Gavia-Variable.woff2")', css)
        self.assertLess(css.index('url("../../fonts/gavia/Gavia-Variable.woff2")'),
                        css.index('url("../../fonts/gavia/Gavia-Variable-Core.woff2")'))
        self.assertIn("font-style: normal;", css)
        self.assertIn("font-style: italic;", css)
        self.assertIn("font-weight: 100 700;", css)
        self.assertIn("unicode-range: U+0041;", css)
        self.assertIn("unicode-range: U+0410;", css)
        self.assertIn("ascent-override: 100%;", css)
        self.assertIn("descent-override: 25%;", css)
        self.assertIn("line-gap-override: 0%;", css)
        self.assertIn("size-adjust: 100%;", css)
        self.assertEqual(files, before)
        self.assertEqual(draft_css(css, files, metrics), css)


if __name__ == "__main__":
    unittest.main()
