function InfStream(raw) {
    this.buffer = raw;
    this.position = 0;

    // Read characters until EOL mark. \r, \n or \r\n
    this.readLine = function() {
        let output = "";
        let hasChars = false;
        while (this.buffer[this.position] != undefined) {
            this.position += 1;
            if (this.buffer[this.position-1] == '\r') { // '\r'
                if (this.buffer[this.position] == '\n') { // '\r\n'
                    this.position += 1;
                }
                return output;
            } else if (this.buffer[this.position-1] == '\n') { // '\n'
                return output;
            }
            output += this.buffer[this.position-1];
            hasChars = true;
        }
        return hasChars ? output : null;
    };

    // returns:
    // [line, key, value] if has key/value
    // [line, "#", null] if is a comment
    // [line, null, null] if not valid key/value pair
    // [null, null, null] if EOF
    this.readKeyValuePair = function() {
        const raw = this.readLine();
        if (raw == null) {
            return [raw, null, null];
        }

        const trimmed = raw.trim();
        if (trimmed == "" || trimmed[0] == "#") {
            return [raw, trimmed.substr(0, 1), null];
        }

        const i = trimmed.indexOf("=");
        if (i == -1) {
            return [raw, null, null];
        }

        return [raw, trimmed.substr(0, i).trim(), trimmed.substr(i+1).trim()];
    };

    this.skip = function(n) {
        this.position += n;
    };

    this.remaining = function() {
        return this.buffer.length - this.position;
    };
}
