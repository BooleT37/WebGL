function onLoad() {
	var program = new Program();
	program.run();
}

class Program {
	constructor() {}
	
	run() {
		var self = this;
		document.getElementById("file_input").onchange = function(e) {
			self.file = e.target.files[0];
			var url = window.URL.createObjectURL(self.file);
			self.img = new Image();
			self.img.src = url;
			
			self.img.onload = function() {
				self.processor = new WebglImageProcessor(self.img, document.getElementById("canvas"));
				self.processor.render();
				self.enableControls();
				self.resetControls();
				self.options = {};
			}
		}
		
		self.getControlsRefs();		
		self.initializeButtonHandlers();
		
		self.linkSliderAndInput(document.getElementById("rotate_slider"), document.getElementById("degrees_input"));
		self.linkSliderAndInput(document.getElementById("r_component_slider"), document.getElementById("r_component_input"));
		self.linkSliderAndInput(document.getElementById("g_component_slider"), document.getElementById("g_component_input"));
		self.linkSliderAndInput(document.getElementById("b_component_slider"), document.getElementById("b_component_input"));
		self.linkSliderAndInput(document.getElementById("a_component_slider"), document.getElementById("a_component_input"));
		self.linkSliderAndInput(document.getElementById("gamma_slider"), document.getElementById("gamma_input"));
	}

