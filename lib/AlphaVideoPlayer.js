/**
	@npmpackage
	@class AlphaVideoPlayer
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-video">ad-video</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { AlphaVideoPlayer } from 'ad-video'
		</codeblock>
		<br><br>
		
		This object creates a {@link VideoPlayer} instance and attaches HTML Canvas masking.  This player has the ability to function exactly the same as a regular {@link VideoPlayer} instance.
		<br><br>

		<b>Note:</b><br>
		If using a dynamic video mask (rather than a static mask from a PNG, JPG, or other bitmap source) then ensure the runtimeIncludes object of your index.html file contains MpegPlugin.min.js:
		<br>
		var runtimeIncludes = {
			get mpegPluginPath(){ return adParams.corePath + "js/video/MpegPlugin.min.js"; },
		};
		<br>
		<br>

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
		<codeblock>
			var runtimeIncludes = {
				get mpegPluginPath(){ return adParams.corePath + "js/video/MpegPlugin.min.js"; },
			};
		</codeblock>
		<br>
		<b><span style="color: #cc0000;">In addition, if you are using building an inline autoplay unit, Android devices require a video format that must be MPG. The source can either be an MPG or an array.</span></b>
		<br>
		<b><span style="color: #cc0000;">Use an array for STATIC, not DYNAMIC, masking so that only Android needs to load the MpegPlugin script: other devices should be able to use MP4 just fine.</span></b>
		<codeblock>
			source: adParams.videosPath + 'myVideo.mpg'
			// or
			source: [
				adParams.videosPath + 'myVideo.mp4',
				adParams.videosPath + 'myVideo.mpg',
			],
		</codeblock>
		<br>
		<br>
		<br>
		<b>Sample Player - Uses a video with a <i>stacked</i> masking source. <span style="color: #cc0000;">(NOTE THE MPG VIDEO FORMAT)</span></b><br>
		<codeblock>
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
		</codeblock>
		<br><br>


		<b>Sample - Uses a PNG - named 'red_png' - as a mask. The native alpha channel defines the visible area. <span style="color: #cc0000;">(NOTE THE MP4 VIDEO FORMAT)</span></b><br>
		<codeblock>
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
			} );

			View.main.AlphaVideoPlayer.play();
		</codeblock>
		<br>
		<img src="../docs_images/alphavideoplayer/alpha_mask.jpg" />
		<br><br><br><br>


		<b>Sample - Uses a JPG - named 'red_jpg' - as a mask. The image's blacks and whites define the visible area. <span style="color: #cc0000;">(NOTE THE MP4 VIDEO FORMAT)</span></b><br>
		<codeblock>
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
		</codeblock>
		<br>
		<img src="../docs_images/alphavideoplayer/luma_mask.jpg" />
*/

/*
https://gcdn.2mdn.net/videoplayback/id/edba9e97a7c1dd22/itag/15/source/doubleclick/ratebypass/yes/mime/video%2Fmp4/acao/yes/ip/0.0.0.0/ipbits/0/expire/3640115052/sparams/id,itag,source,ratebypass,mime,acao,ip,ipbits,expire/signature/482C5FCD4B7100BB1EC3FA2922402BDF5808CE11.4BE0A25B2024A5513902E3272CDE2F5FD4C4244F/key/ck2/file/file.mp4
https://s0.2mdn.net/fb1d420b-c1c9-4501-b0a9-367fcec2ec10
*/
import { Device } from 'ad-external'
import { CanvasDrawer, CanvasImage, CanvasUtils } from 'ad-canvas'
import { ImageManager } from 'ad-control'
import { LoaderUtils } from 'ad-load'
import { FrameRate } from 'ad-events'
import VideoPlayer from './VideoPlayer'

