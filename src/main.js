// disable cursor
// canvas.style.cursor = "none"; // also "default", "grab", "scroll", "text"

// for debugging purposes only!
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const canvas = document.querySelector("#glCanvas");
    let dragging = false;
    let lastX = undefined;
    let lastY = undefined;

    canvas.onmousedown = (e) => {
        dragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    };
    canvas.onmouseup = (e) => {
        if (dragging) {
            dragging = false;
        }
    };
    canvas.onmouseout = (e) => {
        if (dragging) {
            dragging = false;
        }
    };

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
    canvas.onmousemove = (e) => {
        if (dragging) {
            const dx = e.offsetX - lastX;
            const dy = e.offsetY - lastY;
            lastX = e.offsetX;
            lastY = e.offsetY;
            cam.yaw += -dx * 0.5;
            cam.pitch += dy * 0.5;
        }
    };
    let w = false;
    let s = false;
    let a = false;
    let d = false;
    window.onkeydown = (e) => {
        if (e.code == "KeyW") { w = true; }
        if (e.code == "KeyS") { s = true; }
        if (e.code == "KeyA") { a = true; }
        if (e.code == "KeyD") { d = true; }
    };
    window.onkeyup = (e) => {
        if (e.code == "KeyW") { w = false; }
        if (e.code == "KeyS") { s = false; }
        if (e.code == "KeyA") { a = false; }
        if (e.code == "KeyD") { d = false; }
    };

    const driver = new Driver(gl, gl.drawingBufferWidth, gl.drawingBufferHeight, cam);
    const gui = new Gui(driver);
    const scene = new Scene(gui, driver);
    await gui.loadFonts();

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
    // load sys/keys.inf
    // load sys/states.inf
    // load sys/lightcycle.inf
    // load sys/game*.inf
    // load sys/groups.inf

    // Loading objects
    gui.bmpf.loadingScreen(gui.strings.base[3], 20.0);
    const obj = new Objects();
    await obj.load(driver, gui);

    // Loading units
    gui.bmpf.loadingScreen(gui.strings.base[4], 60.0);

    // Loading items
    gui.bmpf.loadingScreen(gui.strings.base[5], 80.0);

    // Loading infos
    gui.bmpf.loadingScreen(gui.strings.base[6], 98.0);

    const world = new World(scene, obj);

    await startMenu();

    // Logic update and rendering should go in a single run,
    // so key and mouse events won't interfere in process (prevent data races)
    // Rules: no await/async in logic or rendering code, everything event related
    // should be preprocessed or ready before frame update

    // scene.update(1 / 60);
    // scene.render(1 / 60);

    let model = 0;

    let start = undefined;
    let avgDelta = 1.0;
    const anim = (t) => {
        if (start === undefined) {
            start = t;
        }
        const deltaTime = t - start;
        avgDelta = avgDelta * 0.9 + deltaTime * 0.1;
        start = t;

        let mot = vec2.create();
        if (w) { mot[0] += 1.0; }
        if (s) { mot[0] -= 1.0; }
        if (a) { mot[1] -= 1.0; }
        if (d) { mot[1] += 1.0; }
        vec2.normalize(mot, mot);
        cam.move(mot[0], mot[1], deltaTime);

        // console.log(cam.pos);

        driver.clearScene();
        world.render(0.0);
        // driver.drawTestModel();
        model += deltaTime / 1000 * 2;
        while (model > obj.ids.length) {
            model -= obj.ids.length;
        }

        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);

        const object = obj[obj.ids[Math.floor(model)]];
        mat4.scale(modelMatrix, modelMatrix, [object.x, object.y, object.z]);

        driver.drawModel(modelMatrix, object.visual);
        gui.bmpf.centeredText(400, 60, ""+object.id, 0);

        gui.bmpf.centeredText(400, 20, Math.round(1000.0 / avgDelta) + " FPS", 0);
        gui.bmpf.centeredText(400, 40, Math.floor(cam.pos[0])+","+Math.floor(cam.pos[1])+","+Math.floor(cam.pos[2]), 0);
        window.requestAnimationFrame(anim);
    };

    window.requestAnimationFrame(anim);

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
