function parseGameConfig(game, source) {
	const stream = new InfStream(source);
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
				console.log("Failed to parse game config line: " + line);
			}
		}

		let parts = [];

		switch (key) {
		case "menu_adventure":
		case "menu_random":
		case "menu_loadsave":
		case "menu_singleplayer":
		case "menu_multiplayer":
		case "menu_editor":
		case "menu_credits":
			game.menu[key.substr(5)] = !(value == "" || value == "0");

			break;
		case "terrain_color_normal":
		case "terrain_color_desert":
		case "terrain_color_snow":
		case "terrain_color_swamp":
			parts = value.split(",");
			if (parts.length < 9) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Not enough data for " + key);
				}
				break;
			}

			for (let depth = 0; depth < 3; depth++) {
				for (let com = 0; com < 3; com++) {
					let color = parseInt(parts[depth*3 + com]);
					if (isNaN(color)) {
						if (!hadWarning) {
							hadWarning = true;
							console.log("Unknown color value for " + key);
						}
						color = 255;
					}

					if (color > 255) {
						color = 255;
					} else if (color < 0) {
						color = 0;
					}

					game.terrainColor[key.substr(14)][depth][com] = color;
				}
			}

			break;
		case "exhaust_move":
		case "exhaust_swim":
		case "exhaust_jump":
		case "exhaust_attack":
			parts = value.split(",");
			for (let i = 0; i < 3; i++) {
				let value = parseFloat(parts[i]);
				if (isNaN(value)) {
					if (!hadWarning) {
						hadWarning = true;
						console.log("Unknown exhaust value for " + key);
					}
					continue;
				}

				if (value < 0) {
					value = 0;
				}

				game.exhaustRates[key.substr(8)][i] = value;
			}

			break;
		case "exhausted_damage":
			parts = value.split(",");
			for (let i = 0; i < 3; i++) {
				let value = parseFloat(parts[i]);
				if (isNaN(value)) {
					if (!hadWarning) {
						hadWarning = true;
						console.log("Unknown exhaust value for " + key);
					}
					continue;
				}

				if (value < 0.0) {
					value = 0.0;
				}

				game.minStats[i] = value;
			}

			break;
		case "default_itemmodel":
			game.defaultItemModel = normalizePath(value);

			break;
		case "jumpfactor":
		case "dive_damage":
			const number = parseFloat(value);
			if (isNaN(number)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed float, skipping key: " + key + " = " + value);
				}
				break;
			}

			if (key == "dive_damage") {
				game.diveDamage = number;
			} else if (key == "jumpfactor") {
				game.jumpFactor = number;
			} else {
				game[key] = number;
			}

			break;
		case "dive_time":
		case "healthsystem":
		case "projectile_lifetime":
		case "firerange":
		case "dig_time":
		case "fish_time":
		case "jumptime":
		case "rainratio":
		case "snowratio":
		case "gore":
		case "waverate":
		case "minwavespace":
		case "combiscreen":
		case "scriptlooptimeout":
		case "showemptybuildinggroups":
		case "firelightsize":
		case "firelightbrightness":
			const integer = parseInt(value);
			if (isNaN(integer)) {
				if (!hadWarning) {
					hadWarning = true;
					console.log("Malformed int, skipping key: " + key + " = " + value);
				}
				break;
			}

			if (key == "dive_time") {
				game.diveTime = integer;
			} else if (key == "healthsystem") {
				game.healthSystem = integer;
			} else if (key == "projectile_lifetime") {
				game.projectileLifetime = integer;
			} else if (key == "firerange") {
				game.fireRange = integer;
			} else if (key == "dig_time") {
				game.digTime = integer;
			} else if (key == "fish_time") {
				game.fishTime = integer;
			} else if (key == "jumptime") {
				game.jumpTime = integer;
			} else if (key == "rainratio") {
				game.rainRate = integer;
			} else if (key == "snowratio") {
				game.snowRate = integer;
			} else if (key == "gore") {
				game.gore = integer != 0;
			} else if (key == "waverate") {
				game.waveRate = integer;
			} else if (key == "minwavespace") {
				game.minWaveSpace = integer;
			} else if (key == "combiscreen") {
				game.combinationScreen = integer;
			} else if (key == "scriptlooptimeout") {
				game.scriptLoopTimeout = integer;
			} else if (key == "showemptybuildinggroups") {
				game.showEmptyBuildingGroups = integer != 0;
			} else if (key == "firelightsize") {
				game.fireLightSize = integer;
			} else if (key == "firelightbrightness") {
				game.fireLightBrightness = integer;
				if (game.fireLightBrightness < 0) {
					game.fireLightBrightness = 0;
				} else if (game.fireLightBrightness > 255) {
					game.fireLightBrightness = 255;
				}
			} else {
				game[key] = integer;
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
			game.script = CompileScript(script);

			break;
		case "limit_objects":
		case "limit_units":
		case "limit_items":
			break;
		default:
			if (!hadWarning) {
				hadWarning = true;
				console.log("Ignoring unknown config key: " + key);
			}
		}
	}
}
