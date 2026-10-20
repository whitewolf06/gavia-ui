"""Prepare draft variable fonts from compatible accepted Gavia masters.

No font is written until the read-only preflight passes. Output must be a new
scratch directory; this command never replaces the package or specimen assets.
Building any font requires the separately authorized font-build workflow.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

from audit_variable import AXIS, ROOT, audit


def preflight(root=ROOT):
    report = audit(root)
    if not report["ready"]:
        details = "; ".join(f"{style}: {value['incompatibleGlyphs']} incompatible glyphs"
                            for style, value in report["styles"].items())
        raise ValueError("Variable font masters are incompatible (" + details
                         + "). Run audit_variable.py for every affected glyph. No output was written.")
    return report


def destination(root, output):
    target = output.resolve()
    for name in ("packages/ui-kit/fonts", "apps/playground/public", "scripts/fonts/sources"):
        protected = (root / name).resolve()
        if target == protected or protected in target.parents:
            raise ValueError("Draft output must not replace package, specimen or source font assets")
    if target.exists():
        raise ValueError("Draft output directory already exists; choose a new directory")
    return target


def build(root, output):
    report = preflight(root)
    output = destination(root, output)
    sys.path.insert(0, str(root / ".tools/font-build"))
    from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, InstanceDescriptor, SourceDescriptor
    from fontTools.ttLib import TTFont
    from fontTools.varLib import build as compile_variable
    from fontTools.varLib.instancer import instantiateVariableFont

    directory = root / "packages/ui-kit/fonts/gavia"
    # Construct both fonts in memory before creating the output directory.
    prepared = []
    for style, group in report["styles"].items():
        design = DesignSpaceDocument()
        axis = AxisDescriptor()
        axis.name, axis.tag = "Weight", "wght"
        axis.minimum, axis.default, axis.maximum = AXIS["minimum"], AXIS["default"], AXIS["maximum"]
        design.addAxis(axis)
        masters = []
        for record, weight in zip(group["masters"], group["weights"]):
            master = TTFont(directory / record["file"], recalcTimestamp=False)
            masters.append((weight, master))
            source = SourceDescriptor()
            source.name, source.font, source.location = record["file"], master, {"Weight": weight}
            design.addSource(source)
            instance = InstanceDescriptor()
            instance.name, instance.location = str(weight), {"Weight": weight}
            instance.familyName = report["family"]
            instance.styleName = str(weight) + (" Italic" if style == "italic" else "")
            design.addInstance(instance)
        variable, _, _ = compile_variable(design)
        # A structurally valid build must still reproduce every accepted master.
        for weight, master in masters:
            instance = instantiateVariableFont(variable, {"wght": weight}, inplace=False)
            if instance.getBestCmap() != master.getBestCmap() or instance["hmtx"].metrics != master["hmtx"].metrics:
                raise ValueError(f"Variable instance changes accepted coverage or metrics at {style} {weight}")
            for name in master.getGlyphOrder():
                actual = instance["glyf"][name].getCoordinates(instance["glyf"])
                expected = master["glyf"][name].getCoordinates(master["glyf"])
                if actual != expected:
                    raise ValueError(f"Variable instance changes accepted outline: {style} {weight} {name}")
        variable.recalcTimestamp = False
        variable.flavor = "woff2"
        prepared.append(("Gavia-Variable" + ("-Italic" if style == "italic" else "") + ".woff2", variable))
    output.mkdir(parents=True, exist_ok=False)
    records = []
    for filename, font in prepared:
        path = output / filename
        font.save(path)
        records.append({"file": filename, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    (output / "draft-manifest.json").write_text(json.dumps({"status": "draft; optical, browser and shaping review pending",
        "preflight": report, "files": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preflight", action="store_true", help="Check accepted masters without loading build dependencies")
    parser.add_argument("--output-dir", type=Path, help="New scratch output directory; requires separately authorized font build")
    args = parser.parse_args()
    if args.preflight == bool(args.output_dir):
        parser.error("Choose exactly one of --preflight or --output-dir")
    if args.preflight:
        preflight()
        print("Structural preflight passed; optical interpolation review is still required.")
    else:
        build(ROOT, args.output_dir)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, ImportError) as error:
        print("Variable font build: " + str(error), file=sys.stderr)
        sys.exit(1)
