(function($) {
	var fakeScroll = {
		"onTouchStart" : function(event)
		{
			var element = this;
			element.fakeScroll.startScroll = parseInt($(element).css("margin-top")) * -1;
			element.fakeScroll.startPosition = event.originalEvent.touches[0].pageY;
			element.fakeScroll.lastMove = 0;
		},
		"onTouchMove" : function(event)
		{
			var element = this;
			var zoom = $(element).absoluteZoom();
			var newScroll = element.fakeScroll.startScroll + parseInt((element.fakeScroll.startPosition - event.originalEvent.touches[0].pageY) / zoom);
			if (newScroll < 0 || element.clientHeight < element.parentNode.clientHeight)
			{
				newScroll = 0;
			} else if (newScroll >  element.clientHeight - element.parentNode.clientHeight)
			{
				newScroll = element.clientHeight - element.parentNode.clientHeight;
			}
			element.fakeScroll.lastMove = parseInt($(element).css("margin-top")) + newScroll;
			$(element).css("margin-top", (newScroll * -1) + "px");
			event.preventDefault();
		},
		"onTouchEnd" : function(event)
		{
			var element = this;
			var zoom = $(element).absoluteZoom();
			var newScroll = parseInt($(element).css("margin-top")) * -1 + element.fakeScroll.lastMove;
			if (newScroll < 0 || element.clientHeight < element.parentNode.clientHeight)
			{
				newScroll = 0;
			} else if (newScroll >  element.clientHeight - element.parentNode.clientHeight)
			{
				newScroll = element.clientHeight - element.parentNode.clientHeight;
			}
			$(element).css("margin-top", (newScroll * -1) + "px");
			event.preventDefault();
		}
	};
	
	$.fn.fakeScroll = function() {
		this.each(function()
		{
			this.fakeScroll = {
				"startScroll" : 0,
				"startPosition" : 0,
				"lastMove" : 0
			};
		});
		$(this).on('touchstart', fakeScroll.onTouchStart);
		$(this).on('touchmove', fakeScroll.onTouchMove);
		$(this).on('touchend', fakeScroll.onTouchEnd);
	};
	$.fn.fakeScrollReset = function() {
		this.each(function()
		{
			$(this).css("margin-top", "");
		});
	};
})(jQuery);