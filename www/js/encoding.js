// NOT USED!
var encoding = {
	// Detects file encoding based on charset meta tag
	getHtmlCharset: function(text)
	{
		var m = text.match(/<meta(?!\s*(?:name|value)\s*=)[^>]*?charset\s*=[\s"']*([^\s"'\/>]*)/);
		if (m.length != 2)
		{
			return null;
		}
		return m[1];
	}
};