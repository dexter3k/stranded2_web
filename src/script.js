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
		this.line = 0;
		this.column = 0;
	}

	toString() {
		return `String Token - "${this.data}"`;
	}
}

class IdentifierToken {
	constructor(data) {
		this.data = data;
		this.line = 0;
		this.column = 0;
	}

	toString() {
		return `Identifier Token - "${this.data}"`;
	}
}

class NumberToken {
	constructor(data) {
		this.data = data;
		this.line = 0;
		this.column = 0;
	}

	toString() {
		return `Number Token - "${this.data}"`;
	}
}

class SpecialToken {
	constructor(data) {
		this.data = data;
		this.line = 0;
		this.column = 0;
	}

	toString() {
		return `Special Token - "${this.data}"`;
	}
}

class UnknownToken {
	constructor(data) {
		this.data = data;
		this.line = 0;
		this.column = 0;
	}

	toString() {
		return `Unknown Token - "${this.data}"`;
	}
}

class Tokenizer {
	constructor(source) {
		this.source = source;
		this.position = 0;
		this.line = 1;
		this.column = 1;
		this.lookahead = null;
		this.nextCharacter(); // skip lookahead
	}

	next() {
		const [line, column] = [this.line, this.column];
		const tok = this.next_internal();
		if (tok) {
			tok.line = line;
			tok.column = column;
		}
		return tok;
	}

