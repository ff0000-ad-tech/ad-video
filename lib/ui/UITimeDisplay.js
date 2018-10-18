/**
	@class UITimeDisplay
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { UITimeDisplay } from 'ad-video'
		</codeblock>
		<br><br>
		
		This is a display object class, extending {@link UITextField} with direct control to a {@link VideoPlayer} instance.  It displays the time of {@link VideoPlayer}. 
		While it can be instantiated by itself, it is typically created from the VideoControls class which is called from the constructor of a {@link VideoPlayer} instance. 
		See {@link UITextField} for more info.<br><br>

	
		<b>Sample 1</b><br>
		Add the time display to the controlBar<br>
		<codeblock>
			var myVideoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'my-video-player',
				css: {
					width: 400,
					height: 250
				},
				controls : {
					timeDisplay : {
						css : {
							height : 'inherit',
							color : '#ffffff'
						},
						fontSize : 18,
						fontFamily : 'Arial',
						alignText : Align.CENTER,
						bufferText : {
							left : 5,
							right : 5
						},
						showDuration : true
					}
				}
			});
		</codeblock>
		<br><br>


		<b>Sample 2</b><br>
		Add the time display on the screen, NOT on the controlBar<br>
		<codeblock>
			var myVideoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'my-video-player',
				css: {
					width: 400,
					height: 250
				},
				controls : {
					onScreen : {
						timeDisplay : {
							css : {
								height : 50,
								color : '#ffffff'
							},
							fontSize : 18,
							fontFamily : 'Arial',
							alignText : Align.CENTER,

							showDuration : true
						}
					},	
				}
			});
		</codeblock>
*/
import { UITextField } from 'ad-ui'
import { UIEvent } from 'ad-events'
import * as MediaEvent from '../events/MediaEvent'

function UITimeDisplay(player, arg) {
	// TODO - initial click not working if volume slider used first
	var U = new UITextField(arg)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PROPERTIES
	var _showDuration = true
	var _duration = '0:00'
	var _timeStr = '0:00'

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// GETTER | SETTTER
	/**
		@memberOf UITimeDisplay
		@var {boolean} showDuration
		@desc
			Getter | Setter : Toggles if the time will have the duration appended to the display.
			<br> Will output either #:## or #:##/#:##
	*/

	Object.defineProperty(U, 'showDuration', {
		get: function() {
			return _showDuration
		},
		set: function(state) {
			_showDuration = state
			_duration = state ? ' / ' + formatTime(player.duration) : ''
		}
	})

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function() {
		return '[object UITimeDisplay]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	function formatTime(time) {
		time = time || 0
		var min = Math.floor(time / 60)
		var sec = Math.floor(time - min * 60)
		if (sec < 10) sec = '0' + sec
		return min + ':' + sec
	}

	function assignText() {
		U.text = _timeStr + _duration
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handleLoadedData(event) {
		U.showDuration = _showDuration
	}

	function handleTimeUpdate(event) {
		_timeStr = formatTime(player.screen.currentTime)
		assignText()
	}

	function handleBaseEnabled(event) {
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'
		player.screen[listener]('loadeddata', handleLoadedData, false)
		player.screen[listener]('timeupdate', handleTimeUpdate, false)
		player.screen[listener](MediaEvent.PLAY, handlePlay)
		player.screen[listener](MediaEvent.PROGRESS, handleProgress)
	}

	function handlePlay(event) {
		U.showDuration = true
	}

	function handleProgress(event) {
		_timeStr = formatTime(player.currentTime)
		assignText()
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	//player.screen.addEventListener ( MediaEvent.PLAY, handlePlay );
	//player.screen.addEventListener ( MediaEvent.PROGRESS, handleProgress );

	U.enabled = true
	U.showDuration = arg.showDuration != false
	assignText()

	return U
}

export default UITimeDisplay
