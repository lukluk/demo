var listing={
	editmode:false,
	openchangeprice:function(id,price){
		var data={};
		data.price=price;
		data.id=id;
		changeprice.view.dialog('Change Price',data);
	},
    lock:function(id){
        var data={};
        data.id=id;
        data.status=$('#status'+data.id).attr('data-val');
        updatestatus.view.dialog('Update Property Status',data);
    },
    updatestatus:function(param){
        updatestatus.view.dialog('close');
        var  status='blank';
        if(typeof param.toObject().status!='undefined')
        status=param.toObject().status;
        _.getJSON('api/listing/updatestatus/'+param.toObject().id+'/'+status,function(r){

            if(typeof param.toObject().status=='undefined')
            {
                
                $('#status'+param.toObject().id).attr('data-val','');
                $('#lock'+param.toObject().id).removeClass('fa-lock');
                $('#lock'+param.toObject().id).addClass('fa-unlock');
                

            }else{
                $('#status'+param.toObject().id).attr('data-val','sold');
                $('#lock'+param.toObject().id).removeClass('fa-unlock');
                $('#lock'+param.toObject().id).addClass('fa-lock');                
            }

        })
    },

	changeprice:function(param){
		changeprice.view.dialog('close');
		_.getJSON('api/listing/changeprice/'+param.toObject().id+'/'+param.toObject().price,function(r){
			$('#price'+param.toObject().id).html(r.price);

		})
	},
	edit:function(param){
		_.getJSON('api/listing/detail/' + param.toObject().id, function (response) {
			console.log(response);
			editlisting.view.renderTo('.cmscontent',response.result[0]);                			
                $('select').selectpicker({
                        style: 'btn-primary',
                        menuStyle: 'dropdown-inverse'
                });

			    $('select').each(function(){

			    	$(this).next().find('button#'+$(this).attr('id')).attr('data-val',$(this).attr('data-val')).addClass('var').find('span:first').html(findArraybyValue(window[$(this).attr('id')],$(this).attr('data-val')));
			    	$(this).remove();
			    })
                $(".dropdown-menu li a").click(function(){
                  var selText = $(this).text();            
                  selText=findArraybyName(window[$(this).parent().parent().prev().attr('id')],selText);
                  $(this).parent().parent().prev().attr('data-val',selText);
                });


		});
	},
	editlisting:function(param){
				_.getJSON('api/listing/update/' + param.toObject().id + '?' + param, function (response) {
                        _.session('newlistingid', param.toObject().id + '');
                        newphotos.view.renderTo('.cmscontent');
                                                _.getJSON('api/photo/list/' + _.session('newlistingid'), function (response) {
                                                		for(var i in response.result){
                                                			var th=response.result[i];
                                                        	$('<li id="' + $.base64.encode(th.name).replaceAll('=', '') + '"/>').html("<a href='#!/dashboard/photodelete/name_" + $.base64.encode(th.name) + "/id_" + th.id + "'><span class='fa fa-trash-o white'></span></a><img src='" + th.thumb + "' class='photos'/>").appendTo('#files');
                                                        }
                                                }, false);

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
                                                        $('<li id="' + $.base64.encode(file.name).replaceAll('=', '') + '"/>').html("<a href='#!/dashboard/photodelete/name_" + $.base64.encode(file.name) + "/id_" + response.id + "'><span class='fa fa-trash-o white '></span></a><img src='" + file.thumbnailUrl + "' class='photos'/>").appendTo('#files');
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
	}
}