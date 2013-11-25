var map = {
        resize:function(){
            $('#mapcon').css('height',$('#mapcon').parent().height()-50);
            $('#map').css('height',$('#map').parent().height()-40);            
        },
        guide:function(){
            if(!_.loadData('guide'))
            {
            _.saveData('guide',true);
            $('#guidemap').show();

            $('#hand').animate({
                left:93,top: 110
            },1000,function(){
                $(this).css('top',120);
                $(this).animate({left: 245,top: 120},
                1000,function(){
                    $(this).css('top',130);
                    $(this).animate({left: 212,top: 225},
                        1000,function(){
                            $(this).css('top',235);
                            $(this).animate({left: 108,top: 205},
                                1000,function(){
                                $('#guidemap').hide();
                            })
                });
            });
        })
        }
        },
        findListing:function()
        {
            map.maps.removeMarkers();
            $('#done').hide();
            $('#shape_b').show();
            if(poly.getPath().getArray().length>2)
            {

                var found=new Array();            
                var photo=new Array();  
                _.getJSON('api/search?singleimg=1',function(results){
                    for(var o in results.result){
                        var f=google.maps.geometry.poly.containsLocation(new google.maps.LatLng(results.result[o].lat,results.result[o].lng),poly);
                        if(f)
                        {              
                            found.push(results.result[o]);                            
                        }                
                    }

                    if(found.length>0)
                    {                      
                        var source={};
                        source.listing=found;  
                        listing.addRecent('object');
                        listing.openResult(source);
                    }else{
                        _.alert('not found any property on this selected area');

                    }
                });                
                $('#shape_b').hide();
                
                
                
                

            }else{
                map.mapclear();

            }

        },
        mapclear:function(){            
            if(poly==null){
                
            }else{
                for(var i in poly.markers.b){
                    poly.markers.b[i].setMap(null);
                }
                poly.setMap(null);
                poly=null;
                $('#alert').hide();
            }
        },
        showPosition:function(position)
        {
            
        },
        searchByPos:function(lat,lng){
                map.maps.drawCircle({
                  lat: lat,
                  lng: lng,
                  radius: 20000,  //350 meters
                  strokeColor: '#432070',
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  fillColor: '#432070',
                  fillOpacity: 0.6
                });                
                _.getJSON('api/map/searchBy/'+lng+'/'+lat,function(results){
                    if(results.count==0)                
                    {
                        alertify.alert('not found');
                    }else{
                    var found=results.result;
                        if(found.length==0)
                        {
                            alert('not found');
                        }else{
                        var source={};
                        map.maps.removeMarkers();
                        map.mapclear();
                        source.listing=found;
                        _.saveData('post',source);
                        listing.addRecent('object');
                        map.loadResults(source);                        
                        }
                    }
                });
        },
        myposition:function(){
            if(!_.mobile)
            {
            GMaps.geolocate({
              success: function(position) {

                map.maps.setCenter(position.coords.latitude, position.coords.longitude);
                    map.addMarker({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      title: 'your location'
                    });                
                    map.searchByPos(position.coords.latitude,position.coords.longitude);
              },
              error: function(error) {
                alert('Geolocation failed: '+error.message);
              },
              not_supported: function() {
                alert("Your browser does not support geolocation");
              },
              always: function() {
                
              }
            });
            }else{
                navigator.geolocation.getCurrentPosition(function(p){
                    map.maps.setCenter(p.coords.latitude, p.coords.longitude);
                    map.addMarker({
                      lat: p.coords.latitude,
                      lng: p.coords.longitude,
                      title: 'your location'
                    });                
                    map.searchByPos(p.coords.latitude,p.coords.longitude);
                }, function(){
                    alert('GPS faild');
                });

            }
        },
        app:function(){


            $('#list_address').unbind('keypress').keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    _.ui.animWait();
                    var geocoder = new google.maps.Geocoder();
                    var address = $(this).val();

                    geocoder.geocode( { 'address': address}, function(results, status) {
                      if (status == google.maps.GeocoderStatus.OK)
                      {
                      map.maps.setZoom(10);

                    _.saveData('maprecent',{lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()});      
                          map.maps.setCenter(results[0].geometry.location.lat(),results[0].geometry.location.lng());
                          _.ui.animWait('stop');
                      }
                    });
                }
                event.stopPropagation();                 
             });

             _.ui.text('list_address',{
                icon:'map-marker',
                css:{
                }
             }); 
              
             
        },
        maps:null,
        loadResults: function (data) {
            var items;
            var markers_data = [];
            items = data;
            for (var i = 0; i < items.listing.length; i++) {
                var item = items.listing[i];                        
                var source   = $("#infomaptpl").html();
                var template = Handlebars.compile(source);
                var maptpl    = template(item);               

                if (item.lat != undefined && item.lng != undefined) {
                    var icon = 'user/icon/t' + item.type + '.png';
                    markers_data.push({
                        lat: item.lat,
                        lng: item.lng,
                        title: item.address,
                        icon: {
                            size: new google.maps.Size(32, 37),
                            url: icon
                        },infoWindow: {
                            content: maptpl
                          }
                    });
                }
            }
            map.maps.addMarkers(markers_data);

        },

        event: function () {
            $('#alert').click(function(){
                $.getJSON('api/alert/submit/'+_.session('userid'));
            });
            $('#myloc').click(function(){
                map.myposition();
            });
        },
        load:function(run){      
            var page=_.activePage;
            if(page=='search'){
                if($('#mappage').length<=0)
                {                
                    map.view.render();    
                    if($('.searchpanel').css('display')!='none')
                    {
                        home.jqsearch();
                        $('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('width','100%');
                        $('.country,.maxprice,.minprice,.added,.bedroom,.sort,.type').css('margin-top','10px');
                    }
                }
                footer.view.renderTo('.footer',{mapApp:true});
                $('.fbtn').removeClass('active');
                $('.fmap').addClass('active');

            }else
            {
                mapApp.view.render();

                //map.remove
                footer.view.renderTo('.footer',{
                    mapApp:true
                });

            }
            $('.list_address').css('margin-left',50);
            var Path=new Array();
            var recent=_.loadData('maprecent');
            if(recent==''){
                recent={};
                recent.lat=55.755826;
                recent.lng=37.617300;
            }
                map.maps = new GMaps({
                    div: '#map',
                    lat:recent.lat,
                    lng:recent.lng,
                    click:function(e){

                    }
                });

            map.maps.on('marker_added', function (marker) {
                var index = map.maps.markers.length;
                //$('#results').append('<li><a href="#" class="pan-to-marker" data-marker-index="' + index + '">' + marker.title + '</a></li>');

                if (map.maps.markers.length>1) {
                    map.maps.fitZoom();
                }else{
                    map.maps.setZoom(10);
                }
            });

            if(page=="app")
            {                
                map.maps.setZoom(10);
                if(_.loadData('maprecent')=='')
                {
                    GMaps.geolocate({
                      success: function(position) {
                        map.maps.setCenter(position.coords.latitude, position.coords.longitude);
                      },
                      error: function(error) {                    
                        map.maps.setCenter(55.755826,37.617300);
                        map.maps.setZoom(5);
                      },
                      not_supported: function() {                    
                        map.maps.setCenter(55.755826,37.617300);
                        map.maps.setZoom(5);
                      },
                      always: function() {
                        
                      }
                    });
                }          
                MapToolbar_init();
            }else{
            $('#list_address').unbind('keypress').keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    listing.addRecent('keyword='+$(this).val());
                    map.search('keyword='+$(this).val());
                }
                event.stopPropagation();                 
             });

             _.ui.text('list_address',{
                icon:'map-marker',
                css:{              
                                       
                }
             });  
            }
                     

            run();
        },
        search: function (param) {  
                if(typeof param=='undefined') 
                {
                    param=listing.getRecent()[0];   
                }else
                if(_.loadData('post')=='')
                {

                if(param.toObject().recent=='search')
                {
                    param=listing.getRecent()[0];
                }                                                    
                _.getJSON('api/search?singleimg=1&' +param,function(results){
                    if(results.count==0)                
                    {
                        alertify.alert('not found');
                    }else{
                    var found=results.result;
                        if(found.length==0)
                        {
                            alert('not found');
                        }else{
                        var source={};
                        map.maps.removeMarkers();
                        map.mapclear();
                        source.listing=found;
                        map.loadResults(source);
                        listing.addRecent(param);
                        }
                    }
                });
                
            }else{

                var source=_.loadData('post');
                map.loadResults(source);
            
        }
    }

}
