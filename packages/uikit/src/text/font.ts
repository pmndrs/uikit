import { Texture, TypedArray } from "three";

export type FontInfo = {
  pages: Array<string>;
  chars: Array<GlyphInfo>;
  info: {
    face: string;
    size: number;
    bold: number;
    italic: number;
    charset: Array<string>;
    unicode: number;
    stretchH: number;
    smooth: number;
    aa: number;
    padding: [number, number, number, number];
    spacing: [number, number, number, number];
    outline: number;
  };
  common: {
    lineHeight: number;
    base: number;
    scaleW: number;
    scaleH: number;
    pages: number;
    packed: number;
    alphaChnl: number;
    redChnl: number;
    greenChnl: number;
    blueChnl: number;
  };
  distanceField: {
    fieldType: string;
    distanceRange: number;
  };
  kernings: Array<{
    first: number;
    second: number;
    amount: number;
  }>;
};

export type GlyphInfo = {
  id: number;
  index: number;
  char: string;
  width: number;
  height: number;
  x: number;
  y: number;
  uvWidth: number;
  uvHeight: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  chnl: number;
  uvX: number;
  uvY: number;
  page: number;
};

export class Font {
  private glyphInfoMap = new Map<string, GlyphInfo>();
  private kerningMap = new Map<string, number>();

  private questionmarkGlyphInfo: GlyphInfo;

  //needed in the shader:
  public readonly pageWidth: number;
  public readonly pageHeight: number;
  public readonly distanceRange: number;

  constructor(info: FontInfo, public page: Texture) {
    const { scaleW, scaleH, lineHeight } = info.common;

    this.pageWidth = scaleW;
    this.pageHeight = scaleH;
    this.distanceRange = info.distanceField.distanceRange;

    const { size } = info.info;

    for (const glyph of info.chars) {
      glyph.uvX = glyph.x / scaleW;
      glyph.uvY = glyph.y / scaleH;
      glyph.uvWidth = glyph.width / scaleW;
      glyph.uvHeight = glyph.height / scaleH;
      glyph.width /= size
      glyph.height /= size
      glyph.xadvance /= size;
      glyph.xoffset /= size;
      glyph.yoffset -= lineHeight - size
      glyph.yoffset /= size;
      this.glyphInfoMap.set(glyph.char, glyph);
    }

    for (const { first, second, amount } of info.kernings) {
      this.kerningMap.set(`${first}/${second}`, amount / size);
    }

    const questionmarkGlyphInfo = this.glyphInfoMap.get("?");
    if (questionmarkGlyphInfo == null) {
      throw new Error("missing '?' glyph in font");
    }
    this.questionmarkGlyphInfo = questionmarkGlyphInfo;
  }

  getGlyphInfo(char: string): GlyphInfo {
    return (
      this.glyphInfoMap.get(char) ??
      (char == "\n" ? this.glyphInfoMap.get(" ") : this.questionmarkGlyphInfo) ??
      this.questionmarkGlyphInfo
    );
  }

  getKerning(firstId: number, secondId: number): number {
    return this.kerningMap.get(`${firstId}/${secondId}`) ?? 0;
  }
}

export function glyphIntoToUV(info: GlyphInfo, target: TypedArray, offset: number): void {
  target[offset + 0] = info.uvX;
  target[offset + 1] = info.uvY + info.uvHeight;
  target[offset + 2] = info.uvWidth;
  target[offset + 3] = -info.uvHeight;
}
