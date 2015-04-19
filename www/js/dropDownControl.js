function DropdownControl(control, change, defaultValue, systemName)
{
	Control.call(this, control, change, defaultValue, systemName);
}

OOP.inherit(DropdownControl, Control,
	{
		updateValue: function(value)
		{
			//this.control.find('.value').text(value || this.slider.val());
			this.control.find('.description').text(this.control.find('select option[value="' + value + '"]').attr("data-description") || "");
		},
		init: function(defaultValue)
		{
			var self = this;
			self.control.find('select').change(function(e)
			{
				localStorage[self.systemName] = this.value;
				self.updateValue()
			});
		}
	}
);
