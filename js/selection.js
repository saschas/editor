var getSelected = function(){
	var t = '';
	if(window.getSelection){
		t = window.getSelection();
	}else if(document.getSelection){
		t = document.getSelection();
	}else if(document.selection){
		t = document.selection.createRange().text;
	}
	return t;
}

var contextMenuCode = function($selection,$text,$x,$y){

	console.log($selection);

	var $this = $('#block-'+$blockID);
	var menu = document.createElement('div');
		menu.setAttribute('class','contextmenuCode');
		menu.style.left = $x + 'px';
		menu.style.top = $y + 'px';

	var $createLabel = document.createElement('div');
		$createLabel.setAttribute('class','option');
		$createLabel.innerHTML = 'Add label...';
		$createLabel.addEventListener('click',function(){
			console.log($blockID,$text);

			var $input = document.createElement('input');
			var $inputLabel = document.createElement('label');
				$inputLabel.innerHTML = $text;
				$inputLabel.appendChild($input);
					
				if(!$this.hasClass('labeled')){
					var $labelHolder = document.createElement('div');
						$labelHolder.setAttribute('class','labelHolder');
					$this.addClass('labeled');

					$labelHolder.appendChild($inputLabel);
					$this.append($labelHolder);
				}
				else{
					$this.find('.labelHolder').append($inputLabel);
				}			
		});

		menu.appendChild($createLabel);
		document.body.appendChild(menu);
}

var doSelected = function(event){

	var $x = event.pageX;
	var $y = event.pageY;
	var $selection = this;

	var sText = getSelected();

	document.activeElement.innerHTML = document.activeElement.innerHTML.replace('sText','<span>'+sText+'</span>')
	//wrapAll('<div class="labeledText"></div>');

	if(sText!=''){
		$selectedText = (''+sText);
	}


	contextMenuCode($selection,$selectedText,$x,$y);
	console.log($selection,$x,$y,$selectedText);
	return false;
}

$(document).on("contextmenu",'.block code',function(e){
    doSelected(e);
    return false;
});
						
		