var App = {
	selectScreen: function(elem)
	{
		/*if($('.screen.reader').is(":visible"))
		{
			this.updateStatus();
		}*/
		$('.screen').removeClass('active');
		$(elem).addClass('active');
		/*var activeScreen = $('.screen.' + name);
		activeScreen.addClass('active');*/
		/*if (localStorage['useGpuHack'] == "true")
		{
			this.forceRefresh(activeScreen);
		}*/
	}
}