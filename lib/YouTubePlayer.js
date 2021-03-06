/**
 * @npmpackage
 * @class YouTubePlayer
 * @desc
 * 	This Object creates and manages a YouTube player embed.
 * 	<br><br>
 * 	The native YouTube API has many flaws in its logic along with several limtations. YouTubePlayer attempts to bridge some of those short comings,
 * 	while at the same time following as closely as possible the same methods and patterns of our native VideoPlayer.
 * 	<br><br>
 * 	Something to note: The initial call to the YouTube API actually loads in an iFrame, so there can be a delay
 * 	when first seeing your player, there is nothing that can be doen about that. Since it is loading an iFrame, things such as the controls, fullscreen
 * 	ability, showing video info are set on the load. This class can toggle those things, but it will cause the whole iFrame to reload. If you are only
 * 	changing videos, with no other updates, there will be a seemless transition to the next video.
 * @example
 * import { YouTubePlayer } from 'ad-video'
 *
 * // adds a player on the Main container
 * T.videoPlayer = new YouTubePlayer({
 * 	id: 'intro',
 * 	target: T,
 * 	css : {
 * 		x: 0,
 * 		y: 0,
 * 		width : 446,
 * 		height : 250
 * 	},
 *
 * 	videoId: 'EcB59kdjJfw',
 * 	autoPlay: true,
 * 	muted: true,
 * 	quality: 'hd720',
 * 	showInfo: false,
 * 	inlineYouTubeLogo: true,
 * 	allowFullScreen: false,
 * 	allowAnnotations: true,
 *
 * 	onReady: null,
 * 	onComplete : null,
 * 	onPlay: null,
 * 	onPause: null,
 * 	onBuffer: null,
 * 	onFail: null,
 *
 * 	controls: false
 * })
 */
import { UIComponent, UIDiv } from 'ad-ui'
import { FrameRate } from 'ad-events'
import * as MediaEvent from './events/MediaEvent'
import VideoControls from './VideoControls'
import UIPoster from './ui/UIPoster'
import CuePoints from './CuePoints'
// YT from globally available YouTube Player API

