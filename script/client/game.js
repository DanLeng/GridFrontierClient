
var game = function(){
	var socket,                 	// socket.io object
	 	space,                      // Playable area of game
	 	viewport,                  	// Viewport/Viewable area of the screen
	 	
	 	stage, 						// Kinetic Stage obj
	 	titleLayer,					// Title layer
	 	levelLayer,					// Layer for level
	 	renderingLayer,     		// Layer for game entities (ships, thrust, player names)
	 	
	 	connection,
	 	
	 	messageArea,				// Message box, used for displaying Kill messages (Element: '#Message')
	 	chatArea,					// Chat box for displaying player chat (Element: '#Chat')
	 	scoreBoard,					// The table element which is the scoreboard (Element: '#ScoreBoard')
	 	chatMode,					// Flag to check if player is in chat mode or not
	 	
	 	localPlayer,				// This client
	 	localPlayerName,			// Player name
		localInputState,			// Array of this client's INPUT states at each client tick
		LOCAL_INPUT_STATE_BUFFER,	// Amount of states to store in buffer
	 	
	 	remotePlayers,    			// Array of all other clients
	 	lasers,						// Array of lasers currently in the game
		
		input,						// Input keys object
		
		totalPing, 					// Current client-server latency
		currentTick,				// Current client render frame
		
		TICK_RATE,					// Client-side tick rate
		snapShots,					// Array of world snapshots from server
		SNAPSHOT_BUFFER,			// Amount of snapshots to store in buffer
		startInterp,				// Flag to start interpolating entities (true/false)
		LERP_PERIOD;				// Lerp amount / Amount of time to render backwards
	
	/**
	 * Initialize game variables and builds the level (No connection to server yet)
	 */
	function init(){
		space = document.getElementById('Space');
		viewport = document.getElementById("Viewport");
		
		// Initialize elements
		scoreBoard = $('#ScoreBoard');
		scoreBoard.hide();
		
		messageArea = $('#Message');
		messageArea.val("");
		
		chatArea = $('#Chat');
		chatArea.val("");
		chatMode = false;

		connection = "";
		
		// Hide in-game elements
		$('#ChatBox').hide();
		$('#Hud').hide();
		$('#Ping').hide();
		
		// Create the stage, with the drawing area equal to the size of our viewport.
		stage = new Kinetic.Stage({
	    	container: "Space",
	        width: viewport.offsetWidth,
	        height: viewport.offsetHeight
        });
        
        titleLayer = new Kinetic.Layer({
        	name: "TitleLayer",
        	x: 0,
        	y: 0
        });
        
        levelLayer = new Kinetic.Layer({
	    	name: "LevelLayer",
	    	x: 0,
	    	y: 0
	    });
	    
	    renderingLayer = new Kinetic.Layer({
	    	name: "RenderingLayer",
	    	x: 0,
	    	y: 0
	    });
	    
	    //gameStateLayer = new Kinetic.Layer();
	   	
	   	// Add all layers to the stage
	   	stage.add(levelLayer);
	    stage.add(renderingLayer);
	    stage.add(titleLayer);
		
		//localPlayer = null;
		localPlayerState = {
		    playerDead: false
		};
		localInputState = [];
		LOCAL_INPUT_STATE_BUFFER = 1000;
		remotePlayers = [];
		lasers = [];
		input = {
		    up: false,
		    down: false,
		    left: false,
		    right: false,
		    space: false,
		    graveaccent: false
		};
		
		TICK_RATE = 16.6;
		snapShots = [];
		currentTick = 0;
		SNAPSHOT_BUFFER = 50;		// Determines smoothness of interpolation!
		startInterp = false;
		LERP_PERIOD = 100;
		
		totalPing = 0;
		
	    level.build(levelLayer, space);
	    
		levelLayer.move(2000, 2000);
		renderingLayer.move(2000, 2000);
	};
	
	/**
	 * Draws the beautiful title text!
	 */
	function drawTitle(font){
		setTimeout(function(){
			var text = "Grid Frontier";
			var x = viewport.offsetWidth/2;
			var y = viewport.offsetHeight/2 - 140;
			var dist = 6;
			var ctx = titleLayer.getContext();
			
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			//var gradient = ctx.createLinearGradient(x, y, x + 100, y + 100);
			//gradient.addColorStop(0, "rgb(135, 206, 250)");
			//gradient.addColorStop(1, "rgb(0, 191, 255)");
			//ctx.fillStyle = gradient;
			
			for (var i = 0, l = 20; i < l; i++){
				//ctx.strokeStyle = "rgba("+randomInt(40,50)+", "+randomInt(40,50)+", "+randomInt(40,50)+", 1)";
				ctx.strokeStyle = "rgba(70, 130, 180, 0.1)";
				ctx.shadowColor = "rgba(70, 130, 180, 0.8)";
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowBlur = 5;
				ctx.font = "32pt " + font;
				ctx.strokeText(text, randomInt(x-dist, x+dist), randomInt(y-dist, y+dist));
			}
			
			ctx.shadowColor = "rgba(70, 130, 180, 0.8)";
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 10;
			ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
			ctx.font = "bold 32pt " + font;
			ctx.fillText(text, x, y);
		}, 2000);
		
		
	};
		
	/**
	 * Set keyboard events onKeyUp/onKeyDown
	 */
	function setEventHandlers(){
		document.onkeydown = function(e){
			// Get input only if the local player exists, and is not in Chat Mode
	        if (typeof localPlayer != "undefined" && !chatMode){
	        	if (localPlayer.getAlive()){
	        		if (e.keyCode == 38 || e.charCode == 119){
		                e.preventDefault();
		                e.stopPropagation();
		                input.up = true;
		            }
		            if (e.keyCode == 40 || e.charCode == 115){
		                e.preventDefault();
		                e.stopPropagation();
		                input.down = true;
		            }
		            if (e.keyCode == 37 || e.charCode == 97){
		                e.preventDefault();
		                e.stopPropagation();
		                input.left = true;
		            }
		            if (e.keyCode == 39 || e.charCode == 100){
		                e.preventDefault();
		                e.stopPropagation();
		                input.right = true;
		            }
		            if (e.keyCode == 32){
		                e.preventDefault();
		                e.stopPropagation();
		                input.space = true;
		            }
	        	}
	        	
	        	if (e.keyCode == 192){
	            	e.preventDefault();
	            	e.stopPropagation();
	            	input.graveaccent = true;
	            }
	        }
	    }
	    
	    document.onkeyup = function(e){
	    	if (!chatMode){
	    		if (e.keyCode == 38 || e.charCode == 119){
		            e.preventDefault();
		            //console.log("Input up false.");
		            input.up = false;
		        }
		        if (e.keyCode == 40 || e.charCode == 115){
		            e.preventDefault();
		            //console.log("Input up false.");
		            input.down = false;
		        }
		        if (e.keyCode == 37 || e.charCode == 97){
		            e.preventDefault();
		            //console.log("Input up false.");
		            input.left = false;
		        }
		        if (e.keyCode == 39 || e.charCode == 100){
		            e.preventDefault();
		            //console.log("Input up false.");
		            input.right = false;
		        }
		        if (e.keyCode == 32){
		            e.preventDefault();
		            //console.log("Input space false.");
		            input.space = false;
		        }
		        if (e.keyCode == 192){
	            	e.preventDefault();
	            	input.graveaccent = false;
	            }
	    	}
	    }
		
	    document.onkeypress = function(e){
	    	// Enter
	    	if (e.keyCode == 13){
            	e.preventDefault();
            	// Reset all input to false when in Chat Mode
            	input.up = false;
            	input.left = false;
            	input.right = false;
            	input.space = false;
            	
            	activateChat();
            }
	    }
	};
		
	/**
	 * Handle keyboard events
	 */
	function handleLocalPlayerEvents(tickTimeStamp){
		// Get input only when Player is alive, and the game allows it.
		if (localPlayer.getAlive()){
			if (input.up ||
				input.left ||
				input.right || 
				input.space) {
					
				if (input.up){
					localPlayer.thrust();			// Add thrust vector
					localPlayer.predictMove();		// Predict new position
				}
				if (input.left){
					localPlayer.rotate("left");		// Predict LEFT rotation
				}
				if (input.right){
					localPlayer.rotate("right");	// Predict RIGHT rotation
				}
				socket.emit("input", {
					time: tickTimeStamp,
					up: input.up,
					left: input.left,
					right: input.right,
					space: input.space
				});
			}
			
			if (!input.up){
				// If we are still thrusting, stop it. (No more player input detected!)
				if (localPlayer.getThrusting()){
					localPlayer.stopThrust();
					
					// Tell the server to stop the thrust too
					socket.emit("stop thrust player",{
						time: tickTimeStamp,
						x: localPlayer.getX(),
						y: localPlayer.getY()
					});
				}
			}
		}
	};
	
	/**
	 * Activates chat mode on client
	 */
	function activateChat(){
		var chatInput = $('#ChatInput');	// Input field element
		var chatBox = $('#ChatBox');		// Form element
		
		// If we are already in chat mode, send the input to server
		if (chatMode){
			chatMode = false;
			chatBox.hide();
			if (chatInput.val().length > 0){
				// Emit chat event to server
				socket.emit("chat", {
					msg: chatInput.val()
				});
			}
			
		}else{
			chatMode = true;
			// Show the form
			chatBox.show();
			// Reset the input field
			chatInput.val("");
			// Focus the cursor on the input
			chatInput.focus();
		}
	};
		
	/**
	 * Start ticking the client (Runs local game loop, samples input, handle lasers)
	 */
	function tickClient(){
		setInterval(function(){
			currentTick+=1;
	    	var tickTimeStamp = new Date().valueOf();
	    	
	    	// Handling local player input states
	    	if (typeof localPlayer != "undefined"){
	    		// Sample for inputs
	    		handleLocalPlayerEvents(tickTimeStamp);
	    		
	    		// Create a new state based on sampled inputs
	    		var state = new State(
	    			tickTimeStamp, 
		    		currentTick, 
		    		localPlayer.getX(), 
		    		localPlayer.getY(), 
		    		localPlayer.getVector().x,
		    		localPlayer.getVector().y,
		    		localPlayer.getRotation());
		    		
		    	// Push into array of states (Array = history of input states for local player)
	    		localInputState.push(state);
	    		if (localInputState.length > 1000){		// Delete states that are older that 250 frames
	    			localInputState.splice(0, 200);
	    		}
	    	}
	    	
	    	// Handling fired lasers
	    	if (lasers.length > 0){
	       		var lasersToRemove = [];
	       		for (var i = 0, l = lasers.length; i < l; i++){
	       			if (lasers[i].getAlive()){	// If laser is alive
	       				lasers[i].move();
	       			
	       			}else{
	       				lasersToRemove.push(i);
	       			}
	       		}
	       		if (lasersToRemove.length > 0){
	       			for (var j = 0, k = lasersToRemove.length; j < k; j++){
	       				if (typeof lasers[lasersToRemove[j]] != "undefined"){
	       					renderingLayer.remove(lasers[lasersToRemove[j]].getGraphic());
	       					// Remove dead lasers from the lasers array
	       					lasers.splice(lasersToRemove[j], 1);
	       				}
	       			}
	       		}
	       	}
	    }, TICK_RATE);
	};
	
	/**
	 * requestAnimFrame, scrolling the level, entity interpolation, 
	 * animate thrusters, player names, scoreboard show/hide
	 */
	function animate(){
		var timeStamp = new Date().valueOf();
		
	    if (typeof localPlayer != "undefined"){
	        if (localPlayer.getAlive()){
	        	// Scroll the layer when player is alive
	            localPlayer.scroll(levelLayer, renderingLayer, viewport);
	        }
	    	
	    	if (settings.getInterp()){
	    		// Calc render time. (Current time - lerp period)
	    		var renderTime = timeStamp - LERP_PERIOD;
	    		
	    		var snapShot1;
	    		var snapShot2;
	    		// Array of players from each snapshot
	    		var snapShot1Players;
	    		var snapShot2Players;
	    		// The percentage length to interpolate to
	    		var interpPercentage = 0.0;
	    		
	    		// Find the two snapshots that renderTime falls in-between
	    		var noOfSnapShots = snapShots.length;
	    		
	    		for (var i = 0, l = noOfSnapShots; i < l; i++){
	    			if (typeof snapShots[i+1] != "undefined"){
	    				// Get the two snapshots where renderTime falls between
	    				if (snapShots[i].time <= renderTime && renderTime <= snapShots[i+1].time){
    						snapShot1 = snapShots[i];
		    				snapShot1Players = snapShots[i].players;
		    				snapShot2 = snapShots[i+1];
		    				snapShot2Players = snapShots[i+1].players;
		    				
		    				interpPercentage = (renderTime - snapShot1.time)/(snapShot2.time - snapShot1.time);
		    				break;
		    			}
	    			}else{
	    				// If we run out of snapshots in the buffer
	    				//console.log("Not enough snapshots!");
	    			}
	    		}
	    		
	    		// If snapShot1/2Players is equals to " "
	    		if (typeof snapShot1Players != "undefined" && typeof snapShot2Players != "undefined"){
	    			// Compare positions of each player from snapShot1 and snapShot2
		    		for (var i = 0, l = snapShot1Players.length; i < l; i++){
		    			for (var j = 0, k = snapShot2Players.length; j < k; j++){
	    					if (snapShot1Players[i].id == snapShot2Players[j].id){
		    					var player = playerById(snapShot1Players[i].id);
								if (!player){
									//console.log("Interp: Player not found:"+snapShot1Players[i].id);
								
								}else{
									if(player.getAlive() == true){
										// Get the interpolated point between both snapshot positions of the player
		    							var interpPoint = pointOnLine(snapShot1Players[i].x, snapShot1Players[i].y, 
		    								snapShot2Players[j].x, snapShot2Players[j].y, interpPercentage);
										player.move(interpPoint.x, interpPoint.y);
										
										//var interpRadians = (snapShot2Players[j].rot - snapShot1Players[i].rot) * interpPercentage;
										var interpRadians = snapShot1Players[i].rot + ((snapShot2Players[j].rot - snapShot1Players[i].rot)*interpPercentage);
										//player.interpRotate(snapShot1Players[i].rot, snapShot2Players[j].rot, interpPercentage);
										player.getGraphic().setRotation(interpRadians);
										
										// Get the thrusting state from the snapshot
										if (snapShot1Players[i].thrusting){
											player.setThrusting(true);
										}else{
											player.setThrusting(false);
										}
									}
								}
								break;
		    				}else{
		    					continue;
		    				}
		    			}
					}
	    		}
	    	}
	    	
	    	/**
	    	 * Move local player name on screen
	    	 */
	    	localPlayer.animateName();
	    	
	    	/**
	    	 * Play thrust animations
	    	 */
	    	if (localPlayer.getThrusting()){
	    		localPlayer.animateThrust();
	    	}else{
	    		localPlayer.stopAnimateThrust();
	    	}
	    	
	    	if (remotePlayers.length > 0){
	    		for(var i = 0, l = remotePlayers.length; i < l; i++){
	    			if (typeof remotePlayers[i] != "undefined"){
	    				/**
	    				 * Move remote player names on screen
	    				 */
	    				remotePlayers[i].animateName();
	    				//console.log(remotePlayers[i].getThrusting());
	    				if (remotePlayers[i].getThrusting()){
	    					remotePlayers[i].animateThrust();
		    			}else{
		    				remotePlayers[i].stopAnimateThrust();
		    			}
	    			}
	    		}
	    	}
	    }
	    // Update the renderingLayer
	    renderingLayer.draw();
	    levelLayer.draw();
	    
	    // Check if we should hide or show the #Message and #Chat elements
	    messenger.check(messageArea);
	    messenger.check(chatArea);
	    
	    // Check if we should hide or show the #ScoreBoard element
	    if (input.graveaccent){
	    	if (!scoreBoard.is(':visible')){
	    		scoreBoard.show();
	    	}
	    }else{
	    	if (scoreBoard.is(':visible')){
	    		scoreBoard.hide();
	    	}
	    }
	    
		// Request a new animation frame using Paul Irish's shim
		window.requestAnimFrame(animate);
	};
	
	/**
	 * Initializes the game screen/HUD
	 */
	function initHUD(){
		// Disable login form items
		$("#Join").attr('disabled', 'disabled');
		$("#Playername").attr('disabled', 'disabled');
		
		// Hide login form
		$("#Play").hide('800');
		
		// Remove the title
		stage.remove(titleLayer);
		
		// Add borders to the viewport
  	 	var vp = $('#Viewport');
  	 	vp.css('border-color', 'white');
  	 	vp.css('outline', '1px solid white');
  	 	
  	 	// Show kills and ping elements on HUD
  	 	$('#Hud').show();
	    $('#Ping').show();
	    
	    // Start updating the HUD with data
	    updateHUD();
	};
	
	/**
	 * Updates HUD with new ping and kill data every 3 seconds
	 */
	function updateHUD(){
		setInterval(function(){
			var hudEl = $('#Hud');
	    	var pingEl = $('#Ping');
	    	
	        if (connection == "disconnected"){
	        	hudEl.html(connection);
	        	pingEl.css('background-color', 'red');
	        
	        }else{
	        	var string = "    Players: " + (remotePlayers.length + 1) + "<br/>" + "    Ping: " + totalPing;
	        	hudEl.html(string);
	        	
	        	if (totalPing <= 300){
	        		pingEl.css('background-color', 'green');
	        	}else if (totalPing > 300 && totalPing < 500){
	        		pingEl.css('background-color', 'yellow');
		        }else if(totalPing >= 500){
		        	pingEl.css('background-color', 'red');
		        }
	        }
	        
		}, 3000);
	};
	
	/**
	 * Updates scoreboard with new data every 3 seconds
	 */
	function updateScoreBoard(){
		setInterval(function(){
	    	// Update the scoreboard's data every 3 seconds
	    	scoreboard.update(localPlayer, remotePlayers);
	    }, 3000);
	};
	
	/**
	 * Connects to the server and sets all socket "on" functions
	 */
	function connect(playerName){
		localPlayerName = playerName;
	    
	    if (typeof io != "undefined"){
	    	socket = io.connect('http://ec2-54-251-13-201.ap-southeast-1.compute.amazonaws.com:8080', {
		    	reconnect: false
		    });
	    	//socket = io.connect('http://localhost:8080/', {
		    //	reconnect: false
		    //});
		    socket.on("connect", onSocketConnected);
		    socket.on('connect_failed', onConnectFailed);
		    socket.on("disconnect", onSocketDisconnect);
		    socket.on("disconnect_idle", onSocketDisconnectIdle);
		    socket.on("pong", onPong);
		    
		    socket.on("new player", onNewPlayer);
		    socket.on("remove player", onRemovePlayer);
		    
		    socket.on("fire", onFire);
		    socket.on("kill player", onKillPlayer);
		    socket.on("revive player", onRevivePlayer);
		    
		   	socket.on("new position", onNewPosition);
		    socket.on("snapshot", onSnapShot);
		    
		    socket.on("chat", onChat);
	    }else{
	    	alert("Unable to load socket.io! The server might be offline.");
	    }
	    
	};
	
	function onSocketConnected(data){
		connection = "connected";
	    console.log("Connected to socket server");
	    
	    // After we have successfully connected to server,
	    // tell the server that a new player has joined!
	    socket.emit("new player", {
	    	name: localPlayerName
	    });
		
		// Sets event handlers on keyboard
	    setEventHandlers();
	    // Start animating the game
        animate();
        // Start pinging the server
	    pingServer();
	    // Initialize game screen
	    initHUD();
	    // Start updating the scoreboard
	    updateScoreBoard();
	};
	
	function onConnectFailed(){
		console.log("Failed to connect to socket server");
		alert("Unable to connect to server. It may be offline.");
	};
	
	function onSocketDisconnect(){
		connection = "disconnected";
	    socket.disconnect();
	    console.log("Disconnected from socket server");
	    alert("Disconnected from server! (Reason: Server is not responding)");
	};
	
	function onSocketDisconnectIdle(){
		connection = "disconnected";
	    socket.disconnect();
	    console.log("Disconnected from socket server");
	    alert("Disconnected from server! (Reason: Idle for more than 2 minutes)");
	};
	
	function pingServer(){
		setInterval(function(){
			var clientTime = new Date();
			socket.emit("ping",{
				ping: clientTime.valueOf()
			});
		}, 2000);
	};
	
	function onPong(data){
		var clientTime = data.client;
		var now = new Date().valueOf();
		totalPing = now - clientTime;
	};
	
	function onNewPlayer(data){
	    console.log("New player connected: "+data.id);
	    
	    var poly = new Kinetic.Polygon({    // Player ship
	        name: "Triangle",
	        x: data.x,          //From server
	        y: data.y,          //From server
	        points: [{
	            x: -9,
	            y: 5
	        }, {
	            x: 9,
	            y: 0
	        }, {
	            x: -9,
	            y: -5
	        }],
	        centerOffset:{
	            x: 0,
	            y: 0
	        },
	        //fill: "white",
	        stroke: data.color,
	        strokeWidth: 2,
	        alpha: 1,
	        lineJoin: 'bevel',
	        shadow:{
		      	color: 'white',
		      	blur: 10,
		      	offset: [0, 0],
		      	alpha: 0.5
		    }
	    });
	    
	    var pName = new Kinetic.Text({
          x: data.x + 10,
          y: data.y + 26,
          text: data.name,
          fontSize: 10,
          fontFamily: "Calibri",
          textFill: "white",
          align: "center",
          verticalAlign: "middle"
        });
	    
	    var newPlayer;
	    // If we are adding this client's player
	    if (typeof localPlayer == "undefined"){
	    	newPlayer = new Player(poly, 0.0, new Vector(0, 0), pName, 0);
	    	newPlayer.id = data.id;
	    	
	    	// Add the player graphic and the thrust graphic to the rendering layer
	    	renderingLayer.add(newPlayer.getGraphic());
	    	renderingLayer.add(newPlayer.getThrustArt());
	    	
	    	// This local player/client
	    	localPlayer = newPlayer;
	    	tickClient();	// Start ticking the client
	    	localPlayer.scroll(levelLayer, renderingLayer, viewport);
	    
	    // If we are adding other clients
	    }else{
	    	newPlayer = new Player(poly, data.rot, new Vector(data.vx, data.vy), pName, data.score);
	    	newPlayer.id = data.id;
	    	
	    	renderingLayer.add(newPlayer.getGraphic());
	    	renderingLayer.add(newPlayer.getThrustArt());
	    	renderingLayer.add(pName);
	    	
	    	remotePlayers.push(newPlayer);
	    }
	};
	
	function onRemovePlayer(data){
		var removePlayer = playerById(data.id);
		
		if (!removePlayer) {
		    console.log("onRemove: Player not found: "+data.id);
		    return;
		};
		
		removePlayer.kill();
		remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
		// Remove ship, thruster and name text graphics from renderingLayer
		renderingLayer.remove(removePlayer.getGraphic());
		renderingLayer.remove(removePlayer.getThrustArt());
		renderingLayer.remove(removePlayer.getName());
	};
	
	/**
	 * Client-side Prediction Correction (from server)
	 */
	function onNewPosition(data){
		// Check the state array for player's state at that time
		if (localPlayer.getAlive()){
			for (var i = 0, l = localInputState.length; i < l; i++){
		    	if (localInputState[i].timeStamp == data.time){
		    		//console.log("Client pos: " + localInputState[i].x + "|" + localInputState[i].y + 
		    		//	"| Server pos: " + data.x + "|" + data.y);
		    		
		    		// Compare client's state data with server's state data
		    		if (Abs(localInputState[i].x - data.x) >= 1.5 || Abs(localInputState[i].y - data.y) >= 1.5 || localInputState[i].rot != data.rot){
		    			localInputState[i].x = data.x;
		    			localInputState[i].y = data.y;
		    			localInputState[i].rot = data.rot;
		    			
		    			var flag = true;
		    			var index = i;
		    			// Replay states from last corrected state to current state
		    			while(flag){
		    				console.log("Performing prediction correction... ");
		    				localPlayer.setX(localInputState[index].x);
		    				localPlayer.setY(localInputState[index].y);
		    				localPlayer.getGraphic().setRotation(localInputState[index].rot);
		    				
		    				index++;
		    				// If we are already at the most current state, break from while loop
		    				if (typeof localInputState[index] == "undefined"){
		    					flag = false;
		    				}else{
		    					continue;
		    				}
		    			}
		    		}
		    		break;
		    	}
		    }
		}
	   	
	};
	
	function onSnapShot(data){
		// Example format of data:
		//	{ 
		//		time: "xxx", 
		//	  	players: [ {id: "", x: "", y: "", rot: ""}, 
		//	  			   {id: "", x: "", y: "", rot: ""}, 
		//	  			   {id: "", x: "", y: "", rot: ""} ]
		//	}
		
		// Store incoming server snapshots in the global snapShots array
		var timeStamp = new Date().valueOf();
		snapShots.push({
			time: timeStamp,
			players: data.players
		});
		
		if (snapShots.length > SNAPSHOT_BUFFER){	// Delete older snapshots
			snapShots.splice(0, 1);
		}
		
		// If player explicitly specifies he/she does not want entity interpolation
		if (!settings.getInterp()){
			var players = data.players;
			
			if (typeof players != "undefined"){
				for (var i = 0, l = players.length; i < l; i++){
					var player = playerById(players[i].id);
					
					if (!player){
						
					}else{
						player.move(players[i].x, players[i].y);
						player.rotateTo(players[i].rot);
					}
				}
			}
		}
	};
	
	function onFire(data){
        var laserShape = new Kinetic.Rect({
            x: data.x,
            y: data.y,
            width: 12,
            height: 1,
            fill: "red",
            stroke: "red",
            strokeWidth: 1,
            alpha: 1
        });
		
		var laser = new Laser(
			data.lid,
			laserShape,
	        data.rot,
	        new Vector(data.vx, data.vy),
	        data.pid);
		
		// Push into array
		lasers.push(laser);
		
		// Add laser to rendering layer
		renderingLayer.add(laser.getGraphic());
	};
		
	function onKillPlayer(data){
		// killer_id, killed_id, explosion animation object
		var killer, killed, circle;
		
		killed = playerById(data.killed_id);
		if (!killed){
			console.log("onKill: Player not found:"+data.killed_id);
			return;
		}
		if (data.killer_id != "-"){
			killer = playerById(data.killer_id);
			if (!killer){
				console.log("onKill: Player not found:"+data.killer_id);
				return;
			}
		}
		
		if (data.type == "kill"){
			killed.kill();
			killer.addScore(1);
        	messenger.writeMsg(messageArea, "kill", killer.getName().attrs.text, killed.getName().attrs.text);
		
		}else if (data.type == "suicide"){
			killed.kill();
			messenger.writeMsg(messageArea, "suicide", " ", killed.getName().attrs.text);
			
		}else if (data.type == "double suicide"){
			killer.kill();
			killed.kill();
			messenger.writeMsg(messageArea, "double suicide", killer.getName().attrs.text, killed.getName().attrs.text);
		}
		
		// If the killed player is the local player
		if (killed.id == localPlayer.id || (data.type == "double suicide" && killer.id == localPlayer.id)){
			// Write the death text on screen
			var deathText = new Kinetic.Text({
				name: "DeathText",
	            x: killed.getX(),
	          	y: killed.getY(),
	          	text: "You have been destroyed! Awaiting respawn...",
	          	fontSize: 16,
	          	fontFamily: "Quantico",
	          	textFill: "white",
	          	align: "center",
	          	verticalAlign: "middle",
	          	shadow:{
			      	color: 'white',
			      	blur: 7,
			      	offset: [0, 0],
			      	alpha: 0.5
			    }
	        });
	        renderingLayer.add(deathText);
		};
		
		// Create explosion Kinetic object
		circle = new Kinetic.Circle({
          	x: killed.getX(),
          	y: killed.getY(),
          	radius: 5,
          	fill: "red",
          	stroke: "red",
          	strokeWidth: 1,
          	alpha: 0.2
        });
        renderingLayer.add(circle);
        
        // Remove the circle explosion after 1 second
        var s = setTimeout(function(){
        	clearTimeout(s);
        	renderingLayer.remove(circle);
        }, 1000);
        
        // Animate the circle explosion
        var t = setInterval(function(){
        	if (circle.attrs.radius >= 60){
        		clearInterval(this);
        		
        		var s = setInterval(function(){
        			if (circle.attrs.radius <= 5){
        				clearInterval(this);
        			}else{
        				circle.attrs.radius -= 2;
        				circle.attrs.alpha -= 0.02;
        			}
        		}, 16);
        	}else{
        		circle.attrs.radius += 2;
        		circle.attrs.alpha += 0.02;
        	}
        }, 16);
	};
	
	function onRevivePlayer(data){
		// id, x, y
		var player = playerById(data.id);
		
		if (!player){
			console.log("onRevive: Player not found:"+data.id);
			return;
		}
		// Revive the player at the position given by the server
		player.revive(data.x, data.y);
		console.log(player.getName().attrs.text + " has been revived!");
		
		// If its the local player being revived, reset it's scrolling viewport to the new location
		// Also remove the "You have been killed!" object
		if (data.id == localPlayer.id){
			var deathtext = renderingLayer.get('.DeathText');
			renderingLayer.remove(deathtext[0]);
			localPlayer.scroll(levelLayer, renderingLayer, viewport);
		}
	};
	
	function onChat(data){
		messenger.writeChat(chatArea, data.name, data.msg);
	};
	
	function playerById(id){
		// Searches and returns a specified player by his/her connection id
	    if (typeof localPlayer != "undefined" && id == localPlayer.id){
	        return localPlayer;
	    }else{
	        var i;
	        for (i = 0; i < remotePlayers.length; i++) {
	            if (remotePlayers[i].id == id)
	                return remotePlayers[i];
	        };
	    }
	    return false;
	};
	
	/**
	 * Checks collision between a player and a laser object
	 */
	function checkCollision(playerX, playerY, playerRadius, laserX, laserY){
		var square_dist = Pow((playerX - laserX), 2) + Pow((playerY - laserY), 2);
		var square_rad = Pow(playerRadius, 2);
		if (square_dist <= square_rad){
			return true;
		}else{
			return false;
		}
	};
	
	return{
		init: init,
		drawTitle: drawTitle,
		connect: connect
	}
}();