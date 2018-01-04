import { UISlider } from 'ad-ui'
import { UIEvent, GestureEvent, Gesture } from 'ad-events'

function UISliderVolume(player, arg) {
	var U = new UISlider(arg)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function() {
		return '[object UISliderVolume]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handleDown(event) {
		player.screen.muted = false
	}

	function handleVolumeChange(event) {
		if (!U.dragging) {
			var vol = player.screen.muted ? 0 : player.screen.volume
			U.percent = vol
		}
	}

	function handleBaseSliderUpdate(event) {
		player.screen.volume = U.percent
	}

	function handleBaseEnabled(event) {
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'

		Gesture[listener](U.hitState, GestureEvent.PRESS, handleDown)

		player.screen[listener]('volumechange', handleVolumeChange)

		U[listener](UIEvent.SLIDER_UPDATE, handleBaseSliderUpdate)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	U.enabled = true
	handleVolumeChange()

	return U
}

export default UISliderVolume
