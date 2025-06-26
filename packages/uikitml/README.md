# uikitml

It is a **subset of HTML syntax** specifically designed for describing user interfaces in 3D space using the `@pmndrs/uikit` library. It's a HTML-like markup language that can be interpreted into 3D UI components.

## Element Types

uikitml parses HTML into seven core element types:

### Container Elements

Most HTML elements become containers that can hold children and text.

```html
<div>Layout container</div>
<p>Paragraph text</p>
<h1>Main heading</h1>
<button>Click me</button>
<ul>
  <li>List item</li>
</ul>
```

**Supported tags:** `div`, `p`, `h1`-`h6`, `span`, `a`, `button`, `ol`, `ul`, `li`

**Special behavior:** Containers with a single text child automatically become Text components.

### Image Elements

Display bitmap images in your 3D UI.

```html
<img src="photo.jpg" alt="Description" />
<img src="icon.png" class="avatar" />
<img src="icon.svg" />
```

**Required:** `src` attribute

### Inline SVG Elements

Embed SVG markup directly in your UI.

```html
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
  <rect x="10" y="10" width="30" height="30" fill="red"/>
</svg>
```

**Content:** Raw SVG markup is preserved and rendered

### Video Elements

Display video content with standard HTML5 video attributes.

```html
<video src="movie.mp4" controls autoplay />
<video src="demo.webm" loop muted />
```

**Required:** `src` attribute  
**Supports:** All standard HTML5 video attributes

### Input Elements

Create interactive input fields for user data.

```html
<input type="text" placeholder="Enter your name" />
<input type="email" value="user@example.com" />
<textarea placeholder="Multi-line text input">Default content</textarea>
```

**Special case:** `<textarea>` elements automatically get `multiline: true`

### Custom Elements

Define reusable components using custom tag names.

```html
<my-button variant="primary">Custom Button</my-button>
<user-profile name="John Doe" avatar="avatar.jpg" />
<chart-widget data="sales-data.json" />
```

**Fallback:** Unknown components fall back to Container elements  
**Usage:** Any tag outside of `div`, `p`, `h1`-`h6`, `span`, `a`, `button`, `ol`, `ul`, `li` becomes a custom element

## Styling System

### Inline Styles

Use familiar CSS properties with kebab-casing directly on elements

```html
<div style="background-color: blue; padding: 20px; border-radius: 8px;">
  Styled container
</div>
```

### CSS Classes

Define reusable styles with full pseudo-selector support using the <style> tag

```html
<style>
  .button {
    background-color: #3b82f6;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .button:hover {
    background-color: #2563eb;
    transform: scale(1.05);
  }
  
  .button:active {
    background-color: #1d4ed8;
    transform: scale(0.95);
  }
  
  /* Responsive styles */
  .button:sm {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .button:lg {
    padding: 16px 32px;
    font-size: 18px;
  }
</style>

<button class="button">Interactive Button</button>
```

**Supported selectors:**
- **States:** `:hover`, `:active`, `:focus`
- **Responsive:** `:sm`, `:md`, `:lg`, `:xl`, `:2xl`

### ID-Based Styling

Style specific elements using ID selectors.

```html
<style>
  #header {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    padding: 20px;
    text-align: center;
  }
  
  #header:hover {
    opacity: 0.9;
  }
</style>

<div id="header">
  <h1>Welcome to uikitml</h1>
</div>
```

## HTML Element Defaults

uikitml provides sensible 3D-optimized defaults for common HTML elements:

```typescript
// Headings with appropriate sizing
h1: { fontSize: 32, fontWeight: 'bold' }
h2: { fontSize: 24, fontWeight: 'bold' }
h3: { fontSize: 18.72, fontWeight: 'bold' }
h4: { fontSize: 16, fontWeight: 'bold' }
h5: { fontSize: 13.28, fontWeight: 'bold' }
h6: { fontSize: 10.67, fontWeight: 'bold' }

// List layout
ol, ul: { flexDirection: 'column' }

// Interactive elements
a: { cursor: 'pointer' }
button: { 
  verticalAlign: 'middle', 
  textAlign: 'center', 
  cursor: 'pointer' 
}

// Form elements
textarea: { multiline: true }
```

## Usage

```typescript
import { parse, generate, interpret } from '@pmndrs/uikitml'

// Parse and Interprete HTML to 3D uikit elements
const scene = interpret(parse(htmlString), /*optional:*/ customComponentKit)
```

## Key Features

- **🔄 Bidirectional:** Parse HTML → ElementJson → Back to HTML
- **🎯 3D-focused:** Designed for 3D UI frameworks, not web DOM  
- **📝 Type-safe:** Strong TypeScript typing for all element types
- **🔧 Extensible:** Custom component support via Kit system
- **✏️ Editor-friendly:** Range tracking for syntax highlighting/editing