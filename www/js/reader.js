function Reader(dict)
{
	this.dict = dict;
	this.init();
}

Reader.prototype = {
	
	resizeStartPosition: 0,
	resizeStartSize: 0,
	lastPosition: null,
	scrollDistance: 0,
	screen: null,
	progress: 0,
	// Setup initial values, events etc.
	init: function()
	{
		var self = this;
		this.screen = $('.reader');
		// Our function for handling the event is inside another to not confuse what 'this' is
		this.screen.click(function(e){self.containerClick(e)});
		$(window).resize(function(){self.resizeScreen()});
		$('.reader > .scroller').scroll(function(){self.updateStatus();});
		
		// Setup scroll behaviour for dictionary popup (Android 4.0.4 doesn't support normal scrolling)
		$('.reader > .floater .dictionary').fakeScroll();

		// Prevent scrolling the document while touching empty dictionary popup
		$('.reader > .floater > .dictionary-container').on('touchmove', function (e) {
			e.preventDefault();
		});
		
		// Popup dictionary event's
		// TODO: Dictionary should likely have it's own object or something; cleanup is needed here
		$('.reader > .floater > .bar > .close').click(function()
		{
			$('.floater').css("display", "");
		});
		
		$('.reader > .floater .bar .resizer').on("touchstart", function(ev)
		{
			var e = ev.originalEvent.touches[0];
			resizeStartPosition = e.pageY;
			resizeStartSize = $('.floater .dictionary-container').height();
		});
		
		$('.reader > .floater .bar .resizer').on("touchmove", function(ev)
		{
			var e = ev.originalEvent.touches[0];
			resizeFloater(e);
			return false;
		});
		
		// Setup screen dependant elements that can't be handled by css alone
		$(window).resize();
	},
	// Sets the size of dictionary popup (part of the popup events)
	resizeFloater: function(e)
	{
		var dictionaryContainer = $('.reader > .floater > .dictionary-container');
		var zoom = dictionaryContainer.absoluteZoom();
		if (isNaN(zoom))
		{
			zoom = 1;
		}
		var newHeight = resizeStartSize;
		if ($('.floater').hasClass("top"))
		{
			newHeight += (e.pageY - resizeStartPosition) / zoom;
		}
		else
		{
			newHeight += (resizeStartPosition - e.pageY) / zoom;
		}
		if (newHeight < 0)
		{
			newHeight = 0;
		}
		newHeight = parseInt(newHeight);
		dictionaryContainer.css('height', newHeight + "px");
	},
	loadDocument: function(path)
	{
		//$.get("genji-01.txt", function(data)
		// TODO: This will change a lot later on when I implement selecting files
		$.get(path, function(data)
		{
			// Here is a simple conversion txt => html
			// TODO: Again things here are subject to change
			$('.container').html(data.replace(/^\s*(.*)?\s*$/gm, "<p>$1</p>"));
			//updateStatus();
			$(window).resize();
		}, 'html');
	},
	// Handling user clicking\touching a word
	containerClick: function(e)
	{
		var zoom = this.screen.absoluteZoom();
		if (isNaN(zoom))
		{
			zoom = 1;
		}
		// Find the letter and text node containing it at the point of click; We divide the coordinates to compensate the zoom
		var find = getWordAtPoint(e.target, e.pageX / zoom, e.pageY / zoom);
		// Check if there was anything at the point of the click
		if (find != null)
		{
			// If popup was closed determine where to show it and make it visible
			if ($('.floater:visible').length == 0)
			{
				$('.floater').removeClass("top bottom");
				// Clicks in the upper half of the screen make it appear in the lower half and clicks in the lower half make it appear in the upper
				if (e.pageY < $(window).height() /2)
				{
					$('.floater').addClass("bottom");
				}
				else
				{
					$('.floater').addClass("top");
				}
			}
			// Construct the initial range for finding the word (13 characters from the point of click)
			// TODO: Number of characters should be customizable
			// TODO: The range will need to be remade to accept words that go beyond a single text node (will be most likely used for furigana)
			var range = document.createRange();
			range.setStart(find.element, find.position);
			// Determine the length of the word (how many letters are there left in the node)
			var end = find.position + 13;
			if (end > find.element.nodeValue.length)
			{
				end = find.element.nodeValue.length;
			}
			// Extract the word
			var search = find.element.nodeValue.substring(find.position, end);
			// Feed it to the dictionary
			// TODO: Allow customizing the number of words to be searched
			// TODO: Allow searching both regular words and names
			// TODO: Try moving the lookup to another thread
			var result = this.dict.wordSearch(search, false, 10);
			
			// Restart the dictionary contents (remove all items and rewind the scroll)
			// TODO: This should be probably elsewhere (like in a separate object, but I have no concept for that now)
			$('.reader > .floater .dictionary .dictionary-entry').remove();
			$('.reader > .floater .dictionary').fakeScrollReset();
			// If there were any results, start feeding the dictionary popup
			if (result != null)
			{
				// For starters store the length of the longest word
				end = find.position + result.matchLen;
				// Iterate through all found words
				// TODO: Make it visible to the user if there are more words available for the search than what is shown
				for (var n = 0; n < result.data.length; n ++)
				{
					// Parse the entry for each word
					// TODO: This probably should be done more accurately
					var split = result.data[n][0].split("/");
					var kanji = split.shift();
					if (kanji[0] == '[')
					{
						kanji = kanji.substring(1, kanji.length-1);
					}
					split.pop();
					// Insert entry to the dictionary popup
					// TODO: Some optimizations suggested dumping it all into a string and injecting just the massive string
					$('<div class="dictionary-entry">' +
					'<span class="kanji">' + kanji.trim() + '</span>' + 
					(
						result.data[n][1] !== null ?
						' <span class="grammar">(' + result.data[n][1] + ')</span>' :
						''
					) +
					'<br/>' +
					'<span class="description">' + split.join('; ') + '</span>' +
					'</div>').insertBefore('.reader > .floater .dictionary .empty');
				}
			}
			else
			{
				// If no words in the dictionary were found we will only hilight a single character
				end = find.position + 1;
			}
			// We take the liberty to reuse previous range to highlight found word
			// TODO: As mentioned above this needs to be remade to accept words spread among multiple elements and committing furigana (wedon't want to select it)
			range.setEnd(find.element, end);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			range.detach();
			// We only show the popup after everything is ready
			$('.floater').show();
		}
	},
	resizeScreen: function()
	{
		// Setup some element sizes that are screen dependant
		// TODO: Needs a lot of cleaning up
		// TODO: This even should not trigger when on other screens, instead it should trigger when coming back to this one
		var statusBarZoom = $('.reader .statusBar').absoluteZoom();
		var floaterZoom = $('.reader .floater').absoluteZoom();
		var containerZoom = $('.reader .scroller .container').absoluteZoom();
		var zoom = $('.reader .scroller').absoluteZoom();
		if (isNaN(zoom))
		{
			zoom = 1;
		}
		var statusBarHeight = $('.statusBar').outerHeight();
		var windowHeight = $(window).height();
		$('.reader .scroller').css('height', (windowHeight/zoom - statusBarHeight*statusBarZoom/zoom) + "px");
		$('.dynamicStyle').cssRule('.container img').css('max-height', ($('.reader .scroller').height()*zoom/containerZoom) + "px");
		$('.dynamicStyle').cssRule('.dictionary-container').css('max-height', parseInt(windowHeight/2/floaterZoom) + "px");
		$('.dynamicStyle').cssRule('.floater.bottom').css('bottom', (statusBarHeight*statusBarZoom/floaterZoom - 1) + "px");
		this.blink();
		this.updateStatus();
	},
	// Updates reading status
	updateStatus: function()
	{
		// TODO: rename local variables to make them less misleading
		var reader = this.screen;
		var scroller = reader.children('.scroller');
		//var container = scroller.children('.container')
		//var documentHeight = container.outerHeight();
		var documentHeight = scroller[0].scrollHeight;
		var windowHeight = scroller.height();
		var length = documentHeight - windowHeight;
		//var progress = 0;
		// Calculate progress percentage
		if (length < 0)
		{
			this.progress = 100;
		}
		else
		{
			this.progress = (scroller.scrollTop() / length * 100).toFixed(2);
		}
		// TODO: Optimize the element lookups
		var statusBar = reader.find('> .statusBar');
		statusBar.find('> .grid  .progress > .bar').css('width', this.progress+"%");
		var pages = Math.ceil(documentHeight / windowHeight);
		var page = parseInt((scroller.scrollTop() / documentHeight) * pages  + 1.5);
		var status = statusBar.find('.status');
		var pagesSpan = status.children('span');
		// Update the page count
		pagesSpan.html(page+"/"+pages);
		// After updating the page count measure it's width and adjust the size of the container holding the page count
		status.css('width', pagesSpan.width() + "px");
		// This part is responsible for measuring how many pages we have traveled and if we should do an eink blink
		// TODO: The blink (should we use it or not) as well as the amount of pages after which the blink occurs should be customizable in the settings
		if (this.lastPosition == null)
		{
			lastPosition = scroller.scrollTop();
		}
		this.scrollDistance += Math.abs(scroller.scrollTop() - this.lastPosition);
		if (this.scrollDistance >= windowHeight * 3)
		{
			this.blink();
		}
		this.lastPosition = scroller.scrollTop();
	},
	// Code responsible for blinking the screen on eink display
	// TODO: Needs to be optimized or better yet made into a plugin that can be used on any element, so we can blink the dictionary popup without blinking the whole screen
	blink: function()
	{
		this.scrollDistance = 0;
		// Temporarily disable because it was working too slow on a device
		/*$('.blink').show();
		setTimeout(function()
		{
			$('.blink').addClass("white");
			setTimeout(function()
			{
				$('.blink').hide();
				$('.blink').removeClass("white");
			}, 200);
		}, 200);*/
	}
};