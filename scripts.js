function onLoad() {
	var program = new Program();
	program.run();
}

class Program {
	constructor() {}
	
	run() {
		var self = this;
		self.getControlsRefs();
		
		document.getElementById("file_input").onchange = function(e) {
			if (e.target.files.length === 0)
				return;
			self.file = e.target.files[0];
			var url = window.URL.createObjectURL(self.file);
			self.img = new Image();
			self.img.src = url;
			
			self.img.onload = function() {
				self.drawInitialImage();
			}
		}
		
		self.initializeButtonHandlers();
		
		self.linkSliderAndInput(self.rotateSlider, self.degreesInput);
		self.linkSliderAndInput(self.rComponentSlider, self.rComponentInput);
		self.linkSliderAndInput(self.gComponentSlider, self.gComponentInput);
		self.linkSliderAndInput(self.bComponentSlider, self.bComponentInput);
		self.linkSliderAndInput(self.aComponentSlider, self.aComponentInput);
		self.linkSliderAndInput(self.brightnessSlider, self.brightnessInput);
		self.linkSliderAndInput(self.contrastSlider, self.contrastInput);
		self.linkSliderAndInput(self.saturationSlider, self.saturationInput);
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
		
		function renderColorMatrix(matrix4x4, lastRow) {
			self.options.colorMatrix = {
				matrix4x4: matrix4x4,
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
			self.options.gamma = parseFloat(self.gammaSlider.value);
			self.processor.render(self.options);
		});
		
		function applyMatrixTransform() {
			var b = parseFloat(self.brightnessSlider.value),
				c = parseFloat(self.contrastSlider.value),
				s = parseFloat(self.saturationSlider.value),
				t = (1 - c) / 2,
				lumR = 0.3086,
				lumG = 0.6094,
				lumB = 0.0820,
				sr = (1 - s) * lumR,
				sg = (1 - s) * lumG,
				sb = (1 - s) * lumB,
				csr = c * sr,
				csg = c * sg,
				csb = c * sb,
				tb = t + b;
				
			renderColorMatrix([
				c*(sr+s), csg, csb, 0,
				csr, c*(sg+s), csb, 0,
				csr, csg, c*(sb+s), 0,
				0, 0, 0, 1
			], [tb, tb, tb, 0]);
		}
		
		self.brightnessSlider.addEventListener('input', applyMatrixTransform);
		self.contrastSlider.addEventListener('input', applyMatrixTransform);
		self.saturationSlider.addEventListener('input', applyMatrixTransform);
		
		function renderColorMatrixPreset(e, matrix4x4, lastRow) {
			if (e.target.classList.contains("colorMatrixTile_disabled"))
				return;
			self.acivateColorMatrixTile(e.target);
			renderColorMatrix(matrix4x4, lastRow);
			self.resetControls(false);
		};
		
		//Grayscale
		self.colorMatrixTiles[0].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				0.33,0.59,0.11,0,
				0.33,0.59,0.11,0,
				0.33,0.59,0.11,0,
				0,0,0,1
			], [0,0,0,0]);
		});
		//Invert
		self.colorMatrixTiles[1].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				-1,0,0,0,
				0,-1,0,0,
				0,0,-1,0,
				0,0,0,1
			], [1,1,1,0]);
		}),
		//RGB -> BGR
		self.colorMatrixTiles[2].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [ 
				0,0,1,0,
				0,1,0,0,
				1,0,0,0,
				0,0,0,1
			], [0,0,0,0]);
		}),
		//Sepia
		self.colorMatrixTiles[3].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				0.393,0.769,0.189,0,
				0.349,0.686,0.168,0,
				0.272,0.534,0.131,0,
				0,0,0,1
			], [0,0,0,0]);
		}),
		//Black & White
		self.colorMatrixTiles[4].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				1.5,1.5,1.5,0,
				1.5,1.5,1.5,0,
				1.5,1.5,1.5,0,
				0,0,0,1
			], [-1,-1,-1,0]);
		}),
		//Polaroid Color
		self.colorMatrixTiles[5].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				1.438,-0.122,-0.016,0,
				-0.062,1.378,-0.016,0,
				-0.062,-0.122,1.483,0,
				0,0,0,1
			], [-0.03,0.05,-0.02,0]);
		}),
		//White to Alpha
		self.colorMatrixTiles[6].addEventListener('click', function(e) {
			renderColorMatrixPreset(e, [
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				-1,-1,-1,1
			], [0,0,0,0]);
		}),
		
		
		//save
		self.saveButton.addEventListener('click', function() {
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
		});
		
		var testTimeDiv = document.getElementById('testTime');
		var matrices, angles, gammas;				
		self.speedTestButton.addEventListener('click', function() {
			var testsCount = parseInt(self.testsCountInput.value, 10);
			
			if (self.speedTestCheckbox.checked || matrices === undefined || matrices.length !== testsCount)
				matrices = TestsManager.GenerateRandomColorMatrices(testsCount),
				angles = TestsManager.GenerateRandomRotationAngles(testsCount),
				gammas = TestsManager.GenerateRandomGammaValues(testsCount);
				
			var singleImageRenderingTimes = [];
			var startTime = window.performance.now();
			for (var i = 0; i < testsCount; i++) {
				self.options.rotationAngle = angles[i];
				self.options.gamma = gammas[i];
				var singleImageStartTime = window.performance.now();
				renderColorMatrix(matrices[i].matrix4x4, matrices[i].lastRow);
				var singleImageEndTime = window.performance.now();
				singleImageRenderingTimes[i] = singleImageEndTime - singleImageStartTime;
			}
			var endTime = window.performance.now();
			var timeElapsed = (endTime - startTime);
			var average = (singleImageRenderingTimes.reduce(function(a, b) {
				return a + b;
			})) / testsCount;
			//console.log(singleImageRenderingTimes);
			testTimeDiv.textContent = timeElapsed.toFixed(2) + " мс (" + average.toFixed(3) + " мс на 1 шаг)";
			
		});
		
		self.webglTechRadio.addEventListener('change', function() {
			self.onTechChange();
		});
		
		self.canvasTechRadio.addEventListener('change', function() {
			self.onTechChange();
		});
		
		self.svgTechRadio.addEventListener('change', function() {
			self.onTechChange();
		});
	}
	
	showCanvas() {
		if (this.webglTechRadio.checked) {
			this.webglCanvas.style.display = "block";
			this.planeCanvas.style.display = "none";
			this.svgArea.style.display = "none";
		} else if (this.canvasTechRadio.checked) {
			this.planeCanvas.style.display = "block";
			this.webglCanvas.style.display = "none";
			this.svgArea.style.display = "none";
		} else {
			this.svgArea.style.display = "block";
			this.webglCanvas.style.display = "none";
			this.planeCanvas.style.display = "none";
		}
	}
	onTechChange() {
		this.showCanvas();
		if (this.img !== undefined)
			this.drawInitialImage();
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
	
	resetControls(resetRotation) {
		if (resetRotation === undefined)
			resetRotation = true;
		if (resetRotation) {
			this.degreesInput.value = 0;
			this.rotateSlider.value = 0;
		}
		this.rComponentSlider.value = 100;
		this.rComponentInput.value = 100;
		this.gComponentSlider.value = 100;
		this.gComponentInput.value = 100;
		this.bComponentSlider.value = 100;
		this.bComponentInput.value = 100;
		this.aComponentSlider.value = 100;
		this.aComponentInput.value = 100;
		this.brightnessSlider.value = 0;
		this.brightnessInput.value = 0;
		this.contrastSlider.value = 1;
		this.contrastInput.value = 1;
		this.saturationSlider.value = 1;
		this.saturationInput.value = 1;
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
		this.brightnessSlider.disabled = false;
		this.brightnessInput.disabled = false;
		this.contrastSlider.disabled = false;
		this.contrastInput.disabled = false;
		this.saturationSlider.disabled = false;
		this.saturationInput.disabled = false;
		this.gammaSlider.disabled = false;
		this.gammaInput.disabled = false;
		this.colorMatrixTiles.forEach(function(tile) { tile.classList.remove('colorMatrixTile_disabled') });
		this.speedTestButton.disabled = false;
		this.testsCountInput.disabled = false;
		this.speedTestCheckbox.disabled = false;
	}
	
	getControlsRefs() {
		this.webglCanvas = document.getElementById("webgl_canvas");
		this.planeCanvas = document.getElementById("plane_canvas");
		this.svgArea = document.getElementById("svg_area");
		
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
		this.brightnessSlider = document.getElementById("brightness_slider"),
		this.brightnessInput = document.getElementById("brightness_input"),
		this.contrastSlider = document.getElementById("contrast_slider"),
		this.contrastInput = document.getElementById("contrast_input"),
		this.saturationSlider = document.getElementById("saturation_slider"),
		this.saturationInput = document.getElementById("saturation_input"),
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
		this.speedTestButton = document.getElementById("speedTest_button");
		this.testsCountInput = document.getElementById("testsCount_input");
		this.speedTestCheckbox = document.getElementById("speedTest_checkbox");
		
		this.webglTechRadio = document.getElementById("webglTech_radio");
		this.canvasTechRadio = document.getElementById("canvasTech_radio");
		this.svgTechRadio = document.getElementById("svgTech_radio");
	}

	drawInitialImage() {
		var self = this;
		var canvas;
		self.showCanvas();
		if (self.webglTechRadio.checked)
			self.processor = new WebglImageProcessor(self.img, self.webglCanvas);
		else if (self.canvasTechRadio.checked)
			self.processor = new CanvasImageProcessor(self.img, self.planeCanvas);
		else
			self.processor = new SvgImageProcessor(self.img, self.svgArea);
			
		self.processor.render();
		self.enableControls();
		self.resetControls();
		self.options = {};
	}
}