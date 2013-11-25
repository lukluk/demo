_.config.libpath='../';

_.addJs('system/controller/leftmenu.js');
_.addJs('../user/json/data.js');
_.addController('user');
_.addController('listing');
_.addController('dashboard',true); //set true index controller

_.addView('login');
_.addView('dashboard');
_.addView('userdashboard');
_.addView('listing/listingitem');
_.addView('listing/mylisting');
_.addView('listing/newlisting');
_.addView('listing/editlisting');
_.addView('listing/newphotos');
_.addView('listing/listingpage');
_.addView('listing/newmetainfo');
_.addView('listing/updatestatus');
_.addView('listing/metainfo');
_.addView('listing/changeprice');
_.addView('profile');
_.addView('register');
_.addView('enquiries/inbox');
_.addView('enquiries/openMsg');

_.resize(function(){			//set event on window resize
	
	$('#app').css({
		width:_.screen().width,
		height:_.screen().height
	});
	$('#leftmenu').css({
		height:_.screen().height,
		left:(_.screen().width*-1)		
	});
});
_.preload=function(){
	$('.footer').html('');
}
_.run(function(){				// load all added js and css, also store html files into local storage	
	
	leftmenu.init();	
	$('#app').show();			// execute function onRun
});
