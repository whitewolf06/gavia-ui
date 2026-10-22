"""Build draft variable Gavia fonts without replacing accepted font assets.

The accepted TTFs are immutable inputs. Exact correspondence is derived in
memory on a doubled grid; every accepted weight is recovered again after WOFF2
serialization. Building fonts is a separately authorized operation. The output
is a new scratch payload, never an automatic promotion into the package/site.
"""
from __future__ import annotations

from copy import deepcopy
import argparse
import ast
from fractions import Fraction
import hashlib
from io import BytesIO
import json
from math import floor
from pathlib import Path
import sys
import tempfile

from audit_variable import AXIS, ROOT, audit


FONTTOOLS_VERSION = "4.66.1"
DERIVED_UPM = 2000
WEIGHTS = (100, 300, 400, 500, 600, 700)
CORE_FONT_BUDGET = 80000
WEIGHT_NAMES = {100: "Thin", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}
ACCEPTANCE_PENDING = ["authored intermediate correspondence", "all-weight optical review",
                      "native rasterization and small sizes", "Windows Gavia/Gavia Dark screenshots",
                      "browser loading and fallback", "subset shaping", "main-page browser font transfer"]


def preflight(root=ROOT, *, allow_normalization=False):
    """Keep the raw compatibility audit distinct from a buildable derived model."""
    report = audit(root)
    if not report["ready"]:
        known = all(group["incompatibleGlyphs"] == 24
                    and tuple(group["weights"]) == WEIGHTS
                    and all(issue["type"] == "outline" for issue in group["issues"])
                    for group in report["styles"].values())
        if not allow_normalization or not known:
            details = "; ".join(f"{style}: {value['incompatibleGlyphs']} incompatible glyphs"
                                for style, value in report["styles"].items())
            raise ValueError("Variable font masters are incompatible (" + details
                             + "). Only the documented exact normalization may derive draft masters."
                             + " No output was written.")
    report["sourceCompatible"] = report["ready"]
    report["normalizationRequired"] = not report["ready"]
    report["normalizationGrid"] = DERIVED_UPM
    return report


def destination(root, output):
    target = output.resolve()
    for name in ("packages/ui-kit/fonts", "packages/ui-kit/styles/fonts", "apps/playground/public", "scripts/fonts/sources"):
        protected = (root / name).resolve()
        if target == protected or protected in target.parents or target in protected.parents:
            raise ValueError("Draft output must not replace package, specimen or source font assets")
    if target.exists():
        raise ValueError("Draft output directory already exists; choose a new directory")
    return target


def unicode_range(characters):
    """Emit only retained cmap entries, including non-contiguous coverage."""
    ranges = []
    for value in sorted(set(characters)):
        if ranges and ranges[-1][1] + 1 == value:
            ranges[-1][1] = value
        else:
            ranges.append([value, value])
    return ", ".join(f"U+{first:04X}" + (f"-{last:04X}" if first != last else "")
                     for first, last in ranges)


def subset_coverage(characters):
    """Keep Latin-1/common Cyrillic light; full coverage handles complex clusters.

    The full face is registered first, then the core face. Core intentionally
    excludes combining marks: a marked cluster must use the complete face,
    retaining its original canonical composition and authored positioning.
    Core includes precomposed Latin-1 letters so ordinary accented Latin words
    stay in a single face, with their original kerning. No glyph is removed
    from the full international face or the package's accepted static fonts.
    """
    coverage = set(characters)
    marks = {char for char in coverage if 0x300 <= char <= 0x36F or 0x1AB0 <= char <= 0x1AFF
             or 0x1DC0 <= char <= 0x1DFF or 0x20D0 <= char <= 0x20FF or 0xFE20 <= char <= 0xFE2F}
    core = {char for char in coverage if char <= 0xFF
            or 0x400 <= char <= 0x45F or 0x2000 <= char <= 0x206F
            or 0x20A0 <= char <= 0x20CF or 0x2100 <= char <= 0x214F
            or char in (0xFEFF, 0xFFFD)} - marks
    return {"core": core}


