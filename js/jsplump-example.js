
        
jsPlumb.ready(function () {
	
    //FIX DOM:
    $(("#container1"))[0].innerHTML = $(("#container0"))[0].innerHTML;

    //all windows are draggable
    jsPlumb.draggable($(".window"));


    var anEndpointDestination = {
        endpoint: "Dot",
        isSource: true,
        isTarget: true,
        maxConnections: 1,
		anchor:"AutoDefault"
    };



    //Add additional anchor
    $(".button_add").live("click", function () {

        var parentnode = $(this)[0].parentNode.parentNode;


        
        jsPlumb.addEndpoint(
            parentnode,
            anEndpointDestination
        );

    });
    
    //Remove anchor 
    $(".button_remove").live("click", function () {

        var parentnode = $(this)[0].parentNode.parentNode;

        //get list of current endpoints
        var endpoints = jsPlumb.getEndpoints(parentnode);
        
        //remove last one
        
        if (endpoints.length > 0) {
            jsPlumb.deleteEndpoint(endpoints[endpoints.length - 1]);
        }
    });
    

    //adds new window
    $(".button_add_window").click(function () {

        var id = "dynamic_" + $(".window").length;
        
        //create new window and add it to the body
        $('<div class="window" id="' + id + '" >').appendTo('body').html($(("#container0"))[0].innerHTML);

        //set jsplumb properties
        jsPlumb.draggable($('#' + id));
    });
});
