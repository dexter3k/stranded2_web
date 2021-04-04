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
}

class GroupInfo {
	constructor(type, id, name) {
		this.type = type;
		this.id = id;
		this.name = name;
		if (name == "") {
			this.name = id;
		}
	}
}

class Gamedata {
	constructor(mod) {
		this.mod = mod;
		this.modPath = "assets/" + mod + "/";

		this.game = new GameInfo();
		this.groups = {};
		this.states = [];
	}

	async loadGame() {
		const source = await loadTextAsset(this.modPath + "sys/game.inf");
		parseGameConfig(this.game, source);
		console.log(this.game);
	}
}