	next_internal() {
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
			if (c == "$") {
				return new SpecialToken(c);
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
				while (isNumeric(this.lookahead) || this.lookahead == ".") {
					token = token + this.nextCharacter();
				}
				return new NumberToken(parseFloat(token));
			}
			if (c == "&" && this.lookahead == "&") {
				return new SpecialToken(c + this.nextCharacter());
			}
			if (c == ":" || c == "{" || c == "}" || c == ";" || c == ",") {
				return new SpecialToken(c);
			}
			if (c == '(' || c == ')') {
				return new SpecialToken(c);
			}
			if (c == "+" && this.lookahead == "+") {
				return new SpecialToken(c + this.nextCharacter());
			}
			if (c == "-" && this.lookahead == "-") {
				return new SpecialToken(c + this.nextCharacter());
			}
			if (c == "!" && this.lookahead == "=") {
				return new SpecialToken(c + this.nextCharacter());
			}
			if (c == '=' || c == '+' || c == '-' || c == '<' || c == '>') {
				if (this.lookahead == '=') {
					return new SpecialToken(c + this.nextCharacter());
				}
				return new SpecialToken(c);
			}
			// todo: *= /= %= etc do these exist?
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

class CodeEmitter {
	constructor(errors) {
		this.errors = errors;
		this.code = [];

		this.scopeDepth = 0; // ROOT scope
		this.stackDepth = 0; // grows upwards

		this.event = "";
		this.eventBegin = 0;
		this.eventScope = 0;

		this.ifConditionStackDepth = -1;
		this.ifBegin = [];

		this.looping = false;
		this.loopCall = 0;
		this.loopStack = 0;
	}

	beginEvent(eventName) {
		if (this.event != "") {
			this.errors.push("Event inside of an event");
			return;
		}
		this.event = eventName;
		this.eventBegin = this.code.length;
		this.eventScope = this.scopeDepth;

		this.stackDepth++;
		this.code.push(`${this.stackDepth} IsEvent ${eventName}`);
		this.stackDepth--;
		this.code.push(`${this.stackDepth} IfFalse <TBD>`);

	}

	endEvent() {
		if (this.event == "") {
			this.errors.push("Closing event outside event?");
			return;
		}
		this.event = "";

		if (this.scopeDepth != this.eventScope) {
			this.errors.push("Closing event at higher scope?");
			return;
		}

		this.code[this.eventBegin + 1] = `${this.stackDepth} IfFalse +${this.code.length - this.eventBegin - 2}`;
	}

	beginIfCondition() {
		if (this.ifConditionStackDepth != -1) {
			this.errors.push("If statement inside if condition?");
			return;
		}

		this.ifConditionStackDepth = this.stackDepth;
	}

	endIfCondition() {
		if (this.ifConditionStackDepth == -1) {
			this.errors.push("Closing if condition without condition?");
			return;
		}

		if (this.ifConditionStackDepth == this.stackDepth) {
			this.errors.push(`If condition does not return a value`);
			return;
		} else if (this.ifConditionStackDepth != this.stackDepth - 1) {
			this.errors.push(`If condition stack misaligned: ${this.ifConditionStackDepth} vs ${this.stackDepth}`);
			return;
		}

		this.ifConditionStackDepth = -1;


		// save position of IfFalse jump
		// this one will jump to the "else" part.
		this.ifBegin.push(this.code.length);
		this.stackDepth -= 1;
		this.code.push(`${this.stackDepth} IfFalse <TBD> // skip if statement`);
	}

	endIfStatement(hasElse) {
		if (this.ifConditionStackDepth != -1) {
			this.errors.push("If statement inside of condition?");
			return;
		}

		if (this.ifBegin.length == 0) {
			this.errors.push("If statement underflowing?");
			return;
		}

		const ifFixup = this.ifBegin.pop();
		let target = this.code.length - ifFixup - 1;
		if (hasElse) {
			this.ifBegin.push(this.code.length);
			this.code.push(`${this.stackDepth} Jump <TBD> // skip else statement`);
			target++; // skip Jump code
		}
		// Fixup the code so that we can jump to the else part.
		this.code[ifFixup] = `${this.stackDepth} IfFalse +${target}`;
	}

	endElseStatement() {
		if (this.ifBegin.length == 0) {
			this.errors.push(`Else fixup location underflowed`);
			return;
		}

		const elseJump = this.ifBegin.pop();
		this.code[elseJump] = `${this.stackDepth} Jump +${this.code.length - elseJump - 1}`;
	}

	functionCall(funcName, argCount) {
		if (this.stackDepth < argCount) {
			this.errors.push(`Stack underflow during function call`);
			return;
		}
		this.stackDepth -= argCount;
		this.stackDepth++;
		this.code.push(`${this.stackDepth} CallFunction "${funcName}" ${argCount}`);
	}

	commandCall(funcName, argCount) {
		if (this.stackDepth < argCount) {
			this.errors.push(`Stack underflow during command call`);
			return;
		}
		this.stackDepth -= argCount;
		this.code.push(`${this.stackDepth} CallCommand "${funcName}" ${argCount}`);
	}

	actionEqualDup() {
		this.stackDepth++;
		this.code.push(`${this.stackDepth} Clone`);
	}

	binaryOperator(op) {
		if (this.stackDepth < 2) {
			this.errors.push(`Stack underflow on binary op "${op}"`);
			return;
		}
		this.stackDepth -= 2; // arguments
		this.stackDepth += 1; // result

		if (op == "==") {
			this.code.push(`${this.stackDepth} IsEqual`);
		} else if (op == "!=") {
			this.code.push(`${this.stackDepth} IsNotEqual`);
		} else if (op == "<") {
			this.code.push(`${this.stackDepth} IsLess`)
		} else if (op == "<=") {
			this.code.push(`${this.stackDepth} IsLessOrEqual`);
		} else if (op == ">") {
			this.code.push(`${this.stackDepth} IsGreater`);
		} else if (op == ">=") {
			this.code.push(`${this.stackDepth} IsGreaterOrEqual`);
		} else if (op == "=") {
			if (this.ifConditionStackDepth != -1) {
				// We're inside of if condition, "=" means equals
				this.code.push(`${this.stackDepth} Equals`);
			} else {
				this.code.push(`${this.stackDepth} SetValue`);
				this.stackDepth -= 1; // = does not return a value
			}
		} else if (op == "+=") {
			if (this.stackDepth < 2) {
				this.errors.push(`Stack underflow on += operator`);
				return;
			}
			this.stackDepth -= 2;
			this.code.push(`${this.stackDepth} Add`); // assuming there is a Duplication
			this.code.push(`${this.stackDepth} SetValue`);
		} else if (op == "-=") {
			if (this.stackDepth < 2) {
				this.errors.push(`Stack underflow on -= operator`);
				return;
			}
			this.stackDepth -= 2;
			this.code.push(`${this.stackDepth} Sub`); // assuming there is a Duplication
			this.code.push(`${this.stackDepth} SetValue`);
		} else if (op == "+") {
			this.code.push(`${this.stackDepth} Add`);
		} else if (op == "-") {
			this.code.push(`${this.stackDepth} Sub`);
		} else if (op == "*") {
			this.code.push(`${this.stackDepth} Mul`);
		} else if (op == "/") {
			this.code.push(`${this.stackDepth} Div`);
		} else if (op == "&&") {
			this.code.push(`${this.stackDepth} And`)
		} else if (op == "||") {
			this.code.push(`${this.stackDepth} Or`)
		}
		else
		{
			this.errors.push(`Unknown binary operator: "${op}"`);
		}
	}

	numberValue(val) {
		this.stackDepth++;
		this.code.push(`${this.stackDepth} PushNumber ${val}`);
	}

	stringValue(val) {
		this.stackDepth++;
		this.code.push(`${this.stackDepth} PushString "${val}"`);
	}

	variableValue(name) {
		this.stackDepth++;
		this.code.push(`${this.stackDepth} PushVariable "${name}"`);
	}

	negateOperator() {
		if (this.stackDepth < 1) {
			this.errors.push(`Stack underflow on negation operator`);
			return;
		}
		this.code.push(`${this.stackDepth} Negate`);
	}

	postfixArithmetic(op) {
		if (this.stackDepth < 1) {
			this.errors.push(`Stack underflow on postfix op ${op}`);
			return;
		}
		this.stackDepth -= 1;

		if (op == "++") {
			this.code.push(`${this.stackDepth} Increase`);
		} else if (op == "--") {
			this.code.push(`${this.stackDepth} Decrease`);
		}
		else
		{
			this.errors.push(`Unknown postfix operator: "${op}"`);
		}
	}

	beginLoopStatement(argCount) {
		if (this.looping) {
			this.errors.push(`Nested loop statements are not allowed`);
			return;
		}
		this.looping = true;
		this.stackDepth++;
		this.code.push(`${this.stackDepth} PushInt 0`);
		this.loopStack = this.stackDepth;
		this.loopCall = this.code.length;
		this.code.push(`${this.stackDepth} CallFunction "loop", ${argCount+1}`);
		this.code.push(`${this.stackDepth} Clone`);
		this.code.push(`${this.stackDepth} PushInt 0`);
		this.code.push(`${this.stackDepth} IfEqual +<TBD>`);
		// loop code goes here..
	}

	endLoopStatement() {
		if (!this.looping) {
			this.errors.push(`Finishing loop.. twice?`);
			return;
		}
		if (this.stackDepth != this.loopStack) {
			this.errors.push(`Stack depth changed during loop`);
			return;
		}
		this.looping = false;
		this.code[this.loopCall] = `${this.stackDepth} IfEqual +${this.code.length - this.loopCall - 4}`;
		this.code.push(`${this.stackDepth} Jump -${this.code.length - this.loopCall + 2}`);
	}
}

class ScriptCompiler {
	constructor(source) {
		this.tokenizer = new Tokenizer(source);
		this.script = new Script(source);
		this.current = null;
		this.lookahead = this.tokenizer.next();
		this.errors = new Array();

		this.emitter = new CodeEmitter(this.errors);
	}

	compile() {
		while (this.lookahead != null && this.errors.length == 0) {
			this.parseEvent();
		}

		// console.log(this.emitter.code.join('\n'));

		for (let i = 0; i < this.errors.length; i++) {
			console.error("Parsing error: " + this.errors[i]);
		}

		if (this.errors.length != 0) {
			console.error(this.script.source);
			throw "Script: debug, todo";
		}

		return this.script;
	}

	parseEvent() {
		if (this.lookahead instanceof IdentifierToken && this.lookahead.data == "on") {
			this.nextToken();

			if (!this.expectSpecial(":")) {
				return;
			}

			const eventName = this.nextIdentifier();
			if (eventName == null) {
				return;
			}

			this.emitter.beginEvent(eventName);
			this.parseStatement();
			this.emitter.endEvent();
		} else {
			this.parseStatement();
		}
	}

	parseStatement() {
		if (this.lookahead instanceof IdentifierToken) {
			switch (this.lookahead.data) {
			case "if": // if statement - if (expression) statement
				this.nextToken();

				if (!this.expectSpecial("(")) {
					return;
				}
				this.emitter.beginIfCondition();
				this.parseExpression();
				this.emitter.endIfCondition();
				if (!this.expectSpecial(")")) {
					return;
				}

				this.parseStatement();

				let elseIfDepth = 0;
				while (this.lookahead instanceof IdentifierToken) {
					if (this.lookahead.data == "elseif") {
						this.nextToken();
						this.emitter.endIfStatement(true);

						if (!this.expectSpecial("(")) {
							return;
						}
						this.emitter.beginIfCondition();
						this.parseExpression();
						this.emitter.endIfCondition();
						if (!this.expectSpecial(")")) {
							return;
						}

						elseIfDepth++;

						this.parseStatement();
					} else if (this.lookahead.data == "else") {
						this.nextToken();
						this.emitter.endIfStatement(true);
						this.parseStatement();
						this.emitter.endElseStatement();

						for (let i = 0; i < elseIfDepth; i++) {
							this.emitter.endElseStatement();
						}
						return;
					} else {
						break;
					}
				}

				if (elseIfDepth != 0) {
					for (let i = 0; i < elseIfDepth; i++) {
						this.emitter.endElseStatement();
					}
					this.emitter.endElseStatement();
				} else {
					this.emitter.endIfStatement(false);
				}

				return;
			case "loop": // loop
				this.nextToken();

				this.expectSpecial("(");
				const argCount = this.parseArgumentList(")");
				this.expectSpecial(")");

				this.emitter.beginLoopStatement(argCount);
				this.parseStatement();
				this.emitter.endLoopStatement();
				return;
			default:
				this.nextToken();				
				const commandName = this.current.data;

				const argc = this.parseArgumentList(";");
				this.expectSpecial(";");
				this.emitter.commandCall(commandName, argc);
				return;
			}
		} else if (this.lookahead instanceof SpecialToken) {
			switch (this.lookahead.data) {
			case "{": // { statement, ... } block statement
				this.nextToken();

				while (this.lookahead != null && this.errors.length == 0) {
					if (this.lookahead instanceof SpecialToken && this.lookahead.data == "}") {
						break;
					}
					this.parseStatement();
				}

				if (!this.expectSpecial('}')) {
					return;
				}

				return;
			case ";":
				this.nextToken();
				return;
			default:
				break;
			}
		}

		this.parseExpression();
		this.expectSpecial(";");
	}

	parseExpression() {
		this.parseLogicalOrExpression();

		while (this.lookahead instanceof SpecialToken) {
			const op = this.lookahead.data;
			if (op != "=" && op != "+=" && op != "-=") {
				return;
			}

			if (op == "+=" || op == "-=") {
				this.emitter.actionEqualDup();
			}

			this.nextToken();
			this.parseLogicalOrExpression();
			this.emitter.binaryOperator(op);
		}
	}

	parseLogicalOrExpression() {
		this.parseLogicalAndExpression();

		while (true) {
			if (this.lookahead instanceof IdentifierToken && this.lookahead.data == "or") {
			} else if (this.lookahead instanceof SpecialToken && this.lookahead.data == "||") {
			} else {
				return;
			}

			this.nextToken();
			this.parseLogicalAndExpression();
			this.emitter.binaryOperator("||");
		}
	}

	parseLogicalAndExpression() {
		this.parseEqualityExpression();

		while (true) {
			if (this.lookahead instanceof IdentifierToken && this.lookahead.data == "and") {
			} else if (this.lookahead instanceof SpecialToken && this.lookahead.data == "&&") {
			} else {
				return;
			}

			this.nextToken();
			this.parseEqualityExpression();
			this.emitter.binaryOperator("&&");
		}
	}

	parseEqualityExpression() {
		this.parseComparisonExpression();

		while (this.lookahead instanceof SpecialToken) {
			const op = this.lookahead.data;
			if (op != "==" && op != "!=") {
				return;
			}

			this.nextToken();
			this.parseComparisonExpression();
			this.emitter.binaryOperator(op);
		}
	}

	parseComparisonExpression() {
		this.parseAdditionExpression();

		while (this.lookahead instanceof SpecialToken) {
			const op = this.lookahead.data;
			if (op != "<" && op != ">" && op != "<=" && op != ">=") {
				return;
			}

			this.nextToken();
			this.parseAdditionExpression();
			this.emitter.binaryOperator(op);
		}
	}

	parseAdditionExpression() {
		this.parseMultiplicationExpression();

		while (this.lookahead instanceof SpecialToken) {
			const op = this.lookahead.data;
			if (op != "+" && op != "-") {
				return;
			}

			this.nextToken();
			this.parseMultiplicationExpression();
			this.emitter.binaryOperator(op);
		}
	}

	parseMultiplicationExpression() {
		this.parsePrefixedExpression();

		while (this.lookahead instanceof SpecialToken) {
			const op = this.lookahead.data;
			if (op != "*" && op != "/") {
				return;
			}

			this.nextToken();
			this.parsePrefixedExpression();
			this.emitter.binaryOperator(op);
		}
	}

	parsePrefixedExpression() {
		this.parseExpressionFactor();

		const op = this.lookahead.data;
		if (op != "++" && op != "--") {
			return;
		}
		this.nextToken();
		this.emitter.postfixArithmetic(op);
	}

	parseExpressionFactor() {
		if (this.lookahead instanceof IdentifierToken) {
			this.nextToken();
			// calling "this.current.data", returns single argument
			const funcName = this.current.data;

			// First collect arguments left to right
			this.expectSpecial("(");
			const argCount = this.parseArgumentList(")");
			this.expectSpecial(")");

			// And emit function call
			this.emitter.functionCall(funcName, argCount);
		} else if (this.lookahead instanceof NumberToken) {
			// todo: number vs integer
			this.nextToken();
			this.emitter.numberValue(this.current.data);
		} else if (this.lookahead instanceof StringToken) {
			this.nextToken();
			this.emitter.stringValue(this.current.data);
		} else if (this.lookahead instanceof SpecialToken) {
			if (this.lookahead.data == "$") {
				this.nextToken();
				const name = this.nextIdentifier();
				this.emitter.variableValue(name);
			} else if (this.lookahead.data == "-") {
				this.nextToken();
				this.parsePrefixedExpression();
				this.emitter.negateOperator();
			} else if (this.lookahead.data == "(") {
				this.nextToken();
				this.parseExpression();
				this.expectSpecial(")");
			}
		}
	}

	parseArgumentList(endToken) {
		let count = 0;
		let isFirst = true;
		while (this.lookahead != null) {
			if (this.lookahead instanceof SpecialToken) {
				if (this.lookahead.data == endToken) {
					// do not consume the end token
					return count;
				}
			}
			count++;
			if (count != 1) {
				this.expectSpecial(",");
			}

			this.parseExpression();
		}

		return count;
	}

	nextToken() {
		this.current = this.lookahead;
		this.lookahead = this.tokenizer.next();
		return this.current;
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

			this.errors.push("Expected special \"" + data + "\", got " + token.constructor.name + " \"" + token.data + "\"");
			return false;
		}

		this.errors.push("Expected special \"" + data + "\", got " + token.constructor.name + " \"" + token.data + "\"");
		return false;
	}

	expectIdentifier(name) {
		const token = this.nextIdentifier();
		if (token == null) {
			this.errors.push("Expected identifier \"" + name + "\", got EOF");
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
	constructor(source) {
		this.source = source;
		this.events = new Array();
	}

	addEvent(name, code) {
		this.events.push(new ScriptEvent(name, code));
	}

	runEvent(name) {
		console.log("Running an event: " + name);
		for (const event of this.events) {
			if (event.name != name) {
				continue;
			}

			console.log("Running code");
			console.log(event.code);
		}
	}
}
