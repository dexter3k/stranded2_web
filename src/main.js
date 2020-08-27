// disable cursor
// canvas.style.cursor = "none"; // also "default", "grab", "scroll", "text"

// for debugging purposes only!
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const driver = new Driver(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const gui = new Gui(driver);
    const scene = new Scene(gui, driver);
    await gui.loadFonts();
    const world = new World(scene);

    // Loading strings
    gui.bmpf.loadingScreen("Loading Translations", 0.0);
    await gui.loadStrings();

    // Loading interface
    gui.bmpf.loadingScreen(gui.strings.base[1], 6.0);
    await gui.preloadMedia();
    await driver.preloadMedia();

    // Loading materials
    gui.bmpf.loadingScreen("Loading Materials", 18.0);

    // Loading stuff
    gui.bmpf.loadingScreen(gui.strings.base[2], 19.0);

    // Loading objects
    gui.bmpf.loadingScreen(gui.strings.base[3], 20.0);

    // Loading units
    gui.bmpf.loadingScreen(gui.strings.base[4], 60.0);

    // Loading items
    gui.bmpf.loadingScreen(gui.strings.base[5], 80.0);

    // Loading infos
    gui.bmpf.loadingScreen(gui.strings.base[6], 98.0);

    await startMenu();

    // Logic update and rendering should go in a single run,
    // so key and mouse events won't interfere in process (prevent data races)
    // Rules: no await/async in logic or rendering code, everything event related
    // should be preprocessed or ready before frame update

    // scene.update(1 / 60);
    // scene.render(1 / 60);

    driver.clearScene();
    world.render(0.0);

    function spawnPlayer() {
        // Spawn at specified or random SpawnInfo
        // If no suited SpawnInfo, spawn at the center
    }

    async function startMenu() {
        await loadMap("maps/menu/menu.s2", world, gui);
        spawnPlayer();
    }
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
