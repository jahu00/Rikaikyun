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
			if (self.screen.is(':visible'))
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
		
		function updateSliderValue(control, value)
		{
			var control = $(control);
			control.closest('.slider').find('.value').text(value);
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
		
		function setGpuHack(value)
		{
			var control = self.screen.find('.useGpuHack');
			setControl(control, value);
			localStorage['useGpuHack'] = value;
			if (value)
			{
				$('.screen.loading:not(.gpu)').addClass('gpu');
			}
			else
			{
				$('.screen.loading').removeClass('gpu');
			}
		}
		
		self.screen.find('.useGpu').click(function()
		{
			var value = !readControlValueBool(this);
			setGpu(value);
		});
		
		self.screen.find('.useGpuHack').click(function()
		{
			var value = !readControlValueBool(this);
			setGpuHack(value);
		});
		
		self.screen.find('.openMethod select').change(function(e)
		{
			localStorage['openMethod'] = this.value;
		});
		
		setGpu((localStorage['useGpu'] || "false") == "true");
		//setGpuHack((localStorage['useGpuHack'] || "false") == "true");
		setGpuHack(false);
		
		localStorage['openMethod'] = localStorage['openMethod'] || "FileSystem";
		self.screen.find('.openMethod select').val(localStorage['openMethod']);

		var fontSizeControl = new SliderControl(self.screen.find('.fontSize'), function(value)
		{
			self.reader.screen.find('.container').css('font-size', value + "px");
		},
		self.reader.screen.find('.container').css('font-size'));
		
		var paddingControl = new SliderControl(self.screen.find('.padding'), function(value)
		{
			self.reader.screen.find('.container').css('padding', value + '%');
		},
		self.reader.screen.find('.container').css('padding'));
		
		var lineHeightControl = new SliderControl(self.screen.find('.lineHeight'), function(value)
		{
			self.reader.screen.find('.container').css('line-height', value);
		},
		self.reader.screen.find('.container').css('line-height'));
	}
}