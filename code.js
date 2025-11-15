// Color blindness simulation algorithms
// Based on jsColorblindSimulator: https://github.com/MaPePeR/jsColorblindSimulator
// Using Brettel, Viénot, and Mollon (1997) algorithm for dichromacy
// and Machado et al. (2009) algorithm for anomalous trichromacy

// Linearize sRGB color (gamma correction)
function linearizeSRGB(c) {
    if (c <= 0.04045) {
        return c / 12.92;
    } else {
        return Math.pow((c + 0.055) / 1.055, 2.4);
    }
}

// Convert linear RGB to sRGB (gamma encoding)
function sRGBFromLinear(c) {
    if (c <= 0.0031308) {
        return 12.92 * c;
    } else {
        return 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
    }
}

// Convert RGB to LMS (Long, Medium, Short wavelength) color space
// Using sRGB to LMS transformation matrix
function rgbToLms(r, g, b) {
    // Linearize RGB
    var rLin = linearizeSRGB(r);
    var gLin = linearizeSRGB(g);
    var bLin = linearizeSRGB(b);
    
    // Convert to LMS using sRGB to LMS matrix
    var l = 0.31399022 * rLin + 0.63951294 * gLin + 0.04649755 * bLin;
    var m = 0.15537241 * rLin + 0.75789446 * gLin + 0.08670142 * bLin;
    var s = 0.01775239 * rLin + 0.10944209 * gLin + 0.87256922 * bLin;
    
    return [l, m, s];
}

// Convert LMS to RGB
function lmsToRgb(l, m, s) {
    // Convert LMS to linear RGB
    var rLin = 5.47221206 * l - 4.6419601 * m + 0.16963708 * s;
    var gLin = -1.1252419 * l + 2.29317094 * m - 0.1678952 * s;
    var bLin = 0.02980165 * l - 0.19318073 * m + 1.16364789 * s;
    
    // Convert linear RGB to sRGB
    var r = sRGBFromLinear(rLin);
    var g = sRGBFromLinear(gLin);
    var b = sRGBFromLinear(bLin);
    
    return [r, g, b];
}

// Brettel algorithm for dichromacy (Protanopia, Deuteranopia, Tritanopia)
// Based on: Brettel, H., Viénot, F., & Mollon, J. D. (1997)
function applyBrettelDichromacy(l, m, s, type) {
    var l2, m2, s2;
    
    // Confusion lines for dichromacy
    switch (type) {
        case 'protanopia':
            // Red-blind: L cone missing
            // Project onto confusion line
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
        default:
            return [l, m, s];
    }
    
    return [l2, m2, s2];
}

// Machado et al. algorithm for anomalous trichromacy
// Based on: Machado, G. M., Oliveira, M. M., & Fernandes, L. A. F. (2009)
// "A Physiologically-based Model for Simulation of Color Vision Deficiency"
function applyMachadoAnomaly(l, m, s, type) {
    var l2, m2, s2;
    
    // Transformation matrices for anomalous trichromacy
    switch (type) {
        case 'protanomaly':
            // Red-weak: L cone shifted toward M
            l2 = 0.81667 * l + 0.18333 * m + 0.0 * s;
            m2 = 0.0 * l + 1.0 * m + 0.0 * s;
            s2 = 0.0 * l + 0.0 * m + 1.0 * s;
            break;
        case 'deuteranomaly':
            // Green-weak: M cone shifted toward L
            l2 = 1.0 * l + 0.0 * m + 0.0 * s;
            m2 = 0.22222 * l + 0.77778 * m + 0.0 * s;
            s2 = 0.0 * l + 0.0 * m + 1.0 * s;
            break;
        case 'tritanomaly':
            // Blue-weak: S cone shifted toward M
            l2 = 1.0 * l + 0.0 * m + 0.0 * s;
            m2 = 0.0 * l + 1.0 * m + 0.0 * s;
            s2 = 0.0 * l + 0.33333 * m + 0.66667 * s;
            break;
        default:
            return [l, m, s];
    }
    
    return [l2, m2, s2];
}

// Apply color blindness transformation
function applyColorBlindness(r, g, b, type) {
    if (type === 'normal') {
        return [r, g, b];
    }
    
    if (type === 'achromatopsia') {
        // Complete color blindness: convert to grayscale using luminance
        var gray = 0.299 * r + 0.587 * g + 0.114 * b;
        return [gray, gray, gray];
    }
    
    // Convert to LMS
    var lms = rgbToLms(r, g, b);
    var l = lms[0];
    var m = lms[1];
    var s = lms[2];
    
    var lms2;
    
    // Use Brettel for dichromacy, Machado for anomalous trichromacy
    if (type === 'protanopia' || type === 'deuteranopia' || type === 'tritanopia') {
        lms2 = applyBrettelDichromacy(l, m, s, type);
    } else {
        lms2 = applyMachadoAnomaly(l, m, s, type);
    }
    
    // Convert back to RGB
    var rgb = lmsToRgb(lms2[0], lms2[1], lms2[2]);
    
    // Clamp values to 0-1 range
    return [
        Math.max(0, Math.min(1, rgb[0])),
        Math.max(0, Math.min(1, rgb[1])),
        Math.max(0, Math.min(1, rgb[2]))
    ];
}

