var timer = [];
var $groupID = 0;
var timeDiff = function(){
	var now = new Date().getTime();
  		timer.push(now);
  	var prev = timer.length-2;
  	var last = timer[prev];
  	if(prev !== undefined){
  		var $diff = now-last;
		if($diff>1000){
			//console.log($diff);
  			return true;
	  	}
		else{
			return false;
			//console.log('more than 10000');
		}
  	}
};


var setMode = function(cm, mode) {
	if(mode !== undefined) {
		var script = 'js/mode/'+mode+'/'+mode+'.js';
		$.getScript(script, function(data, success) {
			if(success){
				cm.setOption('mode', mode);
			}
			else{
				cm.setOption('mode', 'clike');
			}
		});
	}
	else{
		cm.setOption('mode', 'clike');
	}
};

var jsPlumbSetup = function ($el,$lang) {
	jsPlumb.Defaults.PaintStyle = { strokeStyle:"#222", lineWidth:2, };
	jsPlumb.Defaults.EndpointStyle = { radius:7, fillStyle:"#222" };
	jsPlumb.importDefaults({Connector : [ "Bezier", { curviness:10 } ]});

	var exampleDropOptions = {
				tolerance:"touch",
				hoverClass:"dropHover",
				activeClass:"dragActive"
			};

	var instance = jsPlumb.getInstance({
			DragOptions : { cursor: 'pointer', zIndex:2000 },
			PaintStyle : { strokeStyle:'#666' },
			EndpointStyle : { width:20, height:16, strokeStyle:'#666' },
			Endpoint : "Rectangle",
			Anchors : ["TopCenter", "TopCenter"],
			Container:"drag-drop-demo"
		});

	var exampleColor = "#00f";
	var exampleEndpoint = {
		endpoint:"Rectangle",
		paintStyle:{ width:25, height:21, fillStyle:exampleColor },
		isSource:true,
		reattach:true,
		scope:"blue",
		connectorStyle : {
			gradient:{stops:[[0, exampleColor], [0.5, "#09098e"], [1, exampleColor]]},
			lineWidth:5,
			strokeStyle:exampleColor,
			dashstyle:"2 2"
		},
		isTarget:true,
		beforeDrop:function(params) { 
			return confirm("Connect " + params.sourceId + " to " + params.targetId + "?"); 
		},				
		dropOptions : exampleDropOptions
	};	
	//jsPlumb.draggable($block,{containment:".editor", cursor: "move" });
	var anEndpointDestination = {
        endpoint: "Dot",
        isSource: true,
        isTarget: true,
        maxConnections: 1
    };

    jsPlumb.makeTarget($el, {
      anchor: 'BottomRight',
      curviness:0,
      scope : $lang
    });

    jsPlumb.makeSource($el, {
    	anchor: 'BottomRight',
		curviness:0,
		width:5,
		scope : $lang
    });
}

var Block = function($id,$lang){
	var $block = $('<div></div>');
	var $openState = false;
	var $typeLabel = $('<div></div>');
		$typeLabel.attr('class','type '+$lang);
	var $input = '<input type="text" name="module-name" />';
	var $name = $('<h1></h1>');
		$name.append('name '+ $id);
	//codr
	var $code = $('<textarea></textarea>');
	var $codeBlock = $('<div></div>');
		$codeBlock.attr('class','codeblock')
			.append($code);

	//Close
	var $close = $('<div></div>');
		$close.attr('class','close open')
			.html('-');

	//Fills the header
	var $header = $('<header></header>');
		
		$header.attr('class','type ' + $lang)
			.append($typeLabel,$name,$input,$close);
	//end of header
	
	
	$close.click(function(){
		if($openState){
			$block.animate({height:'400px'},200);
			$openState = false;
		}
		else{
			$block.animate({height:'40px'},200);
			$openState = true;
		}
		jsPlumb.repaintEverything();
	});

	var group = function($this,$item){
    	var $id = $($item).attr('id');
    	console.log($($item).parent().hasClass('group'));
    	if($($item).parent().hasClass('group')){
    		return false;
    	}
    	else{
    		$groupID++;
			var $group = $('<div></div>');
				$group.attr('id','group-'+$groupID)
				.attr('class','group');
			//$($item).wrapAll($group);
			$('.editor').append($group);
			$group.append($this,$item).sortable().draggable({
				cursor:'move'
			});
			$this.attr('style','').animate({
				height:'40px'
			}).draggable({
				snap : false
			})
			$item.attr('style','').animate({
				height:'40px'
			}).draggable({
				snap : false
			})
    	}
    	//console.log($id);
    }

	$block.attr('class','block')
		.attr('id','block-'+$id)
		.append($header,$codeBlock)
		.draggable({
			handle: $header,
			cursor:'move',
			containment: '.editor',
			snap: '.block',
			snapMode:'outer',
			start: function(e){
				$('.last').removeClass('last');
				$(this).addClass('last');
			},
			drag:function(e){
				jsPlumb.repaintEverything();
		    	   	$(this).find('._jsPlumb_endpoint_anchor_').each(function(i,e){ 
	                    if($(e).hasClass("connect"))
	                        jsPlumb.repaint($(e).parent());
	                    else
	                        jsPlumb.repaint($(e));
					});										
	            },
			stop: function(event, ui) {
				jsPlumb.repaintEverything();
		        var snapped = $(this).data('draggable').snapElements;

	        	var snappedTo = $.map(snapped, function(element) {
	        	//console.log(element.snapping ? group(element.item) : null);
	            return element.snapping ? group($block,element.item) : null;
	        	});
	    	}
		})
		.resizable({ 
			minHeight: 200, 
			minWidth : 250,
			resize :function( event, ui ) {
				jsPlumb.repaintEverything();
			},
			stop: function( event, ui ) {
				jsPlumb.repaintEverything();
			}
		});
	
	$('.editor').append($block);
	
	//Codemirror
	var $codeMirror = CodeMirror.fromTextArea($code[0], {
				lineNumbers: true,
				matchBrackets: true,
				theme:'monokai'
		});
	setMode($codeMirror,$lang);
	$block.attr('style','');
	jsPlumbSetup($typeLabel,$lang);
	
	$codeMirror.on('change',function(){
    	//var $id = $(this).attr('id');//.$blockID;
    	var timer = timeDiff();
    	if(timer){		
    		var $content = $codeMirror.getValue();
    		console.log($lang,$content);
			insertContent($lang,$content);
    	}
    	else{
			
    	}
    	
    });
}






