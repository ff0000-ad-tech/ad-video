import { UISlider } from 'ad-ui'
import { FrameRate, UIEvent, GestureEvent } from 'ad-events'

function UISliderProgress(player, arg) {
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE PROPERTIES
	var _timeout
	var _isOver = false

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARKUP
	var U = new UISlider(arg)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.outDelayTime = 1000

	U.onOver =
		arg.onOver ||
		function(event) {
			console.log('UISliderProgress.onOver()')
		}

	U.onOut =
		arg.onOut ||
		function(event) {
			console.log('UISliderProgress.onOut()')
		}

	U.toString = function() {
		return '[object UISliderProgress]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	function hideTimeout() {
		return setTimeout(function() {
			if (!player.paused && !_isOver) U.onOut.call(U)
		}, U.outDelayTime)
	}

	function controlFrameRate(enable) {
		FrameRate[enable ? 'register' : 'unregister'](U, handleEnterFrame)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handlePlay(event) {
		controlFrameRate(true)
	}

	function handlePause(event) {
		controlFrameRate(false)
	}

	function handleComplete(event) {
		controlFrameRate(false)
		handleEnterFrame()
	}

	function handleEnterFrame() {
		U.percent = player.screen.currentTime / player.screen.duration
	}

	function handleLoadStart(event) {
		FrameRate.register(U, handleProgress, 6)
	}

	function handleProgress() {
		if (player.screen.buffered.length > 0) {
			var max = player.screen.buffered.length - 1
			var perc = player.screen.buffered.end(max) / player.screen.duration
			U.loaded.style.width = perc * 100 + '%'
			if (perc >= 0.999) FrameRate.unregister(U, handleProgress, 6)
		}
	}

	function handleOver(event) {
		_isOver = true
		if (!player.paused && !player.complete) U.onOver.call(U, event)
	}

	function handleOut(event) {
		_isOver = false
	}

	function handleMove(event) {
		clearTimeout(_timeout)
		_timeout = hideTimeout()
		//if ( !player.complete ) U.onOver.call( U, event );
	}

	function handleBaseSliderUpdate(event) {
		var time = player.screen.duration * U.percent
		player.seek(time)
	}

	function handleBaseEnabled(event) {
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'

		U[listener](UIEvent.SLIDER_UPDATE, handleBaseSliderUpdate)
		U[listener]('mousemove', handleMove)

		Gesture[listener](U, GestureEvent.OVER, handleOver)
		Gesture[listener](U, GestureEvent.OUT, handleOut)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	player.screen.addEventListener('ended', handleComplete, false)
	player.screen.addEventListener('play', handlePlay, false)
	player.screen.addEventListener('pause', handlePause, false)
	player.screen.addEventListener('loadstart', handleLoadStart, false)

	U.enabled = arg.enabled != false

	return U
}

export default UISliderProgress
