function SliderControl(control, change, defaultValue, systemName)
{
	this.control = $(control);
	this.onchange = change;
	this.systemName = systemName || this.control.attr('data-system-name');
	this.init(defaultValue);
}

SliderControl.prototype = {
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
				self.onchange.apply(self.slider[0], [value]);
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
}