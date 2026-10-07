"""Validate the usable Gavia font family with FontTools and HarfBuzz."""
from pathlib import Path
import hashlib
import json
import math
import struct
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'.tools/font-build'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb

FONTS = ROOT/'packages/ui-kit/fonts/gavia'
SOURCES = ROOT/'scripts/fonts/sources'
SOURCE_FILES = {
    'Onest': 'Onest-Variable.ttf',
    'JetBrains Mono': 'JetBrainsMono-Variable.ttf',
    'JetBrains Mono Italic': 'JetBrainsMono-Italic-Variable.ttf',
}
DIGITS = '0123456789'
# Flat and round forms keep a deliberate eight-unit optical overshoot.
# These targets apply across all six weights and both upright/oblique faces.
DIGIT_VERTICAL_BOUNDS = {char:((-8,715) if char in '08' else
                              (-8,707) if char in '356' else
                              (0,715) if char in '29' else (0,707))
                         for char in DIGITS}
VERTICAL_TOLERANCE = 1.0
REFINED_LETTERS = 'aаeеl'
CHECKED_CHARACTERS = DIGITS + REFINED_LETTERS
# Onest a/а and e/е have matching spacing but intentionally distinct counters.
SCRIPT_PAIRS = [('o', 'о')]
REFINEMENT_PAIRS = [('a', 'а'), ('e', 'е')]
EXPECTED_STROKES = {100:40, 300:69, 400:84, 500:102, 600:120, 700:137}
# Scan-line measurements allow TrueType integer rounding and curved stem slope.
STEM_TOLERANCE = 2.0
ONE_ENTRY_MIN_PROJECTION = 125
ONE_ENTRY_TERMINAL_MIN_STROKE_RATIO = .85
REGULAR_WIDTH_TOLERANCE = 1.5
THREE_TOP_HEIGHT = 707
THREE_TOP_MIN_WIDTH_RATIO = .5
THREE_HORIZONTAL_STROKE_RATIO = .92
ITALIC_ANGLE = 7
# Frozen accepted release identity, independent of a regenerated manifest.
# Intentionally updating the drawing requires a new version and acceptance.
APPROVED_0600_SHA256 = {
    'Gavia-Thin.ttf': '36e9ac3ed86418b3d8a9c7230135ca636552442f40db1ef9a68dbcaf898e9b7f',
    'Gavia-Thin.woff2': 'b023efaa8e41a16e2619a528d48dd92d216923d04c63dcd6076d1afc0e2b7957',
    'Gavia-ThinItalic.ttf': '90d24966dad25aa26ff6c3cd11cd02680052500e86697abb4e48976b96bb1de1',
    'Gavia-ThinItalic.woff2': '404c539aed97c35abeedb2ce201fc39bdaa44b0d3cd10ca41e5222bb1b658482',
    'Gavia-Light.ttf': '53685ed8bfc9dea4463cd423f509388a3352784db40e6adf8d12a3640030a73f',
    'Gavia-Light.woff2': '40fb548cd699d2235203d1f9b0f6d2ada227793b73d761fb7e61649727f3c844',
    'Gavia-LightItalic.ttf': 'f105bb175fd8c640aa666db7c399d8dd85415f5b5f6876d8f71274f376382e7e',
    'Gavia-LightItalic.woff2': 'd6d3644b74046f3fec5d98c2e2b5fd810080664845cee54d9aaba45f827feebd',
    'Gavia-Regular.ttf': 'c2d1f45a03fd59d81eaea27d28d654ed437de1b70bb8dceff23d9a6dc8aca32d',
    'Gavia-Regular.woff2': '8dd3bf1a81fb269f8042c4f0e3373f01a0252c49ba72ad9040efc94f5d4fd528',
    'Gavia-RegularItalic.ttf': 'b5221c831f85eb1b40a8925e72004f36005d4ffa2993f721c7af950c17c3a686',
    'Gavia-RegularItalic.woff2': '683c881ca63ecd89f780fae02b5cbc6868f52ed0f9f1086857494ac60da3acfa',
    'Gavia-Medium.ttf': '3c874da4658b1ea0b43ccb2833ca057661e8b8e7e9a8002bcb79870ee4d7e937',
    'Gavia-Medium.woff2': '05cd0d5b0033a5d4cf5de6df4b18435d3c1c23a1d7ab9f721efec3b81ab0db56',
    'Gavia-MediumItalic.ttf': '320abe0dc51e6ef52be9798fc1abadebcac401560649018e2f24447eb21c81fb',
    'Gavia-MediumItalic.woff2': '8fadd7b094ee2aeb1bd9ec392712b62d9e6f1a1febea8820589857dcf5ed0385',
    'Gavia-SemiBold.ttf': '932504e72eb1c1644b497dee990c8318f2e1220d8a438c7d2636382a4adf6d48',
    'Gavia-SemiBold.woff2': 'fae4307cc7d4bf44c48e651569fde5dc124837a31b8d45e200713064624297f2',
    'Gavia-SemiBoldItalic.ttf': '4a0ab5488d76a08f583e221e0458c8d10f2540371e5c4f7c6ca3c25475d74ea4',
    'Gavia-SemiBoldItalic.woff2': '76a2c69289f9efc2613306f0d904264b3c1cde622a1bb2faf3e83812cdcfbf2e',
    'Gavia-Bold.ttf': '9b85cdf1e578770ec0e1e3a301831263b31eb538616983aea423b17ccd4e1afb',
    'Gavia-Bold.woff2': '01e2a8b4350ee9ad9c645fa5b4bfc0d5570bb166b993caf4c8dcdbfa2b199d52',
    'Gavia-BoldItalic.ttf': 'd107280ad1453ba37d41adcf182ee38fd914f0d63d5598e9c66e42e14c0b2646',
    'Gavia-BoldItalic.woff2': '00e105fd7b4c492d1df60a54be944dfc81891629f3d0b900a4ba89f340fd8526',
}
APPROVED_REGULAR_INK_WIDTHS = dict(zip(DIGITS,(432,418,434,430,413,430,448,423,446,448)))
LETTER_SCALE = .96
LETTER_SCALE_PROBES = 'Hno\u041d\u043e'
LETTER_SCALE_TOLERANCE = 1.5
# A small tolerance prevents scale/translation plus integer rounding from being
# classified as a new outline. This is a geometric check, not an optical review.
NORMALIZED_TOLERANCE = .004
REQUIRED = ''.join(chr(cp) for cp in range(32,127)) + ''.join(chr(cp) for cp in range(0x410,0x450)) + 'Ёё₽€£№©®™±×÷≠≤≥→←✓…–—‘’“”«»'
TEXTS = ['Gavia UI. Clear forms, precise decisions. if (a != 0) return 1;',
         'Гавиа. Ясные формы, точные решения. Ёж, йога, флаг, юг, съёмка.',
         'AV To Wa Та Га ду fy а, I l 1 O 0',
         'Í Ï Ĩ Ī á ä å ý ÿ I\u0301 I\u0308 a\u0301 y\u0301 а\u0301 у\u0301']


