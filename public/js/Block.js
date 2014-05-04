


function Block(x, y) {

	function powerConstructor(xCoord, yCoord) {
		var retObject = new Object();
		// Set a random color
		var color = Math.floor((Math.random()*6)+1);
		var imageName = null;
		var internalX = xCoord;
		var internalY = yCoord;
		retObject.getColor = function() { return color; }	
		retObject.getImageName = function() { return imageName;	}	
		retObject.setCoords = function(newX, newY) {internalX=newX; internalY=newY;}
		retObject.getCoords = function() { return {x:internalX, y:internalY}; }				
		retObject.updateImageName = function() {
			switch(color) { 
			case 1:  imageName = "WaterPiece"; break;
			case 2:  imageName = "WavesPiece"; break;
			case 3:  imageName = "GrassPiece"; break;
			case 4:  imageName = "DeepSeaPiece"; break;
			case 5:  imageName = "SandPiece"; break;
			case 6:  imageName = "ForestPiece"; break;
			}
		}
		
		retObject.updateImageName();

		return retObject;
	} // end powerConstructor



	return powerConstructor(x, y);
} // end Block()