// Main plugin code
figma.showUI(__html__, { width: 400, height: 600 });

// Function to export and send preview
function updatePreview(type) {
    var selection = figma.currentPage.selection;
    if (!selection || selection.length === 0) {
        figma.ui.postMessage({
            type: 'no-selection'
        });
        return;
    }
    
    if (!type) {
        // Get current selection from UI if type not provided
        return;
    }
    
    var node = selection[0];
    console.log('Auto-exporting node:', node.name, node.type);
    // Use scale 1 for faster processing - can increase quality if needed
    node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })
        .then(function(imageData) {
            console.log('Image exported, size:', imageData.length);
            var imageArray = Array.from(imageData);
            console.log('Converted to array, length:', imageArray.length);
            figma.ui.postMessage({
                type: 'image-data',
                imageData: imageArray,
                colorBlindnessType: type,
                width: node.width,
                height: node.height
            });
        })
        .catch(function(error) {
            console.error('Export error:', error);
            figma.ui.postMessage({
                type: 'preview-error',
                error: error.message
            });
        });
}

// Listen for selection changes
figma.on('selectionchange', function() {
    // Request current type from UI and update preview
    figma.ui.postMessage({
        type: 'selection-changed'
    });
});

// Handle messages from UI
figma.ui.onmessage = function(msg) {
    try {
        if (msg.type === 'preview-simulation') {
            var type = msg.colorBlindnessType;
            if (!type) {
                figma.notify('No color blindness type selected');
                return;
            }
            updatePreview(type);
        }
        
        if (msg.type === 'get-preview') {
            // UI is requesting preview update (e.g., after selection change)
            var type = msg.colorBlindnessType;
            if (type) {
                updatePreview(type);
            }
        }
        
        if (msg.type === 'apply-simulation') {
            // Optional: Still allow applying to the actual layer
            var selection = figma.currentPage.selection;
            if (!selection || selection.length === 0) {
                figma.notify('Please select a layer first');
                return;
            }
            var type = msg.colorBlindnessType;
            if (!type) {
                figma.notify('No color blindness type selected');
                return;
            }
            
            // Apply simulation to all selected nodes
            for (var i = 0; i < selection.length; i++) {
                applyToNode(selection[i], type);
            }
            figma.notify('Applied ' + type + ' simulation to selected layer(s)');
        }
    } catch (error) {
        console.error('Plugin error:', error);
        figma.notify('Error: ' + error.message);
    }
};

// Apply color blindness to a node recursively (for apply functionality)
function applyToNode(node, type) {
    try {
        // Handle fills
        if ('fills' in node && node.fills !== figma.mixed && Array.isArray(node.fills)) {
            var newFills = [];
            var fills = node.fills;
            for (var i = 0; i < fills.length; i++) {
                var fill = fills[i];
                if (fill && fill.type === 'SOLID' && fill.color) {
                    // Figma colors are already 0-1, use them directly
                    var r = fill.color.r;
                    var g = fill.color.g;
                    var b = fill.color.b;
                    var transformed = applyColorBlindness(r, g, b, type);
                    var newFill = {
                        type: fill.type,
                        visible: fill.visible !== undefined ? fill.visible : true,
                        opacity: fill.opacity !== undefined ? fill.opacity : 1,
                        blendMode: fill.blendMode !== undefined ? fill.blendMode : 'NORMAL',
                        color: {
                            r: transformed[0],
                            g: transformed[1],
                            b: transformed[2]
                        }
                    };
                    newFills.push(newFill);
                } else {
                    newFills.push(fill);
                }
            }
            if (newFills.length > 0) {
                node.fills = newFills;
            }
        }
        
        // Handle strokes
        if ('strokes' in node && node.strokes !== figma.mixed && Array.isArray(node.strokes)) {
            var newStrokes = [];
            var strokes = node.strokes;
            for (var i = 0; i < strokes.length; i++) {
                var stroke = strokes[i];
                if (stroke && stroke.type === 'SOLID' && stroke.color) {
                    // Figma colors are already 0-1, use them directly
                    var r = stroke.color.r;
                    var g = stroke.color.g;
                    var b = stroke.color.b;
                    var transformed = applyColorBlindness(r, g, b, type);
                    var newStroke = {
                        type: stroke.type,
                        visible: stroke.visible !== undefined ? stroke.visible : true,
                        opacity: stroke.opacity !== undefined ? stroke.opacity : 1,
                        blendMode: stroke.blendMode !== undefined ? stroke.blendMode : 'NORMAL',
                        color: {
                            r: transformed[0],
                            g: transformed[1],
                            b: transformed[2]
                        }
                    };
                    newStrokes.push(newStroke);
                } else {
                    newStrokes.push(stroke);
                }
            }
            if (newStrokes.length > 0) {
                node.strokes = newStrokes;
            }
        }
        
        // Recursively apply to children
        if ('children' in node && Array.isArray(node.children)) {
            var children = node.children;
            for (var i = 0; i < children.length; i++) {
                applyToNode(children[i], type);
            }
        }
    } catch (error) {
        console.error('Error applying color blindness:', error);
        figma.notify('Error applying simulation: ' + error.message);
    }
}
