async function loadMap(path, world, gui) {
    // Loading map
    gui.bmpf.loadingScreen(gui.strings.base[21], 1.0);
    data = await loadBinaryAsset("assets/Stranded II/" + path);
    const stream = new BinaryStream(data);
    // console.log(stream);

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

    const longObjects = false;
    const longUnits   = false;
    const longItems   = false;

    console.log(mapHeader);
    if (mapHeader.typeFormat != "") {
        console.log("TODO: typeFormat")
    }

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
    colormap.data = new Array(colormap.size * colormap.size * 4);
    for (let x = 0; x < colormap.size; x++) {
        for (let z = 0; z < colormap.size; z++) {
            const baseIndex = (colormap.size * (colormap.size - z - 1) + x) * 4
            colormap.data[baseIndex + 0] = stream.readByte();
            colormap.data[baseIndex + 1] = stream.readByte();
            colormap.data[baseIndex + 2] = stream.readByte();
            colormap.data[baseIndex + 3] = 0xff;
        }
    }
    // console.log("Colormap:");
    // console.log(colormap);

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
    // console.log(terrain);

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
    console.log(terrain);
    const terrainInfo = {
        heightmap: terrain,
        colormap: colormap,
        grassmap: grassmap,
    };
    world.init(mapVars, terrainInfo);

    // Now populate our world with units, buildings, trees and info points

    // Loading objects
    gui.bmpf.loadingScreen(gui.strings.base[25], 40.0);
    const objectCount = stream.readInt();
    console.log("Loading "+objectCount+" objects..");
    for (let i = 0; i < objectCount; i++) {
        const object = {
            id:        stream.readInt(),
            type:      longObjects ? stream.readShort() : stream.readByte(),
            x:         stream.readFloat(),
            y:         100,
            z:         stream.readFloat(),
            yaw:       stream.readFloat(),
            health:    stream.readFloat(),
            maxHealth: stream.readFloat(),
            timer:     stream.readInt(),
        };
        object.y = world.getTerrainHeight(object.x, object.z);
        world.placeObject(object);
        // console.log(object);
    }

    // Loading units
    gui.bmpf.loadingScreen(gui.strings.base[26], 70.0);
    const unitCount = stream.readInt();
    console.log("Loading "+unitCount+" units..");
    for (let i = 0; i < unitCount; i++) {
        const unit = {
            id:        stream.readInt(),
            type:      longUnits ? stream.readShort() : stream.readByte(),
            x:         stream.readFloat(),
            y:         stream.readFloat(),
            z:         stream.readFloat(),
            yaw:       stream.readFloat(),
            health:    stream.readFloat(),
            maxHealth: stream.readFloat(),
            hunger:    stream.readFloat(),
            thirst:    stream.readFloat(),
            stamina:   stream.readFloat(),
            aiX:       stream.readFloat(),
            aiZ:       stream.readFloat(),
        };
        // console.log(unit);
    }

    // Loading items
    gui.bmpf.loadingScreen(gui.strings.base[27], 80.0);
    const itemCount = stream.readInt();
    console.log("Loading "+itemCount+" items..");
    for (let i = 0; i < itemCount; i++) {
        const item = {
            id:       stream.readInt(),
            type:     longItems ? stream.readShort() : stream.readByte(),
            x:        stream.readFloat(),
            y:        stream.readFloat(),
            z:        stream.readFloat(),
            yaw:      stream.readFloat(),
            health:   stream.readFloat(),
            count:    stream.readInt(),
            unknown1: stream.readByte(),
            unknown2: stream.readByte(),
            unknown3: stream.readInt(),
        };
        // console.log(item);
    }

    // Loading infos
    gui.bmpf.loadingScreen(gui.strings.base[28], 90.0);
    const infoCount = stream.readInt();
    console.log("Loading "+infoCount+" infos..");
    for (let i = 0; i < infoCount; i++) {
        const info = {
            id:    stream.readInt(),
            type:  stream.readByte(),
            x:     stream.readFloat(),
            y:     stream.readFloat(),
            z:     stream.readFloat(),
            pitch: stream.readFloat(),
            yaw:   stream.readFloat(),
            data:  stream.readString(),
        };
        // console.log(info);
    }

    // Loading states
    gui.bmpf.loadingScreen(gui.strings.base[29], 92.0);
    const stateCount = stream.readInt();
    console.log("Loading "+stateCount+" states..");
    for (let i = 0; i < stateCount; i++) {
        const state = {
            type:   stream.readByte(),
            unk1:   stream.readByte(),
            unk2:   stream.readInt(),
            x:      stream.readFloat(),
            y:      stream.readFloat(),
            z:      stream.readFloat(),
            fx:     stream.readFloat(),
            fy:     stream.readFloat(),
            fz:     stream.readFloat(),
            int:    stream.readInt(),
            float:  stream.readFloat(),
            string: stream.readString(),
        };
        // console.log(state);
    }

    // Loading extensions
    gui.bmpf.loadingScreen(gui.strings.base[30], 95.0);
    const extCount = stream.readInt();
    console.log("Loading "+extCount+" extensions..");
    for (let i = 0; i < extCount; i++) {
        const ext = {
            type:  stream.readByte(),
            unk1:  stream.readByte(),
            unk2:  stream.readInt(),
            mode:  stream.readInt(),
            key:   stream.readString(),
            value: stream.readString(),
            stuff: stream.readString(),
        };
        // console.log(ext);
    }

    if (mapHeader.mode == "sav") {
        const pitch = stream.readFloat();
        const yaw = stream.readFloat();
    }

    for (let i = 0; i < 2; i++) {
        stream.readLine();
    }
    const mapNote = stream.readLine();
    if (mapNote != "www.unrealsoftware.de") {
        console.log("Unknown map note, map is possibly damaged: " + mapNote);
    } else if (mapHeader.mode == "map") {
        // attachments!
        if (stream.remaining() > 0) {
            console.log(stream.remaining() + " bytes left!");
        }
    }

    // load ambient sound file..

    // Setup environment
    gui.bmpf.loadingScreen(gui.strings.base[31], 97.0);

    // Spawn player at SP map
    gui.bmpf.loadingScreen(gui.strings.base[32], 100.0);

    if (mapHeader.mode == "map") {
        // on:start event
    }

    // on:load event

    // and we're done :)
}
