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
		self.bookmarks = {};
		var i = 0;
		$(self.data).children().each(function()
		{
			self.rows.push(this);
			var elem = $(this);
			var text = elem.text().trim();
			elem.attr('data-position', self.total);
			var length = text.length;
			if (length == 0)
			{
				length = 1;
			}
			self.index.push({ position: self.total, length: length });
			elem.attr('data-length', length);
			elem.attr('data-id', i);
			self.total += length;
			if (elem.is("[id]"))
			{
				self.bookmarks[this.id] = i;
				if (elem.is("div"))
				{
					var anchor = $(self.data).find('a[href=#' + this.id + ']');
					if (anchor.length > 0)
					{
						self.navigation.push({ id : this.id, name : anchor.html(), elem: this });
					}
				}
			}
			elem.find("[id]").each(function()
			{
				self.bookmarks[this.id] = i;
			});
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
			var nav = self.navigation[navId];
			if (typeof nav.progress == "undefined")
			{
				var elem = $(nav.elem);
				nav.progress = elem.attr('data-position') / self.total;
			}
			result.push(nav.progress);
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
		var start = 0;
		var end = this.count - 1;
		/*if (end - start < 101 || progress < 1001)
		{
			for (var i = start; i <= end; i++)
			{
				var temp = this.index[i];
				if (temp.position >= progress && temp.position + temp.length < progress)
				{
					return i;
				}
			}
		}
		else
		{*/
		//while(true)
		for (var i = 0; i < 100000; i ++)
		{
			var guessId = start + parseInt((end - start) / 2);
			var guess = this.index[guessId];
			if (progress >= guess.position && progress < guess.position + guess.length)
			{
				App.log('Guess docuemnt position in ' + i + " tries.");
				return guessId;
			}
			if (guess.position < progress)
			{
				start = guessId;
			}
			else
			{
				end = guessId;
			}
		}
		//}
	}
}