function Control(control, change, defaultValue, systemName){
	this.control = $(control);
		this.onchange = change;
		this.systemName = systemName || this.control.attr('data-system-name');
		this.init(defaultValue);
}

Control.prototype = {
	change: function(value)
	{
		if (typeof this.onchange != "undefined")
		{
			this.onchange.call(this.control[0], value);
		}
	},
	init: function(defaultValue)
	{
		localStorage[self.systemName] = defaultValue;
	}
}