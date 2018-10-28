function Driver(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.viewport(0, 0, width, height);

    function buildDefaultProgram() {
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uTextureMatrix;

            varying highp vec2 vTextureCoord;

            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0, 1)).xy;
            }
        `;

        const fsSource = `
            precision highp float;

            varying highp vec2 vTextureCoord;

            uniform sampler2D uSampler;

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                if (color.r == 1.0 && color.g == 0.0 && color.b == 1.0) {
                    color.a = 0.0;
                }
                gl_FragColor = color;
            }
        `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        return {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                textureMatrix: gl.getUniformLocation(shaderProgram, 'uTextureMatrix'),
                sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };
    };

    function buildImageBuffers() {
        const positions = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordinates = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        return {
            "position": positionBuffer,
            "coords": textureCoordBuffer,
        };
    }

    const defaultProgram = buildDefaultProgram();
    const buffersImage = buildImageBuffers();

    this.clearScene = function() {
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    this.drawImage = function(target, source, textureSize, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.useProgram(defaultProgram.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffersImage.position);
        gl.enableVertexAttribArray(defaultProgram.attribLocations.vertexPosition);
        gl.vertexAttribPointer(defaultProgram.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffersImage.coords);
        gl.enableVertexAttribArray(defaultProgram.attribLocations.textureCoord);
        gl.vertexAttribPointer(defaultProgram.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);

        const orthoMatrix = mat4.create();
        mat4.ortho(orthoMatrix, 0.0, width, height, 0.0, -1.0, 1.0);
        mat4.translate(orthoMatrix, orthoMatrix, [target[0], target[1], 0]);
        mat4.scale(orthoMatrix, orthoMatrix, [target[2]-target[0], target[3]-target[1], 1]);

        const textureMatrix = mat4.create();
        mat4.translate(textureMatrix, textureMatrix, [
            source[0] / textureSize[0],
            source[1] / textureSize[1], 0]);
        mat4.scale(textureMatrix, textureMatrix, [
            (target[2]-target[0]) / textureSize[0],
            (target[3]-target[1]) / textureSize[1], 1]);

        gl.uniformMatrix4fv(defaultProgram.uniformLocations.projectionMatrix, false, orthoMatrix);
        gl.uniformMatrix4fv(defaultProgram.uniformLocations.modelViewMatrix, false, mat4.create());
        gl.uniformMatrix4fv(defaultProgram.uniformLocations.textureMatrix, false, textureMatrix);
        gl.uniform1i(defaultProgram.uniformLocations.sampler, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
}
