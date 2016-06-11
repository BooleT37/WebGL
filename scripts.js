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

	initializeButtonHandlers() {
		var self = this;
			
		var options = {};
		
		//Turn grayscale
		self.turnGrayscaleButton.removeEvent
		self.turnGrayscaleButton.onclick = function() {
			options.turnGrayscale = true;
			self.processor.render(options);
		}
		
		//Rotate
		self.rotateSlider.addEventListener('input', function() {
			options.rotationAngle = self.rotateSlider.value;
			self.processor.render(options);
		});
		
		self.restoreButton.onclick = function() {
			options = {};
			self.processor.render(options);
			self.degreesInput.value = 0;
			self.rotateSlider.value = 0;
			self.rComponentSlider.value = 100;
			self.rComponentInput.value = 100;
			self.gComponentSlider.value = 100;
			self.gComponentInput.value = 100;
			self.bComponentSlider.value = 100;
			self.bComponentInput.value = 100;
			self.aComponentSlider.value = 100;
			self.aComponentInput.value = 100;
		}
		
		function applyColorComponents() {			
			options.colorComponents = {
				r: self.rComponentSlider.value,
				g: self.gComponentSlider.value,
				b: self.bComponentSlider.value,
				a: self.aComponentSlider.value
			}
			self.processor.render(options);
		}
		
		self.rComponentSlider.addEventListener('input', applyColorComponents);
		self.gComponentSlider.addEventListener('input', applyColorComponents);
		self.bComponentSlider.addEventListener('input', applyColorComponents);
		self.aComponentSlider.addEventListener('input', applyColorComponents);
		
		self.gammaSlider.addEventListener('input', function() {
			options.gamma = self.gammaSlider.value;
			self.processor.render(options);
		});
		
		//save
		self.saveButton.onclick = function() {
			var tempCanvas = document.createElement('canvas');
			tempCanvas.style.display = "none";
			document.body.appendChild(tempCanvas);
			
			tempProcessor = new WebglImageProcessor(self.img, tempCanvas);
			tempCanvas.width = self.img.width;
			tempCanvas.height = self.img.height;
			tempProcessor.gl.viewport(0, 0, self.img.width, self.img.height);
			
			options.fitCanvas = true;
			tempProcessor.render(options);
			var image = tempCanvas.toDataURL(self.imgFile.type); //TODO big files transform incorrectly, needs fixing
			document.body.removeChild(tempCanvas);
			options.fitCanvas = false;
			
			var download = document.createElement('a');
			download.href = image;
			download.download = self.imgFile.name;
			download.click();
		}
		
	}
	
	enableControls() {
		this.turnGrayscaleButton.disabled = false;
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
	}
	
	getControlsRefs() {
		this.turnGrayscaleButton = document.getElementById("turn_grayscale_button"),
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
	}
}