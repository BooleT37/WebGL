class TestsManager {
	static GenerateRandomColorMatrices(n) {
		var res = [];
		for (var i = 0; i < n; i++) {
			var obj = {
				matrix4x4: [],
				lastRow: []
			};
			for (var j = 0; j < 12; j++) {
				obj.matrix4x4[j] = Math.random() / 5;
			}
			for (var j = 0; j < 3; j++) {
				obj.matrix4x4[12 + j] = Math.random() / 50;
			}
			obj.matrix4x4[15] = Math.random() * (0.25) + 0.75;
			for (var j = 0; j < 3; j++) {
				obj.lastRow[j] = Math.random() / 5;
			}
			obj.lastRow[3] = Math.random() / 50;
			res.push(obj);
		}
		return res;
	}
	
	static GenerateRandomRotationAngles(n) {
		var res = [];
		for (var i = 0; i < n; i++) {
			res.push(Math.random() * 360);
		}
		return res;
	}
}