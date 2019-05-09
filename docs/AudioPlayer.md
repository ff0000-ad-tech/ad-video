<a name="AudioPlayer"></a>

## AudioPlayer
**Kind**: global class  

* [AudioPlayer](#AudioPlayer)
    * [new AudioPlayer()](#new_AudioPlayer_new)
    * [.autoPlay](#AudioPlayer.autoPlay) : <code>boolean</code>
    * [.percent](#AudioPlayer.percent) : <code>number</code>
    * [.source](#AudioPlayer.source) : <code>string</code>
    * [.load()](#AudioPlayer.load)
    * [.play()](#AudioPlayer.play)
    * [.pause()](#AudioPlayer.pause)
    * [.seek(sec)](#AudioPlayer.seek)
    * [.stop()](#AudioPlayer.stop)
    * [.mute()](#AudioPlayer.mute)
    * [.unmute()](#AudioPlayer.unmute)

<a name="new_AudioPlayer_new"></a>

### new AudioPlayer()
This object creates a custom Audio Player instance, which is an extension of the native DOM <audio> tag.  All native
	functionality is available, such as load(), play(), pause(), and volume

**Example**  
```js
import { AudioPlayer } from 'ad-video'

// instantiate new audio player
View.main.audioPlayer = new AudioPlayer({
	source: 'mySoundFile.mp3',
	target: View.main,
	id: 'My_Unique_ID',
	preload: false,
	autoPlay: false,
	muted: false,
	volume: .8,
	onReady: function(event) {
		console.log('audio ready')
	},
	onProgress: function(event) {
		console.log('audio progress')
	},
	onComplete: function(event) {
		console.log('audio complete')
	},
	onFail: global.failAd,
})

View.main.audioPlayer.play()
```
<a name="AudioPlayer.autoPlay"></a>

### AudioPlayer.autoPlay : <code>boolean</code>
A Boolean that changes if the audio will automatically play.

**Kind**: static property of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.autoPlay = false;
```
<a name="AudioPlayer.percent"></a>

### AudioPlayer.percent : <code>number</code>
A Number 0-1 representing the audio timeline percent position.

**Kind**: static property of [<code>AudioPlayer</code>](#AudioPlayer)  
<a name="AudioPlayer.source"></a>

### AudioPlayer.source : <code>string</code>
Changes the source of the audio.  Pass a string of the audio file path to set.

**Kind**: static property of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.source = 'audio/myAudio.mp3';			
```
<a name="AudioPlayer.load"></a>

### AudioPlayer.load()
Loads the current audio source. If preload is true, this is redundant.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.load();
```
<a name="AudioPlayer.play"></a>

### AudioPlayer.play()
Plays the current audio.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.play();
```
<a name="AudioPlayer.pause"></a>

### AudioPlayer.pause()
Pauses the current audio.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.pause();
```
<a name="AudioPlayer.seek"></a>

### AudioPlayer.seek(sec)
Skips the audio to a specific time.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  

| Param | Type | Description |
| --- | --- | --- |
| sec | <code>number</code> | The time to skip the audio to in seconds. |

**Example**  
```js
myPlayer.seek( 4 );
```
<a name="AudioPlayer.stop"></a>

### AudioPlayer.stop()
Stops the audio and resets it to the beginning.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.stop();
```
<a name="AudioPlayer.mute"></a>

### AudioPlayer.mute()
Mutes the Video Player, does not change the volume.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.mute()
```
<a name="AudioPlayer.unmute"></a>

### AudioPlayer.unmute()
Unmutes the Video Player, does not change the volume.

**Kind**: static method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Example**  
```js
myPlayer.unmute()
```
