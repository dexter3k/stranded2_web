function parseGroupsConfig(groups, source) {
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

		parts = value.split(",");
		if (parts.length < 1) {
			if (!hadWarning) {
				hadWarning = true;
				console.log("Not enough data for " + key);
			}
			continue;
		}

		let group = parts[0];
		let name = group;
		if (parts.length > 1) {
			name = parts[1];
		}

		let klass = 0;
		switch (key) {
		case "object":
			klass = 1;
			break;
		case "unit":
			klass = 2;
			break;
		case "item":
			klass = 3;
			break;
		case "info":
			klass = 4;
			break;
		case "building":
			klass = 150;
			break;
		default:
			if (!hadWarning) {
				hadWarning = true;
				console.log(`Group class ${key} is not allowed. Only object, unit, item, info and building are allowed`);
			}
			continue;
		}
		groups.push(new GroupInfo(klass, group, name));
	}
}
