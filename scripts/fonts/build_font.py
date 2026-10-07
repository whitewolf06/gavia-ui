"""Build Gavia Sans 0.6: unchanged accepted drawing with a classic flat-headed three.

Run from repository root. Install pinned requirements into .tools/font-build.
Outputs are real, static TrueType and WOFF2 faces; no browser synthesis.
"""
from __future__ import annotations
import copy
from datetime import datetime, timezone
import hashlib
import json
import math
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.tools/font-build'))
from fontTools import __version__ as FONTTOOLS_VERSION
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables
from fontTools.ttLib.tables.ttProgram import Program
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from draw_gavia import DESIGNS, draw_glyph, ITALIC_ANGLE, LETTER_SCALE, REFINED_LETTERS, refine_letters

SOURCE = ROOT / 'scripts/fonts/sources'
OUTPUT = ROOT / 'packages/ui-kit/fonts/gavia'
PREVIEW = ROOT / 'apps/playground/public/type-study/gavia'
WEIGHTS = [(100, 'Thin'), (300, 'Light'), (400, 'Regular'), (500, 'Medium'), (600, 'SemiBold'), (700, 'Bold')]
DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
SHEAR = math.tan(math.radians(ITALIC_ANGLE))
STAMP = int(datetime(2026, 10, 6, tzinfo=timezone.utc).timestamp()) + 2082844800
ADDITIONAL = '₽€£№©®™±×÷≠≤≥→←✓…–—‘’“”«»'
COPYRIGHT = ('Copyright 2021 The Onest Project Authors (https://github.com/googlefonts/onest). '
             'Copyright 2026 The Gavia Font Project Contributors. Licensed under SIL Open Font License 1.1.')


def bounds(font: TTFont, name: str):
    gs = font.getGlyphSet()
    pen = BoundsPen(gs)
    gs[name].draw(pen)
    return pen.bounds


def draw_transformed(font: TTFont, name: str, matrix=(1, 0, 0, 1, 0, 0)):
    gs = font.getGlyphSet()
    recording = DecomposingRecordingPen(gs)
    gs[name].draw(recording)
    pen = TTGlyphPen(None)
    recording.replay(TransformPen(pen, matrix))
    return pen.glyph()


def conjugate(matrix, shear: float):
    a, b, c, d, e, f = matrix
    return (a + shear * b, b, c + shear * d - shear * a - shear * shear * b,
            d - shear * b, round(e + shear * f), round(f))


def apply_shear_anchors(table, shear: float, visited=None):
    # GPOS mark anchors must follow the outline shear, including combining marks.
    if visited is None: visited = set()
    if table is None or id(table) in visited: return
    visited.add(id(table))
    if isinstance(table, otTables.Anchor):
        table.XCoordinate = round(table.XCoordinate + shear * table.YCoordinate)
    if isinstance(table, (list, tuple)):
        for item in table: apply_shear_anchors(item, shear, visited)
    elif hasattr(table, '__dict__'):
        for item in vars(table).values(): apply_shear_anchors(item, shear, visited)


