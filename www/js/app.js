var App = {
	fastClick: null,
	tempData: null,
	init: function()
	{
		App.log("Start app initialization");
		var self = this;
		preloadStyleImages.preload();
		App.log("Start reader initialization");
		App.log(typeof Reader);
		self.reader = new Reader();
		App.log("Reader initialization complete");
		//window.reader = this.reader;
		// Block context menu (makes the app run less buggy on chrome on desktop)
		$(document.body).on('contextmenu', function(e)
		{
			//e.preventDefault();
			/*console.log('menu');
			if (localStorage["chromeHack"] == "true")
			{
				var event = new Event('menubutton');
				event.stop = function()
				{
					this.stopImmediatePropagation();
				};
				document.dispatchEvent(event);
			}*/
			return false;
		});
		$(document.body).on('ondragstart onselectstart', function()
		{
			return false;
		});
		
		document.addEventListener("backbutton", function(e)
		{
			self.triggerBackButton();
		}, false);
		App.log("App initialization complete");
		var lastFile = localStorage["lastFile"] || '';
		if (lastFile != '')
		{
			if (localStorage["loadingStatus"] != "LOADING")
			{
				this.reader.openFile(lastFile);
				return
			}
			else
			{
				alert('Application crashed while opening "' + lastFile + '"' + "\n\nThis is either a bug in the application, bug in the file or the file is too big for current opening method (you can change opening method in the settings).")
				localStorage["lastFile"] = '';
			}
			//console.log("Open: " + lastFile);
		}
		self.reader.selectScreen('main.menu');
	},
	forceRefresh: function(elem)
	{
		elem = $(elem);
		if (localStorage['useGpuHack'] == "true")
		{
			if (!elem.hasClass('gpu'))
			{
				elem.addClass('gpu');
				//activeScreen.removeClass('gpu');
				setTimeout(function()
				{
					elem.removeClass('gpu');
				}, 100);
			}
		}
	},
	selectScreen: function(elem)
	{
		if(this.reader.screen.is(":visible"))
		{
			this.reader.updateStatus();
		}
		$('.screen').removeClass('active');
		this.forceRefresh(elem);
		$(elem).addClass('active');
	},
	log: function(msg)
	{
		var date = new Date();
		console.log(date.getTime() / 1000 + ' ' + msg);
	},
	triggerBackButton: function()
	{
		var event = null;
		if (typeof CustomEvent == "function")
		{
			event = new CustomEvent('softbackbutton');
		}
		else
		{
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('softbackbutton', true, true, {});
		}
		document.dispatchEvent(event);
	}
}