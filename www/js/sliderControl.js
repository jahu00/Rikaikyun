function SliderControl(control, change, defaultValue, systemName)
{
	Control.call(this, control, change, defaultValue, systemName);
}

OOP.inherit(SliderControl, Control,
{
	change: function(value)
	{
		if (typeof this.onchange != "undefined")
		{
			this.onchange.call(this.slider, value);
		}
	},
	updateValue: function(value)
	{
		this.control.find('.value').text(value || this.slider.val());
	},
	init: function(defaultValue)
	{
		var self = this;
		self.slider = self.control.find('.slider').slider(
		{
			oninput: function()
			{
				self.updateValue();
			},
			onchange: function()
			{
				var value = parseFloat(self.slider.val());
				self.updateValue(value);
				localStorage[self.systemName] = value;
				self.change(value);
			}
		}).val(parseFloat(localStorage[self.systemName] || defaultValue));
		self.slider.change();
		self.control.find('.value').click(function()
		{
			var value = parseFloat(prompt(self.control.find('.name').text(), self.slider.val()));
			if (!isNaN(value))
			{
				self.slider.val(value).change();
			}
		});
	}
});