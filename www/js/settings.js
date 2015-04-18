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
		
		self.screen.find('.padding input').on("input", function()
		{
			updateSliderValue(this, this.value + '%');
		});
		
		self.screen.find('.padding input').change(function()
		{
			updateSliderValue(this, this.value + '%');
			localStorage['padding'] = this.value;
			self.reader.screen.find('.container').css('padding', this.value + '%');
		});
		
		self.screen.find('.lineHeight input').on("input", function()
		{
			updateSliderValue(this, this.value);
		});
		
		self.screen.find('.lineHeight input').change(function()
		{
			updateSliderValue(this, this.value);
			localStorage['lineHeight'] = this.value;
			$('.dynamicStyle').cssRule('.container').css('line-height', this.value);
		});
		
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
		self.screen.find('.padding input').val(parseFloat(localStorage['padding'] || self.reader.screen.find('.container').css('padding'))).change();
		self.screen.find('.lineHeight input').val
		(
			parseFloat
			(
				localStorage['lineHeight'] ||
				(
					parseInt(self.reader.screen.find('.container').css('line-height')) / 
					parseInt(self.reader.screen.find('.container').css('font-size'))
				)
			)
		).change();
		self.screen.find('.fontSize .slider-control').slider(
		{
			oninput: function()
			{
				self.screen.find('.fontSize .value').text($(this).attr('data-value'));
			},
			onchange: function()
			{
				var value = parseFloat($(this).attr('data-value'));
				self.screen.find('.fontSize .value').text(value);
				localStorage['fontSize'] = value;
				self.reader.screen.find('.container').css('font-size', value + "px");
			}
		}).val(parseFloat(localStorage['fontSize'] || self.reader.screen.find('.container').css('font-size'))).change();
		self.screen.find('.fontSize .value').click(function()
		{
			var value = parseFloat(prompt("Font size", self.screen.find('.fontSize .slider-control').slider().val()));
			if (!isNaN(value))
			{
				self.screen.find('.fontSize .slider-control').slider().val(value).change();
			}
		});
	}
}