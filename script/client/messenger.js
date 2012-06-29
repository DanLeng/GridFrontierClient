
/**
 * Messenger class
 */
var messenger = function(){
	var SHOW_DURATION_MSG = 8000,		// Duration to show the element when a new message comes in
		SHOW_DURATION_CHAT = 10000,
		timeLastShown_Msg = 0,			// The last time we shown the #Message element
		timeLastShown_Chat = 0;			// The last time we shown the #Chat element
		
	var funnyMsg = [
		"k recycled v",				// k for killer, v for victim
		"k administered death to v",
		"k destroyed v",
		"k burned a hole through v",
		"k rained destruction on v",
		"k's lasers melted v",
		"k obliterated v",
		"k utterly destroyed v",
		"k squashed v like a bug",
		"k righteously executed v",
		"k ripped v apart"
	];
	
	var suicideMsg = [
		"v self-destructed",
		"v is no more",
		"v committed suicide",
		"v went down alone",
		"v had an accident"
	];
	
	var doubleSuicideMsg = [
		"k and v are no more",
		"k and v committed suicide",
		"k and v had an accident",
		"k and v couldn't see each other"
	];
	
	// Checks if we should hide the element or not.
	function check(element){
		if (element.is(":visible") == true){
			var type = element.attr('id');
			var currentTime = new Date().valueOf();
			
			if (type == 'Message'){
				if (currentTime > (timeLastShown_Msg + SHOW_DURATION_MSG)){
					element.hide();
				}
				
			}else if (type == 'Chat'){
				if (currentTime > (timeLastShown_Chat + SHOW_DURATION_CHAT)){
					element.hide();
				}
			}
		}
	}
	
	// Writes a message to the #Message element
	function writeMsg(messageArea, messageType, killer, victim){
		if (messageArea.is(":visible") == false){	// Checks for display:[none|block]
			messageArea.val("");
			messageArea.show();
		}
        
        var msg, l;
        if (messageType == "kill"){
        	l = randomInt(0, (funnyMsg.length - 1));
        	msg = funnyMsg[l];
        	msg = msg.replace(/[k]/, killer);
        	msg = msg.replace(/[v]/, victim);
        	msg = "\n" + msg;		// Append newline
        	
        }else if (messageType == "suicide"){
        	l = randomInt(0, (suicideMsg.length - 1));
        	msg = suicideMsg[l];
        	msg = msg.replace(/[v]/, victim);
        	msg = "\n" + msg;		// Append newline
        	
        }else if (messageType == "double suicide"){
        	l = randomInt(0, (doubleSuicideMsg.length - 1));
        	msg = doubleSuicideMsg[l];
        	msg = msg.replace(/[k]/, killer);
        	msg = msg.replace(/[v]/, victim);
        	msg = "\n" + msg;		// Append newline
        }
        
        var curText = messageArea.val();
       	messageArea.val(curText + msg);		// Output to Message
        timeLastShown_Msg = new Date().valueOf();
        messageArea.scrollTop(99999);
	};
	
	// Writes a message to the #Chat element
	function writeChat(chatArea, name, msg){
		if (chatArea.is(":visible") == false){		// Checks for display:[none|block]
			chatArea.val("");
			chatArea.show();
		}
		
		var curText = chatArea.val();
       	chatArea.val(curText + "\n" + name + ": " + msg);			// Output to Chat
       	timeLastShown_Chat = new Date().valueOf();
        chatArea.scrollTop(99999);
	}
	
	return{
		check: check,
		writeMsg: writeMsg,
		writeChat: writeChat
	}
	
}();