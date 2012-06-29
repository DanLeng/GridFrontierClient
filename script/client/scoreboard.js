/**
 * Messenger class
 */
var scoreboard = function(){
	
	function update(localPlayer, remotePlayers){
		var scores = [];
		var tbl_body = "";
		
		// Populate the scores array
		scores.push({
			name: localPlayer.getName().attrs.text,
			score: localPlayer.getScore()
		});
		for (var i = 0, l = remotePlayers.length; i < l; i++){
			scores.push({
				name: remotePlayers[i].getName().attrs.text,
				score: remotePlayers[i].getScore()
			});
		}
		
		// Sorting the array by selection sort
		var min;
		for (var i = 0, l = scores.length - 2; i <= l; i++){
			min = i;
			for (var j = 1, k = scores.length - 1; j <= k; j++){
				if (scores[j].score > scores[min].score){
					min = j;
				}
				// Swap scores[i] and scores[min]
				var temp = scores[i];
				scores[i] = scores[min];
				scores[min] = temp;
			}
		}
		
		// Create the table format
		for (var i = 0, l = scores.length; i < l; i++){
			var tbl_row = "";
			
			// Put the local player's name in another color
			if (scores[i].name == localPlayer.getName().attrs.text){
				tbl_row += "<td style=\"color:yellow;\">" + scores[i].name + "</td>";
			}else{
				tbl_row += "<td>" + scores[i].name + "</td>";
			}
			tbl_row += "<td>" + scores[i].score + "</td>";
			
			tbl_body += "<tr>" + tbl_row + "</tr>";
		}
		
		// Finally apply the new html
		$('#ScoreBoard tbody').html (tbl_body);
	};
	
	return{
		update: update
	}
}();