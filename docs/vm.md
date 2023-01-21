# S2W script VM

## Opcodes

- IsEvent: String event
	- Push true if this event needs to be executed
- IsLooping: ...
	- Shall we continue running current loop command?
- IsEqual: ...
- IsNotEqual: ...
- IsLess: ...
- IsLessOrEqual: ...
- IsGreater: ...
- IsGreaterOrEqual: ...
	- Pop rhs, pop lhs, compare
- IfTrue: Int offset
	- Add offset to PC if popped value is true
- IfFalse: Int offset
	- Add offset to PC if popped value is false
- Jump: Int offset
	- Skip opcodes
- PushNumber: Number
	- Push float to the stack
- PushInt: Int
	- Push int to the stack
- PushString: String
	- Push string to the stack
- Pop: ...
	- Pop value from the stack
- Clone: ...
	- Clone stack top
- Increase
- Decrease
	- Pop variable, increase or decrease value
- Add: ...
- Sub: ...
- Mul: ...
- Div: ...
- LogicAnd: ...
- LogicOr: ...
	- Pop rhs, pop lhs, perform operation, push
- LogicNot: ...
	- Pop value, perform operation, push
- Negate: ...
	- Pop value, negate, push
- CallCommand: String, Int
	- Call a command with n arguments from stack, args are popped right to left
- CallFunction: String, Int
	- Call a function with n arguments, push result
- GetVariable: String name
	- Get variable, push
- SetVariable: String name
	- Pop value, set variable

## Example

```
on:start {
	if (loadmaptakeover() == 0) {
		lockbuildings;
		unlockbuilding 1;
		unlockbuilding 2;
	}

	if (skillvalue("wood") < 25) {
		lockcombi "branch";
	}

	$s2g_firesuccess=30;
	$s2g_plagues=30;
}

on:usesea {
	if (inarea_freshwater("unit", 1)) {
		process "drinking", 1000;
		drink 0, 0, 25, 0;
	}else{
		process "drinking", 1000;
		drink 0, 0, -15, 0;
		msg "Ugh! Saltwater!";
	}
}
```

```
IsEvent "start"
IfFalse +20
	CallFunction "loadmaptakeover", 0
	PushInt 0
	IsEqual
	IfFalse +5
		CallCommand "lockbuildings", 0
		PushInt 1
		CallCommand "unlockbuilding", 1
		PushInt 2
		CallCommand "unlockbuilding", 1
	PushString "wood"
	CallFunction "skillvalue", 1
	PushInt 25
	IsLess
	IfFalse +2
		PushString "branch"
		CallCommand "lockcombi", 1
	PushVariable "s2g_firesuccess"
	PushInt 30
	SetValue
	PushVariable "s2g_plagues"
	PushInt 30
	SetValue

IsEvent "usesea"
IfFalse <TBD>
	PushInt 1
	PushString "unit"
	CallFunction "inarea_freshwater"
```

`if (statement) block`
->
```
code(statement)
IfFalse +len(code(block))
	code(block)
```

`if (statement) block1 else block2`
->
```
code(statement)
IfFalse +len(code(block1)) + 1
	code(block1)
	Jump +len(code(block2))
	code(block2)
```

`if (statement1) block1 elseif (statement2) block2`
->
```
code(statement1)
IfFalse +len(code(block1))
	code(block1)
	Jump +len(code(block2))
	
	code(block2)
```

`if (statement1) block1 elseif (statement2) block2 else block3`


```
loop("object", 121) {
	CODE;
}
```
->
```
z = 0
while (z = loop("object", 121, z)) {
	CODE;
}
```
->
```
PushString "object"
PushInt 121
PushInt 0
CallFunction "loop", 3
Clone
PushInt 0
IfEqual +(len(CODE) + 1)
CODE
Jump -(len(CODE) + 5)
```
