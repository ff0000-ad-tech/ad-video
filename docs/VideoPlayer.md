<a name="VideoPlayer"></a>

## VideoPlayer
**Kind**: global class  

* [VideoPlayer](#VideoPlayer)
    * [new VideoPlayer()](#new_VideoPlayer_new)
    * [.complete](#VideoPlayer.complete) : <code>boolean</code>
    * [.hasPlayed](#VideoPlayer.hasPlayed) : <code>boolean</code>
    * [.onComplete](#VideoPlayer.onComplete) : <code>function</code>
    * [.onFail](#VideoPlayer.onFail) : <code>function</code>
    * [.onBuffer](#VideoPlayer.onBuffer) : <code>function</code>
    * [.onProgress](#VideoPlayer.onProgress) : <code>function</code>
    * [.onReady](#VideoPlayer.onReady) : <code>function</code>
    * [.container](#VideoPlayer.container) : <code>UIComponent</code>
    * [.screen](#VideoPlayer.screen) : <code>video</code>
    * [.autoPlay](#VideoPlayer.autoPlay) : <code>boolean</code>
    * [.currentTime](#VideoPlayer.currentTime) : <code>number</code>
    * [.duration](#VideoPlayer.duration) : <code>number</code>
    * [.paused](#VideoPlayer.paused) : <code>boolean</code>
    * [.percent](#VideoPlayer.percent) : <code>number</code>
    * [.source](#VideoPlayer.source) : <code>string</code>
    * [.volume](#VideoPlayer.volume) : <code>number</code>
    * [.muted](#VideoPlayer.muted) : <code>boolean</code>
    * [.forceInline](#VideoPlayer.forceInline) : <code>boolean</code>
    * [.load()](#VideoPlayer.load)
    * [.play()](#VideoPlayer.play)
    * [.pause()](#VideoPlayer.pause)
    * [.seek(sec)](#VideoPlayer.seek)
    * [.stop()](#VideoPlayer.stop)
    * [.mute()](#VideoPlayer.mute)
    * [.unmute()](#VideoPlayer.unmute)
    * [.resize(width, height)](#VideoPlayer.resize)
    * [.addCuePoint(time, handler, params)](#VideoPlayer.addCuePoint)
    * [.addControls(obj)](#VideoPlayer.addControls)

<a name="new_VideoPlayer_new"></a>

### new VideoPlayer()
This object creates a custom Video Player instance.  This player has the ability to function as a regular player or it can work as the inline/autoplay video.

<pre class="sunlight-highlight-javascript">
import { VideoPlayer } from 'ad-video'
</pre>

<b>Sample Player</b><br>
<pre class="sunlight-highlight-javascript">
View.main.videoPlayer = new VideoPlayer({
	source: adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
	target: View.main,
	id: 'My_Unique_ID',
	css: {
		width: 300,
		height: 250
	},
	preload : false,
	autoPlay : false,
	muted : false,
	volume: .8,
	onComplete: function(event){
		console.log( 'video complete' )
	},
	onFail: global.failAd,
})

View.main.videoPlayer.play()
</pre>
<br><br>
<b>Sample Autoplay</b><br>
<pre class="sunlight-highlight-javascript">
View.main.videoPlayer = new VideoPlayer({
	source: [
		adParams.videosPath + 'RED_Html5_Showcase_300x250.mp4',
		adParams.videosPath + 'RED_Html5_Showcase_300x250.mpg'
	],
	target: View.main,
	id: 'My_Unique_ID',
	css: {
		width: 300,
		height: 250
	},
	preload : true,
	autoPlay : true,
	muted : true,
	forceInline : true,
	onComplete: function(event){
		console.log( 'video complete' )
	},
	onFail: global.failAd,
})
</pre>

<a name="VideoPlayer.complete"></a>

### VideoPlayer.complete : <code>boolean</code>
A Boolean representing if the video has ended.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.hasPlayed"></a>

### VideoPlayer.hasPlayed : <code>boolean</code>
A Boolean representing if the video has played to completion.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.onComplete"></a>

### VideoPlayer.onComplete : <code>function</code>
A callback for when the Video is finished.  Can be set as optional parameter on instantiated.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.onFail"></a>

### VideoPlayer.onFail : <code>function</code>
A callback for when the Video fails.  Can be set as optional parameter on instantiated.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.onBuffer"></a>

### VideoPlayer.onBuffer : <code>function</code>
A callback for when the Video pauses due to buffering.  Can be set as optional parameter on instantiated.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.onProgress"></a>

### VideoPlayer.onProgress : <code>function</code>
A callback for when as Video progresses while playing.  Can be set as optional parameter on instantiated.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.onReady"></a>

### VideoPlayer.onReady : <code>function</code>
A callback for when Video is buffered and ready to play.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.container"></a>

### VideoPlayer.container : <code>UIComponent</code>
A &lt;div>, the top level container for the entire player instance.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.screen"></a>

### VideoPlayer.screen : <code>video</code>
The &lt;video> element, or if autoplay on a device, will return the driver object.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.autoPlay"></a>

### VideoPlayer.autoPlay : <code>boolean</code>
A Boolean that changes if the video will automatically play.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myVideoPlayer.autoPlay = false;
```
<a name="VideoPlayer.currentTime"></a>

### VideoPlayer.currentTime : <code>number</code>
A Number representing the video time position.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.duration"></a>

### VideoPlayer.duration : <code>number</code>
A Number representing the length of the video in seconds.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.paused"></a>

### VideoPlayer.paused : <code>boolean</code>
A Boolean representing if the video is playing.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.percent"></a>

### VideoPlayer.percent : <code>number</code>
A Number 0-1 representing the video timeline percent position.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.source"></a>

### VideoPlayer.source : <code>string</code>
Changes the source of the video.  Pass a string of the video file path to set.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myVideoPlayer.source = 'videos/myVideoFile.mp4';
```
<a name="VideoPlayer.volume"></a>

### VideoPlayer.volume : <code>number</code>
Changes the volume of the video.  Assign a number, between 0 - 1 to set the volume.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myVideoPlayer.volume = .8;
```
<a name="VideoPlayer.muted"></a>

### VideoPlayer.muted : <code>boolean</code>
A Boolean representing if the video volume is muted.

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.forceInline"></a>

### VideoPlayer.forceInline : <code>boolean</code>
A Boolean to force the video to play inline, NOTE: applies only to iphone iOS < 10

**Kind**: static property of [<code>VideoPlayer</code>](#VideoPlayer)  
<a name="VideoPlayer.load"></a>

### VideoPlayer.load()
Loads the current video source. If preload is true, this is redundant.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myPlayer.load()
```
<a name="VideoPlayer.play"></a>

### VideoPlayer.play()
Plays the current video.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myPlayer.play()
```
<a name="VideoPlayer.pause"></a>

### VideoPlayer.pause()
Pauses the current video.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myPlayer.pause()
```
<a name="VideoPlayer.seek"></a>

### VideoPlayer.seek(sec)
Skips the video to a specific time.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  

| Param | Type | Description |
| --- | --- | --- |
| sec | <code>number</code> | The time to skip the video to in seconds. |

**Example**  
```js
myPlayer.seek(4)
```
<a name="VideoPlayer.stop"></a>

### VideoPlayer.stop()
Stops the video and resets it to the beginning.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myPlayer.stop()
```
<a name="VideoPlayer.mute"></a>

### VideoPlayer.mute()
Mutes the Video Player, does not change the volume.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myVideoPlayer.mute()
```
<a name="VideoPlayer.unmute"></a>

### VideoPlayer.unmute()
Unmutes the Video Player, does not change the volume.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  
**Example**  
```js
myVideoPlayer.unmute()
```
<a name="VideoPlayer.resize"></a>

### VideoPlayer.resize(width, height)
Changes the size of the Video Player

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  

| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | A number of the width |
| height | <code>number</code> | A number of the height |

**Example**  
```js
myVideoPlayer.resize(400, 300)
```
<a name="VideoPlayer.addCuePoint"></a>

### VideoPlayer.addCuePoint(time, handler, params)
Add to the load queue: a single or array of files or even another Loader.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | The time, in seconds, to fire the call back. |
| handler | <code>function</code> | A callback function. |
| params | <code>object</code> | Optional parameters to pass back through the call back. |

**Example**  
```js
myVideoPlayer.addCuePoint(3, handleCuePoint, [true, .3, {}])

function handleCuePoint(isVar, num, obj) {
	console.log('cue point', isVar, num, obj)
}
```
<a name="VideoPlayer.addControls"></a>

### VideoPlayer.addControls(obj)
Adds VideoControls to the VideoPlayer instance. Used only if controls NOT passed thru on instantiation.

**Kind**: static method of [<code>VideoPlayer</code>](#VideoPlayer)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | An object of desired controls, see [VideoControls](#VideoControls) |

**Example**  
```js
myVideoPlayer.addControls({
	controlBar : {
		buttonPlayPause : true,
		progressControl : true,
		buttonFullScreen : true
	}
})
```
