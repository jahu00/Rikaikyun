var maskHelpers = {
	toRegex: function(rule)
	{
		var extentions = rule.split(';');
		var regexParts = [];
		for (var i = 0; i < extentions.length; i++)
		{
			var extension = extentions[i];
			if (/\.*$/.test(extension))
			{
				extension.replace(/\.*$/, '.?*');
			}
			regexParts.push(extension.replace('.', '\\.').replace('*', '[^/]*'));
		}
		return new RegExp('(' + regexParts.join('|') + ')$', 'i');
	},
	parseRuleSet: function(ruleSet)
	{
		var parts = ruleSet.split('|');
		var result = [];
		for (var i = 0; i < parts.length; i += 2)
		{
			result.push(new Mask(parts[i], parts[i + 1]));
		}
		return result;
	}
};

var fileHelpers = {
	getParentPath: function(path)
	{
		return path.replace(/^(file:\/\/)(.*\/)(.+)$/i, '$1$2');
	}
};

function Mask()
{
	this.init.apply(this, arguments);
}

Mask.prototype = {
	init: function()
	{
		if (arguments.length == 2)
		{
			this.name = arguments[0];
			this.rule = arguments[1];
		}
		else
		{
			var parts = arguments[0].split('|');
			this.name = parts[0].trim();
			this.rule = parts[1].trim();
		}
		this.regex = maskHelpers.toRegex(this.rule);
	},
	test: function(path)
	{
		return this.regex.test(path);
	}
}

function FileSelector(elem, path, masks, success, fail, cancel, menu, pathChanged, openFile)
{
	this.path = path;
	this.initElement(elem);
	this.setMasks(masks || 'All files|*.*');

	this.onSuccess = success;
	this.onFail = fail;
	this.onCancel = cancel;
	this.onMenu = menu;
	this.onPathChanged = pathChanged;
	this.onoOenFile = openFile;
	this.opening = false;
}

