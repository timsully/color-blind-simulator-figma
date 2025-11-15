// Color blindness simulation matrices
// Based on research by Brettel, Viénot, and Mollon (1997)

type ColorBlindnessType = 
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly'
  | 'achromatopsia';

// Convert RGB to LMS (Long, Medium, Short wavelength) color space
function rgbToLms(r: number, g: number, b: number): [number, number, number] {
  const l = 0.31399022 * r + 0.63951294 * g + 0.04649755 * b;
  const m = 0.15537241 * r + 0.75789446 * g + 0.08670142 * b;
  const s = 0.01775239 * r + 0.10944209 * g + 0.87256922 * b;
  return [l, m, s];
}

// Convert LMS to RGB
function lmsToRgb(l: number, m: number, s: number): [number, number, number] {
  const r = 5.47221206 * l - 4.6419601 * m + 0.16963708 * s;
  const g = -1.1252419 * l + 2.29317094 * m - 0.1678952 * s;
  const b = 0.02980165 * l - 0.19318073 * m + 1.16364789 * s;
  return [r, g, b];
}

// Apply color blindness transformation
function applyColorBlindness(r: number, g: number, b: number, type: ColorBlindnessType): [number, number, number] {
  if (type === 'normal') {
    return [r, g, b];
  }

  // Convert to LMS
  const [l, m, s] = rgbToLms(r, g, b);

  let l2 = l, m2 = m, s2 = s;

  switch (type) {
    case 'protanopia':
      // Red-blind: L cone missing
      l2 = 0.0 * l + 2.02344 * m + -2.52581 * s;
      m2 = 0.0 * l + 1.0 * m + 0.0 * s;
      s2 = 0.0 * l + 0.0 * m + 1.0 * s;
      break;
    
    case 'deuteranopia':
      // Green-blind: M cone missing
      l2 = 1.0 * l + 0.0 * m + 0.0 * s;
      m2 = 0.494207 * l + 0.0 * m + 1.24827 * s;
      s2 = 0.0 * l + 0.0 * m + 1.0 * s;
      break;
    
    case 'tritanopia':
      // Blue-blind: S cone missing
      l2 = 1.0 * l + 0.0 * m + 0.0 * s;
      m2 = 0.0 * l + 1.0 * m + 0.0 * s;
      s2 = -0.395913 * l + 0.801109 * m + 0.0 * s;
      break;
    
    case 'protanomaly':
      // Red-weak: L cone shifted
      l2 = 0.81667 * l + 0.18333 * m + 0.0 * s;
      m2 = 0.0 * l + 1.0 * m + 0.0 * s;
      s2 = 0.0 * l + 0.0 * m + 1.0 * s;
      break;
    
    case 'deuteranomaly':
      // Green-weak: M cone shifted
      l2 = 1.0 * l + 0.0 * m + 0.0 * s;
      m2 = 0.22222 * l + 0.77778 * m + 0.0 * s;
      s2 = 0.0 * l + 0.0 * m + 1.0 * s;
      break;
    
    case 'tritanomaly':
      // Blue-weak: S cone shifted
      l2 = 1.0 * l + 0.0 * m + 0.0 * s;
      m2 = 0.0 * l + 1.0 * m + 0.0 * s;
      s2 = 0.0 * l + 0.33333 * m + 0.66667 * s;
      break;
    
    case 'achromatopsia':
      // Complete color blindness: convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      return [gray, gray, gray];
  }

  // Convert back to RGB
  const [r2, g2, b2] = lmsToRgb(l2, m2, s2);

  // Clamp values to 0-1 range
  return [
    Math.max(0, Math.min(1, r2)),
    Math.max(0, Math.min(1, g2)),
    Math.max(0, Math.min(1, b2))
  ];
}

// Convert RGB 0-1 to 0-255
function rgbTo255(r: number, g: number, b: number): [number, number, number] {
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}

// Convert RGB 0-255 to 0-1
function rgbFrom255(r: number, g: number, b: number): [number, number, number] {
  return [r / 255, g / 255, b / 255];
}

// Apply color blindness to a node recursively
async function applyToNode(node: SceneNode, type: ColorBlindnessType) {
  if ('fills' in node && node.fills !== figma.mixed) {
    const newFills: Paint[] = [];
    
    for (const fill of node.fills) {
      if (fill.type === 'SOLID') {
        const [r, g, b] = rgbFrom255(
          Math.round(fill.color.r * 255),
          Math.round(fill.color.g * 255),
          Math.round(fill.color.b * 255)
        );
        const [r2, g2, b2] = applyColorBlindness(r, g, b, type);
        const [r255, g255, b255] = rgbTo255(r2, g2, b2);
        
        newFills.push({
          ...fill,
          color: {
            r: r255 / 255,
            g: g255 / 255,
            b: b255 / 255
          }
        });
      } else {
        newFills.push(fill);
      }
    }
    
    node.fills = newFills;
  }

  if ('strokes' in node && node.strokes !== figma.mixed) {
    const newStrokes: Paint[] = [];
    
    for (const stroke of node.strokes) {
      if (stroke.type === 'SOLID') {
        const [r, g, b] = rgbFrom255(
          Math.round(stroke.color.r * 255),
          Math.round(stroke.color.g * 255),
          Math.round(stroke.color.b * 255)
        );
        const [r2, g2, b2] = applyColorBlindness(r, g, b, type);
        const [r255, g255, b255] = rgbTo255(r2, g2, b2);
        
        newStrokes.push({
          ...stroke,
          color: {
            r: r255 / 255,
            g: g255 / 255,
            b: b255 / 255
          }
        });
      } else {
        newStrokes.push(stroke);
      }
    }
    
    node.strokes = newStrokes;
  }

  // Recursively apply to children
  if ('children' in node) {
    for (const child of node.children) {
      await applyToNode(child, type);
    }
  }
}

// Main plugin code
figma.showUI(__html__, { width: 300, height: 500 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'apply-simulation') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('Please select a layer first');
      return;
    }

    const type = msg.colorBlindnessType as ColorBlindnessType;
    
    // Store original state for reset
    const originalState = new Map();
    
    // Apply simulation to all selected nodes
    for (const node of selection) {
      await applyToNode(node, type);
    }
    
    figma.notify(`Applied ${type} simulation to selected layer(s)`);
  }
  
  if (msg.type === 'reset') {
    // Note: Full reset would require storing original state
    // For now, just notify the user
    figma.notify('Reset functionality - reload the file to restore original colors');
  }
};

