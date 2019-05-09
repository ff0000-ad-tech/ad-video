<a name="UITimeDisplay"></a>

## UITimeDisplay
**Kind**: global class  

* [UITimeDisplay](#UITimeDisplay)
    * [new UITimeDisplay()](#new_UITimeDisplay_new)
    * [.showDuration](#UITimeDisplay.showDuration) : <code>boolean</code>

<a name="new_UITimeDisplay_new"></a>

### new UITimeDisplay()
Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<pre class="sunlight-highlight-javascript">
// importing into an ES6 class
import { UITimeDisplay } from 'ad-video'
</pre>
		<br><br>
		
		This is a display object class, extending [UITextField](UITextField) with direct control to a [VideoPlayer](#VideoPlayer) instance.  It displays the time of [VideoPlayer](#VideoPlayer). 
		While it can be instantiated by itself, it is typically created from the VideoControls class which is called from the constructor of a [VideoPlayer](#VideoPlayer) instance. 
		See [UITextField](UITextField) for more info.<br><br>

	
		<b>Sample 1</b><br>
		Add the time display to the controlBar<br>
		<pre class="sunlight-highlight-javascript">
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
</pre>
		<br><br>


		<b>Sample 2</b><br>
		Add the time display on the screen, NOT on the controlBar<br>
		<pre class="sunlight-highlight-javascript">
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
</pre>

<a name="UITimeDisplay.showDuration"></a>

### UITimeDisplay.showDuration : <code>boolean</code>
Getter | Setter : Toggles if the time will have the duration appended to the display.
			<br> Will output either #:## or #:##/#:##

**Kind**: static property of [<code>UITimeDisplay</code>](#UITimeDisplay)  
