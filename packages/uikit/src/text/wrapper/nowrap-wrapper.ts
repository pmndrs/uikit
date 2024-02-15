import { GlyphLayoutLine } from "../layout.js";
import { getOffsetToNextGlyph } from "../utils.js";
import { GlyphWrapper } from "./index.js";

export const NowrapWrapper: GlyphWrapper = ({ text, fontSize, font, letterSpacing }, _, start) => {
  let result: GlyphLayoutLine = {
    start,
    end: start,
    whitespaces: 0,
    width: 0,
  };

  let position = 0;
  let whitespaces = 0;
  let textIndex = start;
  while (textIndex < text.length) {
    const char = text[textIndex];
    if (char === "\n") {
      break;
    }
    position += getOffsetToNextGlyph(fontSize, font.getGlyphInfo(char), letterSpacing);
    ++textIndex;

    if (char === " ") {
      whitespaces += 1;
    } else {
      result.width = position;
      result.end = textIndex;
      result.whitespaces = whitespaces;
    }
  }
  return result;
};
