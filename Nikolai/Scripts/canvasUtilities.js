window.utils = {};

window.utils.colorToRGB = function (color, alpha) {
    /// <summary>
    /// Converts a Hex color to an RGB or RGBA color.
    /// </summary>
    /// <param name="color" type="Hex">Color to be converted</param>
    /// <param name="alpha" type="Double">[Optional] Alpha Channel</param>
    /// <returns>RGB/RBGA string</returns>
    // If string format, convert to a Hex
    if (typeof color === 'string' && color[0] === '#') {
        color = window.parseInt(color.slice(1), 16);
    }
    alpha = (alpha === undefined) ? 1 : alpha;

    // Extract component values
    var r = color >> 16 & 0xff;
    var g = color >> 8 & 0xff;
    var b = color & 0xff;
    var a = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha); // Check Range

    // Use 'rgba' if needed
    if (a === 1) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
};