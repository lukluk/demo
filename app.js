//_.config.live=true;
_.config.api.host="http://mobile.local/";
_.addJs('user/json/data.js');	//define Js files that will be use on app
_.addJs('user/js/mapToolbar.js')
_.addJs('system/controller/leftmenu.js');
_.addController('home',true);
_.addController(['listing','map']);
_.addView(['listing','home','map']);	//adding multiple view in one syntax
_.addView('metainfo');	
_.addView('homePhone');					// adding single view
_.addView('listingpage');
_.addView('footer'); //footerlisting
_.addView('footer_home');
_.addView('footer_home_phone');
_.addView('mapApp');
_.addView('searchpage');

_.resize(function(){			//set event on window resize
	
	$('#app').css({
		width:$(window).width(),
		height:$(window).height()-$('footer').height()
	});
	$('.content').css({
		height:$('#app').height()-$('header').height()
	});

	$('#leftmenu').css({
		height:$(window).height(),
		left:($(window).width()*-1)		
	});
	console.log('main.app.resize');
});
_.preload=function(){
	$('.footer').html('');
}

_.run(function(){				// load all added js and css, also store html files into local storage	
	
	leftmenu.init();

	$('#menu').click(function(){
		if(leftmenu.isOpen())
		{
			leftmenu.hideLeftMenu();
		}else
		{
			leftmenu.showLeftMenu();
		}
	});
	$('#app').show();			// execute function onRun
});