/*
var $blockID;
	$blockID = 0;

var setupCodeMirror = function($coder,$lang){
		var $el = this
		var coder = $($el).find('code');
		var lang = $lang;
		var template = $($el).find('.code_template').clone();
		template.show();
		coder.html(template);
	    $el.coder = CodeMirror.fromTextArea($coder.find('textarea')[0], {
				lineNumbers: true,
				matchBrackets: true,
				theme:'monokai'
		});
	    this.mode = $lang;
	    this.id = $coder.selector.split(' code')[0];
	    setMode(this.coder, this.mode);
	}

var block = function($lang){
	$blockID++;
	this.BlockElement = '<div class="block" id="block-'+$blockID+'"><div class="snapper top '+$lang+'"></div><header><div class="type '+$lang+'"></div><h1>Name</h1><input type="text" name="module-name"><div class="close open">-</div></header><code lang=javascript></code><div class="code_template" style="display: none;"><textarea></textarea></div><div class="snapper bottom '+$lang+'"></div></div>';
	$('.editor').append(this.BlockElement);
	var $arguments = startSetup(this.BlockElement,$lang);
};

<div class="box">Box</div>

.box{
  background: red;
  padding: 20px;
}

$('document').ready(function(){
  $('.block').click(function(){
  	alert();
  })
});


var $js = '<script>'+$content+'</script>';
		$('#output').contents().find('html>body').append($js);

*/


var insertContent = function ($mode, $content) {
	console.log($mode);
	if($mode === 'html' ){
		var $html = $content;
		$('#output').contents().find('html>body').append($html);
	}
	if($mode === 'sass'){
		var $css = '<style rel="stylesheet" type="text/css">'+$content+'</style>';
		$('#output').contents().find('html>head').append($css);
	}
	if($mode === 'javascript'){
		var $output = document.getElementById("output");

		//jquery
		var scriptJQuery = $output.contentWindow.document.createElement("script");
		scriptJQuery.type = "text/javascript";
		scriptJQuery.src = '//code.jquery.com/jquery-1.11.0.min.js';
		$output.contentWindow.document.body.appendChild(scriptJQuery);

		var scriptContent = $output.contentWindow.document.createElement("script");
		scriptContent.type = "text/javascript";
		scriptContent.innerHTML = $content;
		$output.contentWindow.document.body.appendChild(scriptContent);
		
	}
	else{
		return false;
	}
	
}

/*
	$('.CodeMirror').each(function(){
		$(this).on('change',function(){
			var $id = $(this).attr('id');//.$blockID;
	    	var timer = timeDiff();
	    	if(timer){		
	    		
	    	}
	    	else{
	    		var $content = this.getValue();

	    		console.log(this.mode,this.id,$content);
				insertContent(this.mode,$content);	    		
	    	}	    	
		})
	});
*/
	/*
	this.coder.on('change',function(){
    	var $id = $(this).attr('id');//.$blockID;
    	var timer = timeDiff();
    	if(timer){		
    		
    	}
    	else{}
    	var $content = this.coder.getValue();

    	console.log(this.mode,this.id,$content);
		insertContent(this.mode,$content);
    });
*/

