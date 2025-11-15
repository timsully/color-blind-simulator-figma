# Color Blind Simulator - Figma Plugin

A Figma plugin that simulates different types of color blindness on selected layers, helping designers create more accessible designs.

**Repository**: https://github.com/timsully/color-blind-simulator-figma

## Features

- **8 Color Blindness Types**: 
  - Normal Vision (no simulation)
  - Protanopia (red-blind)
  - Deuteranopia (green-blind)
  - Tritanopia (blue-blind)
  - Protanomaly (red-weak)
  - Deuteranomaly (green-weak)
  - Tritanomaly (blue-weak)
  - Achromatopsia (complete color blindness/grayscale)

- **Recursive Application**: Applies simulation to all child layers within the selected layer
- **Fill & Stroke Support**: Simulates both fill colors and stroke colors
- **Easy to Use**: Simple UI with radio button selection

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Plugin**
   ```bash
   npm run build
   ```
   This compiles the TypeScript code to JavaScript.

3. **Load in Figma**
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this directory
   - The plugin will appear in your plugins menu

## Usage

1. **Select a layer** in your Figma file (frame, group, component, etc.)
2. **Open the plugin** from `Plugins` → `Development` → `Color Blind Simulator`
3. **Choose a color blindness type** from the options
4. **Click "Apply Simulation"** to see how the selected layer appears with that type of color blindness
5. The simulation modifies the actual colors in your file. To restore original colors, use Figma's version history or reload the file.

## Development

### Watch Mode
For development, you can use watch mode to automatically rebuild on changes:
```bash
npm run watch
```

### Project Structure
```
.
├── manifest.json      # Plugin configuration
├── ui.html            # Plugin UI
├── code.js            # Compiled plugin code (generated)
├── src/
│   └── code.ts        # Source TypeScript code
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## How It Works

The plugin uses color blindness simulation algorithms from [jsColorblindSimulator](https://github.com/MaPePeR/jsColorblindSimulator):

- **Brettel, Viénot, and Mollon (1997)** algorithm for dichromacy (Protanopia, Deuteranopia, Tritanopia)
  - Paper: "Computerized simulation of color appearance for dichromats"
  - Most accurate for full dichromacy
  
- **Machado, Oliveira, and Fernandes (2009)** algorithm for anomalous trichromacy (Protanomaly, Deuteranomaly, Tritanomaly)
  - Paper: "A Physiologically-based Model for Simulation of Color Vision Deficiency"
  - IEEE Transactions on Visualization and Computer Graphics, Volume 15, Number 6

The simulation process:

1. Applies gamma correction to linearize sRGB colors
2. Converts RGB colors to LMS (Long, Medium, Short wavelength) color space
3. Applies transformation matrices based on the selected color blindness type
4. Converts back to RGB with gamma encoding
5. Applies the transformed colors to fills and strokes recursively

## Notes

- The plugin modifies the actual colors in your file. Always work on a copy or use version history to restore original colors.
- Currently supports SOLID fills and strokes only. Gradients and images are preserved as-is.
- The simulation is applied recursively to all child layers.

## License

MIT

