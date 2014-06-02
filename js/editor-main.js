var setMode = function(cm, mode) {
	if(mode !== undefined) {
		var script = 'js/mode/'+mode+'/'+mode+'.js';
		$.getScript(script, function(data, success) {
			if(success) cm.setOption('mode', mode);
			else cm.setOption('mode', 'clike');
		});
	}
	else cm.setOption('mode', 'clike');
}
var $blockID = 0;
var block = function($lang){
	$blockID++;
	var BlockElement = '<div class="block" id="block-'+$blockID+'"><div class="snapper top '+$lang+'"></div><header><div class="type '+$lang+'"></div><h1>Name</h1><input type="text" name="module-name"><div class="close open">-</div></header><code lang=javascript></code><div class="code_template" style="display: none;"><textarea></textarea></div><div class="snapper bottom '+$lang+'"></div></div>';
	$('.editor').append(BlockElement);
	var $element = '#block-'+$blockID;

	startSetup($element,$lang);
}

var jsPlumbSetup = function ($el,$lang) {
	jsPlumb.Defaults.PaintStyle = { strokeStyle:"#222", lineWidth:2, };
	jsPlumb.Defaults.EndpointStyle = { radius:7, fillStyle:"#222" };
	jsPlumb.importDefaults({Connector : [ "Bezier", { curviness:10 } ]});

	var $block = $($el);
	var	$endpoint = $block.find('.type')[0]; 

	//jsPlumb.draggable($block,{containment:".editor", cursor: "move" });
	var anEndpointDestination = {
        endpoint: "Dot",
        isSource: true,
        isTarget: true,
        maxConnections: 1
    };

    jsPlumb.makeTarget($block[0], {
      anchor: 'BottomLeft',
      curviness:0,
      scope : $lang
    });

    jsPlumb.makeSource($endpoint, {
      parent: $block[0],
      anchor: 'TopRight',
      curviness:0,
      width:5,
      scope : $lang
    });
}

var startSetup = function($el){
		jsPlumbSetup($el);
	// $('.block').each(function() {
		var coder = $($el).find('code');
		var lang = coder.attr('lang');
		var template = $($el).find('.code_template').clone();

      	// Take the code and put it into the textarea.
		template.find('textarea').val(coder.html());
		template.show();
		coder.html(template);
      	
      	var cm = CodeMirror.fromTextArea(coder.find('textarea')[0], {
				lineNumbers: true,
				matchBrackets: true,
				theme:'monokai'
		});
      	setMode(cm, lang);

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

	        		console.log($id);
	        	}
	        	//console.log( $id )
	            //return 
	        });
    	}
	}).resizable({ minHeight: 70, minWidth : 120 });

}

$(document).ready(function () {
	(function( $ ){
	   $.fn.groupBlock = function() {
	      $block = this;
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
		jsPlumb.repaintEverything();
	});

	$(document).on('click','.block',function(){
		$(this).toggleClass('active');
	});

	$(document).on('dblclick','.block header',function() {
		var $label = $(this).find('h1');
		var inputField = $(this).find('input[type="text"]');
		var inputText = $label.text();
		inputField.show().val(inputText).focus();
		inputField.keydown(function(e) {
		    if (e.keyCode == 13) {
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

	function wrap(){
		alert();
	}

	$(document).on('group',function(e){
		var $selected = $('.block.active');
		if($selected.length>1){
			var $ids = [];
			var $count = 0;
			var $size = 40;
			$selected.each(function(){
				$count++;
				var $id = $(this).attr('id');
				$position = $(this).attr('style');
				$newStyle = 'left:0px;'; 
				$(this).attr('style',$newStyle);
				console.log($size);
				$ids.push($id);
			});
			$attrID = $ids.join();
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
			console.log($ids);
		
			startSetup(newGroup,'group');
		}		

			
			
			
	});
	// addBlock

	//JS
	Mousetrap.bind('shift+j', function(e) {
	    e.preventDefault();
	    block('js');
	    return false;
	});

	//HTML
	Mousetrap.bind('shift+h', function(e) {
	    e.preventDefault();
	    block('html');
	    return false;
	});
	//Css
	Mousetrap.bind('shift+c', function(e) {
	    e.preventDefault();
	    block('sass');
	    return false;
	});

	$('.overlay .inner>div').click(function(){
		var $type = $(this).attr('data-type');
		if($type=='html'){
			block('html');
		}
		if($type=='sass'){
			block('sass');
		}
		if($type=='js'){
			block('js');
		}
		console.log($type);
	})
});