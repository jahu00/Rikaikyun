function run()
{
	App.log("Application started!");
	$(function()
	{
		/*window.onerror = function(a,b,c) {
			alert(a);
			alert(b);
			alert(c);
		}*/
		//try
		//{
			App.init();
		/*}
		catch(e)
		{*/
			/*if (typeof e.message != "undefined")
			{
				alert(e.message);
			}
			else
			{*/
				//alert(JSON.stringify(e));
			//}
			//console.log(e);
		//}
		//fpsCount.go();
	});
}

if (typeof cordova !== 'undefined' || typeof PhoneGap !== 'undefined' || typeof phonegap !== 'undefined')
{
	document.addEventListener("deviceready", function()
	{
		//deviceReady = true;
		run();
	}, false);
}
else
{
	run();
}