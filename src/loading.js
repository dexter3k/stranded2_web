async function loadMap(path, world, gui) {
    world.clearBeforeNewMap();

    // Loading map
    gui.bmpf.loadingScreen(gui.strings.base[21], 1.0);
    data = await loadBinaryAsset(world.gameData.modPath + path);
    const stream = new BinaryStream(data);

    // Loading map
    gui.bmpf.loadingScreen(gui.strings.base[21], 10.0);

    const comment = stream.readLine();
    if (comment.substr(0, 15) !== "### Stranded II") {
        console.log("Unknown map header: " + comment);
        // Should crash but let's continue at least for now
    }

    const header = {
        comment:    comment,
        version:    stream.readLine(),
        date:       stream.readLine(),
        time:       stream.readLine(),
        format:     stream.readLine(),
        mode:       stream.readLine(),
        typeFormat: stream.readLine(),
    };
    world.startMapLoading(header);

    let longObjects = false;
    let longUnits   = false;
    let longItems   = false;
    if (header.typeFormat != "") {
        console.log("TODO: typeFormat")
    }

    // 5 empty line padding
    for (let i = 0; i < 5; i++) {
        stream.readLine();
    }

    // Map preview image, skip when loading map
    stream.skipBytes(96 * 72 * 3);

    const pass = {
        salt:     stream.readByte(),
        password: stream.readLine(),
    };

    const vars = {
        day:         stream.readInt(),
        hour:        stream.readByte(),
        minute:      stream.readByte(),
        freezeTime:  stream.readBool(),
        skybox:      stream.readString(),
        multiplayer: stream.readBool(),
        climate:     stream.readByte(),
        music:       stream.readString(),
        script:      CompileScript(stream.readString()),
        fog:         [stream.readByte(), stream.readByte(), stream.readByte(), stream.readByte()],
    };
    console.log(vars);

    // Future extension
    stream.skipBytes(1);

    // Quick slot key mapping
    const quickslots = Array(10);
    for (let i = 0; i < 10; i++) {
        quickslots[i] = stream.readString();
    }
    console.log(quickslots);

    // Loading colormap
    gui.bmpf.loadingScreen(gui.strings.base[22], 20.0);

    const colormap = {
        size: stream.readInt(),
        data: null,
    };
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

    // Loading heightmap
    gui.bmpf.loadingScreen(gui.strings.base[23], 30.0);

    const terrain = {
        size: stream.readInt(),
        data: null,
    };
    if (terrain.size < 0) {
        terrain.size = 32;
    }
    terrain.data = new Array((terrain.size + 1) * (terrain.size + 1));
    for (let x = 0; x <= terrain.size; x++) {
        for (let y = 0; y <= terrain.size; y++) {
            terrain.data[(terrain.size+1) * y + x] = stream.readFloat();
        }
    }

    // Loading grassmap
    gui.bmpf.loadingScreen(gui.strings.base[24], 35.0);

    const grassmap = {
        size: colormap.size,
        data: new Array((colormap.size + 1) * (colormap.size + 1)),
    };
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
    world.preinitMapDuringLoading(vars, terrainInfo);

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
        world.placeUnit(unit);
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
        world.placeItem(item);
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
        world.placeInfo(info);
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
        world.placeState(state);
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
        world.addExtension(ext);
    }

    if (header.mode == "sav") {
        const pitch = stream.readFloat();
        const yaw = stream.readFloat();
        world.setPlayerRotation(pitch, yaw);
    }

    // skip empty lines..
    for (let i = 0; i < 2; i++) {
        stream.readLine();
    }

    const mapNote = stream.readLine();
    if (mapNote != "www.unrealsoftware.de") {
        console.log("Unknown map note, map is possibly damaged: " + mapNote);
    } else if (header.mode == "map") {
        // TODO: attachments!
        if (stream.remaining() > 0) {
            console.log(stream.remaining() + " bytes left for attachments!");
        }
    }

    world.finishMapLoading();
}
