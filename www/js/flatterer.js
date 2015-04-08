var flatterer = {
	flatten: function(elem, closed, topMost)
	{
		var self = this;
		var tagsToFlatten = ["div"];
		var nonInlinesToIgnore = ["br"];
		var replacementTag = "p";
		if (typeof closed == 'undefined')
		{
			closed = true;
		}
		if (typeof topMost == 'undefined')
		{
			topMost = true;
		}
		var output = "";
		if (elem.id)
		{
			var tagName = elem.tagName.toLowerCase();
			output += '<' + tagName + ' id="' + elem.id + '"></' + tagName + '>' + "\n";
		}
		for (var i = 0; i < elem.childNodes.length ; i++)
		{
			var node = elem.childNodes[i];
			if (node.nodeType === 3)
			{
				if (node.nodeValue.trim().length > 0)
				{
					if(closed)
					{
						closed = false;
						output += '<' + replacementTag +'>';
					}
					output += node.nodeValue.trim();
				}
			}
			else if($.inArray(node.nodeName.toLowerCase(), nonInlinesToIgnore) > -1 || $(node).css('display').indexOf('inline') > -1)
			{
				output += node.outerHTML;
			}
			else
			{
				if(!closed)
				{
					closed = true;
					output += '</' + replacementTag +'>' + "\n";
				}
				if ($.inArray(node.nodeName.toLowerCase(), tagsToFlatten) > -1)
				{
					output += self.flatten(node, closed, false);
				}
				else
				{
					output += node.outerHTML;
				}
			}
		}
		if(!closed)
		{
			closed = true;
			output += '</' + replacementTag +'>' + "\n";
		}
		return output;
	},
	divide: function(elem)
	{
		var output = "";
		var tagName = elem.tagName.toLowerCase();
		output += elem.outerHTML.replace(/(<br\s*?\/?>\s*){1,2}((<br\s*?\/?>\s*){0,})?\s*/gi, '</' + tagName + ">$2\n<" + tagName + '>');
		return output;
	}
}