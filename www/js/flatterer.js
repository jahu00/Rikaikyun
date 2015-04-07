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
			//console.log([node]);//, $(node).css('display'));
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
				//console.log('ever', node.nodeName);
				output += node.outerHTML;
			}
			else
			{
				//console.log($(node).css('display'), node.nodeName);
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
		output += '<' + tagName + (elem.id ? ' id="' + elem.id + '"' : "") + '>';
		//output += elem.innerHTML.replace(/(<br\s*?\/?>\s*){2,}/gi, '</' + tagName + ">\n<" + tagName + '>');
		//output += elem.innerHTML.replace(/<br\s*?\/?>\s*()?/gi, '</' + tagName + ">\n<" + tagName + '>');
		output += elem.innerHTML.replace(/<br\s*?\/?>\s*((<br\s*?\/?>\s*){0,})\s*/gi, '</' + tagName + ">$1\n<" + tagName + '>');
		output += '</' + tagName + '>';
		return output;
	}
}