/*
var startSetup = function($el,$lang){
		//dots
		jsPlumbSetup($el);
		setupCodeMirror($lang);

	$('.block').draggable({
		handle: 'header',
		cursor:'move',
		containment: '.editor',
		snap: '.block',
		snapMode:'outer',
		start: function(e){
			$('.last').removeClass('last');
			$(this).addClass('last');
		},
		drag:function(e){
			jsPlumb.repaintEverything();

	    	   	$(this).find('._jsPlumb_endpoint_anchor_').each(function(i,e){ 
                    if($(e).hasClass("connect"))
                        jsPlumb.repaint($(e).parent());
                    else
                        jsPlumb.repaint($(e));
				});										
            },
		stop: function(event, ui) {

	        var snapped = $(this).data('draggable').snapElements;

	        var snappedTo = $.map(snapped, function(element) {
	        	var $target = element.snapping ? element.item : null;
	        	
	        	if($target!=null){
	        		var $id = $($target).parent().attr('id');

	        		//console.log($id);
	        	}
	        	//console.log( $id )
	            //return 
	        });
    	}
	}).resizable({ minHeight: 70, minWidth : 120 });

}; // end of startSetup
*/
$(document).ready(function () {

/*

	(function( $ ){
	   $.fn.groupBlock = function() {
	      var $block = this;
	      //Button + | -
	      $closeButton = $block.find('.close');
	      $closeButton.addClass('closed').text('+');

	      //shrink block
	      $block.addClass('grouped');
	      $block.animate({height: '40px'},250,function(){
				$block.animate({width:'100%'},250);
			});
	      return this;
	   }; 
	})( jQuery );	
*/

/*
	$(document).on('click','.close',function(){
		var	$this = $(this);
		var $block = $(this).parent().parent();

		if ( $this.hasClass( 'open' ) ) {
			if($block.hasClass('group')){
				$block.find('.inner').slideUp();
			}
			$this.removeClass('open').addClass('closed').text('+');
			$block.animate({height: '40px'},250,function(){
				$block.animate({width:'150px'},250);
			});
		} else {
			if($block.hasClass('group')){
				$block.find('.inner').slideDown();
			}
			$this.removeClass('closed').addClass('open').text('-');
			$block.animate({width: '30vw'},250,function(){
				$block.animate({height: '20vw'},250);
			});
		}
		//jsPlumb.repaintEverything();
	});
*/
	$(document).on('click','.block',function(){
		$(this).toggleClass('active');
	});

	$(document).on('dblclick','.block header',function() {
		var $label = $(this).find('h1');
		var inputField = $(this).find('input[type="text"]');
		var inputText = $label.text();
		inputField.show().val(inputText).focus();
		inputField.keydown(function(e) {
		    if (e.keyCode === 13) {
		        var $text = $(this).val();
		        $label.text($text);
		        inputField.hide();
		    }
		});
	});

	//startSetup('.block');
	
	//Group Selected
	Mousetrap.bind('shift+g', function(e) {
	    e.preventDefault();
	    $.event.trigger({
			type: "group",
			action:wrap
		});
	    
	    return false;
	});

	$(document).on('group',function(){
		var $selected = $('.block.active');
		if($selected.length>1){
			var $ids = [];
			var $count = 0;
			var $size = 40;
			$selected.each(function(){
				$count++;
				var $id = $(this).attr('id');
				//var $position = $(this).attr('style');
				var $newStyle = 'left:0px;'; 
				$(this).attr('style',$newStyle);
				//console.log($size);
				$ids.push($id);
			});
			var $attrID = $ids.join();
			var $inner = '<div class="inner"></div>';
			var $header = "<header><div class='type group'></div><h1>Group</h1><input type='text' name='module-name'><div class='close open'>-</div></header>";
			var $group = "<div class='group' data-ids='"+ $attrID + "'></div>";
			var $innerGroup = $selected.wrapAll($group).groupBlock();
			$innerGroup.wrapAll($inner);

			var newGroup = $('.group[data-ids="'+$attrID+'"]');
				newGroup.height(($count+1) * $size + (($count+1) * 10) + 50);
			var newGroupInner = newGroup.find('.inner');
				newGroup.prepend($header);

			newGroupInner.sortable();
			$selected.draggable({
				connectToSortable: newGroupInner
			});
			
			newGroup.draggable({
			}).resizable();
			
			newGroupInner.disableSelection();
			//console.log($ids);
		
			//startSetup(newGroup,'group');
		}
	});
	// addBlock
	
	//Right Mouse event
	var $id = 0;
	//JS
	Mousetrap.bind(['shift+j','command+j'], function(e) {
	    e.preventDefault();
	    $id++;
		Block($id,'javascript');
	    //block('javascript');
	    return false;
	});

	//HTML
	Mousetrap.bind(['shift+h','command+h'], function(e) {
	    e.preventDefault();
		$id++;
		Block($id,'html');
	    //block('html');
	    return false;
	});
	//Css
	Mousetrap.bind(['shift+c','command+c'], function(e) {
	    e.preventDefault();
	    
		$id++;
		Block($id,'sass');
	    //block('sass');
	    return false;
	});

	$('.overlay .inner>div').click(function(){
		var $type = $(this).attr('data-type');
		if($type==='html'){
			block('html');
		}
		if($type==='sass'){
			block('sass');
		}
		if($type==='js'){
			block('js');
		}
		//console.log($type);
	});
});