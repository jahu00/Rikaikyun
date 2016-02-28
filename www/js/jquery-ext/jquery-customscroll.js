(function($) {
	var customScroll = {
		startScroll: function(element, event)
		{
			//element.customScrollData.startScroll = parseInt($(element).css("margin-top")) * -1;
			element.customScrollData.startPosition = event.originalEvent.touches[0].pageY;
			element.customScrollData.lastPosition = event.originalEvent.touches[0].pageY;
		},
		
		"onTouchStart" : function(event)
		{
			var element = this;
			if (element.customScrollData.touchId == null)
			{
				element.customScrollData.lastMove = 0;
				element.customScrollData.distance = 0;
				element.customScrollData.touchId = event.originalEvent.touches[0].identifier;
				customScroll.startScroll(element, event);
			}
		},
		"onTouchMove" : function(event)
		{
			event.preventDefault();
			var element = this;
			if (element.customScrollData.touchId == event.originalEvent.touches[0].identifier)
			{
				clearTimeout(element.customScrollData.clearScroll);
				//var newScroll = element.customScrollData.startScroll + parseInt((element.customScrollData.startPosition - event.originalEvent.touches[0].pageY));// / zoom);
				var newScroll = parseInt((element.customScrollData.lastPosition - event.originalEvent.touches[0].pageY));

				$(element).customScroll(newScroll, event);
				element.customScrollData.clearScroll = setTimeout(function()
				{
					element.customScrollData.lastMove = 0;
				}, 100);
				element.customScrollData.lastPosition = event.originalEvent.touches[0].pageY;
			}
		},
		"onTouchEnd" : function(event)
		{
			var element = this;
			// At this point we know nothing about the touch that ended, so we have to settle for stopping scroll on any ending touch
			//if (element.customScrollData.touchId == event.originalEvent.touches[0].identifier)
			//{
				clearTimeout(element.customScrollData.clearScroll);
				var newScroll = /*$(element).customScroll() +*/ element.customScrollData.lastMove;
				if (element.customScrollData.lastMove != 0)
				{
					$(element).customScroll(newScroll, event);
				}
				if (element.customScrollData.distance > element.customScrollData.distanceThreshold)
				{
					event.preventDefault();
					$(element).scroll();
					if (typeof element.customScrollData.onend != "undefined")
					{
						element.customScrollData.onend();
					}
				}
				element.customScrollData.touchId = null;
				
			//}
		}
	};
	
	$.fn.customScroll = function(val, event)
	{
		if (typeof val != "undefined")
		{
			//var position = parseInt($(element).css("margin-top"));
			var element = this[0];
			val1 = element.customScrollData.onscroll(val);
			if (val1 == 0 || val1 != val)// || element.clientHeight < element.parentNode.clientHeight)
			{
				val1 = 0;
				if (typeof event != "undefined")
				{
					customScroll.startScroll(element, event);
				}
			}/* else if (val >  element.clientHeight - element.parentNode.clientHeight)
			{
				val = element.clientHeight - element.parentNode.clientHeight;
				if (typeof event != "undefined")
				{
					customScroll.startScroll(element, event);
				}
			}*/
			element.customScrollData.lastMove = val1;//position + val;
			element.customScrollData.distance += Math.abs(element.customScrollData.lastMove);
			var position = parseInt($(element).css("margin-top"));
			$(this).css("margin-top", (position - val1) + "px");
		}
		return parseInt($(this).css("margin-top") || "0") * -1;
	};
	
	$.fn.customScrollOn = function(onscroll, onend, threshold)
	{
		if (typeof threshold == "undefined")
		{
			threshold = 10;
		}
		this.each(function()
		{
			this.customScrollData = {
				"startScroll" : 0,
				"startPosition" : 0,
				"lastMove" : 0,
				"distance": 0,
				"distanceThreshold": threshold,
				"touchId": null,
				"onscroll": onscroll,
				"onend": onend
			};
		});
		$(this).on('touchstart', customScroll.onTouchStart);
		$(this).on('touchmove', customScroll.onTouchMove);
		$(this).on('touchend touchcancel', customScroll.onTouchEnd);
	};
	$.fn.customScrollOff = function()
	{
		
			$(this).customScrollReset();
			$(this).each(function()
			{
				delete this.customScroll;
			});
			$(this).off('touchstart', customScroll.onTouchStart);
			$(this).off('touchmove', customScroll.onTouchMove);
			$(this).off('touchend touchcancel', customScroll.onTouchEnd);
	};
	$.fn.customScrollReset = function() {
		$(this).each(function()
		{
			$(this).css("margin-top", "");
		});
	};
})(jQuery);