def nodal_supports():
    """Exact, F2Dot14-quantized support coordinates for the accepted weight knots."""
    knots = {}
    for weight in WEIGHTS:
        span = AXIS["default"] - AXIS["minimum"] if weight < AXIS["default"] else AXIS["maximum"] - AXIS["default"]
        normalized = Fraction(weight - AXIS["default"], span)
        knots[weight] = floor(normalized * 16384 + Fraction(1, 2)) / 16384
    return {weight: (knots[WEIGHTS[max(index - 1, 0)]], knots[weight],
                     knots[WEIGHTS[min(index + 1, len(WEIGHTS) - 1)]])
            for index, weight in enumerate(WEIGHTS) if weight != AXIS["default"]}


def _metrics(font):
    hhea, os2 = font["hhea"], font["OS/2"]
    return {"unitsPerEm": font["head"].unitsPerEm, "ascent": hhea.ascent,
            "descent": hhea.descent, "lineGap": hhea.lineGap,
            "winAscent": os2.usWinAscent, "winDescent": os2.usWinDescent}


def _glyph_snapshot(font, name):
    coordinates, ends, flags = font["glyf"][name].getCoordinates(font["glyf"])
    # Compression bits are encoding details. Keep point kinds, overlap/cubic
    # semantics and directed contour boundaries after serialization.
    return tuple(coordinates), tuple(ends), tuple(int(flag) & 0xC1 for flag in flags)


def _scale_master(font):
    from fontTools.ttLib.scaleUpem import scale_upem

    original = deepcopy(font)
    if original["head"].unitsPerEm != 1000:
        raise ValueError("The accepted Gavia source grid must remain 1000 UPM")
    unsupported = {"morx", "mort", "kerx", "ankr", "Silf", "Glat", "Gloc", "cvt ", "fpgm", "prep", "hdmx", "VDMX", "LTSH"}
    if unsupported.intersection(font.keys()):
        raise ValueError("An unsupported positional or hinting table was added to an accepted master")
    for name in font.getGlyphOrder():
        glyph = font["glyf"][name]
        if hasattr(glyph, "program") and glyph.program.getBytecode():
            raise ValueError("Accepted Gavia masters must remain unhinted")
        if glyph.isComposite() and any(not hasattr(component, "x") for component in glyph.components):
            raise ValueError("Point-attached composite requires a separate scaling review")
    # Scale all UPM-dependent values: glyphs/components, metrics, head/hhea/OS/2/
    # post, GPOS anchors/values and GDEF carets. Dimensionless transforms, italic
    # angle and caretSlopeRise/Run remain unchanged.
    scale_upem(font, DERIVED_UPM)
    for name in original.getGlyphOrder():
        old, ends, flags = _glyph_snapshot(original, name)
        new, actual_ends, actual_flags = _glyph_snapshot(font, name)
        if tuple((x * 2, y * 2) for x, y in old) != new or ends != actual_ends or flags != actual_flags:
            raise ValueError("Whole-font scaling changed physical geometry: " + name)
    for tag in ("hmtx", "vmtx"):
        if tag in original and font[tag].metrics != {name: tuple(value * 2 for value in metric)
                                                   for name, metric in original[tag].metrics.items()}:
            raise ValueError("Whole-font scaling changed physical metrics: " + tag)
    if _metrics(font) != {name: value * 2 for name, value in _metrics(original).items()}:
        raise ValueError("Whole-font scaling changed physical line metrics")
    for field in ("caretSlopeRise", "caretSlopeRun"):
        if getattr(font["hhea"], field) != getattr(original["hhea"], field):
            raise ValueError("Whole-font scaling changed a dimensionless caret slope")


