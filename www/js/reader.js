function Reader(dict)
{
	this.dict = dict;
	this.resizeStartPosition = 0;
	this.resizeStartSize = 0;
	this.lastPosition = null;
	this.scrollDistance = 0;
	this.progress = 0;
	this.init();
	this.initFileSelector();
	this.initMenu();
	this.loadSettings();
	//console.log(this.lastFile);
}

Reader.prototype = {
//Reader = {
	//deviceReady: false,
	dict: null,
	settings: null,
	screen: null,
	loadSettings: function()
	{
		//words = JSON.parse(localStorage["words"]);
		//localStorage["words"] = JSON.stringify(words);
		this.lastFile = localStorage["lastFile"] || '';
		//console.log(this.lastFile);
	},
	// Setup initial values, events etc.
	init: function()
	{
		var self = this;
		this.screen = $('.screen.reader');
		// Copy contents of top floater bar to the bottom one (reuse html without having to write it twice)
		this.screen.find('.floater .bar.bottom').html(this.screen.find('.floater .bar.top').html());
		this.initDictionarySelection();
		
		var container = this.screen.find('.container');
		
		// Our function for handling the event is inside another to not confuse what 'this' is
		// clicks on the screen (handles word lookups)
		
		container.click(function(e){ self.containerClick(e); });
		
		// Handling resizes of the screen
		$(window).resize(function()
		{
			self.resizeScreen(true);
		});
		// Handling scrolling within the document
		var scrollDelay = 300;
		var scrollTimeout = null;
		$('.reader > .scroller').scroll(function()
		{
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(function(){
				self.updateStatus();
			},scrollDelay);
		});
		
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
			self.resizeStartPosition = e.pageY;
			self.resizeStartSize = $('.floater .dictionary-container').height();
		});
		
		$('.reader > .floater .bar .resizer').on("touchmove", function(ev)
		{
			var e = ev.originalEvent.touches[0];
			self.resizeFloater(e);
			return false;
		});
		
		container.on('touchstart', 'a', function(e) { self.anchorTouchStart(e, this); });
		//container.on('touchend', 'a', function(e) { self.anchorTouchEnd(e, this); });
		container.on('click', 'a', function(e){ self.containerClick(e); return false; });
		
		document.addEventListener("menubutton", function()
		{
			if (self.screen.is(':visible'))
			{
				self.selectScreen('main.menu');
			}
		}, false);
		
		
		// Setup screen dependant elements that can't be handled by css alone
		$(window).resize();
	},
	initMenu: function()
	{
		var self = this;
		var menu = $('.screen.main.menu');
		menu.find('.openFile').click(function()
		{
			if (typeof window.requestFileSystem !== 'undefined')
			{
				/*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
				{
					console.log('not an error: ' + fileSystem.name);
					//console.log(fileSystem);
				}, function(error){console.log('error:' + error)});*/
				self.selectScreen('file');
				self.fileSelector.open(self.lastPath);
			}
			else
			{
				document.querySelector(".main.menu .openFile input").dispatchEvent(new Event('click'));
			}
		});
		
		menu.find('.openFile input').change(function(e)
		{
			var file = e.target.files[0];
			//console.log(file);
			if (!file) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				/*if (/.html?$/.test(file.name))
				{
					self.loadHtmlDocument(e.target.result);
				}
				else
				{
					self.loadDocument(e.target.result);
				}*/
				//displayContents(contents);
				self.openFile(file.name, e.target.result, false);
			};
			reader.readAsText(file);
		});
		
		menu.find('.exit').click(function()
		{
			if (typeof navigator.app !== 'undefined')
			{
				navigator.app.exitApp();
			}
			else
			{
				window.close();
			}
		});
		
		document.addEventListener("backbutton", function()
		{
			if (menu.is(':visible'))
			{
				self.selectScreen('reader');
				self.resizeScreen(true);
			}
		}, false);
	},
	initFileSelector: function()
	{
		var self = this;
		self.lastPath = localStorage['lastPath'] || 'file:///';
		self.fileSelector = new FileSelector($('.screen.file .files'), self.lastPath, 'Documents (html, txt)|*.htm;*.html;*.txt|All files|*.*');
		self.fileSelector.onCancel = function()
		{
			//$(self.fileSelector.elem).find('.file-container .item.back').click();
			self.selectScreen('main.menu');
		};
		self.fileSelector.onSuccess = function(path)
		{
			//console.log('Opening file: ' + path);
			self.fileSelector.open(path);
		};
		self.fileSelector.onOpenFile = function(path, entry)
		{
			self.prepareLoad();
			entry.file(function(file)
			{
				var reader = new FileReader();//entry.createReader();
				reader.onloadend = function(e){
					self.openFile(path, e.target.result, false);
				};
				reader.readAsText(file);
			});
		};
		self.fileSelector.onPathChanged = function(path)
		{
			localStorage['lastPath'] = path;
			self.lastPath = path;
		};
		self.fileSelector.onFail = function(error)
		{
			alert(error.message);
			self.lastPath = 'file:///';
		};
		//fileSelector.open(path);
	},
	/*onDeviceReady: function()
	{
		this.deviceReady = true;
		$('.screen.menu .item.file').removeClass('disabled');
	},*/
	// Sets the size of dictionary popup (part of the popup events)
	resizeFloater: function(e)
	{
		var dictionaryContainer = $('.reader > .floater > .dictionary-container');
		var zoom = dictionaryContainer.absoluteZoom();
		var newHeight = this.resizeStartSize;
		if ($('.floater').hasClass("top"))
		{
			newHeight += (e.pageY - this.resizeStartPosition) / zoom;
		}
		else
		{
			newHeight += (this.resizeStartPosition - e.pageY) / zoom;
		}
		if (newHeight < 0)
		{
			newHeight = 0;
		}
		newHeight = parseInt(newHeight);
		dictionaryContainer.css('height', newHeight + "px");
	},
	selectScreen: function(name)
	{
		$('.screen').removeClass('active');
		$('.screen.' + name).addClass('active');
	},
	prepareLoad: function(name)
	{
		/*$('.screen').removeClass('active');
		$('.screen.loading').addClass('active');*/
		this.selectScreen('loading');
		//$('.screen.loading .message span').text('Loading please wait...');
	},
	loadReady: function()
	{
		/*$('.screen').removeClass('active');
		$('.screen.reader').addClass('active');*/
		this.selectScreen('reader');
		$('.container').html('');
	},
	loadDocument: function(text)
	{
		this.loadReady();
		//this.prepareLoad();
		// Here is a simple conversion txt => html
		// TODO: Add injecting furigana
		$('.container').html(text.replace(/^\s*(.*)?\s*$/gm, "<p>$1</p>"));
		//$('.container').html(data.replace(/^\s*(.*)?\s*$/gm, "$1<br/>"));
		$(window).resize();
	},
	openDocument: function(path)
	{
		var self = this;
		// TODO: This will change a lot later on when I implement selecting files
		$.get(path, function(data)
		{
			self.loadDocument(data);
		}, 'html');
	},
	loadHtmlDocument: function(data)
	{
		var self = this;
		this.loadReady();
		// extract body of the html file
		var body = htmlHelpers.extractBody(data);
		data = null;
		// trim excess whitespace in all lines of the body
		body = htmlHelpers.trimAllLines(body);
		
		// prevent images from loading at this time (images with absolute path will be unaffected)
		body = body.replace(/(<\s*img\s*[^>]*\s*)(src)(\s*=\s*("([^>:]*)"|'([^>:]*)')[^>]*>)/img, "$1data-temp$2$3");
		
		// Create temporary element for storing the body (allows modifying the elements)
		var temp = document.createElement('div');
		temp.innerHTML = body;
		body = null;
		var $temp = $(temp);
		// Remove style, script and link tags to prevent them from breaking the app (we don't need those anyway)
		$temp.find('script, style, link').remove();
		// Rename ids to avoid collision
		var idCount = 0;
		$temp.find('*[id]').each(function()
		{
			var originalId = this.id;
			var newId = "documentId_" + idCount;
			$temp.find('a[href=#' + originalId + ']').attr("href", "#" + newId);
			this.id = newId;
			idCount++;
		});
		// Remove all unnecessary attributes (the only ones we spare are id on all elements, href on anchors and src on images)
		$temp.find('*:hasAttributes').each(function()
		{
			var elem = $(this);
			if (this.nodeName === "A")
			{
				elem.removeAttributes(null, ['id', 'href']);
			}
			else if (this.nodeName === "IMG")
			{
				elem.removeAttributes(null, ['id', 'src', 'data-tempsrc']);
			}
			else
			{
				elem.removeAttributes(null, ['id']);
			}
		});
		// Adjust image path
		var filePath = fileHelpers.getParentPath(self.lastFile)
		$temp.find('img[data-tempsrc]').each(function()
		{
			//console.log(filePath + $(this).attr('data-tempsrc'));
			this.src = filePath + $(this).attr('data-tempsrc');
			$(this).removeAttr('data-tempsrc');
			/*this.alt = filePath + this.src;*/
			//$(this).replaceWith('<p>' + filePath + $(this).attr('data-src') + '</p>');
		});
		// Remove redundant new line characters from all text
		$temp.find('*').each(function()
		{
			for (var i = 0; i < this.childNodes.length ; i++)
			{
				var node = this.childNodes[i];
				if (node.nodeType === 3 && node.nodeValue.trim().length > 0)
				{
					node.nodeValue = node.nodeValue.replace(/([\S])\n+([\S])/, '$1$2');
				}
			}
		});
		
		/*$temp.find('ruby').each(function()
		{
			var elem = $(this);
			elem.replaceWith('<span class="ruby">' + elem.find('rb').text() + '<span class="rt">' + elem.find('rt').text() + '</span></span>');
		});*/
		

		
		// TODO: Insert detecting dot furigana
		// Insert the text into reader
		$('.container').html(temp.innerHTML);
		
		$('.container').find('> div').each(function()
		{
			this.outerHTML = flatterer.flatten(this);
		});
		
		$('.container').find('p').each(function()
		{
			this.outerHTML = flatterer.divide(this);
		});	
		
		// Init actions for anchors
		// Edit: Move to init function (anchors now get inited automatically)

		// Adjust status etc.
		$(window).resize();
	},
	openHtmlDocument: function(path)
	{
		var self = this;
		// TODO: The method of opening files is likely to change when file selection is implemented, but the operations on the file itself will stay the same
		$.get(path, function(data)
		{
			self.loadHtmlDocument(data);
		}, 'html');
	},
	openFile: function(path, data, preprare)
	{
		if (typeof prepare == "undefined")
		{
			prepare = true;
		}
		var self = this;
		if (prepare)
		{
			self.prepareLoad('path');
		}
		function openCallback(path, data)
		{
			localStorage["lastFile"] = path;
			self.lastFile = path;
			var split = path.split('.');
			var ext = split[split.length - 1].toLowerCase();
			if (ext == 'htm' || ext == 'html')
			{
				self.loadHtmlDocument(data);
			}
			else
			{
				self.loadDocument(data);
			}
		}
		if (typeof data == "undefined")
		{
			$.get(path, function(data)
			{
				openCallback(path, data);
			}, 'html');
		}
		else
		{
			openCallback(path, data);
		}
	},
	initDictionarySelection: function()
	{
		var self = this;
		$('.floater .bar .tab').click(function()
		{
			self.switchDictionaryTab($(this).attr('data-tab'));
		});
	},
	switchDictionaryTab: function(tabName)
	{
		var activeTab = $('.floater .bar .tab.active');
		if (activeTab.attr('data-tab') != tabName)
		{
			activeTab.removeClass('active');
			$('.floater .dictionary.active').removeClass('active');
			$('.floater .bar .tab[data-tab=' + tabName + ']').addClass('active');
			$('.floater .dictionary[data-tab=' + tabName + ']').addClass('active');
		}
	},
	// Handling user clicking\touching a word
	containerClick: function(e)
	{
		var self = this;
		// if dictionary is not yet ready show loading info and
		// set dictionary to trigger search after it becomes ready
		if (!self.dict.ready())
		{
			self.dict.readyCallback = function()
			{
				self.containerClick(e);
				$('.reader > .floater .dictionary-container').removeClass('loading');
			};
			$('.reader > .floater .dictionary-container:not(.loading)').addClass('loading');
			this.showFloater(e);
			return;
		}
		//alert('can\'t touch this');
		var container = this.screen.find('.container');
		var zoom = container.absoluteZoom();
		// Find the letter and text node containing it at the point of click (start of selection); We divide the coordinates to compensate the zoom
		//var start = getWordAtPoint(e.target, e.pageX / zoom, e.pageY / zoom);
		var start = getCharacterAtPoint.find(e.target, e.pageX / zoom, e.pageY / zoom);
		//alert(start);

		// Check if there was anything at the point of the click
		if (start != null)
		{
			// Construct the initial range for finding the word (13 characters from the point of click)
			// TODO: Number of characters should be customizable
			var length = 13;
			var textNodes = textCrawler.getTextNodeList(start.node, start.position, length, container[0], ["RT","RP"]);
			
			// Extract the word
			// TODO: Possibly getTextNodeList and getText should be combined as they process the same data
			var search = textCrawler.getText(textNodes, start.position, length);
			// init end of selection
			var end = null;
			
			// Feed it to the dictionary
			// TODO: Allow customizing the number of words to be searched
			// TODO: Allow searching both regular words and names
			// TODO: Try moving the lookup to another thread
			var words = (search.length > 0 ? this.dict.wordSearch(search, false) : null);//, 10);
			var names = (search.length > 0 ? this.dict.wordSearch(search, true) : null);//, 20);
			var kanji = (search.length > 0 ? this.dict.kanjiSearch(search[0]) : null);

			// Restart the dictionary contents (remove all items and rewind the scroll)
			// TODO: This should be probably elsewhere (like in a separate object, but I have no concept for that now)
			$('.reader > .floater .dictionary .dictionary-entry').remove();
			$('.reader > .floater .dictionary').fakeScrollReset();
			
			function populateDictionary(type, result)
			{
				if (result != null)
				{
					// Iterate through all found words
					// TODO: Make it visible to the user if there are more words available for the search than what is shown
					for (var n = 0; n < result.data.length; n++)
					{
						// Parse the entry for each word
						// TODO: This probably should be done more accurately (split kanji, kana, grammar, meaning etc.) so it'll be easier to style
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
						'</div>').insertBefore('.reader > .floater .dictionary[data-tab=' + type + '] .empty');
					}
					// Store the end position
					//end = textCrawler.getEndNode(textNodes, start.position, result.matchLen);
				}
				else
				{
					// If no words in the dictionary were found we will only highlight a single character
					// TODO: Running getEndNode here is an overkill; should be changed to:
					// end = { "node": start.node, "position": (start.position + 1) };
					//end = textCrawler.getEndNode(textNodes, start.position, 1);
				}
			}
			
			// If there were any results, start feeding the dictionary popup
			populateDictionary('word', words);
			populateDictionary('name', names);
			if (kanji != null)
			{
				kanji = this.dict.getKanjiRadicals(kanji);
				//console.log(kanji);
				$('<div class="dictionary-entry">' +
				'<span class="kanji">' + kanji.kanji + ' [' + kanji.onkun + ']' + (kanji.nanori ? ' {' + kanji.nanori + '}' : '') + '</span>' +
				'<br/>' +
				'<span class="description">(Rad.:' + kanji.radical.kanji + ', Strokes:' + kanji.misc['S'] + (kanji.misc['F'] ? ', Freq.: ' + kanji.misc['F'] : '') + ')<br/>' + kanji.eigo + '</span>' +
				'</div>').insertBefore('.reader > .floater .dictionary[data-tab=kanji] .empty');
				for (var i = 0; i < kanji.radicals.length; i++)
				{
					var radical = kanji.radicals[i];
					$('<div class="dictionary-entry">' +
					'<span class="kanji">' + radical.kanji + ' [' + radical.yomi + ']' + '</span>' + 
					'<br/>' +
					'<span class="description">' + radical.eigo + '</span>' +
					'</div>').insertBefore('.reader > .floater .dictionary[data-tab=kanji] .empty');
				}
			}
			
			var maxLength = 1;
			if (words != null)
			{
				maxLength = words.matchLen;
			}
			if (names != null && names.matchLen > maxLength)
			{
				maxLength = names.matchLen;
			}
			end = textCrawler.getEndNode(textNodes, start.position, maxLength);

			// Select the word
			var range = document.createRange();
			range.setStart(start.node, start.position);
			range.setEnd(end.node, end.position);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			range.detach();
			// We only show the popup after everything is ready
			this.showFloater(e);
		}
	},
	showFloater: function(e)
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
		$('.floater').show();
	},
	resizeScreen: function(preserveProgress)
	{
		if (typeof preserveProgress == "undefined")
		{
			preserveProgress = false;
		}
		if (this.screen.is(":visible"))
		{
			// Setup some element sizes that are screen dependant
			// TODO: Needs a lot of cleaning up
			// TODO: This even should not trigger when on other screens, instead it should trigger when coming back to this one
			var statusBarZoom = $('.reader .statusBar').absoluteZoom();
			var floaterZoom = $('.reader .floater').absoluteZoom();
			var containerZoom = $('.reader .scroller .container').absoluteZoom();
			var zoom = $('.reader .scroller').absoluteZoom();
			var statusBarHeight = $('.statusBar').outerHeight();
			var windowHeight = $(window).height();
			$('.reader .scroller').css('height', (windowHeight/zoom - statusBarHeight*statusBarZoom/zoom) + "px");
			$('.dynamicStyle').cssRule('.container img').css('max-height', ($('.reader .scroller').height()*zoom/containerZoom) + "px");
			$('.dynamicStyle').cssRule('.dictionary-container').css('max-height', parseInt(windowHeight/2/floaterZoom) + "px");
			$('.dynamicStyle').cssRule('.floater.bottom').css('bottom', (statusBarHeight*statusBarZoom/floaterZoom - 1) + "px");
			if (preserveProgress)
			{
				this.scrollTo(this.progress, false);
			}
			this.blink();
			this.updateStatus();
		}
	},
	// Updates reading status
	updateStatus: function()
	{
		// TODO: rename local variables to make them less misleading
		var reader = this.screen;
		var scroller = reader.children('.scroller');
		var documentHeight = scroller[0].scrollHeight;
		var windowHeight = scroller.height();
		var length = documentHeight - windowHeight;
		// Calculate progress percentage
		if (length < 0)
		{
			this.progress = 0;
		}
		else
		{
			this.progress = scroller.scrollTop() / length;//.toFixed(2);
		}
		// TODO: Optimize the element lookups
		var statusBar = reader.find('> .statusBar');
		statusBar.find('> .grid  .progress > .bar').css('width', (this.progress * 100).toFixed(2)+"%");
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
	},
	anchorTimer: null,
	anchorTouchStart: function(e, a)
	{
		// TODO: allow long click time to be customized
		var self = this;
		var touchStart = e.originalEvent.touches[0];
		var lastX = touchStart.pageX;
        var lastY = touchStart.pageY;
		var trigger = false;
		var distanceThreshold = 10;
		function setTimer()
		{
			self.anchorTimer = setTimeout(function() { e.preventDefault(); trigger = true; }, 1000);
		}
		function remove()
		{
			clearTimeout(self.anchorTimer);
			$(a).off('touchend', end);
			$(a).off('touchmove', move);
		}
		
		function end()
		{
			remove();
			if (trigger)
			{
				e.preventDefault(); self.anchorClick(a);
			}
		}
		
		function move(em)
		{
			var touchMove = em.originalEvent.touches[0];
			if
			(
				Math.abs(lastX - touchMove.pageX) > distanceThreshold ||
				Math.abs(lastY - touchMove.pageY) > distanceThreshold
			)
			{
				clearTimeout(self.anchorTimer);
				trigger = false;
				setTimer();
			}
			lastX = touchMove.pageX;
			lastY = touchMove.pageY;
		}
		
		$(a).on('touchend', end);
		$(a).on('touchmove', move);
		setTimer();
	},
	/*anchorTouchEnd: function(e, a)
	{
		clearTimeout(this.anchorTimer);
		
	},*/
	anchorClick: function(a)
	{
		if (a.getAttribute("href").indexOf('#') == 0)
		{
			//scrollTo($(a.getAttribute("href")));
			$(a.getAttribute("href")).each(function() { this.scrollIntoView(true); });
		}
		else
		{
			if(confirm('Open ' + a.href + ' in a browser?'))
				window.open(a.href, '_system');
		}
	},
	scrollTo: function(progress, update)
	{
		if (typeof update == "undefined")
		{
			update = true;
		}
		var reader = this.screen;
		var scroller = reader.children('.scroller');
		var documentHeight = scroller[0].scrollHeight;
		var windowHeight = scroller.height();
		var length = documentHeight - windowHeight;
		// Calculate progress percentage
		if (length < 0)
		{
			this.progress = 0;
		}
		else
		{
			this.progress = progress;
		}
		scroller.scrollTop(Math.round(length * this.progress));
		if (update)
		{
			this.updateStatus();
		}
	}
};