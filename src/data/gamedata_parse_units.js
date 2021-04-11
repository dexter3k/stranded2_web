function parseUnitsConfig(units, source) {
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
				units.set(obj.id, obj);
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
			obj = new ObjectInfo(id, "unit");
			break;
		case "mat":
		case "name":
		case "group":
		case "icon":
		case "model":
		case "behaviour":
			if (obj != null) {
				obj[key] = value;
			}
			break;
		case "x":
		case "y":
		case "z":
		case "scale":
		case "health":
		case "healthchange":
		case "alpha":
		case "shine":
		case "colxr":
		case "colyr":
		case "store":
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
		case "editor":
		case "autofade":
		case "r":
		case "g":
		case "b":
		case "gt":
		case "loopmoveani":
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
			if (obj != null) {
				obj.script = CompileScript(script);;
			}
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
		units.set(obj.id, obj);
	}
}
