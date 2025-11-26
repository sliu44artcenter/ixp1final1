# Assets Directory

## Required Texture Files

Place your coin texture files in this directory:

### Color Maps (Albedo)
- **`coin_front.png`** - Front face of the coin (HEADS)
- **`coin_back.png`** - Back face of the coin (TAILS)
- **`coin_edge.png`** - Edge texture (will be repeated around the circumference)

### Normal Maps
- **`coin_front_normal.png`** - Normal map for the front face (adds surface detail)
- **`coin_back_normal.png`** - Normal map for the back face (adds surface detail)

## Texture Specifications

### Recommended Sizes
- **Front/Back Color Maps**: 1024×1024 px or 2048×2048 px
- **Edge Texture**: 256×512 px (will be repeated)
- **Normal Maps**: Same size as their corresponding color maps

### Format
- **PNG** format with transparency (if needed)
- **sRGB** color space for color maps
- **Linear** color space for normal maps

### Quality Guidelines
- Use high-resolution images for best PBR results
- Ensure normal maps are properly formatted (RGB channels)
- Edge texture should tile seamlessly

## Fallback Behavior

If textures are not provided, the application will use fallback colors:
- **Front (HEADS)**: Gold (`#FFD700`)
- **Back (TAILS)**: Silver (`#C0C0C0`)
- **Edge**: Dark Gold (`#B8860B`)

The app will still work without textures, but won't look as realistic!

## Testing

After adding textures:
1. Run a local web server (required for loading textures)
2. Open the browser console
3. Check for "Coin created with PBR materials" message
4. Verify no texture loading errors

## Example File Structure

```
assets/
├── README.md (this file)
├── coin_front.png
├── coin_back.png
├── coin_edge.png
├── coin_front_normal.png
└── coin_back_normal.png
```

---

**Note**: Ensure file names match exactly (case-sensitive) as they are referenced in `main.js`.
