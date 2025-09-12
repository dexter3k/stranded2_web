class Game {
    constructor(world, gui) {
        this.world = world;
        this.gui = gui;

        const updatesPerSecond = 1;
        this.msPerUpdate = 1000 / updatesPerSecond;
        this.updateTimeoutId = null;
        this.updatesEnabled = false;
        this.lastLogicUpdate = null;

        this.currentState = "none";

        this.worldUpdatesDisabled = false;
    }

    setUpdatesEnabled(enabled) {
        if (!enabled && this.updatesEnabled) {
            clearTimeout(this.updateTimeoutId);
            this.updatesEnabled = false;
        }

        if (enabled && !this.updatesEnabled) {
            this.lastLogicUpdate = Date.now();

            this.updateTimeoutId = setTimeout(() => { this.updateCallback(); });

            this.updatesEnabled = true;
        }
    }

    updateCallback() {
        while (this.updatesEnabled && Date.now() - this.lastLogicUpdate > this.msPerUpdate) {
            this.update();

            this.lastLogicUpdate += this.msPerUpdate;
        }

        if (this.updatesEnabled) {
            this.updateTimeoutId = setTimeout(() => { this.updateCallback(); });
        }
    }

    update() {
        this.gui.update();

        if (!this.worldUpdatesDisabled) {
            this.world.update();
        }

        if (this.currentState == "main_menu") {
        }
    }

    render(deltaTime) {
        this.world.scene.driver.clearScene();
        this.world.render(deltaTime);
        this.gui.render();
    }

    switchToMainMenu() {
        this.worldUpdatesDisabled = true;
        loadMap("maps/menu/menu.s2", this.world, this.gui).then(() => {
            this.worldUpdatesDisabled = false;
            this.currentState = "main_menu";
        });

        this.populateMainMenuGui();
    }

    populateMainMenuGui() {
        this.gui.clearScene();

        // this.gui.addCenteredImage("sys/gfx/title.bmp", 200 + (this.gui.driver.width - 200) / 2, 200);

        this.gui.addWindow(215, 0);

        let y = 0;

        this.gui.addButton(5, 5, this.gui.strings.menu[40], _=>{
            console.log("Adventure");
        }); y += 50;

        this.gui.addButton(5, 5+y, this.gui.strings.menu[41], _=>{
            this.populateMainMenuRandomGui();
        }); y += 50;

        this.gui.addButton(5, 5+y, this.gui.strings.menu[42], _=>{
            console.log("Single");
        }); y += 50;

        this.gui.addButton(5, 5+y, this.gui.strings.menu[144], _=>{
            console.log("Load");
        }); y += 50;

        this.gui.addButton(5, 5+y, this.gui.strings.menu[43], _=>{
            console.log("Multiplayer");
        }); y += 50;

        y = this.gui.driver.height / 2 - 25;

        this.gui.addButton(5, y, this.gui.strings.menu[44], _=>{
            console.log("Options");
        }); y += 50;

        this.gui.addButton(5, y, this.gui.strings.menu[45], _=>{
            console.log("Editor");
        }); y += 50;

        this.gui.addButton(5, y, this.gui.strings.menu[46], _=>{
            console.log("Credits");
        }); y += 50;
    }

    populateMainMenuRandomGui() {
        this.gui.clearScene();

        this.gui.addButton(5, this.gui.driver.height - 50, this.gui.strings.menu[131], _=>{
            this.populateMainMenuGui();
        }, 3);

        this.gui.addButton(5, 5, this.gui.strings.menu[5], _=>{
            console.log("Okay");
        });

        // Window 580x595
        // Repeated sys\gfx\woodback_dark.bmp
    }
}