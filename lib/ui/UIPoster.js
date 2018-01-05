import { Styles } from 'ad-view'
import { UIImage } from 'ad-ui'
import { UIEvent } from 'ad-events'

function UIPoster(player, arg) {
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// BASE CSS
	Styles.injectStylesheet('RED_uiVideoPoster', '.rvp-poster', 'background-position:50% 50%;')

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARKUP
	arg.css = arg.css || {}
	arg.css.width = arg.css.width || 'inherit'
	arg.css.height = arg.css.height || 'inherit'

	var U = new UIImage(arg)
	//U.classList.add( 'rvp-poster' );
	Styles.addClass(U, 'rvp-poster')

	;(arg.target || player.container).appendChild(U)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function() {
		return '[object UIPoster]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handleUpdate(event) {
		if (player.screen.currentTime > 0 && player.screen.currentTime < player.screen.duration) U.hide()
	}

	function handlePause(event) {
		if (player.screen.currentTime == 0) U.show()
	}

	function handleShow(event) {
		U.show()
	}

	function handleBaseEnabled(event) {
		var playerRef = player.screen
		var listener = U.enabled ? 'addEventListener' : 'removeEventListener'
		playerRef[listener]('autoplay', U.hide, false)
		playerRef[listener]('play', U.hide, false)
		playerRef[listener]('pause', handlePause, false)
		playerRef[listener]('timeupdate', handleUpdate, false)
		playerRef[listener]('complete', handleShow, false)
		playerRef[listener]('ended', handleShow, false)
		playerRef[listener]('stop', handleShow, false)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	U.addEventListener(UIEvent.ENABLED, handleBaseEnabled)

	U.enabled = true

	return U
}

export default UIPoster
