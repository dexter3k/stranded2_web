function World(scene, gameData) {
    this.scene = scene;
    this.gameData = gameData;

    this.objects = {};
    this.units   = {};
    this.infos   = {};

    this.update = function(deltaTime) {
        // ...
    };

    this.render = function(deltaTime) {
        // render skybox, clear depth
        // render infinite ground plane
        // render infinite water plane
        this.scene.driver.drawTerrain(this.terrain);
        this.scene.render();

        for (const id in this.objects) {
            const obj = this.objects[id];
            const type = this.gameData.objects.get(obj.type);

            const modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [obj.x, obj.y, obj.z]);
            mat4.rotate(modelMatrix, modelMatrix, obj.yaw * 0.0174533, [0, -1, 0]);
            mat4.scale(modelMatrix, modelMatrix, [type.x, type.y, type.z]);
            this.scene.driver.drawModel(modelMatrix, type.modelHandle);
        }

        for (const id in this.units) {
            const obj = this.units[id];
            const type = this.gameData.units.get(obj.type);

            const modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, [obj.x, obj.y, obj.z]);
            mat4.rotate(modelMatrix, modelMatrix, obj.yaw * 0.0174533, [0, -1, 0]);
            mat4.scale(modelMatrix, modelMatrix, [type.x, type.y, type.z]);
            this.scene.driver.drawModel(modelMatrix, type.modelHandle);
        }
    };

    this.init = function(vars, terrain) {
        this.vars = vars;
        this.terrain = new Terrain(scene.driver, terrain.heightmap);
        scene.driver.setTerrainColormap(terrain.colormap);

        // Add map script from vars.script
        this.mapScript = CompileScript(vars.script);

        // run on:preload
        // events are run globally, ie on following:
        // - main game script
        // - map script
        // - extensions with mode 0
        // - object, unit, item, info defs scripts (globally!)

        console.log("Gonna do preload!");
        console.log(this.gameData.game.script);
        // this.gameData.game.script.
    };

    this.clearBeforeNewMap = function() {
        // ...
    };

    this.freezeTime = function(freeze) {
        this.timeIsFrozen = freeze;
    };

    this.setTimedate = function(day, hour, minute) {
        this.day = day; this.hour = hour; this.minute = minute;
    };

    this.placeObject = function(object) {
        const type = this.gameData.objects.get(object.type);
        if (type == undefined) {
            console.log("Adding unknown object " + object.type);
            return false;
        }

        // type.makeSureModelIsLoaded()

        this.objects[object.id] = object;
        this.scene.addEntity(object.id, object);

        return true;
    };

    this.placeUnit = function(unit) {
        const type = this.gameData.units.get(unit.type);
        if (type == undefined) {
            console.log("Adding unknown unit " + unit.type);
            return false;
        }

        this.units[unit.id] = unit;
    };

    this.placeItem = function(item) {
        // ...
    };

    this.placeInfo = function(info) {
        this.infos[info.id] = info;
    };

    this.placeState = function(state) {
        // ...
    };

    this.getTerrainHeight = function(x, z) {
        const worldHeight = 3200;
        const worldHalfSize = this.terrain.size / 2;
        x /= 64;
        z /= 64;
        return this.terrain.getHeight(x + worldHalfSize, z + worldHalfSize) * worldHeight - worldHeight/2;
    };
}
