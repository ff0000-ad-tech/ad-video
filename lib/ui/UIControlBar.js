/** 
	@class UIControlBar
*/
import { UIComponent } from 'ad-ui'
import { Styles } from 'ad-view'

function UIControlBar ( player, arg ){
	
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARKUP
	var U = new UIComponent ( arg );
	Styles.addClass ( U, 'rvp-controlBar' );
		
	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC PROPERTIES

	/**
		@memberof UIControlBar
		@const {boolean} constant
			A Boolean to toggle if the controlBar will disappear after a timeout, defaults to false. 
	*/
	U.constant = !!arg.constant;
	
	/**
		@memberof UIControlBar
		@const {boolean} showOnPoster
			A Boolean to toggle if the controlBar will show before or after the video has played, defaults to false. 
	*/
	U.showOnPoster = !!arg.showOnPoster;

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	U.toString = function(){
		return '[object UIControlBar]'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT 
	return U;
}

export default UIControlBar