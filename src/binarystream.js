function BinaryStream(buffer, position=0, byteLength=null) {
    this.buffer = buffer;
    if (byteLength == null) {
        this.byteLength = buffer.byteLength;
    } else {
        this.byteLength = byteLength;
    }
    this.position = position;

    // Read characters until EOL mark. \r, \n or \r\n
    this.readLine = function() {
        const uint8 = new Uint8Array(this.buffer);
        let output = "";
        let hasChars = false;
        while (uint8[this.position] != undefined) {
            this.position += 1;
            if (uint8[this.position-1] == 13) { // '\r'
                if (uint8[this.position] == 10) { // '\r\n'
                    this.position += 1;
                }
                return output;
            } else if (uint8[this.position-1] == 10) { // '\n'
                return output;
            }
            output += String.fromCharCode(uint8[this.position-1]);
            hasChars = true;
        }
        return hasChars ? output : null;
    };

    this.readByte = function() {
        const uint8 = new Uint8Array(this.buffer);
        if (uint8[this.position] != undefined) {
            this.position += 1;
            return uint8[this.position-1];
        }
        return null;
    };

    this.skipBytes = function(n) {
        this.position += n;
    };

    this.readUint = function() {
        if (this.byteLength - 4 >= this.position) {
            this.position += 4;
            return (new DataView(this.buffer)).getUint32(this.position-4, true);
        }
        return null;
    };

    this.readInt = function() {
        if (this.byteLength - 4 >= this.position) {
            this.position += 4;
            return (new DataView(this.buffer)).getInt32(this.position-4, true);
        }
        return null;
    };

    this.readFloat = function() {
        if (this.byteLength - 4 >= this.position) {
            this.position += 4;
            return (new DataView(this.buffer)).getFloat32(this.position-4, true);
        }
        return null;
    };

    this.readBool = function() {
        const uint8 = new Uint8Array(this.buffer);
        if (uint8[this.position] != undefined) {
            this.position += 1;
            return uint8[this.position-1] != 0;
        }
        return null;
    };

    this.readString = function(length = null) {
        const startPos = this.position;
        if (length == null) {
            length = this.readInt();
        }
        if (this.byteLength - length >= this.position) {
            let output = "";
            const uint8 = new Uint8Array(this.buffer);
            for (let i = 0; i < length; i++) {
                output += String.fromCharCode(uint8[this.position + i]);
            }
            this.position += length;
            return output;
        }
        this.position = startPos;
        return null;
    };

    this.readZeroTerminatedString = function() {
        const uint8 = new Uint8Array(this.buffer);
        let output = "";
        let hasChars = false;
        while (uint8[this.position] != undefined) {
            if (uint8[this.position] == 0) {
                this.position += 1;
                return output;
            }
            output += String.fromCharCode(uint8[this.position]);
            hasChars = true;
            this.position += 1;
        }
        return hasChars ? output : null;
    };

    // 4 bytes tag name as string, 4 bytes length
    // returns [name, binarystream]
    // or [null, null]
    this.readTag = function() {
        const name = this.readString(4);
        if (name == null) {
            return [null, null];
        }
        const size = this.readInt();
        if (size == null) {
            this.position -= 4;
            return [null, null];
        }
        this.position += size;
        return [name, new BinaryStream(this.buffer, this.position-size, this.position)];
    };

    this.remaining = function() {
        return this.byteLength - this.position;
    };
}

// const stream = new BinaryStream(temp1);
// for (let i = 0; i < 12; i++) { console.log(stream.readLine()); }
// stream.skipBytes(20736+1);
// stream.readLine();
// stream.skipBytes(4+3);
