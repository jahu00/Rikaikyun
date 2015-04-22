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
			var position = parseFloat(localStorage["progress-" + hash] || '0').toFixed(2);
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