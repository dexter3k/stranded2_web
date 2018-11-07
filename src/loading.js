async function loadMap(path, world, gui) {
    gui.bmpf.loadingScreen(gui.strings.base[21], 1.0);
    data = await loadBinaryAsset("assets/Stranded II/" + path);
    const stream = new BinaryStream(data);
    console.log(stream);

    gui.bmpf.loadingScreen(gui.strings.base[21], 10.0);

    let mapHeader = {};
    mapHeader.comment = stream.readLine();
    if (mapHeader.comment.substr(0, 15) !== "### Stranded II") {
        console.log("Unknown map header: " + comment);
        // Should crash but let's continue
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

    // Map preview image
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

    gui.bmpf.loadingScreen(gui.strings.base[23], 30.0);

    let terrain = {};
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

    gui.bmpf.loadingScreen(gui.strings.base[24], 35.0);

    let grassmap = {};
    grassmap.size = colormap.size;
    grassmap.data = [];
    for (let x = 0; x <= grassmap.size; x++) {
        for (let y = 0; y <= grassmap.size; y++) {
            grassmap.data[(grassmap.size+1) * y + x] = stream.readBool(); // Bool, presence
        }
    }

    const terrainInfo = {
        heightmap: terrain,
        colormap: colormap,
        grassmap: grassmap,
    };
    await world.init(mapVars, terrainInfo);

    gui.bmpf.loadingScreen(gui.strings.base[25], 40.0);

    // gui.bmpf.loadingScreen(gui.strings.base[26], 70.0);
    // gui.bmpf.loadingScreen(gui.strings.base[27], 80.0);
    // gui.bmpf.loadingScreen(gui.strings.base[28], 90.0);
    // gui.bmpf.loadingScreen(gui.strings.base[29], 92.0);
    // gui.bmpf.loadingScreen(gui.strings.base[30], 95.0);
    // gui.bmpf.loadingScreen(gui.strings.base[31], 97.0);
    // gui.bmpf.loadingScreen(gui.strings.base[32], 100.0);
}
