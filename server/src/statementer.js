
var types         = require("./util.js").types;
var countParens   = require("./util.js").countParens;
var countBrackets = require("./util.js").countBrackets;


module.exports = function(tokens) {

	//statementer (split tokens into statements by brackets and semicolons)

	var statements = [];
	var current = [];
	var parenLevel = 0; //prevents semicolons from chunk while in for(;;) loops


	function push()
	{
		statements.push(current);
		current = [];
	}


	for(var i = 0; i < tokens.length; i++)
	{
		var token = tokens[i];
		current.push(token);

		parenLevel += countParens(token);

		//decide whether the current token string is a statement chunk
		if(token.type === types.OPEN_BRACKET)
			push();
		else if(token.type === types.CLOSE_BRACKET) //end brackets get there own statements
			push();
		else if((parenLevel === 0) && (token.type === types.SEMICOLON))
			push();
	}


	// console.log(statements);
	return statements
};