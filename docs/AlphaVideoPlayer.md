<a name="AlphaVideoPlayer"></a>

## AlphaVideoPlayer
**Kind**: global class  
<a name="new_AlphaVideoPlayer_new"></a>

### new AlphaVideoPlayer()
This object creates a [VideoPlayer](#VideoPlayer) instance and attaches HTML Canvas masking.  This player has the ability to function exactly the same as a regular [VideoPlayer](#VideoPlayer) instance.
<br><br>
<pre class="sunlight-highlight-javascript">
import { AlphaVideoPlayer } from 'ad-video'
</pre>
<b>Note:</b><br>
If using a dynamic video mask (rather than a static mask from a PNG, JPG, or other bitmap source) then ensure the runtimeIncludes object of your index.html file contains MpegPlugin.min.js:
<br>
var runtimeIncludes = {
	get mpegPluginPath(){ return adParams.corePath + "js/video/MpegPlugin.min.js"; },
};
<br><br>
For more info about building an AlphaVideoPlayer masked video, visit
{@link https://confluence.ff0000.com/display/AT/Alpha+Video }
<br>
<br>
There are two key properties which make AlphaVideoPlayer unique to VideoPlayer:
<br>
<br>
<b>mask</b>: An object with two parameters:
<br>
<li><b>source</b>: the image source to use as the mask</li>
<li><b>alphaMatte</b>: if true, uses the image's natural transparancies to create the masking. If false, will use black and white values to determine masking.</li>
<br>
<br>By adding a mask, the video will have <b>STATIC MASKING</b>. If The video's mask needs to move, this requires a <b>DYNAMIC MASKING</b> solution.
<br>
<br>
<b>videoStacked</b>: If true, the video to render and video's luma matte are stacked within the video source. If false, the two are side by side. Default to false.
<br><b>Will be overwritten if a static mask is used</b>.
<br>
<br>
<b><span style="color: #cc0000;">WARNING: If you are using a Dynamic Mask, the video format must be MPG and the index's runtimeIncludes must import the MpegPlugin.min.js</span></b>
<pre class="sunlight-highlight-javascript">
var runtimeIncludes = {
	get mpegPluginPath(){ return adParams.corePath + "js/video/MpegPlugin.min.js"; },
};
</pre>
<br>
<b><span style="color: #cc0000;">In addition, if you are using building an inline autoplay unit, Android devices require a video format that must be MPG. The source can either be an MPG or an array.</span></b>
<br>
<b><span style="color: #cc0000;">Use an array for STATIC, not DYNAMIC, masking so that only Android needs to load the MpegPlugin script: other devices should be able to use MP4 just fine.</span></b>
<pre class="sunlight-highlight-javascript">
source: adParams.videosPath + 'myVideo.mpg'
// or
source: [
	adParams.videosPath + 'myVideo.mp4',
	adParams.videosPath + 'myVideo.mpg',
],
</pre>
<br>
<br>
<br>
<b>Sample Player - Uses a video with a <i>stacked</i> masking source. <span style="color: #cc0000;">(NOTE THE MPG VIDEO FORMAT)</span></b><br>
<pre class="sunlight-highlight-javascript">
View.main.AlphaVideoPlayer = new AlphaVideoPlayer ({
	id: 'myAlphaVideoPlayer',
	target: View.main,
	css: {
		width: 970,
		height: 650,
	},
	source: adParams.videosPath + 'alpha_intro_vid_v2_withAlpha.mpg',
	videoStacked: true,
	preload: true,
	autoPlay: false,
	muted: true,
} );
View.main.AlphaVideoPlayer.play();
</pre>
<br><br>
<b>Sample - Uses a PNG - named 'red_png' - as a mask. The native alpha channel defines the visible area. <span style="color: #cc0000;">(NOTE THE MP4 VIDEO FORMAT)</span></b><br>
<pre class="sunlight-highlight-javascript">
View.main.AlphaVideoPlayer = new AlphaVideoPlayer ({
	id: 'myAlphaVideoPlayer',
	target: View.main,
	css: {
		width: 970,
		height: 650,
	},
	source: adParams.videosPath + 'alpha_intro_vid_v2_noAlpha.mp4',
	mask: {
		source: 'red_png',
		alphaMatte: true
	},
	preload: true,
	autoPlay: false,
	muted: true,
});
View.main.AlphaVideoPlayer.play();
</pre>
<br>
<img src="https://github.com/ff0000-ad-tech/ad-docs/blob/master/assets/ad-video/alpha_mask.jpg" />
<br><br><br><br>
<b>Sample - Uses a JPG - named 'red_jpg' - as a mask. The image's blacks and whites define the visible area. <span style="color: #cc0000;">(NOTE THE MP4 VIDEO FORMAT)</span></b><br>
<pre class="sunlight-highlight-javascript">
View.main.AlphaVideoPlayer = new AlphaVideoPlayer ({
	id: 'myAlphaVideoPlayer',
	target: View.main,
	css: {
		width: 970,
		height: 650,
	},
	source: adParams.videosPath + 'alpha_intro_vid_v2_noAlpha.mp4',
	mask: {
		source: 'red_jpg',
	},
	preload: true,
	autoPlay: false,
	muted: true,
} );
View.main.AlphaVideoPlayer.play();
</pre>
<br>
<img src="https://github.com/ff0000-ad-tech/ad-docs/blob/master/assets/ad-video/luma_mask.jpg" />

