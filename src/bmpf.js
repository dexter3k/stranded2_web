function Bmpf(driver) {
    this.driver = driver;

    var textures = {};
    var fonts = [];

    this.defaultHeight = 0;

    this.loadingScreen = function(text, progressPercent = -1) {
        driver.clearScene();
        const centerX = Math.floor(driver.width/2);
        const centerY = Math.floor(driver.height/2);
        this.centeredText(centerX, centerY-20, text, 0);
        if (progressPercent != -1) {
            if (progressPercent > 100) { progressPercent = 100; }
            if (progressPercent < 0) { progressPercent = 0; }

            const progress = 600 / 100 * progressPercent;
            this.driver.drawImage([centerX-300, centerY+5, centerX-300 + progress, centerY+10],
                [0, 0, progress, 5], [600, 5], textures["sys/gfx/progress.bmp"].id);

            this.centeredText(centerX, centerY+20, progressPercent+"%", 0);
        }
    };

    this.centeredText = function(x, y, text, font) {
        var offset = 0;
        for (var i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            if (c == 32) {// space
                offset += Math.floor(fonts[font].glyphWidth / 2);
            } else if (fonts[font].mapping[c]) {
                offset += fonts[font].mapping[c].width;
            }
        }
        x -= Math.floor(offset/2);
        for (var i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            if (c == 32) {// space
                x += Math.floor(fonts[font].glyphWidth / 2);
            } else if (fonts[font].mapping[c]) {
                const sourceX = fonts[font].glyphWidth * fonts[font].mapping[c].index;
                const sourceY = 0;
                const sourceW = fonts[font].mapping[c].width;
                const sourceH = fonts[font].glyphHeight;
                const target = [x, y, x+sourceW, y+sourceH];
                const source = [sourceX, sourceY, sourceX+sourceW, sourceY+sourceH];
                this.driver.drawImage(target, source,
                    [fonts[font].glyphWidth * fonts[font].glyphCount, fonts[font].glyphHeight], fonts[font].texture);
                x += sourceW;
            }
        }
    };

    function loadFont(dataBuffer, texture) {
        data = new Uint8Array(dataBuffer);
        font = {};
        font.texture = texture;
        var pos = 0;
        // Skip line ending '\r\n'
        for (; pos < (data.length-1); pos++) {
            if (data[pos] == 13 && data[pos+1] == 10) {
                break;
            }
        }
        pos += 2;

        const charCount = data[pos]+(data[pos+1]<<8); pos += 2;
        font.glyphCount = charCount;
        font.glyphWidth = data[pos]+(data[pos+1]<<8); pos += 2;
        font.glyphHeight = data[pos]+(data[pos+1]<<8); pos += 2;

        font.mapping = new Array(256);
        for (var i = 0; i < charCount; i++) {
            font.mapping[data[pos+i*3]] = {
                "index": i,
                "width": data[pos+i*3+1]+(data[pos+i*3+2]<<8),
            };
        }

        return font;
    }

    this.load = async function() {
        textures = await loadTextures(driver.gl, "assets/Stranded II/", [
            "sys/gfx/progress.bmp",
            "sys/gfx/font_tiny.bmp",
            "sys/gfx/font_norm.bmp",
            "sys/gfx/font_norm_over.bmp",
            "sys/gfx/font_norm_dark.bmp",
            "sys/gfx/font_norm_bad.bmp",
            "sys/gfx/font_norm_good.bmp",
            "sys/gfx/font_handwriting.bmp",
        ]);
        const fontDatas = await Promise.all([
            loadBinaryAsset("assets/Stranded II/sys/gfx/font_norm.bmpf"),
            loadBinaryAsset("assets/Stranded II/sys/gfx/font_tiny.bmpf"),
        ]);
        fonts[0] = loadFont(fontDatas[0], textures["sys/gfx/font_norm.bmp"].id);
        fonts[1] = loadFont(fontDatas[0], textures["sys/gfx/font_norm_over.bmp"].id);
        fonts[2] = loadFont(fontDatas[0], textures["sys/gfx/font_norm_dark.bmp"].id);
        fonts[3] = loadFont(fontDatas[0], textures["sys/gfx/font_norm_bad.bmp"].id);
        fonts[4] = loadFont(fontDatas[0], textures["sys/gfx/font_norm_good.bmp"].id);
        fonts[5] = loadFont(fontDatas[1], textures["sys/gfx/font_tiny.bmp"].id);
        fonts[6] = loadFont(fontDatas[0], textures["sys/gfx/font_handwriting.bmp"].id);

        this.defaultHeight = fonts[0].glyphHeight;
    };
}
