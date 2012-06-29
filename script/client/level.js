/**
 * Builds The Game Level
 */
var level = function(){
	// var space;
	// var middleDensity = 40;			// Density of red boxes in the middle of the map
	var themeColor = "blue";				// Color of the map
	var obstacleAlpha = 0.35;
	var decorAlpha = 0.05;
	
	
	var build = function(levelLayer, space){
		// Black background
	    var background = new Kinetic.Rect({
	    	name: "Background",
	        x: 0,
	        y: 0,
	        width: space.offsetWidth,
	        height: space.offsetHeight,
	        fill: "black",
	        stroke: "black",
	        strokeWidth: 10,
	        alpha: 1
		});
	    // Add the background to the levelLayer
	    levelLayer.add(background);
	    
	    // Background grid image
	    var imageObj = new Image();
	    imageObj.onload = function(){
	        var image = new Kinetic.Image({
	            name: "Grid",
	            x: 0.0,
	            y: 0.0,
	            image: imageObj,
	            width: space.offsetWidth,
	            height: space.offsetHeight,
	            alpha: 0.22
	        });
	        
	        // add the shape to the levelLayer after loading is complete
	        levelLayer.add(image);
	        
	        var theGrid = levelLayer.get('.Grid');				// Move the shape down the levelLayer
	        theGrid[0].moveToBottom();
	        var theBackground = levelLayer.get('.Background');	// Move down
	        theBackground[0].moveToBottom();
	        
	        levelLayer.draw();
	    };
	    imageObj.src = "asset/BackgroundGrid.jpg";
	    
	    var leftBox = new Kinetic.Rect({
	    	name: "LeftBox",
	    	x: 200,
	    	y: 500,
	    	width: 100,
	    	height: 200,
	    	fill: themeColor,
	    	stroke: themeColor,
	    	strokeWidth: 7,
	    	alpha: obstacleAlpha
	    });
	    
	    var topBox = new Kinetic.Rect({
	    	name: "TopBox",
	    	x: 500,
	    	y: 200,
	    	width: 200,
	    	height: 100,
	    	fill: themeColor,
	    	stroke: themeColor,
	    	strokeWidth: 7,
	    	alpha: obstacleAlpha
	    });
	    
	    var rightBox = new Kinetic.Rect({
	    	name: "RightBox",
	    	x: 900,
	    	y: 500,
	    	width: 100,
	    	height: 200,
	    	fill: themeColor,
	    	stroke: themeColor,
	    	strokeWidth: 7,
	    	alpha: obstacleAlpha
	    });
	    
	    var bottomBox = new Kinetic.Rect({
	    	name: "BottomBox",
	    	x: 500,
	    	y: 900,
	    	width: 200,
	    	height: 100,
	    	fill: themeColor,
	    	stroke: themeColor,
	    	strokeWidth: 7,
	    	alpha: obstacleAlpha
	    });
	    
	    levelLayer.add(topBox);
	    levelLayer.add(bottomBox);
	    levelLayer.add(leftBox);
	    levelLayer.add(rightBox);
	    
	    /**
	     * Diagonal upwards box loop
	     */
	    var increment = 100;
	    for (var i = 0, l = 12; i < l; i++){
	        var box = new Kinetic.Rect({
	            x: 0 + (i * increment),
	            y: 0 + (i * increment),
	            width: 100,
	            height: 100,
	            fill: themeColor,
	            stroke: themeColor,
	            strokeWidth: 1,
	            alpha: decorAlpha
	      	});
	        levelLayer.add(box);
		}
		
		/**
		 * Diagonal downwards
		 */
		for (var i = 0, l = 12; i < l; i++){
	        var box = new Kinetic.Rect({
	            x: 0 + (i * increment),
	            y: 1100 - (i * increment),
	            width: 100,
	            height: 100,
	            fill: themeColor,
	            stroke: themeColor,
	            strokeWidth: 1,
	            alpha: decorAlpha
	      	});
	        levelLayer.add(box);
		}
	};
	
	return{
		build: build
	}
	
}();