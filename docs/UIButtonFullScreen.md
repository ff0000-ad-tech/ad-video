<a name="UIButtonFullScreen"></a>

## UIButtonFullScreen
**Kind**: global class  
<a name="new_UIButtonFullScreen_new"></a>

### new UIButtonFullScreen()
Import from <a href="https://github.com/ff0000-ad-tech/ad-video">Github repo</a>
		<br>
		<pre class="sunlight-highlight-javascript">
// importing into an ES6 class
import { UIButtonFullScreen } from 'ad-video'
</pre>
		<br><br>
		
		This is a display object class, extending [UIButton](UIButton) with direct control to a [VideoPlayer](#VideoPlayer) instance.  It controls the fullscreen for the [VideoPlayer](#VideoPlayer). 
		While it can be instantiated by itself, it is typically created from the VideoControls class which is called from the constructor of a [VideoPlayer](#VideoPlayer) instance. 
		See [UIButton](UIButton) for more info.
		<br><br>

		
		<b>Sample 1</b><br>
		Add the button to the controlBar<br>
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
		onControlBar : {
			buttonFullScreen : {
				css : {
					backgroundColor : 'rgb(100,200,10)'
				},
				state : [ 'btnFullScreen' ]
			}
		}	
	}
});
</pre>
		<br><br>


		<b>Sample 2</b><br>
		Add the button on the screen, NOT on the controlBar<br>
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
			buttonFullScreen : {
				css : {
					width : 70,
					height : 70,
					backgroundColor : 'rgba(20,200,10,.5)'
				},
				state : [ 'btnFullScreen' ]
			},
		},	
	}
});
</pre>
		<br><br>


		<b>Sample 3</b><br>
		Use DOM elements as the states of the button, to have more contorl over their css
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
			buttonFullScreen : {
				css : {
					width : 70,
					height : 70,
					backgroundColor : 'rgba(20,200,10,.5)'
				},
				state : [ 
					new UIImage({
						source : 'btnFullScreen',
						css : {
							x : 10,
							y : 10,
							width : 50,
							height : 50,
							backgroundColor : 'rgba(100,100,0,.5)'
						}
					})
				]
			},
		}
	}
});
</pre>
		<br><br>

