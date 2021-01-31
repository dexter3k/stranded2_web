function Objects() {
	this.ids = [];

	this.parse = function(text) {
		const stream = new InfStream(text);
		let obj = null;
		let hadWarning = false;
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
					this[obj.id] = obj;
					this.ids.push(obj.id);
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
				obj = new Object(id);
				break;
			case "mat":
			case "name":
			case "group":
			case "icon":
			case "model":
			case "behaviour":
			case "detailtex":
				if (obj != null) {
					obj[key] = value;
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
			case "description":
			case "script":
				const startKey = key;
				let script = value;
				if (script == "start") {
					script = "";
					while (stream.remaining() != 0) {
						const [line, key, value] = stream.readKeyValuePair();
						if (line == null) {
							break;
						}
						if (key == startKey && value == "end") {
							break;
						}
						script += line + "\n";
					}
				}
				if (obj != null) {
					obj[startKey] = script;
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
			this[obj.id] = obj;
			this.ids.push(obj.id);
		}
	};

	this.load = async function(driver, gui) {
		const files = [
			"sys/objects.inf",
			"sys/objects_buildings.inf",
			"sys/objects_bushes.inf",
			"sys/objects_flowers.inf",
			"sys/objects_gras.inf",
			"sys/objects_palms.inf",
			"sys/objects_stone.inf",
			"sys/objects_stuff.inf",
			"sys/objects_trees.inf",
		];
		for (let i = 0; i < files.length; i++) {
			const source = await loadTextAsset("assets/Stranded II/" + files[i]);
			this.parse(source);
		}
		for (let i = 0; i < this.ids.length; i++) {
			gui.bmpf.loadingScreen(gui.strings.base[3], Math.round(25 + 35 * i / this.ids.length));
			await this[this.ids[i]].preloadMedia(driver);
		}
	};
}
