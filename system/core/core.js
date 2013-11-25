var debug=null;
var _ = {
        mobile:false,
        activePage:'index',
        config: {
                live: false,
                api: {
                        host: 'http://mobile.local/',
                        livehost: 'http://192.241.189.129/'
                },
                defaultController: 'index',
                cache: false,
                libpath: ''
        },
        hash: '',
        currentView: '',
        resizeFunc: null,
        views: [],
        jsfiles: new Array(),
        cssfiles: new Array(),
        ctrlfiles: new Array(),
        viewfiles: new Array(),
        errorNotFound: function () {},
        getJSON: function (url, callback, anim, cache) {
                if(typeof cache == 'string') {
                        var data = _.loadData(cache);
                        console.log(data);
                        if(data != null) {
                                console.log(data);
                                if(typeof callback == 'function')
                                        callback(data);
                                return false;
                        }
                }
                if(typeof anim == 'undefined')
                        _.ui.animWait();
                if(_.config.live) {
                        url = _.config.api.livehost + url;
                } else {
                        url = _.config.api.host + url;
                }
                if(url.indexOf('?') < 0) {
                        url = url + '?callback=?';
                } else {
                        url = url + '&callback=?';
                }
                $.ajax({
                        type: "GET",
                        dataType: "jsonp",
                        url: url,
                        timeout: 15000,
                        success: function (data) {
                                _.ui.animWait('stop');
                                if(typeof cache != 'undefined') {
                                        _.saveData(cache, data);
                                        _.loadData('hasil', cache);
                                }
                                if(typeof callback == 'function')
                                        callback(data);
                        },
                        error: function (x, t, m) {
                                if(t === "timeout") {
                                        $('.animWait').fadeOut();
                                        alertify.alert('connection timeout');
                                } else {
                                        $('.animWait').fadeOut();

                                        alertify.alert('connection error '+url);
                                }
                        }
                });
        },
        screen:function(){
                 var myWidth = 0, myHeight = 0;
                  if( typeof( window.innerWidth ) == 'number' ) {
                    //Non-IE
                    myWidth = window.innerWidth;
                    myHeight = window.innerHeight;
                  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                    //IE 6+ in 'standards compliant mode'
                    myWidth = document.documentElement.clientWidth;
                    myHeight = document.documentElement.clientHeight;
                  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                    //IE 4 compatible
                    myWidth = document.body.clientWidth;
                    myHeight = document.body.clientHeight;
                  }
                return {'width':myWidth,'height':myHeight};
        },
        updateJSON: function (url, callback, index, limit) {
                if(typeof limit == 'undefined') {
                        limit = 15;
                }
                if(typeof index == 'undefined') {
                        index = 0;
                }
                index = index * limit;
                if(_.config.live) {
                        url = _.config.api.livehost + url;
                } else {
                        url = _.config.api.host + url;
                }
                if(url.indexOf('?') < 0) {
                        url = url + '?callback=?';
                } else {
                        url = url + '&callback=?';
                }
                url = url + '&start=' + index + '&limit=' + limit;
                $('<div class="loadNew"><center><img src="' + _.config.libpath + 'system/img/miniloader.gif" width="32px" height="auto"/></center></div>').appendTo($('.itemlist'));
                $.ajax({
                        type: "GET",
                        dataType: "jsonp",
                        url: url,
                        timeout: 15000,
                        success: function (data) {
                                //_.ui.animWait('stop');
                                $('.loadNew').remove();
                                callback(data);
                        },
                        error: function (x, t, m) {
                                if(t === "timeout") {
                                        //$('.animWait').fadeOut();
                                        $('.loadNew').remove();
                                        alertify.alert('connection timeout');
                                } else {
                                        //$('.animWait').fadeOut();
                                        $('.loadNew').remove();
                                        alertify.alert('connection error');
                                }
                        }
                });
        },
        router: function () {
                
                var result = '';
                var par = window.location.hash.replace('#!').split('/');
                if(typeof _.preload == 'function')
                        _.preload();
                if(par.length > 1) {
                        var x=0;
                        var y=par.length;
                        var locked=false;
                        for(x in par) {
                                if(par[x].indexOf('_') > 0) {
                                        var f = par[x].split('_');                                        
                                        if(!locked)
                                        y=x;
                                        locked=true;
                                        result = result + f[0] + '=' + f[1] + '&';
                                }
                        }                        
                        var p2='';
                        console.log(x);
                        for(var i=2;i<y;i++){
                            p2=p2+par[i]+'.';                        
                        }                   
                        p2=p2.substring(0,p2.length-1);
                        par[2]=p2;
                        if(par[2] == '') {
                                par[2] = 'index';
                        }
                        _.activePage=par[2];
                        if(result==''){
                            result=false;
                        }

                        console.log(par[2],par[2].indexOf('fn-'));
                        if(typeof window[par[1]] == 'undefined') {
                                alertify.alert('Page not found');
                        }else
                        if(par[2].indexOf('fn-')<0)
                        {
                                if(typeof eval(par[1] + '.init') != 'function') {
                                        //alertify.alert('init function not defined');
                                }
                                if(typeof eval(par[1] + '.' + par[2]) == 'function') {
                                        //_.session('lastParam_'+par[2],result);
                                        if(window[par[1]+'_created']!=true)
                                        {
                                            if(typeof eval(par[1] + '.init') == 'function')
                                            {
                                                eval(par[1] + '.init')(function () {
                                                        window[par[1]+'_created']=true;
                                                        eval(par[1] + '.' + par[2])(result);
                                                });                        
                                            }
                                            else{
                                                    if(typeof eval(par[1] + '.load') == 'function')
                                                    {
                                                        eval(par[1] + '.load')(function () {                                                        
                                                                eval(par[1] + '.' + par[2])(result);                                                        
                                                                if(typeof eval(par[1] + '.event') == 'function')
                                                                    eval(par[1] + '.event')();

                                                        });                        
                                                    }else{
                                                        window[par[1]+'_created']=true;
                                                        eval(par[1] + '.' + par[2])(result);                                                
                                                        if(typeof eval(par[1] + '.event') == 'function')
                                                            eval(par[1] + '.event')();
                                                    }

                                            }
                                            
                                       }else{
                                            eval(par[1] + '.' + par[2])(result);                                        
                                            if(typeof eval(par[1] + '.event') == 'function')
                                                eval(par[1] + '.event')();

                                        }
                                }else {
                                console.log(typeof eval(par[1] + '.' + par[2]));
                                alertify.alert('Page not found');
                                } 
                        }else{
                                
                                if(typeof eval(par[1] + '.' + par[2].replaceAll('fn-','')) == 'function') {
                                        eval(par[1] + '.' + par[2].replaceAll('fn-',''))(result);
                                }else {
                                
                                alertify.alert('Page not found');
                                }

                        }

                } else {
                        eval(_.config.defaultController + '.index')();
                }
        },
        log: function (msg) {
                alertify.log(msg);
        },
        alert: function (msg) {
                alert(msg);
        },

        event: function () {

        },
        form: {
                getParam: function (el) {
                        var str = '';
                        el.find('.var').each(function () {
                                var val = '';
                                if(typeof $(this).attr('data-val') != 'undefined') {
                                        val = $(this).attr('data-val');
                                } else {
                                    if($(this).attr('type')=='checkbox')
                                    {
                                        if($(this).prop( "checked" ))
                                        val = $(this).val();
                                    }else{
                                        val = $(this).val();
                                    }
                                }                                
                                if(str.length > 0) {
                                        if(val != '')
                                                str = str + '&';
                                }
                                if($(this).attr('type') == 'password') {
                                        val = CryptoJS.MD5(val);
                                }
                                if(val != '')
                                        str = str + $(this).attr('id') + '=' + val;
                        });
                        return str;
                },
                validation: function (el) {
                        $('.errorRequired').remove();
                        var ret = true;
                        $(this).removeClass('error');
                        $(el).find('.validemail').each(function () {
                                
                                if($(this).val().indexOf('@') > 2 && $(this).val().indexOf('.') > 4) {
                                        ret = true;
                                } else {
                                        ret = false;
                                        var th = $(this);
                                        th.addClass('error');
                                }
                        });
                        $(el).find('.required').each(function () {
                                
                                var th = $(this);
                                
                                if(typeof $(this).attr('id') != 'undefined')
                                        if($(this).val() == '') {
                                                th.addClass('error');
                                                ret = false;
                                        }
                        });
                        return ret;
                },
                submit: function (el) {
                        if(_.form.validation(el)) {
                                _.saveData('post', '');
                                if(el.attr('autoclose')!=null)
                                el.fadeOut('slow');
                                var method = el.attr('method');
                                var target = el.attr('target');
                                if(typeof method == 'undefined') {
                                        method = 'get';
                                }
                                var param = _.form.getParam(el);
                                if(method == 'get') {
                                        _.session('get', param);
                                        if(target == '_blank') {
                                                window.location = '#!/' + el.attr('action') + '/' + param.replaceAll('&', '/').replaceAll('=', '_');
                                        } else {

                                                var path=el.attr('action').replaceAll('/', '.');
                                                console.log(path);
                                                eval(path)(param);
                                        }
                                } else {
                                        _.session('post', param);
                                        if(target == '_blank') {
                                                window.location = '#!/' + el.attr('action') + '/' + param.replaceAll('&', '/').replaceAll('=', '_');
                                        } else {
                                            console.log(el.attr('action').replaceAll('/', '.'));
                                                eval(el.attr('action').replaceAll('/', '.'))(param);
                                        }
                                }
                        }
                }
        },
        template: function (html, data) {
                var source = html;
                var template = Handlebars.compile(source);
                return template(data);
        },
        ui: {
                loadstr:'Wait..',
                animWait: function (mode, func) {
                        if(typeof mode == 'string') {
                                if(mode == "stop") {
                                        $('.animWait').fadeOut(500, function () {
                                                $(this).remove();
                                                if(typeof func == 'function')
                                                        func();
                                        });
                                }else{
                                    loadstr=mode;
                                }
                        } else {
                                $('.content').append('<div class="animWait">'+_.ui.loadstr+'</div>');
                                $('.animWait').css('margin-left',$('.animWait').width()/2*-1);
                                $('.animWait').fadeIn('slow', function () {});
                        }
                },
                createOpt: function (val, name) {
                        name += '';
                        return '<li data-nameval="' + name + '" data-name="' + name.toLowerCase() + '" data-val="' + val + '"><a >' + name + '</a></li>';
                },
                text: function (el, config) {
                        var com = '<span class="iconx glyphicon glyphicon-'+config.icon+'" ></span>';
                        var ele = $('#' + el);
                        config.class = el;
                        config.class = '.' + config.class;
                        $(config.class).css('position', 'relative');
                        ele.after(com);
                        ele.addClass('form-control');
                        ele.attr('autocomplete', 'off');
                        if(typeof config.css != 'undefined')
                                $(config.class).css(config.css);
                },
                dropdown: function (el, config) {
                        var ele = $('#' + el);
                        config.class = el;
                        var com = '<span class="iconx glyphicon glyphicon-'+config.icon+'" ></span><div class="listcontainer"><ul class="listx"></ul></div>'
                        ele.after(com);
                        var options = '';
                        ele.addClass('input');
                        ele.attr('autocomplete', 'off');
                        config.class = '.' + config.class;
                        $(config.class).css('position', 'relative');
                        $(config.class + ' a.iconx').click(function () {
                                if(!$(config.class + ' .listcontainer').hasClass('slideup'))
                                        $(config.class + ' .listcontainer').addClass('slideup');
                                $(config.class + ' .listcontainer').css('height', '200');
                        });
                        if(typeof config.iconleft == 'undefined') {
                                config.iconleft = 0;
                        }
                        if(typeof config.searchby == 'undefined') {
                                config.searchby = 'name';
                        }
                        //var w=parseInt($(config.class).css('width'))-50+config.iconleft;
                        //$(config.class+' .iconx').css('margin-left',w+'px');
                        for(var i in config.data) {
                                options += _.ui.createOpt(config.data[i].value, config.data[i].name);
                        }
                        $(config.class + ' .listx').html(options);
                        ele.focus(function () {
                                if(!$(config.class + ' .listcontainer').hasClass('slideup'))
                                        $(config.class + ' .listcontainer').addClass('slideup');
                                $(config.class + ' .listcontainer').css('height', '200');
                        });
                        ele.blur(function () {
                                if($(config.class + ' .listx li:hover').length <= 0)
                                        $(config.class + ' .listcontainer').css('height', '0');
                        });
                        var pan = $(config.class + ' .listcontainer').jScrollPane({
                                contentWidth: '0px'
                        });
                        var panapi = pan.data('jsp');
                        ele.bind('keyup', function (e) {
                                var code = (e.keyCode ? e.keyCode : e.which);
                                if(code == 13) { //Enter keycode
                                        ele.val($(config.class + ' .listx li.hover').attr('data-nameval'));
                                        ele.attr('data-val', $(config.class + ' .listx li.hover').attr('data-val'));
                                        $(config.class + ' .listcontainer').css('height', '0');
                                } else {
                                        if($(config.class + ' .listx li[data-' + config.searchby + '^=' + $(this).val().toLowerCase() + ']').length > 0) {
                                                var offset = $('.listx li').first().position().top;
                                                var pos = $(config.class + ' .listx li[data-' + config.searchby + '^=' + $(this).val().toLowerCase() + ']:eq(1)').position().top - offset;
                                                $(config.class + ' .listx li').removeClass('hover');
                                                $(config.class + ' .listx li[data-' + config.searchby + '^=' + $(this).val().toLowerCase() + ']:eq(1)').addClass('hover');
                                                panapi.scrollTo(0, pos);
                                        }
                                }
                        });
                        $(config.class + ' .listx li').click(function () {
                                ele.val($(this).attr('data-nameval'));
                                ele.attr('data-val', $(this).attr('data-val'));
                                $(config.class + ' .listcontainer').css('height', '0');
                        });
                        $(config.class + ' .listcontainer').css('height', '0');
                }
        },
        progress: null,
        pnum: 0,
        totalView: 0,
        loadData: function (name) {
                return $.totalStorage(name);
        },
        saveData: function (name, val) {
                return $.totalStorage(name, val);
        },
        deleteData: function (name) {
                return $.totalStorage(name, null);
        },
        session: function (key, val) {
                if(typeof val == 'undefined') {
                        if(_.loadData(key) != null) {
                                var value = _.loadData(key);
                                if(key == 'post') {
                                        _.deleteData(key);
                                }

                                return $.base64.decode(value);
                        } else {
                                if(key=='userid')
                                {
                                    _.redirect('user/login');
                                }
                                return false;
                        }
                } else {
                        _.saveData(key, $.base64.encode(val));
                }
        },
        getView: function (name, whendone, path) {
                var xpath = '';                
                if(typeof path != 'undefined') {
                        xpath = path;
                }
                if((_.config.cache) && (typeof $.totalStorage(name) != 'undefined')) {
                        _.pnum += 1;
                        if(_.totalView == _.pnum) {
                                whendone();
                                return true;
                        }
                } else {
                        $.get(xpath + 'view/' + name + '.html', function (data) {
                                $.totalStorage(name.replace(/^.*(\\|\/|\:)/, ''), data);
                                _.pnum += 1;
                                if(_.totalView == _.pnum) {
                                        whendone();
                                        return true;
                                }
                        });
                }
        },
        loadSystemViews: function (names, whendone) {
                _.totalView = names.length;
                pnumx = 0;
                _.pnum = 0;

                function checkDonex() {
                        pnumx++;
                        if(pnumx == 2) {
                                for(var o in names) {
                                        eval(names[o] + '.view=new View("' + names[o] + '");');
                                }
                                if(typeof whendone == 'function')
                                        whendone();
                        }
                }
                for(var i in names) {
                        this.getView(names[i], checkDonex, _.config.libpath + 'system/');
                }
                _.loadControlers(names, checkDonex, _.config.libpath + 'system/');
        },
        loadViews: function (names, whendone) {
                _.totalView = names.length;
                _.views = names;
                _.pnum = 0;
                for(var i in names) {
                        this.getView(names[i], function () {                                                            
                                for(var o in names) {
                                        if(typeof window[names[o].replace(/^.*(\\|\/|\:)/, '')] != 'object') {
                                                window[names[o].replace(/^.*(\\|\/|\:)/, '')] = {};
                                        }    
                                        eval(names[o].replace(/^.*(\\|\/|\:)/, '') + '.view=new View("' + names[o].replace(/^.*(\\|\/|\:)/, '') + '");');                                                                                
                                }

                                if(typeof whendone == 'function')
                                        whendone();

                        });
                }
        },
        loadModels: function (models, whendone) {
                this.loadJs(models, 'model', '.js', whendone);
        },
        loadControlers: function (controlers, whendone, path) {
                var xpath = '';
                if(typeof path != 'undefined') {
                        xpath = path;
                }

                this.loadJs(controlers, xpath + 'controller', '.js', whendone);
        },
        loadJs: function (js, path, ext, whendone, required) {
                var systemfiles = false;
                var newpath = '';
                if(typeof required == 'undefined') {
                        required = false;
                };
                var total = js.length;
                var progress = 0;
                var ds = '';
                if(path != '') {
                        ds = '/';
                } else {
                        ds = '';
                }
                for(var i in js) {
                        if(js[i].indexOf('system/') > -1) {
                                systemfiles = true;
                        } else {
                                systemfiles = false;
                        }
                        if(systemfiles) {
                                newpath = _.config.libpath + path;
                        } else {
                                newpath = path;
                        }
                        loader.injectJs(newpath + ds + js[i] + ext, function () {
                                progress += 1;
                                if(required) {
                                        if(typeof _.progress == 'function') _.progress((progress / total) * 100);
                                }
                                if(progress == total) {
                                        if(typeof whendone == 'function')
                                                whendone();

                                        return true;
                                }
                        });
                }

        },
        loadCss: function (css, path, ext, whendone) {
                var systemfiles = false;
                var newpath = '';
                var total = css.length;
                var progress = 0;
                var ds = '';
                if(path != '') {
                        ds = '/';
                } else {
                        ds = '';
                }
                for(var i in css) {
                        if(css[i].indexOf('system/') > -1) {
                                systemfiles = true;
                        } else {
                                systemfiles = false;
                        }
                        if(systemfiles) {
                                newpath = _.config.libpath + path;
                        } else {
                                newpath = path;
                        }
                        loader.injectCss(newpath + ds + css[i] + ext, function () {
                                progress += 1;
                                if(progress == total) {
                                        whendone();
                                        return true;
                                }
                        });
                }
        },
        addJs: function (js) {
                if(typeof js == 'object') {
                        for(var i in js) {
                                this.jsfiles.push(js[i]);
                        }
                } else {
                        this.jsfiles.push(js);
                }
        },
        addController: function (js, setDefault) {
                if(typeof js == 'object') {
                        for(var i in js) {
                                this.ctrlfiles.push(js[i]);
                        }
                } else {
                        this.ctrlfiles.push(js);
                        if(typeof setDefault != 'undefined') {
                                if(setDefault) {
                                        _.config.defaultController = js;
                                }
                        }
                }
        },
        addCss: function (css) {
                if(typeof css == 'object') {
                        for(var i in css) {
                                this.cssfiles.push(css[i]);
                        }
                } else {
                        this.cssfiles.push(css);
                }
        },
        addView: function (view) {
                if(typeof view == 'object') {
                        for(var i in view) {
                                this.viewfiles.push(view[i]);
                        }
                } else {
                        this.viewfiles.push(view);
                }
        },
        reloadView:function(whendone){
            for(var i in this.viewfiles)
            {
                this.deleteData(this.viewfiles[i]);
            }
            this.loadViews(this.viewfiles, function () {
                if(typeof whendone=='function')
                {
                    whendone();
                }
            });
        },
        require: function (js, css, whendone) {
                var xjs = ['system/js/jquery.flexnav.min.js',
                        'system/js/jquery.jscrollpane.min.js',
                        'system/js/jgestures.min.js',
                        'system/js/bootstrap.min.js',
                        'system/js/bootstrap-select.js',
                        'system/js/bootstrap-typeahead.js',
                        'system/js/bootstrap-switch.js',
                        'system/js/handlebars.js',                        
                        'system/js/jquery.base64.js',
                        'system/js/md5.js',
                        'system/js/jquery.ui.widget.js',
                        'system/js/jquery.iframe-transport.js',
                        'system/js/jquery.fileupload.js',                        
                        'system/js/alertify.min.js'
                ];
                var xcss = ['system/css/flexnav.css',
                        'system/bootstrap/css/bootstrap.css',                        
                        'system/css/jquery.jscrollpane.css',
                        'system/css/jquery.fileupload.css',
                        'system/css/font-awesome.min.css',
                        'system/css/alertify.core.css',
                        'system/css/alertify.bootstrap.css'
                ];
                for(var i in js) {
                        xjs.push(js[i]);
                }
                for(var i in css) {
                        xcss.push(css[i]);
                }
                this.loadCss(xcss, '', '', function () {
                        _.loadJs(xjs, '', '', function () {
                                whendone();
                                return true;
                        }, true);
                });
        },
        resize: function (func) {
                if(typeof func == 'function')
                        _.resizeFunc = func;
        },
        activeController: function () {
                var par = window.location.hash.replace('#!').split('/');
                if(typeof par[1] != 'undefined') {
                        return window[par[1]];
                } else {
                        return window[_.config.defaultController];
                }
        },
        live:function(){
            if( typeof _.activeController().live =='function')
            _.activeController().live();
            console.log('test');
            setTimeout(_.live,60000);
        },
        bindWindowEvent: function () {
                
                $(window).on('hashchange', function () {
                        if(_.hash != window.location.hash) {
                                console.log(_.hash);
                                _.router();
                                _.hash = window.location.hash;
                        }
                });
                $(window).resize(function () {
                        if(typeof _.resizeFunc == 'function') {
                                _.resizeFunc();
                        }
                        var par = window.location.hash.replace('#!').split('/');
                        if(typeof _.activeController().resize == 'function')
                                _.activeController().resize();
                        $('.btnLabel').each(function () {
                                var w = $(this).parent().width();
                                var fs = (14 / 100) * w;
                                if(fs > 13) {
                                        fs = 13;
                                }
                                $(this).css('font-size', fs + 'px');
                        });
                });
        },
        autoDom:function(){
                //$('#app').css('height',parseInt($( document ).height())));
                $('.li-value').off("click").on("click",function(){                    
                    $(this).parent().parent().attr('data-val',$(this).attr('data-val'));
                    $(this).parent().parent().parent().find('button').html($(this).html()+'<span class="caret"></span>');
                });
                $('.clickable').off("click").on("click",function(){
                    if($(this).attr('action')!=null){
                        _.redirect($(this).attr('action'));
                    }
                });

                $(".number").off("keydown").on("keydown",function (event) {
                        // Allow: backspace, delete, tab, escape, enter and .
                        if($.inArray(event.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
                                // Allow: Ctrl+A
                                (event.keyCode == 65 && event.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (event.keyCode >= 35 && event.keyCode <= 39)) {
                                // let it happen, don't do anything
                                return;
                        } else {
                                // Ensure that it is a number and stop the keypress
                                if(event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                                        event.preventDefault();
                                }
                        }
                });
                $('.scroll').off("scroll").on("scroll",function () {
                        if(typeof $(this).find('div.loadNew')[0] == 'undefined') {
                                if($(this).scrollTop() + $(this).innerHeight() == $(this)[0].scrollHeight) {
                                        if(typeof eval($(this).attr('touchbottom')) == 'function') {
                                                var lastPage = 0;
                                                if($(this).attr('lastPage') != null && typeof $(this).attr('lastPage') != 'undefined') {
                                                        lastPage = parseInt($(this).attr('lastPage'));
                                                } else {
                                                        $(this).attr('lastPage', '1');
                                                        lastPage = 1;
                                                }
                                                eval($(this).attr('touchbottom'))(lastPage);
                                        }
                                }
                        }
                });
                $(".btn-group a").off("click").on("click", function () {
                        $(this).siblings().removeClass("active").end().addClass("active");
                        $(this).parent().attr('data-val', $(this).attr('data-val'));
                });

                $('form').submit(function () {
                        return false;
                });            
                $('input[type=submit]').off("click").on("click",function () {
                        
                        if($(this).attr('form')!=null){
                            var form = $('#'+$(this).attr('form'));
                        }else{
                            var form = findParent($(this), 'form');
                        }
                        //var con = form.parent();
                        _.deleteData('post');
                        _.form.submit(form);
                        return false;
                });

                $('.col-all-6').addClass('col-md-6 col-sm-6 col-xs-6');
                $('.col-all-4').addClass('col-md-4 col-sm-4 col-xs-4');
                $('.col-all-2').addClass('col-md-2 col-sm-2 col-xs-2');
                $('.flatbutton').addClass("btn btn-block btn-lg btn-primary");
                $('.view').each(function(){
                    if($(this).attr('renderTo')!=null){
                        $($(this).attr('renderTo')).html($(this).html());
                    }
                });

                $('.btnLabel').each(function () {
                        var w = $(this).parent().width();
                        var fs = (14 / 100) * w;
                        if(fs > 13) {
                                fs = 13;
                        }
                        $(this).css('font-size', fs + 'px');
                })

        },
        redirect: function (url) {
                window.location = '#!/' + url;
        },        
        deviceReady: function (whendone) {
            if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

                document.addEventListener("deviceready", whendone, false);
                _.mobile=true;
            } else {
                _.mobile=false;
                whendone(); //this is the browser
            }           
        },
        pushnoti:function(){
            //_.getJSON('msg/read',function(data){
                /*navigator.notification.alert(
                'You are the winner!',  // message
                        function(){},         // callback
                        'Game Over',            // title
                        'Done'                  // buttonName
                    );                */

            //})
        },
        run: function (whendone) {
                var th = this;

                setTimeout(_.pushnoti,3000);                
                this.loadSystemViews(['startup'], function () {
                        startup.init();
                        th.deviceReady(function () {
                                th.require(th.jsfiles, th.cssfiles, function () {
                                        th.loadControlers(th.ctrlfiles, function () {                                            
                                                th.loadViews(th.viewfiles, function () {                                                    
                                                        $('#progress').fadeOut(function () {

                                                                if(typeof _.resizeFunc == 'function') {
                                                                        _.resizeFunc();
                                                                }

                                                                if(typeof whendone == 'function')
                                                                        whendone();
                                                                th.router();
                                                                th.bindWindowEvent();
                                                                th.live();
                                                        });
                                                });
                                        })
                                });
                        });
                });
        }
}
var keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";
String.prototype.encode64 = function () {
        var input = escape(this);
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if(isNaN(chr2)) {
                        enc3 = enc4 = 64;
                } else if(isNaN(chr3)) {
                        enc4 = 64;
                }
                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output;
}
String.prototype.toObject = function () {
        var x = this.split('&');
        var r = {};
        for(var i in x) {
                var f = x[i].split('=');
                r[f[0]] = f[1];
        }
        return r;
}
String.prototype.toArray = function () {
        var x = this.split('&');
        var r = [];
        for(var i in x) {
                var f = x[i].split('=');
                r[f[0]] = f[1];
        }
        return r;
}

String.prototype.decode64 = function () {
        var input = this;
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if(base64test.exec(input)) {
                alertify.error("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if(enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                }
                if(enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                }
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return unescape(output);
}
Number.prototype.formatMoney = function (c, d, t) {
        var n = this,
                c = isNaN(c = Math.abs(c)) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                s = n < 0 ? "-" : "",
                i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
                j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
String.prototype.replaceAll = function (old, newstr) {
        var regex = new RegExp(old, 'g');
        return this.replace(regex, newstr);
}
String.prototype.toURL = function () {
        return this.replaceAll('&', '/').replaceAll('=', '_');
}
function findArraybyName(array,name) {
        for(var n in array){
            if(array[n].name==name){
                return array[n].value;
            }
        }
}
function findArraybyValue(array,value) {
        for(var n in array){
            if(array[n].value==value){
                return array[n].name;
            }
        }
}

function View(name) {
        this.dialog=function(title,data){
            if(typeof title =='undefined') title=name;            
            if(title!='close')
            {                
                $(this.toHTML(data)).appendTo($('body')).modal({
                    show:true,
                    backdrop:false
                });
                $('.modal-title').html(title);
                _.autoDom();
            }else{
                $('.modal').fadeOut('fast');
            }

        }
        this.renderToElement=function(data,parent){
            var parent='';
            if(typeof parent=='undefined') parent='';
            for(var na in data){
                if(typeof data[na]!='undefined')
                $(parent+' #'+na).val(data[na]);
                
            }
        }
        this.render = function (data) {
                console.log(name,data);
                var ele = '.content';
                var html = _.loadData(name);
                if(typeof data == 'object') {
                        var template = Handlebars.compile(html);
                        html = template(data);
                }
                $(ele).html(html);                
                _.autoDom();
                if(typeof _.activeController().resize == 'function') {
                        _.activeController().resize();
                }
        };
        this.renderTo = function (ele, data) {
                if($(ele).length > 0) {
                        $(ele).html('')
                        console.log(name,data);;
                        var html = _.loadData(name);
                        if(typeof data == 'object') {
                                var template = Handlebars.compile(html);
                                html = template(data);
                        }
                        $(ele).html(html);
                        _.autoDom();
                        var par = window.location.hash.replace('#!').split('/');
                        
                } else {
                        _.redirect(_.config.defaultController + '/index');
                }
        },
        this.toHTML = function (data) {
                var html = _.loadData(name);
                if(typeof data == 'object') {
                        var template = Handlebars.compile(html);
                        html = template(data);
                }
                return html;
        }
}

function findParent(a, b) {
        var parent = false;
        a.addClass('dummy');
        $(b).each(function () {
                if($(this).find('.dummy').length > 0) {
                        a.removeClass('dummy');
                        parent = $(this);
                }
        });
        return parent;
}


function IsNumeric(input) {
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return(RE.test(input));
}