def shape(path, text, features=None):
    face = hb.Face(path.read_bytes())
    font = hb.Font(face); font.scale = (face.upem, face.upem)
    buffer = hb.Buffer(); buffer.add_str(text); buffer.guess_segment_properties()
    hb.shape(font, buffer, features or {})
    return list(buffer.glyph_infos), list(buffer.glyph_positions)


def checksum(path):
    data=path.read_bytes(); data += b'\0' * (-len(data) % 4)
    return sum(struct.unpack('>%dI' % (len(data)//4),data)) & 0xffffffff


def canonical_contour(points):
    """Ignore the contour's starting point and drawing direction."""
    points = tuple(points)
    reverse = tuple(reversed(points))
    return min(sequence[index:] + sequence[:index]
               for sequence in (points, reverse)
               for index in range(len(sequence)))


def normalized_outline(font, char=None, *, glyph_name=None, deskew=False):
    """Decompose components, normalize XY bounds, retain on/off-curve flags.

    Independent X/Y normalization also catches nonuniformly scaled copies.
    Deskew removes the face's declared italic angle before normalization.
    Contour order, start points and directions do not affect the fingerprint.
    """
    name = glyph_name or font.getBestCmap()[ord(char)]
    coordinates, ends, flags = font['glyf'][name].getCoordinates(font['glyf'])
    assert coordinates and ends, (name, 'empty original-design outline')
    shear = math.tan(math.radians(-font['post'].italicAngle)) if deskew else 0
    points = [(float(x) - shear * float(y), float(y))
              for x, y in coordinates]
    xmin=min(x for x,y in points); xmax=max(x for x,y in points)
    ymin=min(y for x,y in points); ymax=max(y for x,y in points)
    assert xmax > xmin and ymax > ymin, (name, 'degenerate outline bounds')
    normalized = [(round((x-xmin)/(xmax-xmin), 6),
                   round((y-ymin)/(ymax-ymin), 6), bool(flag & 1))
                  for (x,y),flag in zip(points,flags)]
    contours=[]; start=0
    for end in ends:
        contours.append(canonical_contour(normalized[start:end+1]))
        start=end+1
    assert start == len(coordinates), (name, 'invalid contour endpoints')
    return tuple(sorted(contours))


def contour_equal(first, second, tolerance=NORMALIZED_TOLERANCE):
    """Compare canonical contour geometry with a rounding tolerance."""
    if len(first) != len(second):
        return False
    def point_equal(left, right):
        return (left[2] == right[2]
                and abs(left[0]-right[0]) <= tolerance
                and abs(left[1]-right[1]) <= tolerance)
    # Rounding near a contour extremum can move the canonical start point.
    # Try only cyclic alignments whose first point already matches.
    for sequence in (second, tuple(reversed(second))):
        for offset, point in enumerate(sequence):
            if point_equal(first[0], point) and all(
                    point_equal(left, sequence[(offset+index) % len(sequence)])
                    for index,left in enumerate(first)):
                return True
    return False


def outlines_equal(first, second, tolerance=NORMALIZED_TOLERANCE):
    if len(first) != len(second):
        return False
    remaining=list(second)
    for contour in first:
        for index,candidate in enumerate(remaining):
            if contour_equal(contour,candidate,tolerance):
                remaining.pop(index)
                break
        else:
            return False
    return True


def outline_fingerprint(outline):
    data=json.dumps(outline,separators=(',',':')).encode('ascii')
    return {'sha256':hashlib.sha256(data).hexdigest(),
            'contours':len(outline), 'points':sum(map(len,outline))}


def baseline_outlines(source_fonts, weight):
    """Compare against every source face at the requested weight."""
    result={char:[] for char in CHECKED_CHARACTERS}
    for label, variable in source_fonts.items():
        instance=instantiateVariableFont(variable, {'wght':weight}, inplace=False)
        for char in CHECKED_CHARACTERS:
            result[char].append((label, normalized_outline(instance,char)))
            if instance['post'].italicAngle:
                result[char].append((label+' deskewed',
                                    normalized_outline(instance,char,deskew=True)))
        instance.close()
    return result


class ScanlinePen(BasePen):
    """Measure actual filled TTF outlines without depending on the builder."""
    def __init__(self, glyph_set, shear=0):
        super().__init__(glyph_set)
        self.shear=shear; self.segments=[]; self.first=None; self.point=None

    def converted(self, point):
        x,y=point
        return float(x)-self.shear*float(y),float(y)

    def _moveTo(self, point):
        self.first=self.point=self.converted(point)

    def _lineTo(self, point):
        point=self.converted(point)
        self.segments.append((self.point,point));self.point=point

    def _qCurveToOne(self, control, end):
        start=self.point; control=self.converted(control);end=self.converted(end)
        previous=start
        # TrueType curves are evaluated densely, rather than inferred from
        # advance widths or a shared nominal stroke value in the builder.
        for step in range(1,129):
            t=step/128;u=1-t
            point=(u*u*start[0]+2*u*t*control[0]+t*t*end[0],
                   u*u*start[1]+2*u*t*control[1]+t*t*end[1])
            self.segments.append((previous,point));previous=point
        self.point=end

    def _curveToOne(self, first, second, end):
        start=self.point;first=self.converted(first);second=self.converted(second);end=self.converted(end)
        previous=start
        for step in range(1,129):
            t=step/128;u=1-t
            point=(u*u*u*start[0]+3*u*u*t*first[0]+3*u*t*t*second[0]+t*t*t*end[0],
                   u*u*u*start[1]+3*u*u*t*first[1]+3*u*t*t*second[1]+t*t*t*end[1])
            self.segments.append((previous,point));previous=point
        self.point=end

    def _closePath(self):
        if self.point!=self.first:self.segments.append((self.point,self.first))
        self.first=self.point=None

    def _endPath(self):
        self.first=self.point=None

    def intersections(self, y):
        xs=[]
        for (x1,y1),(x2,y2) in self.segments:
            if (y1<=y<y2) or (y2<=y<y1):
                xs.append(x1+(y-y1)*(x2-x1)/(y2-y1))
        return sorted(xs)

    def vertical_intersections(self,x):
        ys=[]
        for (x1,y1),(x2,y2) in self.segments:
            if (x1<=x<x2) or (x2<=x<x1):
                ys.append(y1+(x-x1)*(y2-y1)/(x2-x1))
        return sorted(ys)


def stroke_checks(font, record):
    glyph_set=font.getGlyphSet()
    shear=math.tan(math.radians(-font['post'].italicAngle))
    pens={}
    for char in '01':
        pen=ScanlinePen(glyph_set,shear)
        glyph_set[font.getBestCmap()[ord(char)]].draw(pen)
        pens[char]=pen
    scans=[];target=EXPECTED_STROKES[record['weight']]
    for zero_height,one_height in zip((340,350,360),(250,260,270)):
        zero=pens['0'].intersections(zero_height);one=pens['1'].intersections(one_height)
        assert len(zero)==4 and len(one)==2, (record['name'],'unexpected digit stem intersections',zero_height,one_height,zero,one)
        widths=(zero[1]-zero[0],zero[3]-zero[2],one[1]-one[0])
        assert max(widths)-min(widths)<=STEM_TOLERANCE, (record['name'],'unequal zero/one vertical stems',zero_height,one_height,widths)
        assert all(abs(width-target)<=STEM_TOLERANCE for width in widths), (record['name'],'digit stems deviate from approved weight',zero_height,one_height,target,widths)
        scans.append({'zeroY':zero_height,'oneY':one_height,'zeroLeft':round(widths[0],3),'zeroRight':round(widths[1],3),'one':round(widths[2],3)})
    return {'method':'filled outline scan-line intersections after deskew; 128 samples per Bezier',
            'targetStem':target,'toleranceUnits':STEM_TOLERANCE,'scans':scans}


def one_entry_checks(font,record):
    """Measure a broad classic diagonal entry with a full vertical terminal.

    Find real outline segments after deskew, independently of the builder.
    The old short diagonal's perpendicular cut is slanted. The new classic
    entry must have a full-height vertical cut far enough left of the stem.
    """
    glyph_set=font.getGlyphSet()
    shear=math.tan(math.radians(-font['post'].italicAngle))
    pen=ScanlinePen(glyph_set,shear)
    glyph_set[font.getBestCmap()[ord('1')]].draw(pen)
    stem=pen.intersections(250)
    assert len(stem)==2, (record['name'],'unmeasurable one straight stem',stem)
    minimum_span=EXPECTED_STROKES[record['weight']]*ONE_ENTRY_TERMINAL_MIN_STROKE_RATIO
    terminals=[]
    for (x1,y1),(x2,y2) in pen.segments:
        # Exclude the foot and the main stem; integer-rounded oblique points
        # need a small X tolerance once the declared shear is removed.
        if abs(x1-x2)<=1.5 and abs(y2-y1)>=minimum_span and 350<(y1+y2)/2<650:
            projection=stem[0]-(x1+x2)/2
            if projection>=ONE_ENTRY_MIN_PROJECTION:
                terminals.append({'leftProjection':round(projection,3),
                                  'verticalSpan':round(abs(y2-y1),3),
                                  'bottom':round(min(y1,y2),3),'top':round(max(y1,y2),3)})
    assert terminals, (record['name'],'one diagonal entry lacks a broad full vertical terminal',minimum_span,ONE_ENTRY_MIN_PROJECTION)
    terminal=max(terminals,key=lambda item:item['leftProjection'])
    projection=terminal['leftProjection']
    assert projection>=ONE_ENTRY_MIN_PROJECTION, (
        record['name'],'one diagonal entry remains too short',projection,ONE_ENTRY_MIN_PROJECTION)
    return {'method':'actual deskewed outline terminal segment relative to straight stem scanned at y250',
            'stemScanHeight':250,'verticalTerminal':terminal,
            'minimumTerminalSpan':round(minimum_span,3),'minimumLeftProjection':ONE_ENTRY_MIN_PROJECTION}


def three_level_head_checks(font,record):
    """Measure the finished three's level top bar and its horizontal weight."""
    glyph_set=font.getGlyphSet();name=font.getBestCmap()[ord('3')]
    shear=math.tan(math.radians(-font['post'].italicAngle))
    pen=ScanlinePen(glyph_set,shear);glyph_set[name].draw(pen)
    points=[point for segment in pen.segments for point in segment]
    ink_width=max(x for x,y in points)-min(x for x,y in points)
    minimum_length=ink_width*THREE_TOP_MIN_WIDTH_RATIO
    edges=[]
    for (x1,y1),(x2,y2) in pen.segments:
        if abs(y1-THREE_TOP_HEIGHT)<=1 and abs(y2-THREE_TOP_HEIGHT)<=1 and abs(x2-x1)>=minimum_length:
            edges.append((min(x1,x2),max(x1,x2),y1,y2))
    assert edges, (record['name'],'three lacks a level full-width top bar at cap height',THREE_TOP_HEIGHT,minimum_length)
    left,right,y1,y2=max(edges,key=lambda edge:edge[1]-edge[0])
    scan_x=left+(right-left)*.25
    ys=pen.vertical_intersections(scan_x)
    assert len(ys)>=2, (record['name'],'unmeasurable three top-bar thickness',scan_x,ys)
    thickness=ys[-1]-ys[-2]
    expected=EXPECTED_STROKES[record['weight']]*THREE_HORIZONTAL_STROKE_RATIO
    assert abs(thickness-expected)<=STEM_TOLERANCE, (
        record['name'],'three top bar has inconsistent horizontal weight',thickness,expected)
    return {'method':'actual deskewed outline top-edge segment and vertical filled-ink section at its left quarter',
            'capHeight':THREE_TOP_HEIGHT,'topEdgeLength':round(right-left,3),
            'minimumTopEdgeLength':round(minimum_length,3),'topEdgeY':[y1,y2],
            'measuredBarThickness':round(thickness,3),'expectedBarThickness':round(expected,3),
            'thicknessToleranceUnits':STEM_TOLERANCE}


def translated_outline(font, char=None, *, glyph_name=None, deskew=False):
    """Canonical outline in font units, allowing translation but no scaling."""
    name=glyph_name or font.getBestCmap()[ord(char)]
    coordinates,ends,flags=font['glyf'][name].getCoordinates(font['glyf'])
    shear=math.tan(math.radians(-font['post'].italicAngle)) if deskew else 0
    points=[(float(x)-shear*float(y),float(y)) for x,y in coordinates]
    xmin=min(x for x,y in points);ymin=min(y for x,y in points)
    normalized=[(round(x-xmin,6),round(y-ymin,6),bool(flag&1))for(x,y),flag in zip(points,flags)]
    contours=[];start=0
    for end in ends:
        contours.append(canonical_contour(normalized[start:end+1]));start=end+1
    return tuple(sorted(contours))


def check_design(font, web, record, baseline):
    outlines={char:normalized_outline(font,char) for char in CHECKED_CHARACTERS}
    fingerprints={}
    for char,outline in outlines.items():
        variants=[outline]
        if record['style']=='italic':variants.append(normalized_outline(font,char,deskew=True))
        for label,source_outline in baseline[char]:
            assert not any(outlines_equal(candidate,source_outline)for candidate in variants), (
                record['name'],char,'matches unchanged source outline',label)
        assert outlines_equal(outline,normalized_outline(web,char)), (
            record['name'],char,'TTF/WOFF2 outline mismatch')
        fingerprints[char]=outline_fingerprint(outline)
    assert len(outlines['0'])==2, (
        record['name'],'zero must have exactly outer and inner contours; no dot')
    pairs=[];cmap=font.getBestCmap()
    for latin,cyrillic in SCRIPT_PAIRS:
        assert outlines_equal(normalized_outline(font,latin),normalized_outline(font,cyrillic)), (
            record['name'],latin,cyrillic,'Latin/Cyrillic geometry mismatch')
        assert font['hmtx'][cmap[ord(latin)]]==font['hmtx'][cmap[ord(cyrillic)]], (
            record['name'],latin,cyrillic,'Latin/Cyrillic metrics mismatch')
        pairs.append(latin+'/'+cyrillic)
    refinements=[]
    for latin,cyrillic in REFINEMENT_PAIRS:
        assert font['hmtx'][cmap[ord(latin)]][0]==font['hmtx'][cmap[ord(cyrillic)]][0], (
            record['name'],latin,cyrillic,'shared refinement advance mismatch')
        # Outline-derived italic LSBs may differ slightly between these source
        # drawings; the common advance governs their matching text rhythm.
        # Both refinements have already been checked against their own source
        # geometry above; source counter differences are deliberately retained.
        refinements.append(latin+'/'+cyrillic)
    return {'outlineProvenance':{'independentDigits':len(DIGITS),
                                'refinedOnestLetters':len(REFINED_LETTERS),
                                'unchangedSourceMatchesInCheckedSet':0,
                                'letterBase':'Onest with shared 0.96 horizontal scale',
                                'fingerprints':fingerprints},
            'zeroContours':2,'consistentScriptPairs':pairs,'sharedRefinementPairs':refinements,
            'digitStemConsistency':stroke_checks(font,record)}


def vertical_digit_checks(font, record):
    """Check actual quadratic extrema, rather than control-point boxes."""
    glyph_set=font.getGlyphSet();cmap=font.getBestCmap();measurements={}
    for char in DIGITS:
        pen=BoundsPen(glyph_set);glyph_set[cmap[ord(char)]].draw(pen)
        assert pen.bounds, (record['name'],char,'empty numeral bounds')
        _,bottom,_,top=pen.bounds;expected=DIGIT_VERTICAL_BOUNDS[char]
        assert abs(bottom-expected[0])<=VERTICAL_TOLERANCE, (
            record['name'],char,'numeral baseline drift',bottom,expected[0])
        assert abs(top-expected[1])<=VERTICAL_TOLERANCE, (
            record['name'],char,'numeral top drift',top,expected[1])
        measurements[char]={'bottom':round(bottom,3),'top':round(top,3),
                            'expectedBottom':expected[0],'expectedTop':expected[1]}
    return {'method':'actual quadratic outline extrema in font units',
            'toleranceUnits':VERTICAL_TOLERANCE,'digits':measurements}


def regular_approved_width_checks(font,record):
    """Measure current ink against accepted 0.600 widths; no old fonts loaded."""
    assert record['weight']==400 and record['style']=='normal'
    glyph_set=font.getGlyphSet();cmap=font.getBestCmap();measurements={}
    for char in DIGITS:
        pen=BoundsPen(glyph_set);glyph_set[cmap[ord(char)]].draw(pen)
        assert pen.bounds, (record['name'],char,'unmeasurable numeral width')
        left,_,right,_=pen.bounds;width=right-left
        expected=APPROVED_REGULAR_INK_WIDTHS[char]
        assert abs(width-expected)<=REGULAR_WIDTH_TOLERANCE, (
            record['name'],char,'ink width differs from accepted 0.600 drawing',width,expected)
        measurements[char]={'actualInkWidth':round(width,3),'acceptedInkWidth':expected,
                            'deviationFromAccepted':round(width-expected,3)}
    return {'method':'actual quadratic outline X extrema; Regular upright only',
            'acceptedVersion':'0.600','toleranceUnits':REGULAR_WIDTH_TOLERANCE,
            'scope':'current accepted widths; historical midpoint comparison is not performed',
            'digits':measurements}


def letter_scale_baseline(variable,weight):
    """Measure the licensed Onest source without importing builder transforms."""
    source=instantiateVariableFont(variable,{'wght':weight},inplace=False)
    glyph_set=source.getGlyphSet();cmap=source.getBestCmap();measurements={}
    for char in LETTER_SCALE_PROBES:
        name=cmap[ord(char)];pen=BoundsPen(glyph_set);glyph_set[name].draw(pen)
        assert pen.bounds, (char,'empty source letter probe')
        measurements[char]={'bounds':pen.bounds,'advance':source['hmtx'][name][0]}
    source.close()
    return measurements


def letter_scale_checks(font,record,baseline):
    """Verify 96% letter widths and retained source vertical proportions."""
    glyph_set=font.getGlyphSet();cmap=font.getBestCmap();measurements={}
    shear=math.tan(math.radians(-font['post'].italicAngle))
    for char,source in baseline.items():
        name=cmap[ord(char)];pen=BoundsPen(glyph_set)
        glyph_set[name].draw(TransformPen(pen,(1,0,-shear,1,0,0)))
        assert pen.bounds, (record['name'],char,'empty letter scale probe')
        left,bottom,right,top=pen.bounds;source_left,source_bottom,source_right,source_top=source['bounds']
        width=right-left;expected_width=(source_right-source_left)*LETTER_SCALE
        assert abs(width-expected_width)<=LETTER_SCALE_TOLERANCE, (
            record['name'],char,'source letter width no longer follows 96% scale',width,expected_width)
        assert max(abs(bottom-source_bottom),abs(top-source_top))<=LETTER_SCALE_TOLERANCE, (
            record['name'],char,'source vertical letter proportions changed',bottom,top,source_bottom,source_top)
        advance=font['hmtx'][name][0];expected_advance=round(source['advance']*LETTER_SCALE)
        assert advance==expected_advance, (
            record['name'],char,'source letter advance no longer follows 96% scale',advance,expected_advance)
        measurements[char]={'actualInkWidth':round(width,3),'expectedInkWidth':round(expected_width,3),
                            'bottom':round(bottom,3),'sourceBottom':round(source_bottom,3),
                            'top':round(top,3),'sourceTop':round(source_top,3),
                            'advance':advance,'expectedAdvance':expected_advance}
    return {'method':'deskewed actual quadratic bounds and advances against independently instantiated Onest',
            'horizontalScale':LETTER_SCALE,'toleranceUnits':LETTER_SCALE_TOLERANCE,
            'probes':measurements}


def main():
    manifest=json.loads((FONTS/'manifest.json').read_text(encoding='utf-8'))
    assert manifest['version']=='0.600', ('unexpected design version',manifest['version'])
    assert len(manifest['faces']) == 12
    recorded_files={r[k]['file']:r[k]['sha256'] for r in manifest['faces'] for k in ('ttf','woff2')}
    assert recorded_files==APPROVED_0600_SHA256, 'manifest differs from the frozen accepted 0.600 binaries'
    geometry=manifest['authoredGeometry']
    assert hashlib.sha256((ROOT/geometry['file']).read_bytes()).hexdigest()==geometry['sha256'], 'authored geometry source hash mismatch'
    assert {(r['weight'],r['style']) for r in manifest['faces']} == {
        (weight,style) for weight in (100,300,400,500,600,700)
        for style in ('normal','italic')}
    source_fonts={}
    for label,filename in SOURCE_FILES.items():
        path=SOURCES/filename
        assert hashlib.sha256(path.read_bytes()).hexdigest() == manifest['sources'][filename], (
            filename,'source hash mismatch')
        source_fonts[label]=TTFont(path)
    baselines={};letter_baselines={}
    report=[]; family_cmap=None; line_metrics=None; ps_names=set(); outline_hashes={};regular_widths=None
    for record in manifest['faces']:
        path=FONTS/record['ttf']['file']; web_path=FONTS/record['woff2']['file']
        font=TTFont(path, checkChecksums=2); web=TTFont(web_path)
        cmap=font.getBestCmap()
        assert not set(REQUIRED)-set(map(chr,cmap)), (path.name,'missing characters',set(REQUIRED)-set(map(chr,cmap)))
        assert font['name'].getDebugName(16) == 'Gavia'
        assert web['name'].getDebugName(16) == 'Gavia'
        assert font['name'].getDebugName(5)=='Version 0.600'
        assert web['name'].getDebugName(5)=='Version 0.600'
        assert font['OS/2'].usWeightClass == record['weight']
        italic=record['style']=='italic'
        assert bool(font['OS/2'].fsSelection & 1) == italic
        assert bool(font['head'].macStyle & 2) == italic
        assert font['post'].italicAngle == (-ITALIC_ANGLE if italic else 0)
        assert font['post'].isFixedPitch == 0
        assert font['hmtx'][cmap[ord('H')]][0] != font['hmtx'][cmap[ord('i')]][0]
        assert checksum(path) == 0xB1B0AFBA, (path.name,'invalid checksum')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == record['ttf']['sha256']
        assert hashlib.sha256(web_path.read_bytes()).hexdigest() == record['woff2']['sha256']
        assert hashlib.sha256(path.read_bytes()).hexdigest()==APPROVED_0600_SHA256[path.name]
        assert hashlib.sha256(web_path.read_bytes()).hexdigest()==APPROVED_0600_SHA256[web_path.name]
        ps=font['name'].getDebugName(6); assert ps not in ps_names; ps_names.add(ps)
        current_metrics=(font['hhea'].ascent,font['hhea'].descent,font['hhea'].lineGap,font['OS/2'].usWinAscent,font['OS/2'].usWinDescent)
        if line_metrics is None: line_metrics=current_metrics
        assert current_metrics == line_metrics
        if family_cmap is None: family_cmap=set(cmap)
        assert set(cmap) == family_cmap == set(web.getBestCmap())
        for name in font.getGlyphOrder():
            glyph=font['glyf'][name]
            assert name in font['hmtx'].metrics
            glyph.getCoordinates(font['glyf'])  # Resolve every component, including nested accents.
            if hasattr(glyph,'program'): assert not glyph.program.getBytecode()
            if hasattr(glyph,'yMax'): assert glyph.yMax <= font['OS/2'].usWinAscent
            if hasattr(glyph,'yMin'): assert -glyph.yMin <= font['OS/2'].usWinDescent
        for text in TEXTS:
            infos,positions=shape(path,text)
            assert infos and all(info.codepoint != 0 for info in infos), (path.name,text,'notdef in shaping')
        default_infos,defaults=shape(path,DIGITS,{'kern':False})
        tab_infos,tabs=shape(path,DIGITS,{'tnum':True,'kern':False})
        prop_infos,props=shape(path,DIGITS,{'pnum':True,'kern':False})
        assert len(default_infos) == len(tab_infos) == len(prop_infos) == len(DIGITS)
        assert [p.x_advance for p in defaults] == [600]*10
        assert [p.x_advance for p in tabs] == [600]*10
        assert len(set(p.x_advance for p in props)) > 1
        # All numeric modes retain the same accepted design, including GSUB
        # alternates; no alternate may silently resize the numeral drawing.
        # Undo the shared shear before comparison. pnum is the same geometry
        # translated into a different advance, with no contour rescaling.
        for char,default,tab,prop in zip(DIGITS,default_infos,tab_infos,prop_infos):
            expected=normalized_outline(font,char,deskew=italic)
            for info in (default,tab,prop):
                name=font.getGlyphName(info.codepoint)
                actual=normalized_outline(font,glyph_name=name,deskew=italic)
                assert outlines_equal(expected,actual), (
                    record['name'],char,name,'numeric alternate outline mismatch')
                assert outlines_equal(translated_outline(font,char,deskew=italic),
                                      translated_outline(font,glyph_name=name,deskew=italic),1.5), (
                    record['name'],char,name,'numeric alternate was resized instead of translated')
                assert name in web.getGlyphOrder()
                assert outlines_equal(
                    actual,normalized_outline(web,glyph_name=name,deskew=italic)), (
                        record['name'],char,name,'numeric TTF/WOFF2 outline mismatch')
        if record['weight'] not in baselines:
            baselines[record['weight']]=baseline_outlines(source_fonts,record['weight'])
            letter_baselines[record['weight']]=letter_scale_baseline(source_fonts['Onest'],record['weight'])
        design_checks=check_design(font,web,record,baselines[record['weight']])
        design_checks['extendedOneEntry']=one_entry_checks(font,record)
        design_checks['threeLevelTopBar']=three_level_head_checks(font,record)
        design_checks['digitVerticalAlignment']=vertical_digit_checks(font,record)
        if record['weight']==400 and record['style']=='normal':
            regular_widths=regular_approved_width_checks(font,record)
            design_checks['regularApprovedInkWidths']=regular_widths
        design_checks['sourceLetterScale']=letter_scale_checks(font,record,letter_baselines[record['weight']])
        design_checks['approvedReleaseIntegrity']={'acceptedVersion':'0.600',
            'ttfSha256':APPROVED_0600_SHA256[path.name],
            'woff2Sha256':APPROVED_0600_SHA256[web_path.name],
            'scope':'complete accepted file content, including all glyphs, metrics and layout tables'}
        glyph=font['glyf'][cmap[ord('H')]]
        coordinates=glyph.getCoordinates(font['glyf'])[0]
        outline_hashes[(record['weight'],record['style'])]=hashlib.sha256(repr(list(coordinates)).encode()).hexdigest()
        report.append({'face':record['name'],'cmapCharacters':len(cmap),'glyphs':len(font.getGlyphOrder()),
                       'ttfBytes':path.stat().st_size,'woff2Bytes':web_path.stat().st_size,
                       'defaultDigits':[p.x_advance for p in defaults], 'proportionalDigits':[p.x_advance for p in props],
                       'designChecks':design_checks,
                       'checks':'metadata, checksums, TTF/WOFF2 roundtrip, coverage, all glyph components, clipping, HarfBuzz shaping, tnum/pnum, digit provenance, refined letter outlines, measured zero/one stems, extended one entry, level three top bar, unchanged pnum geometry, actual numeral vertical bounds, complete files match accepted 0.600 SHA; source letter widths at 96%; no historical cross-version comparison'})
        print('PASS',record['name'],len(cmap),'characters',len(font.getGlyphOrder()),'glyphs; 10 independent numerals, 5 refined letters, consistent zero/one stems, extended one entry, level three top bar, aligned numeral bounds, accepted 0.600 binaries preserved; source letter scale verified',flush=True)
        font.close(); web.close()
    for source in source_fonts.values(): source.close()
    for style in ('normal','italic'):
        assert len({v for (w,s),v in outline_hashes.items() if s==style}) == 6
    result={'status':'passed','version':manifest['version'],'verificationMode':'standalone accepted Gavia 0.600','historicalCrossVersionComparisons':{'performed':False,'reason':'Only current accepted files and licensed source fonts are loaded; earlier Gavia specimens are not required.'},'faces':12,'commonLineMetrics':line_metrics,'requiredCharacters':len(set(REQUIRED)),
            'fontToolsRoundtrip':True,'harfBuzzShaping':True,'facesDetailed':report,
            'designChecks':{'outlineProvenance':{'faces':12,'independentDigitsPerFace':len(DIGITS),
                                               'refinedOnestLettersPerFace':len(REFINED_LETTERS),
                                               'checkedOutlines':12*len(CHECKED_CHARACTERS),
                                               'unchangedSourceMatchesInCheckedSet':0,
                                               'letterBase':'Licensed Onest-derived family; shared 0.96 horizontal scaling; selective a/e/l refinements'},
                            'normalization':'decomposed contours, independent XY bounds, canonical start/direction/order, raw and deskewed comparisons',
                            'normalizedTolerance':NORMALIZED_TOLERANCE,
                            'zeroContours':2,'numericAlternateGeometry':'translation only; tolerance 1.5 font units after deskew',
                            'digitStemConsistency':'zero left/right stems at y340/350/360 and one straight stem at y250/260/270 in every face',
                            'extendedOneEntry':{'minimumLeftProjection':ONE_ENTRY_MIN_PROJECTION,'minimumTerminalStrokeRatio':ONE_ENTRY_TERMINAL_MIN_STROKE_RATIO,'comparison':'real vertical entry terminal against straight stem scanned at y250'},
                            'threeLevelTopBar':{'capHeight':THREE_TOP_HEIGHT,'minimumTopEdgeWidthRatio':THREE_TOP_MIN_WIDTH_RATIO,'horizontalStrokeRatio':THREE_HORIZONTAL_STROKE_RATIO},
                            'regularApprovedInkWidths':regular_widths,
                            'digitVerticalAlignment':{'expectedBounds':DIGIT_VERTICAL_BOUNDS,'toleranceUnits':VERTICAL_TOLERANCE},
                            'sourceLetterScale':{'horizontalScale':LETTER_SCALE,'probes':list(LETTER_SCALE_PROBES),'toleranceUnits':LETTER_SCALE_TOLERANCE},
                            'approvedReleaseIntegrity':{'acceptedVersion':'0.600','files':24,'method':'frozen accepted binary SHA256 independent of the mutable manifest'},
                            'consistentScriptPairs':[a+'/'+b for a,b in SCRIPT_PAIRS],
                            'sharedRefinementPairs':[a+'/'+b for a,b in REFINEMENT_PAIRS],
                            'scriptPairNote':'a/а and e/е retain subtle original Onest counter differences and matching advances; italic LSBs follow each outline'},
            'limitations':'Optical quality, hand-tuned italic spacing and native app rendering still need human review.'}
    (FONTS/'qa-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('All 12 faces passed font QA: 120 independent numerals, 60 refined letters, measured stem consistency, extended one entry, level three top bar and vertical alignment; accepted 0.600 binaries preserved; source letter scale verified.',flush=True)

if __name__=='__main__': main()
