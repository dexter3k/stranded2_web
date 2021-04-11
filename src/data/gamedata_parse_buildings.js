function parseBuildingsConfig(buildings, source) {
	const stream = new InfStream(source);
	let hadWarning = false;

	let obj = null;
	while (true) {
		const [line, key, value] = stream.readKeyValuePair();
		if (line == null) {
			break;
		}
		if (value == null) {
			if (key != "#" && key != "") {
				if (!hadWarning) {
					console.log("Failed to parse config line: " + line);
					hadWarning = true;
				}
			}
			continue;
		}

		switch (key) {
		case "id":
			if (obj != null) {
				buildings.set(obj.id, obj);
			}

			const id = parseInt(value);
			if (isNaN(id)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed id, skipping state: " + value);
				}
				obj = null;
				break;
			}
			obj = new BuildingInfo(id);
			break;
		case "group":
			if (obj != null) {
				obj.group = value;
			}
			break;
		case "script":
			let script = value;
			if (script == "start") {
				script = "";
				while (stream.remaining() != 0) {
					const [line, key, value] = stream.readKeyValuePair();
					if (line == null) {
						break;
					}
					if (key == "script" && value == "end") {
						break;
					}
					script += line + "\n";
				}
			}
			obj.script = CompileScript(script);
			break;
		default:
			if (!hadWarning) {
				console.log("Ignoring unknown config key: " + key);
				hadWarning = true;
			}
			break;
		}
	}

	if (obj != null) {
		buildings.set(obj.id, obj);
	}
}
