var App = {
	init: function()
	{
		this.reader = new Reader();
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