def _nodal_gvar(variable, masters):
    """Direct integer deltas avoid rounded residuals at adaptive numeral points.

    Every non-default master has a tent ending at its immediate neighbours. At
    an accepted knot exactly one tent is 1 and all others are 0. Intermediate
    coordinates linearly interpolate adjacent masters. Quantized knots match
    the OpenType/FontTools F2Dot14 normalization.
    """
    from fontTools.ttLib import newTable
    from fontTools.ttLib.tables.TupleVariation import TupleVariation

    if tuple(weight for weight, _ in masters) != WEIGHTS:
        raise ValueError("Nodal masters must use all accepted weights in ascending order")
    if "avar" in variable:
        if any(key != value for segment in variable["avar"].segments.values() for key, value in segment.items()):
            raise ValueError("A non-identity avar map requires matching nodal support coordinates")
        del variable["avar"]
    supports = nodal_supports()
    base = next(font for weight, font in masters if weight == AXIS["default"])
    gvar = variable["gvar"] = newTable("gvar")
    gvar.version, gvar.reserved, gvar.variations = 1, 0, {}
    for name in base.getGlyphOrder():
        def coordinates(font):
            data = font["glyf"]._getCoordinatesAndControls(name, font["hmtx"].metrics,
                    font["vmtx"].metrics if "vmtx" in font else None)
            if data is None:
                raise ValueError("Nodal master has a missing glyph: " + name)
            points, controls = data
            signature = (controls.numberOfContours, controls.endPts,
                         tuple(int(flag) & 0xC1 for flag in controls.flags) if controls.flags is not None else None,
                         controls.components)
            return points, signature

        baseline, controls = coordinates(base)
        tuples = []
        for weight, master in masters:
            points, actual_controls = coordinates(master)
            if actual_controls != controls or len(points) != len(baseline):
                raise ValueError("Nodal masters remain incompatible: " + name)
            if weight == AXIS["default"]:
                continue
            deltas = [(x - bx, y - by) for (x, y), (bx, by) in zip(points, baseline)]
            if not all(isinstance(value, int) for point in deltas for value in point):
                raise ValueError("Nodal deltas must remain exact integers")
            if any(x or y for x, y in deltas):
                variation = TupleVariation({"wght": supports[weight]}, deltas)
                # Omit only deltas that OpenType IUP reconstructs exactly. The
                # default tolerance permits approximation and is not acceptable
                # for the frozen authored endpoints or their interpolation.
                end_points = list(controls[1])
                variation.optimize(baseline, end_points, tolerance=0.0)
                restored = deepcopy(variation)
                restored.calcInferredDeltas(baseline, end_points)
                if restored.coordinates != deltas:
                    raise ValueError("Exact IUP changed a nodal delta: " + name)
                tuples.append(variation)
        gvar.variations[name] = tuples
    return {"basis": "adjacent-master nodal tents; direct integer deltas including four phantom points",
            "normalizedKnots": {str(weight): supports[weight][1] if weight in supports else 0 for weight in WEIGHTS},
            "iupApproximation": False, "exactIup": True, "residualDeltaRounding": False}


def _assert_instance(instance, master, context):
    actual_cmap, expected_cmap = instance.getBestCmap(), master.getBestCmap()
    if any(expected_cmap.get(char) != name for char, name in actual_cmap.items()):
        raise ValueError("Variable instance changed accepted coverage: " + context)
    if _metrics(instance) != _metrics(master):
        raise ValueError("Variable instance changed accepted line metrics: " + context)
    for name in instance.getGlyphOrder():
        if name not in master["glyf"] or _glyph_snapshot(instance, name) != _glyph_snapshot(master, name):
            raise ValueError(f"Variable instance changes accepted outline: {context} {name}")
        for tag in ("hmtx", "vmtx"):
            if tag in master and (tag not in instance or instance[tag][name] != master[tag][name]):
                raise ValueError(f"Variable instance changes accepted metrics: {context} {name}")


def _assert_variable(font, masters, context, coverage):
    from fontTools.varLib.instancer import OverlapMode, instantiateVariableFont

    axes = [(axis.axisTag, axis.minValue, axis.defaultValue, axis.maxValue) for axis in font["fvar"].axes]
    if axes != [("wght", AXIS["minimum"], AXIS["default"], AXIS["maximum"])]:
        raise ValueError("Variable axis differs from accepted scope: " + context)
    if set(font.getBestCmap()) != set(coverage) or not any(font["gvar"].variations.values()):
        raise ValueError("Variable coverage or actual gvar data is missing: " + context)
    for weight, master in masters:
        instance = instantiateVariableFont(font, {"wght": weight}, inplace=False, optimize=False,
                                           overlap=OverlapMode.KEEP_AND_DONT_SET_FLAGS)
        _assert_instance(instance, master, f"{context} {weight}")