def replace_names(font: TTFont, weight: int, label: str, italic: bool):
    style = label + (' Italic' if italic else '')
    legacy_family = 'Gavia Sans' if weight in (400, 700) else 'Gavia Sans ' + label
    legacy_style = ('Bold' if weight == 700 else '') + (' Italic' if italic else '')
    legacy_style = legacy_style.strip() or 'Regular'
    full_name = 'Gavia Sans ' + style
    ps_name = 'GaviaSans-' + label + ('Italic' if italic else '')
    names = {
        0: COPYRIGHT, 1: legacy_family, 2: legacy_style,
        3: 'GaviaSans-0.600-' + label + ('Italic' if italic else ''),
        4: full_name, 5: 'Version 0.600', 6: ps_name,
        8: 'Gavia Font Project', 9: 'Gavia contributors; refined Onest-derived letters and independent numeral outlines',
        10: ('OFL derivative: Onest-derived letters narrowed uniformly with restrained terminal refinements; '
             'independent even-stroke numerals; 7-degree oblique. '
             'Engineering preview; optical refinement and hinting remain.'),
        13: 'SIL Open Font License 1.1. Retain the original notices and accompanying OFL.txt.',
        14: 'https://openfontlicense.org', 16: 'Gavia Sans', 17: style, 21: 'Gavia Sans', 22: style,
    }
    replaced = set(names) | {7, 11, 12, 18, 20, 25}
    font['name'].names = [record for record in font['name'].names if record.nameID not in replaced]
    for name_id, value in names.items():
        font['name'].setName(value, name_id, 3, 1, 0x409)
        font['name'].setName(value, name_id, 1, 0, 0)
    font['OS/2'].usWeightClass = weight
    font['OS/2'].achVendID = 'GAVI'
    font['OS/2'].fsType = 0
    font['OS/2'].fsSelection &= ~((1 << 0) | (1 << 5) | (1 << 6) | (1 << 9))
    if italic: font['OS/2'].fsSelection |= 1
    if weight == 700: font['OS/2'].fsSelection |= 1 << 5
    if weight == 400 and not italic: font['OS/2'].fsSelection |= 1 << 6
    font['head'].macStyle = (1 if weight == 700 else 0) | (2 if italic else 0)
    font['head'].fontRevision = .6
    font['head'].created = font['head'].modified = STAMP
    font['post'].italicAngle = -ITALIC_ANGLE if italic else 0
    font['post'].isFixedPitch = 0
    font['hhea'].caretSlopeRise = 1000 if italic else 1
    font['hhea'].caretSlopeRun = round(SHEAR * 1000) if italic else 0
    font['hhea'].caretOffset = 0



def scale_layout(table, visited=None):
    """Scale full source kerning and mark positions with the letter drawing."""
    if visited is None: visited=set()
    if table is None or id(table) in visited:return
    visited.add(id(table))
    if isinstance(table,otTables.Anchor):
        table.XCoordinate=round(table.XCoordinate*LETTER_SCALE)
    for attribute in ('XAdvance','XPlacement'):
        if hasattr(table,attribute):setattr(table,attribute,round(getattr(table,attribute)*LETTER_SCALE))
    if isinstance(table,(list,tuple)):
        for item in table:scale_layout(item,visited)
    elif hasattr(table,'__dict__'):
        for item in vars(table).values():scale_layout(item,visited)


def letter_component(matrix,shear):
    # Conjugate source components by the common width/oblique transform.
    a,b,c,d,e,f=matrix;scale=LETTER_SCALE
    return (a+shear*b/scale,b/scale,
            scale*c+shear*d-shear*a-shear*shear*b/scale,
            d-shear*b/scale,round(scale*e+shear*f),round(f))


