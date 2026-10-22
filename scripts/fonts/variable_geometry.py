"""Exact, in-memory numeral correspondence for the accepted Gavia masters.

The source masters stay immutable. The caller scales the *whole* font to 2000
UPM before entering this module. Original points and full decoded flags are
retained; implied quadratic midpoints and line degree-elevation controls are
then integral, without rounding. Padding is confined to named authored spans,
and consists of constant segments at their existing on-curve landmarks.

This is a draft interpolation model, not optical approval. In particular, four
uses the explicitly documented K/seam-A correspondence at the 600/700 topology
change. Every endpoint is checked algebraically before it can reach a compiler.
No drawing module, converter, ignored evidence file or output path is needed.
"""
from __future__ import annotations

from array import array
from copy import deepcopy
from fractions import Fraction


WEIGHTS = (100, 300, 400, 500, 600, 700)
DIGITS = "02345689"
VARIANTS = ("default", "tabular", "proportional")

# Explicit correspondence at the accepted 600 endpoint, in the derived 2000
# UPM grid. Each counter is wholly constant here, so it contributes no outline
# or ink. These are the six bounded K/seam-A candidates, not fitted outlines.
# At 100..500 the existing upright-top-left vertex supplies the collapse point.
FOUR_COUNTER_AT_600 = {
    ("normal", "default"): (1014, 550),
    ("normal", "tabular"): (1014, 550),
    ("normal", "proportional"): (936, 550),
    ("italic", "default"): (1081, 550),
    ("italic", "tabular"): (1081, 550),
    ("italic", "proportional"): (1004, 550),
}


def require(condition, message):
    if not condition:
        raise ValueError("Gavia variable geometry: " + message)


def font_contours(font, name):
    """Read simple glyphs, retaining every full source flag and local ordinal."""
    glyph = font["glyf"][name]
    require(not glyph.isComposite(), f"{name} must remain a simple glyph")
    coordinates, ends, flags = glyph.getCoordinates(font["glyf"])
    contours, start = [], 0
    for end in ends:
        contour = []
        for index in range(start, end + 1):
            xy = tuple(coordinates[index])
            require(all(isinstance(value, int) for value in xy), "Non-integral source grid")
            contour.append({"xy": xy, "flag": int(flags[index]), "source": index - start})
        require(contour and contour[0]["flag"] & 1, "Source seam must be explicit")
        contours.append(contour)
        start = end + 1
    require(start == len(coordinates), "Invalid source contour endpoints")
    return contours


def point_blocks(contour):
    """Original explicit anchor to next explicit anchor, including the close."""
    require(contour and contour[0]["flag"] & 1, "An explicit cyclic seam is required")
    # FontTools has already expanded repeat/coordinate-compression bits. A
    # cubic TrueType stream cannot be interpreted as quadratic, and unexpected
    # raw encoding bits must not be mistaken for authored point semantics.
    require(all(isinstance(point["flag"], int) and 0 <= point["flag"] <= 0xFF
                and not point["flag"] & ~0x41 for point in contour),
            "Only decoded quadratic on-curve/overlap flags are supported")
    anchors = [index for index, point in enumerate(contour) if point["flag"] & 1]
    blocks = []
    for offset, start in enumerate(anchors):
        end = anchors[(offset + 1) % len(anchors)]
        indices = (list(range(start, end + 1)) if end > start
                   else list(range(start, len(contour))) + [0])
        require(all(not contour[index]["flag"] & 1 for index in indices[1:-1]),
                "Unexpected explicit point inside a source block")
        blocks.append({"indices": indices, "offCount": len(indices) - 2})
    return blocks


def parts_in_order(contour, labels, groups, flexible):
    """Name spans in one directed traversal, including legitimately empty spans."""
    require(len(labels) == len(groups), "Span labels and groups differ")
    parts, anchor = [], 0
    for index, (label, blocks) in enumerate(zip(labels, groups)):
        if blocks:
            require(blocks[0]["indices"][0] == anchor, "Disconnected semantic span")
        parts.append({"label": label, "blocks": blocks, "anchor": anchor,
                      "flexible": index in flexible})
        if blocks:
            anchor = blocks[-1]["indices"][-1]
    require(anchor == 0, "Semantic traversal does not close")
    return parts


