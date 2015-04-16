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
			var element = this;
			var zoom = $(element).absoluteZoom();
			var newScroll = element.fakeScrollData.startScroll + parseInt((element.fakeScrollData.startPosition - event.originalEvent.touches[0].pageY) / zoom);
			if (newScroll < 0 || element.clientHeight < element.parentNode.clientHeight)
			{
				newScroll = 0;
				fakeScroll.startScroll(element, event);
			} else if (newScroll >  element.clientHeight - element.parentNode.clientHeight)
			{
				newScroll = element.clientHeight - element.parentNode.clientHeight;
				fakeScroll.startScroll(element, event);
			}
			element.fakeScrollData.lastMove = parseInt($(element).css("margin-top")) + newScroll;
			element.fakeScrollData.distance += Math.abs(element.fakeScrollData.lastMove);
			$(element).css("margin-top", (newScroll * -1) + "px");
			event.preventDefault();
		},
		"onTouchEnd" : function(event)
		{
			var element = this;
			var zoom = $(element).absoluteZoom();
			var newScroll = parseInt($(element).css("margin-top")) * -1 + element.fakeScrollData.lastMove;
			if (newScroll < 0 || element.clientHeight < element.parentNode.clientHeight)
			{
				newScroll = 0;
			} else if (newScroll >  element.clientHeight - element.parentNode.clientHeight)
			{
				newScroll = element.clientHeight - element.parentNode.clientHeight;
			}
			$(element).css("margin-top", (newScroll * -1) + "px");
			if (element.fakeScrollData.distance > element.fakeScrollData.distanceThreshold)
			{
				event.preventDefault();
				$(element).scroll();
			}
		}
	};
	
	$.fn.fakeScroll = function(val)
	{
		if (typeof val != "undefined")
		{
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
				"distanceThreshold": threshold
			};
		});
		$(this).on('touchstart', fakeScroll.onTouchStart);
		$(this).on('touchmove', fakeScroll.onTouchMove);
		$(this).on('touchend touchcancel', fakeScroll.onTouchEnd);
	};
	$.fn.fakeScrollOff = function()
	{
		$(this).fakeScrollReset();
		delete myJSONObject.fakeScroll;
		$(this).off('touchstart', fakeScroll.onTouchStart);
		$(this).off('touchmove', fakeScroll.onTouchMove);
		$(this).off('touchend touchcancel', fakeScroll.onTouchEnd);
	};
	$.fn.fakeScrollReset = function() {
		this.each(function()
		{
			$(this).css("margin-top", "");
		});
	};
})(jQuery);