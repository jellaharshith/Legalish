# Extension Icons

This directory should contain the extension icons in different sizes:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create these icons from the main Legalish logo (`/public/Logo-version-1.png`) by resizing to the appropriate dimensions.

For a quick setup, you can use the following placeholder approach:

1. Copy the main logo file to this directory
2. Rename it to each required size
3. Use an image editor or online tool to resize each file to the correct dimensions

## Icon Requirements

- **Format**: PNG with transparency
- **Background**: Transparent or solid color
- **Style**: Should match the main Legalish branding
- **Visibility**: Icons should be clearly visible on both light and dark backgrounds

## Temporary Solution

Until proper icons are created, you can copy the main logo file to each filename:

```bash
cp ../../public/Logo-version-1.png icon16.png
cp ../../public/Logo-version-1.png icon32.png
cp ../../public/Logo-version-1.png icon48.png
cp ../../public/Logo-version-1.png icon128.png
```

Then resize each file to the appropriate dimensions using an image editor.