def zero_parts(contour, role):
    blocks = point_blocks(contour)
    lines = [i for i, block in enumerate(blocks) if block["offCount"] == 0]
    chains = [i for i, block in enumerate(blocks) if block["offCount"] > 1]
    require(len(lines) == 2 and len(chains) == 1, "Zero stem/crown topology changed")
    first, second = lines
    center = chains[0]
    require(0 < first < center < second < len(blocks) - 1
            and blocks[center]["offCount"] == 2, "Zero traversal landmarks changed")
    groups = [blocks[:first], [blocks[first]], blocks[first+1:center], [blocks[center]],
              blocks[center+1:second], [blocks[second]], blocks[second+1:]]
    require(all(groups), "Zero has an empty authored span")
    for i in (0, 2, 4, 6):
        require(all(block["offCount"] == 1 for block in groups[i]), "Zero curve chain changed")
    directions = []
    for i in (1, 5):
        block = groups[i][0]
        a, b = (contour[j]["xy"] for j in (block["indices"][0], block["indices"][-1]))
        require(a[1] != b[1], "Zero has a collapsed stem")
        directions.append(a[1] > b[1])
    require(directions == [True, False], "Zero contour direction changed")
    labels = [role + ":" + label for label in
              ("upper-first", "stem-first", "lower-approach", "bottom-crown",
               "lower-departure", "stem-second", "upper-last")]
    return parts_in_order(contour, labels, groups, {0, 2, 4, 6})


def two_parts(contour):
    blocks = point_blocks(contour)
    lines = [i for i, block in enumerate(blocks) if block["offCount"] == 0]
    require(len(lines) == 6 and lines[0] == 0, "Two native line landmarks changed")
    a, b, c, d, e, f = lines
    require(d == c + 1 and e == d + 1 and f == e + 3
            and blocks[e+1]["offCount"] == 4 and blocks[e+2]["offCount"] == 1,
            "Two foot, lower-left chain or return changed")
    groups = [[blocks[a]], blocks[a+1:b], [blocks[b]], blocks[b+1:c], [blocks[c]],
              [blocks[d]], [blocks[e]], [blocks[e+1]], [blocks[e+2]], [blocks[f]], blocks[f+1:]]
    flexible = {1, 3, 8, 10}
    for i in flexible:
        require(all(block["offCount"] == 1 for block in groups[i]), "Two adaptive span changed")
    require(groups[1] and groups[8] and groups[10], "Two bowl/return is absent")
    return parts_in_order(contour, (
        "upper-terminal-line", "outer-bowl", "descending-diagonal-line", "diagonal-foot-join",
        "foot-top-line", "foot-right-line", "foot-bottom-line", "lower-left-chain",
        "lower-left-return", "ascending-diagonal-line", "inner-bowl"), groups, flexible)


def three_parts(contour):
    blocks = point_blocks(contour)
    require(len(blocks) == 19 and sum(block["offCount"] == 0 for block in blocks) == 13
            and sum(block["offCount"] in (3, 4) for block in blocks) == 6,
            "Three six authored cubic-derived spans/thirteen lines changed")
    labels, flexible, curve, line = [], set(), 0, 0
    for index, block in enumerate(blocks):
        if block["offCount"]:
            curve += 1
            labels.append(f"authored-cubic-span-{curve:02}")
            flexible.add(index)
        else:
            line += 1
            labels.append(f"native-line-{line:02}")
    return parts_in_order(contour, labels, [[block] for block in blocks], flexible)


def five_parts(contour):
    blocks = point_blocks(contour)
    lines = [i for i, block in enumerate(blocks) if block["offCount"] == 0]
    chains = [i for i, block in enumerate(blocks) if block["offCount"] > 1]
    require(len(lines) == 6 and lines[:3] == [0, 1, 2], "Five native line landmarks changed")
    require(len(chains) == 2 and all(blocks[i]["offCount"] == 4 for i in chains),
            "Five four-control chains changed")
    a, b, c, d, e, f = lines
    first, second = chains
    require(c+1 < d < first and first+1 == e and e+1 == second
            and second+1 == f == len(blocks)-1, "Five bowl/chain/line order changed")
    groups = [[blocks[a]], [blocks[b]], [blocks[c]], blocks[c+1:d], [blocks[d]],
              blocks[d+1:first], [blocks[first]], [blocks[e]], [blocks[second]], [blocks[f]]]
    for i in (3, 5):
        require(groups[i] and all(block["offCount"] == 1 for block in groups[i]), "Five bowl span changed")
    return parts_in_order(contour, (
        "upper-right-terminal", "upper-bar-inner", "inner-upright", "outer-bowl", "lower-terminal",
        "inner-bowl", "shoulder-chain", "outer-upright", "upper-left-chain", "upper-bar-outer"),
        groups, {3, 5})


