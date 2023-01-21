function parseObjectsConfig(objects, source) {
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
		case "find":
		case "state":
		case "spawn":
		case "var":
		case "color":
			// TODO
			break;
		case "id":
			if (obj != null) {
				objects.set(obj.id, obj);
			}

			const id = parseInt(value);
			if (isNaN(id)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed id, skipping object: " + value);
				}
				obj = null;
				break;
			}
			obj = new ObjectInfo(id, "object");
			break;
		case "mat":
		case "name":
		case "group":
		case "icon":
		case "behaviour":
		case "detailtex":
			if (obj != null) {
				obj[key] = value;
			}
			break;
		case "model":
			if (obj != null) {
				obj.modelPath = value;
			}
			break;
		case "x":
		case "y":
		case "z":
		case "scale":
		case "health":
		case "swayspeed":
		case "swaypower":
		case "healthchange":
		case "alpha":
		case "shine":
			const fl = parseFloat(value);
			if (isNaN(fl)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed float, skipping key: " + key + " = " + value);
				}
			} else if (obj != null) {
				if (key == "scale") {
					obj.x = fl;
					obj.y = fl;
					obj.z = fl;
				} else {
					obj[key] = fl;
				}

				if (key == "health") {
					obj.healthchange = obj.health / 10;
				}
			}
			break;
		case "fx":
		case "col":
		case "maxweight":
		case "growtime":
		case "editor":
		case "autofade":
		case "r":
		case "g":
		case "b":
			const integer = parseInt(value);
			if (isNaN(integer)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed int, skipping key: " + key + " = " + value);
				}
			} else if (obj != null) {
				obj[key] = integer;
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
		objects.set(obj.id, obj);
	}
}