def _font_bytes(font, flavor="woff2"):
    result = deepcopy(font)
    result.recalcTimestamp = False
    result.flavor = flavor
    stream = BytesIO()
    result.save(stream)
    return stream.getvalue()


def _frozen_font_hashes(root):
    """Read accepted identities as literals, never execute the static verifier."""
    source = ast.parse((root / "scripts/fonts/verify_fonts.py").read_text(encoding="utf-8"))
    approved = next((ast.literal_eval(node.value) for node in source.body if isinstance(node, ast.Assign)
                     and any(isinstance(target, ast.Name) and target.id == "APPROVED_SANS_0600_SHA256"
                             for target in node.targets)), None)
    if not isinstance(approved, dict) or not approved:
        raise ValueError("Frozen accepted font identities are missing")
    return approved


def _assert_shaping(font, masters, context):
    """Future-build guard for retained GPOS/GSUB and numeric alternatives."""
    import uharfbuzz as hb

    payload = _font_bytes(font, None)
    samples = ("Gavia UI. Clear forms, precise decisions. AV To Wa fy",
               "Гавиа. Ёж, йога, флаг, юг, съёмка. Та Га ду а",
               "Í Ï Ĩ Ī á ä å ý ÿ I\u0301 I\u0308 a\u0301 y\u0301 а\u0301 у\u0301",
               "ГавиаЁжйогасъёмкаа\u0301у\u0301", "Í\u0301Ï\u0308á\u0301",
               "0123456789 00112233445566778899")
    coverage = set(font.getBestCmap())
    runs = []
    for sample in samples:
        current = []
        for char in sample:
            if ord(char) in coverage:
                current.append(char)
            elif current:
                runs.append("".join(current))
                current = []
        if current:
            runs.append("".join(current))
    if not runs:
        raise ValueError("Shaping probes do not cover this variable subset: " + context)
    for weight, master in masters:
        accepted = _font_bytes(master, None)
        def shape(data, text, features, variable=False):
            face = hb.Face(data)
            shaped = hb.Font(face)
            shaped.scale = (face.upem, face.upem)
            if variable:
                shaped.set_variations({"wght": weight})
            buffer = hb.Buffer()
            buffer.add_str(text)
            buffer.guess_segment_properties()
            hb.shape(shaped, buffer, features)
            names = font.getGlyphOrder() if variable else master.getGlyphOrder()
            return [(names[info.codepoint], info.cluster, position.x_advance, position.y_advance,
                     position.x_offset, position.y_offset)
                    for info, position in zip(buffer.glyph_infos, buffer.glyph_positions)]

        for text in runs:
            for features in ({}, {"tnum": True, "kern": False}, {"pnum": True, "kern": False}):
                if shape(payload, text, features, True) != shape(accepted, text, features):
                    raise ValueError(f"Variable shaping changes an accepted master: {context} {weight}"
                                     f" {ascii(text)} {features}")


def _variable_names(font, style):
    family = "Gavia Sans Variable"
    subfamily = "Italic" if style == "italic" else "Regular"
    values = {1: family, 2: subfamily, 3: "GaviaSansVariable-0.600-" + subfamily,
              4: family + " " + subfamily, 6: "GaviaSansVariable-" + subfamily,
              16: family, 17: subfamily, 21: family, 22: subfamily}
    for name_id, value in values.items():
        for platform, encoding, language in ((3, 1, 0x409), (1, 0, 0)):
            font["name"].setName(value, name_id, platform, encoding, language)


