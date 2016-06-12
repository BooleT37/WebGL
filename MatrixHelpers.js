class MatrixHelpers {
	static dotProduct(M1, M2) {
		var sum, res = [];
		for (var i = 0; i < 3; i++)
			for (var j = 0; j < 3; j++) {
				sum = 0;
				for (var k = 0; k < 3; k++)
					sum += M1[i * 3 + k] * M2[k * 3 + j]
				res[i * 3 + j] = sum;
			}
		return res;
	}
	
	static getFitCanvasMatrix() {
		return [
			2, 0, 0,
			0, -2, 0,
			-1, 1, 1
		];
	}
	
	static getMatrixToFitImageInsideCanvas(imgWidth, imgHeight, canvasWidth, canvasHeight) {
		var kw = imgWidth / canvasWidth,
			kh = imgHeight / canvasHeight;
		
		//It took me 3 hours and 9 notebook pages to count these values for M. Holy shit
		//If we can fit image in canvas without scaling it:
		if (kw < 1 && kh < 1) {
			return [
				kw * 2, 0, 0,
				0, -kh * 2, 0,
				-kw, kh, 1
			];
		} else {
			//scale and fit width:
			if (kw >= kh) {
				var k = kh / kw;
				return [
					2, 0, 0,
					0, -k * 2, 0,
					-1, k, 1
				];
			//scale and fit height
			} else {
				var k = kw / kh;
				return [
					k * 2, 0, 0,
					0, -2, 0,
					-k, 1, 1
				];
			}
		}
	}
	
	static getImageCoordsToFitImageInsideCanvas(imgWidth, imgHeight, canvasWidth, canvasHeight) {
		var kw = imgWidth / canvasWidth,
			kh = imgHeight / canvasHeight;
		
		if (kw < 1 && kh < 1) {
			return {
				x: Math.floor((canvasWidth - imgWidth) / 2),
				y: Math.floor((canvasHeight - imgHeight) / 2),
				width: imgWidth,
				height: imgHeight
			}
		} else {
			//scale and fit width:
			if (kw >= kh) {
				var k = kh / kw;
				return {
					x: 0,
					y: Math.floor(canvasHeight * (1 - k) / 2),
					width: canvasWidth,
					height: Math.floor(k * canvasHeight)
				}
			} else {
				var k = kw / kh;
				return {
					x: Math.floor(canvasWidth * (1 - k) / 2),
					y: 0,
					width: Math.floor(k * canvasWidth),
					height: canvasHeight
				}
			}
		}
	}
	
	static getRotationMatrix(angle) {
		if (angle === undefined || angle === 0)
			return [
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			];
		var radAngle = angle * Math.PI / 180;
		var s = Math.sin(radAngle),
			c = Math.cos(radAngle);
		return [
			c, -s, 0,
			s, c, 0,
			0, 0, 1
		]
	}
}