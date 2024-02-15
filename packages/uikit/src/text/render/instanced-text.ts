import { Signal, effect } from "@preact/signals-core";
import { InstancedGlyph } from "./instanced-glyph.js";
import { ColorRepresentation, Matrix4 } from "three";
import { ClippingRect } from "../../clipping.js";
import { FlexNode } from "../../flex/node.js";
import { alignmentXMap, alignmentYMap } from "../../utils.js";
import {
  getGlyphLayoutHeight,
  getGlyphOffsetX,
  getGlyphOffsetY,
  getOffsetToNextGlyph,
  getOffsetToNextLine,
} from "../utils.js";
import { InstancedGlyphGroup } from "./instanced-glyph-group.js";
import { GlyphLayout } from "../layout.js";

export type TextAlignProperties = {
  horizontalAlign?: keyof typeof alignmentXMap | "block";
  verticalAlign?: keyof typeof alignmentYMap;
};

export type TextAppearanceProperties = {
  color?: ColorRepresentation;
  opacity?: number;
};

export class InstancedText {
  private glyphLines: Array<Array<InstancedGlyph>> = [];

  private unsubscribe: () => void;

  private unsubscribeList: Array<() => void> = [];

  private opacity: number = 1;
  private color: ColorRepresentation = 0xffffff;

  constructor(
    private group: InstancedGlyphGroup,
    private getAlignmentProperties: Signal<
      <K extends keyof TextAlignProperties>(key: K) => TextAlignProperties[K]
    >,
    private getAppearanceProperties: Signal<
      <K extends keyof TextAppearanceProperties>(key: K) => TextAppearanceProperties[K]
    >,
    private layout: Signal<GlyphLayout | undefined>,
    private matrix: Signal<Matrix4>,
    isHidden: Signal<boolean> | undefined,
    private parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  ) {
    this.unsubscribe = effect(() => {
      const opacity = getAppearanceProperties.value("opacity") ?? 1;
      if (isHidden?.value === true || opacity < 0.01) {
        this.hide();
        return;
      }
      this.show();
    });
  }

  private show() {
    if (this.unsubscribeList.length > 0) {
      return;
    }
    traverseGlyphs(this.glyphLines, (glyph) => glyph.show());
    this.unsubscribeList.push(
      effect(() => {
        const matrix = this.matrix.value;
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateBaseMatrix(matrix));
      }),
      effect(() => {
        const clippingRect = this.parentClippingRect?.value;
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateClippingRect(clippingRect));
      }),
      effect(() => {
        const color = (this.color = this.getAppearanceProperties.value("color") ?? 0xffffff);
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateColor(color));
      }),
      effect(() => {
        const opacity = (this.opacity = this.getAppearanceProperties.value("opacity") ?? 1);
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateOpacity(opacity));
      }),
      effect(() => {
        const layout = this.layout.value;
        if (layout == null) {
          return;
        }
        const {
          text,
          font,
          lines,
          letterSpacing = 0,
          fontSize = 16,
          lineHeight = 1.2,
          availableHeight,
          availableWidth,
        } = layout;

        let y = -availableHeight / 2;

        const get = this.getAlignmentProperties.value;
        switch (get("verticalAlign")) {
          case "center":
            y += (availableHeight - getGlyphLayoutHeight(layout.lines.length, layout)) / 2;
            break;
          case "bottom":
            y += availableHeight - getGlyphLayoutHeight(layout.lines.length, layout);
            break;
        }

        const horizontalAlign = get("horizontalAlign") ?? "left";
        const linesLength = lines.length;
        const pixelSize = this.group.pixelSize;
        for (let lineIndex = 0; lineIndex < linesLength; lineIndex++) {
          if (lineIndex === this.glyphLines.length) {
            this.glyphLines.push([]);
          }

          const { start, end, whitespaces, width } = lines[lineIndex];

          const textLength = end - start;
          let x = -availableWidth / 2;
          let offsetPerWhitespace = 0;
          switch (horizontalAlign) {
            case "block":
              offsetPerWhitespace = (availableWidth - width) / whitespaces;
              break;
            case "right":
              x += availableWidth - width;
              break;
            case "center":
              x += (availableWidth - width) / 2;
              break;
          }

          let prevGlyphId: number | undefined;
          let glyphIndex: number = 0;
          const glyphs = this.glyphLines[lineIndex];

          for (let charIndex = 0; charIndex < textLength; charIndex++) {
            const char = text[charIndex + start];
            const glyphInfo = font.getGlyphInfo(char);
            const offset = getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing);
            if (char === " ") {
              x += offsetPerWhitespace + offset;
              prevGlyphId = glyphInfo.id;
              continue;
            }
            //non space character
            let glyph = glyphs[glyphIndex];
            if (glyph == null) {
              glyphs[glyphIndex] = glyph = new InstancedGlyph(
                this.group,
                this.matrix.peek(),
                this.color,
                this.opacity,
                this.parentClippingRect?.peek(),
              );
            }
            glyph.updateTransformation(
              pixelSize * (x + getGlyphOffsetX(font, fontSize, glyphInfo, prevGlyphId)),
              -pixelSize * (y + getGlyphOffsetY(fontSize, lineHeight, glyphInfo)),
              pixelSize * fontSize,
            );
            glyph.updateGlyphInfo(glyphInfo);
            glyph.show();

            ++glyphIndex;
            prevGlyphId = glyphInfo.id;
            x += offset;
          }

          y += getOffsetToNextLine(lineHeight, fontSize);

          //remove unnecassary glyphs
          const glyphsLength = glyphs.length;
          for (let ii = glyphIndex; ii < glyphsLength; ii++) {
            glyphs[ii].hide();
          }
          glyphs.length = glyphIndex;
        }
        //remove unnecassary glyph lines
        traverseGlyphs(this.glyphLines, (glyph) => glyph.hide(), linesLength);
        this.glyphLines.length = linesLength;
      }),
    );
  }

  private hide() {
    const unsubscribeListLength = this.unsubscribeList.length;
    if (unsubscribeListLength === 0) {
      return;
    }
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeList[i]();
    }
    this.unsubscribeList.length = 0;
    traverseGlyphs(this.glyphLines, (glyph) => glyph.hide());
  }

  destroy(): void {
    this.hide();
    this.glyphLines.length = 0;
    this.unsubscribe();
  }
}

function traverseGlyphs(
  glyphLines: Array<Array<InstancedGlyph>>,
  fn: (glyph: InstancedGlyph) => void,
  offset: number = 0,
): void {
  const glyphLinesLength = glyphLines.length;
  for (let i = offset; i < glyphLinesLength; i++) {
    const glyphs = glyphLines[i];
    const glyphsLength = glyphs.length;
    for (let ii = 0; ii < glyphsLength; ii++) {
      fn(glyphs[ii]);
    }
  }
}
