var startup={
	
	remove:function(f){
		if(typeof f =='function')
		{
			$('#startup').fadeOut('slow',function(){
				$(this).remove();
				f();
			})
		}else
		{
			$('#startup').remove();
		}
	},
	init : function(){
		startup.view.renderTo('#startup');
		$('#startup').css('height',$( document ).height());		
		_.progress=function(percent)
		{

			$('#progress').find('div:eq(0)').css('width',(percent/5)+'%');			
			$('#progress').find('div:eq(1)').css('width',(percent/5)+'%');			
			$('#progress').find('div:eq(2)').css('width',(percent/5)+'%');			
			$('#progress').find('div:eq(3)').css('width',(percent/5)+'%');			
			$('#progress').find('div:eq(4)').css('width',(percent/5)+'%');			
		}
	}
}