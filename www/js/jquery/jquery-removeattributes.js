(function($) {
	$.fn.removeAttributes = function(include, exclude) {
		if (typeof include == "undefined")
		{
			include = null;
		}
		else if (!(include instanceof Array) && include != null)
		{
			include = include.split(",");
			include.forEach(function(val, i)
			{
				include[i] = val.trim();
			});
		}
		if (typeof exclude == "undefined")
		{
			exclude = null;
		}
		else if (!(exclude instanceof Array) && exclude != null)
		{
			exclude = exclude.split(",");
			exclude.forEach(function(val, i)
			{
				exclude[i] = val.trim();
			});
		}
		this.each(function()
		{
			for (var i = 0; i < this.attributes.length; i++)
			{
				var attr = this.attributes[i];
				if ((include == null || $.inArray(attr.name,include) != -1) && (exclude == null || $.inArray(attr.name,exclude) == -1))
				{
					this.removeAttribute(attr.name);
					i = -1;
				}
			}
		});
	};
})(jQuery);