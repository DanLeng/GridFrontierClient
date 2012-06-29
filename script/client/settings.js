
/**
 * Game Settings
 */
var settings = function(){
	var interp;			// Interpolate?
	
	function getInterp(){
		//interp = document.getElementById("Interpolation").checked;
		//return interp;
		return true;
	};
	
	return{
		getInterp: getInterp
	}
	
}();
