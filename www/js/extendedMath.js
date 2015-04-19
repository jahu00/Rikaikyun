ExtendedMath = {
	getDecimalPlaces: function(x,watchdog)
	{
		x = Math.abs(x);
		watchdog = watchdog || 20;
		var i = 0;
		while (x % 1 > 0 && i < watchdog)
		{
			i++;
			x = x*10;
		}
		return i;
	},
	round: function(x, d)
	{
		d = d || 0;
		/*if (d == 0)
		{
			return Math.round(x);
		}*/
		/*var q = Math.pow(10, -1 * d);
		var diff = x % q;
		x = x - diff;
		diff = Math.round(diff * 10) / 10;
		return x + (diff / q );*/
		return parseFloat(x.toFixed(d));
	},
	valueFromRange: function(value, position, min, max, step)
	{
		var range = max - min;
		var relativeValue = undefined;
		if (typeof value == "undefined" || value == null)
		{
			relativeValue = range * position;
			value = min + relativeValue;
		}
		if (value <= min)
		{
			value = min;
			position = 0;
		}
		else if (value >= max)
		{
			value = max;
			position = 1;
		}
		else
		{
			if (typeof step != "undefined")
			{
				relativeValue = relativeValue || (value - min);
				relativeValue = Math.round(relativeValue / step) * step;
				relativeValue = ExtendedMath.round(relativeValue, ExtendedMath.getDecimalPlaces(step));
				position = relativeValue / range;
				value = min + relativeValue;
			}
			else
			{
				value = Math.round(value);
				position = (value - min) / range;
			}
		}
		return { value: value, position: position };
	}
};