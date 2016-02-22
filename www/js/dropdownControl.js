function DropdownControl(control, change, defaultValue, systemName)
{
	Control.call(this, control, change, defaultValue, systemName);
}

OOP.inherit(DropdownControl, Control,
{
	updateValue: function(value)
	{
		//this.control.find('.value').text(value);
		//this.control.find('.description').text(this.control.find('select option[value="' + value + '"]').attr("data-description") || "");
	},
	init: function(defaultValue)
	{
		var self = this;
		var value = (localStorage[self.systemName] || defaultValue);
		self.control.find('select').change(function()
		{
			localStorage[self.systemName] = this.value;
			self.updateValue(this.value);
			self.change(this.value);
		}).val(value).change();
		self.control.click(function()
		{
			var screen = $('<div class="screen menu select gui"><div class="item back">Back<i></i></div><div class="header"></div></div>');
			$(document.body).append(screen);
			screen.find('.header').text(self.control.find('.name').text());
			var value = self.control.find('select').val();
			self.control.find('select option').each(function()
			{
				var option = $('<div class="item radio' + (this.value == value ? " checked" : "") + '" data-value="' + this.value + '">' + this.innerHTML + '<i></i></div>');
				var description = $(this).attr('data-description');
				if (description)
				{
					option.append('<div class="description">' + description + '</div>');
				}
				screen.append(option)
			});
			var previousScreen = $('.screen.active');
			function suicide(e)
			{
				document.removeEventListener("backbutton", suicide);
				App.selectScreen(screen);
				screen.remove();
				App.selectScreen(previousScreen);
				e.stopImmediatePropagation();
			}
			document.addEventListener("backbutton", suicide, false);
			screen.find('.item.radio').click(function()
			{
				var $this = $(this);
				if (!$this.hasClass('disabled'))
				{
					screen.find('.item.radio').removeClass('checked');
					$this.addClass('checked');
					self.control.find('select').val($this.attr('data-value')).change();
				}
			});
			App.selectScreen(screen);
		});
	}
});
