export default class CuePoints {
	constructor(points = []) {
		const T = this
		T.active = false
		T.seeked = false
		T.pool = []

		points.forEach(item => {
			T.add(item.time, item.handler, item.params)
		})
	}

	add(time, handler, params) {
		console.log(':: CuePoints :: add() ::', this)
		const T = this
		T.active = true
		var cuePoint = {
			time: time,
			handler: handler,
			frame: -1,
			params: params || null,
			past: false
		}

		T.pool.push(cuePoint)
		T.pool.sort((a, b) => a.time - b.time)
		// console.log('addCuePoint:', T)
	}

	check(player, time) {
		// console.log('checkCutPoint', T.active, T.pool.length)
		const T = this
		if (T.active) {
			for (var i = 0; i < T.pool.length; i++) {
				if (T.seeked) {
					T.pool[i].past = T.pool[i].time < time
				} else {
					if (T.pool[i].time < time && !T.pool[i].past) {
						T.pool[i].handler.apply(player, T.pool[i].params)
						T.pool[i].past = true
					}
				}
			}
		}
		T.seeked = false
	}
}
