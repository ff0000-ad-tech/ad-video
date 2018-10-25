'use strict'

// based on jsmpeg by Dominic Szablewski - phoboslab.org, github.com/phoboslab
//
// Consider this to be under MIT license. It's largely based an an Open Source
// Decoder for Java under GPL, while I looked at another Decoder from Nokia
// (under no particular license?) for certain aspects.
// I'm not sure if this work is "derivative" enough to have a different license
// but then again, who still cares about MPEG1?
//
// Based on "Java MPEG-1 Video Decoder and Player" by Korandi Zoltan:
// http://sourceforge.net/projects/javampeg1video/
//
// Inspired by "MPEG Decoder in Java ME" by Nokia:
// http://www.developer.nokia.com/Community/Wiki/MPEG_decoder_in_Java_ME

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// fetch API not supported on mobile

export default function MpegPlugin(arg) {
	var ver = 5.0
	console.log(Array(100).join('/'), '\n\tMpegPlugin\tV :', ver)
	arg = arg || {}

	var J = document.createElement('span')
	J.tag = arg.tag || document.createElement('video')
	J.buffered = 0
	J.paused = true

	J.benchmark = !!arg.benchmark
	J.autoplay = arg.autoplay !== false
	J.loop = !!arg.loop
	//J.seekable = true;//!!arg.seekable;
	J.onReady = arg.onReady || function() {}
	J.externalDecodeCallback = arg.ondecodeframe || function() {}

	J.customIntraQuantMatrix = new Uint8Array(64)
	J.customNonIntraQuantMatrix = new Uint8Array(64)
	J.blockData = new Int32Array(64)
	J.zeroBlockData = new Int32Array(64)

	// ----------------------------------------------------------------------------
	// Loading via Ajax

	J.intraFrames = []
	J.currentFrame = -1
	J.currentTime = 0
	J.frameCount = 0
	J.duration = 0

	// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	// PUBLIC METHODS
	J.load = function(url) {
		var request = new XMLHttpRequest()

		J.url = url

		request.onreadystatechange = function() {
			if (request.readyState === request.DONE && request.status === 200) {
				loadCallback(request.response)
			}
		}

		request.onprogress = J.gl ? updateLoaderGL : updateLoader2D

		request.open('GET', url)
		request.responseType = 'arraybuffer'
		request.send()

		function updateLoader2D(ev) {
			var p = ev.loaded / ev.total,
				w = J.canvas.width,
				h = J.canvas.height,
				ctx = J.canvasContext

			ctx.fillStyle = '#222'
			ctx.fillRect(0, 0, w, h)
			ctx.fillStyle = '#fff'
			ctx.fillRect(0, h - h * p, w, h * p)
		}

		function updateLoaderGL(ev) {
			var gl = J.gl
			gl.uniform1f(gl.getUniformLocation(J.loadingProgram, 'loaded'), ev.loaded / ev.total)
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
		}

		function loadCallback(file) {
			J.buffer = new BitReader(file)

			//if( J.seekable ) {
			collectIntraFrames()
			J.buffer.index = 0
			//}

			J.findStartCode(START_SEQUENCE)
			J.firstSequenceHeader = J.buffer.index
			decodeSequenceHeader()

			// Calculate the duration. This only works if the video is seekable and we have a frame count
			J.duration = J.frameCount / J.pictureRate

			// Load the first frame
			J.nextFrame()

			if (J.autoplay) {
				J.play()
			}

			J.onReady.call(J)
		}

		function collectIntraFrames() {
			// Loop through the whole buffer and collect all intraFrames to build our seek index.
			// We also keep track of total frame count here
			var frame
			//for( frame = 0; J.findStartCode(START_PICTURE) !== BitReader.NOT_FOUND; frame++ ) {
			for (frame = 0; J.findStartCode(START_PICTURE) !== -1; frame++) {
				// Check if the found picture is an intra frame and remember the position
				J.buffer.advance(10) // skip temporalReference
				if (J.buffer.getBits(3) === PICTURE_TYPE_I) {
					// Remember index 13 bits back, before temporalReference and picture type
					J.intraFrames.push({ frame: frame, index: J.buffer.index - 13 })
				}
			}
			J.frameCount = frame
		}
	}

	J.play = function() {
		// console.log('MpegPlugin.play(), J.paused:', J.paused)

		//if( J.playing ) { return; }
		if (J.paused) {
			J.tag.dispatchEvent(new CustomEvent('play'))
			J.tag.dispatchEvent(new CustomEvent('playing'))
			J.targetTime = J.now()
			J.paused = false
			//J.playing = true;
			//J.wantsToPlay = true;
			scheduleNextFrame()
		}
	}

	J.pause = function() {
		//	console.log ( 'MpegPlugin.pause()')
		J.paused = true
		//this.playing = false;
		//this.wantsToPlay = false;

		J.tag.dispatchEvent(new CustomEvent('pause'))
	}

	J.stop = function() {
		J.currentFrame = -1
		if (J.buffer) {
			J.buffer.index = J.firstSequenceHeader
		}
		J.paused = true
		//J.playing = false;
		if (J.client) {
			J.client.close()
			J.client = null
		}
		//J.wantsToPlay = false;
		J.tag.dispatchEvent(new CustomEvent('stop'))
	}

	J.seek = function(time, seekExact) {
		this.seekToFrame((time * this.pictureRate) | 0, seekExact)
	}

	J.seekToFrame = function(seekFrame, seekExact) {
		if (seekFrame < 0 || seekFrame >= J.frameCount || !J.intraFrames.length) {
			return false
		}

		// Find the last intra frame before or equal to seek frame
		var target = null
		for (var i = 0; i < J.intraFrames.length && J.intraFrames[i].frame <= seekFrame; i++) {
			target = J.intraFrames[i]
		}

		J.buffer.index = target.index
		J.currentFrame = target.frame - 1

		// If we're seeking to the exact frame, we may have to decode some more frames before
		// the one we want
		if (seekExact) {
			for (var frame = target.frame; frame < seekFrame; frame++) {
				decodePicture(DECODE_SKIP_OUTPUT)
				J.findStartCode(START_PICTURE)
			}
			J.currentFrame = seekFrame - 1
		}

		// Decode and display the picture we have seeked to
		decodePicture()
		return true
	}

	// ============================================================================
	// Utilities
	J.readCode = function(codeTable) {
		var state = 0
		do {
			state = codeTable[state + this.buffer.getBits(1)]
		} while (state >= 0 && codeTable[state] !== 0)
		return codeTable[state + 2]
	}

	J.findStartCode = function(code) {
		var current = 0
		while (true) {
			current = this.buffer.findNextMPEGStartCode()
			//if( current === code || current === BitReader.NOT_FOUND ) {
			if (current === code || current === -1) {
				return current
			}
		}
		//return BitReader.NOT_FOUND;
		return -1
	}

	J.fillArray = function(a, value) {
		for (var i = 0, length = a.length; i < length; i++) {
			a[i] = value
		}
	}

	// ============================================================================
	// Sequence Layer
	J.pictureRate = 30
	J.lateTime = 0
	J.firstSequenceHeader = 0
	J.targetTime = 0
	J.benchmark = false
	J.benchFrame = 0
	J.benchDecodeTimes = 0
	J.benchAvgFrameTime = 0

	J.now = function() {
		return window.performance ? window.performance.now() : Date.now()
	}

	J.nextFrame = function() {
		if (!J.buffer) {
			return
		}

		var frameStart = J.now()
		while (true) {
			var code = J.buffer.findNextMPEGStartCode()

			if (code === START_SEQUENCE) {
				decodeSequenceHeader()
			} else if (code === START_PICTURE) {
				//if( J.playing ) {
				if (!J.paused) {
					scheduleNextFrame()
				}
				decodePicture()
				J.benchDecodeTimes += J.now() - frameStart
				return J.canvas
			}
			//else if( code === BitReader.NOT_FOUND ) {
			else if (code === -1) {
				J.stop() // Jump back to the beginning

				J.tag.dispatchEvent(new CustomEvent('ended'))

				// Only loop if we found a sequence header
				if (J.loop && J.sequenceStarted) {
					J.play()
				}
				return null
			} else {
				// ignore (GROUP, USER_DATA, EXTENSION, SLICES...)
			}
		}
	}

	function scheduleNextFrame() {
		J.lateTime = J.now() - J.targetTime
		var wait = Math.max(0, 1000 / J.pictureRate - J.lateTime)
		J.targetTime = J.now() + wait

		if (J.benchmark) {
			J.benchFrame++
			if (J.benchFrame >= 120) {
				J.benchAvgFrameTime = J.benchDecodeTimes / J.benchFrame
				J.benchFrame = 0
				J.benchDecodeTimes = 0
				if (window.console) {
					// console.log('Average time per frame:', J.benchAvgFrameTime, 'ms')
				}
			}
			setTimeout(J.nextFrame.bind(J), 0)
		} else if (wait < 18) {
			//J.scheduleAnimation();
			scheduleAnimation()
		} else {
			//setTimeout( J.scheduleAnimation.bind(J), wait );
			setTimeout(scheduleAnimation, wait)
		}

		function scheduleAnimation() {
			window.requestAnimationFrame(J.nextFrame.bind(J), J.canvas)
		}
	}

	function decodeSequenceHeader() {
		J.width = J.buffer.getBits(12)
		J.height = J.buffer.getBits(12)
		J.buffer.advance(4) // skip pixel aspect ratio
		J.pictureRate = PICTURE_RATE[J.buffer.getBits(4)]
		J.buffer.advance(18 + 1 + 10 + 1) // skip bitRate, marker, bufferSize and constrained bit

		// --------------------------------------------------------------
		// J.initBuffers();
		J.intraQuantMatrix = DEFAULT_INTRA_QUANT_MATRIX
		J.nonIntraQuantMatrix = DEFAULT_NON_INTRA_QUANT_MATRIX

		J.mbWidth = (J.width + 15) >> 4
		J.mbHeight = (J.height + 15) >> 4
		J.mbSize = J.mbWidth * J.mbHeight

		J.codedWidth = J.mbWidth << 4
		J.codedHeight = J.mbHeight << 4
		J.codedSize = J.codedWidth * J.codedHeight

		J.halfWidth = J.mbWidth << 3
		J.halfHeight = J.mbHeight << 3
		J.quarterSize = J.codedSize >> 2

		// Sequence already started? Don't allocate buffers again
		if (J.sequenceStarted) {
			return
		}
		J.sequenceStarted = true

		// Manually clamp values when writing macroblocks for shitty browsers
		// that don't support Uint8ClampedArray
		var MaybeClampedUint8Array = window.Uint8ClampedArray || window.Uint8Array
		if (!window.Uint8ClampedArray) {
			copyBlockToDestination = copyBlockToDestinationClamp
			addBlockToDestination = addBlockToDestinationClamp
		}

		// Allocated buffers
		J.currentY = new MaybeClampedUint8Array(J.codedSize)
		J.currentY32 = new Uint32Array(J.currentY.buffer)

		J.currentCr = new MaybeClampedUint8Array(J.codedSize >> 2)
		J.currentCr32 = new Uint32Array(J.currentCr.buffer)

		J.currentCb = new MaybeClampedUint8Array(J.codedSize >> 2)
		J.currentCb32 = new Uint32Array(J.currentCb.buffer)

		J.forwardY = new MaybeClampedUint8Array(J.codedSize)
		J.forwardY32 = new Uint32Array(J.forwardY.buffer)

		J.forwardCr = new MaybeClampedUint8Array(J.codedSize >> 2)
		J.forwardCr32 = new Uint32Array(J.forwardCr.buffer)

		J.forwardCb = new MaybeClampedUint8Array(J.codedSize >> 2)
		J.forwardCb32 = new Uint32Array(J.forwardCb.buffer)

		J.canvas.width = J.width
		J.canvas.height = J.height

		var cvs = J.canvas

		if (J.gl) {
			J.gl.useProgram(J.program)
			//J.gl.viewport(0, 0, J.width, J.height);
			J.gl.viewport(0, 0, cvs.width, cvs.height)
		} else {
			//J.currentRGBA = J.canvasContext.getImageData(0, 0, J.width, J.height);
			J.currentRGBA = J.canvasContext.getImageData(0, 0, cvs.width, cvs.height)
			J.fillArray(J.currentRGBA.data, 255)
		}
		// --------------------------------------------------------------

		if (J.buffer.getBits(1)) {
			// load custom intra quant matrix?
			for (var i = 0; i < 64; i++) {
				J.customIntraQuantMatrix[ZIG_ZAG[i]] = J.buffer.getBits(8)
			}
			J.intraQuantMatrix = J.customIntraQuantMatrix
		}

		if (J.buffer.getBits(1)) {
			// load custom non intra quant matrix?
			for (var i = 0; i < 64; i++) {
				J.customNonIntraQuantMatrix[ZIG_ZAG[i]] = J.buffer.getBits(8)
			}
			J.nonIntraQuantMatrix = J.customNonIntraQuantMatrix
		}
	}

	// ============================================================================
	// Picture Layer

	J.currentY = null
	J.currentCr = null
	J.currentCb = null
	J.currentRGBA = null
	J.pictureCodingType = 0
	// Buffers for motion compensation
	J.forwardY = null
	J.forwardCr = null
	J.forwardCb = null
	J.fullPelForward = false
	J.forwardFCode = 0
	J.forwardRSize = 0
	J.forwardF = 0

	function decodePicture(skipOutput) {
		var buf = J.buffer

		J.currentFrame++
		J.currentTime = J.currentFrame / J.pictureRate

		buf.advance(10) // skip temporalReference
		J.pictureCodingType = buf.getBits(3)
		buf.advance(16) // skip vbv_delay

		// Skip B and D frames or unknown coding type
		if (J.pictureCodingType <= 0 || J.pictureCodingType >= PICTURE_TYPE_B) {
			return
		}

		// full_pel_forward, forward_f_code
		if (J.pictureCodingType === PICTURE_TYPE_P) {
			J.fullPelForward = buf.getBits(1)
			J.forwardFCode = buf.getBits(3)
			if (J.forwardFCode === 0) {
				// Ignore picture with zero forward_f_code
				return
			}
			J.forwardRSize = J.forwardFCode - 1
			J.forwardF = 1 << J.forwardRSize
		}

		var code = 0
		do {
			code = buf.findNextMPEGStartCode()
		} while (code === START_EXTENSION || code === START_USER_DATA)

		while (code >= START_SLICE_FIRST && code <= START_SLICE_LAST) {
			decodeSlice(code & 0x000000ff)
			code = buf.findNextMPEGStartCode()
		}

		// We found the next start code; rewind 32bits and let the main loop handle it.
		buf.rewind(32)

		// Record this frame, if the recorder wants it
		//J.recordFrameFromCurrentBuffer();

		if (skipOutput !== DECODE_SKIP_OUTPUT) {
			J.renderFrame()

			J.externalDecodeCallback.call(J, J.canvas)
		}

		// If this is a reference picutre then rotate the prediction pointers
		if (J.pictureCodingType === PICTURE_TYPE_I || J.pictureCodingType === PICTURE_TYPE_P) {
			var tmpY = J.forwardY,
				tmpY32 = J.forwardY32,
				tmpCr = J.forwardCr,
				tmpCr32 = J.forwardCr32,
				tmpCb = J.forwardCb,
				tmpCb32 = J.forwardCb32

			J.forwardY = J.currentY
			J.forwardY32 = J.currentY32
			J.forwardCr = J.currentCr
			J.forwardCr32 = J.currentCr32
			J.forwardCb = J.currentCb
			J.forwardCb32 = J.currentCb32

			J.currentY = tmpY
			J.currentY32 = tmpY32
			J.currentCr = tmpCr
			J.currentCr32 = tmpCr32
			J.currentCb = tmpCb
			J.currentCb32 = tmpCb32
		}
	}

	function YCbCrToRGBA() {
		var pY = J.currentY
		var pCb = J.currentCb
		var pCr = J.currentCr
		var pRGBA = J.currentRGBA.data

		// Chroma values are the same for each block of 4 pixels, so we proccess
		// 2 lines at a time, 2 neighboring pixels each.
		// I wish we could use 32bit writes to the RGBA buffer instead of writing
		// each byte separately, but we need the automatic clamping of the RGBA
		// buffer.

		var yIndex1 = 0
		var yIndex2 = J.codedWidth
		var yNext2Lines = J.codedWidth + (J.codedWidth - J.width)

		var cIndex = 0
		var cNextLine = J.halfWidth - (J.width >> 1)

		var rgbaIndex1 = 0
		var rgbaIndex2 = J.width * 4
		var rgbaNext2Lines = J.width * 4

		var cols = J.width >> 1
		var rows = J.height >> 1

		var cb, cr, r, g, b

		for (var row = 0; row < rows; row++) {
			for (var col = 0; col < cols; col++) {
				cb = pCb[cIndex]
				cr = pCr[cIndex]
				cIndex++

				r = cr + ((cr * 103) >> 8) - 179
				g = ((cb * 88) >> 8) - 44 + ((cr * 183) >> 8) - 91
				b = cb + ((cb * 198) >> 8) - 227

				// Line 1
				var y1 = pY[yIndex1++]
				var y2 = pY[yIndex1++]
				pRGBA[rgbaIndex1] = y1 + r
				pRGBA[rgbaIndex1 + 1] = y1 - g
				pRGBA[rgbaIndex1 + 2] = y1 + b
				pRGBA[rgbaIndex1 + 4] = y2 + r
				pRGBA[rgbaIndex1 + 5] = y2 - g
				pRGBA[rgbaIndex1 + 6] = y2 + b
				rgbaIndex1 += 8

				// Line 2
				var y3 = pY[yIndex2++]
				var y4 = pY[yIndex2++]
				pRGBA[rgbaIndex2] = y3 + r
				pRGBA[rgbaIndex2 + 1] = y3 - g
				pRGBA[rgbaIndex2 + 2] = y3 + b
				pRGBA[rgbaIndex2 + 4] = y4 + r
				pRGBA[rgbaIndex2 + 5] = y4 - g
				pRGBA[rgbaIndex2 + 6] = y4 + b
				rgbaIndex2 += 8
			}

			yIndex1 += yNext2Lines
			yIndex2 += yNext2Lines
			rgbaIndex1 += rgbaNext2Lines
			rgbaIndex2 += rgbaNext2Lines
			cIndex += cNextLine
		}
	}

	J.renderFrame2D = function() {
		YCbCrToRGBA()
		J.canvasContext.putImageData(J.currentRGBA, 0, 0)
	}

	// ============================================================================
	// Accelerated WebGL YCbCrToRGBA conversion
	J.gl = null
	J.program = null
	J.YTexture = null
	J.CBTexture = null
	J.CRTexture = null

	J.createTexture = function(index, name) {
		var gl = this.gl
		var texture = gl.createTexture()

		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.uniform1i(gl.getUniformLocation(this.program, name), index)

		return texture
	}

	J.compileShader = function(type, source) {
		var gl = this.gl
		var shader = gl.createShader(type)
		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader))
		}

		return shader
	}

	function initWebGL() {
		var gl

		// attempt to get a webgl context
		try {
			gl = J.gl = J.canvas.getContext('webgl') || J.canvas.getContext('experimental-webgl')
		} catch (e) {
			return false
		}

		if (!gl) {
			return false
		}

		// init buffers
		J.buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, J.buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)

		// The main YCbCrToRGBA Shader
		J.program = gl.createProgram()
		gl.attachShader(J.program, J.compileShader(gl.VERTEX_SHADER, SHADER_VERTEX_IDENTITY))
		gl.attachShader(J.program, J.compileShader(gl.FRAGMENT_SHADER, SHADER_FRAGMENT_YCBCRTORGBA))
		gl.linkProgram(J.program)

		if (!gl.getProgramParameter(J.program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(J.program))
		}

		gl.useProgram(J.program)

		// setup textures
		J.YTexture = J.createTexture(0, 'YTexture')
		J.CBTexture = J.createTexture(1, 'CBTexture')
		J.CRTexture = J.createTexture(2, 'CRTexture')

		var vertexAttr = gl.getAttribLocation(J.program, 'vertex')
		gl.enableVertexAttribArray(vertexAttr)
		gl.vertexAttribPointer(vertexAttr, 2, gl.FLOAT, false, 0, 0)

		// Shader for the loading screen
		J.loadingProgram = gl.createProgram()
		gl.attachShader(J.loadingProgram, J.compileShader(gl.VERTEX_SHADER, SHADER_VERTEX_IDENTITY))
		gl.attachShader(J.loadingProgram, J.compileShader(gl.FRAGMENT_SHADER, SHADER_FRAGMENT_LOADING))
		gl.linkProgram(J.loadingProgram)

		gl.useProgram(J.loadingProgram)

		vertexAttr = gl.getAttribLocation(J.loadingProgram, 'vertex')
		gl.enableVertexAttribArray(vertexAttr)
		gl.vertexAttribPointer(vertexAttr, 2, gl.FLOAT, false, 0, 0)

		return true
	}

	function renderFrameGL() {
		var gl = J.gl

		// WebGL doesn't like Uint8ClampedArrays, so we have to create a Uint8Array view for
		// each plane
		var uint8Y = new Uint8Array(J.currentY.buffer),
			uint8Cr = new Uint8Array(J.currentCr.buffer),
			uint8Cb = new Uint8Array(J.currentCb.buffer)

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, J.YTexture)

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, J.codedWidth, J.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uint8Y)

		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, J.CBTexture)
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.LUMINANCE,
			J.halfWidth,
			J.height / 2,
			0,
			gl.LUMINANCE,
			gl.UNSIGNED_BYTE,
			uint8Cr
		)

		gl.activeTexture(gl.TEXTURE2)
		gl.bindTexture(gl.TEXTURE_2D, J.CRTexture)
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.LUMINANCE,
			J.halfWidth,
			J.height / 2,
			0,
			gl.LUMINANCE,
			gl.UNSIGNED_BYTE,
			uint8Cb
		)

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}

	// ============================================================================
	// Slice Layer
	J.quantizerScale = 0
	J.sliceBegin = false

	function decodeSlice(slice) {
		J.sliceBegin = true
		J.macroblockAddress = (slice - 1) * J.mbWidth - 1

		// Reset motion vectors and DC predictors
		J.motionFwH = J.motionFwHPrev = 0
		J.motionFwV = J.motionFwVPrev = 0
		J.dcPredictorY = 128
		J.dcPredictorCr = 128
		J.dcPredictorCb = 128

		J.quantizerScale = J.buffer.getBits(5)

		// skip extra bits
		while (J.buffer.getBits(1)) {
			J.buffer.advance(8)
		}

		do {
			J.decodeMacroblock()
			// We may have to ignore Video Stream Start Codes here (0xE0)!?
		} while (!J.buffer.nextBytesAreStartCode())
	}

	// ============================================================================
	// Macroblock Layer
	J.macroblockAddress = 0
	J.mbRow = 0
	J.mbCol = 0
	J.macroblockType = 0
	J.macroblockIntra = false
	J.macroblockMotFw = false
	J.motionFwH = 0
	J.motionFwV = 0
	J.motionFwHPrev = 0
	J.motionFwVPrev = 0

	J.decodeMacroblock = function() {
		// Decode macroblock_address_increment
		var increment = 0,
			t = J.readCode(MACROBLOCK_ADDRESS_INCREMENT)

		while (t === 34) {
			// macroblock_stuffing
			t = J.readCode(MACROBLOCK_ADDRESS_INCREMENT)
		}
		while (t === 35) {
			// macroblock_escape
			increment += 33
			t = J.readCode(MACROBLOCK_ADDRESS_INCREMENT)
		}
		increment += t

		// Process any skipped macroblocks
		if (J.sliceBegin) {
			// The first macroblock_address_increment of each slice is relative
			// to beginning of the preverious row, not the preverious macroblock
			J.sliceBegin = false
			J.macroblockAddress += increment
		} else {
			if (J.macroblockAddress + increment >= J.mbSize) {
				// Illegal (too large) macroblock_address_increment
				return
			}
			if (increment > 1) {
				// Skipped macroblocks reset DC predictors
				J.dcPredictorY = 128
				J.dcPredictorCr = 128
				J.dcPredictorCb = 128

				// Skipped macroblocks in P-pictures reset motion vectors
				if (J.pictureCodingType === PICTURE_TYPE_P) {
					J.motionFwH = J.motionFwHPrev = 0
					J.motionFwV = J.motionFwVPrev = 0
				}
			}

			// Predict skipped macroblocks
			while (increment > 1) {
				J.macroblockAddress++
				J.mbRow = (J.macroblockAddress / J.mbWidth) | 0
				J.mbCol = J.macroblockAddress % J.mbWidth
				copyMacroblock(J.motionFwH, J.motionFwV, J.forwardY, J.forwardCr, J.forwardCb)
				increment--
			}
			J.macroblockAddress++
		}
		J.mbRow = (J.macroblockAddress / J.mbWidth) | 0
		J.mbCol = J.macroblockAddress % J.mbWidth

		// Process the current macroblock
		J.macroblockType = J.readCode(MACROBLOCK_TYPE_TABLES[J.pictureCodingType])
		J.macroblockIntra = J.macroblockType & 0x01
		J.macroblockMotFw = J.macroblockType & 0x08

		// Quantizer scale
		if ((J.macroblockType & 0x10) !== 0) {
			J.quantizerScale = J.buffer.getBits(5)
		}

		if (J.macroblockIntra) {
			// Intra-coded macroblocks reset motion vectors
			J.motionFwH = J.motionFwHPrev = 0
			J.motionFwV = J.motionFwVPrev = 0
		} else {
			// Non-intra macroblocks reset DC predictors
			J.dcPredictorY = 128
			J.dcPredictorCr = 128
			J.dcPredictorCb = 128

			J.decodeMotionVectors()
			copyMacroblock(J.motionFwH, J.motionFwV, J.forwardY, J.forwardCr, J.forwardCb)
		}

		// Decode blocks
		var cbp = (J.macroblockType & 0x02) !== 0 ? J.readCode(CODE_BLOCK_PATTERN) : J.macroblockIntra ? 0x3f : 0

		for (var block = 0, mask = 0x20; block < 6; block++) {
			if ((cbp & mask) !== 0) {
				decodeBlock(block)
			}
			mask >>= 1
		}
	}

	J.decodeMotionVectors = function() {
		var code,
			d,
			r = 0

		// Forward
		if (J.macroblockMotFw) {
			// Horizontal forward
			code = J.readCode(MOTION)
			if (code !== 0 && J.forwardF !== 1) {
				r = J.buffer.getBits(J.forwardRSize)
				d = ((Math.abs(code) - 1) << J.forwardRSize) + r + 1
				if (code < 0) {
					d = -d
				}
			} else {
				d = code
			}

			J.motionFwHPrev += d
			if (J.motionFwHPrev > (J.forwardF << 4) - 1) {
				J.motionFwHPrev -= J.forwardF << 5
			} else if (J.motionFwHPrev < -J.forwardF << 4) {
				J.motionFwHPrev += J.forwardF << 5
			}

			J.motionFwH = J.motionFwHPrev
			if (J.fullPelForward) {
				J.motionFwH <<= 1
			}

			// Vertical forward
			code = J.readCode(MOTION)
			if (code !== 0 && J.forwardF !== 1) {
				r = J.buffer.getBits(J.forwardRSize)
				d = ((Math.abs(code) - 1) << J.forwardRSize) + r + 1
				if (code < 0) {
					d = -d
				}
			} else {
				d = code
			}

			J.motionFwVPrev += d
			if (J.motionFwVPrev > (J.forwardF << 4) - 1) {
				J.motionFwVPrev -= J.forwardF << 5
			} else if (J.motionFwVPrev < -J.forwardF << 4) {
				J.motionFwVPrev += J.forwardF << 5
			}

			J.motionFwV = J.motionFwVPrev
			if (J.fullPelForward) {
				J.motionFwV <<= 1
			}
		} else if (J.pictureCodingType === PICTURE_TYPE_P) {
			// No motion information in P-picture, reset vectors
			J.motionFwH = J.motionFwHPrev = 0
			J.motionFwV = J.motionFwVPrev = 0
		}
	}

	function copyMacroblock(motionH, motionV, sY, sCr, sCb) {
		var width, scan, H, V, oddH, oddV, src, dest, last

		// We use 32bit writes here
		var dY = J.currentY32
		var dCb = J.currentCb32
		var dCr = J.currentCr32

		// Luminance
		width = J.codedWidth
		scan = width - 16

		H = motionH >> 1
		V = motionV >> 1
		oddH = (motionH & 1) === 1
		oddV = (motionV & 1) === 1

		src = ((J.mbRow << 4) + V) * width + (J.mbCol << 4) + H
		dest = (J.mbRow * width + J.mbCol) << 2
		last = dest + (width << 2)

		var x
		var y1, y2, y
		if (oddH) {
			if (oddV) {
				while (dest < last) {
					y1 = sY[src] + sY[src + width]
					src++
					for (x = 0; x < 4; x++) {
						y2 = sY[src] + sY[src + width]
						src++
						y = ((y1 + y2 + 2) >> 2) & 0xff

						y1 = sY[src] + sY[src + width]
						src++
						y |= ((y1 + y2 + 2) << 6) & 0xff00

						y2 = sY[src] + sY[src + width]
						src++
						y |= ((y1 + y2 + 2) << 14) & 0xff0000

						y1 = sY[src] + sY[src + width]
						src++
						y |= ((y1 + y2 + 2) << 22) & 0xff000000

						dY[dest++] = y
					}
					dest += scan >> 2
					src += scan - 1
				}
			} else {
				while (dest < last) {
					y1 = sY[src++]
					for (x = 0; x < 4; x++) {
						y2 = sY[src++]
						y = ((y1 + y2 + 1) >> 1) & 0xff

						y1 = sY[src++]
						y |= ((y1 + y2 + 1) << 7) & 0xff00

						y2 = sY[src++]
						y |= ((y1 + y2 + 1) << 15) & 0xff0000

						y1 = sY[src++]
						y |= ((y1 + y2 + 1) << 23) & 0xff000000

						dY[dest++] = y
					}
					dest += scan >> 2
					src += scan - 1
				}
			}
		} else {
			if (oddV) {
				while (dest < last) {
					for (x = 0; x < 4; x++) {
						y = ((sY[src] + sY[src + width] + 1) >> 1) & 0xff
						src++
						y |= ((sY[src] + sY[src + width] + 1) << 7) & 0xff00
						src++
						y |= ((sY[src] + sY[src + width] + 1) << 15) & 0xff0000
						src++
						y |= ((sY[src] + sY[src + width] + 1) << 23) & 0xff000000
						src++

						dY[dest++] = y
					}
					dest += scan >> 2
					src += scan
				}
			} else {
				while (dest < last) {
					for (x = 0; x < 4; x++) {
						y = sY[src]
						src++
						y |= sY[src] << 8
						src++
						y |= sY[src] << 16
						src++
						y |= sY[src] << 24
						src++

						dY[dest++] = y
					}
					dest += scan >> 2
					src += scan
				}
			}
		}

		// Chrominance

		width = J.halfWidth
		scan = width - 8

		H = (motionH / 2) >> 1
		V = (motionV / 2) >> 1
		oddH = ((motionH / 2) & 1) === 1
		oddV = ((motionV / 2) & 1) === 1

		src = ((J.mbRow << 3) + V) * width + (J.mbCol << 3) + H
		dest = (J.mbRow * width + J.mbCol) << 1
		last = dest + (width << 1)

		var cr1, cr2, cr
		var cb1, cb2, cb
		if (oddH) {
			if (oddV) {
				while (dest < last) {
					cr1 = sCr[src] + sCr[src + width]
					cb1 = sCb[src] + sCb[src + width]
					src++
					for (x = 0; x < 2; x++) {
						cr2 = sCr[src] + sCr[src + width]
						cb2 = sCb[src] + sCb[src + width]
						src++
						cr = ((cr1 + cr2 + 2) >> 2) & 0xff
						cb = ((cb1 + cb2 + 2) >> 2) & 0xff

						cr1 = sCr[src] + sCr[src + width]
						cb1 = sCb[src] + sCb[src + width]
						src++
						cr |= ((cr1 + cr2 + 2) << 6) & 0xff00
						cb |= ((cb1 + cb2 + 2) << 6) & 0xff00

						cr2 = sCr[src] + sCr[src + width]
						cb2 = sCb[src] + sCb[src + width]
						src++
						cr |= ((cr1 + cr2 + 2) << 14) & 0xff0000
						cb |= ((cb1 + cb2 + 2) << 14) & 0xff0000

						cr1 = sCr[src] + sCr[src + width]
						cb1 = sCb[src] + sCb[src + width]
						src++
						cr |= ((cr1 + cr2 + 2) << 22) & 0xff000000
						cb |= ((cb1 + cb2 + 2) << 22) & 0xff000000

						dCr[dest] = cr
						dCb[dest] = cb
						dest++
					}
					dest += scan >> 2
					src += scan - 1
				}
			} else {
				while (dest < last) {
					cr1 = sCr[src]
					cb1 = sCb[src]
					src++
					for (x = 0; x < 2; x++) {
						cr2 = sCr[src]
						cb2 = sCb[src++]
						cr = ((cr1 + cr2 + 1) >> 1) & 0xff
						cb = ((cb1 + cb2 + 1) >> 1) & 0xff

						cr1 = sCr[src]
						cb1 = sCb[src++]
						cr |= ((cr1 + cr2 + 1) << 7) & 0xff00
						cb |= ((cb1 + cb2 + 1) << 7) & 0xff00

						cr2 = sCr[src]
						cb2 = sCb[src++]
						cr |= ((cr1 + cr2 + 1) << 15) & 0xff0000
						cb |= ((cb1 + cb2 + 1) << 15) & 0xff0000

						cr1 = sCr[src]
						cb1 = sCb[src++]
						cr |= ((cr1 + cr2 + 1) << 23) & 0xff000000
						cb |= ((cb1 + cb2 + 1) << 23) & 0xff000000

						dCr[dest] = cr
						dCb[dest] = cb
						dest++
					}
					dest += scan >> 2
					src += scan - 1
				}
			}
		} else {
			if (oddV) {
				while (dest < last) {
					for (x = 0; x < 2; x++) {
						cr = ((sCr[src] + sCr[src + width] + 1) >> 1) & 0xff
						cb = ((sCb[src] + sCb[src + width] + 1) >> 1) & 0xff
						src++

						cr |= ((sCr[src] + sCr[src + width] + 1) << 7) & 0xff00
						cb |= ((sCb[src] + sCb[src + width] + 1) << 7) & 0xff00
						src++

						cr |= ((sCr[src] + sCr[src + width] + 1) << 15) & 0xff0000
						cb |= ((sCb[src] + sCb[src + width] + 1) << 15) & 0xff0000
						src++

						cr |= ((sCr[src] + sCr[src + width] + 1) << 23) & 0xff000000
						cb |= ((sCb[src] + sCb[src + width] + 1) << 23) & 0xff000000
						src++

						dCr[dest] = cr
						dCb[dest] = cb
						dest++
					}
					dest += scan >> 2
					src += scan
				}
			} else {
				while (dest < last) {
					for (x = 0; x < 2; x++) {
						cr = sCr[src]
						cb = sCb[src]
						src++

						cr |= sCr[src] << 8
						cb |= sCb[src] << 8
						src++

						cr |= sCr[src] << 16
						cb |= sCb[src] << 16
						src++

						cr |= sCr[src] << 24
						cb |= sCb[src] << 24
						src++

						dCr[dest] = cr
						dCb[dest] = cb
						dest++
					}
					dest += scan >> 2
					src += scan
				}
			}
		}
	}

	// ============================================================================
	// Block layer
	function copyBlockToDestination(blockData, destArray, destIndex, scan) {
		for (var n = 0; n < 64; n += 8, destIndex += scan + 8) {
			destArray[destIndex + 0] = blockData[n + 0]
			destArray[destIndex + 1] = blockData[n + 1]
			destArray[destIndex + 2] = blockData[n + 2]
			destArray[destIndex + 3] = blockData[n + 3]
			destArray[destIndex + 4] = blockData[n + 4]
			destArray[destIndex + 5] = blockData[n + 5]
			destArray[destIndex + 6] = blockData[n + 6]
			destArray[destIndex + 7] = blockData[n + 7]
		}
	}

	function addBlockToDestination(blockData, destArray, destIndex, scan) {
		for (var n = 0; n < 64; n += 8, destIndex += scan + 8) {
			destArray[destIndex + 0] += blockData[n + 0]
			destArray[destIndex + 1] += blockData[n + 1]
			destArray[destIndex + 2] += blockData[n + 2]
			destArray[destIndex + 3] += blockData[n + 3]
			destArray[destIndex + 4] += blockData[n + 4]
			destArray[destIndex + 5] += blockData[n + 5]
			destArray[destIndex + 6] += blockData[n + 6]
			destArray[destIndex + 7] += blockData[n + 7]
		}
	}

	// Clamping version for shitty browsers (IE) that don't support Uint8ClampedArray
	function copyBlockToDestinationClamp(blockData, destArray, destIndex, scan) {
		var n = 0
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var p = blockData[n++]
				destArray[destIndex++] = p > 255 ? 255 : p < 0 ? 0 : p
			}
			destIndex += scan
		}
	}

	function addBlockToDestinationClamp(blockData, destArray, destIndex, scan) {
		var n = 0
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var p = blockData[n++] + destArray[destIndex]
				destArray[destIndex++] = p > 255 ? 255 : p < 0 ? 0 : p
			}
			destIndex += scan
		}
	}

	function decodeBlock(block) {
		//var J = this;
		var n = 0,
			quantMatrix

		// Decode DC coefficient of intra-coded blocks
		if (J.macroblockIntra) {
			var predictor, dctSize

			// DC prediction

			if (block < 4) {
				predictor = J.dcPredictorY
				dctSize = J.readCode(DCT_DC_SIZE_LUMINANCE)
			} else {
				predictor = block === 4 ? J.dcPredictorCr : J.dcPredictorCb
				dctSize = J.readCode(DCT_DC_SIZE_CHROMINANCE)
			}

			// Read DC coeff
			if (dctSize > 0) {
				var differential = J.buffer.getBits(dctSize)
				if ((differential & (1 << (dctSize - 1))) !== 0) {
					J.blockData[0] = predictor + differential
				} else {
					J.blockData[0] = predictor + ((-1 << dctSize) | (differential + 1))
				}
			} else {
				J.blockData[0] = predictor
			}

			// Save predictor value
			if (block < 4) {
				J.dcPredictorY = J.blockData[0]
			} else if (block === 4) {
				J.dcPredictorCr = J.blockData[0]
			} else {
				J.dcPredictorCb = J.blockData[0]
			}

			// Dequantize + premultiply
			J.blockData[0] <<= 3 + 5

			quantMatrix = J.intraQuantMatrix
			n = 1
		} else {
			quantMatrix = J.nonIntraQuantMatrix
		}

		// Decode AC coefficients (+DC for non-intra)
		var level = 0
		while (true) {
			var run = 0,
				coeff = J.readCode(DCT_COEFF)

			if (coeff === 0x0001 && n > 0 && J.buffer.getBits(1) === 0) {
				// end_of_block
				break
			}
			if (coeff === 0xffff) {
				// escape
				run = J.buffer.getBits(6)
				level = J.buffer.getBits(8)
				if (level === 0) {
					level = J.buffer.getBits(8)
				} else if (level === 128) {
					level = J.buffer.getBits(8) - 256
				} else if (level > 128) {
					level = level - 256
				}
			} else {
				run = coeff >> 8
				level = coeff & 0xff
				if (J.buffer.getBits(1)) {
					level = -level
				}
			}

			n += run
			var dezigZagged = ZIG_ZAG[n]
			n++

			// Dequantize, oddify, clip
			level <<= 1
			if (!J.macroblockIntra) {
				level += level < 0 ? -1 : 1
			}
			level = (level * J.quantizerScale * quantMatrix[dezigZagged]) >> 4
			if ((level & 1) === 0) {
				level -= level > 0 ? 1 : -1
			}
			if (level > 2047) {
				level = 2047
			} else if (level < -2048) {
				level = -2048
			}

			// Save premultiplied coefficient
			J.blockData[dezigZagged] = level * PREMULTIPLIER_MATRIX[dezigZagged]
		}

		// Move block to its place
		var destArray, destIndex, scan

		if (block < 4) {
			destArray = J.currentY
			scan = J.codedWidth - 8
			destIndex = (J.mbRow * J.codedWidth + J.mbCol) << 4
			if ((block & 1) !== 0) {
				destIndex += 8
			}
			if ((block & 2) !== 0) {
				destIndex += J.codedWidth << 3
			}
		} else {
			destArray = block === 4 ? J.currentCb : J.currentCr
			scan = (J.codedWidth >> 1) - 8
			destIndex = ((J.mbRow * J.codedWidth) << 2) + (J.mbCol << 3)
		}

		// ---------------------------------------------------------------------------------------------------------------------------
		if (n === 1) {
			if (J.macroblockIntra) {
				// Overwrite (no prediction)
				copyValueToDestination((J.blockData[0] + 128) >> 8, destArray, destIndex, scan)
			} else {
				// Add data to the predicted macroblock
				addValueToDestination((J.blockData[0] + 128) >> 8, destArray, destIndex, scan)
			}

			J.blockData[0] = 0
		} else {
			IDCT()

			// these 2 methods are re-assigned in other method
			if (J.macroblockIntra) {
				// Overwrite (no prediction)
				copyBlockToDestination(J.blockData, destArray, destIndex, scan)
			} else {
				// Add data to the predicted macroblock
				addBlockToDestination(J.blockData, destArray, destIndex, scan)
			}

			J.blockData.set(J.zeroBlockData)
		}

		function copyValueToDestination(value, destArray, destIndex, scan) {
			for (var n = 0; n < 64; n += 8, destIndex += scan + 8) {
				destArray[destIndex + 0] = value
				destArray[destIndex + 1] = value
				destArray[destIndex + 2] = value
				destArray[destIndex + 3] = value
				destArray[destIndex + 4] = value
				destArray[destIndex + 5] = value
				destArray[destIndex + 6] = value
				destArray[destIndex + 7] = value
			}
		}

		function addValueToDestination(value, destArray, destIndex, scan) {
			for (var n = 0; n < 64; n += 8, destIndex += scan + 8) {
				destArray[destIndex + 0] += value
				destArray[destIndex + 1] += value
				destArray[destIndex + 2] += value
				destArray[destIndex + 3] += value
				destArray[destIndex + 4] += value
				destArray[destIndex + 5] += value
				destArray[destIndex + 6] += value
				destArray[destIndex + 7] += value
			}
		}

		function IDCT() {
			// See http://vsr.informatik.tu-chemnitz.de/~jan/MPEG/HTML/IDCT.html
			// for more info.

			// prettier-ignore
			var
					b1, b3, b4, b6, b7, tmp1, tmp2, m0,
					x0, x1, x2, x3, x4, y3, y4, y5, y6, y7,
					i,
					blockData = J.blockData;

			// Transform columns
			for (i = 0; i < 8; ++i) {
				b1 = blockData[4 * 8 + i]
				b3 = blockData[2 * 8 + i] + blockData[6 * 8 + i]
				b4 = blockData[5 * 8 + i] - blockData[3 * 8 + i]
				tmp1 = blockData[1 * 8 + i] + blockData[7 * 8 + i]
				tmp2 = blockData[3 * 8 + i] + blockData[5 * 8 + i]
				b6 = blockData[1 * 8 + i] - blockData[7 * 8 + i]
				b7 = tmp1 + tmp2
				m0 = blockData[0 * 8 + i]
				x4 = ((b6 * 473 - b4 * 196 + 128) >> 8) - b7
				x0 = x4 - (((tmp1 - tmp2) * 362 + 128) >> 8)
				x1 = m0 - b1
				x2 = (((blockData[2 * 8 + i] - blockData[6 * 8 + i]) * 362 + 128) >> 8) - b3
				x3 = m0 + b1
				y3 = x1 + x2
				y4 = x3 + b3
				y5 = x1 - x2
				y6 = x3 - b3
				y7 = -x0 - ((b4 * 473 + b6 * 196 + 128) >> 8)
				blockData[0 * 8 + i] = b7 + y4
				blockData[1 * 8 + i] = x4 + y3
				blockData[2 * 8 + i] = y5 - x0
				blockData[3 * 8 + i] = y6 - y7
				blockData[4 * 8 + i] = y6 + y7
				blockData[5 * 8 + i] = x0 + y5
				blockData[6 * 8 + i] = y3 - x4
				blockData[7 * 8 + i] = y4 - b7
			}

			// Transform rows
			for (i = 0; i < 64; i += 8) {
				b1 = blockData[4 + i]
				b3 = blockData[2 + i] + blockData[6 + i]
				b4 = blockData[5 + i] - blockData[3 + i]
				tmp1 = blockData[1 + i] + blockData[7 + i]
				tmp2 = blockData[3 + i] + blockData[5 + i]
				b6 = blockData[1 + i] - blockData[7 + i]
				b7 = tmp1 + tmp2
				m0 = blockData[0 + i]
				x4 = ((b6 * 473 - b4 * 196 + 128) >> 8) - b7
				x0 = x4 - (((tmp1 - tmp2) * 362 + 128) >> 8)
				x1 = m0 - b1
				x2 = (((blockData[2 + i] - blockData[6 + i]) * 362 + 128) >> 8) - b3
				x3 = m0 + b1
				y3 = x1 + x2
				y4 = x3 + b3
				y5 = x1 - x2
				y6 = x3 - b3
				y7 = -x0 - ((b4 * 473 + b6 * 196 + 128) >> 8)
				blockData[0 + i] = (b7 + y4 + 128) >> 8
				blockData[1 + i] = (x4 + y3 + 128) >> 8
				blockData[2 + i] = (y5 - x0 + 128) >> 8
				blockData[3 + i] = (y6 - y7 + 128) >> 8
				blockData[4 + i] = (y6 + y7 + 128) >> 8
				blockData[5 + i] = (x0 + y5 + 128) >> 8
				blockData[6 + i] = (y3 - x4 + 128) >> 8
				blockData[7 + i] = (y4 - b7 + 128) >> 8
			}
		}

		// ---------------------------------------------------------------------------------------------------------------------------

		n = 0
	}

	// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	// INIT
	J.fillArray(J.zeroBlockData, 0)

	var _target = arg.target

	// if ( _target instanceof VideoPlayer ){
	if (_target.mpgScreen) {
		J.canvas = _target.mpgScreen
		J.canvas.width = _target.css.width
		J.canvas.height = _target.css.height
	} else {
		J.canvas = document.createElement('canvas')
		J.canvas.width = arg.css.width
		J.canvas.height = arg.css.height
		_target.appendChild(J.canvas)
	}
	J.canvas.style.position = 'absolute'

	// use WebGL for YCbCrToRGBA conversion if possible (much faster)
	if (!arg.forceCanvas2D && initWebGL()) {
		J.renderFrame = renderFrameGL
	} else {
		J.canvasContext = J.canvas.getContext('2d')
		J.renderFrame = J.renderFrame2D
	}

	J.src = arg.source
	J.load(arg.source)

	return J
} //)

