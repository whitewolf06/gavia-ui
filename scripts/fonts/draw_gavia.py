"""Gavia 0.6: stable letters and numerals, with a flat-headed classic three.

The regular ink widths sit halfway between versions 0.1 and 0.4. Their forms
interpret the first specimen, without importing its contours. Proportions are
set BEFORE stroke expansion; pnum changes spacing, never outline weight.
"""
from __future__ import annotations
import math
import pathops
from fontTools.svgLib.path import parse_path
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

STROKES = {100:40, 300:69, 400:84, 500:102, 600:120, 700:137}
ITALIC_ANGLE = 7
LETTER_SCALE = .96
REFINED_LETTERS = 'aаeеl'
# (natural ink width, optical bottom, optical top, authored centre-line path)
# Width targets are rounded midpoints of the actual Regular 0.1/0.4 ink widths.
DESIGNS = {
 '0': (432,-8,715,'M 207 700 C 348 700 414 590 414 442 L 414 258 C 414 112 330 0 207 0 C 84 0 0 112 0 258 L 0 442 C 0 590 74 700 207 700 Z'),
 '1': (418,0,707,'Independent filled outline; see classic_one'),
 '2': (434,0,715,'M 0 554 C 6 642 76 700 189 700 C 320 700 402 627 402 521 C 402 443 357 381 291 309 L 18 33 Q 0 16 0 0 L 422 0'),
 '3': (430,-8,707,'Independent filled outline; see classic_three'),
 '4': (413,0,707,'Independent filled outline; see classic_four'),
 '5': (430,-8,707,'M 414 700 L 45 700 L 45 387 C 93 411 154 428 226 428 C 350 428 423 335 423 219 C 423 88 343 0 214 0 C 108 0 42 40 0 110'),
 '6': (448,-8,707,'Independent loop and filled diagonal; see classic_six'),
 '7': (423,0,707,'Independent filled outline; see classic_seven'),
 '8': (446,-8,715,'M 207 373 C 321 373 391 442 391 530 C 391 639 328 700 207 700 C 86 700 23 639 23 530 C 23 442 93 373 207 373 C 340 373 414 292 414 196 C 414 80 336 0 207 0 C 78 0 0 80 0 196 C 0 292 78 373 207 373 Z'),
 '9': (448,0,715,'Independent rotated loop and filled diagonal; see classic_nine'),
}


def refine_letters(font):
    """Small non-affine terminal changes; retain the mature source rhythm."""
    cmap=font.getBestCmap()
    for char in 'aа':
        coordinates=font['glyf'][cmap[ord(char)]].coordinates
        for index,delta in ((18,2),(19,4),(20,-4),(21,-2)):
            x,y=coordinates[index];coordinates[index]=(x,y+delta)
    for char in 'eе':
        coordinates=font['glyf'][cmap[ord(char)]].coordinates
        for index,delta in ((24,-4),(25,-8),(26,-8),(27,-4)):
            x,y=coordinates[index];coordinates[index]=(x,y+delta)
    name=cmap[ord('l')];glyph=font['glyf'][name]
    left=min(x for x,y in glyph.coordinates);right=max(x for x,y in glyph.coordinates)
    top=max(y for x,y in glyph.coordinates)
    pen=TTGlyphPen(None)
    pen.moveTo((left,0));pen.lineTo((left,top));pen.lineTo((right,top))
    pen.lineTo((right,25));pen.lineTo((right+18,25));pen.lineTo((right+18,0));pen.closePath()
    font['glyf'][name]=pen.glyph()
    advance,lsb=font['hmtx'][name];font['hmtx'][name]=(advance+18,lsb)


def closed_polygon(points):
    path=pathops.Path();pen=path.getPen()
    pen.moveTo(points[0])
    for point in points[1:]:pen.lineTo(point)
    pen.closePath()
    path.simplify(clockwise=True)
    return path


def classic_one(stroke):
    """A long diagonal entry with a vertical cut and a full-width straight foot."""
    horizontal=stroke*.92
    right=370;left=right-stroke;top=707
    entry_x=85;entry_y=592;head_x=left-16
    slope=(top-entry_y)/(head_x-entry_x)
    # A vertical cut exposes the whole entry, rather than a short bevel.
    # Parallel diagonal edges retain the common perpendicular stem thickness.
    offset=stroke*math.sqrt(1+slope*slope)
    lower_entry=entry_y-offset
    lower_join=top+slope*(left-head_x)-offset
    return closed_polygon([
        (85,0),(85,horizontal),(left,horizontal),(left,lower_join),
        (entry_x,lower_entry),(entry_x,entry_y),(head_x,top),(right,top),
        (right,horizontal),(503,horizontal),(503,0)])


