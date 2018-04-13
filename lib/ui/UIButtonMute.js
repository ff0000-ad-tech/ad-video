/** 
	@class UIButtonMute
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { UIButtonMute } from 'ad-video'
		</codeblock>
		<br><br>
		
		This is a display object class, extending {@link UIButton} with direct control to a {@link VideoPlayer} instance.  It controls the muting and unmuting for the {@link VideoPlayer}. 
		While it can be instantiated by itself, it is typically created from the VideoControls class which is called from the constructor of a {@link VideoPlayer} instance. 
		See {@link UIButton} for more info.<br><br>

	
		<b>Sample 1</b><br>
		Add the button to the controlBar<br>
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
					onControlBar : {
						buttonMute : {
							css : {
								backgroundColor : 'rgb(100,200,10)'
							},
							state : [ 'btnUnMute', 'btnMute' ]
						}
					}	
				}
			});
		</codeblock>
		<br><br>


		<b>Sample 2</b><br>
		Add the button on the screen, NOT on the controlBar<br>
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
						buttonMute : {
							css : {
								width : 70,
								height : 70,
								backgroundColor : 'rgba(20,200,10,.5)'
							},
							state : [ 'btnUnMute', 'btnMute' ]
						},
					},	
				}
			});
		</codeblock>
		<br><br>


		<b>Sample 3</b><br>
		Use DOM elements as the states of the button, to have more contorl over their css
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
						buttonMute : {
							css : {
								width : 70,
								height : 70,
								backgroundColor : 'rgba(20,200,10,.5)'
							},
							state : [ 
								new UIImage({
									source : 'btnUnMute',
									css : {
										x : 10,
										y : 10,
										width : 50,
										height : 50,
										backgroundColor : 'rgba(100,100,0,.5)'
									}
								}),
								new UIImage({
									source : 'btnMute',
									css : {
										x : 10,
										y : 10,
										width : 50,
										height : 50,
										backgroundColor : 'rgba(0,100,100,.5)'
									}
								}) 
							]
						},
					}
				}
			});
		</codeblock>
		<br><br>
*/
import { UIButton } from 'ad-ui'
import { UIEvent } from 'ad-events'

function UIButtonMute(player, arg) {
	var U = new UIButton(arg)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function() {
		return '[object UIButtonMute]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PROTECTED METHODS
	U._onClick = function(event) {
		player.muted ? player.unmute(event) : player.mute(event)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handleVolumeChange(event) {
		U.state = Number(player.muted || player.screen.volume == 0)
	}

	function handleBaseEnabled(event) {
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'
		player.screen[listener]('volumechange', handleVolumeChange, false)
		player.screen[listener]('play', handleVolumeChange, false)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	U.enabled = true
	handleVolumeChange()

	return U
}

export default UIButtonMute