def build_face(base_var: TTFont, weight: int, label: str, italic: bool):
    original=instantiateVariableFont(base_var,{'wght':weight},inplace=False)
    source=copy.deepcopy(original)
    refine_letters(source)
    result=copy.deepcopy(source);result.recalcTimestamp=False
    shear=SHEAR if italic else 0
    changed_advances={}

    def advance_for(name):
        if name in changed_advances:return changed_advances[name]
        new=source['hmtx'][name][0]
        glyph=source['glyf'][name]
        if glyph.isComposite():
            for component in glyph.components:
                base=component.glyphName
                delta=advance_for(base)-original['hmtx'][base][0]
                if delta and original['hmtx'][base][0]>0:
                    new+=delta;break
        changed_advances[name]=new
        return new

    for name in source.getGlyphOrder():
        glyph=source['glyf'][name]
        if glyph.isComposite():
            pen=TTGlyphPen(source.getGlyphSet())
            for component in glyph.components:
                base,matrix=component.getComponentInfo()
                pen.addComponent(base,letter_component(matrix,shear))
            result['glyf'][name]=pen.glyph()
        else:
            result['glyf'][name]=draw_transformed(source,name,(LETTER_SCALE,0,shear,1,0,0))
        result['hmtx'][name]=(round(advance_for(name)*LETTER_SCALE),0)

    new_glyphs=[];pnum_map={}
    for digit,char in zip(DIGITS,'0123456789'):
        for name in (digit,digit+'.tf',digit+'.lf'):
            if name in result['glyf']:
                glyph,advance=draw_glyph(char,weight,italic)
                result['glyf'][name]=glyph;result['hmtx'][name]=(advance,0)
        name=digit+'.gavia.pnum'
        glyph,advance=draw_glyph(char,weight,italic,proportional_digit=True)
        result['glyf'][name]=glyph;result['hmtx'][name]=(advance,0)
        new_glyphs.append(name);pnum_map[digit]=name;pnum_map[digit+'.tf']=name
    for record in result['GSUB'].table.FeatureList.FeatureRecord:
        if record.FeatureTag=='pnum':
            for index in record.Feature.LookupListIndex:
                for subtable in result['GSUB'].table.LookupList.Lookup[index].SubTable:
                    if hasattr(subtable,'mapping'):subtable.mapping.update(pnum_map)
    result.setGlyphOrder(source.getGlyphOrder()+new_glyphs)
    if 'GPOS' in result:
        scale_layout(result['GPOS'].table)
        if italic:apply_shear_anchors(result['GPOS'].table,shear)
    if 'kern' in result:
        for table in result['kern'].kernTables:
            table.kernTable={pair:round(value*LETTER_SCALE) for pair,value in table.kernTable.items()}

    for glyph in result['glyf'].glyphs.values():
        glyph.program=Program();glyph.program.fromBytecode(b'')
    for tag in ('fpgm','prep','cvt ','gasp','LTSH','hdmx','VDMX','DSIG','STAT'):
        if tag in result:del result[tag]
    for attribute in ('maxTwilightPoints','maxStorage','maxFunctionDefs','maxInstructionDefs','maxStackElements','maxSizeOfInstructions'):
        setattr(result['maxp'],attribute,0)
    result['maxp'].maxZones=1;result['maxp'].numGlyphs=len(result.getGlyphOrder())
    for name in result.getGlyphOrder():
        glyph=result['glyf'][name];glyph.recalcBounds(result['glyf'])
        advance,_=result['hmtx'][name];result['hmtx'][name]=(advance,getattr(glyph,'xMin',0))
    replace_names(result,weight,label,italic)
    return result