def draft_css(static_css, files, metrics):
    """A staged replacement keeps existing static faces and family aliases first."""
    marker = "/* Gavia Sans variable faces; full coverage first, Core preferred for matching text. */"
    # The canonical stylesheet can already contain a promoted generated payload.
    # Rebuilding must replace that block, preserving the original static faces.
    static_css = static_css.split(marker, 1)[0].split(
        "/* Draft variable candidate; activate only after font acceptance. */", 1
    )[0].strip()
    static_support = "@supports not (font-variation-settings: normal) {"
    if static_css.startswith(static_support) and static_css.endswith("}"):
        static_css = static_css[len(static_support):-1].strip()
    # Reverse source-order matching prefers core for its coverage. The full face
    # remains eligible for every original character and whole marked clusters.
    subsets = sorted(files, key=lambda record: (record["style"], record["subset"] != "full"))
    # Exact static weights otherwise compete with the variable range in native
    # face matching, causing redundant requests despite the variable preload.
    lines = [static_support, static_css, "}", "", marker,
             "@supports (font-variation-settings: normal) {"]
    for family in ("Gavia Sans", "Gavia"):
        for record in subsets:
            lines.extend(["  @font-face {", f'    font-family: "{family}";',
                          f'    src: url("../../fonts/gavia/{record["file"]}") format("woff2");',
                          f'    font-style: {record["style"]};', "    font-weight: 100 700;",
                          "    font-display: swap;", f'    unicode-range: {record["unicodeRange"]};', "  }", ""])
    lines.extend(["}", "", "/* Line-box alignment only; local face x-height/advance matching is not claimed. */"])
    upm = metrics["unitsPerEm"]
    for style in ("normal", "italic"):
        source = 'local("Arial Italic"), local("Liberation Sans Italic")' if style == "italic" else 'local("Arial"), local("Liberation Sans")'
        lines.extend(["@font-face {", '  font-family: "Gavia Sans Fallback";', f"  src: {source};",
                      f"  font-style: {style};", "  font-weight: 100 700;", "  size-adjust: 100%;",
                      f'  ascent-override: {metrics["ascent"] * 100 / upm:g}%;',
                      f'  descent-override: {abs(metrics["descent"]) * 100 / upm:g}%;',
                      f'  line-gap-override: {metrics["lineGap"] * 100 / upm:g}%;', "}", ""])
    return "\n".join(lines)


def core_size_budget(records):
    """Fail closed on each actual core file, before writing a payload."""
    sizes = {}
    for style in ("normal", "italic"):
        core = [record for record in records if record["style"] == style and record["subset"] == "core"]
        if len(core) != 1 or not isinstance(core[0]["bytes"], int) or core[0]["bytes"] <= 0:
            raise ValueError(f"A single measured {style} core font is required")
        size = sizes[style] = core[0]["bytes"]
        if size > CORE_FONT_BUDGET:
            raise ValueError(f"{style} core font exceeds the {CORE_FONT_BUDGET}-byte budget: {size}")
    return {"targetMainPageFontBytes": CORE_FONT_BUDGET, "normalCoreBytes": sizes["normal"],
            "coreAssetBytesByStyle": sizes,
            "coreAssetBudgetPassed": True,
            "status": "core asset budgets passed; actual main-page browser transfer and acceptance pending"}


