function Reader()
{
	App.log("Set basic variables");
	this.resizeStartPosition = 0;
	this.resizeStartSize = 0;
	this.lastPosition = null;
	this.scrollDistance = 0;
	this.progress = 0;
	this.currentFile = null;
	App.log("Set basic actions");
	this.init();
	App.log("Start settings initialization");
	this.settings = new Settings(this);
	App.log("Settings initialization complete");
	this.initFileSelector();
	this.initMenu();
	App.log("Start dictionary initialization");
	this.dict = new rcxDict(true);
	App.log("Dictionary initialization complete");
	//this.navigation = [];
}

Reader.prototype = {
	//deviceReady: false,
	dict: null,
	settings: null,
	screen: null,
	// Setup initial values, events etc.
	init: function()
	{
		var self = this;
		self.screen = $('.screen.reader');
		// Copy contents of top floater bar to the bottom one (reuse html without having to write it twice)
		self.screen.find('.floater .bar.bottom').html(self.screen.find('.floater .bar.top').html());
		self.initDictionarySelection();
		self.container = self.screen.find('.container');
		
		// Our function for handling the event is inside another to not confuse what 'this' is
		// clicks on the screen (handles word lookups)
		
		//self.container.click(function(e){ self.containerClick(e); });
		self.container.on('click taphold', '*', function(e) { e.preventDefault(); });
		if (localStorage["useDroid5Hacks"] == "true")
		{
			self.container.on('touchstart touchend touchcancel', '*', function(e) { e.preventDefault(); });
			self.container.on('touchstart', function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				var elem = $(this);
				var touch = e.originalEvent.touches[0];
				var event = { target: e.target, pageX: touch.pageX, pageY: touch.pageY };
				var touchId = touch.identifier;
				var distance = 0;
				var trigger = true;
				function suicide()
				{
					elem.off('touchend', end);
					elem.off('touchmove', move);
					elem.off('touchcancel', suicide);
					clearTimeout(clearClick);
				}
				
				function end(e)
				{
					suicide();
					e.preventDefault();
					e.stopPropagation();
					if (trigger && distance < 10)
					{
						self.containerClick(event);
					}
				}
				
				function move(e)
				{
					var touch = e.originalEvent.touches[0];
					if (touch.identifier == touchId)
					{
						distance += Math.abs(touch.pageX - event.pageX) + Math.abs(touch.pageY - event.pageY);
					}
				}
				
				var clearClick = setTimeout(function()
				{
					trigger = false;
				}, 300);
				
				elem.on('touchend', end);
				elem.on('touchmove', move);
				elem.on('touchcancel', suicide);
			});
		}
		else
		{
			self.container.on('click', function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				self.containerClick(e);
				return false;
			});
		}

		
		// Handling resizes of the screen
		$(window).resize(function()
		{
			self.resizeScreen(true);
		});
		// Handling scrolling within the document
		var scrollDelay = 200;
		self.scrollTimeout = null;
		self.container.scroll(function()
		{
			clearTimeout(self.scrollTimeout);
			if(self.screen.is(':visible'))
			{
				self.scrollTimeout = setTimeout(function(){
					self.depopulateContainer();
					self.updateStatus();
				},scrollDelay);
			}

		});
		self.container.customScrollOn(function(val)
		{
			return self.onScroll(val);
		});
		
		// Setup scroll behaviour for dictionary popup (Android 4.0.4 doesn't support normal scrolling)
		$('.reader > .floater .dictionary').fakeScrollOn();

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
		
		$('.reader > .floater > .bar > .back').click(function()
		{
			self.selectScreen('main.menu');
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
		
		// Triggering touchend on touchcancel doesn't seem to work unfortunately
		//container.on('touchcancel', '*', function(e) { this.trigger('touchend'); });
		
		self.container.on('touchstart', 'a', function(e) { self.anchorTouchStart(e, this); });
		self.container.on('click', 'a', function(e){ self.containerClick(e); return false; });
		
		document.addEventListener("softbackbutton", function(e)
		{
			if (self.screen.is(':visible'))
			{
				if (self.screen.find('.floater').is(':visible'))
				{
					$('.floater').css("display", "");
				}
				else
				{
					self.selectScreen('main.menu');
				}
				e.stopImmediatePropagation();
			}
		}, false);
		// Setup screen dependant elements that can't be handled by css alone
		self.resizeScreen();
	},
	initMenu: function()
	{
		var self = this;
		var menu = $('.screen.main.menu');
		menu.find('.openFile').click(function()
		{
			if (typeof window.requestFileSystem !== 'undefined')
			{
				var lastPath = localStorage['lastPath'] || 'file:///';
				self.selectScreen('file');
				self.fileSelector.open(lastPath);
			}
			else
			{
				document.querySelector(".main.menu .openFile input").dispatchEvent(new Event('click'));
			}
		});
		menu.find('.openUrl').click(function()
		{
			var url = prompt("Enter url");
			if (url != null){
				if (url.indexOf('http') != 0)
				{
					url = "http://" + url;
				}
				self.openFile(url);
			}
		});
		menu.find('.openFile input').change(function(e)
		{
			var file = e.target.files[0];
			if (!file) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function(e)
			{
				self.openFile(file.name, undefined, e.target.result);
			};
			reader.readAsText(file);
		});
		
		menu.find('.settings').click(function()
		{
			self.selectScreen('settings');
		});
		
		menu.find('.history').click(function()
		{
			ReadingHistory.open();
		});
		
		menu.find('.exit').click(function()
		{
			if (confirm('Close app?'))
			{
				if (typeof navigator.app !== 'undefined')
				{
					navigator.app.exitApp();
				}
				else
				{
					window.close();
				}
			}
		});
		
		$(document.body).on('click', '.menu > .item.back', function()
		{
			App.triggerBackButton();
		});
		
		document.addEventListener("softbackbutton", function(e)
		{
			if (menu.is(':visible'))
			{
				self.selectScreen('reader');
				self.resizeScreen(true);
				e.stopImmediatePropagation();
			}
		}, false);		
	},
	initFileSelector: function()
	{
		var self = this;
		var lastPath = localStorage['lastPath'] || 'file:///';
		self.fileSelector = new FileSelector($('.screen.file .files'), lastPath, 'Documents (html, txt)|*.htm;*.html;*.txt|All files|*.*');
		self.fileSelector.onCancel = function(e)
		{
			self.selectScreen('main.menu');
			e.stopImmediatePropagation();
			//return false;
		};
		self.fileSelector.onSuccess = function(path)
		{
			self.fileSelector.open(path);
		};
		self.fileSelector.onOpenFile = function(path, entry)
		{
			self.openFile(path, entry);
		};
		self.fileSelector.onPathChanged = function(path)
		{
			localStorage['lastPath'] = path;
		};
		self.fileSelector.onFail = function(error)
		{
			alert(error.message);
			localStorage['lastPath'] = 'file:///';
		};
	},
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
		var activeScreen = $('.screen.' + name);
		App.selectScreen(activeScreen);
	},
	prepareLoad: function(name)
	{
		this.selectScreen("loading");
		this.navigation = [];
		this.document = null;
		//$('.screen.loading .message span').text('Loading please wait...');
	},
	loadReady: function()
	{
		this.selectScreen("reader");
		$('.container').html("");
	},
	parseHtml: function(data)
	{
		App.log("Trying to parse HTML data using DOMParser")
		var result = (new DOMParser()).parseFromString(data, 'text/html');
		//var result = null;
		if (result != null)
		{
			return result;
		}
		App.log("Using DOMParser failed, using HTMLDocument as a fallback")
		result = document.implementation.createHTMLDocument("Temp");
		result.body.innerHTML = htmlHelpers.extractBody(data);
		return result;
	},
	loadTextDocument: function(text)
	{
		// Here is a simple conversion txt => html
		// TODO: Add injecting furigana
		//var data = (new DOMParser()).parseFromString("<div>" + text.replace(/^\s*(.*)?\s*$/gm, "<p>$1</p>").trim() + "</div>", 'text/html');
		var data = this.parseHtml("<div>" + text.replace(/^\s*(.*)?\s*$/gm, "<p>$1</p>").trim() + "</div>");
		text = null;
		this.processHtml(data.body);
	},
	loadHtmlDocument: function(data)
	{
		var self = this;
		// extract body of the html file
		App.log("Extract html body");
		//var doc = (new DOMParser()).parseFromString(data, 'text/html');
		var doc = this.parseHtml(data);
		data = null;
		// Create temporary element for storing the body (allows modifying the elements)
		
		this.processHtml(doc.body);
	},
	processHtml: function(data)
	{
		var self = this;
		App.log("Create temp element");
		var $temp = $(data);
		// Remove style, script and link tags to prevent them from breaking the app (we don't need those anyway)
		App.log("Remove script style and link");
		$temp.find('script, style, link').remove();
		// Rename ids to avoid collision
		App.log("Rename ids");
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
		App.log("Remove attributes");
		$temp.find('*:hasAttributes').each(function()
		{
			var elem = $(this);
			if (this.nodeName === "A")
			{
				elem.removeAttributes(null, ['id', 'href']);
			}
			else if (this.nodeName === "IMG")
			{
				elem.removeAttributes(null, ['id', 'src', 'alt']);
			}
			else
			{
				elem.removeAttributes(null, ['id']);
			}
		});
		App.log("Remove redundant new line characters");
		var japCharacters = "[一-龠ぁ-ゔァ-ヴー々〆〤]";
		var reg = new RegExp("(" + japCharacters + ")\n+(" + japCharacters + ")", "g");
		// Remove redundant new line characters from all text
		$temp.find('*').each(function()
		{
			for (var i = 0; i < this.childNodes.length ; i++)
			{
				var node = this.childNodes[i];
				if (node.nodeType === 3 && node.nodeValue.trim().length > 0)
				{
					//node.nodeValue = node.nodeValue.replace(/([\S])\n+([\S])/g, '$1$2');
					node.nodeValue = node.nodeValue.replace(reg, '$1$2');
				}
			}
		});
		
		// TODO: Insert detecting dot furigana
		// Insert the text into reader
		
		App.log("Flatten text");
		$temp.children('div').each(function()
		{
			this.outerHTML = flatterer.flatten(this);
		});
		
		// Put imgaes in containers and adjust image path
		App.log("Process images");
		var filePath = fileHelpers.getParentPath(self.currentFile);
		//if (filePath == self.currentFile)
		//{
		//	filePath = "";
		//}

		$temp.find('img').each(function()
		{
			var img = $(this);
			var tempSrc = img.attr('src');
			img.attr('data-src', (tempSrc.indexOf(':') > -1 ? tempSrc : filePath + tempSrc));
			img.removeAttr('src');
		});
		
		App.log("Split paragraphs");
		$temp.find('p').each(function()
		{
			this.outerHTML = flatterer.divide(this);
		});
		App.log("Compute chapter positions");
		self.document = new ReaderDocument(data);
		//window.readerDocument = self.document;

		App.log("Add chapters to progress bar");
		var progressBar = this.screen.find('.progress');
		progressBar.find('.line').remove();
		var barPositions = self.document.getChapterPositions();
		for (var posId in barPositions)
		{
			var line = $('<div class="line"></div>');
			line.css("left", 100 * barPositions[posId] + "%");
			progressBar.append(line);
		}
		
		App.log('Insert the text into reader');
		
		//container.find('*').each(function()
		//{
		//	this.unselectable = "on";
		//});
	},
	openFile: function(path, entry, data)//, preprare)
	{
		localStorage["loadingStatus"] = "LOADING";
		localStorage["lastFile"] = path;
		var self = this;
		self.prepareLoad();
		function openCallback(path, data, isUrl)
		{
			ReadingHistory.push(path);
			self.currentFile = path;
			self.currentHash = XXH(path, 0).toString(16);
			self.progress = parseFloat(localStorage["progress-" + self.currentHash] || '0');
			var split = path.split('.');
			var ext = split[split.length - 1].toLowerCase();
			self.loadReady();
			if (ext == 'htm' || ext == 'html' || (isUrl && ext != 'txt'))
			{
				self.loadHtmlDocument(data);
			}
			else
			{
				self.loadTextDocument(data);
			}
			self.populateContainer();
			
			// Adjust status etc.
			self.resizeScreen(true);
			//$(window).resize();
			localStorage["loadingStatus"] = "OK";
			App.log('Loading file complete');
		}
		function failCallback(path)
		{
			localStorage["loadingStatus"] = "ERROR";
			alert('Error while opening "' + path + '"!');
			self.selectScreen("main.menu");
		}
		function entryCallback(path, entry)
		{
			entry.file(function(file)
			{
				var reader = new FileReader();
				reader.onloadend = function(e){
					openCallback(path, e.target.result)
				};
				reader.onerror = function(e)
				{
					failCallback(path);
				}
				reader.readAsText(file);
			},function(error)
			{
				failCallback(path);
			});
		}
		if (typeof data == "undefined")
		{
			var isUrl = path.indexOf('http') == 0;
			if (localStorage['openMethod'] == "AJAX" || isUrl)
			{
				$.get(path, function(data)
				{
					openCallback(path, data, isUrl);
				}, 'html').error(function()
				{
					failCallback(path);
				});
			}
			else
			{
				if (typeof entry == "undefined")
				{
					window.resolveLocalFileSystemURL(path, function(entry)
					{
						entryCallback(path, entry);
					},function(error)
					{
						failCallback(path);
					});
				}
				else
				{
					entryCallback(path, entry);
				}
			}
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
		var container = this.screen.find('.container');
		var zoom = container.absoluteZoom();
		// Find the letter and text node containing it at the point of click (start of selection); We divide the coordinates to compensate the zoom
		var start = getCharacterAtPoint.find(e.target, e.pageX / zoom, e.pageY / zoom);

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
		App.forceRefresh($('.reader > .floater'));
	},
	onScroll: function(val)
	{
		var self = this;
		if (self.document == null || self.document == 0)
		{
			return 0;
		}
		self.populateContainer(val);
		var containerOffset = self.container.parent().offset();
		var containerHeight = self.container.parent().outerHeight();
		if (val < 0)
		{
			var elem = self.container.children().first();
			//console.log(elem.offset().top - containerOffset.top);
			if (elem.attr("data-id") == 0 && elem.offset().top - containerOffset.top - val - parseInt(elem.css("margin-top") || 0) > 0)
			{
				return containerOffset.top - elem.offset().top - parseInt(elem.css("margin-top") || 0);
			}
		}
		if (val > 0)
		{
			var elem = self.container.children().last();
			if (elem.attr("data-id") == self.document.count - 1 && elem.offset().top - containerOffset.top + elem.outerHeight() + parseInt(elem.css("margin-bottom") || 0) - val < containerHeight)
			{
				return containerHeight - elem.offset().top + containerOffset.top - elem.outerHeight();
			}
		}
		return val;
	},
	populateContainer: function(populationOffset)
	{
		var self = this;
		if (self.document == null || self.document.count == 0)
		{
			return;
		}
		if (typeof populationOffset == "undefined")
		{
			populationOffset = 0;
		}
		var containerOffset = self.container.parent().offset();
		var containerHeight = self.container.parent().outerHeight();
		var elemId = 0;
		var newRow = '';
		var elem = null;
		var offset = null;
		var margin = 0;
		if (self.container.children().length > 0)
		{
			for (i = 0; i < 1000; i++)
			{
				elem = self.container.children().first();
				offset = elem.offset();
				if (offset.top - containerOffset.top - populationOffset < 0)
				{
					break;
				}
				elemId = parseInt(elem.attr('data-id'));
				if (elemId <= 0)
				{
					break;
				}
				newRow = $(self.document.rows[elemId - 1].outerHTML)
				self.container.prepend(newRow);
				margin = parseInt(self.container.css('margin-top'));
				self.container.css('margin-top', (margin - elem.offset().top + offset.top) + "px");
			}
			// When scrolling up move the position down when there is an image in the text
			self.container.find('img[data-src]').each(function()
			{
				var img = $(this);
				var startHeight = img.outerHeight();
				img.on('load error', function()
				{
					endHeight = img.outerHeight();
					if (startHeight != endHeight)
					{
						margin = parseInt(self.container.css('margin-top'));
						//console.log(img.outerHeight(), startHeight, margin);
						var zoom = img.absoluteZoom();
						self.container.css('margin-top', (margin + zoom * (startHeight - img.outerHeight())) + "px");
					}
				});
			});
		}
		else
		{
			elemId = self.document.getElementIdAtPosition(self.progress);
			newRow = $(self.document.rows[elemId].outerHTML)
			self.container.append(newRow);
		}
		for (i = 0; i < 1000; i++)
		{
			elem = self.container.children().last();
			offset = elem.offset();
			if (offset.top - containerOffset.top + elem.outerHeight() - populationOffset > containerHeight)
			{
				break;
			}
			elemId = parseInt(elem.attr('data-id')) + 1;
			if (elemId >= self.document.count)
			{
				break;
			}
			var newRow = $(self.document.rows[elemId].outerHTML)
			self.container.append(newRow);
		}
		// Set the source to start loading images
		self.container.find('img[data-src]').each(function()
		{
			var elem = $(this);
			var src = elem.attr('data-src');
			elem.attr('src', src);
			elem.removeAttr('data-src');
		});
	},
	depopulateContainer: function()
	{
		if (this.container.children().length == 0)
		{
			return;
		}
		var containerOffset = this.container.parent().offset();
		var containerHeight = this.container.parent().outerHeight();
		var elem = null;
		var nextElem = null;
		var offset = null;
		var margin = 0;

		for (i = 0; i < 1000; i++)
		{
			elem = this.container.children().first();
			if (elem.offset().top - containerOffset.top + elem.outerHeight() > 0)
			{
				break;
			}
			nextElem = elem.next();
			if (nextElem == null)
			{
				break;
			}
			offset = nextElem.offset();
			margin = parseInt(this.container.css('margin-top'));
			elem.remove();
			this.container.css('margin-top', (margin + (offset.top - nextElem.offset().top)) + "px");
		}

		for (i = 0; i < 1000; i++)
		{
			elem = this.container.children().last();
			offset = elem.offset();
			if (offset.top - containerOffset.top < containerHeight)
			{
				break;
			}
			elem.remove();
		}
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
			// TODO: This event should not trigger when on other screens, instead it should trigger when coming back to this one
			var statusBarZoom = $('.reader .statusBar').absoluteZoom();
			var floaterZoom = $('.reader .floater').absoluteZoom();
			var containerZoom = $('.reader .scroller .container').absoluteZoom();
			var zoom = $('.reader .scroller').absoluteZoom();
			var statusBarHeight = $('.statusBar').outerHeight();
			var windowHeight = $(window).height();
			var scrollerHeight = (windowHeight/zoom - statusBarHeight*statusBarZoom/zoom);
			var dynamicStyle = $('.dynamicStyle');
			$('.reader .scroller').css('height', scrollerHeight + "px");
			dynamicStyle.cssRule('.container img').css('max-height', ($('.reader .scroller').height()*zoom/containerZoom) + "px");
			dynamicStyle.cssRule('.dictionary-container').css('max-height', parseInt(windowHeight/2/floaterZoom) + "px");
			dynamicStyle.cssRule('.floater.bottom').css('bottom', (statusBarHeight*statusBarZoom/floaterZoom - 1) + "px");
			//dynamicStyle.cssRule('.img-frame').css({'width': this.screen.find('.container').width() + 'px', 'height': parseInt(scrollerHeight * zoom/containerZoom) + 'px'});
			if (preserveProgress)
			{
				this.scrollTo(this.progress, false);
			}
			this.blink();
			this.updateStatus();
		}
	},
	adjustStatusWidth: function()
	{
		this.screen.find('.statusBar .status').each(function()
		{
			var status = $(this);
			var statusSpan = status.children('span');
			status.css('width', statusSpan.width() + "px");
		});
	},
	// Updates reading status
	updateStatus: function()
	{
		var self = this;
		clearTimeout(self.scrollTimeout);
		
		if (self.document == null || self.document.count == 0 || self.container.children().length == 0)
		{
			this.progress = 0;
		}
		else
		{
			var containerOffset = self.container.parent().offset();
			var elem = self.container.children().first();
			var elemId = elem.attr('data-id');
			//console.log(elemId);
			var elemHeight = elem.outerHeight();
			var position = parseInt(elem.attr('data-position'));
			var correction = 0;
			if (elemHeight > 0)
			{
				var length = parseInt(elem.attr('data-length'));
				correction = length * ((containerOffset.top - elem.offset().top) / elemHeight);
				if (correction < 0)
				{
					correction = 0;
				}
				else if (correction > length)
				{
					correction = length;
				}
			}
			this.progress = (position + correction) / self.document.total;
		}
		// TODO: rename local variables to make them less misleading
		var reader = this.screen;

		if (this.currentFile != null)
		{
			localStorage['progress-' + this.currentHash] = this.progress;
		}
		// TODO: Optimize the element lookups
		var statusBar = reader.children('.statusBar');
		var percentage = (this.progress * 100).toFixed(2)+"%";
		
		//var statusBar = reader.find('> .statusBar');
		// using > selector with find was causing infinite executions of scroll event for some reason
		statusBar.find('> .grid  .progress > .bar').css('width', percentage);

		// Update the page count
		statusBar.find('.status .progress').html(percentage);

		// After updating the page count measure it's width and adjust the size of the container holding the page count
		self.adjustStatusWidth();
		
		// This part is responsible for measuring how many pages we have traveled and if we should do an eink blink
		// TODO: The blink (should we use it or not) as well as the amount of pages after which the blink occurs should be customizable in the settings
		
		//if (this.lastPosition == null)
		//{
		//	lastPosition = container.fakeScroll();
		//}

		//this.scrollDistance += Math.abs(container.fakeScroll() - this.lastPosition);
		//if (this.scrollDistance >= windowHeight * 3)
		//{
		//	this.blink();
		//}
		//this.lastPosition = container.fakeScroll();
		
	},
	scrollTo: function(progress, update, procentage)
	{
		var self = this;
		if (self.document == null || self.document.count == 0)
		{
			return;
		}
		if (typeof update == "undefined")
		{
			update = true;
		}
		if (typeof procentage == "undefined")
		{
			procentage = true;
		}
		var containerOffset = self.container.parent().offset();
		if (procentage == false)
		{
			var elem = self.container.find(progress);
			if (elem.length == 0)
			{
				var id = progress.substring(1);
				if (typeof self.document.bookmarks[id] == "undefined")
				{
					return;
				}
				self.container.css("margin-top", "");
				self.container.html(self.document.rows[self.document.bookmarks[id]].outerHTML);
				self.populateContainer();
				elem = self.container.find(progress);
			}
			var margin = parseInt(self.container.css("margin-top") || 0);
			var val = elem.offset().top - containerOffset.top - margin; 
			val = self.onScroll(val);
			margin = parseInt(self.container.css("margin-top") || 0);
			self.container.css("margin-top", (margin - val) + "px");
		}
		else
		{
			self.progress = progress;
			var elemId = self.document.getElementIdAtPosition(progress);
			var elem = self.container.find('[data-id=' + elemId + ']');
			if (elem.length == 0)
			{
				self.container.css("margin-top", "0");
				self.container.html(self.document.rows[elemId].outerHTML);
				self.populateContainer();
				elem = self.container.find('[data-id=' + elemId + ']');
			}
			var position = parseInt(elem.attr('data-position'));
			var length = parseInt(elem.attr('data-length'));
			var correction = (progress * self.document.total - position) / length;
			if (correction < 0)
			{
				correction = 0;
			}
			if (correction > 1)
			{
				correction = 1;
			}
			correction = parseInt(correction * elem.outerHeight());
			var margin = parseInt(self.container.css("margin-top") || 0);
			var val = elem.offset().top + correction - containerOffset.top; 
			val = self.onScroll(val);
			margin = parseInt(self.container.css("margin-top") || 0);
			self.container.css("margin-top", (margin - val) + "px");
		}
		self.depopulateContainer();

		if (update)
		{
			self.updateStatus();
		}
	},
	// Code responsible for blinking the screen on eink display
	// TODO: Needs to be optimized or better yet made into a plugin that can be used on any element, so we can blink the dictionary popup without blinking the whole screen
	blink: function()
	{
		this.scrollDistance = 0;
		// Temporarily disable because it was working too slow on a device
		//$('.blink').show();
		//setTimeout(function()
		//{
//			$('.blink').addClass("white");
//			setTimeout(function()
//			{
//				$('.blink').hide();
//				$('.blink').removeClass("white");
//			}, 200);
//		}, 200);
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
			self.anchorTimer = setTimeout(function() { e.preventDefault(); trigger = true; }, 500);
		}
		function remove()
		{
			clearTimeout(self.anchorTimer);
			$(a).off('touchend touchcancel', end);
			$(a).off('touchmove', move);
		}
		
		function end(ende)
		{
			remove();
			if (trigger)
			{
				e.preventDefault();
				ende.stopPropagation();
				// Cancel touch to prevent accidential scrolling
				self.screen.find('.container')[0].customScrollData.touchId = null;
				self.anchorClick(a);
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
		
		$(a).on('touchend touchcancel', end);
		$(a).on('touchmove', move);
		setTimer();
	},
	anchorClick: function(a)
	{
		if (a.getAttribute("href").indexOf('#') == 0)
		{
			this.scrollTo(a.getAttribute("href"), true, false);
		}
		else
		{
			if(confirm('Open ' + a.href + ' in a browser?'))
				window.open(a.href, '_system');
		}
	}
};