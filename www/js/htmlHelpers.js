var htmlHelpers = {
	extractBody: function(text)
	{
		var m = text.match(/(?:[\s\S]*<html[\s\S]*(?:<head[\s\S]*head>)?\s*<body.*?>)([\s\S]*?)(?=<\/body>\s*<\/html>\s*$)/m);
		if (m.length != 2)
		{
			return "";
		}
		return m[1];
	},
	trimAllLines : function(text)
	{
		return text.replace(/^\s*(.*?)\s*$/gm, "$1\n");
	}
};