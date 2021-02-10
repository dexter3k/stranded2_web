function isAlpha(c) {
	if (c >= "a" && c <= "z") {
		return true;
	}
	if (c >= "A" && c <= "Z") {
		return true;
	}
	return c == "_";
}

function isNumeric(c) {
	if (c >= "0" && c <= "9") {
		return true;
	}
	return false;
}

function isAlphanumeric(c) {
	if (c >= "a" && c <= "z") {
		return true;
	}
	if (c >= "A" && c <= "Z") {
		return true;
	}
	if (c >= "0" && c <= "9") {
		return true;
	}
	return c == "_";
}

class StringToken {
	constructor(data) {
		this.data = data;
	}
}

class IdentifierToken {
	constructor(data) {
		this.data = data;
	}
}

class NumberToken {
	constructor(data) {
		this.data = data;
	}
}

class SpecialToken {
	constructor(data) {
		this.data = data;
	}
}

class UnknownToken {
	constructor(data) {
		this.data = data;
	}
}

class Tokenizer {
	constructor(source) {
		this.source = source;
		this.position = 0;
		this.lookahead = null;
		this.nextCharacter(); // skip lookahead
	}

	next() {
		for (let c = this.nextCharacter(); c != null; c = this.nextCharacter()) {
			if (c == " " || c == "\n" || c == "\r" || c == "\t" || c == "¦") {
				continue;
			}
			if (c == "/" && this.lookahead == "/") {
				while (this.lookahead != null && this.lookahead != "\n") {
					this.nextCharacter();
				}
				continue;
			}
			if (isAlpha(c)) {
				let token = "" + c;
				while (isAlphanumeric(this.lookahead)) {
					token = token + this.nextCharacter();
				}
				return new IdentifierToken(token);
			}
			if (isNumeric(c)) {
				let token = "" + c;
				while (isNumeric(this.lookahead)) {
					token = token + this.nextCharacter();
				}
				return new NumberToken(parseInt(token));
			}
			if (c == ":" || c == "{" || c == "}" || c == ";" || c == ",") {
				return new SpecialToken(c);
			}
			if (c == "\"") {
				let token = "";
				while (this.lookahead != "\"") {
					token = token + this.nextCharacter();
				}
				this.nextCharacter();
				return new StringToken(token);
			}
			return new UnknownToken(c);
		}
		return null;
	}

	nextCharacter() {
		const n = this.lookahead;
		this.lookahead = this.source[this.position];
		if (this.position < this.source.length) {
			this.position += 1;
		}
		return n;
	}
}

class ScriptCompiler {
	constructor(source) {
		this.tokenizer = new Tokenizer(source);
		this.script = new Script();
		this.lookahead = this.tokenizer.next();
		this.errors = new Array();
	}

	compile() {
		while (this.lookahead != null) {
			if (!this.expectIdentifier("on")) {
				break;
			}

			if (!this.expectSpecial(":")) {
				break;
			}

			const eventName = this.nextIdentifier();
			if (eventName == null) {
				break;
			}

			const event = this.parseEvent(eventName);
			if (event == null) {
				break;
			}
			this.script.addEvent(eventName, event);
		}
		for (let i = 0; i < this.errors.length; i++) {
			console.log("Parsing error: " + this.errors[i]);
		}
		return this.script;
	}

	parseEvent(name) {
		if (!this.expectSpecial("{")) {
			return null;
		}

		// For now code is a list of tokens, later I'll do something about it
		let code = [];
		let depth = 1;
		while (depth > 0) {
			const token = this.nextToken();
			if (token == null) {
				this.errors.push("Unexpected EOF in the Event \"" +name + "\"");
				break;
			}

			if (token instanceof SpecialToken) {
				if (token.data == "{") {
					depth++;
					continue;
				} else if (token.data == "}") {
					depth--;
					continue;
				}
			}

			code.push(token);
		}

		return depth == 0 ? code : null;
	}

	nextToken() {
		const token = this.lookahead;
		this.lookahead = this.tokenizer.next();
		return token;
	}

	nextIdentifier() {
		const token = this.nextToken();
		if (token == null) {
			this.errors.push("Expected identifier, got EOF");
			return null;
		}

		if (token instanceof IdentifierToken) {
			return token.data;
		}

		this.errors.push("Expected identifier, got " + token.constructor.name + " \"" + token.data + "\"");
		return null;
	}

	expectSpecial(data) {
		const token = this.nextToken();
		if (token == null) {
			this.errors.push("Expected special \"" + data + "\", got EOF");
			return false;
		}

		if (token instanceof SpecialToken) {
			if (token.data == data) {
				return true;
			}

			this.errors.push("Expected special \"" + data + "\", got \"" + token.data + "\"");
			return false;
		}

		this.errors.push("Expected special \"" + data + "\", got " + token.constructor.name);
		return false;
	}

	expectIdentifier(name) {
		const token = this.nextIdentifier();
		if (token == null) {
			return false;
		}

		if (token == name) {
			return true;
		}

		this.errors.push("Expected identifier \"" + name + "\", got identifier \"" + token + "\"");
		return false;
	}
}

function CompileScript(source) {
	const c = new ScriptCompiler(source);
	return c.compile();
}

class ScriptEvent {
	constructor(name, code) {
		this.name = name;
		this.code = code;
	}
}

class Script {
	constructor() {
		this.events = new Array();
	}

	addEvent(name, code) {
		this.events.push(new ScriptEvent(name, code));
		console.log("Added event \"" + name + "\" to script, " + code.length + " tokens total");
	}
}
