var preloadStyleImages = {
	preloadImage: function(url)
	{
		var img = document.createElement('img');
		img.onload = function()
		{
			// kill img after it was loaded
			img = null;
		}
		img.src = url;
	},
	preload: function()
	{
		var self = this;
		$('link[rel="stylesheet"]').each(function()
		{
			for(var i = 0; i < this.sheet.cssRules.length; i++)
			{
				var rule = this.sheet.cssRules[i];
				//m = rule.cssText.match(/(?:url\((?:'|")?)([^:)]*\.(?:gif|png|jpg|jpeg))(?:(?:'|")?\))/ig);
				m = rule.cssText.match(/url\(('|")?([^:)]*\.(gif|png|jpg|jpeg))('|")?\)/ig);
				if (m != null)
				{
					var path = fileHelpers.getParentPath(this.sheet.href);
					for (var n = 0; n < m.length; m++)
					{
						self.preloadImage(path + m[n].match(/\((?:'|")?([^:)]*\.(?:gif|png|jpg|jpeg))(?:'|")?\)/i)[1]);
					}
				}
			}
		});
	}
}