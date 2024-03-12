

const InstancedGlyphContext = createContext<GetInstancedGlyphGroup>(null as any)

export const InstancedGlyphProvider = InstancedGlyphContext.Provider

const FontFamiliesContext = createContext<Record<string, FontFamilyUrls>>(null as any)