def classic_three(stroke):
    """A level long top bar, a diagonal waist, and a calm open lower bowl."""
    horizontal=stroke*.92
    width=430;bar_left=20;bar_right=407;top=707
    bar_bottom=top-horizontal;shoulder=445;diagonal_end=244
    slope=(bar_right-diagonal_end)/(bar_bottom-shoulder)
    # The diagonal is optically a little lighter, with parallel straight edges.
    band=stroke*.94*math.sqrt(1+slope*slope)
    waist_left=diagonal_end-band
    inner_bottom=-8+horizontal;inner_top=shoulder-horizontal
    inner_right=width-stroke;k=.55
    path=pathops.Path();pen=path.getPen()
    pen.moveTo((bar_left,top))
    pen.lineTo((bar_right,top));pen.lineTo((bar_right,bar_bottom))
    pen.lineTo((diagonal_end,shoulder))
    pen.curveTo((355,shoulder),(width,354),(width,236))
    pen.lineTo((width,200))
    pen.curveTo((width,66),(337,-8),(215,-8))
    pen.curveTo((91,-8),(0,67),(0,158))
    pen.lineTo((0,190));pen.lineTo((stroke,190));pen.lineTo((stroke,158))
    pen.curveTo((stroke,158-k*(158-inner_bottom)),
                (215-k*(215-stroke),inner_bottom),(215,inner_bottom))
    pen.curveTo((215+k*(inner_right-215),inner_bottom),
                (inner_right,200-k*(200-inner_bottom)),(inner_right,200))
    pen.lineTo((inner_right,236))
    pen.curveTo((inner_right,236+k*(inner_top-236)),
                (215+k*(inner_right-215),inner_top),(215,inner_top))
    pen.lineTo((waist_left,inner_top));pen.lineTo((waist_left,shoulder))
    pen.lineTo((bar_right-band,bar_bottom))
    pen.lineTo((bar_left,bar_bottom));pen.closePath()
    path.simplify(clockwise=True)
    return path


def classic_four(stroke):
    """Open four with a short right upright and a quieter, lower crossbar."""
    width=413;horizontal=stroke*.92;stem_left=width-stroke
    cross_low=210-horizontal/2;cross_high=210+horizontal/2
    diagonal_left=width*.59;corner_y=285
    slope=(707-corner_y)/diagonal_left
    diagonal_right=diagonal_left+stroke*math.sqrt(1+1/(slope*slope))
    inner_y=max(cross_high+12,707+slope*(stroke-diagonal_right))
    return closed_polygon([
        (stem_left,0),(stem_left,cross_low),(0,cross_low),(0,corner_y),
        (diagonal_left,707),(diagonal_right,707),(stroke,inner_y),
        (stroke,cross_high),(stem_left,cross_high),(stem_left,550),
        (width,550),(width,0)])


def classic_seven(stroke):
    """Flat baseline, straight top, and a restrained left-hand entry bracket."""
    width=423;horizontal=stroke*.92;bar_bottom=707-horizontal
    foot_left=105
    diagonal_width=stroke
    for _ in range(8):
        slope=(width-diagonal_width-foot_left)/bar_bottom
        diagonal_width=stroke*math.sqrt(1+slope*slope)
    return closed_polygon([
        (foot_left,0),(width-diagonal_width,bar_bottom),
        (stroke,bar_bottom),(stroke,bar_bottom-58),(0,bar_bottom-58),
        (0,707),(width,707),(width,bar_bottom),
        (foot_left+diagonal_width,0)])


def expanded_skeleton(path,scale_x,scale_y,left,low,stroke):
    transformed=path.transform(scale_x,0,0,scale_y,-left*scale_x,-low*scale_y)
    transformed=transformed.transform(1,0,0,1/.92,0,0)
    transformed.stroke(stroke,pathops.LineCap.BUTT_CAP,pathops.LineJoin.ROUND_JOIN,2)
    transformed=transformed.transform(1,0,0,.92,0,0)
    transformed.convertConicsToQuads(.25)
    return transformed


