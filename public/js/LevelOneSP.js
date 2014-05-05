

function LevelOneSP(ctx, canvasWidth, canvasHeight, imageManager) {	


	function powerConstructor(theCTX, canvWidth, canvHeight, imgMgr) {
		var LEVELONE = {
			NUMROWS: 13,
			NUMCOLS: 7,
			NUMROWSOFFSCREEN: 26
		}
		// Public Function Holder
		var retObject = new Object();	
		// Canvas
		var canvas = document.getElementById('mainCanvas');
		// Sound
		var drop = new SoundPool(5);
		    drop.init("drop");	
		var splash = new SoundPool(5);
		    splash.init("splash");
		var bgMusic = new Audio("../audio/beach.mp3");	
		bgMusic.volume = .2;
		bgMusic.load();	
		bgMusic.loop = true;
		bgMusic.play();
		// Storing parameters locally
		var ctx = theCTX;  
		var canvasWidth = canvWidth;
		var canvasHeight = canvHeight;
		var tempcanvasWidth = canvWidth;
		var tempcanvasHeight = canvHeight;
		var pieceWidth;
		var pieceHeight;
		var tempPieceWidth;
		var tempPieceHeight;
		var imageManager = imgMgr;
		// Event Listeners
		canvas.onclick = buttonClicked;
		canvas.addEventListener('mousemove', mouseMovement, false);
		// Arrays
		var gridArray = initialize2DArray();
		var arrayOfStuffToRise = initialize2DArray();
		// Booleans	
		var allowedToClick = false;	
		var allowedToResize = false;
		var triedToResize = false;
		var currentlySwapping = false; // In Update Logic 
		var shouldCheckRises = false;
		var alreadyRisingStuff = false; // In the Break-Rise manager
		var currentlyRisingBlocks = false; // In Update Logic
		// Ints
		var activeXOne = 0;
		var activeYOne = 0;
		var activeXTwo = 1;
		var activeYTwo = 0;
		var frozenActiveXOne;		
		var frozenActiveXTwo;
		var frozenActiveY;
		var speedOfSwap = 1;
		var speedOfRise = 1;
		var totalStepsLeft = 0;
		var totalStepsRisen = 0;
		var maxColBlocks = 0;
		var running = false;
		var numberOfWaterDroplets = 0;
		if (window.isTouchDevice() == true) { numberOfWaterDroplets = 1; }
		else { numberOfWaterDroplets = 500; }
		var dropletX;
		var dropletY;
		// Notification Message Stuff
		var pfx = ["webkit", "moz", "MS", "o", ""];
		var notificationDiv = document.getElementById('notificationDiv');
		var notification = document.getElementById('notification');
		PrefixedEvent(notificationDiv, "AnimationEnd", function(e) {notificationDiv.style.display = "none";});
		// Rain Stuff
		var RainDiv = document.getElementById('rainDiv');



		/** --------------------------------------------- STARTER STUFF ------------------------**/
		retObject.run = function() {
			createAllRainDroplets();
			running = true; // Makes Update Logic able to run
			allowedToResize = true; 
			updateScreenCoords();
			newRandomArray(); // Fill the 2d array of 0s with random blocks
			allowedToClick = true;
		}
		function initialize2DArray() {
			var board = [];
			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				board[i] = [];
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					board[i][j] = 0;
				}
			} 
			return board;
		}
		function newRandomArray() {
			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					gridArray[i][j] = new Block(j*pieceWidth, i*pieceHeight);
				}
			} 
		}
		function refillGrid() {
			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					if (gridArray[i][j] == 0) {
						gridArray[i][j] = new Block(j*pieceWidth, i*pieceHeight);
					}
				}
			}
		}
		









		/** --------------------------------------------- UPDATE LOGIC ----------------------**/
		retObject.updateLogic = function() {
			if ( running == true ) {
				// HANDLE SWAPPING STUFF
				if ( currentlySwapping == true ) {
					logicSwapping();
				}
				// HANDLE RISING STUFF
				else if ( currentlyRisingBlocks == true ) {
					logicRising();
				}
			}			
		}
		function logicSwapping() {
			// Move Block One Right
			var b1 = gridArray[frozenActiveY][frozenActiveXOne];
			var b1_coords = b1.getCoords();
			// Move Block Two Left
			var b2 = gridArray[frozenActiveY][frozenActiveXTwo];
			var b2_coords = b2.getCoords();
			var amountToMove = speedOfSwap;
			if (speedOfSwap > totalStepsLeft) {
				amountToMove = totalStepsLeft;
			}
			b1.setCoords(b1_coords.x+amountToMove , b1_coords.y);
			b2.setCoords(b2_coords.x-amountToMove , b2_coords.y);
			// Update Total Steps Left
			totalStepsLeft = (totalStepsLeft - amountToMove);
			// If Done Swapping
			if (totalStepsLeft == 0) {
				doneSwapping();
			}	
		}
		function logicRising() {	
			var amountToMove = speedOfRise;
			// Move all of the blocks up amountToMove
			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					if (arrayOfStuffToRise[i][j] != 0) { 
						if ( totalStepsRisen < (arrayOfStuffToRise[i][j]*pieceHeight) ) {	
							// I never could figure out why this worked...sometimes it will move the block by amountLeft
							// which is less than speedOfRise, but below it would add a different amountToMove to totalSteps.
							// Also why will totalSteps never be bigger than (maxColBlocks*pieceHeight)?????
							var amountLeft = ((arrayOfStuffToRise[i][j]*pieceHeight)-totalStepsRisen);
							if ( speedOfRise > amountLeft ) {
								amountToMove = amountLeft;								
							}						
							gridArray[i][j].setCoords(gridArray[i][j].getCoords().x, gridArray[i][j].getCoords().y-amountToMove);
						}
					}
				}
			}

			// Total steps risen will happen once every time a block moves up some amount
			totalStepsRisen += amountToMove;

			// if all necessary blocks have been moved up
			if ( totalStepsRisen == (maxColBlocks*pieceHeight) ) {	
				currentlyRisingBlocks = false; // Locks up updateLogic			
				alreadyRisingStuff = false; // Unlocks Break-Rise Manager				
				var numToRise;
				// Officially update the grid array with the newly risen values
				for (var n=0; n<LEVELONE.NUMROWSOFFSCREEN; n++) {
					for (var m=0; m<LEVELONE.NUMCOLS; m++) {
						if (arrayOfStuffToRise[n][m] != 0) {
							numToRise = arrayOfStuffToRise[n][m];
							gridArray[n-numToRise][m] = gridArray[n][m];
							gridArray[n][m] = 0;
							arrayOfStuffToRise[n][m] = 0;
						}
					}
				}				
				totalStepsRisen = 0;
				maxColBlocks = 0;
				arrayOfStuffToRise = initialize2DArray();
				refillGrid();
				handleBreaksAndRisesAfterTurn();
			}
		}
		/** Reset all of the blocks' pixel coordinates given the new dimensions **/
		function updateGridLocations() {
			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					// You can't resize a block that doesn't exist
					if (gridArray[i][j] != 0) {
						gridArray[i][j].setCoords(j*pieceWidth, i*pieceHeight);
					}					
				}
			} 
		}
		/** Moves temp values over to real values **/
		function updateScreenCoords() {
			pieceWidth = tempPieceWidth;
			pieceHeight = tempPieceHeight;
			canvasWidth = tempcanvasWidth;
			canvasHeight = tempcanvasHeight;
			updateSwapSpeed();
			triedToResize = false;
		}
		function updateSwapSpeed() {
			if (pieceWidth<20) {speedOfSwap = 1; speedOfRise=2;}
		 	else if (pieceWidth<40) {speedOfSwap = 2; speedOfRise=3;}
	 		else if (pieceWidth<60) {speedOfSwap = 4; speedOfRise=5;}
 			else {speedOfSwap = 5; speedOfRise=6;} 			
		}
		/** Stage 1 - Done Swapping **/
		function doneSwapping() {
			// Officially update the gridArray to know of this swap
			var oldBlockOne = gridArray[frozenActiveY][frozenActiveXOne];
			var oldBlockTwo = gridArray[frozenActiveY][frozenActiveXTwo];
			gridArray[frozenActiveY][frozenActiveXOne] = oldBlockTwo;
			gridArray[frozenActiveY][frozenActiveXTwo] = oldBlockOne;
			currentlySwapping = false;
			drop.get();	
			// Proceed to Stage 2 - check and handle breaks
			handleBreaksAndRisesAfterTurn();			
		}
		/** Stage 2 - Handle Breaks and Drops after turn **/
		function handleBreaksAndRisesAfterTurn() {
			// If we're not already rising some blocks
			if ( alreadyRisingStuff == false ) {
				var isSomethingToRise = buildRiseArray();								
				if (isSomethingToRise == true) {
					alreadyRisingStuff = true;
					currentlyRisingBlocks = true;
				}
			}	
			
			if ( alreadyRisingStuff == false ) {
				var didAnythingBreak = handleBreaks();
				// If something did break, I want to call this function again and check for rises
				if (didAnythingBreak == true) {
					handleBreaksAndRisesAfterTurn();
				}
			}

			if ( (isSomethingToRise == false) && (didAnythingBreak == false)) {
				finishTurn();
			}
		}
		/** Stage 3 - Wrap up the turn and let the user play **/
		function finishTurn() {			
			// If an attempt to resize the window took place during the swap, now is the
			// time to go back and correctly resize it.
			if (triedToResize == true) {
				updateScreenCoords();
				updateGridLocations();
			}	
			allowedToResize = true;
			allowedToClick = true;
		}
		function handleRises() {
			buildRiseArray();
		}
		function buildRiseArray() {
			var isSomethingToRise = false;
			var highestSofar = 0;

			for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					// As we go through the gridArray, find empty spots with no block
					if (gridArray[i][j] == 0)  {
						// This will go back here once I get pieces off the board that rise up
						isSomethingToRise = true;						
						// When we find one, increment a counter for all blocks below that empty
						// block, except for other empty blocks, don't increment those
						if (i+1 < LEVELONE.NUMROWSOFFSCREEN) {
							var k=i+1;							
							for (; k<LEVELONE.NUMROWSOFFSCREEN; k++) {
								if (gridArray[k][j] != 0) {	
									//isSomethingToRise = true;	
									// Increment the rise counter for this particular block								
									arrayOfStuffToRise[k][j] = (arrayOfStuffToRise[k][j] + 1);
									// Stay up to date with the max
									if (arrayOfStuffToRise[k][j] > highestSofar) {highestSofar = arrayOfStuffToRise[k][j];}
								}
							}// end for all rows in this column											
						}															
					} // end if there was an empty block here
				}
			} 		
			maxColBlocks = highestSofar;
			return isSomethingToRise;
		}
		function handleBreaks() {
			// BUILD THE HORIZONTAL MASTER ARRAY
			var horizontalArrayOfArrays = new Array();
			var possibleHorizontalArray;
			var alreadyInArrayOfArrays = false;
			for (var i=0; i<LEVELONE.NUMROWS; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					if ( gridArray[i][j] != 0) { // As long as there is actually something there
						// First determine if this cell is a already a member of another horizontal break
						alreadyInArrayOfArrays = false;
						for (var k=0; k<horizontalArrayOfArrays.length; k++) {
							if ( isThingInArray({row:i, col:j}, horizontalArrayOfArrays[k]) == true ) {
								alreadyInArrayOfArrays = true;
								break;
							}
						}
						// If it wasn't, then its safe to see what horizontal breaks it could be a part of
						if ( alreadyInArrayOfArrays == false ) {
							possibleHorizontalArray = buildHorizontalBreakArray(i, j);
							if ( possibleHorizontalArray != false ) {
								horizontalArrayOfArrays.push(possibleHorizontalArray);
							}
						}
					}
				}
			}// end horizontal stuff

			// BUILD THE VERTICAL MASTER ARRAY
			var verticalArrayOfArrays = new Array();
			var possibleVerticalArray;
			alreadyInArrayOfArrays = false;
			for (var i=0; i<LEVELONE.NUMROWS; i++) {
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {
					if ( gridArray[i][j] != 0) { // As long as there is actually something there
						// First determine if this cell is a already a member of another vertical break
						alreadyInArrayOfArrays = false;
						for (var k=0; k<verticalArrayOfArrays.length; k++) {
							if ( isThingInArray({row:i, col:j}, verticalArrayOfArrays[k]) == true ) {
								alreadyInArrayOfArrays = true;
								break;
							}
						}
						// If it wasn't, then its safe to see what vertical breaks it could be a part of
						if ( alreadyInArrayOfArrays == false ) {
							possibleVerticalArray = buildVerticalBreakArray(i, j);
							if ( possibleVerticalArray != false ) {
								verticalArrayOfArrays.push(possibleVerticalArray);
							}
						}
					}
				}
			}// end vertical stuff

			// Remove all of the blocks that should break
			var elemToDelete;
			var numDeleted = 0;
			// Delete Horizontal Ones
			for (var n=0; n<horizontalArrayOfArrays.length; n++) {
				for (var m=0; m<horizontalArrayOfArrays[n].length; m++) {
					elemToDelete = horizontalArrayOfArrays[n][m]; 
					gridArray[elemToDelete.row][elemToDelete.col] = 0;
					numDeleted++;
				}	
			}
			// Delete Vertical Ones
			for (var n=0; n<verticalArrayOfArrays.length; n++) {
				for (var m=0; m<verticalArrayOfArrays[n].length; m++) {
					elemToDelete = verticalArrayOfArrays[n][m]; 
					gridArray[elemToDelete.row][elemToDelete.col] = 0;
					numDeleted++;
				}	
			}
			// Return whether or not anything was removed
			if ( (horizontalArrayOfArrays.length>0) || (verticalArrayOfArrays.length>0) ) { 
				splash.get();				
				setNotification(numDeleted);				
				return true; 
			}
			else { return false; }			
		}

		function buildHorizontalBreakArray(curRow, curCol) {
			var curColor = gridArray[curRow][curCol].getColor();
			var horizontalArray = new Array();

			// Left
			for (var c=curCol; c>=0; c--) {
				if (gridArray[curRow][c] != 0) {
					if (gridArray[curRow][c].getColor() == curColor) {
						if ( isThingInArray({row: curRow, col: c}, horizontalArray) == false ) {
							horizontalArray.push({row: curRow, col: c});
						}					
					} else { break; }
				}
			}
			// Right
			for (var c=curCol; c<LEVELONE.NUMCOLS; c++) {
				if (gridArray[curRow][c] != 0) {
					if (gridArray[curRow][c].getColor() == curColor) {
						if ( isThingInArray({row: curRow, col: c}, horizontalArray) == false ) {
							horizontalArray.push({row: curRow, col: c});
						}
					} else { break; }
				}
			}
			// Determine whether to return the set of pieces involved in a break, or false if
			// one didn't exist
			if (horizontalArray.length >= 3) {
				return horizontalArray;
			} else { return false; }
		}
		function buildVerticalBreakArray(curRow, curCol) {
			var curColor = gridArray[curRow][curCol].getColor();
			var verticalArray = new Array();
			
			// Up
			for (var r=curRow; r>=0; r--) {
				if (gridArray[r][curCol] != 0) {
					if (gridArray[r][curCol].getColor() == curColor) {
						if ( isThingInArray({row: r, col: curCol}, verticalArray) == false ) {
							verticalArray.push({row: r, col: curCol});
						}					
					} else { break; }
				}
			}
			// Down
			for (var r=curRow; r<LEVELONE.NUMROWS; r++) {
				if (gridArray[r][curCol] != 0) {
					if (gridArray[r][curCol].getColor() == curColor) {
						if ( isThingInArray({row: r, col: curCol}, verticalArray) == false ) {
							verticalArray.push({row: r, col: curCol});
						}
					} else { break; }
				}
			}
			// Determine whether to return the set of pieces involved in a break, 
			// or false if one didn't exist
			if (verticalArray.length >= 3) {
				return verticalArray;
			} else { return false; }
		}
		function isThingInArray(thing, theArray) {
			for(var c=0; c<theArray.length; c++) {
				if(theArray[c].row == thing.row) {
					if(theArray[c].col == thing.col) {
						return true;
					}
				}
			}
			return false;
		}





















		/** ---------------------------------------- MOUSE CONTROLS ---------------------- **/
		function buttonClicked(e) {	
			if (allowedToClick == true)	{	
				allowedToClick = false;
				allowedToResize = false;
				frozenActiveXOne = activeXOne;
				frozenActiveY = activeYOne;
				frozenActiveXTwo = activeXTwo;			
				totalStepsLeft = pieceWidth;
				// Allow the swapping to take place in update logic
				currentlySwapping = true;	
			}
		}
		function getMousePos(e) {
	        var rect = canvas.getBoundingClientRect();
	        return {
	          	x: e.clientX - rect.left,
	        	y: e.clientY - rect.top
	        };
      	}
      	/** The Event Listener for MouseMove **/
      	function mouseMovement(e) { 
      		var mousePos = getMousePos(e);
      		if ( (mousePos.x > 0) && (mousePos.x < canvasWidth) &&
      			 (mousePos.y > 0) && (mousePos.y < canvasHeight)) {
      			setActiveBlocks(mousePos.x, mousePos.y);
      		}	        
      	}
      	function setActiveBlocks(x, y) {
      		// The col and row where the mouse currently is
      		var mouseCol = Math.floor(x/pieceWidth);
			var mouseRow = Math.floor(y/pieceHeight);
			// Check left and right
			var lowestX = (activeXOne<activeXTwo) ? activeXOne : activeXTwo;
			var biggestX = (activeXOne>activeXTwo) ? activeXOne : activeXTwo;
			activeYOne = mouseRow;
			activeYTwo = mouseRow;
			if ( x < ((lowestX*pieceWidth)+(.5*pieceWidth)) ) {
				if ( x < pieceWidth) {
					activeXOne = 0;
			 		activeXTwo = 1;
				} else {
					activeXOne = mouseCol-1;
			 		activeXTwo = mouseCol;
				}				
			}
			else if ( x > ((biggestX*pieceWidth)+(.5*pieceWidth))  ) {
				if (mouseCol+1 < LEVELONE.NUMCOLS) {
					activeXOne = mouseCol;	
					activeXTwo = mouseCol+1;
				}
				else {
					activeXOne = mouseCol-1;	
					activeXTwo = mouseCol;
				}
			}
      	}
      	function setNotification(text) {
      		// This is the hack to "restart" a css animation
      		notificationDiv.classList.remove("notificationAnimation");
      		notificationDiv.offsetWidth = notificationDiv.offsetWidth;
      		notificationDiv.classList.add("notificationAnimation");
      		// Change the text
  			notification.textContent = text+"!";
  			notificationDiv.style.display = "block";     		
      	}		
		function PrefixedEvent(element, type, callback) {
			for (var p = 0; p < pfx.length; p++) {
				if (!pfx[p]) type = type.toLowerCase();
				element.addEventListener(pfx[p]+type, callback, false);
			}
		}
		function createAllRainDroplets() {
			var screenWidth = window.innerWidth;
			var screenHeight = (window.innerHeight+200);
			var tempDroplet;
			var toggle = 1;
			for( i=1;i<numberOfWaterDroplets;i++) {
				dropletX = Math.floor(Math.random() * (screenWidth + 1));				
				dropletY = Math.floor(Math.random() * (screenHeight - (-1000))) + (-1000);
				tempDroplet = document.createElement('div');
				if ( toggle == 1 ) {
					toggle = 2;
					tempDroplet.setAttribute("class","rainDroplet");
				}else {
					toggle = 1;
					tempDroplet.setAttribute("class","rainDropletTwo");
				}
				tempDroplet.setAttribute("id", "rainDroplet"+i);
				tempDroplet.style.left = dropletX+"px";
				tempDroplet.style.top = dropletY+"px";
				RainDiv.appendChild(tempDroplet);
			}
		}



				
	











      	/**	--------------------------------------- RESIZING -------------------------**/
		retObject.setViewportSize = function(canvasWidthT, canvasHeightT, numRow, numCol) {
			if (allowedToResize == true) {
				pieceWidth = Math.floor( (canvasWidthT / numRow) );
				pieceHeight = Math.floor( (canvasHeightT / numCol) );
				canvasWidth = canvasWidthT;
				canvasHeight = canvasHeightT;
				updateSwapSpeed();
				updateGridLocations();
			}
			else {
				tempPieceWidth = Math.floor( (canvasWidthT / numRow) );
				tempPieceHeight = Math.floor( (canvasHeightT / numCol) );
				tempcanvasWidth = canvasWidthT;
				tempcanvasHeight = canvasHeightT;
				triedToResize = true;
			}

		}
		












		/** ----------------------------------------- DRAWING ---------------------------**/
		retObject.draw = function(ctx) {
		 	for (var i=0; i<LEVELONE.NUMROWSOFFSCREEN; i++) {		
				for (var j=0; j<LEVELONE.NUMCOLS; j++) {				
					if ( gridArray[i][j] != 0 ) { // If there is SOMETHING there
						var block = gridArray[i][j];
						var imageName = block.getImageName();
						var bCoord = block.getCoords();
						ctx.drawImage(imageManager.get(imageName), 0, 0, 120, 120, bCoord.x, bCoord.y, pieceWidth, pieceHeight);
					}
				}
			}
			// Draw the active blocks
			ctx.drawImage(imageManager.get("Highlight"), 0, 0, 120, 120, activeXOne*pieceWidth, activeYOne*pieceHeight, pieceWidth, pieceHeight);
			ctx.drawImage(imageManager.get("Highlight"), 0, 0, 120, 120, activeXTwo*pieceWidth, activeYTwo*pieceHeight, pieceWidth, pieceHeight);
		}










		return retObject;
	}// end powerConstructor()




	return powerConstructor(ctx, canvasWidth, canvasHeight, imageManager);	
} // end LevelOne




