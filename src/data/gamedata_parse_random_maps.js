function parseRandomMapConfig(randomMaps, source) {
	const stream = new InfStream(source);
	console.log(source);

	let obj = null;
	let lastAmount = 0;
	let lastRange = null;
	let hadWarning = false;
	while (stream.remaining() != 0) {
		const [line, key, value] = stream.readKeyValuePair();
		if (line == null) {
			break;
		}
		if (key == "#" || key == "") {
			continue;
		}
		if (value == null) {
			if (!hadWarning) {
				hadWarning = true;
				console.log("Failed to parse random map config line: " + line);
			}
		}

		switch (key) {
		case "id":
			if (obj != null) {
				randomMaps.set(obj.id, obj);
			}

			const id = parseInt(value);
			if (isNaN(id)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed id, skipping random map: " + value);
				}
				obj = null;
				break;
			}
			obj = new RandomMapInfo(id);
			break;
		case "name":
			if (obj != null) {
				obj[key] = value;
			}
			break;
		case "amount":
		case "ratio":
			let amount = parseInt(value);
			if (isNaN(amount) || amount < 1 || amount > 100) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed ratio: " + value);
				}
				amount = 1;
			}
			lastAmount = amount;
			break;
		case "range":
			lastRange = null;
			if (value.indexOf(",") != -1) {
				const parts = value.split(",");
				if (parts.length == 2) {
					const r0 = parseFloat(parts[0]);
					const r1 = parseFloat(parts[1]);
					if (!isNaN(r0) && !isNaN(r1) && r0 <= r1) {
						lastRange = [r0, r1];
						break;
					}
				}
			} else {
				lastRange = null;
				switch (value) {
				case "land":
					lastRange = [0, 1000000];
					break;
				case "land and water":
					lastRange = [-1000000, 1000000];
					break;
				case "water":
					lastRange = [-10000000, 0];
					break;
				case "shore":
					lastRange = [-3, 3];
					break;
				case "hill":
					lastRange = [100, 1000000];
					break;
				case "shallow water":
					lastRange = [-3, -0.1];
					break;
				}
				if (lastRange != null) {
					break;
				}
			}

			if (!hadWarning) {
				hadWarning = true;
				console.log("Malformed range: " + value);
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
		case "object":
		case "objects": {
			if (lastAmount == 0 || lastRange == null || obj == null) {
				if (!hadWarning) {
					console.log("Ignoring object spawn def: " + value);
					hadWarning = true;
				}
				break;
			}

			const parts = value.split(",");
			for (let i = 0; i < parts.length; i++) {
				const id = parseInt(parts[i]);
				if (isNaN(id)) {
					if (!hadWarning) {
						console.log("Ignoring object spawn def: " + value);
						hadWarning = true;
					}
					continue;
				}
				obj.spawns.push({
					kind: "object",
					id: id,
					range: lastRange,
					amount: lastAmount,
				});
			}
			break;
		}
		case "unit":
		case "units": {
			if (lastAmount == 0 || lastRange == null || obj == null) {
				if (!hadWarning) {
					console.log("Ignoring unit spawn def: " + value);
					hadWarning = true;
				}
				break;
			}

			const parts = value.split(",");
			for (let i = 0; i < parts.length; i++) {
				const id = parseInt(parts[i]);
				if (isNaN(id)) {
					if (!hadWarning) {
						console.log("Ignoring unit spawn def: " + value);
						hadWarning = true;
					}
					continue;
				}
				obj.spawns.push({
					kind: "unit",
					id: id,
					range: lastRange,
					amount: lastAmount,
				});
			}
			break;
		}
		case "item":
		case "items": {
			if (lastAmount == 0 || lastRange == null || obj == null) {
				if (!hadWarning) {
					console.log("Ignoring item spawn def: " + value);
					hadWarning = true;
				}
				break;
			}

			const parts = value.split(",");
			for (let i = 0; i < parts.length; i++) {
				const id = parseInt(parts[i]);
				if (isNaN(id)) {
					if (!hadWarning) {
						console.log("Ignoring item spawn def: " + value);
						hadWarning = true;
					}
					continue;
				}
				obj.spawns.push({
					kind: "item",
					id: id,
					range: lastRange,
					amount: lastAmount,
				});
			}
			break;
		}
		default:
			if (!hadWarning) {
				console.log("Ignoring unknown random map config key: " + key);
				hadWarning = true;
			}
		}
	}

	if (obj != null) {
		randomMaps.set(obj.id, obj);
	}
}
