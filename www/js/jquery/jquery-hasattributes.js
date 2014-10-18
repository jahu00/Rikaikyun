// Based on code by Jeff Sternal (http://stackoverflow.com/users/47886/jeff-sternal)
// http://stackoverflow.com/a/2240305
(function($) {
	jQuery.expr[':'].hasAttributes = function(elem) {
		return elem.attributes.length;
	};
})(jQuery);