//var JS_PROTOTYPE = MpegPlugin.prototype;

// added for autoplay toggle in VideoPlayer, error catching
//JS_PROTOTYPE.setAttribute = function(){}
//JS_PROTOTYPE.removeAttribute = function(){}

// ----------------------------------------------------------------------------
// VLC Tables and Constants

// prettier-ignore
var
		SOCKET_MAGIC_BYTES = 'jsmp',
		DECODE_SKIP_OUTPUT=1,
		PICTURE_RATE=[0,23.976,24,25,29.97,30,50,59.94,60,0,0,0,0,0,0,0],
		ZIG_ZAG=new Uint8Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]),
		DEFAULT_INTRA_QUANT_MATRIX=new Uint8Array([8,16,19,22,26,27,29,34,16,16,22,24,27,29,34,37,19,22,26,27,29,34,34,38,22,22,26,27,29,34,37,40,22,26,27,29,32,35,40,48,26,27,29,32,35,40,48,58,26,27,29,34,38,46,56,69,27,29,35,38,46,56,69,83]),
		DEFAULT_NON_INTRA_QUANT_MATRIX=new Uint8Array([16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16]),
		PREMULTIPLIER_MATRIX=new Uint8Array([32,44,42,38,32,25,17,9,44,62,58,52,44,35,24,12,42,58,55,49,42,33,23,12,38,52,49,44,38,30,20,10,32,44,42,38,32,25,17,9,25,35,33,30,25,20,14,7,17,24,23,20,17,14,9,5,9,12,12,10,9,7,5,2]),
		MACROBLOCK_ADDRESS_INCREMENT=new Int16Array([3,6,0,9,12,0,0,0,1,15,18,0,21,24,0,27,30,0,33,36,0,0,0,3,0,0,2,39,42,0,45,48,0,0,0,5,0,0,4,51,54,0,57,60,0,0,0,7,0,0,6,63,66,0,69,72,0,75,78,0,81,84,0,-1,87,0,-1,90,0,93,96,0,99,102,0,105,108,0,111,114,0,0,0,9,0,0,8,117,120,0,123,126,0,129,132,0,135,138,0,0,0,15,0,0,14,0,0,13,0,0,12,0,0,11,0,0,10,141,-1,0,-1,144,0,147,150,0,153,156,0,159,162,0,165,168,0,171,174,0,177,180,0,183,-1,0,-1,186,0,189,192,0,195,198,0,201,204,0,207,210,0,213,216,0,219,222,0,0,0,21,0,0,20,0,0,19,0,0,18,0,0,17,0,0,16,0,0,35,0,0,34,0,0,33,0,0,32,0,0,31,0,0,30,0,0,29,0,0,28,0,0,27,0,0,26,0,0,25,0,0,24,0,0,23,0,0,22]),
		MACROBLOCK_TYPE_I=new Int8Array([3,6,0,-1,9,0,0,0,1,0,0,17]),
		MACROBLOCK_TYPE_P=new Int8Array([3,6,0,9,12,0,0,0,10,15,18,0,0,0,2,21,24,0,0,0,8,27,30,0,33,36,0,-1,39,0,0,0,18,0,0,26,0,0,1,0,0,17]),
		MACROBLOCK_TYPE_B=new Int8Array([3,6,0,9,15,0,12,18,0,24,21,0,0,0,12,27,30,0,0,0,14,39,42,0,36,33,0,0,0,4,0,0,6,54,48,0,45,51,0,0,0,8,0,0,10,-1,57,0,0,0,1,60,63,0,0,0,30,0,0,17,0,0,22,0,0,26]),
		CODE_BLOCK_PATTERN=new Int16Array([6,3,0,9,18,0,12,15,0,24,33,0,36,39,0,27,21,0,30,42,0,60,57,0,54,48,0,69,51,0,81,75,0,63,84,0,45,66,0,72,78,0,0,0,60,105,120,0,132,144,0,114,108,0,126,141,0,87,93,0,117,96,0,0,0,32,135,138,0,99,123,0,129,102,0,0,0,4,90,111,0,0,0,8,0,0,16,0,0,44,150,168,0,0,0,28,0,0,52,0,0,62,183,177,0,156,180,0,0,0,1,165,162,0,0,0,61,0,0,56,171,174,0,0,0,2,0,0,40,153,186,0,0,0,48,192,189,0,147,159,0,0,0,20,0,0,12,240,249,0,0,0,63,231,225,0,195,219,0,252,198,0,0,0,24,0,0,36,0,0,3,207,261,0,243,237,0,204,213,0,210,234,0,201,228,0,216,222,0,258,255,0,264,246,0,-1,282,0,285,291,0,0,0,33,0,0,9,318,330,0,306,348,0,0,0,5,0,0,10,279,267,0,0,0,6,0,0,18,0,0,17,0,0,34,339,357,0,309,312,0,270,276,0,327,321,0,351,354,0,303,297,0,294,288,0,300,273,0,342,345,0,315,324,0,336,333,0,363,375,0,0,0,41,0,0,14,0,0,21,372,366,0,360,369,0,0,0,11,0,0,19,0,0,7,0,0,35,0,0,13,0,0,50,0,0,49,0,0,58,0,0,37,0,0,25,0,0,45,0,0,57,0,0,26,0,0,29,0,0,38,0,0,53,0,0,23,0,0,43,0,0,46,0,0,42,0,0,22,0,0,54,0,0,51,0,0,15,0,0,30,0,0,39,0,0,47,0,0,55,0,0,27,0,0,59,0,0,31]),
		MOTION=new Int16Array([3,6,0,12,9,0,0,0,0,18,15,0,24,21,0,0,0,-1,0,0,1,27,30,0,36,33,0,0,0,2,0,0,-2,42,45,0,48,39,0,60,54,0,0,0,3,0,0,-3,51,57,0,-1,69,0,81,75,0,78,63,0,72,66,0,96,84,0,87,93,0,-1,99,0,108,105,0,0,0,-4,90,102,0,0,0,4,0,0,-7,0,0,5,111,123,0,0,0,-5,0,0,7,114,120,0,126,117,0,0,0,-6,0,0,6,153,162,0,150,147,0,135,138,0,156,141,0,129,159,0,132,144,0,0,0,10,0,0,9,0,0,8,0,0,-8,171,198,0,0,0,-9,180,192,0,168,183,0,165,186,0,174,189,0,0,0,-10,177,195,0,0,0,12,0,0,16,0,0,13,0,0,14,0,0,11,0,0,15,0,0,-16,0,0,-12,0,0,-14,0,0,-15,0,0,-11,0,0,-13]),
		DCT_DC_SIZE_LUMINANCE=new Int8Array([6,3,0,18,15,0,9,12,0,0,0,1,0,0,2,27,24,0,21,30,0,0,0,0,36,33,0,0,0,4,0,0,3,39,42,0,0,0,5,0,0,6,48,45,0,51,-1,0,0,0,7,0,0,8]),
		DCT_DC_SIZE_CHROMINANCE=new Int8Array([6,3,0,12,9,0,18,15,0,24,21,0,0,0,2,0,0,1,0,0,0,30,27,0,0,0,3,36,33,0,0,0,4,42,39,0,0,0,5,48,45,0,0,0,6,51,-1,0,0,0,7,0,0,8]),
		DCT_COEFF=new Int32Array([3,6,0,12,9,0,0,0,1,21,24,0,18,15,0,39,27,0,33,30,0,42,36,0,0,0,257,60,66,0,54,63,0,48,57,0,0,0,513,51,45,0,0,0,2,0,0,3,81,75,0,87,93,0,72,78,0,96,90,0,0,0,1025,69,84,0,0,0,769,0,0,258,0,0,1793,0,0,65535,0,0,1537,111,108,0,0,0,1281,105,102,0,117,114,0,99,126,0,120,123,0,156,150,0,162,159,0,144,147,0,129,135,0,138,132,0,0,0,2049,0,0,4,0,0,514,0,0,2305,153,141,0,165,171,0,180,168,0,177,174,0,183,186,0,0,0,2561,0,0,3329,0,0,6,0,0,259,0,0,5,0,0,770,0,0,2817,0,0,3073,228,225,0,201,210,0,219,213,0,234,222,0,216,231,0,207,192,0,204,189,0,198,195,0,243,261,0,273,240,0,246,237,0,249,258,0,279,276,0,252,255,0,270,282,0,264,267,0,0,0,515,0,0,260,0,0,7,0,0,1026,0,0,1282,0,0,4097,0,0,3841,0,0,3585,315,321,0,333,342,0,312,291,0,375,357,0,288,294,0,-1,369,0,285,303,0,318,363,0,297,306,0,339,309,0,336,348,0,330,300,0,372,345,0,351,366,0,327,354,0,360,324,0,381,408,0,417,420,0,390,378,0,435,438,0,384,387,0,0,0,2050,396,402,0,465,462,0,0,0,8,411,399,0,429,432,0,453,414,0,426,423,0,0,0,10,0,0,9,0,0,11,0,0,5377,0,0,1538,0,0,771,0,0,5121,0,0,1794,0,0,4353,0,0,4609,0,0,4865,444,456,0,0,0,1027,459,450,0,0,0,261,393,405,0,0,0,516,447,441,0,516,519,0,486,474,0,510,483,0,504,498,0,471,537,0,507,501,0,522,513,0,534,531,0,468,477,0,492,495,0,549,546,0,525,528,0,0,0,263,0,0,2562,0,0,2306,0,0,5633,0,0,5889,0,0,6401,0,0,6145,0,0,1283,0,0,772,0,0,13,0,0,12,0,0,14,0,0,15,0,0,517,0,0,6657,0,0,262,540,543,0,480,489,0,588,597,0,0,0,27,609,555,0,606,603,0,0,0,19,0,0,22,591,621,0,0,0,18,573,576,0,564,570,0,0,0,20,552,582,0,0,0,21,558,579,0,0,0,23,612,594,0,0,0,25,0,0,24,600,615,0,0,0,31,0,0,30,0,0,28,0,0,29,0,0,26,0,0,17,0,0,16,567,618,0,561,585,0,654,633,0,0,0,37,645,648,0,0,0,36,630,636,0,0,0,34,639,627,0,663,666,0,657,624,0,651,642,0,669,660,0,0,0,35,0,0,267,0,0,40,0,0,268,0,0,266,0,0,32,0,0,264,0,0,265,0,0,38,0,0,269,0,0,270,0,0,33,0,0,39,0,0,7937,0,0,6913,0,0,7681,0,0,4098,0,0,7425,0,0,7169,0,0,271,0,0,274,0,0,273,0,0,272,0,0,1539,0,0,2818,0,0,3586,0,0,3330,0,0,3074,0,0,3842]),

		PICTURE_TYPE_I = 1,
		PICTURE_TYPE_P = 2,
		PICTURE_TYPE_B = 3,
		//PICTURE_TYPE_D = 4,

		START_SEQUENCE = 0xB3,
		START_SLICE_FIRST = 0x01,
		START_SLICE_LAST = 0xAF,
		START_PICTURE = 0x00,
		START_EXTENSION = 0xB5,
		START_USER_DATA = 0xB2,

		// Shaders for accelerated WebGL YCbCrToRGBA conversion
		SHADER_FRAGMENT_YCBCRTORGBA = [
			'precision mediump float;',
			'uniform sampler2D YTexture;',
			'uniform sampler2D CBTexture;',
			'uniform sampler2D CRTexture;',
			'varying vec2 texCoord;',

			'void main() {',
				'float y = texture2D(YTexture, texCoord).r;',
				'float cr = texture2D(CBTexture, texCoord).r - 0.5;',
				'float cb = texture2D(CRTexture, texCoord).r - 0.5;',

				'gl_FragColor = vec4(',
					'y + 1.4 * cr,',
					'y + -0.343 * cb - 0.711 * cr,',
					'y + 1.765 * cb,',
					'1.0',
				');',
			'}'
		].join('\n'),

		SHADER_FRAGMENT_LOADING = [
			'precision mediump float;',
			'uniform float loaded;',
			'varying vec2 texCoord;',

			'void main() {',
				'float c = ceil(loaded-(1.0-texCoord.y));',
				//'float c = ceil(loaded-(1.0-texCoord.y) +sin((texCoord.x+loaded)*16.0)*0.01);', // Fancy wave anim
				'gl_FragColor = vec4(c,c,c,1);',
			'}'
		].join('\n'),

		SHADER_VERTEX_IDENTITY = [
			'attribute vec2 vertex;',
			'varying vec2 texCoord;',

			'void main() {',
				'texCoord = vertex;',
				'gl_Position = vec4((vertex * 2.0 - 1.0) * vec2(1, -1), 0.0, 1.0);',
			'}'
		].join('\n');

