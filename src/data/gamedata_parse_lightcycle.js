function parseLightCycleConfig(cycle, source) {
	const stream = new InfStream(source);
	let hadWarning = false;

	let color = [255, 255, 255];

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

		const hour = parseInt(key);
		if (!(hour >= 0 && hour < 24)) {
			if (!hadWarning) {
				hadWarning = true;
				console.log("Failed to parse hour in light cycle config: " + line);
			}
			continue;
		}

		parts = value.split(",");
		if (parts.length < 3) {
			if (!hadWarning) {
				hadWarning = true;
				console.log("Not enough data for " + key);
			}
		} else {
			for (let com = 0; com < 3; com++) {
				let ch = parseInt(parts[com]);
				if (isNaN(ch)) {
					if (!hadWarning) {
						hadWarning = true;
						console.log("Unknown color value for " + key);
					}
					ch = 255;
				}

				if (ch > 255) {
					ch = 255;
				} else if (ch < 0) {
					ch = 0;
				}
				color[com] = ch;
			}
		}

		cycle[hour] = [...color];
	}
}
