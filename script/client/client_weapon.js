/**
 * Laser (Fired projectiles)
 * @class Laser
 * 
 */
var Laser = function(theId, theGraphic, theRotation, theVector, theOwner)
{
	var id = theId,
		graphic = theGraphic,
		rotation = theRotation,
		vector = theVector,
		owner = theOwner,				// ID of player who fired
		
		alive = true,					// True to render, false to remove
	
		range = 300.0,					// Maximum laser flight distance
		MAX_LASER_VELOCITY = 5.0,		// Captain Obvious?
		LASER_RADIUS = 1.5;
	
	// Init
	var init = function(){
		// Rotate the graphic to follow the Laser's facing direction
		graphic.setRotation(rotation);
	};
	init();
	
	var getOwner = function (){
		return owner;
	};
	
	var getX = function(){
		return graphic.getX();
	};
	
	var getY = function(){
		return graphic.getY();
	};
	
	var getGraphic = function(){
		return graphic;
	};
	
	var getVector = function(){
		return vector;
	};
	
	var getRotation = function(){
		return rotation;
	};
	
	var getAlive = function(){
		return alive;
	};
	
	var setAlive = function(status){
		alive = status;
	};
	
	var move = function(){
		// If we have not exceeded the laser's range
		if (range > 0){
			// Scale the Laser's vector to avoid going over the Max Velocity
			if (vector.length() > MAX_LASER_VELOCITY)
            {
               	vector.scale(MAX_LASER_VELOCITY / vector.length());
            }
            
            // Move the graphic
			graphic.move(vector.x, vector.y);
			range -= vector.length();
		
		}else{
			// Set it as dead
			alive = false;
		}
	};
	
	return{
		id: id,
		
		getOwner: getOwner,
		getX: getX,
		getY: getY,
		getGraphic: getGraphic,
		getVector: getVector,
		getRotation: getRotation,
		getAlive: getAlive,
		setAlive: setAlive,
		move: move
	}
};