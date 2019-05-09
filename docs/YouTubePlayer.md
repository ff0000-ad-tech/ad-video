<a name="YouTubePlayer"></a>

## YouTubePlayer
**Kind**: global class  
**Npmpackage**:   

* [YouTubePlayer](#YouTubePlayer)
    * [new YouTubePlayer()](#new_YouTubePlayer_new)
    * [.paused](#YouTubePlayer.paused) : <code>boolean</code>
    * [.percent](#YouTubePlayer.percent) : <code>number</code>
    * [.currentTime](#YouTubePlayer.currentTime) : <code>number</code>
    * [.complete](#YouTubePlayer.complete) : <code>boolean</code>
    * [.onReady](#YouTubePlayer.onReady) : <code>function</code>
    * [.onComplete](#YouTubePlayer.onComplete) : <code>function</code>
    * [.onFail](#YouTubePlayer.onFail) : <code>function</code>
    * [.onBuffer](#YouTubePlayer.onBuffer) : <code>function</code>
    * [.onProgress](#YouTubePlayer.onProgress) : <code>function</code>
    * [.onPlay](#YouTubePlayer.onPlay) : <code>function</code>
    * [.onAutoPlay](#YouTubePlayer.onAutoPlay) : <code>function</code>
    * [.onStop](#YouTubePlayer.onStop) : <code>function</code>
    * [.onPause](#YouTubePlayer.onPause) : <code>function</code>
    * [.container](#YouTubePlayer.container) : <code>UIComponent</code>
    * [.volume](#YouTubePlayer.volume) : <code>number</code>
    * [.source](#YouTubePlayer.source) : <code>string</code>
    * [.url](#YouTubePlayer.url) : <code>string</code>
    * [.autoPlay](#YouTubePlayer.autoPlay) : <code>boolean</code>
    * [.muted](#YouTubePlayer.muted) : <code>boolean</code>
    * [.nativeControls](#YouTubePlayer.nativeControls) : <code>boolean</code>
    * [.allowFullScreen](#YouTubePlayer.allowFullScreen) : <code>boolean</code>
    * [.quality](#YouTubePlayer.quality) : <code>string</code>
    * [.hide()](#YouTubePlayer.hide)
    * [.show()](#YouTubePlayer.show)
    * [.play()](#YouTubePlayer.play)
    * [.pause()](#YouTubePlayer.pause)
    * [.seek(sec)](#YouTubePlayer.seek)
    * [.stop()](#YouTubePlayer.stop)
    * [.mute()](#YouTubePlayer.mute)
    * [.unmute()](#YouTubePlayer.unmute)
    * [.addCuePoint(time, handler, params)](#YouTubePlayer.addCuePoint)

<a name="new_YouTubePlayer_new"></a>

### new YouTubePlayer()
This Object creates and manages a YouTube player embed.
	<br><br>
	The native YouTube API has many flaws in its logic along with several limtations. YouTubePlayer attempts to bridge some of those short comings,
	while at the same time following as closely as possible the same methods and patterns of our native VideoPlayer.
	<br><br>
	Something to note: The initial call to the YouTube API actually loads in an iFrame, so there can be a delay
	when first seeing your player, there is nothing that can be doen about that. Since it is loading an iFrame, things such as the controls, fullscreen
	ability, showing video info are set on the load. This class can toggle those things, but it will cause the whole iFrame to reload. If you are only
	changing videos, with no other updates, there will be a seemless transition to the next video.

**Example**  
```js
import { YouTubePlayer } from 'ad-video'

// adds a player on the Main container
T.videoPlayer = new YouTubePlayer({
	id: 'intro',
	target: T,
	css : {
		x: 0,
		y: 0,
		width : 446,
		height : 250
	},

	videoId: 'EcB59kdjJfw',
	autoPlay: true,
	muted: true,
	quality: 'hd720',
	showInfo: false,
	inlineYouTubeLogo: true,
	allowFullScreen: false,
	allowAnnotations: true,

	onReady: null,
	onComplete : null,
	onPlay: null,
	onPause: null,
	onBuffer: null,
	onFail: null,

	controls: false
})
```
<a name="YouTubePlayer.paused"></a>

### YouTubePlayer.paused : <code>boolean</code>
A Boolean representing if the video is playing.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.percent"></a>

### YouTubePlayer.percent : <code>number</code>
A Number 0-1 representing the video timeline percent position.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.currentTime"></a>

### YouTubePlayer.currentTime : <code>number</code>
A Number representing the video time position.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.complete"></a>

### YouTubePlayer.complete : <code>boolean</code>
A Boolean representing if the video has ended.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onReady"></a>

### YouTubePlayer.onReady : <code>function</code>
A callback for when the Video is able to be played.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onComplete"></a>

### YouTubePlayer.onComplete : <code>function</code>
A callback for when the Video is finished.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onFail"></a>

### YouTubePlayer.onFail : <code>function</code>
A callback for when the Video fails.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onBuffer"></a>

### YouTubePlayer.onBuffer : <code>function</code>
A callback for when the Video pauses due to buffering.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onProgress"></a>

### YouTubePlayer.onProgress : <code>function</code>
A callback for when as Video progresses while playing.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onPlay"></a>

### YouTubePlayer.onPlay : <code>function</code>
A callback for when as Video plays, helpful since controls are internal to iFrame.  Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onAutoPlay"></a>

### YouTubePlayer.onAutoPlay : <code>function</code>
A callback for when as Video auto-plays. Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onStop"></a>

### YouTubePlayer.onStop : <code>function</code>
A callback for when as Video is stopped. Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.onPause"></a>

### YouTubePlayer.onPause : <code>function</code>
A callback for when as Video pauses, helpful since controls are internal to iFrame. Can be set as optional parameter on instantiation.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.container"></a>

### YouTubePlayer.container : <code>UIComponent</code>
A &lt;div>, the top level container for the entire player instance.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
<a name="YouTubePlayer.volume"></a>

### YouTubePlayer.volume : <code>number</code>
Changes the volume of the video.  Assign a number, between 0 - 1 to set the volume.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.volume = .8;
```
<a name="YouTubePlayer.source"></a>

### YouTubePlayer.source : <code>string</code>
Changes the source of the video by passing in a string of the video YouTube ID to set.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.source = "k_5IXGmoLMY";
```
<a name="YouTubePlayer.url"></a>

### YouTubePlayer.url : <code>string</code>
Gets the URL to current playing YouTube video.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
console.log( myVideoPlayer.url );
```
<a name="YouTubePlayer.autoPlay"></a>

### YouTubePlayer.autoPlay : <code>boolean</code>
A boolean to define if the video will automatically play.

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.autoPlay = false;
```
<a name="YouTubePlayer.muted"></a>

### YouTubePlayer.muted : <code>boolean</code>
A boolean to read if the player is muted

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
console.log( myVideoPlayer.muted );
```
<a name="YouTubePlayer.nativeControls"></a>

### YouTubePlayer.nativeControls : <code>boolean</code>
A boolean whether or not the player has nativeControls/progress bar.
	NOTE: Requires a iFrame reload, so only take place on a video load or replay

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.nativeControls = false;
```
<a name="YouTubePlayer.allowFullScreen"></a>

### YouTubePlayer.allowFullScreen : <code>boolean</code>
A boolean whether or not the fullscreen button is displayed.
	NOTE: Requires a iFrame reload, so only take place on a video load or replay

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.allowFullScreen = false;
```
<a name="YouTubePlayer.quality"></a>

### YouTubePlayer.quality : <code>string</code>
A string representing the quality type, follows YouTube paradigm, that assigns the playback quality of the video.
	NOTE: Requires a iFrame reload, so only take place on a video load or replay

**Kind**: static property of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.quality = "hd720";
```
<a name="YouTubePlayer.hide"></a>

### YouTubePlayer.hide()
Hides the entire player.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.hide();
```
<a name="YouTubePlayer.show"></a>

### YouTubePlayer.show()
Shows the entire player.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.show();
```
<a name="YouTubePlayer.play"></a>

### YouTubePlayer.play()
Plays the current video.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.play();
```
<a name="YouTubePlayer.pause"></a>

### YouTubePlayer.pause()
Pauses the current video.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.pause();
```
<a name="YouTubePlayer.seek"></a>

### YouTubePlayer.seek(sec)
Skips the video to a specific time.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  

| Param | Type | Description |
| --- | --- | --- |
| sec | <code>number</code> | The time to skip the video to in seconds. |

**Example**  
```js
myVideoPlayer.seek(4);
```
<a name="YouTubePlayer.stop"></a>

### YouTubePlayer.stop()
Pauses the video and resets its time to 0

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.stop()
```
<a name="YouTubePlayer.mute"></a>

### YouTubePlayer.mute()
Mutes the Video Player, does not change the volume.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.mute()
```
<a name="YouTubePlayer.unmute"></a>

### YouTubePlayer.unmute()
Unmutes the Video Player, does not change the volume.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  
**Example**  
```js
myVideoPlayer.unmute()
```
<a name="YouTubePlayer.addCuePoint"></a>

### YouTubePlayer.addCuePoint(time, handler, params)
Add to the load queue: a single or array of files or even another Loader.

**Kind**: static method of [<code>YouTubePlayer</code>](#YouTubePlayer)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | The time, inseconds, to fire the call back. |
| handler | <code>function</code> | A callback function. |
| params | <code>object</code> | Optional parameters to pass back through the call back. |

**Example**  
```js
myVideoPlayer.addCuePoint ( 3, handleCuePoint, [ true, .3, {} ])

function handleCuePoint ( isVar, num, obj ){
	console.log( 'cue point', isVar, num, obj );
}
```
