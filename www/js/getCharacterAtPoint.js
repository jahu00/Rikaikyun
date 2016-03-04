getCharacterAtPoint = {
	whitespace: "\n\r 	",
	isWhitepsace: function(c)
	{
		return this.whitespace.indexOf(c) > -1;
	},
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
					var lastBottom = null;
					var lastTop = null;
					while(currentPosition < lastPosition) {
						if (!this.isWhitepsace(node.nodeValue[currentPosition]))
						{
							range.setStart(node, currentPosition);
							range.setEnd(node, currentPosition + 1);
							var boundingBox = range.getBoundingClientRect();
							if
							(
								lastBottom != null &&
								boundingBox.bottom > lastBottom &&
								boundingBox.top == lastTop
							)
							{
								var nextPosition = currentPosition + 1;
								while (nextPosition < lastPosition && this.isWhitepsace(node.nodeValue[nextPosition]))
								{
									nextPosition++;
								}
								if (!this.isWhitepsace(node.nodeValue[nextPosition]))
								{
									var nextCharacterBoundingBox = this.getBoundingBox(node, nextPosition);
									//console.log(nextCharacterBoundingBox);
									if (nextCharacterBoundingBox.bottom == boundingBox.bottom)
									{
										boundingBox = {
											left: boundingBox.left,
											top: nextCharacterBoundingBox.top,
											right: nextCharacterBoundingBox.left,
											bottom: boundingBox.bottom
										};
									}
									else
									{
										boundingBox = {
											left: boundingBox.left,
											top: lastBottom,
											right: boundingBox.right,
											bottom: boundingBox.bottom
										};
									}
								}
							}
							lastBottom = boundingBox.bottom;
							lastTop = boundingBox.top;
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