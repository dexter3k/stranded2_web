function parseInfosConfig(infos, source) {
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
				infos.set(obj.id, obj);
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
			obj = new InfoInfo(id);
			break;
		case "name":
			if (obj == null) {
				break;
			}

			obj.name = value;

			break;
		case "group":
			if (obj != null) {
				obj.group = value;
			}
			break;
		case "frame":
			const integer = parseInt(value);
			if (isNaN(integer)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed int, skipping key: " + key + " = " + value);
				}
			} else if (obj != null) {
				obj.frame = integer;
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
		case "description":
			let description = value;
			if (description == "start") {
				description = "";
				while (stream.remaining() != 0) {
					const [line, key, value] = stream.readKeyValuePair();
					if (line == null) {
						break;
					}
					if (key == "description" && value == "end") {
						break;
					}
					description += line + "\n";
				}
			}
			obj.description = description;

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
		infos.set(obj.id, obj);
	}
}
