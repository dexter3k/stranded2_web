class World {
    constructor(scene, gameData) {
        this.scene = scene;
        this.gameData = gameData;

        this.clearBeforeNewMap();
    }

    update(deltaTime) {
        // ...
    }

    render(deltaTime) {
        // render skybox, clear depth
        // render infinite ground plane
        // render infinite water plane

        this.scene.driver.drawTerrain(this.terrain);
        this.scene.render();

        for (const obj of this.objects.values()) {
            const type = this.gameData.objects.get(obj.type);

            const modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [obj.x, obj.y, obj.z]);
            mat4.rotate(modelMatrix, modelMatrix, obj.yaw * 0.0174533, [0, -1, 0]);
            mat4.scale(modelMatrix, modelMatrix, [type.x, type.y, type.z]);
            this.scene.driver.drawModel(modelMatrix, type.modelHandle);
        }

        for (const obj of this.units.values()) {
            const type = this.gameData.units.get(obj.type);

            const modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [obj.x, obj.y, obj.z]);
            mat4.rotate(modelMatrix, modelMatrix, obj.yaw * 0.0174533, [0, -1, 0]);
            mat4.scale(modelMatrix, modelMatrix, [type.x, type.y, type.z]);
            this.scene.driver.drawModel(modelMatrix, type.modelHandle);
        }
    }

    clearBeforeNewMap() {
        this.player = null;

        this.header = null;
        this.vars = null;
        this.terrain = null;
        this.mapScript = null;

        this.timeIsFrozen = false;

        this.objects = new Map();
        this.units = new Map();
        this.infos = new Map();
        this.extensions = new Array();
    }

    startMapLoading(header) {
        this.header = header;
        console.log(header);
    }

    preinitMapDuringLoading(vars, terrain) {
        this.vars = vars;
        this.terrain = new Terrain(this.scene.driver, terrain.heightmap);
        this.scene.driver.setTerrainColormap(terrain.colormap);
        this.mapScript = vars.script;
        this.runGlobalEvent("preload");
    }

    finishMapLoading() {
        // load ambient sound file..

        const gui = this.scene.gui;
        // Setup environment
        gui.bmpf.loadingScreen(gui.strings.base[31], 97.0);

        // Spawn player at SP map
        gui.bmpf.loadingScreen(gui.strings.base[32], 100.0);

        if (this.header.mode == "map") {
            this.runGlobalEvent("start");
        }

        this.runGlobalEvent("load");
    }

    placeObject(object) {
        const type = this.gameData.objects.get(object.type);
        if (type == undefined) {
            console.log("Adding unknown object " + object.type);
            return false;
        }

        // type.makeSureModelIsLoaded()

        this.objects.set(object.id, object);
        this.scene.addEntity(object.id, object);

        return true;
    }

    placeUnit(unit) {
        const type = this.gameData.units.get(unit.type);
        if (type == undefined) {
            console.log("Adding unknown unit " + unit.type);
            return false;
        }

        this.units.set(unit.id, unit);
    }

    placeItem(item) {
        // ...
    }

    placeInfo(info) {
        this.infos.set(info.id, info);
    }

    placeState(state) {
        // ...
    }

    addExtension(extension) {
        this.extensions.push(extension);
    }

    setPlayerRotation(p, y) {
        // ...
    }

    getTerrainHeight(x, z) {
        if (this.terrain == null) {
            return 0;
        }

        const worldHeight = 3200;
        const worldHalfSize = this.terrain.size / 2;
        x /= 64;
        z /= 64;
        return this.terrain.getHeight(x + worldHalfSize, z + worldHalfSize) * worldHeight - worldHeight/2;
    }

    runGlobalEvent(name) {
        if (this.gameData.game.script != null) {
            this.gameData.game.script.runEvent(name);
        }

        return;

        if (this.mapScript != null) {
            this.mapScript.runEvent(name);
        }

        for (const ext of this.extensions) {
            console.log(ext);
        }

        for (const obj of this.gameData.objects.values()) {
            if (obj.script == null) {
                continue;
            }
            obj.script.runEvent(name);
        }
        for (const unit of this.gameData.units.values()) {
            if (unit.script == null) {
                continue;
            }
            unit.script.runEvent(name);
        }
        for (const item of this.gameData.items.values()) {
            if (item.script == null) {
                continue;
            }
            item.script.runEvent(name);
        }
        for (const info of this.gameData.infos.values()) {
            if (info.script == null) {
                continue;
            }
            info.script.runEvent(name);
        }
    }
}
