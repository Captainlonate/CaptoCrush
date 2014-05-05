
function Game() {	

	function powerConstructor() {
		// Make a canvas
		var canvas = document.createElement('canvas');	
		canvas.id = 'mainCanvas';
		document.getElementById('gameArea').appendChild(canvas);
		var widthToHeightRatio = determineScreenRatio();
		window.onresize = resizeMainCanvas;
		var currentLevel;
		var boundAnimate;
		var ctx = canvas.getContext("2d");	
		// Image Files Stored in /img
		var images = {
			"WaterPiece" : "img/WaterPiece.png",
			"WavesPiece" : "img/WavesPiece.png",
			"GrassPiece" : "img/GrassPiece.png",
			"DeepSeaPiece" : "img/DeepSeaPiece.png",
			"SandPiece" : "img/SandPiece.png",
			"ForestPiece" : "img/ForestPiece.png",
			"Highlight" : "img/Highlighted.png"
		}
		var imageManager = new ImageManager();
		    imageManager.load(images, onLoaded);


		/** Called after all images are loaded */
		function onLoaded() {
			// Make the current Level
			currentLevel = new LevelOneSP(ctx, canvas.width, canvas.height, imageManager);
			resizeMainCanvas();
			// Begin the logic render loop
			mainLoop(0);
			// Setup is complete, let the level take over
			currentLevel.run();
		}

		/** The Parent of the game loop - This keeps the loop going */
		function mainLoop(t) {
			// ---REQUEING PART!!
			requestAnimationFrame(mainLoop);	
			// ---LOGIC PART!!
			currentLevel.updateLogic();
			// ---RENDERING PART!! 		
			currentLevel.draw(ctx);
		}


		function resizeMainCanvas() {
			//var newWidth = window.innerWidth;
			var newWidth = document.body.clientWidth;
			//var newHeight = window.innerHeight-100; // 100 so I can have a margin <3
			var newHeight = document.body.clientHeight-100; // 100 so I can have a margin <3
			var currentWidthToHeightRatio = newWidth / newHeight; 
			var gameArea = document.getElementById('gameArea');			
			if (currentWidthToHeightRatio > widthToHeightRatio) {
			  // window width is too wide relative to desired game width
			  // Make the width and height divisible by 7 and 13
			  newHeight = Math.floor(newHeight);
			  while( (newHeight%13) != 0 ) {
			  	newHeight = newHeight + 1;
			  }
			  newWidth = newHeight * widthToHeightRatio;
			  newWidth = Math.floor(newWidth);
			  while( (newWidth%7) != 0 ) {
			  	newWidth = newWidth + 1;
			  }
			  gameArea.style.height = newHeight + 'px';
			  gameArea.style.width = newWidth + 'px';
			} else { // window height is too high relative to desired game height
			  newHeight = newWidth / widthToHeightRatio;
			  gameArea.style.width = newWidth + 'px';
			  gameArea.style.height = newHeight + 'px';
			}

			gameArea.style.marginTop = (-newHeight / 2) + 'px';
			gameArea.style.marginLeft = (-newWidth / 2) + 'px';	

			canvas.width = Math.floor(newWidth);
			canvas.height = Math.floor(newHeight);

			var dpr;
			if ( window.devicePixelRatio ) {
				dpr = window.devicePixelRatio;
			} else { 
				console.log("DPR did not exist!");
				dpr = (window.screen.deviceXDPI / window.screen.logicalXDPI); 
			}

			var numRowsToDivide = (7 * dpr);
			var numColsToDivide = (13 * dpr);

			var hidefCanvasWidth = canvas.width;
		    var hidefCanvasHeight = canvas.height;
		    var hidefCanvasCssWidth = hidefCanvasWidth;
		    var hidefCanvasCssHeight = hidefCanvasHeight;
		    canvas.width = (hidefCanvasWidth * dpr);
		    canvas.height = (hidefCanvasHeight * dpr);
		    canvas.style.width = hidefCanvasCssWidth;
		    canvas.style.height = hidefCanvasCssHeight;       
			ctx.scale(dpr, dpr);
			
			currentLevel && currentLevel.setViewportSize(canvas.width, canvas.height, numRowsToDivide, numColsToDivide);
		}

		function determineScreenRatio() {
			var whichScreen = undefined;
			if ( screen.width==1440 && screen.height==900 ) {
				whichScreen = "OSXRETINA";
				var widthToHeight = 10/16;
			}		
			else if ( (screen.width==640 && screen.height==360) || 
				      (screen.width==360 && screen.height==640)) {
				whichScreen = "GALAXYS4";
				var widthToHeight = 9/16;
			}
			else if ( screen.width==1920 && screen.height==1080 ) {
				whichScreen = "1920x1080";
				var widthToHeight = 9/16;
			}
			else if ( (screen.width==1024 && screen.height==768) ||
			 	      (screen.width==768 && screen.height==1024)) {
				whichScreen = "IPADRETINA";
				var widthToHeight = 3/4;
			}
			else {
				widthToHeight = 9/16;
			}

			return widthToHeight;
		}	



		return "GameObject";
	}// end powerConstructor



	return powerConstructor();
} // end Game()