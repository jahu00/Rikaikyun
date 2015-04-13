function Settings(reader)
{
	this.reader = reader;
	this.init();
}

Settings.prototype = {
	init: function()
	{
		var self = this;
		//words = JSON.parse(localStorage["words"]);
		//localStorage["words"] = JSON.stringify(words);
		//this.lastFile = localStorage["lastFile"] || '';
		self.screen = $('.screen.settings.menu');
		document.addEventListener("backbutton", function(e)
		{
			if (settings.is(':visible'))
			{
				self.reader.selectScreen('main.menu');
				e.stop();
			}
		}, false);
		
		function readControlValueBool(control)
		{
			var control = $(control);
			var value = (control.attr('data-value') || "false") == "true";
			return value;
		}
		
		function flipControl(control)
		{
			var control = $(control);
			var value = (control.attr('data-value') || "false") == "true";
			control.attr('data-value', value);
			return value;
		}
		
		function setControl(control, value)
		{
			var control = $(control);
			control.attr('data-value', value);
			// Using class because data attributes are wonky on android browser
			if (value)
			{
				if (!control.hasClass('checked'))
				{
					control.addClass('checked');
				}
			}
			else
			{
				control.removeClass('checked');
			}
		}
		
		function setGpu(value)
		{
			var control = self.screen.find('.useGpu');
			setControl(control, value);
			localStorage['useGpu'] = value;
			if (value)
			{
				if (!self.reader.screen.hasClass('gpu'))
				{
					self.reader.screen.addClass('gpu');
				}
			}
			else
			{
				self.reader.screen.removeClass('gpu');
			}
		}
		
		self.screen.find('.useGpu').click(function()
		{
			var value = !readControlValueBool(this);
			setGpu(value);
		});
		
		self.screen.find('.openMethod select').change(function(e)
		{
			localStorage['openMethod'] = this.value;
		});
		
		setGpu((localStorage['useGpu'] || "false") == "true");
		localStorage['openMethod'] = localStorage['openMethod'] || "FileSystem";
		self.screen.find('.openMethod select').val(localStorage['openMethod']);
	}
}