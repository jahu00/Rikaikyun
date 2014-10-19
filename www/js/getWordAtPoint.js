// Based on code by Eyal (http://stackoverflow.com/users/4454/eyal)
// http://stackoverflow.com/a/3710561
function getWordAtPoint(elem, x, y) {
	if(elem.nodeType == elem.TEXT_NODE) {
		var range = elem.ownerDocument.createRange();
		range.selectNodeContents(elem);
		var currentPos = 0;
		var endPos = range.endOffset;
		while(currentPos+1 <= endPos) {
			range.setStart(elem, currentPos);
			range.setEnd(elem, currentPos+1);
			if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
				range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {

				range.detach();
				return { "node": elem, "position": currentPos };
			}
			currentPos += 1;
		}
	} else {
		for(var i = 0; i < elem.childNodes.length; i++) {
			var range = elem.childNodes[i].ownerDocument.createRange();
			range.selectNodeContents(elem.childNodes[i]);
			if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
				range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y)
			{
				range.detach();
				return(getWordAtPoint(elem.childNodes[i], x, y));
			} else {
				range.detach();
			}
		}
	}
	return(null);
}