def materialize(contour, elevate_lines=False):
    """Expose exact implied points; optionally elevate L to Q without curvature."""
    result = []
    line_ends = {block["indices"][0]: block["indices"][-1]
                 for block in point_blocks(contour) if block["offCount"] == 0}
    for index, point in enumerate(contour):
        following = contour[(index + 1) % len(contour)]
        result.append(deepcopy(point))
        if not point["flag"] & 1 and not following["flag"] & 1:
            pair = (index, (index + 1) % len(contour))
            total = tuple(a + b for a, b in zip(point["xy"], following["xy"]))
            require(all(value % 2 == 0 for value in total), "Implied midpoint is not integral at 2000 UPM")
            result.append({"xy": tuple(value // 2 for value in total), "flag": 1,
                           "source": None, "kind": "midpoint", "sourcePair": pair})
        elif elevate_lines and index in line_ends:
            end = line_ends[index]
            total = tuple(a + b for a, b in zip(point["xy"], contour[end]["xy"]))
            require(all(value % 2 == 0 for value in total), "Line midpoint is not integral at 2000 UPM")
            result.append({"xy": tuple(value // 2 for value in total), "flag": 0,
                           "source": None, "kind": "line-control", "sourcePair": (index, end)})
    require(all(block["offCount"] in (0, 1) for block in point_blocks(result)),
            "An implied midpoint was not exposed")
    return result


def expanded_parts(original, expanded, parts):
    """Map named source spans to exact explicit segments, retaining their seams."""
    positions = {point["source"]: i for i, point in enumerate(expanded) if point["source"] is not None}
    blocks = point_blocks(expanded)
    by_start = {block["indices"][0]: index for index, block in enumerate(blocks)}
    result = []
    for part in parts:
        start = positions[part["anchor"]]
        selected = []
        if part["blocks"]:
            end = positions[part["blocks"][-1]["indices"][-1]]
            cursor = by_start[start]
            while True:
                selected.append(blocks[cursor])
                if blocks[cursor]["indices"][-1] == end:
                    break
                cursor = (cursor + 1) % len(blocks)
                require(cursor != by_start[start], "Expanded semantic span does not terminate")
        result.append({**part, "anchor": start, "blocks": selected})
    return result


def unique_extreme(points, indices, coordinate, highest):
    values = {index: coordinate(points[index]["xy"]) for index in indices}
    extremum = (max if highest else min)(values.values())
    found = [index for index, value in values.items() if value == extremum]
    require(len(found) == 1, "Cardinal semantic landmark is ambiguous")
    return found[0]


def six_nine_parts(points, role, digit):
    blocks = point_blocks(points)
    if role == "outer":
        lines = [i for i, block in enumerate(blocks) if block["offCount"] == 0]
        require(len(lines) == 3 and lines == list(range(lines[0], lines[0] + 3)),
                "Six/nine terminal's three native lines changed")
        a, b, c = lines
        groups = [blocks[:a], [blocks[a]], [blocks[b]], [blocks[c]], blocks[c+1:]]
        require(groups[0] and groups[-1] and all(block["offCount"] == 1
                for group in (groups[0], groups[-1]) for block in group), "Six/nine curve order changed")
        return parts_in_order(points, ("outer:start-to-terminal", "outer:terminal-first",
            "outer:flat-cap", "outer:terminal-return", "outer:return-to-start"), groups, {0, 4})
    require(all(block["offCount"] == 1 for block in blocks), "Six/nine counter gained a line")
    anchors = [block["indices"][0] for block in blocks]
    opposite = unique_extreme(points, anchors, lambda xy: xy[1], digit == "6")
    start, end = points[0]["xy"], points[opposite]["xy"]
    dx, dy = end[0] - start[0], end[1] - start[1]
    require(dy != 0, "Six/nine counter axis collapsed")
    determinant = lambda xy: dy * (xy[0] - start[0]) - dx * (xy[1] - start[1])
    first = unique_extreme(points, anchors, determinant, False)
    last = unique_extreme(points, anchors, determinant, True)
    boundaries = [0, first, opposite, last]
    require(boundaries == sorted(set(boundaries)), "Six/nine cardinal traversal changed")
    starts = {block["indices"][0]: i for i, block in enumerate(blocks)}
    ends = [starts[index] for index in boundaries] + [len(blocks)]
    groups = [blocks[a:b] for a, b in zip(ends, ends[1:])]
    require(all(groups), "Six/nine has an empty counter quadrant")
    return parts_in_order(points, ("counter:start-to-first-transverse", "counter:first-to-opposite",
        "counter:opposite-to-last-transverse", "counter:last-to-start"), groups, {0, 1, 2, 3})


def eight_parts(contour, role):
    """Crown chains and exact affine half-planes define the authored side spans."""
    blocks = point_blocks(contour)
    chains = [i for i, block in enumerate(blocks) if block["offCount"] > 1]
    require(all(block["offCount"] in (0, 1, 2) for block in blocks)
            and len(chains) == (2 if role == "outer" else 1), "Eight crown chain topology changed")
    low = min(point["xy"][1] for point in contour)
    high = max(point["xy"][1] for point in contour)
    crowns = {}
    for i in chains:
        controls = [contour[j] for j in blocks[i]["indices"][1:-1]]
        require(len(controls) == 2 and controls[0]["xy"][1] == controls[1]["xy"][1]
                and controls[0]["xy"][1] in (low, high), "Eight crown is not extremal and horizontal")
        label = "bottom" if controls[0]["xy"][1] == low else "top"
        require(label not in crowns, "Eight crown role is ambiguous")
        crowns[label] = (i, tuple(Fraction(a+b, 2) for a, b in zip(controls[0]["xy"], controls[1]["xy"])))
    if role == "outer":
        require(set(crowns) == {"bottom", "top"}, "Eight outer crown roles changed")
        first = crowns["bottom"][0]
        rotated = blocks[first:] + blocks[:first]
        top = (crowns["top"][0] - first) % len(blocks)
        groups = [rotated[:1], rotated[1:top], rotated[top:top+1], rotated[top+1:]]
        labels = ("bottom-crown", "left-side", "top-crown", "right-side")
        axis_a, axis_b = crowns["bottom"][1], crowns["top"][1]
        rotation = blocks[first]["indices"][0]
    else:
        label = "bottom" if role == "lower-counter" else "top"
        require(set(crowns) == {label}, "Eight counter crown role changed")
        at, center = crowns[label]
        groups = [blocks[:at], blocks[at:at+1], blocks[at+1:]]
        labels = (("left-side", "bottom-crown", "right-side") if role == "lower-counter"
                  else ("right-side", "top-crown", "left-side"))
        axis_a, axis_b, rotation = contour[0]["xy"], center, 0
    require(axis_a[1] != axis_b[1], "Eight affine axis collapsed")
    result = []
    for label, group in zip(labels, groups):
        require(group, "Eight side span is empty")
        if label.endswith("side"):
            sign = -1 if label == "left-side" else 1
            values = []
            for index in {j for block in group for j in block["indices"]}:
                x, y = contour[index]["xy"]
                center = axis_a[0] + Fraction(y-axis_a[1], axis_b[1]-axis_a[1]) * (axis_b[0]-axis_a[0])
                values.append(sign * (x-center))
            require(all(value >= 0 for value in values) and any(value > 0 for value in values),
                    "Eight named side crosses its affine centerline")
        result.append({"label": role + ":" + label, "blocks": group,
                       "anchor": group[0]["indices"][0], "flexible": True})
    return result, rotation


def pad_parts(points, parts, targets):
    start = parts[0]["anchor"]
    normalized = [deepcopy(points[start])]
    spans = []
    for part, target in zip(parts, targets):
        blocks = part["blocks"]
        padding = target - len(blocks)
        require(padding >= 0 and (not padding or part["flexible"]), "A fixed semantic span would change")
        anchor = normalized[-1]
        require(anchor["flag"] & 1 and anchor["xy"] == points[part["anchor"]]["xy"],
                "Constant segment lacks its exact semantic on-curve anchor")
        require(not padding or all(block["offCount"] == 1 for block in blocks),
                "Only quadratic spans accept constant quadratics")
        span_start = len(normalized)-1
        for _ in range(padding):
            normalized.append({"xy": anchor["xy"], "flag": 0, "source": None,
                               "kind": "constant-control", "span": part["label"]})
            normalized.append({"xy": anchor["xy"], "flag": 1, "source": None,
                               "kind": "constant-end", "span": part["label"]})
        for block in blocks:
            for index in block["indices"][1:]:
                if index != start:
                    normalized.append(deepcopy(points[index]))
        spans.append({"label": part["label"], "start": span_start, "end": len(normalized)-1,
                      "sourceSegments": len(blocks), "targetSegments": target,
                      "constantQuadratics": padding})
    return normalized, spans


def exact_segments(contour):
    """Canonical directed L/Q polynomial streams, retaining vertex provenance."""
    require(all(isinstance(point["flag"], int) and 0 <= point["flag"] <= 0xFF
                and not point["flag"] & ~0x41 for point in contour),
            "Only decoded quadratic on-curve/overlap flags are supported")
    expanded = []
    for index, point in enumerate(contour):
        expanded.append({**point, "xy": tuple(Fraction(value) for value in point["xy"])})
        following = contour[(index+1) % len(contour)]
        if not point["flag"] & 1 and not following["flag"] & 1:
            expanded.append({"xy": tuple(Fraction(a+b, 2) for a, b in zip(point["xy"], following["xy"])),
                             "flag": 1, "source": None, "kind": "implicit"})
    require(expanded and expanded[0]["flag"] & 1, "Polynomial stream has no explicit seam")
    expanded.append(expanded[0])
    segments, offset, previous = [], 1, expanded[0]
    while offset < len(expanded):
        point = expanded[offset]
        if point["flag"] & 1:
            vertices, offset = [previous, point], offset + 1
        else:
            require(offset+1 < len(expanded) and expanded[offset+1]["flag"] & 1,
                    "Polynomial quadratic endpoint is absent")
            vertices, offset = [previous, point, expanded[offset+1]], offset + 2
        xy = [vertex["xy"] for vertex in vertices]
        coefficients = []
        for axis in (0, 1):
            values = ([xy[0][axis], xy[1][axis]-xy[0][axis]] if len(xy) == 2 else
                      [xy[0][axis], 2*(xy[1][axis]-xy[0][axis]),
                       xy[0][axis]-2*xy[1][axis]+xy[2][axis]])
            while len(values) > 1 and values[-1] == 0:
                values.pop()
            coefficients.append(tuple(values))
        segments.append((tuple(coefficients), vertices))
        previous = vertices[-1]
    return segments


def verify_endpoint(original, normalized):
    """Fail closed unless only declared exact representation changes occurred."""
    require(len(normalized) in (len(original), len(original)+1), "Unexpected added contour")
    details = []
    for contour_index, candidate in enumerate(normalized):
        require(candidate and all(isinstance(value, int) for p in candidate for value in p["xy"]),
                "Normalized coordinates are not integral")
        if contour_index == len(original):
            require(len(candidate) == 4 and all(point.get("kind") == "collapsed-counter"
                    and point["source"] is None and point["flag"] == 1
                    and point["xy"] == candidate[0]["xy"] for point in candidate),
                    "Added counter must be entirely constant")
            xs = [point["xy"][0] for contour in original for point in contour]
            ys = [point["xy"][1] for contour in original for point in contour]
            x, y = candidate[0]["xy"]
            require(min(xs) <= x <= max(xs) and min(ys) <= y <= max(ys),
                    "Collapsed counter changes the source coordinate bounds")
            details.append({"constantCounter": True, "points": 4})
            continue
        source = original[contour_index]
        for point in candidate:
            if point["source"] is not None:
                continue
            kind = point.get("kind")
            require(kind in ("midpoint", "line-control", "constant-control", "constant-end", "duplicate-line"),
                    "An added point lacks a declared exact construction")
            if kind in ("midpoint", "line-control"):
                pair = point.get("sourcePair")
                require(pair and len(pair) == 2 and all(0 <= index < len(source) for index in pair),
                        "Added midpoint has invalid source ordinals")
                a, b = (source[index] for index in pair)
                require(tuple(2 * value for value in point["xy"])
                        == tuple(x+y for x, y in zip(a["xy"], b["xy"])),
                        "Added midpoint or elevated-line control is not exact")
                if kind == "midpoint":
                    require(pair[1] == (pair[0]+1) % len(source)
                            and not a["flag"] & 1 and not b["flag"] & 1 and point["flag"] == 1,
                            "Materialized midpoint does not replace an original implied endpoint")
                else:
                    require(a["flag"] & 1 and b["flag"] & 1 and point["flag"] == 0
                            and any(block["indices"] == list(pair) for block in point_blocks(source)),
                            "Elevated-line control does not belong to a source line")
        recovered = [{key: point[key] for key in ("xy", "flag", "source")}
                     for point in candidate if point["source"] is not None]
        require(len(recovered) == len(source), "Original points were lost or duplicated")
        seam = recovered[0]["source"]
        require(recovered == source[seam:]+source[:seam], "Original points/full flags/cyclic order changed")
        before = [polynomial for polynomial, _ in exact_segments(source[seam:]+source[:seam])]
        after, constants = [], 0
        for polynomial, vertices in exact_segments(candidate):
            added = ((len(vertices) == 3 and vertices[1].get("kind") == "constant-control")
                     or (len(vertices) == 2 and vertices[-1].get("kind") == "duplicate-line"))
            if added:
                require(all(len(axis) == 1 for axis in polynomial), "Added segment is not algebraically constant")
                constants += 1
            else:
                after.append(polynomial)
        require(before == after, "Directed exact quadratic/line polynomial stream changed")
        details.append({"sourcePoints": len(source), "derivedPoints": len(candidate),
                        "sourceSeam": seam, "constantSegments": constants,
                        "fullFlagsAndDirectedPolynomialStreamRecovered": True})
    return details


def four_contours(original, weight, style, variant):
    """Finite K/seam-A model: endpoint preservation is distinct from optical UAT."""
    require(all(point["flag"] == 1 for contour in original for point in contour),
            "Four must remain an all-line authored outline")
    if weight == 700:
        require(list(map(len, original)) == [9, 4], "Four Bold topology must remain 9+4")
        outer = []
        for index, point in enumerate(original[0]):
            outer.append(deepcopy(point))
            if index == 7:  # Authored right upright top K; original cyclic seam A.
                for _ in range(3):
                    outer.append({"xy": point["xy"], "flag": 1, "source": None,
                                  "kind": "duplicate-line", "landmark": "K"})
        return [outer, deepcopy(original[1])]
    require(len(original) == 1 and len(original[0]) == 12, "Four lower-weight topology changed")
    if weight == 600:
        # The saved bounded candidate is the exact midpoint of the authored
        # right upright edge K-L, not an independently fitted coordinate.
        total = tuple(a+b for a, b in zip(original[0][10]["xy"], original[0][11]["xy"]))
        require(all(value % 2 == 0 for value in total), "Four counter edge midpoint needs a finer grid")
        collapse = tuple(value // 2 for value in total)
        require(collapse == FOUR_COUNTER_AT_600[(style, variant)], "Four K-L correspondence recipe changed")
        provenance = {"construction": "upright-right-edge-midpoint", "sourcePair": (10, 11)}
    else:
        collapse = original[0][9]["xy"]
        provenance = {"construction": "original-upright-top-left", "sourceAnchor": 9}
    counter = [{"xy": collapse, "flag": 1, "source": None, "kind": "collapsed-counter"}
               for _ in range(4)]
    for point in counter:
        point.update(provenance)
    return [deepcopy(original[0]), counter]


def write_contours(font, name, contours):
    from fontTools.ttLib.tables._g_l_y_f import GlyphCoordinates

    glyph = font["glyf"][name]
    require(not glyph.isComposite(), "Simple numeral became composite")
    points = [point for contour in contours for point in contour]
    # OVERLAP_SIMPLE is glyph-level metadata stored on its first point. A
    # cyclic seam change must not silently move it into an ignored position.
    require(not any(point["flag"] & 0x40 for point in points[1:]),
            "The normalized seam would move an OVERLAP_SIMPLE flag off the first point")
    require(all(-32768 <= value <= 32767 for point in points for value in point["xy"]),
            "Derived glyph exceeds signed TrueType coordinate range")
    glyph.coordinates = GlyphCoordinates([point["xy"] for point in points])
    glyph.flags = array("B", [point["flag"] for point in points])
    glyph.endPtsOfContours = []
    end = -1
    for contour in contours:
        end += len(contour)
        glyph.endPtsOfContours.append(end)
    glyph.numberOfContours = len(contours)
    # Source point-program instructions would address a different array. Gavia's
    # accepted masters are unhinted; silently retaining a nonempty program is unsafe.
    require(not hasattr(glyph, "program") or not glyph.program.getBytecode(),
            "A source numeral has point-dependent hint instructions")
    glyph.recalcBounds(font["glyf"])


def normalize_variable_masters(masters, style):
    """Normalize six already scaled in-memory masters; return serializable provenance.

    No caller-owned file is read or written. The accepted source audit belongs
    to build_variable.py and must precede this function. The resulting masters
    are draft inputs for varLib, with all-weight and optical acceptance pending.
    """
    require(style in ("normal", "italic"), "Unknown Gavia style")
    require(len(masters) == 6, "All six accepted weight masters are required")
    masters = sorted(masters, key=lambda font: font["OS/2"].usWeightClass)
    require(tuple(font["OS/2"].usWeightClass for font in masters) == WEIGHTS, "Accepted weight axis changed")
    require(all(font["head"].unitsPerEm == 2000 for font in masters), "Scale the whole font to 2000 UPM first")
    report = {"style": style, "unitsPerEm": 2000, "glyphs": [],
              "status": "draft correspondence; interpolation and optical acceptance pending",
              "fourCorrespondence": "Original seam A; Bold K duplicated three times; H/I/J converge to K, G to M"}
    for digit in DIGITS:
        for variant in VARIANTS:
            rows = []
            for font in masters:
                default = font.getBestCmap().get(ord(digit))
                require(default is not None, "Accepted numeral coverage changed")
                name = default + ({"default": "", "tabular": ".tf", "proportional": ".gavia.pnum"}[variant])
                require(name in font["glyf"], "Accepted numeric alternate is absent: " + name)
                original = font_contours(font, name)
                expected_count = 2 if digit in "069" else 3 if digit == "8" else 1
                require(digit == "4" or len(original) == expected_count, "Accepted numeral contour count changed")
                prepared = []
                if digit != "4":
                    for ci, contour in enumerate(original):
                        expanded = materialize(contour, elevate_lines=digit == "8")
                        if digit in "69":
                            parts = six_nine_parts(expanded, "outer" if ci == 0 else "counter", digit)
                        else:
                            if digit == "0":
                                parts = zero_parts(contour, "outer" if ci == 0 else "counter")
                            elif digit == "2":
                                parts = two_parts(contour)
                            elif digit == "3":
                                parts = three_parts(contour)
                            elif digit == "5":
                                parts = five_parts(contour)
                            else:
                                parts, _ = eight_parts(contour, ("outer", "lower-counter", "upper-counter")[ci])
                            parts = expanded_parts(contour, expanded, parts)
                        prepared.append((expanded, parts))
                rows.append((font, name, original, prepared))
            targets = []
            if digit != "4":
                for ci in range(len(rows[0][2])):
                    profiles = [row[3][ci][1] for row in rows]
                    labels = [[part["label"] for part in profile] for profile in profiles]
                    require(all(label == labels[0] for label in labels), "Semantic correspondence differs by weight")
                    targets.append([max(len(profile[index]["blocks"]) for profile in profiles)
                                    for index in range(len(profiles[0]))])
            topologies = []
            for font, name, original, prepared in rows:
                weight = font["OS/2"].usWeightClass
                if digit == "4":
                    normalized = four_contours(original, weight, style, variant)
                    spans = [{"label": "outer:A-F/M-K/L with K duplicates; constant-to-authored counter"}]
                else:
                    converted = [pad_parts(points, parts, target)
                                 for (points, parts), target in zip(prepared, targets)]
                    normalized = [contour for contour, _ in converted]
                    spans = [span for _, span in converted]
                endpoint = verify_endpoint(original, normalized)
                topologies.append([[point["flag"] for point in contour] for contour in normalized])
                metrics = font["hmtx"][name]
                write_contours(font, name, normalized)
                require(font["hmtx"][name] == metrics, "Normalization changed accepted advance or bearing")
                report["glyphs"].append({"digit": digit, "variant": variant, "weight": weight,
                    "glyph": name, "contourPoints": list(map(len, normalized)), "spans": spans,
                    "endpointRecovery": endpoint,
                    "sourceOrdinals": [[point["source"] for point in contour] for contour in normalized],
                    "additions": [[{"point": i, **{key: value for key, value in point.items()
                                      if key not in ("flag", "source")}}
                                   for i, point in enumerate(contour) if point["source"] is None]
                                  for contour in normalized]})
            require(all(topology == topologies[0] for topology in topologies),
                    f"On-curve flags/contour endpoints remain incompatible for {digit}/{variant}")
    return report
