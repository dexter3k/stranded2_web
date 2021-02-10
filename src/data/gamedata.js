class ObjectInfo {
	constructor() {
	}
}

class UnitInfo {
	constructor() {
	}
}

class ItemInfo {
	constructor() {
	}
}

// Following are builtin states:
// Bleeding        = 1
// Intoxication    = 2
// Pus             = 3
// Fire            = 4
// Eternal Fire    = 5
// Frostbite       = 6
// Fracture        = 7
// Electroshock    = 8
// Bloodrush       = 9
// Dizzy           = 10
// Wet             = 11
// Fuddle          = 12
// Healing         = 16
// Invulnerability = 17
// Tame            = 18
// Action          = 21
// Flare           = 22
// Smoke           = 23
// Light           = 24
// Particles       = 25

// Following cannot be defined via config, but are used ingame
// Physical      = 51
// Buildplace    = 52
// Linked        = 53
// Speedmod      = 54
// NoCollision   = 55
// StaticAi      = 60
// ProcessBuild  = 100
// ProcessDig    = 151
// ProcessFish   = 152
// ProcessCustom = 153

class StateInfo {
	constructor(id) {
		this.id = id;
		this.name = `<state ${id}>`;
		this.icon = "sys/gfx/states.bmp";
		this.frame = 29; // 0-29, inclusive
		this.script = null;
		this.description = "";
	}
}

class GameInfo {
	constructor() {
		this.menu = {
			adventure:    true,
			random:       true,
			loadsave:     true,
			singleplayer: true,
			multiplayer:  false,
			editor:       true,
			credits:      true,
		};

		this.terrainColor = {
			normal: [[230, 223, 145], [ 69, 138,  13], [160, 172, 125]],
			desert: [[230, 223, 145], [254, 243, 118], [245, 204,  61]],
			snow:   [[200, 224, 230], [255, 255, 255], [100, 100, 100]],
			swamp:  [[159, 206,   0], [135, 174,   0], [ 70, 104,  72]],
		};

		// 1+ - health bar
		// 2+ - hunger bar
		// 3+ - thirst bar
		// 4+ - stamina bar
		// This only affects GUI display
		this.healthSystem = 4;

		// Hunger, thirst, stamina
		this.exhaustRates = {
			move:   [0.02, 0.02, 0.016],
			swim:   [0.06, 0.05, 0.06],
			jump:   [0.80, 0.80, 0.80],
			attack: [0.15, 0.15, 0.15],
		};
		this.minStats = [5.0, 5.0, 5.0];

		this.diveTime = 20 * 1000;
		this.diveDamage = 10.0;

		this.defaultItemModel = "gfx/bag.b3d";

		this.projectileLifetime = 15 * 1000;

		this.fireRange = 50.0;
		this.fireLightSize = 60.0;
		this.fireLightBrightness = 160.0;

		this.waveRate = 3500.0;
		this.minWaveSpace = 300.0;

		this.digTime = 2.5 * 1000.0;
		this.fishTime = 5.5 * 1000.0;

		this.rainRate = 10.0;
		this.snowRate = 30.0;

		this.jumpTime = 450.0;
		this.jumpFactor = 1.1;

		this.scriptLoopTimeout = 5 * 1000.0;

		// honestly no idea
		this.combinationScreen = 2;

		this.showEmptyBuildingGroups = false;

		// item, object, unit limits are ignored.

		this.gore = true;

		this.script = null;
	}

	parse(source) {
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
				this.menu[key.substr(5)] = !(value == "" || value == "0");

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

						this.terrainColor[key.substr(14)][depth][com] = color;
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

					this.exhaustRates[key.substr(8)][i] = value;
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

					this.minStats[i] = value;
				}

				break;
			case "default_itemmodel":
				this.defaultItemModel = normalizePath(value);

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
					this.diveDamage = number;
				} else if (key == "jumpfactor") {
					this.jumpFactor = number;
				} else {
					this[key] = number;
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
					this.diveTime = integer;
				} else if (key == "healthsystem") {
					this.healthSystem = integer;
				} else if (key == "projectile_lifetime") {
					this.projectileLifetime = integer;
				} else if (key == "firerange") {
					this.fireRange = integer;
				} else if (key == "dig_time") {
					this.digTime = integer;
				} else if (key == "fish_time") {
					this.fishTime = integer;
				} else if (key == "jumptime") {
					this.jumpTime = integer;
				} else if (key == "rainratio") {
					this.rainRate = integer;
				} else if (key == "snowratio") {
					this.snowRate = integer;
				} else if (key == "gore") {
					this.gore = integer != 0;
				} else if (key == "waverate") {
					this.waveRate = integer;
				} else if (key == "minwavespace") {
					this.minWaveSpace = integer;
				} else if (key == "combiscreen") {
					this.combinationScreen = integer;
				} else if (key == "scriptlooptimeout") {
					this.scriptLoopTimeout = integer;
				} else if (key == "showemptybuildinggroups") {
					this.showEmptyBuildingGroups = integer != 0;
				} else if (key == "firelightsize") {
					this.fireLightSize = integer;
				} else if (key == "firelightbrightness") {
					this.fireLightBrightness = integer;
					if (this.fireLightBrightness < 0) {
						this.fireLightBrightness = 0;
					} else if (this.fireLightBrightness > 255) {
						this.fireLightBrightness = 255;
					}
				} else {
					this[key] = integer;
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
				this.script = CompileScript(script);

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
}

class Gamedata {
	constructor(mod) {
		this.mod = mod;
		this.modPath = "assets/" + mod + "/";

		this.game = new GameInfo();
		this.states = [];
	}

	async loadGame() {
		const source = await loadTextAsset(this.modPath + "sys/game.inf");
		this.game.parse(source);
		console.log(this.game);
	}
}
