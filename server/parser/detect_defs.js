
var util = require("./util.js");
var types        = util.types;
var matchParen   = util.matchParen;
var matchBracket = util.matchBracket;



function Func(token, storage, endToken)
{
	this.token = token;
	this.storage = storage;
	this.endToken = endToken;
	this.calls = []; //filled in loadCalls.js
}


//test for a function definition at the given token index
function testFuncDef(statement, start)
{
	var t = statement.length;

	if(statement[start].type === types.IDENTIFIER) //function name
	{
		if(((start+1) < t) && (statement[start+1].type === types.OPEN_PAREN)) //open paren
		{
			//find matching paren
			var close = matchParen(statement, start+1);

			if(close !== -1) //close paren
			{
				if(((close+1) < t) && (statement[close+1].type === types.OPEN_BRACKET)) //open bracket
				{
					//ghostbusters: "weeee GOT ONE!!!"
					return true;
				}
			}
		}
	}
	return false;
}


module.exports = function(statements) {
	var definitions = [];

	//find function definitions
	for(var s = 0; s < statements.length; s++)
	{
		var statement = statements[s];

		//minimum number of tokens needed to form function DEFINITION
		// void main ( ) {
		if(statement.length >= 5)
		{
			var storage = null; //all functions are extern by default
			for(var t = 0; t < statement.length - 3; t++)
			{
				var token = statement[t];

				//record the last occurence of storage modifiers
				if(token.type === types.KEYWORD_STORAGE)
				{
					storage = token;
				}
				else
				{
					//test using this position as a starting point
					if(testFuncDef(statement, t))
					{
						//find matching bracket (brackets are their own statements in this parser)
						var endToken = matchBracket(statements, s);
						//in case no end bracket was found
						if(endToken !== undefined)
						{
							var f = new Func(token, storage, endToken);
							definitions.push(f);
						}
					}
				}
			}
		}
	}

	return definitions;
};
