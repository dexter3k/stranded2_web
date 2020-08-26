function World(scene) {
    this.scene = scene;

    this.update = function(deltaTime) {
        // ...
    };

    this.render = function(deltaTime) {
        this.scene.driver.drawTerrain(this.terrain);
    };

    this.init = function(vars, terrain) {
        this.vars = vars;
        this.terrain = new Terrain(scene.driver, terrain.heightmap);
    };

    this.freezeTime = function(freeze) {
        this.timeIsFrozen = freeze;
    };

    this.setTimedate = function(day, hour, minute) {
        this.day = day; this.hour = hour; this.minute = minute;
    };
}