function YouTubePlayer(arg) {
	var V = this

	var _initMuted = !!arg.muted

	V.id = (arg.id || '' + Date.now()) + '-youTubePlayer'
	V.css = arg.css

	// create a dummy dom element to dispatch events thru
	V.screen = document.createElement('span')
	V.isReplay = false

	/**
	 * @memberof YouTubePlayer
	 * @var {boolean}	paused
	 * 	A Boolean representing if the video is playing.
	 */
	V.paused = !arg.autoPlay

	/**
	 * @memberof YouTubePlayer
	 * @var {number} percent
	 * 	A Number 0-1 representing the video timeline percent position.
	 */
	V.percent = 0

	/**
	 * @memberof YouTubePlayer
	 * @var {number} currentTime
	 * 	A Number representing the video time position.
	 */
	V.currentTime = 0
	V.duration = 0

	/**
	 * @memberof YouTubePlayer
	 * @var {boolean} complete
	 * 	A Boolean representing if the video has ended.
	 */
	V.complete = false

	// Constructor arguments
	/**
	 * @memberof YouTubePlayer
	 * @var {function} onReady
	 * 	A callback for when the Video is able to be played.  Can be set as optional parameter on instantiation.
	 */
	V.onReady = arg.onReady || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onComplete
	 * 	A callback for when the Video is finished.  Can be set as optional parameter on instantiation.
	 */
	V.onComplete = arg.onComplete || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onFail
	 * 	A callback for when the Video fails.  Can be set as optional parameter on instantiation.
	 */
	V.onFail = arg.onFail || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onBuffer
	 * 	A callback for when the Video pauses due to buffering.  Can be set as optional parameter on instantiation.
	 */
	V.onBuffer = arg.onBuffer || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onProgress
	 * 	A callback for when as Video progresses while playing.  Can be set as optional parameter on instantiation.
	 */
	V.onProgress = arg.onProgress || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onPlay
	 * 	A callback for when as Video plays, helpful since controls are internal to iFrame.  Can be set as optional parameter on instantiation.
	 */
	V.onPlay = arg.onPlay || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onAutoPlay
	 * 	A callback for when as Video auto-plays. Can be set as optional parameter on instantiation.
	 */
	V.onAutoPlay = arg.onAutoPlay || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onStop
	 * 	A callback for when as Video is stopped. Can be set as optional parameter on instantiation.
	 */
	V.onStop = arg.onStop || function() {}

	/**
	 * @memberof YouTubePlayer
	 * @var {function} onPause
	 * 	A callback for when as Video pauses, helpful since controls are internal to iFrame. Can be set as optional parameter on instantiation.
	 */
	V.onPause = arg.onPause || function() {}

	// -------------------------------------------------------------------------------------------------------------
	// PRIVATE PROPERTIES
	var _videoId = arg.videoId
	var _autoPlay = arg.autoPlay
	var _sourceCalled = false
	var _readyHeard = false
	var _hasAutoPlayed = false
	var _isStopCalled = false

	// a class level object holding the NEXT state of the player, used in conjunction with getter/setters
	var _classPlayerParams = {
		autoplay: arg.autoPlay ? 1 : 0,
		controls: arg.nativeControls ? 1 : 0,
		showinfo: arg.showInfo ? 1 : 0,
		modestbranding: arg.inlineYouTubeLogo ? 0 : 1,
		fs: arg.allowFullScreen ? 1 : 0,
		rel: arg.showRelatedVideos ? 1 : 0,
		iv_load_policy: arg.allowAnnotations ? 1 : 3,
		vq: arg.quality || 'medium'
	}

	// a player level obect holding the current state of the player when instantiated. Initally equal to _classPlayerParams
	var _currentPlayerParams = {}
	for (var p in _classPlayerParams) {
		_currentPlayerParams[p] = _classPlayerParams[p]
	}

	var _cuePoints = new CuePoints(arg.cuePoints)

	// -------------------------------------------------------------------------------------------------------------
	// MARKUP
	arg.id = V.id
	if (!arg.css.hasOwnProperty('backgroundColor')) arg.css.backgroundColor = '#000000'

	/**
	 * @memberof YouTubePlayer
	 * @var {UIComponent} container
	 * 	A &lt;div>, the top level container for the entire player instance.
	 */
	V.container = new UIComponent(arg)

	var holder = new UIDiv({
		target: V.container,
		css: {
			width: V.css.width,
			height: V.css.height
		}
	})

	// -------------------------------------------------------------------------------------------------------------
	// GETTERS | SETTERS
	Object.defineProperties(V, {
		/**
		 * @memberof YouTubePlayer
		 * @var {number} volume
		 * 	Changes the volume of the video.  Assign a number, between 0 - 1 to set the volume.
		 * @example
		 * 	myVideoPlayer.volume = .8;
		 */
		volume: {
			/*get: function() {
				return _autoPlay;
			},*/
			get: function() {
				return V.player && V.player.getVolume ? V.player.getVolume() : -1
			},
			set: function(value) {
				V.player.setVolume(value)
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {string} source
		 * 	Changes the source of the video by passing in a string of the video YouTube ID to set.
		 * @example
		 * 	myVideoPlayer.source = "k_5IXGmoLMY";
		 */
		source: {
			get: function() {
				return _videoId
			},
			set: function(value) {
				_sourceCalled = true
				_videoId = value

				console.log('YouTubePlayer.source:', value)

				FrameRate.unregister(V, handleTimeUpdate, 3)

				if (_readyHeard) {
					updateSource()
				}
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {string} url
		 * 	Gets the URL to current playing YouTube video.
		 * @example
		 * 	console.log( myVideoPlayer.url );
		 */
		url: {
			get: function() {
				return V.player && V.player.getVideoUrl ? V.player.getVideoUrl() : ''
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {boolean} autoPlay
		 * 	A boolean to define if the video will automatically play.
		 * @example
		 * 	myVideoPlayer.autoPlay = false;
		 */
		autoPlay: {
			get: function() {
				return video.autoplay
			},
			set: function(value) {
				_autoPlay = value
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {boolean} muted
		 * 	A boolean to read if the player is muted
		 * @example
		 * 	console.log( myVideoPlayer.muted );
		 */
		muted: {
			get: function() {
				return V.player && V.player.isMuted ? V.player.isMuted() : false
			}
		},

		// ----------------------------------------------
		// GETTERS | SETTERS for on reload / next video

		/**
		 * @memberof YouTubePlayer
		 * @var {boolean} nativeControls
		 * 	A boolean whether or not the player has nativeControls/progress bar.
		 * 	NOTE: Requires a iFrame reload, so only take place on a video load or replay
		 * @example
		 * 	myVideoPlayer.nativeControls = false;
		 */
		nativeControls: {
			get: function() {
				return _classPlayerParams.controls
			},
			set: function(value) {
				_classPlayerParams.controls = value ? 1 : 0
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {boolean} allowFullScreen
		 * 	A boolean whether or not the fullscreen button is displayed.
		 * 	NOTE: Requires a iFrame reload, so only take place on a video load or replay
		 * @example
		 * 	myVideoPlayer.allowFullScreen = false;
		 */
		allowFullScreen: {
			get: function() {
				return _classPlayerParams.fs
			},
			set: function(value) {
				_classPlayerParams.fs = value ? 1 : 0
			}
		},

		/**
		 * @memberof YouTubePlayer
		 * @var {string} quality
		 * 	A string representing the quality type, follows YouTube paradigm, that assigns the playback quality of the video.
		 * 	NOTE: Requires a iFrame reload, so only take place on a video load or replay
		 * @example
		 * 	myVideoPlayer.quality = "hd720";
		 */
		quality: {
			get: function() {
				return _classPlayerParams.vq
			},
			set: function(value) {
				_classPlayerParams.vq = str

				// manually set thru API
				V.player.setPlaybackQuality(str)
				// assign to current params to avoid a player reload unnecessarily
				_currentPlayerParams.vq = str
			}
		}
	})

	// -------------------------------------------------------------------------------------------------------------
	// PUBLIC METHODS

	/**
	 * @memberof YouTubePlayer
	 * @method hide
	 * @desc
	 * 	Hides the entire player.
	 * @example
	 * 	myVideoPlayer.hide();
	 */

	/*V.hide = function(){
		console.log( V.player )
		V.player.a.style.display = 'none';
	}*/
	V.hide = V.container.hide

	/**
	 * @memberof YouTubePlayer
	 * @method show
	 * @desc
	 * 	Shows the entire player.
	 * @example
	 * 	myVideoPlayer.show();
	 */
	/*V.show = function(){
		try {
			//console.log( "     try V.player.f.style.removeProperty ( 'display' )")
			V.player.a.style.removeProperty ( 'display' );
		} catch (e) {
			//console.log( '     catch V.player.f.style.display = null;')
			V.player.a.style.display = null;
		}
	}*/
	V.show = V.container.show

	/**
	 * @memberof YouTubePlayer
	 * @method play
	 * @desc
	 * 	Plays the current video.
	 * @example
	 * 	myVideoPlayer.play();
	 */
	V.play = function() {
		//console.log( ' -- YouTubePlayer.play()')
		V.player.playVideo()
	}

	/**
	 * @memberof YouTubePlayer
	 * @method pause
	 * @desc
	 * 	Pauses the current video.
	 * @example
	 * 	myVideoPlayer.pause();
	 */

	V.pause = function() {
		//console.log( ' -- YouTubePlayer.pause()')
		if (V.player.pauseVideo) V.player.pauseVideo()
	}

	/**
	 * @memberof YouTubePlayer
	 * @method seek
	 * @param {number} sec
	 * 	The time to skip the video to in seconds.
	 * @desc
	 * 	Skips the video to a specific time.
	 * @example
	 * 	myVideoPlayer.seek(4);
	 */
	V.seek = function(sec) {
		console.log('seekTo:', sec)
		_cuePoints.seeked = true
		if (sec > V.duration) sec = V.duration
		else V.complete = false
		V.player.seekTo(sec)
	}

	/**
	 * @memberof YouTubePlayer
	 * @method stop
	 * @desc
	 * 	Pauses the video and resets its time to 0
	 * @example
	 * 	myVideoPlayer.stop()
	 */
	V.stop = function() {
		fireEvent(MediaEvent.STOP, V.onStop)
		// if complete, the seek event will fire a pause event, if not, then
		// set this to the opposite state of paused, because onStateChange not fired when already paused
		// so reset won't get called
		_isStopCalled = V.complete ? true : !V.paused

		V.player.seekTo(0)
		V.pause()
	}

	/**
	 * @memberof YouTubePlayer
	 * @method mute
	 * @desc
	 * 	Mutes the Video Player, does not change the volume.
	 * @example
	 * 	myVideoPlayer.mute()
	 */
	V.mute = function() {
		if (V.player.mute) {
			V.player.mute()
			fireEvent(MediaEvent.MUTE)
		}
		V.muted = true
	}

	/**
	 * @memberof YouTubePlayer
	 * @method unmute
	 * @desc
	 * 	Unmutes the Video Player, does not change the volume.
	 * @example
	 * 	myVideoPlayer.unmute()
	 */
	V.unmute = function() {
		if (V.player.unMute) {
			V.player.unMute()
			fireEvent(MediaEvent.UNMUTE)
		}
		V.muted = false
	}

	//V.resize = function(){}

	/**
	 * @memberof YouTubePlayer
	 * @method addCuePoint
	 * @param {number} time
	 * 	The time, inseconds, to fire the call back.
	 * @param {function} handler
	 * 	A callback function.
	 * @param {object} params
	 * 	Optional parameters to pass back through the call back.
	 * @desc
	 * 	Add to the load queue: a single or array of files or even another Loader.
	 * @example
	 * myVideoPlayer.addCuePoint ( 3, handleCuePoint, [ true, .3, {} ])
	 *
	 * function handleCuePoint ( isVar, num, obj ){
	 * 	console.log( 'cue point', isVar, num, obj );
	 * }
	 */
	V.addCuePoint = function(time, handler, params) {
		_cuePoints.active = true
		var cuePoint = {
			time: time,
			handler: handler,
			frame: -1,
			params: params || null,
			past: false
		}
		_cuePoints.pool.push(cuePoint)

		_cuePoints.pool.sort(function(a, b) {
			return a.time - b.time
		})
		//_cuePoints.first = _cuePoints.pool[0].time;
		console.log('add:', _cuePoints)
	}

	V.addControls = function(obj) {
		if (!V.controls) V.controls = new VideoControls(V, obj)
	}

	V.addPoster = function(obj) {
		if (!V.poster) {
			if (typeof obj == 'string') {
				obj = { source: obj }
			}
			V.poster = new UIPoster(V, obj)
		}
	}

	// -------------------------------------------------------------------------------------------------------------
	// PRIVATE METHODS
	function updateSource() {
		// console.log('*******> updateSource()')
		if (checkPlayerParams()) {
			_readyHeard = false
			createPlayer()
		} else {
			V.player.cueVideoById(_videoId) //.loadVideoById
		}
	}

	function createPlayer() {
		// console.log('++++++++++ YouTubePlayer.createPlayer()')
		if (V.player) {
			V.player.destroy()
		}
		V.player = new YT.Player(holder, {
			width: arg.css.width,
			height: arg.css.height,
			videoId: _videoId,
			playerVars: _currentPlayerParams
		})
		V.player.addEventListener('onReady', handlePlayerReady)
		V.player.addEventListener('onStateChange', handleStateChange)
		V.player.addEventListener('onError', handleFail)
		_hasAutoPlayed = false
	}

	function checkPlayerParams() {
		var recreate = false
		// console.log('checkPlayerParams():', _currentPlayerParams)
		for (var p in _classPlayerParams) {
			// console.log('     ->', p, '=', _currentPlayerParams[p], _classPlayerParams[p])
			if (_currentPlayerParams[p] != _classPlayerParams[p]) {
				_currentPlayerParams[p] = _classPlayerParams[p]
				recreate = true
				// console.log('   ==== RECREATE ====')
			}
		}

		return recreate
	}

	function fireEvent(type, callback, event) {
		if (callback) callback.call(V, event)
		V.screen.dispatchEvent(new CustomEvent(type))
	}

	// -------------------------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	function handlePlayerReady(event) {
		// console.log(' -- READY -- handlePlayerReady()')
		_readyHeard = true
		console.log('\t\t muted:', V.muted)
		if (_sourceCalled) {
			updateSource()
			return
		}

		//V.duration = V.player.getDuration();

		_initMuted ? V.player.mute() : V.player.unMute()

		fireEvent(MediaEvent.READY, V.onReady, event)
		// console.log('\t\t after ready fire, muted:', V.muted)
		if (arg.autoPlay) V.play()
	}

	function handleStateChange(event) {
		// console.log(' -- YoutubePlayer stageChange()')
		switch (event.data) {
			// YT.PlayerState.UNSTARTED
			case -1:
				// console.log('\t UNSTARTED = -1')
				_initMuted ? V.player.mute() : V.player.unMute()
				V.paused = true
				break

			// YT.PlayerState.BUFFERING
			case 3:
				// console.log('\t BUFFERING = 3')
				fireEvent(MediaEvent.BUFFER, V.onBuffer, event)
				break

			// YT.PlayerState.PLAYING
			case 1:
				// console.log('\t PLAYING = 1', V.player.getDuration())
				V.duration = V.player.getDuration()
				V.paused = false
				V.complete = false

				// checks for a SEEK faux event, for use with cue points
				if (Math.abs(V.player.getCurrentTime() - V.currentTime) > 0.5) {
					_cuePoints.seeked = true
				}

				FrameRate.register(V, handleTimeUpdate, 3)

				if (_autoPlay && !_hasAutoPlayed) {
					_hasAutoPlayed = true
					fireEvent(MediaEvent.AUTOPLAY, V.onAutoPlay, event)
				} else {
					fireEvent(MediaEvent.PLAY, V.onPlay, event)
				}

				V.isReplay = false
				break

			// YT.PlayerState.ENDED
			case 0:
				// console.log('\t ENDED = 0')

				// this ensures the ue points get reset
				_cuePoints.seeked = true

				V.isReplay = true
				//V.paused = true;
				V.complete = true
				fireEvent(MediaEvent.COMPLETE, V.onComplete, event)

			// YT.PlayerState.PAUSED
			case 2:
				// console.log('\t PAUSED = 2')

				FrameRate.unregister(V, handleTimeUpdate, 3)
				if (!_isStopCalled) {
					fireEvent(MediaEvent.PAUSE, V.onPause, event)
				}
				_isStopCalled = false
				V.paused = true
				break

			case 5:
				// console.log('\t video cued = 5')
				break
		}
	}

	function handleTimeUpdate() {
		V.currentTime = V.player.getCurrentTime()
		V.percent = V.currentTime / V.duration

		//console.log( '-#####-', V.player.getPlayerState(), ':', V.currentTime, '/', V.duration, '|', V.percent )
		fireEvent(MediaEvent.PROGRESS, V.onProgress)

		_cuePoints.check(V, V.currentTime)

		if (V.player.getCurrentTime() >= V.player.getDuration()) {
			V.pause()
		}
	}

	function handleFail(event) {
		console.log('YouTubePlayer.handleFail()')
		fireEvent(MediaEvent.FAIL, V.onFail, event)
	}

	// -------------------------------------------------------------------------------------------------------------
	// COMPONENTS
	if (arg.poster) V.addPoster(arg.poster)

	if (arg.controls) V.addControls(arg.controls)

	// -------------------------------------------------------------------------------------------------------------
	// INIT
	createPlayer()

	return V
}

export default YouTubePlayer
