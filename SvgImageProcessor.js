class SvgImageProcessor {
	constructor(img, svg) {
		this.img = img;
		this.svg = svg;
		this.svgWidth = svg.width.baseVal.value;
		this.svgHeight = svg.height.baseVal.value;
		
		var imageCoords = MatrixHelpers.getImageCoordsToFitImageInsideCanvas(img.width, img.height, this.svgWidth, this.svgHeight);
		this.imageElement = this.svg.querySelector('image');
		this.imageElement.setAttributeNS('http://www.w3.org/1999/xlink','href', img.src);
		this.imageElement.setAttribute('x', imageCoords.x);
		this.imageElement.setAttribute('y', imageCoords.y);
		this.imageElement.setAttribute('width', imageCoords.width);
		this.imageElement.setAttribute('height', imageCoords.height);
	}
	
	render(options) {
		if (options === undefined)
			options = {};
		
		if (options.rotationAngle === undefined) {
			options.rotationAngle = 0;
		}
		this.imageElement.setAttribute('transform', 'rotate(' + options.rotationAngle + ' ' + (this.svgWidth / 2) + ' ' + (this.svgHeight / 2) + ')');
		
		var gamma = options.gamma === undefined ? 1 : options.gamma;
		
		var filter = this.svg.getElementById('filter');
		filter.querySelector('feFuncR').setAttribute('exponent', gamma);
		filter.querySelector('feFuncG').setAttribute('exponent', gamma);
		filter.querySelector('feFuncB').setAttribute('exponent', gamma);
		
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
		var newColorMatrix = [];
		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 4; col++)
				newColorMatrix.push(options.colorMatrix.matrix4x4[row * 4 + col]);
			newColorMatrix.push(options.colorMatrix.lastRow[row])
		}
		filter.querySelector('feColorMatrix').setAttribute('values', newColorMatrix.join(' '));
		 
	}
}