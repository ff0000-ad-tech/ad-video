<a name="VideoControls"></a>

## VideoControls
**Kind**: global class  
**Npmpackage**:   

* [VideoControls](#VideoControls)
    * [new VideoControls()](#new_VideoControls_new)
    * [.controlBar](#VideoControls.controlBar) : [<code>UIControlBar</code>](#UIControlBar)
    * [.replayOnInteraction](#VideoControls.replayOnInteraction) : <code>boolean</code>
    * [.unmuteOnInteraction](#VideoControls.unmuteOnInteraction) : <code>boolean</code>

<a name="new_VideoControls_new"></a>

### new VideoControls()
This is a display object class, extending [UIComponent](UIComponent).  It is a DOM element that houses all the video control components:
[UIButton](UIButton), [UISlider](UISlider) and [UITextField](UITextField).
<pre class="sunlight-highlight-javascript">
import { VideoControls } from 'ad-video'
</pre>
This can be instantiated but is typically called internally from the VideoPlayer by passing in all params to the instantiation.
All controls can be added to a [UIControlBar](#UIControlBar) or to the main container to be placed anywhere over the video.  This is done
through the instantiation, by passing components to a node <code>onControlBar</code> or <code>onScreen</code>.  See example below.
<br><br>
<b>Accepted Components:</b><br>
<ul>
	<li><code>buttonPlayPause</code>, see [UIButtonPlayPause](#UIButtonPlayPause)</li>
	<li><code>buttonReplay</code>, see [UIButtonReplay](#UIButtonReplay)</li>
	<li><code>buttonFullScreen</code>, see [UIButtonFullScreen](#UIButtonFullScreen)</li>
	<li><code>buttonMute</code>, see [UIButtonMute](#UIButtonMute)</li>
	<li><code>timeDisplay</code>, see [UITimeDisplay](#UITimeDisplay)</li>
	<li><code>sliderProgress</code>, see [UISliderProgress](UISliderProgress)</li>
	<li><code>sliderVolume</code>, see [UISliderVolume](UISliderVolume)</li>
</ul>
<b>Example adding a play/pause button to the screen:</b><br>
<pre class="sunlight-highlight-javascript">
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
})
// access button
View.main.videoPlayer.controls.buttonPlayPause;
</pre>
<br><br>
<b>Example adding a play/pause button to the ControlBar:</b><br>
<pre class="sunlight-highlight-javascript">
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
</pre>
<br><br>
<b>Example All Controls on ControlBar:</b><br>
<pre class="sunlight-highlight-javascript">
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
</pre>
<br><br>
<b>Example Controls on ControlBar AND on screen:</b><br>
<pre class="sunlight-highlight-javascript">
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
})
</pre>

<a name="VideoControls.controlBar"></a>

### VideoControls.controlBar : [<code>UIControlBar</code>](#UIControlBar)
Public access to the UIControlBar instance.  All UIComponents added to this will be accessed via the variable.

**Kind**: static property of [<code>VideoControls</code>](#VideoControls)  
<a name="VideoControls.replayOnInteraction"></a>

### VideoControls.replayOnInteraction : <code>boolean</code>
Get|Set: A Boolean that changes if the video player will start over on any click interaction, default is false.

**Kind**: static property of [<code>VideoControls</code>](#VideoControls)  
**Example**  
```js
// GET
console.log(myVideoPlayer.controls.replayOnInteraction)

// SET
myVideoPlayer.controls.replayOnInteraction = false		
		v
```
<a name="VideoControls.unmuteOnInteraction"></a>

### VideoControls.unmuteOnInteraction : <code>boolean</code>
Get|Set: A Boolean that changes if the video player will unmute on any click interaction, default is false.

**Kind**: static property of [<code>VideoControls</code>](#VideoControls)  
**Example**  
```js
// GET
console.log(myVideoPlayer.controls.unmuteOnInteraction)

// SET
myVideoPlayer.controls.unmuteOnInteraction = true
```
