# Some notes about scripting language..

Most scripts provide events like so:
```
msg "Hello", 3;

on:start {
	// event called "start"
}

on:useground {
	// other event..
}
```

Note that msg command is outside any event and will be called on each execution of the script regardless of current event.

Execution of on:event blocks only happens when script is executed for the specific "event" value.

Some script don't contain any events, ie buildings, recipes, possibly other things.
For example when you combine Branch and a Liana following script runs:
(defined in sys/combinations_actions.inf)
```
script=start
	if (gotstate("unit",1,7)==1){
		freestate "unit",1,7;
		play "collect.wav";
		msg "Fracture splinted!",4;
		speech "positive";
		freestored "unit",1,24,1;
		freestored "unit",1,26,1;
	}else{
		msg "You have no fractures",3;
		speech "negative";
	}
	skipevent;
script=end
```

## Some of the events

Some events are called by the game engine and some by other scripts.

- preload
	- globally executed when loading new map before adding any objects or ground
- start
	- called when map starts, but not when a save file is loaded
- load
	- called after start for maps and save files
- useground
	- called when player does "Use" action (def. kb button E) on terrain object
	- original games uses this for eg processing planting
- usesea
	- same, but for water (sea or fresh)
- sleep
	- when player triggers sleep action
- skill_{wood, fish, hunt, plant, dig}
	- when player clicks on the specific menu screen
	- note that skillup and iskill_* events are only used by the scripts, engine does not know about these

## Grammar

Basically language is very close to other C-like languages, but also has some unusual to those languages concepts

All variable references are done via $ operator, there are also global variables, but that is tbd

Another difference is in the function calls

Classical function calls like `gostate("unit", 1, 7)` return some value
Functions that don't return any values are expressed as `freestored "unit, 1, 24, 1`
I.e. without any round brackets '()'.

There seems to be no way of defining custom functions in the script afaik. Only events.

### Global space

During parsing algorithm is as follows:
```
compile() {
	while (this.lookahead != null) {
		this.statement()
	}
}

statement() {
	this.nextToken();
	if (this.current instanceof IdentifierToken) {
		if (this.current.data == "if") {
			this.ifStatement();
			return;
		} else if (this.current.data == "on") {
			this.onStatement();
			return;
		} else if (this.current.data == "local") {
			this.localStatement();
			return;
		}
	} else if (this.current instanceof SpecialToken) {
		if (this.current.data == ";") {
			// end of this statement!
			return;
		}
	}

	this.expression();
	this.expectSemicolon();
}

expression() {
	this.equalityExpression();

	// operators with lowest precedence:
	// currently only assignments, others tbd
	// ie =, +=, -=, maybe something else..
}

equalityExpression() {
	this.additionExpression();

	while (this.current instanceof SpecialToken) {
		if (this.current.data == "==") {
			// equality..
			continue;
		}

		if (this.current.data == "!=") {
			// non-equality..
			continue;
		}

		if (this.current.data == ">") {
			// greater than
			continue;
		}

		if (this.current.data == "<") {
			// less than
			continue;
		}

		if (this.current.data == ">=") {
			// greater equal
			continue;
		}

		if (this.current.data == "<=") {
			// less equal
			continue;
		}

		break;
	}
}

additionExpression() {
	this.multiplicationExpression();

	while (this.current instanceof SpecialToken) {
		if (this.current.data == "+") {
			// addition
			continue;
		}

		if (this.current.data == "-") {
			// subtraction
			continue;
		}

		break;
	}
}

multiplicationExpression() {
	this.prefixedExpression();

	while (this.current instanceof SpecialToken) {
		if (this.current.data == "*") {
			// multiplication
			continue;
		}

		if (this.current.data == "/") {
			// division
			continue;
		}

		break;
	}
}

prefixedExpression() {
	this.expressionFactor();

	while (true) {
		// (
		// 
	}
}

expressionFactor() {
	
}
```