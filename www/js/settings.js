function Settings(reader)
{
	this.reader = reader;
	this.init();
}

Settings.prototype = {
	init: function()
	{
		var self = this;
		self.screen = $('.screen.settings.menu');
		document.addEventListener("backbutton", function(e)
		{
			if (self.screen.is(':visible'))
			{
				self.reader.selectScreen('main.menu');
				e.stop();
			}
		}, false);
		
		var useFastClickControl = new CheckboxControl(self.screen.find('.useFastClick'), function(value)
		{
			if (value)
			{
				App.fastClick = FastClick.attach(document.body);
			}
			else
			{
				if (App.fastClick != null)
				{
					App.fastClick.destroy();
					App.fastClick = null;
				}
			}
		},
		"true");
		
		var useGpuControl = new CheckboxControl(self.screen.find('.useGpu'), function(value)
		{
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
		},
		"false");
		
		var useKeepScreenOnControl = new CheckboxControl(self.screen.find('.useKeepScreenOn'), function(value)
		{
			if (typeof keepscreenon != "undefined")
			{
				if (value)
				{
					keepscreenon.enable();
				}
				else
				{
					keepscreenon.disable();
				}
			}
		},
		"false");
		
		var openMethodControl = new DropdownControl(self.screen.find('.openMethod'), undefined, "FileSystem");

		var fontSizeControl = new SliderControl(self.screen.find('.fontSize'), function(value)
		{
			self.reader.screen.find('.container').css('font-size', value/100 + "em");
			$('.dynamicStyle').cssRule('.img-frame img').css('zoom', value + "%");
			$('.dynamicStyle').cssRule('.spinner').css('zoom', value + "%");
		},
		parseFloat($('.container').css('font-size')) / parseFloat($(document.body).css('font-size')) * 100);
		//self.reader.screen.find('.container').css('font-size'));
		
		var paddingControl = new SliderControl(self.screen.find('.padding'), function(value)
		{
			//self.reader.screen.find('.container').css({'padding-top': value + '%', 'padding-bottom': value + '%'});
			self.reader.screen.find('.scroller').css({'padding-right': value + '%', 'padding-left': value + '%'});
		},
		5);
		
		var lineHeightControl = new SliderControl(self.screen.find('.lineHeight'), function(value)
		{
			self.reader.screen.find('.container').css('line-height', value);
		},
		1.5);
		var dictionarySizeControl = new SliderControl(self.screen.find('.dictionarySize'), function(value)
		{
			self.reader.screen.find('.floater').css('font-size', value/100 + "em");
		},
		parseFloat($('.floater').css('font-size')) / parseFloat($(document.body).css('font-size')) * 100);
		
		var statusSizeControl = new SliderControl(self.screen.find('.statusSize'), function(value)
		{
			self.reader.screen.find('.statusBar').css('font-size', value/100 + "em");
		},
		parseFloat($('.statusBar').css('font-size')) / parseFloat($(document.body).css('font-size')) * 100);
		
		var statusPagedControl = new CheckboxControl(self.screen.find('.statusPaged'), function(value)
		{
			//reader.updateStatus();
		},
		"true");
		
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
						}, 300);
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
		
		$('.userAgent .description').text(navigator.userAgent);
		$('.userAgent').click(function(){ alert($(this).find('.description').text()); });
		
		var useGpuHackControl = new CheckboxControl(self.screen.find('.useGpuHack'), function(value)
		{
			/*if (value)
			{
				$('.screen.loading:not(.gpu)').addClass('gpu');
			}
			else
			{
				$('.screen.loading').removeClass('gpu');
			}*/
		},
		"false");
		
		function pushDummy()
		{
			history.pushState({}, null, window.location.href);
		}
		function backButtonDummy(e)
		{
			var event = new Event('backbutton');
			event.stop = function()
			{
				this.stopImmediatePropagation();
			};
			document.dispatchEvent(event);
			pushDummy();
		}
		
		var chromeHackControl = new CheckboxControl(self.screen.find('.chromeHack'), function(value)
		{
			if (value)
			{
				pushDummy();
				$(window).on("popstate", backButtonDummy);
			}
			else
			{
				$(window).off("popstate", backButtonDummy);
			}
		},
		"false");
	}
}