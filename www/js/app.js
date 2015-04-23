var App = {
	init: function()
	{
		preloadStyleImages.preload();
		FastClick.attach(document.body);
		this.reader = new Reader();//dict);
		// Block context menu (makes the app run less buggy on chrome on desktop)
		$(document.body).on('contextmenu', function(e)
		{
			e.preventDefault();
			if (localStorage["chromeHack"] == "true")
			{
				var event = new Event('menubutton');
				event.stop = function()
				{
					this.stopImmediatePropagation();
				};
				document.dispatchEvent(event);
			}
		});
		var lastFile = localStorage["lastFile"] || '';
		if (lastFile != '')
		{
			this.reader.openFile(lastFile);
			//console.log("Open: " + lastFile);
		}
		else
		{
			this.reader.selectScreen('main.menu');
		}
	},
	forceRefresh: function(elem)
	{
		if (localStorage['useGpuHack'] == "true")
		{
			if (!elem.hasClass('gpu'))
			{
				elem.addClass('gpu');
				//activeScreen.removeClass('gpu');
				setTimeout(function()
				{
					elem.removeClass('gpu');
				}, 10);
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
	}
}