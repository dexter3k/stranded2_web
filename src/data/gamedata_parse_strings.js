function parseStringsConfig(strings, source) {
    const lines = source.split(/[\r\n]+/g);
    lines.forEach(function(line, _, __) {
        if (!line || line.match(/^\s*\#/)) {
            return;
        }
        const match = line.match(/^([^=]+)(=(.*))?$/)
        if (!match) {
            return;
        }
        const key = match[1];
        const key2 = parseInt(key.substr(1), 10);
        if (key[0] == "0") {
            if (isNaN(key2) || key2 < 0 || key2 > 63) {
                alert("Error in parsing strings.inf. Key " + line + " is malformed");
                return;
            }
            strings.base[key2] = match[3];
        } else if (key[0] == "m") {
            if (isNaN(key2) || key2 < 0 || key2 > 255) {
                alert("Error in parsing strings.inf. Key " + line + " is malformed");
                return;
            }
            strings.menu[key2] = match[3];
        } else if (key[0] == "e") {
            if (isNaN(key2) || key2 < 0 || key2 > 319) {
                alert("Error in parsing strings.inf. Key " + line + " is malformed");
                return;
            }
            strings.editor[key2] = match[3];
        }
    }, null);
}
