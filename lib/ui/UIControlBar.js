/** 
	@class UIControlBar
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { UIControlBar } from 'ad-video'
		</codeblock>
		<br><br>
*/
import { UIComponent } from 'ad-ui'
import { Styles } from 'ad-view'

function UIControlBar(player, arg) {
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARKUP
	var U = new UIComponent(arg)
	Styles.addClass(U, 'rvp-controlBar')

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC PROPERTIES

	/**
		@memberof UIControlBar
		@const {boolean} constant
			A Boolean to toggle if the controlBar will disappear after a timeout, defaults to false. 
	*/
	U.constant = !!arg.constant

	/**
		@memberof UIControlBar
		@const {boolean} showOnPoster
			A Boolean to toggle if the controlBar will show before or after the video has played, defaults to false. 
	*/
	U.showOnPoster = !!arg.showOnPoster

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function() {
		return '[object UIControlBar]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	return U
}

export default UIControlBar
