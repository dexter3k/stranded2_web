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
        /*
            TODO: setTimeout could be problematic (eg throttled down to once/minute)
            We need an upper cap on update count at the very least
        */
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
        let updated_this_cb = 0;
        while (this.updatesEnabled && Date.now() - this.lastLogicUpdate > this.msPerUpdate) {
            this.update();

            this.lastLogicUpdate += this.msPerUpdate;
            updated_this_cb += 1;
        }

        if (updated_this_cb > 1) {
            console.log("Performed", updated_this_cb);
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

        // this.populateMainMenuGui();
        this.populateMainMenuRandomGui();
    }

    populateMainMenuGui() {
        this.gui.clearScene();

        this.gui.addCenteredImage("sys/gfx/title.bmp", 200 + (this.gui.driver.width - 200) / 2, 200);

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

        // X: Back
        this.gui.addButton(5, this.gui.driver.height - 50, this.gui.strings.menu[131], _=>{
            this.populateMainMenuGui();
        }, 3);

        // Okay
        this.gui.addButton(5, 5, this.gui.strings.menu[5], _=>{
            console.log(
                "Okay",
                this.gui.radio_groups.get("size"),
                this.gui.radio_groups.get("terrain"),
                this.gui.radio_groups.get("mode")
            );
        });

        // Window
        this.gui.addWindow(215, 0, this.gui.strings.menu[41], 28);

        // Size
        this.gui.addText(236, 63, this.gui.strings.editor[30] + ":");
        this.gui.addRadio(436, 63 + 0 * 20, this.gui.strings.editor[31], "size", "small");
        this.gui.addRadio(436, 63 + 1 * 20, this.gui.strings.editor[32], "size", "medium");
        this.gui.addRadio(436, 63 + 2 * 20, this.gui.strings.editor[33], "size", "big");

        // Terrain
        this.gui.addText(236, 143, this.gui.strings.editor[34] + ":");
        this.gui.addRadio(436, 143 + 0 * 20, this.gui.strings.editor[35], "terrain", "normal");
        this.gui.addRadio(436, 143 + 1 * 20, this.gui.strings.editor[36], "terrain", "hills");
        this.gui.addRadio(436, 143 + 2 * 20, this.gui.strings.editor[37], "terrain", "mountains");
        this.gui.addRadio(436, 143 + 3 * 20, this.gui.strings.editor[38], "terrain", "desert");
        this.gui.addRadio(436, 143 + 4 * 20, this.gui.strings.editor[39], "terrain", "snow");
        this.gui.addRadio(436, 143 + 5 * 20, this.gui.strings.editor[40], "terrain", "swamp");

        // Mode
        this.gui.addText(236, 283, this.gui.strings.editor[129] + ":");
        // todo: rect
        // Rect 431, 278, 306, 298, 1
        // todo: proper scroll :DDDDDDDD
        let items = 0;
        for (const v of this.world.gameData.randomMaps.values()) {
            this.gui.addRadio(436, 283 + 20 * items, v.name, "mode", v.id.toString());
            items++;
        }

        // Okay, but bottom right?
        // this.gui.addButton(gui_ibutton(742,542,Cicon_ok,sm$(5)))
    }
}