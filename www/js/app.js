var App = {
	fastClick: null,
	tempData: null,
	init: function()
	{
		preloadStyleImages.preload();
		//FastClick.attach(document.body);
		this.reader = new Reader();//dict);
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
		
		document.addEventListener("backbutton", function(e)
		{
			document.dispatchEvent(new CustomEvent('softbackbutton'))
		}, false);
		
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
			var container = $('.container');
			this.tempData = container.html();
			container.html("");
		}
		$('.screen').removeClass('active');
		this.forceRefresh(elem);
		if (this.tempData != null && $(elem)[0] == this.reader.screen[0])
		{
			$('.container').html(this.tempData);
			this.tempData = null;
		}
		$(elem).addClass('active');
	},
	log: function(msg)
	{
		var date = new Date();
		console.log(date.getTime() / 1000, msg);
	}
}