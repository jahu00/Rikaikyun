var OOP = {
	inherit: function(child, parent, ext)
	{
		var prototype = function(){};
		prototype.prototype = parent.prototype;
		child.prototype = new prototype();
		child.prototype.constructor = parent;
		if (typeof ext != "undefined")
		{
			this.extend(child.prototype, ext);
		}
	},
	extend: function(base, ext)
	{
		for(var propName in ext)
		{
			if (ext.hasOwnProperty(propName))
			{
				base[propName] = ext[propName];
			};
		}
	}
};