def sha256(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    OUTPUT.mkdir(parents=True,exist_ok=True); PREVIEW.mkdir(parents=True,exist_ok=True)
    base=TTFont(SOURCE/'Onest-Variable.ttf',recalcTimestamp=False)
    faces=[]
    for weight,label in WEIGHTS:
        for italic in (False,True):
            faces.append((build_face(base,weight,label,italic),weight,label,italic))
            print('Built refined letters and even numerals:',label,'Italic' if italic else 'Upright',flush=True)
    max_top=max(g.yMax for f,*_ in faces for g in f['glyf'].glyphs.values() if hasattr(g,'yMax'))
    min_bottom=min(g.yMin for f,*_ in faces for g in f['glyf'].glyphs.values() if hasattr(g,'yMin'))
    metrics={'ascent':base['hhea'].ascent,'descent':base['hhea'].descent,'lineGap':base['hhea'].lineGap,
             'winAscent':max_top,'winDescent':-min_bottom}
    records=[]
    for face,weight,label,italic in faces:
        face['hhea'].ascent=metrics['ascent'];face['hhea'].descent=metrics['descent'];face['hhea'].lineGap=metrics['lineGap']
        face['OS/2'].sTypoAscender=metrics['ascent'];face['OS/2'].sTypoDescender=metrics['descent'];face['OS/2'].sTypoLineGap=metrics['lineGap']
        face['OS/2'].usWinAscent=metrics['winAscent'];face['OS/2'].usWinDescent=metrics['winDescent']
        filename='Gavia-'+label+('Italic' if italic else '')
        face.flavor=None;ttf=OUTPUT/(filename+'.ttf');face.save(ttf)
        face.flavor='woff2';web=OUTPUT/(filename+'.woff2');face.save(web)
        records.append({'weight':weight,'style':'italic' if italic else 'normal','name':filename,
                        'ttf':{'file':ttf.name,'sha256':sha256(ttf)},
                        'woff2':{'file':web.name,'sha256':sha256(web)}})
        print('Saved:',filename,flush=True)
    manifest={'family':'Gavia Sans','legacyCssFamily':'Gavia',
              'identityMigration':{'from':'Gavia','to':'Gavia Sans','date':'2026-10-07',
                  'scope':'name table only; original filenames, outlines, metrics, kerning and all other tables preserved'},
              'version':'0.600','license':'OFL-1.1','fontTools':FONTTOOLS_VERSION,
              'metrics':metrics,'sources':{p.name:sha256(p) for p in sorted(SOURCE.glob('*.ttf'))},
              'authoredGeometry':{'file':'scripts/fonts/draw_gavia.py','sha256':sha256(ROOT/'scripts/fonts/draw_gavia.py'),
                                  'characters':list(DESIGNS),'skeletons':4,'filledNumerals':['1','3','4','7'],'compoundNumerals':['6','9'],'refinedLetters':list(REFINED_LETTERS)},
              'faces':records,'design':{'base':'Onest-derived letter and extended glyph drawing',
                  'digits':'Independent numeral designs interpreting the first specimen: level wide-bar three with a gentler diagonal; long vertically cut one; short-stemmed open four; bracketed seven; compact six/nine loops with flat diagonal terminals. Actual Regular ink widths are 50% between 0.1 and 0.4; form details are optical interpretations, not a contour interpolation. Common optical limits; default/tnum 600-unit spacing; pnum spacing only',
                  'letters':'Uniform 96% Onest width, original vertical proportions, restrained a/e terminal and l foot refinements',
                  'italic':'7-degree geometric oblique; no JetBrains outline imports',
                  'kerning':'Complete source Onest kerning and mark positions retained, horizontally scaled with letters',
                  'hints':'Source bytecode stripped; native small-size rendering needs review'}}
    (OUTPUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    notice=(SOURCE/'Onest-OFL.txt').read_text(encoding='utf-8-sig')
    copyright_line,body=notice.split('\n\n',1)
    (OUTPUT/'OFL.txt').write_text(copyright_line+'\nCopyright 2026 The Gavia Font Project Contributors\n\n'+body,encoding='utf-8')
    shutil.copy2(SOURCE/'Onest-OFL.txt',OUTPUT/'Onest-OFL.txt')
    (OUTPUT/'FONTLOG.txt').write_text(
        'Gavia Sans 0.600 — 2026-10-07\n\n'
        'Family renamed from Gavia to Gavia Sans on 2026-10-07. Name records only; accepted drawing, metrics, kerning and other tables unchanged.\n\n'
        'OFL derivative based on the Onest letter and extended-glyph drawing.\n'
        'Letters uniformly narrowed to 96%; source vertical proportions and full kerning retained.\n'
        'Restrained non-affine terminal refinements in a/а, e/е and a small straight foot on l.\n'
        'All ten numerals independently authored: four Bezier skeletons, four filled designs and two loop/diagonal unions.\n'
        'Numeral proportions are set before stroke expansion; no per-character post-stroke stretching.\n'
        'Six weights 100/300/400/500/600/700; upright and 7-degree geometric oblique.\n'
        'Level wide-bar three with a gentler diagonal and open lower bowl; long vertically cut one with broad foot; short-stemmed four; bracketed seven; broader eight and compact six/nine with flat terminals.\n'
        'Common baseline/cap alignment with optical overshoots; expanded heights solved before final translation.\n'
        'Only the three drawing changes from 0.5; other nine numerals, letters, non-numeric glyphs and kerning are unchanged.\n'
        'Actual Regular ink widths are the 0.1/0.4 midpoint, within rounding; contours are not mathematically blended.\n'
        'Default/tnum 600-unit advances; pnum changes placement and advance only.\n'
        'No JetBrains Mono outlines imported. Historical specimens are preserved in Git commit 32ec879.\n'
        'Source bytecode removed; optical refinement and native rendering review remain.\n',encoding='utf-8')
    for path in OUTPUT.iterdir():
        if path.is_file():shutil.copy2(path,PREVIEW/path.name)
    print('Family ready:',len(records),'faces;',len(DESIGNS),'independent numeral designs;',metrics,flush=True)


if __name__=='__main__':main()
