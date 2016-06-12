class CanvasImageProcessor {
	constructor(img, canvas) {
		this.img = img;
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		var data = this.context.createImageData(canvas.width, canvas.height);
		
		this.imageCoords = MatrixHelpers.getImageCoordsToFitImageInsideCanvas(img.width, img.height, canvas.width, canvas.height);
	}
	
	render(options) {
		if (options === undefined)
			options = {};
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		var imageCoords;
		if (options.fitCanvas) {
			imageCoords = (0, 0, this.canvas.width, this.canvas.height);
		} else {
			imageCoords = this.imageCoords;
		}
		
		//if (options.rotationAngle === undefined)
		//	options.rotationAngle = 0;
		//this.context.rotate(options.rotationAngle * Math.PI / 180);
		
		var gamma = options.gamma === undefined ? 1 : options.gamma;
		
		if (options.colorMatrix === undefined)
			options.colorMatrix = {
				matrix4x4: [
					1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					0,0,0,1
				],
				lastRow: [0,0,0,0]
			};
		
		this.context.drawImage(this.img, this.imageCoords.x, this.imageCoords.y, this.imageCoords.width, this.imageCoords.height);
		var imageData = this.context.getImageData(this.imageCoords.x, this.imageCoords.y, this.imageCoords.width, this.imageCoords.height);
		var data = imageData.data;
		
		var M = options.colorMatrix.matrix4x4, R = options.colorMatrix.lastRow;
		var r, g, b, a;
        for (var i = 0; i < data.length; i += 4) {
			//var oldPixel = data.slice(i, i + 4);
			//for (var i = 0; i < 3; i++) {
			//	oldPixel[i] = Math.pow(oldPixel[i], gamma);
			//}
			//var newPixel = this.applyColorMatrixToPixel(colorMatrix, oldPixel);
			
			//data[i] = Math.pow(data[i], gamma);
			//data[i + 1] = Math.pow(data[i + 1], gamma);
			//data[i + 2] = Math.pow(data[i + 2], gamma);
			r = Math.pow(data[i], gamma);
			g = Math.pow(data[i + 1], gamma);
			b = Math.pow(data[i + 2], gamma);
			a = Math.pow(data[i + 3], gamma);
			
			data[i] = M[0] * r + M[1] * g + M[2] * b + M[3] * a + R[0] * 255;
			data[i + 1] = M[4] * r + M[5] * g + M[6] * b + M[7] * a + R[1] * 255;
			data[i + 2] = M[8] * r + M[9] * g + M[10] * b + M[11] * a + R[2] * 255;
			data[i + 3] = M[12] * r + M[13] * g + M[14] * b + M[15] * a + R[3] * 255;
        }

        // overwrite original image
        this.context.putImageData(imageData, this.imageCoords.x, this.imageCoords.y);
	}
	
	applyColorMatrixToPixel(colorMatrix, pixel) {
		var res = [];
		for (var row = 0; row < 4; row++) {
			res[row] = 0;
			for (var col = 0; col < 4; col++) {
				res[row * 4 + col] += colorMatrix.matrix4x4[row * 4 + col] * pixel[col];
			}
		}
		for (var i = 0; i < 4; i++) {
			res[i] += colorMatrix.lastRow[i];
		}
		return res;
	}
}