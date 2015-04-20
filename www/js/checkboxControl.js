function CheckboxControl(control, change, defaultValue, systemName)
{
	Control.call(this, control, change, defaultValue, systemName);
}

OOP.inherit(CheckboxControl, Control,
{
	setValue: function(value)
	{
		localStorage[this.systemName] = value;
		this.control.attr('data-value', value);
		// Using class because data attributes are wonky on android browser
		if (value)
		{
			if (!this.control.hasClass('checked'))
			{
				this.control.addClass('checked');
			}
		}
		else
		{
			this.control.removeClass('checked');
		}
	},
	getValue: function()
	{
		return this.control.attr('data-value') == "true";
	},
	init: function(defaultValue)
	{
		var self = this;
		var value = (localStorage[self.systemName] || defaultValue) == "true";
		self.setValue(value);
		self.control.click(function()
		{
			var value = !self.getValue();
			console.log(value);
			self.setValue(value);
			self.change(value);
		});
	}
});