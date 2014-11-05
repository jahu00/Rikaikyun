function WordEntry(_word, _weight)
{
	this.word = _word;
	this.weight = _weight;
}

function WordList(_knownWords, _dict, _file)
{
	this.words = [];
	this.knownWords = _knownWords;
	this.load(_dict, _file);
}

WordList.prototype = {
	//words: [],
	load: function(_dict, _file)
	{
		var req = new XMLHttpRequest();
		//console.log(_file);
		req.open("GET", _file, false);
		req.send(null);
		var data = req.responseText.split("\n");
		for (var i = 0; i < data.length; i++)
		{
			var _data = data[i];
			if (_data.trim() == "")
				continue;
			var _split = _data.split("\t");
			var _weight = parseInt(_split[0].trim());
			var _word = _split[1].trim();
			if (_word.match(/[\u4E00-\u9FAF]/g) != null)
			{
				if (_dict.find(_dict.wordIndex, _word + ",") != null)
				{
					this.words.push(new WordEntry(_word, _weight));
				}
			}
		}
		//console.log(_file, this.words.length);
	},
	calculateProcentage: function ()
	{
		var totalWeight = 0;
		var learnt = 0;
		for(var i = 0; i < this.words.length; i++)
		{
			var word = this.words[i];
			totalWeight += word.weight;
			var stats = this.knownWords[word.word];
			if (typeof stats == "undefined")
				continue;
			learnt += (stats.weight > 0 ? (stats.weight * word.weight / 5) : 0);
		}
		return (learnt / totalWeight).toFixed(2);
	}
}