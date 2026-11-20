"""Derive the Legato Sans web aliases and standalone release from the accepted Gavia faces."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import sys
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / ".tools/font-build"))
from fontTools.ttLib import TTFont

KIT = ROOT / "packages/ui-kit"
FONTS = KIT / "fonts/gavia"
STYLES = KIT / "styles/fonts"
FAMILY = "Legato Sans"


def web_faces(legacy_css):
    """Copy the primary family's descriptors, including browser-specific subset guards."""
    def rename_face(match):
        face = match.group()
        if 'font-family: "Gavia Sans' in face:
            return face.replace('font-family: "Gavia Sans', 'font-family: "Legato Sans')
        return ""

    css = re.sub(r"/\*.*?\*/", "", legacy_css, flags=re.S)
    css = re.sub(r"(?m)^[ \t]*@font-face\s*\{[^{}]+\}", rename_face, css)
    css = re.sub(r"(?m)^[ \t]*@supports not \(-moz-appearance: none\) \{\s*\}", "", css)
    return re.sub(r"\n(?:[ \t]*\n){2,}", "\n\n", css).strip() + "\n"


def rename_font(source):
    with TTFont(BytesIO(source), recalcBBoxes=False, recalcTimestamp=False) as font:
        # Family, unique ID, full/PostScript, typographic and WWS names on every platform.
        ids = {1, 3, 4, 6, 16, 18, 20, 21, 25}
        if "fvar" in font:
            ids.update(instance.postscriptNameID for instance in font["fvar"].instances)
        for record in font["name"].names:
            if record.nameID in ids:
                name = record.toUnicode().replace("Gavia Sans", FAMILY).replace("GaviaSans", "LegatoSans")
                record.string = name.encode(record.getEncoding())
        if not font["name"].getDebugName(16).startswith(FAMILY):
            raise ValueError("Unexpected source font family")
        result = BytesIO()
        font.save(result)
        return result.getvalue()


def standalone_zip(manifest, variable, legacy_css, aliases, directory):
    entries = {}

    def font_entry(record):
        filename = record["file"]
        source = (FONTS / filename).read_bytes()
        if sha256(source).hexdigest() != record["sha256"]:
            raise ValueError(f"Source font differs from manifest: {filename}")
        name = filename.replace("Gavia-", "Legato-", 1)
        data = entries[name] = rename_font(source)
        return {**record, "file": name, "bytes": len(data), "sha256": sha256(data).hexdigest()}

    faces = [{key: font_entry(face[key]) if key in ("ttf", "woff2") else face[key]
              for key in ("style", "weight", "ttf", "woff2")} for face in manifest["faces"]]
    variables = [font_entry(record) for record in variable["files"]]
    def json_entry(data):
        return (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode()

    entries["manifest.json"] = json_entry({"family": FAMILY, "version": manifest["version"],
                                           "license": manifest["license"], "faces": faces})
    entries["variable-manifest.json"] = json_entry({"family": FAMILY, "axis": variable["axis"], "files": variables})
    for filename in ("OFL.txt", "Onest-OFL.txt", "FONTLOG.txt", "VARIABLE-FONTLOG.txt"):
        entries[filename] = (FONTS / filename).read_text(encoding="utf-8").encode()
    entries["FONTLOG.txt"] = b"Legato Sans: family and PostScript names updated from Gavia Sans.\n\n" + entries["FONTLOG.txt"]
    css = (legacy_css + "\n" + aliases).replace("../../fonts/gavia/Gavia-", "./Legato-").replace("../../fonts/gavia/OFL.txt", "OFL.txt")
    entries["legato.css"] = css.encode()
    entries["gavia.css"] = b'@import "./legato.css";\n'
    entries["README.txt"] = (
        "Legato Sans\nInstall the TTF files to use Legato Sans on your computer.\n"
        'For the web, load legato.css and set font-family: "Legato Sans Core", "Legato Sans", sans-serif.\n'
        "Gavia Sans and Gavia are also registered by this stylesheet. Keep the WOFF2 and CSS files together.\n"
        "Font software is licensed under the SIL Open Font License 1.1. Retain both OFL files.\n"
    ).encode()
    result = BytesIO()
    with ZipFile(result, "w") as archive:
        for name, data in sorted(entries.items()):
            item = ZipInfo(directory + "/" + name, (2026, 11, 20, 0, 0, 0))
            item.create_system = 3
            item.external_attr = 0o100644 << 16
            archive.writestr(item, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    return result.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    legacy_css = (STYLES / "gavia.css").read_text(encoding="utf-8")
    aliases = web_faces(legacy_css)
    manifest = json.loads((FONTS / "manifest.json").read_text(encoding="utf-8"))
    variable = json.loads((FONTS / "variable-manifest.json").read_text(encoding="utf-8"))
    name = f"Legato-Sans-{float(manifest['version']):g}"
    css = '/* Generated by scripts/fonts/build_legato.py. All web families share the same WOFF2 URLs. */\n@import "./gavia.css";\n\n' + aliases
    outputs = {
        STYLES / "legato.css": css.encode(),
        ROOT / "apps/playground/public/downloads" / (name + ".zip"): standalone_zip(manifest, variable, legacy_css, aliases, name),
    }
    for path, data in outputs.items():
        if args.check:
            if path.read_bytes() != data:
                raise ValueError(f"Stale Legato font output: {path}")
        else:
            path.parent.mkdir(exist_ok=True, parents=True)
            path.write_bytes(data)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
