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
			}
		}
		
		self.initializeButtonHandlers();
		
		self.linkSliderAndInput(document.getElementById("rotate_slider"), document.getElementById("degrees_input"));
		self.linkSliderAndInput(document.getElementById("r_component_slider"), document.getElementById("r_component_input"));
		self.linkSliderAndInput(document.getElementById("g_component_slider"), document.getElementById("g_component_input"));
		self.linkSliderAndInput(document.getElementById("b_component_slider"), document.getElementById("b_component_input"));
		self.linkSliderAndInput(document.getElementById("a_component_slider"), document.getElementById("a_component_input"));
	}
	
	linkSliderAndInput(slider, input) {
		var event = new Event('input');
		input.addEventListener('input', function() {
			slider.value = parseInt(input.value, 10);
			slider.dispatchEvent(event);
		});
		
		slider.addEventListener('input', function() {
			input.value = slider.value;
		});
	}

	initializeButtonHandlers() {
		var self = this;
		var turnGrayscaleButton = document.getElementById("turn_grayscale_button"),
			restoreButton = document.getElementById("restore_button"),
			rotateSlider = document.getElementById("rotate_slider"),
			degreesInput = document.getElementById("degrees_input"),
			saveButton = document.getElementById("save_button"),
			rComponentSlider = document.getElementById("r_component_slider"),
			gComponentSlider = document.getElementById("g_component_slider"),
			bComponentSlider = document.getElementById("b_component_slider"),
			aComponentSlider = document.getElementById("a_component_slider");
			
		var options = {};
		
		//Turn grayscale
		turnGrayscaleButton.removeEvent
		turnGrayscaleButton.onclick = function() {
			options.turnGrayscale = true;
			self.processor.render(options);
		}
		
		//Rotate
		rotateSlider.addEventListener('input', function() {
			options.rotationAngle = rotateSlider.value;
			self.processor.render(options);
		});
		
		restoreButton.onclick = function() {
			options = {};
			self.processor.render(options);
			degreesInput.value = 0;
			rotateSlider.value = 0;
		}
		
		function applyColorComponents() {			
			options.colorComponents = {
				r: rComponentSlider.value,
				g: gComponentSlider.value,
				b: bComponentSlider.value,
				a: aComponentSlider.value
			}
			self.processor.render(options);
		}
		
		rComponentSlider.addEventListener('input', applyColorComponents);
		gComponentSlider.addEventListener('input', applyColorComponents);
		bComponentSlider.addEventListener('input', applyColorComponents);
		aComponentSlider.addEventListener('input', applyColorComponents);
		
		
		//save
		saveButton.onclick = function() {
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
		
		turnGrayscaleButton.disabled = false;
		restoreButton.disabled = false;
		saveButton.disabled = false;
	}
}