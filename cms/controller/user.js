var user={
		login:function(){
			login.view.render();
		},
		auth:function(){
			var param=_.session('post');	
			_.getJSON('api/user/auth?'+param,function(response){
				if(response.auth==1)
				{
					_.session('userid',response.userid);
                	if(response.user.type=='agency'){
                		dashboard.init(dashboard.index);
                	}else{
                    window.location="/index.html";
                	}					
				
				}else{
					alertify.alert('Login failed');
					_.redirect('user/login');
				}
			});
		},
		logout:function(){
			_.session('userid',false);
			window['dashboard_created']=false;
			console.log('laogout');
			_.deleteData('userinfo');
			user.login();
		},
        register:function(param){
            if(param!=false){
                _.getJSON('api/user/register?'+param,function(data){
                	_.session('userid',data.id+'');
                	if(param.toObject().type=='agency'){
                		dashboard.init(dashboard.index);
                	}else{
                    window.location="/index.html";
                	}
                    
                });
            }else{
                register.view.render();
            }
        }		
}