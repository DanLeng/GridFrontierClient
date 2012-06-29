
/**
 * Class State
 */

(function()
{
	State = function(timeStamp, frame, x, y, vx, vy, rot)
	{
     	this.timeStamp = timeStamp;
     	this.frame = frame;
     	this.x = x;
     	this.y = y;
     	this.vx = vx;
     	this.vy = vy;
     	this.rot = rot;

    	return this;
   	};

   	State.prototype ={
       	timeStamp: 0,
       	frame: 0,
       	x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rot: 0
   	};
})();