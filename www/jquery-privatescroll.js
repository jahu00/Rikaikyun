(function($) {
	var privateScroll = {
		"onTouchStart" : function(event)
		{
			var element = this;
			element.privateScroll.startScroll = element.scrollTop;
			element.privateScroll.startPosition = event.originalEvent.touches[0].pageY;
		},
		"onTouchMove" : function(event)
		{
			var element = this;
			var zoom = $(element).absoluteZoom();
			var newScroll = element.privateScroll.startScroll + parseInt((element.privateScroll.startPosition - event.originalEvent.touches[0].pageY) / zoom);
			if (newScroll < 0)
			{
				newScroll = 0;
			} else if (newScroll >  element.scrollHeight - element.clientHeight)
			{
				newScroll = element.scrollHeight - element.clientHeight;
			}
			element.scrollTop = newScroll;
			event.preventDefault();
		}
	};
	
	$.fn.privateScroll = function() {
		this.each(function()
		{
			this.privateScroll = {
				"startScroll" : 0,
				"startPosition" : 0
			};
		});
		$(this).on('touchstart', privateScroll.onTouchStart);
		$(this).on('touchmove', privateScroll.onTouchMove);
	};
})(jQuery);