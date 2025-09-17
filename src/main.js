async function main() {
    const canvas = document.querySelector("#glCanvas");

    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const cam = new Camera(74.75, gl.drawingBufferWidth / gl.drawingBufferHeight);
    cam.pos[0] = +445;
    cam.pos[1] = +95 + 16;
    cam.pos[2] = +391;
    cam.yaw    = 142;
    cam.pitch  = -3;

    // Choose mod folder and setup filesystem of some kind
    const data = new Gamedata("Stranded II");

    // Load settings here..
    // sys\controls.cfg
    // sys\scriptcontrols.cfg
    // sys\settings.cfg

    const input = new Input(canvas);
    const driver = new Driver(gl, gl.drawingBufferWidth, gl.drawingBufferHeight, cam);
    const gui = new Gui(driver, input);
    const scene = new Scene(gui, driver);
    await gui.loadFonts();

    // Loading strings
    gui.bmpf.loadingScreen("Loading Translations", 0.0);
    await data.loadStrings();
    gui.strings = data.strings;

    // Loading interface
    gui.bmpf.loadingScreen(gui.strings.base[1], 6.0);
    await gui.preloadMedia();
    await driver.preloadMedia();

    // Loading materials
    gui.bmpf.loadingScreen("Loading Materials", 18.0);
    // does not really load anything :)
    // but we might add one later?
    await data.loadMaterials(driver, gui);

    // Loading stuff
    gui.bmpf.loadingScreen(gui.strings.base[2], 19.0);
    // Keynames, possibly not even needed, I'm not sure
    // load sys/keys.inf

    // States, icons, sheet index, id, name
    await data.loadStates(driver, gui);

    // Set of RGB vales for each time hour
    await data.loadLightCycle(driver, gui);

    // Main game configuration
    await data.loadGame();

    // List of class=group,Name datas
    // to specify which groups belong to which class
    await data.loadGroups(driver, gui);

    // Loading objects
    gui.bmpf.loadingScreen(gui.strings.base[3], 20.0);
    await data.loadObjects(driver, gui);

    // Loading units
    gui.bmpf.loadingScreen(gui.strings.base[4], 60.0);
    await data.loadUnits(driver, gui);

    // Loading items
    gui.bmpf.loadingScreen(gui.strings.base[5], 80.0);
    await data.loadItems(driver, gui);

    // Loading infos
    gui.bmpf.loadingScreen(gui.strings.base[6], 98.0);
    await data.loadInfos(driver, gui);

    await data.loadCombinations(driver, gui);
    await data.loadBuildings(driver, gui);

    await data.loadRandomMaps(driver, gui);

    const world = new World(scene, data);
    const game = new Game(world, gui);
    game.switchToMainMenu();
    game.setUpdatesEnabled(true);

    // Set rendering hook
    let start = undefined;
    let avgDelta = 1.0;
    const anim = (t) => {
        // Request next frame asap
        window.requestAnimationFrame(anim);

        if (start === undefined) {
            start = t;
        }
        const deltaTime = t - start;
        avgDelta = avgDelta * 0.9 + deltaTime * 0.1;
        start = t;

        // // Prepare crude motion vector..
        // let mot = vec2.create();
        // if (w) { mot[0] += 1.0; }
        // if (s) { mot[0] -= 1.0; }
        // if (a) { mot[1] -= 1.0; }
        // if (d) { mot[1] += 1.0; }
        // vec2.normalize(mot, mot);
        // cam.move(mot[0], mot[1], deltaTime);

        game.render(deltaTime);

        if (true) {
            // Draw current FPS
            gui.bmpf.centeredText(400, 20,
                Math.round(1000.0 / avgDelta) + " FPS", 0);
            // Draw current position
            gui.bmpf.centeredText(400, 40,
                Math.floor(cam.pos[0])+","+Math.floor(cam.pos[1])+","+Math.floor(cam.pos[2]), 0);
        }
    };
    window.requestAnimationFrame(anim);

    // function spawnPlayer() {
    //     // Spawn at specified or random SpawnInfo
    //     // If no suited SpawnInfo, spawn at the center
    //     let spawnPoints = [];
    //     for (const info of world.infos.values()) {
    //         if (info.type == 1) {
    //             spawnPoints.push(info);
    //         }
    //     }

    //     if (spawnPoints.length == 0) {
    //         console.log("Now spawn points provided in the map file. Spawning at the map center!");
    //         spawnPoints.push({x: 0, z: 0, yaw: 0, pitch: 0, y: world.getTerrainHeight(0, 0)});
    //     }

    //     // Note: the original game does this differently, it loops over all possible spawn points
    //     // and chooses one with 1/10 probability. This results in higher picking probability for
    //     // those points at the start of the list
    //     const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    //     cam.pos[0] = point.x;
    //     cam.pos[1] = point.y + 16 + 18;
    //     cam.pos[2] = point.z;
    //     cam.yaw = point.yaw;
    //     cam.pitch = point.pitch;
    // }

    // async function startMenu() {
    //     await loadMap("maps/menu/menu.s2", world, gui);

    //     spawnPlayer();
    // }
}


function pointerLockMagic() {
    // const havePointerLock = 'pointerLockElement' in document ||
    // 'mozPointerLockElement' in document ||
    // 'webkitPointerLockElement' in document;
    // console.log(havePointerLock);

    // function onChangePointerLock() {
    //     if (document.pointerLockElement === canvas
    //         || document.mozPointerLockElement === canvas
    //         || document.webkitPointerLockElement === canvas)
    //     {
    //         console.log("Enabled!");
    //     } else {
    //         console.log("Disabled!");
    //     }
    // }

    // document.addEventListener('pointerlockchange', onChangePointerLock, false);
    // document.addEventListener('mozpointerlockchange', onChangePointerLock, false);
    // document.addEventListener('webkitpointerlockchange', onChangePointerLock, false);

    // canvas.requestPointerLock = canvas.requestPointerLock ||
    //                             canvas.mozRequestPointerLock ||
    //                             canvas.webkitRequestPointerLock;
    // canvas.exitPointerLock = canvas.exitPointerLock ||
    //                          canvas.mozExitPointerLock ||
    //                          canvas.webkitExitPointerLock;

    // canvas.addEventListener('click', async function() {
    //     console.log("Clicked on the button");
    //     canvas.requestPointerLock();

    //     console.log("Locked");
    //     await sleep(10 * 1000);
    //     console.log("Released");
        
    //     document.exitPointerLock();
    // }, false);
}
