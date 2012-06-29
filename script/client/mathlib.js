/*
 * Constants
 */
var DEG = 180.0/Math.PI;
var MAXDEG = 360.0;
var RAD = Math.PI/180.0;
var MAXRAD = 360.0*RAD;

var PI = Math.PI;
var TWOPI = Math.PI*2;
var ONEOPI = 1.0 / Math.PI;
var PIO2 = Math.PI/2;
var PIO4 = Math.PI/4;
var PIO8 = Math.PI/8;
var PIO16 = Math.PI/16;
var PIO32 = Math.PI/32;

/*
 * Quick Math functions
 */
var Rnd = Math.random;
var Sin = Math.sin;
var ASin = Math.asin;
var Cos = Math.cos;
var ACos = Math.acos;
var Sqrt = Math.sqrt;
var Pow = Math.pow;
var Floor = Math.floor;
var Atan2 = Math.atan2;
var Ceil = Math.ceil;
var Round = Math.round;
var Abs = Math.abs;

/**
 * Vector
 * @class Vector
 *
 */
(function()
{
	Vector = function(x, y)
	{
     	this.x = x;
     	this.y = y;

    	return this;
   	};

   	Vector.prototype ={
       	x: 0,
        y: 0,

      	clone: function()
      	{
      		return new Vector(this.x, this.y);
      	},

      	norm: function()
      	{
         	var len = this.length();
         	if (len === 0){
         		this.x = 0;
         		this.y = 0;
         	}else{
         		this.x /= len;
         		this.y /= len;
         	}

         	return this;
      	},

      	set: function(v)
      	{
         	this.x = v.x;
         	this.y = v.y;
         	return this;
      	},

      	add: function(v)
      	{
         	this.x += v.x;
         	this.y += v.y;
         	return this;
      	},

      	sub: function(v)
      	{
       	  	this.x -= v.x;
      	  	this.y -= v.y;
       	  	return this;
      	},

      	dot: function(v)
      	{
         	return this.x * v.x + this.y * v.y;
      	},
      	
      	scalePercent: function(v)
	    {
	    	this.x *= v.x;
	    	this.y *= v.y;
	        return this;
	    },

      	length: function()
      	{
         	return Sqrt(this.x * this.x + this.y * this.y);
      	},

      	// Angle of the vector
      	theta: function()
      	{
         	return Atan2(this.y, this.x);
      	},

      	thetaTo: function(vec)
      	{
         	// calc angle between the two vectors
         	var v = this.clone().norm(),
             	w = vec.clone().norm();
         	return Math.acos(v.dot(w));
      	},

      	thetaTo2: function(vec)
      	{
         	return Atan2(vec.y, vec.x) - Atan2(this.y, this.x);
      	},

      	rotate: function(a)
      	{
      		var ca = Cos(a),
      	    	sa = Sin(a);
      		with (this)
      		{
      			var rx = x*ca - y*sa,
      		    	ry = x*sa + y*ca;
      			x = rx;
      			y = ry;
      		}
      		return this;
      	},

      	invert: function()
      	{
         	this.x = -this.x;
         	this.y = -this.y;
         	return this;
      	},

      	scale: function(s)
      	{
        	this.x *= s;
         	this.y *= s;
         	return this;
      	}
   	};
})();

/**
 * Return a random integer value between low and high values
 */
function randomInt(low, high)
{
   return ~~(Rnd() * (high - low + 1) + low);
}


function weightedRandom(weight)
{
   var input = Rnd();
   if (input < 0.5) return 1 - Math.pow(1 - input, weight !== undefined ? weight : 2) / 2;
   return 0.5 + Math.pow((input - 0.5) * 2, weight !== undefined ? weight : 2) / 2;
}

// Finds a point on a line AB
// Returns vector C, given A(xA, yA) and B(xB, yB) and the proportional distance m
function pointOnLine(xA, yA, xB, yB, m)
{
	// A = A + m(B - A)
	var vectA = new Vector(xA, yA);
	var vectB = new Vector(xB, yB);
	vectB.sub(vectA);
	vectB.x *= m;
	vectB.y *= m;
	vectA.add(vectB);
	
	return vectA;
}