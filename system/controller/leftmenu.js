var leftmenu={
	open:false,
	isOpen:function(){
		return leftmenu.open;
	},
	showLeftMenu:function (){
			$('#app').animate({
				left:$('#leftmenu').width(),
			},500,function(){
				leftmenu.open=true;
			});
			$('#leftmenu').animate({
				left:0,
			},500);	
	},
	 hideLeftMenu:function(){
			$('#app').animate({
				left:0,
			},500,function(){
				leftmenu.open=false;
			});
			$('#leftmenu').animate({
				left:($('#leftmenu').width()*-1),
			},500);	
	},
	init:function(){
		$(window).bind('swiperight',function(){			
			if(!leftmenu.isOpen())
			leftmenu.showLeftMenu();
		});		
		$(window).bind('swipeleft',function(){			
			if(leftmenu.isOpen())
			leftmenu.hideLeftMenu();
		});		
		$('#menubutton').click(function(){
			if(leftmenu.isOpen())
			{
				leftmenu.hideLeftMenu();
			}else
			{
				leftmenu.showLeftMenu();
			}
		});		
	}
}