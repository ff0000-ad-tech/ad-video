/**
 * @class VideoPlayer
 * @desc
 * This object creates a custom Video Player instance.  This player has the ability to function as a regular player or it can work as the inline/autoplay video.
 *
 * <codeblock>
 * import { VideoPlayer } from 'ad-video'
 * </codeblock>
 *
 * <b>Sample Player</b><br>
 * <codeblock>
 * View.main.videoPlayer = new VideoPlayer({
 * 	source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
 * 	target: View.main,
 * 	id: 'My_Unique_ID',
 * 	css: {
 * 		width: 300,
 * 		height: 250
 * 	},
 * 	preload : false,
 * 	autoPlay : false,
 * 	muted : false,
 * 	volume: .8,
 * 	onComplete: function(event){
 * 		console.log( 'video complete' )
 * 	},
 * 	onFail: global.failAd,
 * })
 *
 * View.main.videoPlayer.play()
 * </codeblock>
 * <br><br>
 * <b>Sample Autoplay</b><br>
 * <codeblock>
 * View.main.videoPlayer = new VideoPlayer({
 * 	source: [
 * 		adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
 * 		adParams.videosPath + 'RED_Html5_Showcase_300x250.mpg'
 * 	],
 * 	target: View.main,
 * 	id: 'My_Unique_ID',
 * 	css: {
 * 		width: 300,
 * 		height: 250
 * 	},
 * 	preload : true,
 * 	autoPlay : true,
 * 	muted : true,
 * 	forceInline : true,
 * 	onComplete: function(event){
 * 		console.log( 'video complete' )
 * 	},
 * 	onFail: global.failAd,
 * })
 * </codeblock>
 */

/*
http://www.w3schools.com/tags/ref_av_dom.asp
http://www.w3.org/2010/05/video/mediaevents.html
http://docs.brightcove.com/en/perform/brightcove-player/guides/components.html
*/
import { Styles } from 'ad-view'
import { UIComponent, UICanvas } from 'ad-ui'
import { Device } from 'ad-external'
import { LoaderUtils, InlineLoader } from 'ad-load'
import { FrameRate } from 'ad-events'
import VideoControls from './VideoControls'
import UIPoster from './ui/UIPoster'
import CuePoints from './CuePoints'

