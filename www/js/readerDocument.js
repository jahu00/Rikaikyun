function ReaderDocument(_data)
{
	this.data = _data;
	this.indexData();
}

ReaderDocument.prototype = {
	indexData: function(data)
	{
		var self = this;
		if (typeof data == "undefined")
		{
			data = self.data;
		}
		self.total = 0;
		self.index = [];
		self.rows = [];
		self.navigation = [];
		var i = 0;
		$(self.data).children().each(function()
		{
			self.rows.push(this);
			self.index.push(self.total);
			var elem = $(this);
			var text = elem.text().trim();
			elem.attr('data-position', self.total);
			var length = text.length;
			if (length == 0)
			{
				length = 1;
			}
			elem.attr('data-length', length);
			elem.attr('data-id', i);
			self.total += length;
			if (elem.is("div[id]"))
			{
				var anchor = $(self.data).find('a[href=#' + this.id + ']');
				if (anchor.length > 0)
				{
					self.navigation.push({ id : this.id, name : anchor.html(), elem: this });
				}
			}
			i++;
		});
		self.count = i;
	},
	getChapterPositions: function(data)
	{
		var result = [];
		var self = this;
		if (typeof data == "undefined")
		{
			data = self.data;
		}
		for (var navId in self.navigation)
		{
			var elem = $(self.navigation[navId].elem);
			result.push(elem.attr('data-position') / self.total);
		}
		return result;
	},
	getElementIdAtPosition: function(position)
	{
		if (this.count == 0)
		{
			return null;
		}
		if (this.count == 1 || position == 0)
		{
			//return this.rows[0];
			return 0;
		}
		var progress = parseInt(this.total * position);
		//console.log(progress);
		// TODO: For big documents, instead of iterating through all rows, there should be an option to "guess" the position of a row, by either estimating it or using a "guess a number 1-100" algorithm
		for (var i = 0; i < this.count; i++)
		{
			if (this.index[i] > progress)
			{
				break;
			}
		}
		//console.log(i - 1);
		//return this.rows[i - 1];
		return i - 1;
	}
}