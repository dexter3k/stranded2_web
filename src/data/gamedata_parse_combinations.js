function parseCombinationsConfig(combinations, source) {
	const stream = new InfStream(source);
	let hadWarning = false;

	let combi = null;
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

		switch (key) {
		case "combi":
			if (value == "start") {
				combi = new CombinationInfo();
			} else if (value == "end" && combi != null) {
				combinations.push(combi);
				combi = null;
			}
			break;
		case "id":
			if (combi != null) {
				combi.id = value;
			}
			break;
		case "gen":
		case "req":
		case "genname":
			break; // todo
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
			combi.script = CompileScript(script);
			break;
		default:
			if (!hadWarning) {
				hadWarning = true;
				console.log("Ignoring unknown config key: " + key);
			}
			break;
		}
	}
}