function VideoPlayer(arg) {
	'use strict'

	Styles.injectStylesheet(
		'RED_videoPlayer',
		'video::-webkit-media-controls-start-playback-button',
		'display: none !important; -webkit-appearance: none;'
	)

	// -------------------------------------------------------------------------------------------------------------
	var V = this

	V.id = (arg.id || '' + Date.now()) + '-videoPlayer'
	V.css = arg.css || {}

	/**
	 * @memberof VideoPlayer
	 * @var {boolean} complete
	 * 	A Boolean representing if the video has ended.
	 */
	V.complete = false

	/**
	 * @memberof VideoPlayer
	 * @var {boolean} hasPlayed
	 * 	A Boolean representing if the video has played to completion.
	 */
	V.hasPlayed = false

	/**
	 * @memberof VideoPlayer
	 * @var {function} onComplete
	 * 	A callback for when the Video is finished.  Can be set as optional parameter on instantiated.
	 */
	V.onComplete = arg.onComplete || function() {}

	/**
	 * @memberof VideoPlayer
	 * @var {function} onFail
	 * 	A callback for when the Video fails.  Can be set as optional parameter on instantiated.
	 */
	V.onFail = arg.onFail || function() {}

	/**
	 * @memberof VideoPlayer
	 * @var {function} onBuffer
	 * 	A callback for when the Video pauses due to buffering.  Can be set as optional parameter on instantiated.
	 */
	V.onBuffer = arg.onBuffer || function() {}

	/**
	 * @memberof VideoPlayer
	 * @var {function} onProgress
	 * 	A callback for when as Video progresses while playing.  Can be set as optional parameter on instantiated.
	 */
	V.onProgress = arg.onProgress || function() {}

	/**
	 * @memberof VideoPlayer
	 * @var {function} onReady
	 * 	A callback for when Video is buffered and ready to play.
	 */
	V.onReady = arg.onReady || function() {}

	var _driver = null
	var _IEuseEvent = false
	var _IESource = null
	var _cuePoints = new CuePoints(arg.cuePoints)
	var _muted = !!arg.muted
	var _preload = !!arg.preload
	var _autoPlay = !!arg.autoPlay
	var _hasMpg = arg.source && arg.source.indexOf('.mpg') >= 0
	var _mpeg = null
	var _source = []
	var _forceInline = !!arg.forceInline
	var _forceMpg = !!arg.forceMpg
	var _deviceType = arg.deviceType || Device.type
	var _deviceBrand = arg.deviceBrand || Device.brand

	// -------------------------------------------------------------------------------------------------------------
	// MARKUP

	// main container
	arg.id = V.id

	// allow control bar to sit on bottom when using % for width/height
	//arg.css.display = 'table'

	/**
	 * @memberof VideoPlayer
	 * @var {UIComponent} container
	 * 	A &lt;div>, the top level container for the entire player instance.
	 */
	V.container = new UIComponent(arg)

	// video element
	var videoTag = document.createElement('video')
	videoTag.id = V.id + '-screen'
	videoTag.setAttribute('type', 'application/octet-stream')
	videoTag.style.width = 'inherit'
	videoTag.style.height = 'inherit'
	videoTag.style.position = 'absolute'
	videoTag.style.backgroundColor = '#000'
	//videoTag.autoplay = _autoPlay;
	videoTag.muted = _muted
	videoTag.preload = 'none' //_preload ? 'auto' : 'none';

	V.container.appendChild(videoTag)

	// must be there incase an MPG is needed AFTER creation
	V.mpgScreen = new UICanvas({
		target: V.container,
		id: V.id + '-mpg-screen',
		css: {
			width: arg.css.width,
			height: arg.css.height
		}
	})

	V.underControls = document.createElement('div')
	V.underControls.id = V.id + '-underControls'
	V.underControls.style.position = 'absolute'
	V.container.appendChild(V.underControls)

	var video = videoTag

	/**
	 * @memberof VideoPlayer
	 * @var {video} screen
	 * 	The &lt;video> element, or if autoplay on a device, will return the driver object.
	 */
	V.screen = video

	// -------------------------------------------------------------------------------------------------------------
	// GETTERS | SETTERS
	Object.defineProperties(V, {
		/**
		 * @memberof VideoPlayer
		 * @var {boolean} autoPlay
		 * 	A Boolean that changes if the video will automatically play.
		 * @example
		 * 	myVideoPlayer.autoPlay = false;
		 */
		autoPlay: {
			get: () => _autoPlay,
			set: value => {
				_autoPlay = value

				// console.log('\t_autoPlay:', _autoPlay)
				// console.log('\t_forceInline:', _forceInline)
				// console.log('\t_forceMpg:', _forceMpg)
				// console.log('\t_muted:', _muted)
				//console.log('Setting autoplay:', value, _deviceType, _deviceBrand);

				if (_forceMpg) {
					loadMpgPlayer()
				} else {
					if (value) {
						if (_deviceType != 'desktop') {
							if (_deviceBrand == 'android') {
								// load MpegPlugin player, or assign player
								loadMpgPlayer()
							} else {
								// apple assign driver
								prepareInlineDriver()
							}
						}
					} else {
						if (_forceInline && Device.product == 'iphone') {
							//if ( _muted ){
							prepareInlineDriver()
							//} else {
							//	prepareInlineAudio();
							//}
						} else {
							// kill custom players, reset to regular player
							V.screen = video = videoTag
							killInlineDriver()

							// delete the MpegPlugin canvas ?
							if (_mpeg) {
								_mpeg.canvas.style.visibility = 'hidden'
							}
						}
					}
				}
			}
		},

		/**
		 * @memberof VideoPlayer
		 * @var {number} currentTime
		 * 	A Number representing the video time position.
		 */
		currentTime: {
			get: () => video.currentTime
		},

		/**
		 * @memberof VideoPlayer
		 * @var {number} duration
		 * 	A Number representing the length of the video in seconds.
		 */
		duration: {
			get: () => video.duration || 0
		},

		/**
		 * @memberof VideoPlayer
		 * @var {boolean} paused
		 * 	A Boolean representing if the video is playing.
		 */
		paused: {
			get: () => {
				return _driver ? _driver.paused : video.paused
			}
		},

		/**
		 * @memberof VideoPlayer
		 * @var {number} percent
		 * 	A Number 0-1 representing the video timeline percent position.
		 */
		percent: {
			get: () => video.currentTime / video.duration || 0
		},

		/**
		 * @memberof VideoPlayer
		 * @var {string} source
		 * 	Changes the source of the video.  Pass a string of the video file path to set.
		 * @example
		 * 	myVideoPlayer.source = 'videos/myVideoFile.mp4';
		 */
		source: {
			get: () => video.src,
			set: value => {
				if (Array.isArray(value)) {
					_hasMpg = false
					value.sort((a, b) => {
						var aExt = LoaderUtils.getFileType(a)
						var bExt = LoaderUtils.getFileType(b)

						var aIs = aExt == 'mpg' || aExt == 'js'
						var bIs = bExt == 'mpg' || bExt == 'js'

						_hasMpg = aIs || bIs

						// console.log('\n\n\t', aExt, bExt, aIs, bIs, '_hasMpg:', _hasMpg, '\n\n')
						return aIs ? 1 : -1
					})
				} else {
					value = [value]
				}

				for (var i = 0; i < value.length; i++) {
					value[i] = matchProtocolTo(value[i])
				}
				_source = value.slice()

				video.preload = 'none'

				// when using mpg for AlphaVideo or autoplay, do not set source as it errors & load each video type.
				// when switchSource() used, .mpg is removed
				if ((_hasMpg && _deviceBrand == 'android') || _forceMpg) return

				video.src = value[0]
			}
		},

		/**
		 * @memberof VideoPlayer
		 * @var {number} volume
		 * 	Changes the volume of the video.  Assign a number, between 0 - 1 to set the volume.
		 * @example
		 * 	myVideoPlayer.volume = .8;
		 */
		volume: {
			get: () => {
				return _driver && _driver instanceof Audio ? _driver.volume : videoTag.volume
			},
			set: value => {
				videoTag.volume = value
				if (_driver) {
					_driver.volume = value
				}
				//console.log(value, videoTag.volume, V.screen.volume, V.screen.muted );
			}
		},

		/**
		 * @memberof VideoPlayer
		 * @var {boolean} muted
		 * 	A Boolean representing if the video volume is muted.
		 */
		muted: {
			get: () => _muted
		},

		/**
		 * @memberof VideoPlayer
		 * @var {boolean} forceInline
		 * 	A Boolean to force the video to play inline, NOTE: applies only to iphone iOS < 10
		 */
		forceInline: {
			get: () => _forceInline,
			set: value => {
				_forceInline = value

				// assign autoPlay to itself, but after changing the inline prop
				V.autoPlay = _autoPlay
			}
		}
	})

	// -------------------------------------------------------------------------------------------------------------
	// PUBLIC METHODS
	/**
	 * @memberof VideoPlayer
	 * @method load
	 * @desc
	 * 	Loads the current video source. If preload is true, this is redundant.
	 * @example
	 * 	myPlayer.load()
	 */
	V.load = () => {
		// console.log('VideoPlayer.load()')
		addIESource()
		video.load()
	}

	/**
	 * @memberof VideoPlayer
	 * @method play
	 * @desc
	 * 	Plays the current video.
	 * @example
	 * 	myPlayer.play()
	 */
	V.play = () => {
		// console.log('VideoPlayer.play(), video.paused:', video.paused)
		addIESource()

		V.complete = false

		// In Safari, if the preload=none attribute is present, plays will not fire when called manually
		video.removeAttribute('preload')

		FrameRate.register(V, handleProgress)

		V.hasPlayed = true

		// check for device / inline here, then call play() vs inlinePlay()
		if (_driver) {
			inlinePlay()
		} else {
			video.play()
		}

		if (_IEuseEvent) {
			// console.log('VideoPlayer.play -> dispatch custom "play" event')
			video.dispatchEvent(new CustomEvent('play'))
		}
	}

	/**
	 * @memberof VideoPlayer
	 * @method pause
	 * @desc
	 * 	Pauses the current video.
	 * @example
	 * 	myPlayer.pause()
	 */
	V.pause = () => {
		// console.log('VideoPlayer.pause()')
		addIESource()

		FrameRate.unregister(V, handleProgress)

		// check for device / inline here, then call pause() vs inlinePause()
		if (_driver) {
			inlinePause()
		} else {
			video.pause()
		}
	}

	/**
	 * @memberof VideoPlayer
	 * @method seek
	 * @param {number} sec
	 * 	The time to skip the video to in seconds.
	 * @desc
	 * 	Skips the video to a specific time.
	 * @example
	 * 	myPlayer.seek(4)
	 */
	V.seek = sec => {
		// console.log('VideoPlayer.seek()', sec)
		if (addIESource()) return

		_cuePoints.seeked = true
		if (sec > video.duration) sec = video.duration
		else V.complete = false

		if (video == _mpeg) {
			// MpegPlugin
			video.seek(sec)
		} else {
			/*if ( _driver instanceof Audio ) {
				_driver.currentTime = sec;
			} else {*/
			video.currentTime = sec
			//}
		}
	}

	/**
	 * @memberof VideoPlayer
	 * @method stop
	 * @desc
	 * 	Stops the video and resets it to the beginning.
	 * @example
	 * 	myPlayer.stop()
	 */
	V.stop = () => {
		// console.log('VideoPlayer.stop()')
		if (addIESource()) return
		V.pause()

		// for checks in controlBar
		V.complete = true

		video.currentTime = 0
		video.dispatchEvent(new CustomEvent('stop'))
	}

	/**
	 * @memberof VideoPlayer
	 * @method mute
	 * @desc
	 * 	Mutes the Video Player, does not change the volume.
	 * @example
	 * 	myVideoPlayer.mute()
	 */
	V.mute = () => {
		// console.log('VideoPlayer.mute()', video.muted)
		video.muted = _muted = true
		if (_driver) {
			_driver.muted = true
		}
	}

	/**
	 * @memberof VideoPlayer
	 * @method unmute
	 * @desc
	 * 	Unmutes the Video Player, does not change the volume.
	 * @example
	 * 	myVideoPlayer.unmute()
	 */
	V.unmute = () => {
		// console.log('VideoPlayer.unmute()', video.muted)
		video.muted = _muted = false
		if (_driver) {
			_driver.muted = false
		}
	}

	/**
	 * @memberof VideoPlayer
	 * @method resize
	 * @param {number} width
	 * 	A number of the width
	 * @param {number} height
	 * 	A number of the height
	 * @desc
	 * 	Changes the size of the Video Player
	 * @example
	 * 	myVideoPlayer.resize(400, 300)
	 */
	V.resize = (width, height) => {
		video.width = V.css.width = width
		video.height = V.css.height = height

		V.container.style.width = width + 'px'
		V.container.style.height = height + 'px'
	}

	/**
	 * @memberof VideoPlayer
	 * @method addCuePoint
	 * @param {number} time
	 * 	The time, in seconds, to fire the call back.
	 * @param {function} handler
	 * 	A callback function.
	 * @param {object} params
	 * 	Optional parameters to pass back through the call back.
	 * @desc
	 * 	Add to the load queue: a single or array of files or even another Loader.
	 * @example
	 * myVideoPlayer.addCuePoint(3, handleCuePoint, [true, .3, {}])
	 *
	 * function handleCuePoint(isVar, num, obj) {
	 * 	console.log('cue point', isVar, num, obj)
	 * }
	 */
	V.addCuePoint = (time, handler, params) => {
		_cuePoints.add(time, handler, params)
	}

	/**
	 * @memberof VideoPlayer
	 * @method addControls
	 * @desc
	 * 	Adds VideoControls to the VideoPlayer instance. Used only if controls NOT passed thru on instantiation.
	 * @param {object} obj
	 * 	An object of desired controls, see {@link VideoControls}
	 * @example
	 * myVideoPlayer.addControls({
	 * 	controlBar : {
	 * 		buttonPlayPause : true,
	 * 		progressControl : true,
	 * 		buttonFullScreen : true
	 * 	}
	 * })
	 */
	V.addControls = obj => {
		if (!V.controls) V.controls = new VideoControls(V, obj)
	}

	V.addPoster = obj => {
		if (!V.poster) {
			if (typeof obj == 'string') {
				obj = {
					source: obj
				}
			}
			V.poster = new UIPoster(V, obj)
		}
	}

	// used by VideoControls for switching from .mpg > .mp4 on interaction
	V.switchSource = event => {
		if (_hasMpg && _deviceBrand == 'android' && _source.length > 1) {
			_mpeg.pause()
			V.autoPlay = false
			_source.splice(-1, 1)
			V.source = _source
		} else {
			V.seek(0)
		}
	}

	V.show = V.container.show
	V.hide = V.container.hide

	// -------------------------------------------------------------------------------------------------------------
	// PRIVATE METHODS
	function addIESource() {
		// console.log('addIESource(), _IESource:', _IESource)
		if (_IESource) {
			V.source = _IESource
			_IESource = null
			return true
		}
		return false
	}

	function prepareInlineAudio(event) {
		// console.log('prepareInlineAudio()')
		// console.log('\tvideo.currentSrc:', video.currentSrc)
		// console.log('\tvideo.src:', video.src)
		var audio = new Audio()
		audio.src = video.currentSrc || video.src
		_driver = audio
	}

	function prepareInlineDriver() {
		// console.log('prepareInlineDriver(), _muted =', _muted)

		_driver = {
			muted: true,
			paused: true,
			pause: function pause() {
				_driver.paused = true
			},
			play: function play() {
				_driver.paused = false
				if (video.currentTime === video.duration) {
					video.currentTime = 0
				}
			},
			volume: 0
		}

		toggleInlineEventKillers(true)
	}

	function killInlineDriver() {
		_driver = null
		toggleInlineEventKillers(false)
	}

	function toggleInlineEventKillers(enabled) {
		var listener = enabled ? 'addEventListener' : 'removeEventListener'
		video[listener]('seeking', handleEventKill, false)
		video[listener]('seeked', handleEventKill, false)
		video[listener]('ended', handleEventKill, false)
	}

	function inlinePlay() {
		console.log('inlinePlay(), video.buffered.length:', video.buffered.length)

		if (video.webkitDisplayingFullscreen) {
			video.play()
			//_defaultPlay();
			return
		}

		if (!_muted) {
			prepareInlineAudio()
			// call play here because it is in the chain of the click event
			V.hasPlayed = true
			_driver.play()
			_driver.pause()
		}

		if (!video.buffered.length) {
			video.addEventListener('canplay', handleInlineLoadedData, false)
			V.load()
			// console.log('__ __ video.load() __ __ ??')
		} else {
			inlineCanPlay()
		}
	}

	function handleInlineLoadedData(event) {
		// console.log('.... handleInlineLoadedData() ....')
		inlineCanPlay()
	}

	function inlineCanPlay() {
		// console.log('_ _ _ inlineCanPlay() _ _ _ through _ _ _')

		V.hasPlayed = true
		_driver.play()

		FrameRate.register(V, handleFrameRate)

		video.dispatchEvent(new CustomEvent('play'))
		video.dispatchEvent(new CustomEvent('playing'))
	}

	function inlinePause() {
		// console.log('* * * inlinePause() * * *')

		_driver.pause()

		FrameRate.unregister(V, handleFrameRate)

		video.dispatchEvent(new CustomEvent('pause'))

		if (video.ended || video.currentTime >= video.duration) {
			video.dispatchEvent(new CustomEvent('ended'))
		}

		if (video.webkitDisplayingFullscreen) {
			video.pause()
			//_defaultPause()
		}
	}

	function loadMpgPlayer() {
		// console.log('VideoPlayer.loadMpgPlayer(), global.MpegPlugin:', global.MpegPlugin, ', _hasMpg:', _hasMpg)
		if (global.MpegPlugin == undefined && _hasMpg) {
			import('@size/../node_modules/@ff0000-ad-tech/ad-video/lib/mpg/MpegPlugin.js')
				.then(module => {
					global['MpegPlugin'] = module.default
					V.screen = video = _mpeg = new MpegPlugin({
						source: _source[_source.length - 1],
						tag: videoTag,
						target: V,
						autoplay: false,
						onReady: () => {
							handleCanPlay()
							V.hasPlayed = _autoPlay
							if (_autoPlay) V.play()
						},
						onFail: handleError
					})
					// resolve()
				})
				.catch(err => handleError())
		} else {
			V.screen = video = _mpeg
		}
	}

	// -------------------------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	function handleFrameRate(event) {
		var time = void 0
		if (_muted) {
			time = video.currentTime + event.diffTime / 1000
		} else {
			time = _driver.currentTime
		}

		var duration = video.duration || 0

		var min = Math.min(duration, time)

		video.currentTime = min

		//console.log( _driver.currentTime, video.currentTime )
		//console.log( video.paused, duration, video.duration, time, min, video.currentTime )
		//console.log( 'handleFrameRate()', video.ended, video.currentTime, duration, video.currentTime >= video.duration )

		if (video.ended || video.currentTime >= video.duration) {
			V.pause()
		}
	}

	function handleCanPlay(event) {
		// console.log('\n\n\t\t\t...CAN PLAY\n\n')
		V.onReady.call(V, event)
	}

	function handleProgress(event) {
		// console.log('handleProgress()')
		V.onProgress.call(V, event)

		_cuePoints.check(V, V.currentTime)
	}

	function handleComplete(event) {
		// console.log(':: VideoPlayer :: handleComplete()')
		_cuePoints.seeked = true

		if (!_driver) V.pause()

		V.complete = true
		V.onComplete.call(V, event)

		video.dispatchEvent(new CustomEvent('complete'))

		_IEuseEvent = document.createEventObject != undefined || Device.browser == 'ie'
	}

	function handleError(event) {
		console.log(':: VideoPlayer :: handleError()')
		V.onFail.call(V, event)
	}

	function handleBuffer(event) {
		V.onBuffer.call(V, event)
	}

	function handleEventKill(event) {
		event.stopImmediatePropagation()
	}

	function handleVolumeChange(event) {
		_muted = video.muted
	}

	// -------------------------------------------------------------------------------------------------------------
	// COMPONENTS
	if (arg.poster) V.addPoster(arg.poster)

	if (arg.controls) V.addControls(arg.controls)

	// -------------------------------------------------------------------------------------------------------------
	video.addEventListener('ended', handleComplete, false)
	video.addEventListener('error', handleError, false)
	video.addEventListener('waiting', handleBuffer, false)
	video.addEventListener('canplay', handleCanPlay, false)
	video.addEventListener('volumechange', handleVolumeChange, false)

	if (arg.crossOrigin) {
		video.setAttribute('crossOrigin', arg.crossOrigin)
		if (V.mpgScreen) V.mpgScreen.setAttribute('crossOrigin', arg.crossOrigin)
	}

	if (arg.source) {
		if (Device.browser == 'ie' && !_preload) {
			_IESource = arg.source
		} else {
			V.source = arg.source
		}
	}
	V.autoPlay = _autoPlay

	if (!_muted && arg.volume) {
		V.volume = arg.volume
	}

	if (arg.source) {
		if (_autoPlay) {
			if (_deviceType == 'desktop') {
				// possible race condition with loading MpegPlugin for AlphaVideoPlayer
				V.play()
			} else {
				if (_muted && _deviceBrand != 'android') {
					V.play()
				}
			}
		} else if (_preload) {
			V.load()
		}
	}
}

export default VideoPlayer
