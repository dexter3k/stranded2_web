function Gui(driver) {
    this.driver = driver;
    this.bmpf = new Bmpf(driver);

    this.load = async function() {
        await this.bmpf.load();
    };
}

async function main() {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    const driver = new Driver(gl, 800, 600);
    const gui = new Gui(driver);
    await gui.load();

    const strings = new Strings();
    gui.bmpf.loadingScreen("Loading translations", 0.0);
    await strings.load();
    gui.bmpf.loadingScreen(strings.base[1], 6.0);

    // // For now, this is just a dummy load to see loading bar going
    // const textures = await loadTextures(gl, "assets/Stranded II/", [
    //     "sys/gfx/bigbutton.bmp",
    //     "sys/gfx/bigbutton_over.bmp",
    //     "sys/gfx/cursor.bmp",
    //     "sys/gfx/cursor_crosshair.bmp",
    //     "sys/gfx/cursor_height.bmp",
    //     "sys/gfx/cursor_move.bmp",
    //     "sys/gfx/cursor_paint.bmp",
    //     "sys/gfx/cursor_rotate.bmp",
    //     "sys/gfx/cursor_text.bmp",
    // ]);
    // console.log(textures);

    // gui.bmpf.loadingScreen("Loading game..  Init", 75.0);

    // const sleep = (milliseconds) => {
    //     return new Promise(resolve => setTimeout(resolve, milliseconds))
    // }
    // for (var i = 0; i <= 100; i++) {
    //     gui.bmpf.loadingScreen("Loading...", i);
    //     await sleep(100);
    // }

    // function render() {
    //     driver.clearScene();
    // };
    // render();
}
