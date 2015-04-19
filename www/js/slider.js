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
			var rangeValue = null;  
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
				rangeValue = ExtendedMath.valueFromRange(null, position, min, max, step);
			} else
			{
				rangeValue = ExtendedMath.valueFromRange(value, null, min, max, step);
			}
			elem.attr('data-value', rangeValue.value);
			knob.css('left', rangeValue.position * 100 + "%");
			return value;
		}
	}
	
	$.fn.slider = function()
	{
		var args = arguments;
		$(this).each(function()
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
				
				if (args.length)
				{
					if (typeof args[0] == 'object')
					{
						input = args[0]['oninput'];
						change = args[0]['onchange'];
						if (typeof args[0]['context'] != "undefined")
						{
							context = $(args[0]['context']);
						}
						else
						{
							context = $self;
						}
					}
					else
					{
						input = args[0];
						change = args[1];
						if (typeof args[2] != "undefined")
						{
							context = $(args[2]);
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
					oninput: input,
					onchange: change,
					input: function()
					{
						if (typeof this.oninput != "undefined")
						{
							this.oninput.call(self);
						}
					},
					change: function()
					{
						if (typeof this.onchange != "undefined")
						{
							this.onchange.call(self);
						}
					},
					val: function(value)
					{
						if (typeof value != "undefined")
						{
							//return slider.setValue($self, knob, value);
							slider.setValue($self, knob, value);
							return this;
						}
						return parseFloat($self.attr('data-value'))
					},
					min: function(value)
					{
						if (typeof value != "undefined")
						{
							$self.attr('data-min', value);
							slider.setValue($self, knob);
							//return value;
							return this;
						}
						return parseFloat($self.attr('data-min'));
					},
					max: function(value)
					{
						if (typeof value != "undefined")
						{
							$self.attr('data-max', value);
							slider.setValue($self, knob);
							//return value;
							return this;
						}
						return parseFloat($self.attr('data-max'));
					},
					range: function(value)
					{
						if (typeof value != "undefined")
						{
							$self.attr('data-max', this.min() + value);
							slider.setValue($self, knob);
							//return value;
							return this;
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
							//return value;
							return this;
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
						self.sliderData.input();
					}
					function up(e)
					{
						e.preventDefault();
						context.off('touchmove', move);
						context.off('touchend touchcancel', up);
						self.sliderData.change();
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
		});
		return $(this)[0].sliderData;
	};
})(jQuery);