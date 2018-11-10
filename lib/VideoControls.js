/**
	@npmpackage
	@class VideoControls
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">ad-video</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { VideoControls } from 'ad-video'
		</codeblock>
		<br><br>
		
		This is a display object class, extending {@link UIComponent}.  It is a DOM element that houses all the video control components:
		{@link UIButton}, {@link UISlider} and {@link UITextField}.
		<br><br>

		This can be instantiated but is typically called internally from the VideoPlayer by passing in all params to the instantiation.  
		All controls can be added to a {@link UIControlBar} or to the main container to be placed anywhere over the video.  This is done 
		through the instantiation, by passing components to a node <code>onControlBar</code> or <code>onScreen</code>.  See example below.
		<br><br>

		<b>Accepted Components:</b><br>
		<ul>
			<li><code>buttonPlayPause</code>, see {@link UIButtonPlayPause}</li>
			<li><code>buttonReplay</code>, see {@link UIButtonReplay}</li>
			<li><code>buttonFullScreen</code>, see {@link UIButtonFullScreen}</li>
			<li><code>buttonMute</code>, see {@link UIButtonMute}</li>
			<li><code>timeDisplay</code>, see {@link UITimeDisplay}</li>
			<li><code>sliderProgress</code>, see {@link UISliderProgress}</li>	 
			<li><code>sliderVolume</code>, see {@link UISliderVolume}</li>
		</ul>

		<b>Example adding a play/pause button to the screen:</b><br>
		<codeblock>
			View.main.videoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'My_Unique_ID',
				css: {
					width: 300,
					height: 250
				},				
				controls : {
					onScreen : {
						buttonPlayPause : {
							css : {
								x : 130,
								y : 40,
								width : 80,
								height : 80,
								backgroundColor : 'rgba(10,200,10,.5)'
							},
							icon : [ 'btnPlay', 'btnPause' ]
						}
					}	
				}
			});

			// access button 
			View.main.videoPlayer.controls.buttonPlayPause;
		</codeblock>
		<br><br>


		<b>Example adding a play/pause button to the ControlBar:</b><br>
		<codeblock>
			View.main.videoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'My_Unique_ID',
				css: {
					width: 300,
					height: 250
				},				
				controls : {
					onControlBar : {
						buttonPlayPause : {
							icon : [ 'btnPlay', 'btnPause' ]
						}
					}	
				}
			})

			// access button 
			View.main.videoPlayer.controls.controlBar.buttonPlayPause;
		</codeblock>
		<br><br>
			

		<b>Example All Controls on ControlBar:</b><br>
		<codeblock>
			// Full VideoPlayer with all options and controls
			View.main.videoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'My_Unique_ID',
				css: {
					width: 300,
					height: 250
				},
				controls : {
					replayOnInteraction : false,
					unmuteOnInteraction : true,

					onControlBar : {
						controlBar : {
							constant : false,
							showOnPoster : false,
							css : {
								backgroundColor : 'rgba(250,100,20,.5)'
							}					
						},
						buttonPlayPause : {
							icon : [ 'btnPlay', 'btnPause' ]
						},
						buttonReplay : {
							icon : [ 'btnReplay' ]
						},
						buttonMute : {
							icon : [ 'btnUnMute', 'btnMute' ]
						},
						buttonFullScreen : {
							icon : [ 'btnFullScreen' ]
						},
						sliderProgress : {
							inline : true,
							css : {
								width : 120
							},
							onOver : function(){
								console.log( this.track )
							},
							onOut : function(){
								console.log( this.handle )
							}
						},
						sliderVolume : {
							css : {
								width : 60
							},
							bg : {},
							track : {},
							handle : {}
						},
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
				}
			});
		</codeblock>
		<br><br>


		<b>Example Controls on ControlBar AND on screen:</b><br>
		<codeblock>
			// Full VideoPlayer with all options and controls
			View.main.videoPlayer = new VideoPlayer({
				source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
				target: View.main,
				id: 'My_Unique_ID',
				css: {
					width: 300,
					height: 250
				},
				
				controls : {

					replayOnInteraction : false,
					unmuteOnInteraction : true,

					onScreen : {
						buttonPlayPause : {
							css : {
								x : 130,
								y : 40,
								backgroundColor : 'rgba(10,200,10,.5)'
							},
							icon : [ 'btnPlay', 'btnPause' ]
						},
						buttonReplay : {
							css : {
								x : 200,
								y : 50,
								width : 80,
								height : 80,
								backgroundColor : 'rgb(100,200,100)'
							},
							icon : [ 'btnReplay' ]
						},
						buttonMute : {
							css : {
								width : 70,
								height : 70,
								backgroundColor : 'rgba(20,200,10,.5)'
							},
							icon : [ 'btnUnMute', 'btnMute' ]
						},
					},
					onControlBar : {
						controlBar : {
							constant : false,
							showOnPoster : false,
							css : {
								//height : 50,
								backgroundColor : 'rgba(250,100,20,.5)'
							}					
						},
						buttonPlayPause : {
							icon : [ 'btnPlay', 'btnPause' ]
						},
						buttonReplay : {
							icon : [ 'btnReplay' ]
						},
						buttonMute : {
							icon : [ 'btnUnMute', 'btnMute' ]
						},
						buttonFullScreen : {
							icon : [ 'btnFullScreen' ]
						},
						sliderProgress : {
							inline : true,
							css : {
								width : 120
							},
							bg : {},
							loaded : {},
							track : {},
							handle : {},

							onOver : function(){
								console.log( this.track )
							},

							onOut : function(){
								console.log( this.handle )
							}
						},
						sliderVolume : {
							css : {
								width : 60
							},
							bg : {},
							track : {},
							handle : {}
						},
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
				}
			});
		</codeblock>
		<br><br>
*/
import { Styles } from 'ad-view'
import { Gesture, GestureEvent, UIEvent } from 'ad-events'
import { UIButton, UISlider, UITextField, UIComponent } from 'ad-ui'
import UIControlBar from './ui/UIControlBar'
import UIButtonPlayPause from './ui/UIButtonPlayPause'
import UIButtonReplay from './ui/UIButtonReplay'
import UIButtonMute from './ui/UIButtonMute'
import UIButtonFullScreen from './ui/UIButtonFullScreen'
import UISliderVolume from './ui/UISliderVolume'
import UISliderProgress from './ui/UISliderProgress'
import UITimeDisplay from './ui/UITimeDisplay'

