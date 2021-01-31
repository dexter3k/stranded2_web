function Scene(gui, driver) {
    this.gui = gui;
    this.driver = driver;
    this.entities = {};

    // Don't await!
    this.update = function(deltaTime) {

    };

    // Don't await!
    this.render = function(deltaTime) {
    	// render solid and sharply transparent objects
        // render sorted transparent objects
    };

    this.addEntity = function(id, entity) {
    	this.entities[id] = entity;
    };
}