async function loadMap(path, world, gui) {
    // Loading map
    gui.bmpf.loadingScreen(gui.strings.base[21], 1.0);
    data = await loadBinaryAsset("assets/Stranded II/" + path);
    const stream = new BinaryStream(data);
    console.log(stream);

    // Loading map
    gui.bmpf.loadingScreen(gui.strings.base[21], 10.0);

    let mapHeader = {};
    mapHeader.comment = stream.readLine();
    if (mapHeader.comment.substr(0, 15) !== "### Stranded II") {
        console.log("Unknown map header: " + comment);
        // Should crash but let's continue at least for now
    }
    mapHeader.version = stream.readLine();
    mapHeader.date = stream.readLine();
    mapHeader.time = stream.readLine();
    mapHeader.format = stream.readLine();
    mapHeader.mode = stream.readLine();
    mapHeader.typeFormat = stream.readLine();

    console.log(mapHeader);

    // 5 empty line padding
    for (let i = 0; i < 5; i++) {
        stream.readLine();
    }

    // Map preview image, skip when loading map
    stream.skipBytes(96 * 72 * 3);

    let passHeader = {};
    passHeader.salt = stream.readByte();
    passHeader.password = stream.readLine();

    let mapVars = {};
    mapVars.day = stream.readInt();
    mapVars.hour = stream.readByte();
    mapVars.minute = stream.readByte();
    mapVars.freezeTime = stream.readByte() !== 0 ? true : false;
    mapVars.skybox = stream.readString();
    mapVars.multiplayer = stream.readByte() !== 0 ? true : false;
    mapVars.climate = stream.readByte();
    mapVars.music = stream.readString();
    mapVars.script = stream.readString();
    mapVars.fog = [];
    mapVars.fog[0] = stream.readByte();
    mapVars.fog[1] = stream.readByte();
    mapVars.fog[2] = stream.readByte();
    mapVars.fog[3] = stream.readByte();

    console.log(mapVars);

    // Future extension
    stream.skipBytes(1);

    // Quick slot key mapping
    let quickslots = [];
    for (let i = 0; i <= 9; i++) {
        quickslots[i] = stream.readString();
    }
    console.log(quickslots);

    // Loading colormap
    gui.bmpf.loadingScreen(gui.strings.base[22], 20.0);

    let colormap = {};
    colormap.size = stream.readInt();
    colormap.data = [];
    for (let x = 0; x < colormap.size; x++) {
        for (let y = 0; y < colormap.size; y++) {
            colormap.data[colormap.size * y + x] = 0;
            stream.skipBytes(3); // R G B of the image
        }
    }
    console.log(colormap);

    // Loading heightmap
    gui.bmpf.loadingScreen(gui.strings.base[23], 30.0);

    let terrain = {};
    // Size is in cells x/y, not actual height points
    terrain.size = stream.readInt();
    terrain.data = [];
    if (terrain.size < 0) {
        terrain.size = 32;
    }
    for (let x = 0; x <= terrain.size; x++) {
        for (let y = 0; y <= terrain.size; y++) {
            terrain.data[(terrain.size+1) * y + x] = stream.readFloat();
        }
    }
    console.log(terrain);

    // Loading grassmap
    gui.bmpf.loadingScreen(gui.strings.base[24], 35.0);

    let grassmap = {};
    grassmap.size = colormap.size;
    grassmap.data = [];
    for (let x = 0; x <= grassmap.size; x++) {
        for (let y = 0; y <= grassmap.size; y++) {
            grassmap.data[(grassmap.size+1) * y + x] = stream.readBool(); // Bool, presence
        }
    }

    // We have parsed all basic world visuals which we can now render.
    const terrainInfo = {
        heightmap: terrain,
        colormap: colormap,
        grassmap: grassmap,
    };
    world.init(mapVars, terrainInfo);

    // Now populate our world with units, buildings, trees and info points

    // Loading objects
    gui.bmpf.loadingScreen(gui.strings.base[25], 40.0);

    // gui.bmpf.loadingScreen(gui.strings.base[26], 70.0);
    // gui.bmpf.loadingScreen(gui.strings.base[27], 80.0);
    // gui.bmpf.loadingScreen(gui.strings.base[28], 90.0);
    // gui.bmpf.loadingScreen(gui.strings.base[29], 92.0);
    // gui.bmpf.loadingScreen(gui.strings.base[30], 95.0);
    // gui.bmpf.loadingScreen(gui.strings.base[31], 97.0);
    // gui.bmpf.loadingScreen(gui.strings.base[32], 100.0);
}
