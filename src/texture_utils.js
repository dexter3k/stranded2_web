class Texture {
    constructor(id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;
    }
}

function loadTexture(gl, url) {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = function() {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            if (false) {
                // TODO
                const sz = Math.min(image.width, image.height);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sz, sz, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            resolve(new Texture(texture, image.width, image.height));
        }
        image.src = url;
    });
}

function loadCustomTextureRGBA(gl, pixels, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new ImageData(pixels, width, height));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return new Texture(texture, width, height);
}

async function loadTextures(gl, basePath, srcList) {
    var promises = [];
    for (var i = 0; i < srcList.length; ++i) {
        promises = promises.concat(loadTexture(gl, basePath + srcList[i]));
    }
    const textures = await Promise.all(promises);
    var result = {};
    for (var i = 0; i < srcList.length; ++i) {
        result[srcList[i]] = textures[i];
    }
    return result;
}