FileSelector.prototype = {
	initElement: function(elem)
	{
		var self = this;
		this.elem = elem;
		var $elem = $(elem);
		if (!$elem.hasClass('file-selector'))
		{
			$elem.addClass('file-selector');
		}
		$elem.addClass('loading');
		$elem.html(
		'<div class="path">file:///storage/extSdCard/</div>' + "\n" +
		'<div class="file-container">' + "\n" +
		'	<div class="item directory back"><i></i> ..</div>' + "\n" +
		'	<div class="not-ready">' + "\n" +
		'		<span>Opening...</span>' + "\n" +
		'	</div>' + "\n" +
		'</div>' + "\n" +
		'<div class="options show"><select class="mask"></select></div>'
		);
		$elem.find('.options .mask').change(function()
		{
			self.currentMask = this.value;
			self.filter();
			self.updateMask();
		});
		$elem.on("click", '.item', function(ev)
		{
			if (!self.opening)
			{
				$item = $(this);
				if ($item.hasClass('directory'))
				{
					self.open($(this).attr('data-url'));
				}
				else
				{
					if (typeof self.onSuccess !== 'undefined')
					{
						self.onSuccess($item.attr('data-url'));
					}
				}
			}
		});
		$(window).resize(function()
		{
			if ($(self.elem).is(':visible'))
			{
				self.updatePath();//self.path);
			}
		});
		document.addEventListener("backbutton", function(e)
		{
			if ($elem.is(':visible') && typeof self.onCancel !== 'undefined')
			{
				self.onCancel(e);
			}
		}, false);
		document.addEventListener("menubutton", function(e)
		{
			if ($elem.is(':visible') && typeof self.onMenu !== 'undefined')
			{
				self.onMenu(e);
			}
		}, false);

	},
	setMasks: function(masks)
	{
		this.masks = maskHelpers.parseRuleSet(masks);
		var $select = $(this.elem).find('.options .mask');
		var html = "";
		for (var i = 0; i < this.masks.length; i++)
		{
			html += '<option value="' + i + '">' + this.masks[i].name + '</option>' + "\n";
		}
		$select.html(html);
		if (this.masks.length == 1)
		{
			$select.removeClass('show');
		}
		else
		{
			$select.filter(':not(.show)').addClass('show');
		}
		this.currentMask = 0;
		$select.val(this.currentMask).change();
	},
	filter: function(mask)
	{
		mask = mask || this.masks[this.currentMask];
		var $elem = $(this.elem);
		$elem.find('.file-container .item.hidden').removeClass('hidden');
		$elem.find('.file-container .item.file').each(function()
		{
			var $item = $(this);
			if (!mask.test($item.attr('data-url')))
			{
				$item.addClass('hidden');
			}
		});
	},
	nameSort: function(a, b)
	{
		return a.name.localeCompare(b.name);
	},
	getHtml: function(item)
	{
		return item.html;
	},
	joinItemHtml: function(array)
	{
		return array.map(this.getHtml).join("\n");
	},
	updatePath: function()//path)
	{
		var $elem = $(this.elem);
		$elem.find('.path').text(decodeURI(this.path) + (this.masks.length == 1 ? this.masks[this.currentMask].rule.trim() : ''));
		$elem.find('.file-container').css('padding-top', $elem.find('.path').outerHeight() + 'px');
		$elem.find('.file-container').css('padding-bottom', $elem.find('.options').outerHeight() + 'px');		
		var backUrl = fileHelpers.getParentPath(this.path);
		$elem.find('.file-container .item.back').attr('data-url', backUrl);
	},
	updateMask: function()
	{
		var $elem = $(this.elem);
		this.updatePath();
	},
	finalizeOpenning: function()
	{
		var $elem = $(this.elem);
		$elem.find('.file-container .item.selected').removeClass('selected');
		$elem.find('.file-container').removeClass('loading');
		this.opening = false;
	},
	open: function(path)
	{
		var self = this;
		self.opening = true;
		var $elem = $(self.elem);
		if (typeof path === 'undefined')
		{
			path = self.path;
		}
		$elem.find('.file-container .item[data-url="' + path + '"]').addClass('selected');
		
		$elem.find('.file-container .item.selected').removeClass('.selected');
		//$elem.find('.file-container:not(.loading)').addClass('loading');
		window.resolveLocalFileSystemURL(path, function(entry)
		{
			//self.path);
			if (entry.isDirectory)
			{
				self.path = path;
				if (typeof self.onPathChanged !== 'undefined')
				{
					self.onPathChanged(self.path);
				}
				self.updatePath();
				var reader = entry.createReader();
				reader.readEntries(function(entries)
				{
					var directories = [];
					var files = [];
					//$elem.find('.file-container').append('<div class="item back" data-url="' + backUrl + '"><i></i> ..</div>');
					for (var i = 0; i < entries.length; i++)
					{
						var entry = entries[i];
						var name = entry.name;
						var item = {
							html: '<div class="item ' + (entry.isDirectory ? 'directory' : 'file') + '" data-url="' + entry.nativeURL + '"><i></i>' + entry.name + '</div>',
							name: entry.name
						};
						if (entry.isDirectory)
							directories.push(item);
						else
							files.push(item);
					}
					directories.sort(self.nameSort);
					files.sort(self.nameSort);
					
					$elem.find('.file-container .item:not(.back)').remove();
					$elem.find('.file-container').scrollTop(0);
					//$elem.find('.file-container .item.selected').removeClass('selected');
					$elem.find('.file-container').append(self.joinItemHtml(directories) + self.joinItemHtml(files));
					self.filter();
					self.finalizeOpenning();
				},
				function(error)
				{
					//console.log('Directory reader error:' + JSON.stringify(error));
					//alert('Directory reader error:' + error.message);
					if (typeof self.onFail !== 'undefined')
					{
						self.onFail(error);
					}
					self.finalizeOpenning();
				});
			}
			else if (entry.isFile)
			{
				if (typeof self.onOpenFile !== 'undefined')
				{
					self.onOpenFile(path, entry);
				}
			}
			self.finalizeOpenning();
			
		},function(error)
		{
			//console.log('File system error:' + JSON.stringify(error));
			//alert('Directory reader error:' + error.message);
			if (typeof self.onFail !== 'undefined')
			{
				self.onFail(error);
			}
			self.finalizeOpenning();
		});
	}
}