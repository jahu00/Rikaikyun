getCharacterAtPoint = {
	find: function(element, x, y)
	{
		//Returns text node and character position based on provided coordinates
		for (var i = 0; i < element.childNodes.length; i++)
		{
			var node = element.childNodes[i];
			if (node.nodeType === 3)
			{
				var trim = node.nodeValue.trim();
				if (trim.length == 0)
				{
					continue;
				}
				var firstPosition = node.nodeValue.indexOf(trim[0]);
				var lastPosition = firstPosition + trim.length;
				var firstCharacter = this.getBoundingBox(node, firstPosition);
				var lastCharacter = this.getBoundingBox(node, lastPosition - 1);
				if
				(
					(
						firstCharacter.bottom == lastCharacter.bottom && firstCharacter.left <= x && lastCharacter.right >= x && firstCharacter.top <= y && lastCharacter.bottom >= y
					) ||
					(
						firstCharacter.bottom < lastCharacter.bottom &&
						(
							(firstCharacter.left <= x && firstCharacter.top <= y && firstCharacter.bottom >= y) ||
							(firstCharacter.bottom <= y && lastCharacter.top >= y) ||
							(lastCharacter.right >= x && lastCharacter.top <= y && lastCharacter.bottom >= y)
						)
					)
				)
				{
					var range = node.ownerDocument.createRange();
					var currentPosition = firstPosition;
					while(currentPosition < lastPosition) {
						if ('\n\r'.indexOf(node.nodeValue[currentPosition]) == -1 )
						{
							range.setStart(node, currentPosition);
							range.setEnd(node, currentPosition + 1);
							var boundingBox = range.getBoundingClientRect();
							if(
								boundingBox.left <= x && boundingBox.right >= x &&
								boundingBox.top  <= y && boundingBox.bottom >= y) {
								
								range.detach();
								return { "node": node, "position": currentPosition };
							}
						}
						currentPosition += 1;
					}
					range.detach();
					return null;
				}
			}
			else
			{
				lastBottom = node.getBoundingClientRect().bottom;
			}
		}
	},
	getBoundingBox: function(element, position)
	{
		var range = element.ownerDocument.createRange();
		range.setStart(element, position);
		range.setEnd(element, position + 1);
		var boundingBox = range.getBoundingClientRect();
		range.detach();
		//return this.editableBoundingBox(boundingBox);
		return boundingBox;
	}/*,
	editableBoundingBox: function(boundingBox)
	{
		return {
			bottom: boundingBox.bottom,
			height: boundingBox.height,
			left: boundingBox.left,
			right: boundingBox.right,
			top: boundingBox.top,
			width: boundingBox.width,
			x: boundingBox.x,
			y: boundingBox.y
		};
	}*/
}