function onLoad() {
	var img;
	var webglImageProcessor;
	var file;
	
	document.getElementById("file_input").onchange = function(e) {
		var file = e.target.files[0];
		var url = window.URL.createObjectURL(file);
		img = new Image();
		img.src = url;
		
		img.onload = function() {
			processor = new WebglImageProcessor(img, document.getElementById("canvas"));
			processor.render();
			initializeButtonHandlers(img, processor, file);
		}
	}
	
	function linkSliderAndInput(slider, input) {
		var event = new Event('input');
		input.addEventListener('input', function() {
			slider.value = parseInt(input.value, 10);
			slider.dispatchEvent(event);
		});
		
		slider.addEventListener('input', function() {
			input.value = slider.value;
		});
	}
	
	linkSliderAndInput(document.getElementById("rotate_slider"), document.getElementById("degrees_input"));
	linkSliderAndInput(document.getElementById("r_component_slider"), document.getElementById("r_component_input"));
	linkSliderAndInput(document.getElementById("g_component_slider"), document.getElementById("g_component_input"));
	linkSliderAndInput(document.getElementById("b_component_slider"), document.getElementById("b_component_input"));
	linkSliderAndInput(document.getElementById("a_component_slider"), document.getElementById("a_component_input"));
}

function initializeButtonHandlers(img, processor, imgFile) {
	var turnGrayscaleButton = document.getElementById("turn_grayscale_button"),
		restoreButton = document.getElementById("restore_button"),
		rotateSlider = document.getElementById("rotate_slider"),
		degreesInput = document.getElementById("degrees_input");
		saveButton = document.getElementById("save_button"),
		rComponentSlider = document.getElementById("r_component_slider"),
		gComponentSlider = document.getElementById("g_component_slider"),
		bComponentSlider = document.getElementById("b_component_slider"),
		aComponentSlider = document.getElementById("a_component_slider");
		
	var options = {};
	
	//Turn grayscale
	turnGrayscaleButton.onclick = function() {
		options.turnGrayscale = true;
		processor.render(options);
	}
	
	//Rotate
	rotateSlider.addEventListener('input', function() {
		options.rotationAngle = rotateSlider.value;
		processor.render(options);
	});
	
	restoreButton.onclick = function() {
		options = {};
		processor.render(options);
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
		processor.render(options);
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
		
		tempProcessor = new WebglImageProcessor(img, tempCanvas);
		tempCanvas.width = img.width;
		tempCanvas.height = img.height;
		tempProcessor.gl.viewport(0, 0, img.width, img.height);
		
		options.fitCanvas = true;
		tempProcessor.render(options);
		var image = tempCanvas.toDataURL(imgFile.type); //TODO big files transform incorrectly, needs fixing
		document.body.removeChild(tempCanvas);
		
		var download = document.createElement('a');
		download.href = image;
		download.download = imgFile.name;
		download.click();
	}
	
	turnGrayscaleButton.disabled = false;
	restoreButton.disabled = false;
	saveButton.disabled = false;
}