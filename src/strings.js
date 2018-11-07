function Strings() {
    this.base = new Array(64);
    this.menu = new Array(256);
    this.editor = new Array(320);

    for (var i = 0; i < this.base.length; i++) {
        this.base[i] = i + " undefined";
    }
    for (var i = 0; i < this.menu.length; i++) {
        this.menu[i] = i + " undefined";
    }
    for (var i = 0; i < this.editor.length; i++) {
        this.editor[i] = i + " undefined";
    }

    this.format = function(str, v1="", v2="", v3="") {
        return str.replace(/\$1/, v1).replace(/\$2/, v2).replace(/\$3/, v3);
    };

    this.load = async function() {
        const source = await loadTextAsset("assets/Stranded II/sys/strings.inf");
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
                this.base[key2] = match[3];
            } else if (key[0] == "m") {
                if (isNaN(key2) || key2 < 0 || key2 > 255) {
                    alert("Error in parsing strings.inf. Key " + line + " is malformed");
                    return;
                }
                this.menu[key2] = match[3];
            } else if (key[0] == "e") {
                if (isNaN(key2) || key2 < 0 || key2 > 319) {
                    alert("Error in parsing strings.inf. Key " + line + " is malformed");
                    return;
                }
                this.editor[key2] = match[3];
            }
        }, this);
    };
}
