var textCrawler = {
	getTextNodeList: function(startingNode, startPosition, length, topParent, excludeNodes)
	{
		if (typeof startPosition == 'undefined' || startPosition == null)
		{
			startPosition = 0;
		}
		if (typeof excludeNodes == 'undefined' || excludeNodes == null)
		{
			excludeNodes = [];
		}
		else if (!(excludeNodes instanceof Array))
		{
			excludeNodes = excludeNodes.split(",");
			excludeNodes.forEach(function(val, i)
			{
				excludeNodes[i] = val.trim();
			});
		}
		var result = new Array();
		result.push(startingNode);
		var currentLength = startingNode.nodeValue.length - startPosition;
		currentNode = this.nextNode(startingNode, topParent);
		while (currentNode != null && result.length < length)
		{
			if (currentNode.nodeType === 3)
			{
				result.push(currentNode);
				currentLength += currentNode.nodeValue.length;
				currentNode = this.nextNode(currentNode, topParent);
			}
			else if ($.inArray(currentNode.nodeName, excludeNodes) == -1 && currentNode.childNodes.length > 0)
			{
				currentNode = currentNode.childNodes[0];
			}
			else
			{
				currentNode = this.nextNode(currentNode, topParent);
			}
		}
		return result;
	},
	nextNode: function(currentNode, topParent)
	{
		if (typeof topParent == 'undefined')
		{
			topParent = null;
		}
		var result = currentNode.nextSibling;
		if (result != null)
		{
			return result;
		}
		if (currentNode.parentNode == null || (topParent != null && currentNode.parentNode === topParent))
		{
			return null;
		}
		return this.nextNode(currentNode.parentNode);
	},
	getText: function(nodeList, startPosition, length)
	{
		if (typeof startPosition == 'undefined' || startPosition == null)
		{
			startPosition = 0;
		}
		if (typeof length == 'undefined')
		{
			length = null;
		}
		var result = "";
		for (var i = 0; i < nodeList.length && (length == null || result.length < length); i++)
		{
			if (i == 0 && startPosition > 0)
			{
				result += nodeList[i].nodeValue.substr(startPosition);
				continue;
			}
			result += nodeList[i].nodeValue;
		}
		if (length != null && result.length > length)
		{
			result = result.substr(length);
		}
		return result;
	},
	getEndNode: function(nodeList, startPosition, length)
	{
		if (typeof startPosition == 'undefined' || startPosition == null)
		{
			startPosition = 0;
		}
		if (typeof length == 'undefined')
		{
			length = null;
		}
		var result = { node: null, position: 0 };
		var currentLength = 0;
		for (var i = 0; i < nodeList.length && (length == null || currentLength < length); i++)
		{
			result.node = nodeList[i];
			result.position = result.node.nodeValue.length;
			if (i == 0 && startPosition > 0)
			{
				currentLength += result.node.nodeValue.length - startPosition;
				continue;
			}
			currentLength += result.node.nodeValue.length;
		}
		if (length != null && currentLength > length)
		{
			result.position -= currentLength - length;
		}
		return result;
	}
}