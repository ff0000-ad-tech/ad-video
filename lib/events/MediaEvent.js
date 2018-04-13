/**
	@class MediaEvent
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { MediaEvent } from 'ad-video'
		</codeblock>
		<br><br>
		
		Constants for video and audio events. Meant to improve interface consistency.
*/
var MediaEvent = new function() {
	return {
		/**
			@memberof MediaEvent
			@const {string} AUTOPLAY
		*/
		AUTOPLAY: 'autoplay',

		/**
			@memberof MediaEvent
			@const {string} BUFFER
		*/
		BUFFER: 'waiting',

		/**
			@memberof MediaEvent
			@const {string} COMPLETE
		*/
		COMPLETE: 'complete',

		/**
			@memberof MediaEvent
			@const {string} FAIL
		*/
		FAIL: 'fail',

		/**
			@memberof MediaEvent
			@const {string} MUTE
		*/
		MUTE: 'mute',

		/**
			@memberof MediaEvent
			@const {string} PAUSE
		*/
		PAUSE: 'pause',

		/**
			@memberof MediaEvent
			@const {string} PLAY
		*/
		PLAY: 'play',

		/**
			@memberof MediaEvent
			@const {string} PROGRESS
		*/
		PROGRESS: 'progress',

		/**
			@memberof MediaEvent
			@const {string} READY
		*/
		READY: 'canplay',

		/**
			@memberof MediaEvent
			@const {string} STOP
		*/
		STOP: 'stop',

		/**
			@memberof MediaEvent
			@const {string} UNMUTE
		*/
		UNMUTE: 'unmute'
	}
}()

export default MediaEvent
