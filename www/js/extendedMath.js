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
	}
};