def calibrated_skeleton(svg,width,height,stroke):
    """Fit the centre-line until its actual expanded bounds reach the target."""
    skeleton=pathops.Path();parse_path(svg,skeleton.getPen())
    left,low,right,high=skeleton.bounds
    scale_x=(width-stroke)/(right-left)
    scale_y=(height-stroke*.92)/(high-low)
    # Bounds at diagonal terminals depend on both proportions. Alternate the
    # two independent solves; do not stretch the completed outline afterward.
    for _ in range(6):
        lower=.001;upper=(width+2*stroke)/(right-left)
        for _ in range(18):
            middle=(lower+upper)/2
            candidate=expanded_skeleton(skeleton,middle,scale_y,left,low,stroke)
            x0,_,x1,_=candidate.bounds
            if x1-x0<width:lower=middle
            else:upper=middle
        scale_x=(lower+upper)/2
        lower=.001;upper=(height+2*stroke)/(high-low)
        for _ in range(18):
            middle=(lower+upper)/2
            candidate=expanded_skeleton(skeleton,scale_x,middle,left,low,stroke)
            _,y0,_,y1=candidate.bounds
            if y1-y0<height:lower=middle
            else:upper=middle
        scale_y=(lower+upper)/2
    path=expanded_skeleton(skeleton,scale_x,scale_y,left,low,stroke)
    path.simplify(clockwise=True)
    return path


def classic_six(stroke):
    """Compact lower loop and a straight diagonal ending in a flat cap."""
    width=448;horizontal=stroke*.92
    left=stroke/2;right=width-stroke/2
    bottom=-8+horizontal/2;top=450-horizontal/2
    center_x=width/2;center_y=(top+bottom)/2
    rx=(right-left)/2;ry=(top-bottom)/2;k=.56
    loop=pathops.Path();pen=loop.getPen()
    pen.moveTo((center_x,bottom))
    pen.curveTo((center_x+k*rx,bottom),(right,center_y-k*ry),(right,center_y))
    pen.curveTo((right,center_y+k*ry),(center_x+k*rx,top),(center_x,top))
    pen.curveTo((center_x-k*rx,top),(left,center_y+k*ry),(left,center_y))
    pen.curveTo((left,center_y-k*ry),(center_x-k*rx,bottom),(center_x,bottom))
    pen.closePath()
    centerline=loop
    loop=expanded_skeleton(centerline,1,1,0,0,stroke)
    counter=pathops.op(centerline,loop,pathops.PathOp.DIFFERENCE)
    start_x=stroke*.7;end_x=width*.62;start_y=250
    slope=(end_x-start_x)/(707-start_y)
    band=stroke/2*math.sqrt(1+slope*slope)
    diagonal=closed_polygon([
        (start_x-band,start_y),(end_x-band,707),
        (end_x+band,707),(start_x+band,start_y)])
    # Keep the loop's smooth inner oval when joining the diagonal shoulder.
    # A plain union leaves the diagonal's endpoint visible inside the counter.
    joined=pathops.op(loop,diagonal,pathops.PathOp.UNION)
    return pathops.op(joined,counter,pathops.PathOp.DIFFERENCE)


def classic_nine(stroke):
    return classic_six(stroke).transform(-1,0,0,-1,448,707)


def draw_glyph(char,weight,italic=False,proportional_digit=False):
    ink_width,bottom,top,svg=DESIGNS[char]
    stroke=STROKES[weight]
    filled={'1':classic_one,'3':classic_three,'4':classic_four,'6':classic_six,
            '7':classic_seven,'9':classic_nine}
    if char in filled:path=filled[char](stroke)
    else:path=calibrated_skeleton(svg,ink_width,top-bottom,stroke)
    left,low,right,high=path.bounds
    advance=600
    if proportional_digit:advance=round(right-left)+110
    xshift=(advance-left-right)/2;yshift=bottom-low
    shear=math.tan(math.radians(ITALIC_ANGLE)) if italic else 0
    pen=TTGlyphPen(None);quadratic=Cu2QuPen(pen,max_err=.5)
    path.draw(TransformPen(quadratic,(1,0,shear,1,xshift+shear*yshift,yshift)))
    return pen.glyph(),advance