	initializeButtonHandlers() {
		var self = this;
		
		//Rotate
		self.rotateSlider.addEventListener('input', function() {
			self.options.rotationAngle = self.rotateSlider.value;
			self.processor.render(self.options);
		});
		
		self.restoreButton.onclick = function() {
			self.options = {};
			self.processor.render(self.options);
			self.resetControls();
		}
		
		function renderColorMatrix(matrix, lastRow) {
			self.options.colorMatrix = {
				matrix4x4: matrix,
				lastRow: lastRow
			};
			self.processor.render(self.options);
		}
		
		function applyColorComponents() {
			var r = self.rComponentSlider.value / 100,
				g = self.gComponentSlider.value / 100,
				b = self.bComponentSlider.value / 100,
				a = self.aComponentSlider.value / 100;
			renderColorMatrix([
				r,0,0,0,
				0,g,0,0,
				0,0,b,0,
				0,0,0,a
			], [0,0,0,0]);
		}
		
		self.rComponentSlider.addEventListener('input', applyColorComponents);
		self.gComponentSlider.addEventListener('input', applyColorComponents);
		self.bComponentSlider.addEventListener('input', applyColorComponents);
		self.aComponentSlider.addEventListener('input', applyColorComponents);
		
		self.gammaSlider.addEventListener('input', function() {
			self.options.gamma = self.gammaSlider.value;
			self.processor.render(self.options);
		});
		
		//Grayscale
		self.colorMatrixTiles[0].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				0.33,0.59,0.11,0,
				0.33,0.59,0.11,0,
				0.33,0.59,0.11,0,
				0,0,0,1
			], [0,0,0,0]);
		});
		//Invert
		self.colorMatrixTiles[1].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				-1,0,0,0,
				0,-1,0,0,
				0,0,-1,0,
				0,0,0,1
			], [1,1,1,0]);
		}),
		//RGB -> BGR
		self.colorMatrixTiles[2].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				0,0,1,0,
				0,1,0,0,
				1,0,0,0,
				0,0,0,1
			], [0,0,0,0]);
		}),
		//Sepia
		self.colorMatrixTiles[3].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				0.393,0.769,0.189,0,
				0.349,0.686,0.168,0,
				0.272,0.534,0.131,0,
				0,0,0,1
			], [0,0,0,0]);
		}),
		//Black & White
		self.colorMatrixTiles[4].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				1.5,1.5,1.5,0,
				1.5,1.5,1.5,0,
				1.5,1.5,1.5,0,
				0,0,0,1
			], [-1,-1,-1,0]);
		}),
		//Polaroid Color
		self.colorMatrixTiles[5].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				1.438,-0.122,-0.016,0,
				-0.062,1.378,-0.016,0,
				-0.062,-0.122,1.483,0,
				0,0,0,1
			], [-0.03,0.05,-0.02,0]);
		}),
		//White to Alpha
		self.colorMatrixTiles[6].addEventListener('click', function(e) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix([
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				-1,-1,-1,1
			], [0,0,0,0]);
		}),
		
		
		//save
		self.saveButton.onclick = function() {
			var tempCanvas = document.createElement('canvas');
			tempCanvas.style.display = "none";
			document.body.appendChild(tempCanvas);
			
			var tempProcessor = new WebglImageProcessor(self.img, tempCanvas);
			tempCanvas.width = self.img.width;
			tempCanvas.height = self.img.height;
			tempProcessor.gl.viewport(0, 0, self.img.width, self.img.height);
			
			self.options.fitCanvas = true;
			tempProcessor.render(self.options);
			var image = tempCanvas.toDataURL(self.file.type); //TODO big files transform incorrectly, needs fixing
			document.body.removeChild(tempCanvas);
			self.options.fitCanvas = false;
			
			var download = document.createElement('a');
			download.href = image;
			download.download = self.file.name;
			download.click();
		}		
	}
	
	linkSliderAndInput(slider, input) {
		var event = new Event('input');
		input.addEventListener('input', function() {
			slider.value = input.value;
			slider.dispatchEvent(event);
		});
		
		slider.addEventListener('input', function() {
			input.value = slider.value;
		});
	}
	
	deactivateAllColorMatrixTiles() {
		var colorMatrixTiles = document.getElementsByClassName('colorMatrixTile');
		for (var i = 0; i < colorMatrixTiles.length; i++)
			colorMatrixTiles[i].classList.remove('colorMatrixTile_active');
	}
	
	acivateColorMatrixTile(tile) {
		this.deactivateAllColorMatrixTiles();
		tile.classList.add('colorMatrixTile_active');
	}
	
	resetControls() {
		this.degreesInput.value = 0;
		this.rotateSlider.value = 0;
		this.rComponentSlider.value = 100;
		this.rComponentInput.value = 100;
		this.gComponentSlider.value = 100;
		this.gComponentInput.value = 100;
		this.bComponentSlider.value = 100;
		this.bComponentInput.value = 100;
		this.aComponentSlider.value = 100;
		this.aComponentInput.value = 100;
		this.gammaSlider.value = 1;
		this.gammaInput.value = 1;
		this.deactivateAllColorMatrixTiles();
	}
	
	enableControls() {
		this.restoreButton.disabled = false;
		this.rotateSlider.disabled = false;
		this.degreesInput.disabled = false;
		this.saveButton.disabled = false;
		this.saveButton.disabled = false;
		this.rComponentSlider.disabled = false;
		this.rComponentInput.disabled = false;
		this.gComponentSlider.disabled = false;
		this.gComponentInput.disabled = false;
		this.bComponentSlider.disabled = false;
		this.bComponentInput.disabled = false;
		this.aComponentSlider.disabled = false;
		this.aComponentInput.disabled = false;
		this.gammaSlider.disabled = false;
		this.gammaInput.disabled = false;
		this.colorMatrixTiles.forEach(function(tile) { tile.classList.remove('colorMatrixTile_disabled') });
	}
	
	getControlsRefs() {
		this.restoreButton = document.getElementById("restore_button"),
		this.rotateSlider = document.getElementById("rotate_slider"),
		this.degreesInput = document.getElementById("degrees_input"),
		this.saveButton = document.getElementById("save_button"),
		this.rComponentSlider = document.getElementById("r_component_slider"),
		this.rComponentInput = document.getElementById("r_component_input"),
		this.gComponentSlider = document.getElementById("g_component_slider"),
		this.gComponentInput = document.getElementById("g_component_input"),
		this.bComponentSlider = document.getElementById("b_component_slider"),
		this.bComponentInput = document.getElementById("b_component_input"),
		this.aComponentSlider = document.getElementById("a_component_slider"),
		this.aComponentInput = document.getElementById("a_component_input"),
		this.gammaSlider = document.getElementById("gamma_slider"),
		this.gammaInput = document.getElementById("gamma_input");
		this.colorMatrixTiles = [
			document.getElementById("colorMatrixTile_02"),
			document.getElementById("colorMatrixTile_03"),
			document.getElementById("colorMatrixTile_04"),
			document.getElementById("colorMatrixTile_05"),
			document.getElementById("colorMatrixTile_06"),
			document.getElementById("colorMatrixTile_07"),
			document.getElementById("colorMatrixTile_08")
		]
	}
}