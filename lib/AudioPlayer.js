/** 
	@npmpackage
	@class AudioPlayer
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">ad-video</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { AudioPlayer } from 'ad-video'
		</codeblock>
		<br><br>
		
		This object creates a custom Audio Player instance, which is an extension of the native DOM <audio> tag.  All native
		functionality is available, such as load(), play(), pause(), and volume 

	@example
		// instantiate new audio player
		View.main.audioPlayer = new AudioPlayer({
			source: 'mySoundFile.mp3',
			target: View.main,
			id: 'My_Unique_ID',
			preload : false,
			autoPlay : false,
			muted : false,
			volume: .8,
			onReady: function(event){
				console.log( 'audio ready')
			},
			onProgress: function(event){
				console.log( 'audio progress' )
			},
			onComplete: function(event){
				console.log( 'audio complete' )
			},
			onFail: global.failAd,
		})

		View.main.audioPlayer.play();
*/
function AudioPlayer(arg) {
	'use strict'

	// -------------------------------------------------------------------------------------------------------------------------------
	var A = new Audio()

	if (arg.target) {
		arg.target.appendChild(A)
	}

	A.onComplete = arg.onComplete || function() {}
	A.onFail = arg.onFail || function() {}
	A.onBuffer = arg.onBuffer || function() {}
	A.onProgress = arg.onProgress || function() {}
	A.onReady = arg.onReady || function() {}

	var _preload = !!arg.preload
	var _autoPlay = !!arg.autoPlay
	var _source = []

	// -------------------------------------------------------------------------------------------------------------------------------
	// GETTERS | SETTERS
	Object.defineProperties(A, {
		/**
			@memberof AudioPlayer
			@var {boolean} autoPlay
				A Boolean that changes if the audio will automatically play.
			@example
				myPlayer.autoPlay = false;
		*/
		autoPlay: {
			get: function() {
				return _autoPlay
			},
			set: function(value) {
				_autoPlay = value

				value ? A.setAttribute('autoplay', '') : A.removeAttribute('autoplay')
			}
		},

		/**
			@memberof AudioPlayer
			@var {number} percent
				A Number 0-1 representing the audio timeline percent position. 
		*/
		percent: {
			get: function() {
				return A.currentTime / A.duration || 0
			}
		},

		/**
			@memberof AudioPlayer
			@var {string} source
				Changes the source of the audio.  Pass a string of the audio file path to set.
			@example
				myPlayer.source = 'audio/myAudio.mp3';			
		*/
		source: {
			get: function() {
				return A.src
			},
			set: function(value) {
				_source = value

				A.preload = 'none'
				A.src = value
			}
		}

		/**
			@memberof AudioPlayer
			@var {number} volume
				Changes the volume of the audio.  Assign a number, between 0 - 1 to set the volume.  
			@example
				myPlayer.volume = .8;			
		*/
	})

	// -------------------------------------------------------------------------------------------------------------------------------
	// PUBLIC METHODS
	/**
		@memberof AudioPlayer
		@method load
		@desc
			Loads the current audio source. If preload is true, this is redundant.
		@example
			myPlayer.load();
	*/

	/**
		@memberof AudioPlayer
		@method play
		@desc
			Plays the current audio.
		@example
			myPlayer.play();
	*/

	/**
		@memberof AudioPlayer
		@method pause
		@desc
			Pauses the current audio.
		@example
			myPlayer.pause();
	*/

	/**
		@memberof AudioPlayer
		@method seek
		@param {number} sec
			The time to skip the audio to in seconds.
		@desc
			Skips the audio to a specific time.
		@example
			myPlayer.seek( 4 );
	*/
	A.seek = function(sec) {
		if (sec > A.duration) sec = A.duration
		else A.complete = false

		A.currentTime = sec

		console.log('\t\tseek()', sec, A.currentTime)
	}

	/**
		@memberof AudioPlayer
		@method stop
		@desc
			Stops the audio and resets it to the beginning.
		@example
			myPlayer.stop();
	*/
	A.stop = function() {
		console.log('AudioPlayer.stop()')
		A.pause()

		A.currentTime = 0
		A.dispatchEvent(new CustomEvent('stop'))
	}

	/**
		@memberof AudioPlayer
		@method mute
		@desc
			Mutes the Video Player, does not change the volume.
		@example
			myPlayer.mute()
	*/
	A.mute = function() {
		console.log('AudioPlayer.mute()')
		A.muted = true
	}

	/**
		@memberof AudioPlayer
		@method unmute
		@desc
			Unmutes the Video Player, does not change the volume.
		@example
			myPlayer.unmute()
	*/
	A.unmute = function() {
		console.log('AudioPlayer.unmute()')
		A.muted = false
	}

	// -------------------------------------------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	function handlePlay(event) {
		A.complete = false

		// In Safari, if the preload=none attribute is present, plays will not fire when called manually
		A.removeAttribute('preload')
	}

	function handleComplete(event) {
		console.log('handleComplete(), audio.paused =', A.paused)

		A.complete = true
		A.onComplete.call(A, event)
		A.dispatchEvent(new CustomEvent('complete'))
	}

	// -------------------------------------------------------------------------------------------------------------------------------
	A.addEventListener('play', handlePlay, false)
	A.addEventListener('ended', handleComplete, false)
	A.addEventListener('timeupdate', A.onProgress, false)
	A.addEventListener('error', A.onFail, false)
	A.addEventListener('waiting', A.onBuffer, false)
	A.addEventListener('canplay', A.onReady, false)

	A.source = arg.source

	A.autoPlay = _autoPlay

	A.volume = arg.volume ? (arg.volume == 0 ? 0 : arg.volume) : 1
	A.muted = !!arg.muted

	if (_autoPlay) {
		A.play()
	} else if (_preload) {
		A.load()
	}

	return A
}

export default AudioPlayer
