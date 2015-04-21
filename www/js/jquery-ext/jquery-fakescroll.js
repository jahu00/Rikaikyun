(function($) {
	var fakeScroll = {
		startScroll: function(element, event)
		{
			element.fakeScrollData.startScroll = parseInt($(element).css("margin-top")) * -1;
			element.fakeScrollData.startPosition = event.originalEvent.touches[0].pageY;
		},
		
		"onTouchStart" : function(event)
		{
			var element = this;
			element.fakeScrollData.lastMove = 0;
			element.fakeScrollData.distance = 0;
			fakeScroll.startScroll(element, event);
		},
		"onTouchMove" : function(event)
		{
			event.preventDefault();
			var element = this;
			clearTimeout(element.fakeScrollData.clearScroll);
			var newScroll = element.fakeScrollData.startScroll + parseInt((element.fakeScrollData.startPosition - event.originalEvent.touches[0].pageY));// / zoom);

			$(element).fakeScroll(newScroll, event);
			element.fakeScrollData.clearScroll = setTimeout(function()
			{
				element.fakeScrollData.lastMove = 0;
			}, 100);
			
		},
		"onTouchEnd" : function(event)
		{
			var element = this;
			clearTimeout(element.fakeScrollData.clearScroll);
			var newScroll = $(element).fakeScroll() + element.fakeScrollData.lastMove;

			$(element).fakeScroll(newScroll, event);
			if (element.fakeScrollData.distance > element.fakeScrollData.distanceThreshold)
			{
				event.preventDefault();
				$(element).scroll();
			}
		}
	};
	
	$.fn.fakeScroll = function(val, event)
	{
		if (typeof val != "undefined")
		{
			var element = this[0];
			if (val < 0 || element.clientHeight < element.parentNode.clientHeight)
			{
				val = 0;
				if (typeof event != "undefined")
				{
					fakeScroll.startScroll(element, event);
				}
			} else if (val >  element.clientHeight - element.parentNode.clientHeight)
			{
				val = element.clientHeight - element.parentNode.clientHeight;
				if (typeof event != "undefined")
				{
					fakeScroll.startScroll(element, event);
				}
			}
			element.fakeScrollData.lastMove = parseInt($(element).css("margin-top")) + val;
			element.fakeScrollData.distance += Math.abs(element.fakeScrollData.lastMove);
			$(this).css("margin-top", (val * -1) + "px");
		}
		return parseInt($(this).css("margin-top") || "0") * -1;
	};
	
	$.fn.fakeScrollOn = function(threshold)
	{
		if (typeof threshold == "undefined")
		{
			threshold = 10;
		}
		this.each(function()
		{
			this.fakeScrollData = {
				"startScroll" : 0,
				"startPosition" : 0,
				"lastMove" : 0,
				"distance": 0,
				"distanceThreshold": threshold,
			};
		});
		$(this).on('touchstart', fakeScroll.onTouchStart);
		$(this).on('touchmove', fakeScroll.onTouchMove);
		$(this).on('touchend touchcancel', fakeScroll.onTouchEnd);
	};
	$.fn.fakeScrollOff = function()
	{
		
			$(this).fakeScrollReset();
			$(this).each(function()
			{
				delete this.fakeScroll;
			});
			$(this).off('touchstart', fakeScroll.onTouchStart);
			$(this).off('touchmove', fakeScroll.onTouchMove);
			$(this).off('touchend touchcancel', fakeScroll.onTouchEnd);
	};
	$.fn.fakeScrollReset = function() {
		$(this).each(function()
		{
			$(this).css("margin-top", "");
		});
	};
})(jQuery);