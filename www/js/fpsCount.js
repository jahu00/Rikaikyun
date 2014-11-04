var fpsCount = {
	lastFpsUpdate: new Date().getTime(),
	framesSinceLastUpdate: 0,
	go: function()
	{
		var self = this;
		setInterval(function() { self.measure() }, 1);
	},
	measure: function()
	{
		var currentTime = new Date().getTime();
		this.framesSinceLastUpdate++;
		var timeSinceLastFpsUpdate = currentTime - this.lastFpsUpdate;
		if (timeSinceLastFpsUpdate > 1000)
		{
			//$("#fps").html("fps: " + this.framesSinceLastUpdate);
			console.log("fps: " + this.framesSinceLastUpdate);
			this.framesSinceLastUpdate = 0;
			this.lastFpsUpdate = currentTime;
		}
	}
}