var MACROBLOCK_TYPE_TABLES = [null, MACROBLOCK_TYPE_I, MACROBLOCK_TYPE_P, MACROBLOCK_TYPE_B]

// ----------------------------------------------------------------------------
// Bit Reader

var BitReader = function(arrayBuffer) {
	var B = this
	B.bytes = new Uint8Array(arrayBuffer)
	B.length = B.bytes.length
	B.writePos = B.bytes.length
	B.index = 0
}

//BitReader.NOT_FOUND = -1;

BitReader.prototype = {
	findNextMPEGStartCode: function() {
		var B = this
		for (var i = (B.index + 7) >> 3; i < B.writePos; i++) {
			if (B.bytes[i] === 0x00 && B.bytes[i + 1] === 0x00 && B.bytes[i + 2] === 0x01) {
				B.index = (i + 4) << 3
				return B.bytes[i + 3]
			}
		}
		B.index = B.writePos << 3
		//return BitReader.NOT_FOUND;
		return -1
	},

	nextBytesAreStartCode: function() {
		var B = this
		var i = (B.index + 7) >> 3
		return i >= B.writePos || (B.bytes[i] === 0x00 && B.bytes[i + 1] === 0x00 && B.bytes[i + 2] === 0x01)
	},

	nextBits: function(count) {
		var B = this
		var byteOffset = B.index >> 3,
			room = 8 - (B.index % 8)

		if (room >= count) {
			return (B.bytes[byteOffset] >> (room - count)) & (0xff >> (8 - count))
		}

		var leftover = (B.index + count) % 8, // Leftover bits in last byte
			end = (B.index + count - 1) >> 3,
			value = B.bytes[byteOffset] & (0xff >> (8 - room)) // Fill out first byte

		for (byteOffset++; byteOffset < end; byteOffset++) {
			value <<= 8 // Shift and
			value |= B.bytes[byteOffset] // Put next byte
		}

		if (leftover > 0) {
			value <<= leftover // Make room for remaining bits
			value |= B.bytes[byteOffset] >> (8 - leftover)
		} else {
			value <<= 8
			value |= B.bytes[byteOffset]
		}

		return value
	},

	getBits: function(count) {
		var value = this.nextBits(count)
		this.index += count
		return value
	},

	advance: function(count) {
		return (this.index += count)
	},

	rewind: function(count) {
		return (this.index -= count)
	}
}
