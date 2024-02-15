import { Signal, computed, signal } from "@preact/signals-core";
import {
  InstancedText,
  TextAlignProperties,
  TextAppearanceProperties,
} from "./render/instanced-text.js";
import { InstancedGlyphGroup } from "./render/instanced-glyph-group.js";
import {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { FlexNode } from "../flex/node.js";
import { Group, Matrix4 } from "three";
import { ClippingRect } from "../clipping.js";
import { ManagerCollection, useGetBatchedProperties } from "../properties/utils.js";
import { readReactive, useSignalEffect } from "../utils.js";
import { loadCachedFont } from "./cache.js";
import { MEASURE_MODE_UNDEFINED, MeasureFunction } from "yoga-wasm-web";
import { Font } from "./font.js";
import {
  GlyphLayout,
  GlyphLayoutProperties,
  buildGlyphLayout,
  measureGlyphLayout,
} from "./layout.js";
import { useFrame } from "@react-three/fiber";

export type GetInstancedGlyphGroup = (font: Font) => InstancedGlyphGroup;

const InstancedGlyphContext = createContext<GetInstancedGlyphGroup>(null as any);

export const InstancedGlyphProvider = InstancedGlyphContext.Provider;

export function useGetInstancedGlyphGroup(
  pixelSize: number,
  rootIdentifier: unknown,
  rootGroup: Group,
) {
  const map = useMemo(() => new Map<Font, InstancedGlyphGroup>(), []);
  const getGroup = useCallback<GetInstancedGlyphGroup>(
    (font) => {
      let result = map.get(font);
      if (result == null) {
        map.set(font, (result = new InstancedGlyphGroup(font, pixelSize, rootIdentifier)));
        rootGroup.add(result);
      }
      return result;
    },
    [rootIdentifier, pixelSize, rootGroup],
  );

  useFrame(() => {
    for (const group of map.values()) {
      group.onFrame();
    }
  });

  return getGroup;
}

const FontFamilyUrlsContext = createContext<Record<string, string>>(null as any);

//TODO: update to point to THIS repo
const defaultFontFamilyUrls = {
  opensans: "https://coconut-xr.github.io/msdf-fonts/opensans.json",
};

export function FontFamilyProvider({
  children,
  ...fontFamilies
}: Record<string, string> & { children?: ReactNode }) {
  const existinFontFamilyUrls = useContext(FontFamilyUrlsContext);
  if (existinFontFamilyUrls != null) {
    fontFamilies = { ...existinFontFamilyUrls, ...fontFamilies };
  }
  return (
    <FontFamilyUrlsContext.Provider value={fontFamilies}>{children}</FontFamilyUrlsContext.Provider>
  );
}

const alignPropertyKeys = ["horizontalAlign", "verticalAlign"] as const;
const appearancePropertyKeys = ["color", "opacity"] as const;
const glyphPropertyKeys = ["fontSize", "letterSpacing", "lineHeight", "wordBreak"] satisfies Array<
  keyof GlyphLayoutProperties
>;

export type InstancedTextProperties = TextAlignProperties &
  TextAppearanceProperties &
  GlyphLayoutProperties &
  FontFamilyProperties;

export function useInstancedText(
  collection: ManagerCollection,
  text: string | Signal<string>,
  matrix: Signal<Matrix4>,
  node: FlexNode,
  isHidden: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
) {
  const getGroup = useContext(InstancedGlyphContext);
  const fontSignal = useFont(collection);
  const textSignal = useMemo(() => signal<string | Signal<string> | undefined>(undefined), []);
  textSignal.value = text;
  const propertiesRef = useRef<GlyphLayoutProperties | undefined>(undefined);

  const measureFunc = useMeasureFunc(collection, fontSignal, textSignal, propertiesRef);

  const alignProperties = useGetBatchedProperties<TextAlignProperties>(
    collection,
    alignPropertyKeys,
  );
  const appearanceProperties = useGetBatchedProperties<TextAppearanceProperties>(
    collection,
    appearancePropertyKeys,
  );

  const layoutSignal = useMemo(() => signal<GlyphLayout | undefined>(undefined), []);
  useEffect(
    () =>
      node.addLayoutChangeListener(() => {
        const layoutProperties = propertiesRef.current;
        if (layoutProperties == null) {
          return;
        }
        const { size, paddingInset, borderInset } = node;
        const [width, height] = size.value;
        const [pTop, pRight, pBottom, pLeft] = paddingInset.value;
        const [bTop, bRight, bBottom, bLeft] = borderInset.value;
        const actualWidth = width - pRight - pLeft - bRight - bLeft;
        const actualheight = height - pTop - pBottom - bTop - bBottom;
        layoutSignal.value = buildGlyphLayout(layoutProperties, actualWidth, actualheight);
      }),
    [node],
  );

  useSignalEffect(() => {
    const font = fontSignal.value;
    if (font == null) {
      return;
    }
    const instancedText = new InstancedText(
      getGroup(font),
      alignProperties,
      appearanceProperties,
      layoutSignal,
      matrix,
      isHidden,
      parentClippingRect,
    );
    return () => instancedText.destroy();
  }, [getGroup, matrix, node, isHidden, parentClippingRect]);

  return measureFunc;
}

const fontFamilyKey = ["fontFamily"] as const;

export type FontFamilyProperties = { fontFamily?: string };

export function useFont(collection: ManagerCollection) {
  const result = useMemo(() => signal<Font | undefined>(undefined), []);
  const fontFamilyUrls = useContext(FontFamilyUrlsContext) ?? defaultFontFamilyUrls;
  const getProperties = useGetBatchedProperties<FontFamilyProperties>(collection, fontFamilyKey);
  useSignalEffect(() => {
    let fontFamily = getProperties.value("fontFamily");
    if (fontFamily == null) {
      fontFamily = Object.keys(fontFamilyUrls)[0];
    }
    const url = fontFamilyUrls[fontFamily];
    loadCachedFont(url, (font) => (result.value = font));
  }, [fontFamilyUrls]);
  return result;
}

export function useMeasureFunc(
  collection: ManagerCollection,
  fontSignal: Signal<Font | undefined>,
  textSignal: Signal<string | Signal<string> | undefined>,
  propertiesRef: MutableRefObject<GlyphLayoutProperties | undefined>,
) {
  const getGlyphProperties = useGetBatchedProperties<GlyphLayoutProperties>(
    collection,
    glyphPropertyKeys,
  );
  const measureFunc = useMemo(
    () =>
      computed<MeasureFunction | undefined>(() => {
        const font = fontSignal.value;
        if (font == null) {
          return undefined;
        }
        const text = readReactive(textSignal.value);
        if (text == null) {
          return undefined;
        }
        const letterSpacing = getGlyphProperties.value("letterSpacing") ?? 0;
        const lineHeight = getGlyphProperties.value("lineHeight") ?? 1.2;
        const fontSize = getGlyphProperties.value("fontSize") ?? 16;
        const wordBreak = getGlyphProperties.value("wordBreak") ?? "break-word";

        return (width, widthMode) => {
          const availableWidth = widthMode === MEASURE_MODE_UNDEFINED ? undefined : width;
          return measureGlyphLayout(
            (propertiesRef.current = {
              font,
              fontSize,
              letterSpacing,
              lineHeight,
              text,
              wordBreak,
            }),
            availableWidth,
          );
        };
      }),
    [],
  );
  return measureFunc;
}