var AlphaVideoPlayer = function(arg) {
	arg.crossOrigin = 'anonymous'

	var _css = {}
	var _mult = 1
	var _source = arg.source
	var _isMpg
	if (Array.isArray(_source)) {
		if (Device.type != 'desktop' && Device.brand == 'android') {
			for (var i = 0; i < _source.length; i++) {
				if (isSourceMpg(_source[i])) {
					arg.source = _source[i]
					_isMpg = true
					break
				}
			}
		}
	} else {
		_isMpg = isSourceMpg(_source)
	}

	var isStatic = arg.mask != undefined
	if (_isMpg) {
		arg.deviceType = 'mobile'
		arg.deviceBrand = 'android'
		arg.forceMpg = true
		if (!isStatic) _mult = 2
	}

	for (var item in arg.css) _css[item] = arg.css[item]
	arg.css[arg.videoStacked ? 'height' : 'width'] *= _mult
	var A = new VideoPlayer(arg)

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// MARK-UP

	var outputCanvas = new CanvasDrawer({
		id: 'AlphaVideoPlayer_outputCanvas',
		target: arg.target,
		css: _css
	})

	if (isStatic) {
		var _maskImg = ImageManager.get(arg.mask.source)
		var maskCanvas = new CanvasDrawer({
			// target: View.main,
			id: 'AlphaVideoPlayer_staticMaskCanvas',
			css: {
				width: _maskImg.width,
				height: _maskImg.height
			}
		})

		// MAKE THE MASK IMAGE
		// creates a mask from an ALPHA MATTE
		new CanvasImage({
			source: _maskImg,
			target: maskCanvas
		})
		maskCanvas.update()

		// converts the mask layer into a LUMA matte
		if (arg.mask.alphaMatte !== true) applyLumaFromTo(maskCanvas, maskCanvas)

		// UPDATE THE MASK ELEMENT AND APPLY IT TO THE OUTPUT CANVAS AFTER APPLYING THE VIDEO REFERENCE
		new CanvasImage({
			id: 'videoOutput',
			source: A[_isMpg ? 'mpgScreen' : 'screen'],
			target: outputCanvas,
			params: {
				width: outputCanvas.width,
				height: outputCanvas.height
			}
		})

		new CanvasImage({
			id: 'imageMask',
			source: maskCanvas,
			target: outputCanvas,
			blendMode: CanvasBlendMode.DEST_IN
		})
	} else {
		if (!_isMpg)
			throw new Error('You want to use a dynamic masking solution: video format must be, and is not, .MPG')

		var startPos = arg.videoStacked ? [0, _css.height] : [_css.width, 0]
		var maskCanvas = new CanvasDrawer({
			// target: View.main,
			id: 'AlphaVideoPlayer_dynamicCanvas',
			css: _css
			// debug: true
		})

		// the LUMA section of the video which will be converted to a mask
		var _maskVid = new CanvasImage({
			id: 'videoMask',
			source: A.mpgScreen,
			target: maskCanvas,
			params: {
				sourceX: startPos[0],
				sourceY: startPos[1],
				width: outputCanvas.width,
				height: outputCanvas.height,
				sourceW: outputCanvas.width,
				sourceH: outputCanvas.height
			}
		})

		// the video elements to mask
		new CanvasImage({
			id: 'videoOutput',
			source: A.mpgScreen,
			target: outputCanvas,
			params: {
				width: _maskVid.width,
				height: _maskVid.height,
				sourceW: _maskVid.width,
				sourceH: _maskVid.height
			}
		})
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	function updateStatic() {
		// console.log('AlphaVideoPlayer.updateStatic()');
		outputCanvas.update()
	}

	function updateDynamic() {
		// console.log('AlphaVideoPlayer.updateDynamic()');
		maskCanvas.update()
		applyLumaFromTo(maskCanvas, outputCanvas)
	}

	function applyLumaFromTo(input, output) {
		output.update()

		var _imageDataOut = CanvasUtils.getImageData(output.canvas)

		var _pixelsIn = CanvasUtils.getImageData(input.canvas).data
		var _pixelsOut = _imageDataOut.data
		//

		var _lumaValue
		for (var i = 0; i < _pixelsIn.length; i += 4) {
			_lumaValue = (_pixelsIn[i] + _pixelsIn[i + 1] + _pixelsIn[i + 2]) / 3
			// this is done because MPG conversion changes the color values
			// pure black becomes rgb(16, 16, 16) rather than rgb(0, 0, 0)
			// pure white becomes rgb(235, 235, 235) rather than rgb(255, 255, 255)
			// and everything in between gets compressed proportionately
			// this converts that 16-235 range we get to the 0-255 range we desire
			if (_isMpg) {
				for (var a = 0; a < 3; a++) _pixelsOut[i + a] = scaleTo255(_pixelsOut[i + a])
				_lumaValue = scaleTo255(_lumaValue)
			}
			_pixelsOut[i + 3] = _lumaValue
		}

		CanvasUtils.setImageData(output, _imageDataOut)
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	function handlePlay(event) {
		console.log('AlphaVideoPlayer.handlePlay()')
		FrameRate.register(A, isStatic ? updateStatic : updateDynamic)
	}

	function handleComplete(event) {
		console.log('AlphaVideoPlayer.handleComplete()')
		FrameRate.unregister(A, isStatic ? updateStatic : updateDynamic)
	}

	function scaleTo255(val) {
		return ((val - 16) / 219) * 255
	}

	function isSourceMpg(source) {
		var fileType = LoaderUtils.getFileType(source)
		return fileType == 'mpg' || fileType == 'js'
	}

	/* ------------------------------------------------------------------------------------------------------------------------------- */
	// INIT
	A.screen.addEventListener('ended', handleComplete, false)
	A.screen.addEventListener('play', handlePlay, false)
	A.container.style.display = A.screen.style.display = 'none'
	if (A.mpgScreen) A.mpgScreen.style.display = 'none'
	return A
}

export default AlphaVideoPlayer
