/**
 * A sound pool to use for the sound effects
 */
function SoundPool(maxSize) {
	var size = maxSize; // Max sounds allowed in the pool
	var pool = [];
	this.pool = pool;
	var currSound = 0;
	/*
	 * Populates the pool array with the given sound
	 */
	this.init = function(object) {
		if (object == "drop") {
			for (var i = 0; i < size; i++) {
				// Initalize the sound
				drop = new Audio("../audio/drop.wav");
				drop.volume = .2;
				drop.load();
				pool[i] = drop;
			}
		}		
		else if (object == "splash") {
			for (var i = 0; i < size; i++) {
				var splash = new Audio("../audio/splash.wav");
				splash.volume = .8;
				splash.load();
				pool[i] = splash;
			}
		}
	};
	/*
	 * Plays a sound
	 */
	this.get = function() {
		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			pool[currSound].play();
		}
		currSound = (currSound + 1) % size;
	};
}