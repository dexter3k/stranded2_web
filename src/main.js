
function loadTexture(gl, url) {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = function() {
            console.log("Start " + url);
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            console.log("End " + url);
            resolve(texture);
        }
        image.src = url;
    });
}

async function loadTextures(gl, srcList) {
    var promises = [];
    for (var i = 0; i < srcList.length; ++i) {
        promises = promises.concat(loadTexture(gl, srcList[i]));
    }
    const textures = await Promise.all(promises);
    var result = {};
    for (var i = 0; i < srcList.length; ++i) {
        result[srcList[i]] = textures[i];
    }
    return result;
}

async function main() {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const textures = await loadTextures(gl, [
        "assets/Stranded II/sys/gfx/bigbutton.bmp",
        "assets/Stranded II/sys/gfx/bigbutton_over.bmp",
        "assets/Stranded II/sys/gfx/cursor.bmp",
        "assets/Stranded II/sys/gfx/cursor_crosshair.bmp",
        "assets/Stranded II/sys/gfx/cursor_height.bmp",
        "assets/Stranded II/sys/gfx/cursor_move.bmp",
        "assets/Stranded II/sys/gfx/cursor_paint.bmp",
        "assets/Stranded II/sys/gfx/cursor_rotate.bmp",
        "assets/Stranded II/sys/gfx/cursor_text.bmp",
    ]);
    console.log(textures);
}