function VideoControls(player, arg) {
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// BASE CSS

	// declare base componenets first to make sure base css written to head first
	new UIButton()
	new UISlider()
	new UITextField()

	Styles.injectStylesheet(
		'RED_uiVideoControls',
		'.rvp-controls',
		'width:inherit; height:inherit; position:absolute; display:table;',
		'.rvp-screen-btn',
		'width:100%;	height:100%;',
		'.rvp-controlBar-container',
		'position:relative; width:inherit; height:inherit; vertical-align:bottom; display:table-cell;',
		'.rvp-controlBar',
		'width:100%; height:30px; position:relative;',
		'.rvp-controlBar-elem',
		'position:relative;',
		'.rvp-controlBar .left',
		'float:left;',
		'.rvp-controlBar .right',
		'float:right;',
		'.rvp-controlBar-container .ui-button',
		'width:30px; height:30px;',
		'.rvp-controlBar-container .ui-button-state',
		'background-size: 75%; background-position:50% 50%;',
		'.rvp-controlBar .ui-slider-handle',
		'height: 70%; top: 15%;',
		'.rvp-controlBar .ui-slider-bg',
		'height: 30%; top: 35%;',
		'.rvp-controlBar .ui-slider-loaded, .rvp-controlBar .ui-slider-track',
		'height:30%; top:35%;',
		//'.rvp-time-display', 'height:inherit; padding:0 5px; font-size: 12pt; line-height: 30px;',
		//'.rvp-time-display span', 'white-space: nowrap; ',
		'.rvp-progress-non-inline',
		'position:relative;',
		'.rvp-progress-non-inline .ui-slider-bg, .rvp-progress-non-inline .ui-slider-loaded, .rvp-progress-non-inline .ui-slider-handle, .rvp-progress-non-inline .ui-slider-track,  .rvp-progress-non-inline .ui-slider-hitState',
		'bottom:0px;'
	)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE PROPERTIES
	var _timeout
	var _replayOnInteraction
	var _unmuteOnInteraction
	var _includeList = [
		'buttonPlayPause',
		'buttonReplay',
		'timeDisplay',
		'sliderProgress',
		'buttonFullScreen',
		'sliderVolume',
		'buttonMute'
	]

	// is the controlbar || controlbar & progress bar
	var _controlBarTargets

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARKUP
	arg.target = arg.target || player.container
	arg.id = arg.id || 'video-controls'

	var U = new UIComponent(arg)
	Styles.addClass(U, 'rvp-controls')

	if (arg.onScreen) {
		if (arg.onScreen.onClick) {
			var screenBtn = new UIButton({
				target: U,
				onClick: arg.onScreen.onClick
			})
			Styles.addClass(screenBtn, 'rvp-screen-btn')
		}
		markup(arg.onScreen, U)
	}

	if (arg.onControlBar) {
		U.controlBarContainer = new UIComponent({
			target: U,
			id: 'rvp-controlbar-container'
		})
		Styles.addClass(U.controlBarContainer, 'rvp-controlBar-container')

		var cb = arg.onControlBar.controlBar || {}
		U.controlBar = new UIControlBar(player, {
			id: 'rvp-controlbar',
			target: U.controlBarContainer,
			css: cb.css || {},
			constant: cb.constant,
			showOnPoster: cb.showOnPoster
		})

		markup(arg.onControlBar, U.controlBar)
	}

	function markup(scope, target) {
		for (var i = 0; i < _includeList.length; i++) {
			var name = _includeList[i]
			if (scope[name] != undefined && scope[name] != false) {
				var params = scope[name]
				params.target = target
				params.id = target.id + '-' + name
				params.containChild = target == U.controlBar
				if (name != 'buttonPlayPause') {
					params.onClick = handleUIInteraction
				}
				target[name] = (function() {
					switch (name) {
						case 'buttonPlayPause':
							return new UIButtonPlayPause(player, params)
						case 'buttonReplay':
							return new UIButtonReplay(player, params)
						case 'buttonMute':
							return new UIButtonMute(player, params)
						case 'buttonFullScreen':
							return new UIButtonFullScreen(player, params)
						case 'sliderVolume':
							return new UISliderVolume(player, params)
						case 'sliderProgress':
							return new UISliderProgress(player, params)
						case 'timeDisplay':
							return new UITimeDisplay(player, params)
					}
				})()
				if (target == U.controlBar) {
					if (name == 'sliderProgress' && !scope.sliderProgress.inline) {
						continue
					}

					Styles.addClass(U.controlBar[name], 'rvp-controlBar-elem', i < 4 ? 'left' : 'right')
				}
			}
		}

		if (target == U.controlBar) {
			_controlBarTargets = [U.controlBar]

			// Moves the progress bar to top of controlBar
			if (target.sliderProgress && !scope.sliderProgress.inline) {
				Styles.addClass(target.sliderProgress, 'rvp-progress-non-inline')
				U.controlBarContainer.appendChild(target.sliderProgress)
				U.controlBarContainer.appendChild(U.controlBar)

				_controlBarTargets.push(target.sliderProgress)
			}
		}
	}

	/**
		@memberof VideoControls
		@var {UIControlBar} controlBar
			Public access to the UIControlBar instance.  All UIComponents added to this will be accessed via the variable.
	 */

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// GETTER | SETTTER
	Object.defineProperties(U, {
		/**
			@memberof VideoControls
			@var {boolean} replayOnInteraction
			@desc
				Get|Set: A Boolean that changes if the video player will start over on any click interaction, default is false.
			@example
				// GET
				console.log( myVideoPlayer.controls.replayOnInteraction );

				// SET
				myVideoPlayer.controls.replayOnInteraction = false;			
		*/
		replayOnInteraction: {
			get: () => _replayOnInteraction,
			set: state => {
				_replayOnInteraction = state

				if (!U.enabled) state = false

				Gesture[state ? 'add' : 'remove'](player.container, GestureEvent.CLICK, handleReplayOnInteraction)
			}
		},

		/**
			@memberof VideoControls
			@var {boolean} unmuteOnInteraction
			@desc
				Get|Set: A Boolean that changes if the video player will unmute on any click interaction, default is false.
			@example
				// GET
				console.log( myVideoPlayer.controls.unmuteOnInteraction );

				// SET
				myVideoPlayer.controls.unmuteOnInteraction = true;			
		*/
		unmuteOnInteraction: {
			get: () => _unmuteOnInteraction,
			set: state => {
				_unmuteOnInteraction = state

				if (!U.enabled) state = false

				Gesture[state ? 'add' : 'remove'](player.container, GestureEvent.CLICK, handleUnmuteOnInteraction)
			}
		}
	})

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = () => '[object VideoControls]'

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	function animateOut(time) {
		//console.log( U.toString() + '.animateOut()' )
		time = time != undefined ? time : 0.5

		if (U.controlBar) {
			//&& !U.controlBar.constant ){
			TweenLite.to(_controlBarTargets, time, { alpha: 0 })
		}
	}

	function animateIn() {
		//console.log( U.toString() + '.animateIn()' )
		if (U.controlBar) TweenLite.to(_controlBarTargets, 0.3, { alpha: 1 })
	}

	function hideTimeout(time) {
		return setTimeout(function() {
			if (!player.paused && U.controlBar && !U.controlBar.constant) animateOut()
		}, time)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handleMove(event) {
		clearTimeout(_timeout)
		_timeout = hideTimeout(1500)
		if (!player.complete && player.hasPlayed) animateIn()
	}

	function handlePlay(event) {
		if (U.enabled) animateIn()

		if (U.controlBar && !U.controlBar.constant) _timeout = hideTimeout(2000)
	}

	function handleUIInteraction(event) {
		if (_replayOnInteraction) handleReplayOnInteraction(event)
		if (_unmuteOnInteraction) handleUnmuteOnInteraction(event)
	}

	function handleReplayOnInteraction(event) {
		U.replayOnInteraction = false
		player.switchSource(event)
		player.play()
	}

	function handleUnmuteOnInteraction(event) {
		U.unmuteOnInteraction = false
		//if (player.muted)
		player.unmute()
	}

	function handleEnded(event) {
		U.replayOnInteraction = false
		U.unmuteOnInteraction = false
		if (U.controlBar) {
			U.controlBar.showOnPoster ? animateIn() : animateOut()
			if (U.controlBar.buttonReplay) U.controlBar.buttonPlayPause.hide()
		}
	}

	function handleBaseEnabled(event) {
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'
		player.container[listener]('mousemove', handleMove)
	}

	function handleClickBubbleStop(event) {
		GestureEvent.stop(event)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	player.screen.addEventListener('play', handlePlay)
	player.screen.addEventListener('autoplay', handlePlay)
	player.screen.addEventListener('complete', handleEnded, false)
	player.screen.addEventListener('ended', handleEnded, false)
	player.screen.addEventListener('stop', handleEnded, false)
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	U.enabled = arg.enabled != false
	U.replayOnInteraction = !!arg.replayOnInteraction
	U.unmuteOnInteraction = !!arg.unmuteOnInteraction

	if (U.controlBar && !U.controlBar.showOnPoster) animateOut(0)

	Gesture.add(player.container, GestureEvent.CLICK, handleClickBubbleStop)

	Gesture.disable(U)

	return U
}

export default VideoControls
