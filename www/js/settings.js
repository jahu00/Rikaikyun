function Settings(reader)
{
	this.reader = reader;
	App.log("Load brightness plugin")
	if (typeof cordova != "undefined")
	{
		try
		{
			this.brightness = cordova.require("cordova.plugin.Brightness.Brightness");
		}
		catch(e)
		{
			App.log('Warnning: Can\'t load brightness controll!');
			this.brightness = null;
		}
	}
	else
	{
		this.brightness = null;
	}
	this.init();
}

Settings.prototype = {
	init: function()
	{
		var self = this;
		self.screen = $('.screen.settings.menu');
		document.addEventListener("softbackbutton", function(e)
		{
			if (self.screen.is(':visible'))
			{
				self.reader.selectScreen('main.menu');
				e.stopImmediatePropagation();
			}
		}, false);
		
		var fastClickDestructionTimeout = null;
		var useFastClickControl = new CheckboxControl(self.screen.find('.useFastClick'), function(value)
		{
			if (value)
			{
				if (fastClickDestructionTimeout == null)
				{
					App.fastClick = FastClick.attach(document.body);
				}
				else
				{
					clearTimeout(fastClickDestructionTimeout);
				}
			}
			else
			{
				if (App.fastClick != null)
				{
					// Adding delay to turning off fast click (should prevent it from reenabling itself).
					// This is probably caused by regular delayed click that happens after fast click is killed.
					fastClickDestructionTimeout = setTimeout(function()
					{
						App.fastClick.destroy();
						App.fastClick = null;
						fastClickDestructionTimeout = null;
					}, 350);
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
		
		var screenOrientationControl = new DropdownControl(self.screen.find('.screenOrientation'), function(value)
		{
			if (typeof window.plugins != "undefined" && window.plugins.orientationLock != "undefined" && window.plugins.orientationLock != null)
			{
				if (value == "auto")
				{
					window.plugins.orientationLock.unlock();
				}
				else
				{
					window.plugins.orientationLock.lock(value);
				}
			}
		}, "auto");

		var enableNativeStatusBarControl = new CheckboxControl(self.screen.find('.enableNativeStatusBar'), function(value)
		{
			if (typeof StatusBar != "undefined")
			{
				if (value)
				{
					StatusBar.show();
				}
				else
				{
					StatusBar.hide();
				}
			}
		},
		"false");
		
		var brightnessControl = new SliderControl(self.screen.find('.brightness'), function(value)
		{
			if (self.brightness != null)
			{
				self.brightness.setBrightness(value/100, function(){}, function(error){ alert(error); });
			}
		},
		50);		
		
		var openMethodControl = new DropdownControl(self.screen.find('.openMethod'), undefined, "AJAX");

		var fontSizeControl = new SliderControl(self.screen.find('.fontSize'), function(value)
		{
			self.reader.screen.find('.container').css('font-size', value/100 + "em");
			$('.dynamicStyle').cssRule('.container img').css('zoom', value + "%");
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
		
		var timeTimer = null;
		window.addEventListener("batterystatus", function(info)
		{
			self.reader.screen.find('.statusBar .battery').text(info.level + "%");
			self.reader.adjustStatusWidth();
		}, false);
		
		function updateTime()
		{
			var now = new Date();
			self.reader.screen.find('.statusBar .time').text((now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes());
			self.reader.adjustStatusWidth();
		}
		
		function changeStatusControl(value, side)
		{
			var statusBar = self.reader.screen.find('.statusBar');
			statusBar.find('.col.status.' + side + ' > span > *').hide();
			if (value == "none")
			{
				statusBar.find('.col.' + side).hide();
			}
			else
			{
				statusBar.find('.col.' + side).show();
				statusBar.find('.col.status.' + side + ' > span > .' + value).show();
			}
			if (statusBar.find('.time:visible'))
			{
				updateTime();
				timeTimer = setInterval(updateTime, 30000);
			}
			else if (timeTimer != null)
			{
				clearInterval(timeTimer);
				timeTimer = null;
			}
		}
		
		var statusLeftController = new DropdownControl(self.screen.find('.statusLeft'), function(value)
		{
			changeStatusControl(value, "left");
		}, "none");
		
		var statusRightController = new DropdownControl(self.screen.find('.statusRight'), function(value)
		{
			changeStatusControl(value, "right");
		}, "progress");
		
		var statusPagedControl = new CheckboxControl(self.screen.find('.statusPaged'), function(value)
		{
			//reader.updateStatus();
		},
		"false");
		
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
			// This hack is applied directly in reader code, so there is nothing to be done here
		},
		"false");
		
		// Back button emulation on Chrome
		function pushDummy()
		{
			history.pushState({}, null, window.location.href);
		}
		function backButtonDummy(e)
		{
			var event = new Event('backbutton');
			e.stopImmediatePropagation();
			document.dispatchEvent(event);
			pushDummy();
			//return false;
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
		
		/*var droid4HacksControl = new CheckboxControl(self.screen.find('.useDroid4Hacks'), function(value)
		{
			var container = $('.container');
			if (value)
			{
				if (!container.hasClass('brHack'))
				{
					container.addClass('brHack');
				}
			}
			else
			{
				container.removeClass('brHack');
			}
		},
		"true");*/
		
		var droid5HacksStartValue = null;
		var droid5HacksControl = new CheckboxControl(self.screen.find('.useDroid5Hacks'), function(value)
		{
			if (droid5HacksStartValue == null)
			{
				droid5HacksStartValue = value;
			}
			else if (droid5HacksStartValue != value)
			{
				alert('This change requires restarting the app!');
			}
		},
		"false");
	}
}