var App = {
	forceRefresh: function(elem)
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
	},
	selectScreen: function(elem)
	{
		$('.screen').removeClass('active');
		$(elem).addClass('active');
		/*if (localStorage['useGpuHack'] == "true")
		{
			this.forceRefresh(activeScreen);
		}*/
	}
}