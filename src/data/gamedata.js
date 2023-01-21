class Strings {
	constructor() {
		this.base = new Array(64);
		this.menu = new Array(256);
		this.editor = new Array(320);

		for (let i = 0; i < this.base.length; i++) {
			this.base[i] = `<missing base str ${i}>`;
		}
		for (let i = 0; i < this.menu.length; i++) {
			this.menu[i] = `<missing menu str ${i}>`;
		}
		for (let i = 0; i < this.editor.length; i++) {
			this.editor[i] = `<missing editor str ${i}>`;
		}
	}

	static format(str, v1="", v2="", v3="") {
		return str.replace(/\$1/, v1).replace(/\$2/, v2).replace(/\$3/, v3);
	}
}

class MaterialInfo {
	constructor(id, name, swim, noFire, hardness) {
		this.id = id;
		this.name = name;
		this.swim = swim;
		this.noFire = noFire;
		this.hardness = hardness;
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
		this.frame = 0;
		this.icon = 0;
		this.script = null;
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

// Const Cclass_global=0,Cclass_world=0		;Global/World
// Const Cclass_object=1						;Object Class ID
// Const Cclass_unit=2							;Unit Class ID
// Const Cclass_item=3							;Item Class ID
// Const Cclass_info=4							;Info Class ID
// Const Cclass_state=5						;State Class ID
// Const Cclass_building=150					;Building Class (for Groups)

class GroupInfo {
	// GroupInfo(class, "tree", "Tree");
	constructor(klass, group, name) {
		this.type = klass;
		this.group = group;
		this.name = name;
		if (name == "") {
			this.name = group;
		}
	}
}

// Includes objects, units and items!
class ObjectInfo {
	constructor(id) {
		this.id = id;
		this.name = `<object ${id}>`;
		this.description = this.name;

		this.iconPath = null;
		this.iconHandle = 0;
		this.modelPath = null;
		this.modelHandle = null;

		this.scale = [1.0, 1.0, 1.0];
		this.color = [255, 255, 255];
		this.alpha = 1.0;
		this.shine = 1.0;

		this.autofade = 500;
		this.swaySpeed = 0.0;
		this.swayPower = 1.0;
		this.health = 500.0;
		this.healthChange = 0.0;
		this.col = 1; // ?
		this.searchRatio = 30.0; // ?
		this.maxWeight = 100 * 1000;
		this.ined = 1; // ?
		this.growTime = 10; // ?
		this.fx = null;
		this.mat = null;
		this.state = null;
		this.behaviour = null;
		this.script = null;
		this.inEditor = false;
		this.group = null;
		this.detailtex = null;
	}

	async preloadMedia(driver, gameData) {
		if (this.modelPath == null) {
			if (this.model != null) {
				this.modelPath = this.model;
			} else {
				// todo: this could be something other than an item!
				this.modelPath = gameData.game.defaultItemModel;
			}
		}

		const m = new Model(this.modelPath, driver);
		this.modelHandle = m;
		await m.load();

		if (m.textures != null) {
			for (let i = 0; i < m.textures.length; i++) {
				const texturePath = removeFilenameFromPath(gameData.modPath + this.modelPath) + m.textures[i].path;
				m.textures[i].id = await loadTexture(driver.gl, texturePath);
			}
		}
	}
}

// sigh.. sorry.
class InfoInfo {
	constructor(id) {
		this.id = id;
		this.name = `<info ${id}>`;
		this.group = "stuff";
		this.frame = 0;
		this.description = this.name;
	}
}

class CombinationInfo {
	constructor() {
		this.id = "";
		this.script = null;
		this.gen = new Array();
		this.req = new Array();
		this.genname = "";
	}
}

class BuildingInfo {
	constructor(id) {
		this.id = id;
		this.group = -1;
		this.object = -1;
		this.unit = -1;
		this.req = new Map();
		this.script = null;
		this.buildSpace = "default";
		this.atObject = new Array();
	}
}

class Gamedata {
	constructor(mod) {
		this.mod = mod;
		this.modPath = "assets/" + mod + "/";

		this.strings = new Strings();

		this.materials = new Array();
		this.materialByName = new Map();

		this.states = new Map();

		this.lightCycle = new Array(24);

		this.game = new GameInfo();

		this.groups = new Array();

		// These are id->value maps, where ids are integers
		// but since those are not sequential we cannot use
		// basic arrays, hope maps are ok
		this.objects = new Map();
		this.units = new Map();
		this.items = new Map();
		this.infos = new Map();

		this.combinations = new Array();
		this.buildings = new Map();
	}

	async loadStrings() {
		const files = [
			"sys/strings.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseStringsConfig(this.strings, source);
		}
	}

	async loadMaterials(driver, gui) {
		this.materials.push(new MaterialInfo( 0,  "none", 0, 0, 1));
		this.materials.push(new MaterialInfo( 1,  "wood", 1, 0, 1));
		this.materials.push(new MaterialInfo( 2, "stone", 0, 1, 2));
		this.materials.push(new MaterialInfo( 3,  "dirt", 0, 1, 1));
		this.materials.push(new MaterialInfo( 4,  "dust", 0, 1, 1));
		this.materials.push(new MaterialInfo( 5,  "leaf", 1, 0, 0));
		this.materials.push(new MaterialInfo( 6, "metal", 0, 1, 2));
		this.materials.push(new MaterialInfo( 7, "flesh", 0, 0, 1));
		this.materials.push(new MaterialInfo( 8, "water", 0, 1, 0));
		this.materials.push(new MaterialInfo( 9,  "lava", 0, 0, 0));
		this.materials.push(new MaterialInfo(10, "fruit", 0, 0, 1));
		this.materials.push(new MaterialInfo(11, "glass", 0, 1, 2));

		for (const mat of this.materials) {
			this.materialByName.set(mat.name, mat);
		}
		// console.log(this.materials);
	}

	async loadStates(driver, gui) {
		const files = [
			"sys/states.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseStatesConfig(this.states, source);
		}
		// console.log(this.states);
	}

	async loadLightCycle(driver, gui) {
		const files = [
			"sys/lightcycle.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseLightCycleConfig(this.lightCycle, source);
		}
		// console.log(this.lightCycle);
	}

	async loadGame() {
		const files = [
			"sys/game.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseGameConfig(this.game, source);
		}
		// console.log(this.game);
	}

	async loadGroups(driver, gui) {
		const files = [
			"sys/groups.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseGroupsConfig(this.groups, source);
		}
		// console.log(this.groups);
	}

	async loadObjects(driver, gui) {
		// Parsing actual object inf does not take much time
		// What takes time is loading models and textures for these
		// objects, so we only show loading screen for that!

		// TODO: somehow determine what object configs we have on remote!
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
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseObjectsConfig(this.objects, source);
		}

		// Load media while updating loading screen..
		let work = [];
		for (const object of this.objects.values()) {
			work.push(object.preloadMedia(driver, this));
		}
		await doAllWithCounter(work, function(done) {
			gui.bmpf.loadingScreen(gui.strings.base[3], Math.round(25 + 35 * done / work.length));
		});
	}

	async loadUnits(driver, gui) {
		const files = [
			"sys/units.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseUnitsConfig(this.units, source);
		}

		// Load media while updating loading screen..
		let work = [];
		for (let unit of this.units.values()) {
			work.push(unit.preloadMedia(driver, this));
		}
		await doAllWithCounter(work, function(done) {
			gui.bmpf.loadingScreen(gui.strings.base[4], Math.round(65 + 15 * done / work.length));
		});
	}

	async loadItems(driver, gui) {
		const files = [
			"sys/items.inf",
			"sys/items_edible.inf",
			"sys/items_material.inf",
			"sys/items_stuff.inf",
			"sys/items_tools.inf",
			"sys/items_weapons.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseItemsConfig(this.items, source);
		}

		// Load media while updating loading screen..
		let work = [];
		for (let item of this.items.values()) {
			work.push(item.preloadMedia(driver, this));
		}
		await doAllWithCounter(work, function(done) {
			gui.bmpf.loadingScreen(gui.strings.base[5], Math.round(80 + 18 * done / work.length));
		});

		// console.log(this.items);
	}

	async loadInfos(driver, gui) {
		const files = [
			"sys/infos.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseInfosConfig(this.infos, source);
		}

		// console.log(this.infos);
	}

	async loadCombinations(driver, gui) {
		const files = [
			"sys/combinations.inf",
			"sys/combinations_actions.inf",
			"sys/combinations_ammo.inf",
			"sys/combinations_basic.inf",
			"sys/combinations_potions.inf",
			"sys/combinations_stuff.inf",
			"sys/combinations_tools.inf",
			"sys/combinations_weapons.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseCombinationsConfig(this.combinations, source);
		}
		// console.log(this.combinations);
	}

	async loadBuildings(driver, gui) {
		const files = [
			"sys/buildings.inf",
		];
		for (const path of files) {
			const source = await loadTextAsset(this.modPath + path);
			parseBuildingsConfig(this.buildings, source);
		}
		// console.log(this.buildings);
	}
}
