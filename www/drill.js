function Drill(_knownWords, _dict, _wordList)
{
	this.knownWords = _knownWords;
	this.dict = _dict;
	this.wordList = _wordList;
	this.screen = $('#drill');
	this.lastWord = "";
	this.init();
}

Drill.prototype = {
	updateStatus: function ()
	{
		var progress = this.wordList.calculateProcentage() + "%";
		this.screen.find('.progress .bar').css('width', progress);
		this.screen.find('.progress span').html(progress);
	},
	getDefinitions: function (_word)
	{
		var currentDict = this.dict.wordDict;
		var pos = this.dict.find(this.dict.wordIndex, _word + ",");
		/*if (pos == null)
		{
			currentDict = this.dict.nameDict;
			var pos = this.dict.find(this.dict.nameIndex, _word + ",");
		}*/
		var definitions = [];
		var indexes = pos.split(',');
		for (var i = 1; i < indexes.length; i++)
		{
			var index = indexes[i];
			definitions.push(currentDict.substring(index, currentDict.indexOf('\n', index)))
		}
		return definitions;
	},
	newQuestion: function()
	{
		this.updateStatus();
		this.screen.find('.question, .answers').html("");
		this.screen.find('.question, .answers').scrollTop(0);
		var answers = [];
		var knownWords = [];
		var wordPool = 50;
		var newWords = 40;
		var numberOfAnswers = 5;
		// Pool possible questions
		for (var i = 0; i < this.wordList.words.length && answers.length < wordPool; i++)
		{
			if (answers.length >= newWords && knownWords.length > 0)
			{
				var knownWordId = Math.floor(Math.random() * knownWords.length);
				answers.push(knownWord[knownWordId]);
				knownWords.splice(knownWordId, 1)
				continue;
			}
			var answer = this.wordList.words[i];
			var stats = this.knownWords[answer.word];
			if (typeof stats == "undefined" || stats.weight < 5)
			{
				answers.push(answer);
				continue;
			}
			if (status == 5)
			{
				knownWords.push(answer);
			}
		}
		// Randomly number of questions
		while (answers.length > numberOfAnswers)
		{
			answers.splice(Math.floor(Math.random() * answers.length), 1);
		}
		// Pick question to ask and keep the rest as alternative answers
		var questionId = 0;
		if (answers.length > 1)
		{
			var tempAnswerIds = [];
			for (var i = 0; i < answers.length; i++)
			{
				if (answers[i].word != this.lastWord)
				{
					tempAnswerIds.push(i);
				}
			}
			var questionId = tempAnswerIds[Math.floor(Math.random() * tempAnswerIds.length)];
		}
		var question = answers[questionId];
		this.lastWord = question.word;
		this.screen.find('.question').html('<h1>' + question.word + '</h1>');
		while (answers.length > 0)
		{
			var answerId = Math.floor(Math.random() * answers.length);
			var answer = answers[answerId];
			var correctAnswer = answer.word == question.word;
			var definitions = this.getDefinitions(answer.word);
			var answerTranslation = [];
			var answerKana = [];
			var tempTranslation = {};
			var tempKana = {};
			for (var i = 0; i < definitions.length; i++)
			{
				var definition = definitions[i];
				var translation = definition.split('/').slice(1, -1).join('; ');
				var kana = definition.match(/\[(.*?)\]/)[1];
				if (typeof tempTranslation[translation] == "undefined" )
				{
					tempTranslation[translation] = true;
					answerTranslation.push(translation);
				}
				if (typeof tempKana[kana] == "undefined" )
				{
					tempKana[kana] = true;
					answerKana.push(kana);
				}
			}
			if (correctAnswer)
			{
				//var answerKana = definition.match(/\[(.*?)\]/)[1];
				this.screen.find('.question').append('<h3 style="display:none">' + answerKana.join(', ') + '</h3>');
			}
			var translation = definition.split('/').slice(1, -1).join(';');
			this.screen.find('.answers').append('<div class="answer ' + (correctAnswer ? "correct" : "") + '">' + answerTranslation.join('<br/>') + '</div>');
			answers.splice(answerId,1);
		}
	},
	init: function()
	{
		var self = this;
		this.screen.show();
		this.screen.find('.answers').off();
		this.screen.find('.answers').on('click', '.answer', function()
		{
			var answer = $(this);
			var question = self.screen.find('.question h1').text().trim();
			self.screen.find('.question h3').show();
			var stat = self.knownWords[question];
			if (typeof stat == "undefined")
			{
				stat = new WordStats();
			}
			if (answer.hasClass('correct'))
			{
				if (stat.weight < 5)
				{
					stat.weight++;
				}
				stat.correct++;
			}
			else
			{
				answer.css('background', "gray");
				answer = answer.closest('.answers').find('.correct');
				if (stat.weight > -5)
				{
					stat.weight--;
				}
				stat.wrong++;
			}
			self.knownWords[question] = stat;
			localStorage["words"] = JSON.stringify(self.knownWords);
			answer.css('background', "black");
			answer.css('color', "white");
			//updateStatus(wordList, words);
			setTimeout(function(){self.newQuestion()}, 1500);
		});
		this.newQuestion();
	}
}