function Driver(gl, width, height, cam) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    let in2DMode = false;

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    // gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.ONE);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.disable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);

    gl.viewport(0, 0, width, height);

    const default2DProgram = buildDefault2DProgram();
    const default3DProgram = buildDefault3DProgram();
    const buffersImage = buildImageBuffers();

    this.camera = cam;

    this.drawModel = function(modelMatrix, model) {
        if (model == null || model.root == null) {
            return;
        }

        const node = model.root;
        const vertices = node.vertices;
        if (vertices == null || vertices.data == null) {
            return;
        }
        const meshes = node.meshes;
        if (meshes == null) {
            return;
        }

        // at least we now have some vertices to render..
        // setup everything as usual.

        go3D();
        gl.useProgram(default3DProgram.program);

        const projectionMatrix = this.camera.buildProjection();
        gl.uniformMatrix4fv(default3DProgram.uniforms.projection, false, projectionMatrix);

        // todo: model matrix for the actual object
        const modelViewMatrix = mat4.clone(modelMatrix);

        const viewMatrix = this.camera.buildView();
        mat4.multiply(modelViewMatrix, viewMatrix, modelViewMatrix);
        gl.uniformMatrix4fv(default3DProgram.uniforms.modelView, false, modelViewMatrix);



        if (vertices.buffer == 0) {
            vertices.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertices.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.data), gl.STATIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertices.buffer);
        }

        let offset = 0;
        gl.enableVertexAttribArray(default3DProgram.attribs.pos);
        gl.vertexAttribPointer(default3DProgram.attribs.pos, 3, gl.FLOAT, false, vertices.stride, offset);
        offset += 3*4;

        if (vertices.normals) {
            // gl.enableVertexAttribArray(default3DProgram.attribs.normals);
            // gl.vertexAttribPointer(default3DProgram.attribs.normals, 3, gl.FLOAT, false, vertices.stride, offset);
            offset += 3*4;
        }

        if (vertices.color) {
            // gl.enableVertexAttribArray(default3DProgram.attribs.color);
            // gl.vertexAttribPointer(default3DProgram.attribs.color, 4, gl.FLOAT, false, vertices.stride, offset);
            offset += 4*4;
        }

        if (vertices.textures > 0) {
            gl.enableVertexAttribArray(default3DProgram.attribs.uv);
            gl.vertexAttribPointer(default3DProgram.attribs.uv, 2, gl.FLOAT, false, vertices.stride, offset);
            offset += 2*4;
        }

        for (let i = 0; i < model.brushes.length; i++) {
            const mesh = meshes[i];
            if (!mesh) {
                continue;
            }

            if (!node.triangleBuffers[i]) {
                node.triangleBuffers[i] = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.triangleBuffers[i]);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh), gl.STATIC_DRAW);
            } else {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.triangleBuffers[i]);
            }

            const brush = model.brushes[i];
            for (let j = 0; j < brush.textures.length; j++) {
                const tex = brush.textures[j];
                if (tex < 0) {
                    continue;
                }

                gl.activeTexture(gl.TEXTURE0+j);
                gl.bindTexture(gl.TEXTURE_2D, model.textures[tex].id);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }

            gl.uniform4f(default3DProgram.uniforms.baseColor, brush.color[0], brush.color[1], brush.color[2], brush.color[3]);
            gl.uniform1i(default3DProgram.uniforms.colorMap, 0);

            gl.drawElements(gl.TRIANGLES, mesh.length, gl.UNSIGNED_SHORT, 0);
        }
    };

    this.preloadMedia = async function() {
        const terrainVSSource = await (await fetch("src/shaders/terrain.vs")).text();
        const terrainFSSource = await (await fetch("src/shaders/terrain.fs")).text();
        const terrainProgram = initShaderProgram(gl, terrainVSSource, terrainFSSource);

        this.terrainProgram = {
            program: terrainProgram,
            attribs: {
                pos: gl.getAttribLocation(terrainProgram, 'pos'),
                uv:  gl.getAttribLocation(terrainProgram, 'uv'),
            },
            uniforms: {
                modelView:  gl.getUniformLocation(terrainProgram, 'modelView'),
                projection: gl.getUniformLocation(terrainProgram, 'projection'),
                mapScale:   gl.getUniformLocation(terrainProgram, 'mapScale'),
                colorMap:   gl.getUniformLocation(terrainProgram, 'colorMap'),
                detailMap:  gl.getUniformLocation(terrainProgram, 'detailMap'),
                highResMap: gl.getUniformLocation(terrainProgram, 'highResMap'),
            },
        };

        this.textures = await loadTextures(gl, "assets/Stranded II/", [
            "gfx/pirateskin.bmp",
            "sys/gfx/terraindirt.bmp",
            "sys/gfx/terrainstructure.bmp",
        ]);
        this.textures["$colorMap"] = loadCustomTextureRGBA(
            gl, new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff]), 1, 1);
        // console.log(this.textures);
    };

    this.setTerrainColormap = function(data, width, height) {
        if (this.textures["$colorMap"] instanceof WebGLTexture) {
            gl.deleteTexture(this.textures["$colorMap"]);
        }
        this.textures["$colorMap"] = loadCustomTextureRGBA(gl, new Uint8ClampedArray(data.data), data.size, data.size);
    };

    this.clearScene = function() {
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    this.drawImage = function(target, source, textureSize, texture) {
        go2D();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffersImage.position);
        gl.enableVertexAttribArray(default2DProgram.attribLocations.vertexPosition);
        gl.vertexAttribPointer(default2DProgram.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffersImage.coords);
        gl.enableVertexAttribArray(default2DProgram.attribLocations.textureCoord);
        gl.vertexAttribPointer(default2DProgram.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);

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

        gl.uniformMatrix4fv(default2DProgram.uniformLocations.projectionMatrix, false, orthoMatrix);
        gl.uniformMatrix4fv(default2DProgram.uniformLocations.textureMatrix, false, textureMatrix);
        gl.uniform1i(default2DProgram.uniformLocations.sampler, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    this.drawTerrain = function(terrain) {
        go3D();

        gl.useProgram(this.terrainProgram.program);

        const projectionMatrix = this.camera.buildProjection();
        gl.uniformMatrix4fv(this.terrainProgram.uniforms.projection, false, projectionMatrix);

        const modelViewMatrix = mat4.create();
        const worldSize = 64.0;
        const worldHeight = 3200.0;
        mat4.translate(modelViewMatrix, modelViewMatrix, [-worldSize * terrain.size / 2, -worldHeight / 2, -worldSize * terrain.size / 2]);
        mat4.scale(modelViewMatrix, modelViewMatrix, [worldSize, worldHeight, worldSize]);

        const viewMatrix = this.camera.buildView();

        mat4.multiply(modelViewMatrix, viewMatrix, modelViewMatrix);
        gl.uniformMatrix4fv(this.terrainProgram.uniforms.modelView, false, modelViewMatrix);


        const data = terrain.getRenderData();
        gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);

        gl.enableVertexAttribArray(this.terrainProgram.attribs.pos);
        gl.vertexAttribPointer(this.terrainProgram.attribs.pos, 3, gl.FLOAT, false, 5 * 4, 0);

        gl.enableVertexAttribArray(this.terrainProgram.attribs.uv);
        gl.vertexAttribPointer(this.terrainProgram.attribs.uv, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["$colorMap"]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["sys/gfx/terraindirt.bmp"]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["sys/gfx/terrainstructure.bmp"]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.uniform1f(this.terrainProgram.uniforms.mapScale, terrain.size);
        gl.uniform1i(this.terrainProgram.uniforms.colorMap, 0);
        gl.uniform1i(this.terrainProgram.uniforms.detailMap, 1);
        gl.uniform1i(this.terrainProgram.uniforms.highResMap, 2);

        gl.drawArrays(gl.TRIANGLES, 0, data.count);
    };

    function go2D() {
        if (in2DMode) {
            return;
        }
        in2DMode = true;

        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(default2DProgram.program);
    };

    function go3D() {
        if (!in2DMode) {
            return;
        }
        in2DMode = false;

        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(default3DProgram.program);
    };

    function buildDefault2DProgram() {
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;

            uniform mat4 uProjectionMatrix;
            uniform mat4 uTextureMatrix;

            varying mediump vec2 vTextureCoord;

            void main() {
                gl_Position = uProjectionMatrix * aVertexPosition;
                vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0, 1)).xy;
            }
        `;

        const fsSource = `
            precision mediump float;

            varying mediump vec2 vTextureCoord;

            uniform sampler2D uSampler;

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                // TODO: Flag to disable/enable this
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
                textureMatrix: gl.getUniformLocation(shaderProgram, 'uTextureMatrix'),
                sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };
    };

    function buildDefault3DProgram() {
        const vsSource = `
            attribute vec3 pos;
            attribute vec2 uv;

            uniform mat4 modelView;
            uniform mat4 projection;

            varying mediump vec2 texCoords;

            void main() {
                gl_Position = projection * modelView * vec4(pos, 1.0);
                texCoords = vec2(uv.x, uv.y);
            }
        `;

        const fsSource = `
            precision mediump float;

            uniform vec4      baseColor;
            uniform sampler2D colorMap;

            varying vec2 texCoords;

            void main() {
                vec4 col = baseColor * texture2D(colorMap, texCoords);
                if (col.a >= 0.5) {
                    // col.a = 1.0;
                } else {
                    discard;
                }
                gl_FragColor = col;
            }
        `;

        const program = initShaderProgram(gl, vsSource, fsSource);

        return {
            program: program,
            attribs: {
                pos: gl.getAttribLocation(program, 'pos'),
                uv:  gl.getAttribLocation(program, 'uv'),
            },
            uniforms: {
                modelView:  gl.getUniformLocation(program, 'modelView'),
                projection: gl.getUniformLocation(program, 'projection'),
                baseColor:  gl.getUniformLocation(program, 'baseColor'),
                colorMap:   gl.getUniformLocation(program, 'colorMap'),
            },
        };
    }

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
    };
}
