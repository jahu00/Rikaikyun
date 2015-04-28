var ReadingHistory = {
	init: function()
	{
		var self = this;
		self.screen = $('.screen.history');
		document.addEventListener("backbutton", function(e)
		{
			if (self.screen.is(':visible'))
			{
				App.selectScreen('.screen.main.menu');
				e.stop();
			}
		}, false);
		self.screen.on('click', '.item.entry', function()
		{
			App.reader.openFile($(this).attr('data-name'));
		});
		var anchorTimer = null;
		self.screen.on('touchstart', '.item.entry', function(e)
		{
			var self = this;
			var touchStart = e.originalEvent.touches[0];
			var lastX = touchStart.pageX;
			var lastY = touchStart.pageY;
			var trigger = false;
			var distanceThreshold = 10;
			function setTimer()
			{
				anchorTimer = setTimeout(function() { e.preventDefault(); trigger = true; }, 1000);
			}
			function remove()
			{
				clearTimeout(anchorTimer);
				$(self).off('touchend touchcancel', end);
				$(self).off('touchmove', move);
			}
			
			function end()
			{
				remove();
				if (trigger)
				{
					e.preventDefault();
					var path = fileHelpers.getParentPath($(self).attr('data-name'));
					if(confirm("Browse " + decodeURI(path) + "?"))
					{
						App.selectScreen($('.screen.file'));
						App.reader.fileSelector.open(path);
					}
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
					clearTimeout(anchorTimer);
					trigger = false;
					setTimer();
				}
				lastX = touchMove.pageX;
				lastY = touchMove.pageY;
			}
			
			$(self).on('touchend touchcancel', end);
			$(self).on('touchmove', move);
			setTimer();
		});
		
		self.screen.on('click', '.item.clear', function()
		{
			//self.clear();
			if(confirm("Are you sure you want to empty the history?"))
			{
				delete localStorage["history"];
				self.populate();
				App.forceRefresh(self.screen);
			}
		});
	},
	populate: function()
	{
		this.screen.find('.entry').remove();
		var entries = JSON.parse(localStorage["history"] || "[]");
		for (var i = 0; i < entries.length; i++)
		{
			var entry = entries[i];
			var hash = XXH(entry, 0).toString(16);
			var position = (parseFloat(localStorage["progress-" + hash] || '0') * 100).toFixed(2);
			this.screen.append(
			'<div class="item entry" data-name="' + entry + '">' +
			'<span class="name">' + decodeURI(entry) + '</span>' +
			'<span class="right">' + position + '%</span>' +
			'</div>'
			);
		}
	},
	open: function()
	{
		this.populate();
		App.selectScreen(this.screen);
	},
	push: function(name)
	{
		var entries = JSON.parse(localStorage["history"] || "[]");
		var itemsInHistory = {};
		itemsInHistory[name] = true;
		var newHistory = [ name ];
		for (var i = 0; i < entries.length; i++)
		{
			var entry = entries[i];
			if (typeof itemsInHistory[entry] == "undefined")
			{
				newHistory.push(entry);
				itemsInHistory[entry] = true;
			}
		}
		localStorage["history"] = JSON.stringify(newHistory);
	}
	/*clear: function()
	{
		delete LocalStorage["history"];
		this.populate();
	}*/
}
// I'm being lazy and defining constructor for this is a bit of an overkill
$(function()
{
	ReadingHistory.init();
});