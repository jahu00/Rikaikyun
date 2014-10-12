(function($) {
	function getAbsoluteZoom(element, topParent)
	{
		if (typeof topParent != 'undefined' && topParent.jquery)
		{
			topParent = topParent[0];
		}
		var self = $(element);
		var value = 1;
		var zoom = self.css('zoom');
		if (!isNaN(zoom))
		{
			value = value * zoom;
			if (self.parent().length > 0 && (typeof topParent == 'undefined' || self.parent()[0] != topParent))
			{
				value = value * getAbsoluteZoom(self.parent(), topParent);
			}
		}
		return value;
	}

	$.fn.absoluteZoom = function(topParent) {
		return getAbsoluteZoom(this, topParent);
	};
	
	$.fn.parentZoom = function(topParent) {
		return getAbsoluteZoom(this.parent(), topParent);
	};
})(jQuery);