var home={			
	        live:function(){
	        	if(_.session('userid'))
                _.getJSON('api/inbox/count/'+_.session('userid'),function(data){
                    $('.myaccount .badge').html(data.tot);
                },false);                
                if(_.session('userid')!=false){
                	$('.myaccount,.logout').show();
                	$('.login').hide();
                }else{
                	$('.login').show();
                	$('.myaccount,.logout').hide();
                }
        },

	jqsearch:function(){
		 var minprice=new Array();
		 minprice.push({name:'No Minprice',value:''});
		 for(var n=10000;n<=90000;n+=10000)
		 {
		 	minprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }
		 for(var n=100000;n<=900000;n+=100000)
		 {
		 	minprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }
		 for(var n=1000000;n<=15000000;n+=1000000)
		 {
		 	minprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }		
		 var maxprice=new Array();
		 maxprice.push({name:'No Maxprice',value:''});
		 for(var n=10000;n<=90000;n+=10000)
		 {
		 	maxprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }
		 for(var n=100000;n<=900000;n+=100000)
		 {
		 	maxprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }
		 for(var n=1000000;n<=15000000;n+=1000000)
		 {
		 	maxprice.push({name:n.formatMoney(0,'.',','),value:n});
		 }		
		var bedroom=new Array();
		for(var n=1;n<=10;n++)
		{
			bedroom.push({name:n+'+',value:n});
		}
		
		 $(".flexnav").flexNav();
		 _.ui.dropdown('country',{
		 	icon:'flag',
		 	data:country
		 });
		 _.ui.dropdown('minprice',{
		 	icon:'circle-arrow-down',		 	
		 	data:minprice,
		 	iconleft:15,
		 	searchby:'val'
		 });		 
		 _.ui.dropdown('maxprice',{
		 	icon:'circle-arrow-down',		 	
		 	data:maxprice,
		 	iconleft:15,
		 	searchby:'val'
		 });		 
		 _.ui.dropdown('type',{
		 	icon:'circle-arrow-down',		 	
		 	data:type,
		 	iconleft:15,
		 });		 
		 _.ui.dropdown('bedroom',{
		 	icon:'circle-arrow-down',		 	
		 	data:bedroom,
		 	iconleft:15,
		 });	
		 _.ui.dropdown('added',{
		 	icon:'time',		 	
		 	data:added,		 	
		 	iconleft:8
		 });	
		 _.ui.dropdown('sort',{
		 	icon:'sort-by-attributes',		 	
		 	data:sort,		 	
		 	iconleft:8
		 });	
		 _.ui.text('keyword',{
		 	icon:'map-marker',
		 	css:{
		 		width:'347px',
		 		float:'left'
		 	}
		 });
		 

	},
	initForWide:function(){
		footer_home.view.renderTo('.footer');
		
		 $('#moreoption').click(function(){
		 	if($('#moreoption').val()=='Less Options')
		 	{
				$('.more').fadeOut('slow');
		 		$('.homemenu').css('height','170px');
		 		$('#moreoption').val('More Options');
		 	}else
		 	{
		 		$('#moreoption').val('Less Options');
		 		$('.more').fadeIn('slow');
		 		$('.homemenu').css('height','270px');		 		

		 	}

		 });		 
		 this.jqsearch();		 
		 $('.more').hide();
		 $('.homemenu').addClass('slideup');

	},
	initForPhone:function(){
		$('.menu').hide();
		
		$('#app').css('background',"#fff");
	},
	index:function(){		
		if($(window).width()>=800)
		{
		home.view.render();		
		_.getJSON('api/search?sort=createdDate ASC&start=0&limit=4',function(data){
			var s={};
			s.listing=data.result;		
			//console.log(s)	;
			$('#lastproperty').html(_.template($('#lastadded').html(),s));	
		},false);
		_.getJSON('api/search?sort=visited DESC&start=0&limit=4',function(data){
			var s={};
			s.listing=data.result;		
			//console.log(s)	;
			$('#popproperty').html(_.template($('#popular').html(),s));	
		},false)

		home.initForWide();
		//$('#app').css('overflow-y','hidden');
		}else
		{
		homePhone.view.render();
		//window.location='#!/listing/search/';		 		
		home.initForPhone();
		}

	}
}