

// This function takes in a hex color value and returns a string with its rgb equivalent.
function hex2Rgb(value) {
    let hex = value.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;

}

function parseTheme(theme) {
    let style = {};
    Object.entries(JSON.stringify(theme)).forEach(([key, value]) => {
        let varName = "--" + key;
        style[varName] = value;
        style[varName + "-"] = hex2rgb(value);
    });
}

export {
    parseTheme,
    hex2Rgb
}