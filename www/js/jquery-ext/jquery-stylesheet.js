(function($) {
	// cssNameToJsName(name) - Converts style name in css format to camel case format used by javascript
	//
	// background-color => backgroundColor
	function cssNameToJsName(name)
	{
		var split = name.split("-");
		var output = "";
		for(var i = 0; i < split.length; i++)
		{
			if (i > 0 && split[i].length > 0 && !(i == 1 && split[i] == "ms"))
			{
				split[i] = split[i].substr(0, 1).toUpperCase() + split[i].substr(1);
			}
			output += split[i];
		}
		return output;
	}
	
	// jsNameToCssName(name) - Converts style name in javascript camel case format to css format; NOT USED
	//
	// backgroundColor => background-color
	function jsNameToCssName(name)
	{
		return name.replace(/([A-Z])/g, "-$1").toLowerCase();
	}
	
	// Rule - Object storing list of rules within stylesheets matching (=) provided selector
	//
	// Fields:
	// length - number of rules in the list
	// [i] - a single rule within the list (indexing has no relation to the indexing within the stylesheet)
	//
	// Methods:
	// css() - Alters style within rules or returns the value of the first specified style within a rule
	// each() - executes provided function for all rules within the list
	// remove() - removes rules in the list
	//
	// new Rule (name, sheet) - creates a new list of rules matching provided selector
	// name - rule selector
	// sheet - list of styles (Sheet object)
	//
	// new Rule (name, sheet, index) - creates a new list of rules matching provided selector and matching provided index within the parent stylesheet
	// name - rule selector
	// sheet - list of styles (Sheet object)
	// index - index filter
	function Rule (name, sheet, index)
	{
		this.length = 0;
		var self = this;
		sheet.each(function()
		{
			// ie<9 hack
			var rules = null;
			if (typeof this.cssRules == 'undefined')
			{
				rules = this.rules;
			}
			else
			{
				rules = this.cssRules;
			}
			for (var i = 0; i < rules.length; i++)
			{
				if (rules[i].selectorText == name && (typeof index == 'undefined' || i == index))
				{
					self[self.length] = rules[i]
					self[self.length].index = i;
					self.length++;
				}
			}
		});
	}

	// Alters style within rules or returns the value of the first specified style within a rule
	//
	// Rule.css(name) - returns value of specified style from the first rule in the list
	// name - style name in css format (for example "background-color")
	//
	// Example: $('#my-style').styleSheet().rule('p').css('color')
	//
	// Rule.css(name, value) - set specified style to provided value for all rules within the list
	// name - style name in css format
	// value - new value for specified style
	//
	// Example: $('#my-style').styleSheet().rule('p').css('color', 'red')
	//
	// Rule.css(name, value, index) - set specified style to provided value for rules matching provided index within the parent stylesheet
	// name - style name in css format
	// value - new value for specified style
	// index - rule index
	//
	// Example: $('#my-style').styleSheet().rule('p').css('color', 'red', 0)
	//
	// Rule.css(data) - set multiple styles for all rules in the list using an object (for example {'color' : 'red', 'font-weight' : 'bold'})
	// data - object containing style name and value pairs
	//
	// Example: $('#my-style').styleSheet().rule('p').css({'color' : 'red', 'font-weight' : 'bold'})
	//
	// Rule.css(data, index) - set multiple styles for all rules matching provided index within the parent stylesheet
	// data - object containing style name and value pairs
	// index - rule index
	//
	// Example: $('#my-style').styleSheet().rule('p').css({'color' : 'red', 'font-weight' : 'bold'}, 0)
	Rule.prototype.css = function() {
		var name = null;
		var data = null;
		var value = null;
		var index = null;
		// check function arguments to determine which where provided
		if (typeof arguments[0] == 'object')
		{
			data = arguments[0];
			if (arguments.length > 1)
			{
				index = arguments[1];
			}
		}
		else
		{
			name = arguments[0];
			if (arguments.length > 1)
			{
				value = arguments[1];
			}
			if (arguments.length > 2)
			{
				index = arguments[2];
			}
		}
		// check if set value or data was specified and if not return value of first matching style within the first rule in the list
		if (value == null && name != null)
		{
			if (this.lenght == 0)
				return null;
			
			return this[0].style[cssNameToJsName(name)];
		}
		// determin if we are setting multiple styles or just one
		if (data != null)
		{
			// if data object was provided, map its properties to styles
			this.each(function()
			{
				for (var key in data)
				{
					// optional index filter
					if (index == null || this.index == index)
						this.style[cssNameToJsName(key)] = data[key]
				}
			});
		}
		else
		{
			// if name and value were provided, set them
			this.each(function()
			{
				// optional index filter
				if (index == null || this.index == index)
					this.style[cssNameToJsName(name)] = value;
			});
		}
		return this;
	};
	
	// Rule.each(func) - executes provided function for all rules within the list
	// func - function to be executed
	Rule.prototype.each = function(func) {
		for(var i = 0; i < this.length; i++){
			func.apply(this[i], [this[i], i]);
		}
		return this;
	};
	
	// Rule.remove() - removes all rules in the list
	//
	// Rule.remove(index) - removes rules matching specified index within the parent stylesheet
	Rule.prototype.remove = function(index) {
		this.each(function()
		{
			if (typeof index == 'undefined' || this.index == index)
			{
				// ie<9 hack
				if (typeof this.parentStyleSheet.deleteRule == 'undefined')
				{
					this.parentStyleSheet.removeRule(this.index);
				}
				else
				{
					this.parentStyleSheet.deleteRule(this.index);
				}
			}
		});
	};
	
	// Sheet - Object storing list of stylesheets
	//
	// Fields:
	// elements - jquery style list of elements
	// length - number of stylesheets in the list
	// [i] - a single stylesheed within the list
	//
	// Methods:
	// each() - executes provided function for all rules within the list
	// rule() - returns a list of rules matching (=) provided selector within the stylesheet list
	// addRule() - adds a rule to stylesheets in the list
	//
	// new Sheet(elements) - creates a new stylesheet list from provided elements (element of type different than "style" will be ignored)
	// elements - jquery style list of elements
	//
	// Example: new Sheet($('style'))
	function Sheet (elements) {
		this.element = elements.find('style');
		this.length = 0;
		var self = this;
		elements.each(function()
		{
			self[self.length] = this.sheet;
			self.length++;
		});
	}
	
	// Sheet.rule() - returns list of rules with matching selector (=) from provided "style" elements (elements other than "style" are ignored)
	//
	// Sheet.rule(name) - returns list of rules with matching selector (=) from provided "style" elements
	// name - rule selector to match
	//
	// Example: $('#my-stylesheet').styleSheet().rule('p')
	//
	// Sheet.rule(name, index) - returns list of rules with matching selector (=) from provided "style" elements; also filtered by index within the parent stylesheet
	// name - rule selector to match
	// index - index within the parent stylesheet
	//
	// Example: $('#my-stylesheet').styleSheet().rule('p', 0)
	Sheet.prototype.rule = function(name, index) {
		return new Rule (name, this);
	};
	
	// Sheet.each(func) - executes provided function for all stylesheets within the list
	// func - function to be executed
	Sheet.prototype.each = function(func) {
		for(var i = 0; i < this.length; i++){
			func.apply(this[i], [this[i], i]);
		}
		return this;
	};
	
	// Sheet.addRule(name, style) - adds provided rule to all stylesheets in the list as the last rule in the stylesheet
	// name - rule selector
	// style - rule styles as a string or style name and value pair object
	//
	// Example: $('#my-stylesheet').styleSheet().addRule('p', 'color: red; font-weight: bold')
	// Example: $('#my-stylesheet').styleSheet().addRule('p', {'color': 'red', 'font-weight': 'bold'})
	//
	// Rule.addRule(name, style, index) - inserts provided rule to all stylesheets in the list in specified position
	// name - rule selector
	// style - rule styles as a string or style name and value pair object
	// index - position of the inserted rule within the stylesheet
	Sheet.prototype.addRule = function(name, style, index) {
		this.each(function()
		{
			var oldIe = typeof this.cssRules == 'undefined';
			if (typeof index == 'undefined')
			{
				// ie<9 hack
				var rules = null;
				if (oldIe)
				{
					rules = this.rules;
				}
				else
				{
					rules = this.cssRules;
				}
				index = rules.length;
			}
			var styleStr = "";
			if (typeof style == 'object')
			{
				for (var key in style)
				{
					styleStr += key + ": " + style[key] + ";";
				}
			}
			else
			{
				styleStr = style;
			}
			if (oldIe)
			{
				this.addRule(name, styleStr, index);
			}
			else
			{
				styleStr = name + " {" + styleStr + "}";
				this.insertRule(styleStr, index);
			}
		});
		return this;
	};
	
	// styleSheet - returns list of stylesheets ("style" elements) from within the provided elements
	//
	// Example: $('#my-stylesheet').styleSheet()
	$.fn.styleSheet = function() {
		return new Sheet (this);
	};
	
	// wrapper for styleSheet().rule(name, index)
	$.fn.cssRule = function(name, index) {
		return this.styleSheet().rule(name, index);
	};
	
	// wrapper for styleSheet().addRule(name, style, index)
	$.fn.addCssRule = function(name, style, index) {
		return this.styleSheet().addRule(name, style, index);
	};
	
	// wrapper for styleSheet().rule(name, index).remove();
	$.fn.removeCssRule = function(name, index) {
		return this.styleSheet().rule(name, index).remove();
	};
})(jQuery);