var listing={
		newsearch:false,
		openResult:function(data){

			listing.clear();
			listing.load(function(){					
					_.saveData('post',data);					
					var html=_.template($("#itemtemplate").html(),data);
					$('.itemlist').append(html);	
				
			});
		},
	        live:function(){
	        	if(_.session('userinfo'))
                _.getJSON('api/inbox/count/'+_.session('userid'),function(data){
                    $('.myaccount .badge').html(data.tot);
                },false);                
                if(_.session('userid')!=false){
                	$('.myaccount').show();
                	$('.login').hide();
                }else{
                	$('.login').show();
                	$('.myaccount').hide();
                }
        },

		searchpage:function(){
			footer.view.renderTo('.footer',{});
			searchpage.view.render();			
			var t=$('#country');
				t.attr('autocomplete','off');				
				var d=country;
				var s=[];
				for(var i in d)
				{
					if(d[i]!=null)
					if(d[i]!=[])
					if(typeof d[i]=='object')
					if(typeof d[i].name=='string')
					s.push(d[i].name);
				}
				t.typeahead({
					source:s
				});
			t.change(function(){
				$(this).attr('data-val',findArraybyName(country,t.val()));
			})
			$('#country').focus(function(){
				$(this).val('');
			});
			$('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('width','100%');
			$('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('margin-top','10px');
			 $('#bedroom').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="">Any Bedroom</a></li>');
			for(var n=1;n<=10;n++)
			{
			 	$('#bedroom').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+n+'">+'+n+'</a></li>');
			}
			for(var i in type)
			{
			 	$('#type').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+type[i].value+'">'+type[i].name+'</a></li>');
			}
			for(var i in added)
			{
			 	$('#added').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+added[i].value+'">'+added[i].name+'</a></li>');
			}
			for(var i in sort)
			{
			 	$('#sort').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+sort[i].value+'">'+sort[i].name+'</a></li>');
			}
			for(var i in price)
			{
			 	$('#minprice').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+price[i].value+'">'+price[i].name+'</a></li>');
			}
			for(var i in price)
			{
			 	$('#maxprice').append('<li role="presentation"><a role="menuitem" tabindex="-1" class="li-value" data-val="'+price[i].value+'">'+price[i].name+'</a></li>');
			}
			
			_.event();
		},
		clear:function(){
			$('.itemlist').html('');
		},
		listsearch:function(){
			listing.search(listing.getRecent()[0]);			
		},
		addRecent:function(param){
			if(_.loadData('searchrecent')!=null)
			if(_.loadData('searchrecent').length>255){
				_.deleteData('searchrecent');
			}
			_.saveData('searchrecent',param+'|'+_.loadData('searchrecent'));
		},
		getRecent:function(){
			return _.loadData('searchrecent').split('|');
		},
		nextContent:function(index,scroll){			
			var param='';
			
			if(!IsNumeric(index))
			{
				param=index;
				index=0;
			}else{
				param=listing.getRecent()[0];
			}
			_.updateJSON('api/search?'+param,function(response){		
				var data={};
				console.log(response);
				data.listing=response.result;										
				if(typeof listing.newsearch!='undefined')
				{
					if(listing.newsearch)
					{
						data.search=true;
					}
				}				
				$('.itemlist').append(_.template($("#itemtemplate").html(),data));	
				var last=0;
				listing.newsearch=false;
				$('.itemlistpan').attr('lastpage',index+1);				
			},index);				

		},
		detail:function(param){		
			 console.log(param)	;
			_.getJSON('api/listing/detail/'+param.toObject().id,function(response){								
				var data={};
				data.listing=response.result;										
				
				listingpage.view.renderTo('.listingpage',data.listing[0]);										
				_.getJSON('api/listing/metainfo/'+param.toObject().id,function(response){
					var info=metainfo.view.toHTML(response);
					
					if(info=='')
					{
						info='This property does not have detail information yet';
					}
					$('.metainfocontent').html(info);					 					
					_.event();
				});
                                           var maps=     new GMaps({
                                                        div: '#map',
                                                        lng:data.listing[0].lng,
                                                        lat:data.listing[0].lat,
                                                });
                                        var icon = '../user/icon/t' + data.listing[0].type + '.png';
                                        maps.addMarkers([{
                                                                lat: data.listing[0].lat,
                                                                lng: data.listing[0].lng,
                                                                title: data.listing[0].address,
                                                                icon: {
                                                                    size: new google.maps.Size(32, 37),
                                                                    url: icon
                                                                }
                                                            }]);  
			});
		},
		resize:function(){
			$('.itemlistpan').css({
				height:$('.content').height()-33-$('footer').height()
			});
			
		},
		search:function(param){	
				if(param=='object')
				{
					listing.openResult(_.loadData('post'));
				}else{
				var data=param.toArray();
				footer.view.renderTo('.footer',{alertMe:true});						
				
				data['country']=findArraybyValue(country,data['country']);				
				listing.view.renderToElement(data);
				$('#country').attr('data-val',param.toArray()['country']);
				

				listing.clear();	
				listing.newsearch=true;	
				listing.addRecent(param);			 
			 	listing.nextContent(param);
			 	}				 				 	
		},
        load:function(run){   

        	if($('.itemlist').length>0){
        		
        	}else{				
				footer.view.renderTo('.footer',{alertMe:true});						
				listing.view.render();					
				home.jqsearch();
				$('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('width','100%');
				$('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').find('.iconx').css('top','25% !important');
				$('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('margin-top','10px');

	            $('#list_address').keypress(function(event){
	                var keycode = (event.keyCode ? event.keyCode : event.which);
	                if(keycode == '13'){     
	                	_.deleteData('post');
	                    listing.search('keyword='+$(this).val());
	                }
	                event.stopPropagation();                 
	             });

	             _.ui.text('list_address',{
	                icon:'map-marker',
	                css:{
	                    width:'100%',                   
	                    float:'left'                    
	                }
	             });   	              
             }       
             run(); 
             $('.list_address').css('margin-left',0);
        },

}