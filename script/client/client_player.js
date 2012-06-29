/**
 * Client-side Player class
 * @class Player
 */

var Player = function(theGraphic, theRotation, theVector, theName, theScore){
	// Attributes
	var graphic = theGraphic,		// Kinetic object. Contains the X and Y position values
		rotation = theRotation,
		vector = theVector,
		name = theName,				// Kinetic object
		score = theScore,			// Number of kills
		
		id = 0,
		alive = true,
		thrusting = false,
		
		THRUST_SPEED = 0.03,
		MAX_PLAYER_VELOCITY = 1.5,
		ROTATION_SPEED = MAXRAD/120,
		PLAYER_RADIUS = 11;
		
	var thruster = new Kinetic.Polygon({
        x: graphic.getX() - vector.x,
        y: graphic.getY() - vector.y,
        points: [{
            x: -11,
            y: 3
        }, {
            x: -18,
            y: 0
        }, {
            x: -11,
            y: -3
        }],
        centerOffset:{
            x: 0,
            y: 0
        },
        stroke: "white",
        strokeWidth: 2,
        alpha: 0.95,
        shadow:{
	      	color: 'white',
	      	blur: 10,
	      	offset: [1, 1],
	      	alpha: 0.5
	    }
    });
		
	
	// Initialize rotation
	if (rotation != 0){
		//console.log("Not equals zero.");
		graphic.rotate(rotation);
	}
	
	// Getters and setters
	var getName = function(){
		// Returns the name graphic
		return name;
	};
	var getGraphic = function(){
		return graphic;
	};
	var getX = function(){
		return graphic.getX();
	};
	var getY = function(){
		return graphic.getY();
	};
	var getVector = function(){
		return vector;
	};
	var getRotation = function(){
		return graphic.getRotation();
	};
	var getRadius = function(){
		return PLAYER_RADIUS;
	};
	var getThrusting = function(){
		return thrusting;
	};
	var getThrustArt = function(){
		return thruster;
	}
	var getAlive = function(){
		return alive;
	};
	
	var setX = function(newX){
		graphic.setX(newX);
	};
	var setY = function(newY){
		graphic.setY(newY);
	};
	var setVector = function(newVector){
		vector = newVector;
	};
	var setRotation = function(newRotation){
		graphic.setRotation(newRotation);
	};
	var setThrusting = function(thrustState){
		thrusting = thrustState;
	};
	
	var thrust = function(){
		thrusting = true;
		
		// Create a new vector
		var thrustVector = new Vector(THRUST_SPEED, 0.0);
		
		// Rotate the vector to face current Player's rotation
		thrustVector.rotate(getRotation());
		
		// Finally add the vector to the player
		vector.add(thrustVector);
		
		// Player should not exceed MAX VELOCITY. If over max velocity, scale the 
		// vector down. (Rather than not adding, or else player can't change directions
		//	at max velocity)
        if (vector.length() > MAX_PLAYER_VELOCITY)
        {
           	vector.scale(MAX_PLAYER_VELOCITY / vector.length());
        }
	};
	
	var stopThrust = function(){
		thrusting = false;
		vector.set(new Vector(0, 0));
	};
	
	var animateThrust = function(){
		thruster.attrs.strokeWidth = randomInt(1, 4);
		thruster.show();
		
		// Rotate the thrust kinetic obj to follow the player
		thruster.setRotation(getRotation());
		
		// Move the thruster
		thruster.setX(getX());
		thruster.setY(getY());
	};
	
	var animateName = function(){
		// Move the name
		name.setX(getX() + 10);
		name.setY(getY() + 26);
	};
	
	var stopAnimateThrust = function(){
		thruster.hide();
	};
	
	// Update graphic location
	var move = function(x, y){
		graphic.setX(x);
		graphic.setY(y);
	};
	
	var predictMove = function(){
		// Locally move the player based on local vector. (Prediction)
		if (vector.length() > 0){
			graphic.move(vector.x, vector.y);
    	}
	};
	
    // Rotate the player's graphic.
    var rotate = function(direction){
    	if (direction === "left"){
            graphic.rotate(-ROTATION_SPEED);
            
        }else if (direction === "right"){
          	graphic.rotate(ROTATION_SPEED);
        }
    	//console.log("Rotated player to value:" + graphic.getRotation());
    	normalizeRotation(graphic);
    };
    
    var rotateTo = function(amount){
    	graphic.setRotation(amount);
    	normalizeRotation(graphic);
    };
    
    // *PRIVATE*
    // Normalizes the rotation values of the Kinetic Object itself. (>360, <-360)
    function normalizeRotation(kineticObj){
		var rotationValue = kineticObj.getRotation();
		
		if (rotationValue > MAXRAD){
			kineticObj.setRotation(rotationValue - MAXRAD);
		
		}else if (rotationValue < -MAXRAD){
			kineticObj.setRotation(rotationValue + MAXRAD);
		
		}else if (rotationValue === MAXRAD || rotationValue === -MAXRAD){
			kineticObj.setRotation(0);
		}
	};
		
	// This player is killed!
	var kill = function(){
		alive = false;
		vector = new Vector (0,0);
		graphic.setAlpha(0.1);
		name.setAlpha(0.1);
		setThrusting(false);
	};
	
	var revive = function(newX, newY){
		graphic.hide();
		name.hide();
		vector = new Vector (0,0);
		
		// Reset the player ship's graphics position
		graphic.setX(newX);
		graphic.setY(newY);
		graphic.setAlpha(1);
		
		// Reset the player name's graphic position
		animateName();
		name.setAlpha(1);
		
		var t = window.setTimeout(function(){
					graphic.show();
					name.show();
					clearTimeout(t);
					alive = true;
				}, 1000);
	};
	
	
	// Resets the renderingLayer to the position of the player (Camera reset)
	var scroll = function(levelLayer, renderingLayer, viewport){
		// The layer's current position
		var currentX = renderingLayer.getX();
		var currentY = renderingLayer.getY();
		
		// The new position to move to
		var targetX = -(getX() - (viewport.offsetWidth/2));
		var targetY = -(getY() - (viewport.offsetHeight/2));
		
		// Amount to move
		var toMoveX = targetX-currentX;
		var toMoveY = targetY-currentY;
		
		levelLayer.move(toMoveX, toMoveY);
		renderingLayer.move(toMoveX, toMoveY);
	};
	
	var addScore = function(add){
		score += add;
	};
	
	var getScore = function(){
		return score;
	};
	
	return{
		// Expose public functions
		id: id,
		getName: getName,
		getX: getX,
        getY: getY,
        getVector: getVector,
        getRotation: getRotation,
        getRadius: getRadius,
        getThrusting: getThrusting,
        getAlive: getAlive,
        
        getGraphic: getGraphic,
        getThrustArt: getThrustArt,
        
        animateThrust: animateThrust,
        stopAnimateThrust: stopAnimateThrust,
        
        animateName: animateName,
        
        setX: setX,
        setY: setY,
        setVector: setVector,
        setRotation: setRotation,
        setThrusting: setThrusting,
		
		thrust: thrust,
		stopThrust: stopThrust,
		rotate: rotate,
		rotateTo: rotateTo,
		predictMove: predictMove,
		move: move,
		
		kill: kill,
		revive: revive,
		scroll: scroll,
		
		addScore: addScore,
		getScore: getScore
	}
};
