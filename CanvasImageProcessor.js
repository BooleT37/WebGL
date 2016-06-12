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
			r = Math.pow(data[i] / 256, gamma) * 256;
			g = Math.pow(data[i + 1] / 256, gamma) * 256;;
			b = Math.pow(data[i + 2] / 256, gamma) * 256;;
			a = data[i + 3];
			
			data[i] = M[0] * r + M[1] * g + M[2] * b + M[3] * a + R[0] * 255;
			data[i + 1] = M[4] * r + M[5] * g + M[6] * b + M[7] * a + R[1] * 255;
			data[i + 2] = M[8] * r + M[9] * g + M[10] * b + M[11] * a + R[2] * 255;
			data[i + 3] = M[12] * r + M[13] * g + M[14] * b + M[15] * a + R[3] * 255;
        }

        // overwrite original image
        this.context.putImageData(imageData, this.imageCoords.x, this.imageCoords.y);
	}
}