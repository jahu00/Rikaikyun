var Navigation = {
	init: function()
	{
		var self = this;
		self.screen = $('.screen.navigation');
		document.addEventListener("softbackbutton", function(e)
		{
			if (self.screen.is(':visible'))
			{
				if (self.positionChanged)
				{
					App.reader.selectScreen('reader');
					App.reader.scrollTo(self.position / 100.0, true);
					e.stopImmediatePropagation();
				}
				else
				{
					App.selectScreen('.screen.main.menu');
					e.stopImmediatePropagation();
				}
			}
		}, false);
		self.screen.on('click', '.item.entry', function()
		{
			var elem = $(this);
			if(confirm('Go to "' + elem.find('.name').text() + '"?'))
			{
				App.selectScreen('.screen.reader');
				App.reader.scrollTo("#" + elem.attr("data-id"), true, false);
			}
		});
		self.positionChanged = false;
		self.position = 0;
		self.goToPositionSlider = new SliderControl(self.screen.find('.goToPosition'), function(value)
		{
			self.position = value;
			self.positionChanged = true;
		},
		0);
	},
	populate: function()
	{
		if (App.reader.document == null || App.reader.document.navigation.length == 0)
		{
			return;
		}
		this.screen.find('.entry').remove();
		for (var i = 0; i < App.reader.document.navigation.length; i++)
		{
			var entry = App.reader.document.navigation[i];
			this.screen.append(
			'<div class="item entry" data-id="' + entry.id + '">' +
			'<span class="name">' + entry.name + '</span>' +
			'<span class="right">' + (entry.progress * 100.0).toFixed(2) + '%</span>' +
			'</div>'
			);
		}
	},
	open: function()
	{
		this.populate();
		this.goToPositionSlider.slider.val(App.reader.progress * 100).change();
		this.positionChanged = false;
		App.selectScreen(this.screen);
	},
}
// I'm being lazy and defining constructor for this is a bit of an overkill
$(function()
{
	Navigation.init();
});