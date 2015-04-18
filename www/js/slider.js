(function($) {
	var slider = {
		setValue: function(elem, knob, value, fromPageX)
		{
			var min = parseFloat(elem.attr('data-min'));
			var max = parseFloat(elem.attr('data-max'));
			var range = max - min;
			var step = elem.attr('data-step');
			if (typeof value == "undefined")
			{
				value = elem.attr('data-value');
				if (typeof value == "undefined")
				{
					value = min;
				}
				else
				{
					value = parseFloat(value);
				}
			}
			if (typeof step != "undefined")
			{
			   step = parseFloat(step);
			}
			var position = 0;
			if (fromPageX)
			{
				position = (value - elem.offset().left - knob.width() / 2) / (elem.width());
				if (position < 0)
				{
					position = 0;
				}
				if (position > 1)
				{
					position = 1;
				}
				value = range * position;
				if (typeof step != "undefined")
				{
					value = Math.round(value / step) * step;
					position = value / range;
				}
				value = min + value;
			} else if (value <= min)
			{
				value = min;
				position = 0;
			}
			else if (value >= max)
			{
				value = min;
				position = 1;
			}
			else
			{
				if (typeof step != "undefined")
				{
					value = value - min;
					value = Math.round(value / step) * step;
					position = value / range;
					value = min + value;
				}
				else
				{
					position = (value - min) / range;
				}
			}
			elem.attr('data-value', value);
			knob.css('left', position * 100 + "%");
			return value;
		}
	}
	
	$.fn.slider = function()
	{
		var self = this;
		var $self = $(self);
		var input = undefined;
		var change = undefined;
		var context = undefined;
		
		if (typeof self.sliderData == "undefined")
		{
			if (!$self.hasClass('slider-control'))
			{
				$self.addClass('slider-control');
			}
			$self.html('<div><div class="knob"></div></div>');
			var knob = $self.find('.knob');
			
			if (arguments.length)
			{
				if (typeof arguments[0] == 'object')
				{
					input = arguments[0]['input'];
					change = arguments[0]['change'];
					if (typeof arguments[0]['context'] != "undefined")
					{
						context = $(arguments[0]['context']);
					}
					else
					{
						context = $self;
					}
				}
				else
				{
					input = arguments[0];
					change = arguments[1];
					if (typeof arguments[2] != "undefined")
					{
						context = $(arguments[2]);
					}
					else
					{
						context = $self;
					}
				}
			}
			else
			{
				context = knob;
			}
			
			self.sliderData = {
				input: input,
				change: change,
				val: function(value)
				{
					if (typeof value != "undefined")
					{
						return slider.setValue($self, knob, value);
					}
					return parseFloat($self.attr('data-value'))
				},
				min: function(value)
				{
					if (typeof value != "undefined")
					{
						$self.attr('data-min', value);
						slider.setValue($self, knob);
						return value;
					}
					return parseFloat($self.attr('data-min'));
				},
				max: function(value)
				{
					if (typeof value != "undefined")
					{
						$self.attr('data-max', value);
						slider.setValue($self, knob);
						return value;
					}
					return parseFloat($self.attr('data-max'));
				},
				range: function(value)
				{
					if (typeof value != "undefined")
					{
						$self.attr('data-max', this.min() + value);
						slider.setValue($self, knob);
						return value;
					}
					return this.max() - this.min();
				},
				step: function(value)
				{
					if (typeof value != "undefined")
					{
						if (value == null)
						{
							$self.removeAttr('data-step');
							return undefined;
						}
						$self.attr('data-step', value);
						slider.setValue($self, knob);
						return value;
					}
					var step = $self.attr('data-step');
					if (typeof step == "undefined")
					{
						return step;
					}
					return parseFloat(step);
				}
			};
			if ($self.attr('data-value') == "undefined")
			{
				slider.setValue($self, knob);
			}
			context.on('touchstart', function(e)
			{
				function move(e)
				{
					e.preventDefault();
					var zoom = $self.absoluteZoom();
					slider.setValue($self, knob, e.originalEvent.touches[0].pageX / zoom, true);
					if (typeof self.sliderData.input != "undefined")
					{
						self.sliderData.input.apply(self);
					}
				}
				function up(e)
				{
					e.preventDefault();
					context.off('touchmove', move);
					context.off('touchend touchcancel', up);
					if (typeof self.sliderData.change != "undefined")
					{
						self.sliderData.change.apply(self);
					}
				}

				//knob.on('touchmove', move);
				//knob.on('touchend touchcancel', up);
				if (e.target == knob[0])
				{
					context.on('touchmove', move);
					context.on('touchend touchcancel', up);
				}
			});
		}
		return self.sliderData;
	};
})(jQuery);