var officelist='                <div class="row" style="border-bottom:1px solid #666;"><div class="col-md-2 col-sm-2 col-xs-2">address</div><div class="col-md-2 col-sm-2 col-xs-2">phone</div><div class="col-md-2 col-sm-2 col-xs-2">email</div><div class="col-md-2 col-sm-2 col-xs-2">website</div><div class="col-md-2 col-sm-2 col-xs-2">userid</div>                        </div>{{#each offices}}<div class="row"><div class="col-md-2 col-sm-2 col-xs-2">{{this.address}}</div><div class="col-md-2 col-sm-2 col-xs-2">{{this.phone}}</div><div class="col-md-2 col-sm-2 col-xs-2">{{this.email}}</div><div class="col-md-2 col-sm-2 col-xs-2">{{this.website}}</div><div class="col-md-2 col-sm-2 col-xs-2">{{this.userid}}</div><div class="col-md-2 col-sm-2 col-xs-2"><a href="#!/dashboard/fn.officeDelete/id_{{this.id}}">Delete</a></div>                  </div>{{/each}}';
var dashboard = {
        live:function(){
                _.getJSON('api/inbox/count/'+_.session('userid'),function(data){
                    $('#menuinbox .badge').html(data.tot);
                },false);                
        },
        uploadphotos: new Array(),
        userinfo:{},
        init: function (run) {
                _.deleteData('newlistingid');
                if(!_.session('userid')) {
                        _.redirect('user/login');
                } else {

                        _.getJSON('api/user/info/' + _.session('userid'), function (response) {
                                var data = {};
                                data.user = response.result[0];  
                                dashboard.userinfo=response.result[0];                              
                                if(data.user.type=='agency'){
                                    dashboard.view.render(data);                                
                                }else{
                                    userdashboard.view.render(data);
                                }
                                run();

                                $('#list_address').keypress(function (event) {
                                        var keycode = (event.keyCode ? event.keyCode : event.which);
                                        if(keycode == '13') {
                                                _.updateJSON('api/search?keyword=' + $(this).val(), function (response) {
                                                        var data = {};
                                                        data.listing = response.result;
                                                        if(data.listing != null) {
                                                                $('.listing').html(listingitem.view.toHTML(data));
                                                        }
                                                }, 0);
                                        }
                                        event.stopPropagation();
                                });
                                _.ui.text('list_address', {
                                        icon: '&#59172;',
                                        css: {
                                                width: '100%',
                                                float: 'left'
                                        }
                                });
                                $('#logoupload').fileupload({
                                        url: _.config.api.host + 'upload/UploadHandler.php',
                                        dataType: 'json',
                                        done: function (e, data) {
                                                console.log(data);
                                        },
                                        progressall: function (e, data) {
                                                var progress = parseInt(data.loaded / data.total * 100, 10);
                                                $('#progress .progress-bar').css(
                                                        'width',
                                                        progress + '%'
                                                );
                                        }
                                }).prop('disabled', !$.support.fileInput)
                                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
                        }, false, 'userinfo');
                }
        },
        index: function () {
                if(dashboard.userinfo.type=='agency')
                {
                mylisting.view.renderTo('.cmscontent');
                $('.list_address').fadeIn();
                dashboard.loadNextListing();
             
                }else{
                    dashboard.inbox.messages();
                }
               dashboard.resize();
        },
        detail: function (param) {
                $('#app').css('background', '#fff');
                                _.getJSON('api/listing/detail/' + param.toObject().id, function (response) {
                                        var data = {};
                                        data.listing = response.result;                                        
                                        listingpage.view.renderTo('.cmscontent', data.listing[0]);
                                        _.getJSON('api/listing/metainfo/' + param.toObject().id, function (response) {
                                                $('.metainfocontent').html(metainfo.view.toHTML(response));
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
        loadNextListing: function (index) {
                _.updateJSON('api/search?userid=' + _.session('userid'), function (response) {
                        var data = {};
                        data.listing = response.result;
                        if(data.listing != null) {
                                $('.listing').append(listingitem.view.toHTML(data));
                        }
                }, index);
        },
        resize: function () {
        		console.log('resize');
                $('.listing').css('height', $('#app').height() - $('.cmsmenu').height() - $('.list_address').height() - $('.cmsheader').height() - $('.footmenu').height() - 30);
        },
        editInfo:function(param){
            _.getJSON('api/listing/getmetainfo/'+param.toObject().id,function(data){                
                _.session('infoid',param.toObject().id);
                $('select').each(function(){

                    $(this).next().find('button#'+$(this).attr('id')).attr('data-val',$(this).attr('data-val')).addClass('var').find('span:first').html(findArraybyValue(window[$(this).attr('id')],$(this).attr('data-val')));
                    $(this).remove();
                })
                $(".dropdown-menu li a").click(function(){
                  var selText = $(this).text();            
                  selText=findArraybyName(window[$(this).parent().parent().prev().attr('id')],selText);
                  $(this).parent().parent().prev().attr('data-val',selText);
                });
                $('.editinfoform form').fadeIn('fast');
                dashboard.view.renderToElement(data,'.editinfoform');
            });
        },
        updateinfo:function(param){
                var par = param.toObject();
                _.getJSON('api/listing/updateinfo/' + par.type + '/' + par.name + '/' + par.value + '/' + _.session('infoid'), function (response) {
                        $('#editinfoform form').fadeOut('fast');
                        dashboard.getMetaInfo();
                });

        },
        deleteInfo:function(param){
                var par = param.toObject();
                _.getJSON('api/listing/deleteinfo/'+par.id, function (response) {
                        dashboard.getMetaInfo();
                });

        },

        newListing: function () {
                dashboard.uploadphotos = new Array();
                newlisting.view.renderTo('.cmscontent');     
                $('select').selectpicker({
                        style: 'btn-primary',
                        menuStyle: 'dropdown-inverse'
                });

        },
        saveNewListing: function (param) {
                _.getJSON('api/listing/create/' + _.session('userid') + '?' + param, function (response) {
                        _.session('newlistingid', response.id + '');
                        newphotos.view.renderTo('.cmscontent');
                        $('#fileupload').fileupload({
                                url: _.config.api.host + 'upload/UploadHandler.php',
                                dataType: 'json',
                                done: function (e, data) {
                                        $('.progress-bar').fadeOut(function () {
                                                $('.progress-bar').css('width', '0px');
                                                $('.progress-bar').show();
                                        });
                                        $.each(data.result.files, function (index, file) {
                                                var datax = file.thumbnailUrl + '|' + file.url;
                                                _.getJSON('api/photo/upload/' + _.session('newlistingid') + '/' + $.base64.encode(datax), function (response) {
                                                        $('<li id="' + $.base64.encode(file.name).replaceAll('=', '') + '"/>').html("<a href='#!/dashboard/photodelete/name_" + $.base64.encode(file.name) + "/id_" + response.id + "'><span class='fa fa-trash-o white'></span></a><img src='" + file.thumbnailUrl + "' class='photos'/>").appendTo('#files');
                                                        dashboard.uploadphotos.push(file.name);
                                                }, false);
                                        });
                                },
                                progressall: function (e, data) {
                                        var progress = parseInt(data.loaded / data.total * 100, 10);
                                        $('#progress .progress-bar').css(
                                                'width',
                                                progress + '%'
                                        );
                                }
                        }).prop('disabled', !$.support.fileInput)
                                .parent().addClass($.support.fileInput ? undefined : 'disabled');
                });
        },
        photodelete: function (param) {
                _.getJSON('api/photo/delete/' + param.toObject().name + '/'+param.toObject().id, function () {
                        $('#' + param.toObject().name).remove();
                });
        },
        getMetaInfo: function () {
                _.getJSON('api/listing/metainfo/' + _.session('newlistingid'), function (response) {
                        $('.metainfocontent').html(_.template($("#metainfo").html(), response));
                })
        },
        addoffice:function(param){
                _.getJSON('api/user/office/'+_.session('userid')+'?'+param,function(res){                        
                        _.getJSON('api/user/info/' + _.session('userid'),function(response){
                                //var rr=$('#officelistx').html();                                
                                $('.officeList').html(_.template(officelist,response.result[0]));
                        },false);
                },false);
        },
        officeDelete:function(param){

                _.getJSON('api/user/deleteoffice/'+_.session('userid')+'?'+param,function(){                        
                        _.getJSON('api/user/info/' + _.session('userid'),function(response){
                                $('.officeList').html(_.template(officelist,response.result[0]));
                        });
                });
        },

        updateuser:function(param){
                _.getJSON('api/user/update/'+_.session('userid')+'?'+param,function(){
                        alertify.alert('saved');
                });
        },
        profile: function () {
                _.getJSON('api/user/info/' + _.session('userid'), function (response) {
                        profile.view.renderTo('.cmscontent', response.result[0]);
                        $('.officeList').html(_.template(officelist,response.result[0]));
                        $('#addoffice').click(function(){
                                $('#addofficeform').fadeIn();
                        });
                        $('#upcompanylogo').fileupload({
                                url: _.config.api.host + 'upload/UploadHandler.php',
                                dataType: 'json',
                                done: function (e, data) {
                                        $('.progress-bar').fadeOut(function () {
                                                $('.progress-bar').css('width', '0px');
                                                $('.progress-bar').show();
                                        });
                                        $.each(data.result.files, function (index, file) {
                                                
                                                $('#companylogo').val(file.thumbnailUrl);
                                                $('.companylogo').attr('src',file.thumbnailUrl);
                                                $('#companylogoimg').attr('src',file.thumbnailUrl);
                                                _.getJSON('api/user/update/'+_.session('userid')+'?'+'companylogo='+file.url);
                                        });
                                        _.deleteData('userinfo');
                                },
                                progressall: function (e, data) {
                                        var progress = parseInt(data.loaded / data.total * 100, 10);
                                        $('#progress .progress-bar').css(
                                                'width',
                                                progress + '%'
                                        );
                                }
                        }).prop('disabled', !$.support.fileInput)
                                .parent().addClass($.support.fileInput ? undefined : 'disabled');

                });
        },
        addMetaInfo: function () {
                        newmetainfo.view.renderTo('.cmscontent');
                        $('#newinfo').click(function () {
                                $('.newinfoform form').fadeIn('fast');
                        });
                        dashboard.getMetaInfo();
                        $('select').selectpicker({
                                style: 'btn-primary',
                                menuStyle: 'dropdown-inverse'
                        });

        },
        newinfo: function (param) {
                var par = param.toObject();
                _.getJSON('api/listing/addinfo/' + par.type + '/' + par.label + '/' + par.value + '/' + _.session('newlistingid'), function (response) {
                        $('#newinfoform form').fadeOut('fast');
                        dashboard.getMetaInfo();
                });
        },
        inbox:{
            messages:function(){
                _.getJSON('api/inbox/getMsgs/'+_.session('userid'),function(data){
                    inbox.view.renderTo('.cmscontent',data);
                });                
            },
            open:function(param){
                _.getJSON('api/inbox/openMsg/'+_.session('userid')+'/'+param.toObject().id,function(data){
                    data.user=_.loadData('userinfo').result[0];
                    openMsg.view.renderTo('.cmscontent',data);
                });                
                
            },
            send:function(param){
                _.getJSON('api/inbox/send/'+_.session('userid')+'?'+param,function(response){
                    dashboard.inbox.open('id='+param.toObject().listingid);
                });
            }
        }
}