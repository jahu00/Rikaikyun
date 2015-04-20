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
		
		setGpu((localStorage['useGpu'] || "false") == "true");
		//setGpuHack((localStorage['useGpuHack'] || "false") == "true");
		setGpuHack(false);
		
		var openMethodControl = new DropdownControl(self.screen.find('.openMethod'), undefined, "FileSystem");

		var fontSizeControl = new SliderControl(self.screen.find('.fontSize'), function(value)
		{
			self.reader.screen.find('.container').css('font-size', value + "px");
		},
		self.reader.screen.find('.container').css('font-size'));
		
		var paddingControl = new SliderControl(self.screen.find('.padding'), function(value)
		{
			self.reader.screen.find('.container').css('padding', value + '%');
		},
		5);
		
		var lineHeightControl = new SliderControl(self.screen.find('.lineHeight'), function(value)
		{
			self.reader.screen.find('.container').css('line-height', value);
		},
		1.5);
		//alert(parseFloat($('.gui').css('font-size')) + " " + parseFloat($(document.body).css('font-size')));
		var guiSizeControl = {
			init: function(control, defaultValue, min, max, step)
			{
				var self = this;
				self.control = $(control);
				self.systemName = self.control.attr('data-system-name') || "guiSize";
				self.min = min;
				self.max = max;
				self.step = step;
				var value = parseFloat(localStorage[self.systemName] || defaultValue);
				self.lastValue = value;
				self.setValue(value);
				self.control.find('.value').click(function()
				{
					var value = parseFloat(prompt(self.control.find('.name').text(), self.lastValue));
					if (!isNaN(value) && value != self.LastValue)
					{
						self.setValue(value);
						setTimeout(function()
						{
							if(confirm("Do you want to keep the new GUI size?"))
							{
								self.lastValue = value;
							}
							else
							{
								self.setValue(self.lastValue);
							}
						}, 50);
					}
				});
			},
			setValue: function(value)
			{
				value = ExtendedMath.valueFromRange(value, null, this.min, this.max, this.step).value;
				localStorage[this.systemName] = value;
				$('.dynamicStyle').cssRule('.gui').css('font-size', value/100 + "em");
				this.control.find('.value').text(value);
			}
		};
		guiSizeControl.init(
			self.screen.find('.guiSize'),
			parseFloat($('.gui').css('font-size')) / parseFloat($(document.body).css('font-size')) * 100,
			50, 500, 1
		);
		
		var furiganaModeControl = new DropdownControl(self.screen.find('.furiganaMode'), function(value)
		{
			//console.log("everything is broken");
			var options = "";
			$(this).find('select option').each(function()
			{
				
				options += " furigana-" + this.value;
			});
			var container = self.reader.screen.find('.container');
			container.removeClass(options.trim());
			container.addClass("furigana-" + value);
		}, "default");
		
		var furiganaSizeControl = new SliderControl(self.screen.find('.furiganaSize'), function(value)
		{
			$('.dynamicStyle').cssRule('ruby > rt').css('font-size', value + "%");
		},
		50);
		
		var furiganaSizeControl = new SliderControl(self.screen.find('.furiganaHeight'), function(value)
		{
			$('.dynamicStyle').cssRule('ruby > rt').css('line-height', value + "em");
		},
		1.5);
	}
}