def build(root, output):
    report = preflight(root, allow_normalization=True)
    output = destination(root, output)
    sys.path.insert(0, str(root / ".tools/font-build"))
    import fontTools
    from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, InstanceDescriptor, SourceDescriptor
    from fontTools.subset import Options, Subsetter
    from fontTools.ttLib import TTFont
    from fontTools.varLib import build as compile_variable
    from variable_geometry import normalize_variable_masters

    if fontTools.version != FONTTOOLS_VERSION:
        raise ValueError("Use the existing pinned font-build requirements; no implicit dependency upgrade")
    directory = root / "packages/ui-kit/fonts/gavia"
    accepted = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    prepared, records, normalizations, master_digests = {}, [], {}, []
    metrics = None
    for style, group in report["styles"].items():
        design = DesignSpaceDocument()
        axis = AxisDescriptor()
        axis.name, axis.tag = "Weight", "wght"
        axis.minimum, axis.default, axis.maximum = AXIS["minimum"], AXIS["default"], AXIS["maximum"]
        design.addAxis(axis)
        masters = []
        for record, weight in zip(group["masters"], group["weights"]):
            master = TTFont(directory / record["file"], recalcTimestamp=False)
            _scale_master(master)
            masters.append((weight, master))
            master_digests.append({"file": record["file"], "sha256": record["sha256"], "weight": weight, "style": style})
            source = SourceDescriptor()
            source.name, source.font, source.location = record["file"], master, {"Weight": weight}
            design.addSource(source)
            instance = InstanceDescriptor()
            instance.name, instance.location = str(weight), {"Weight": weight}
            instance.familyName = "Gavia Sans Variable"
            instance.styleName = WEIGHT_NAMES[weight] + (" Italic" if style == "italic" else "")
            design.addInstance(instance)
        normalizations[style] = normalize_variable_masters([font for _, font in masters], style)
        print(f"{style}: six immutable masters normalized exactly", flush=True)
        current_metrics = _metrics(masters[0][1])
        if metrics is not None and metrics != current_metrics:
            raise ValueError("Gavia styles no longer share accepted line metrics")
        metrics = current_metrics
        # Exact phantom points drive advances; no separately rounded HVAR model.
        # Never enable approximate IUP or drop the added correspondence anchors.
        variable, _, _ = compile_variable(design, exclude=["HVAR", "VVAR", "gvar"], optimize=False, drop_implied_oncurves=False)
        normalizations[style]["variationBasis"] = _nodal_gvar(variable, masters)
        _variable_names(variable, style)
        coverage = set(masters[0][1].getBestCmap())
        _assert_variable(variable, masters, style + " in-memory", coverage)
        _assert_shaping(variable, masters, style + " in-memory")
        stem = "Gavia-Variable" + ("-Italic" if style == "italic" else "")
        for subset_name, characters in {"full": coverage, **subset_coverage(coverage)}.items():
            if not characters:
                raise ValueError("An expected Gavia script subset is empty: " + subset_name)
            candidate = deepcopy(variable)
            if subset_name != "full":
                options = Options(layout_features=["*"], layout_closure=True, notdef_outline=True,
                                  glyph_names=False, hinting=False, name_IDs=["*"], name_languages=["*"],
                                  recalc_timestamp=False)
                subsetter = Subsetter(options=options)
                subsetter.populate(unicodes=sorted(characters))
                subsetter.subset(candidate)
            suffix = {"full": "", "core": "-Core"}[subset_name]
            filename = stem + suffix + ".woff2"
            payload = _font_bytes(candidate)
            # Reopen actual WOFF2: in-memory geometry does not prove correct
            # degenerate-point encoding or serialized delta packing.
            reloaded = TTFont(BytesIO(payload), recalcTimestamp=False)
            # post format 3 omits private glyph names, not glyph IDs or drawing.
            # Resolve all lazily decoded tables through the original GID names
            # before comparing every outline, cmap, metric and shaping result.
            order = list(candidate.getGlyphOrder())
            if reloaded["maxp"].numGlyphs != len(order):
                raise ValueError("Serialized glyph order length changed: " + filename)
            reloaded.setGlyphOrder(order)
            _assert_variable(reloaded, masters, filename + " serialized", characters)
            _assert_shaping(reloaded, masters, filename + " serialized")
            prepared[Path("fonts/gavia") / filename] = payload
            records.append({"file": filename, "sha256": hashlib.sha256(payload).hexdigest(),
                            "bytes": len(payload), "style": style, "subset": subset_name,
                            "postFormat": candidate["post"].formatType,
                            "unicodeRange": unicode_range(characters)})
            print(f"{filename}: {len(payload)} bytes; all six endpoint/shaping checks passed", flush=True)
    fallback_files = []
    approved = _frozen_font_hashes(root)
    for face in accepted["faces"]:
        record = face["woff2"]
        filename = record["file"]
        if (Path(filename).name != filename or not filename.endswith(".woff2")
                or filename != Path(face["ttf"]["file"]).with_suffix(".woff2").name):
            raise ValueError("Unsafe or unexpected static fallback filename")
        payload = (directory / filename).read_bytes()
        digest = hashlib.sha256(payload).hexdigest()
        if digest != record["sha256"] or digest != approved.get(filename):
            raise ValueError("A static fallback no longer matches its accepted manifest")
        prepared[Path("fonts/gavia") / filename] = payload
        fallback_files.append({"file": filename, "sha256": digest, "style": face["style"], "weight": face["weight"]})
    for filename in ("OFL.txt", "Onest-OFL.txt", "FONTLOG.txt"):
        prepared[Path("fonts/gavia") / filename] = (directory / filename).read_bytes()
    prepared[Path("fonts/gavia/VARIABLE-FONTLOG.txt")] = (
        "Gavia Sans Variable draft, derived from accepted Gavia Sans 0.600.\n"
        "Original static binaries and authored drawing module are unchanged.\n"
        "Whole-font exact 1000-to-2000 UPM scaling; endpoint-preserving numeral correspondence.\n"
        "Weight axis 100-700, default400; separate upright and seven-degree oblique.\n"
        "A Latin-1/Cyrillic core and complete fallback retain all original characters and layout features.\n"
        "Draft interpolation and optical/native/browser transfer acceptance pending.\n").encode("utf-8")
    css = draft_css((root / "packages/ui-kit/styles/fonts/gavia.css").read_text(encoding="utf-8"), records, metrics)
    prepared[Path("styles/fonts/gavia-variable.css")] = css.encode("utf-8")
    manifest = {"status": "draft", "family": accepted["family"], "variableFamily": "Gavia Sans Variable",
                "version": accepted["version"], "license": accepted["license"], "fontTools": FONTTOOLS_VERSION,
                "axis": AXIS, "metrics": metrics, "masterDigests": master_digests,
                "sourceManifestSha256": hashlib.sha256((directory / "manifest.json").read_bytes()).hexdigest(),
                "buildSources": {name: hashlib.sha256((root / "scripts/fonts" / name).read_bytes()).hexdigest()
                                 for name in ("audit_variable.py", "variable_geometry.py", "build_variable.py")},
                "authoredGeometry": accepted["authoredGeometry"], "normalization": normalizations,
                "preflight": report, "acceptancePending": ACCEPTANCE_PENDING,
                "fallback": {"family": "Gavia Sans Fallback", "sizeAdjust": "100%",
                             "scope": "Accepted line-box alignment only; local x-height and advance widths are not matched"},
                "staticFallbackFiles": fallback_files, "files": records,
                "css": {"file": "styles/fonts/gavia-variable.css", "sha256": hashlib.sha256(css.encode("utf-8")).hexdigest()},
                "sizeBudget": core_size_budget(records)}
    prepared[Path("fonts/gavia/variable-manifest.json")] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    # Prepare all bytes before writing, then rename one sibling scratch folder.
    # Failed model/serialization/coverage guards leave no partial output payload.
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="." + output.name + "-", dir=output.parent) as temporary:
        stage = Path(temporary).resolve()
        if stage.parent != output.parent or not stage.name.startswith("." + output.name + "-"):
            raise ValueError("Temporary font payload escaped its intended parent")
        for relative, payload in prepared.items():
            path = (stage / relative).resolve()
            if relative.is_absolute() or ".." in relative.parts or stage not in path.parents:
                raise ValueError("A prepared font payload path escaped its scratch directory")
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
        destination(root, output)
        stage.rename(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preflight", action="store_true", help="Audit original static-master compatibility without loading build dependencies")
    parser.add_argument("--output-dir", type=Path, help="New scratch payload directory; requires separately authorized font build")
    args = parser.parse_args()
    if args.preflight == bool(args.output_dir):
        parser.error("Choose exactly one of --preflight or --output-dir")
    if args.preflight:
        preflight()
        print("Structural source preflight passed; derived interpolation and optical review are still required.")
    else:
        build(ROOT, args.output_dir)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, ImportError) as error:
        print("Variable font build: " + str(error), file=sys.stderr)
        sys.exit(1)
