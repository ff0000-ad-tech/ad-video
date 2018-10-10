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

/**
	@memberof MediaEvent
	@const {string} AUTOPLAY
*/

export const AUTOPLAY = 'autoplay'

/**
	@memberof MediaEvent
	@const {string} BUFFER
*/
export const BUFFER = 'waiting'

/**
	@memberof MediaEvent
	@const {string} COMPLETE
*/

export const COMPLETE = 'complete'

/**
	@memberof MediaEvent
	@const {string} FAIL
*/

export const FAIL = 'fail'

/**
	@memberof MediaEvent
	@const {string} MUTE
*/

export const MUTE = 'mute'

/**
	@memberof MediaEvent
	@const {string} PAUSE
*/

export const PAUSE = 'pause'

/**
	@memberof MediaEvent
	@const {string} PLAY
*/

export const PLAY = 'play'

/**
	@memberof MediaEvent
	@const {string} PROGRESS
*/

export const PROGRESS = 'progress'

/**
	@memberof MediaEvent
	@const {string} READY
*/

export const READY = 'canplay'

/**
	@memberof MediaEvent
	@const {string} STOP
*/
export const STOP = 'stop'

/**
	@memberof MediaEvent
	@const {string} UNMUTE
*/
export const UNMUTE = 'unmute'
