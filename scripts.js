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
			processor = new WebglImageProcessor(img);
			processor.render([false, false]);
			initializeButtonHandlers(img, processor, file);
		}
	}	
}

function initializeButtonHandlers(img, processor, imgFile) {
	var turnGrayscaleButton = document.getElementById("turn_grayscale_button"),
		rotateButton = document.getElementById("rotate_button"),
		cancelButton = document.getElementById("cancel_button"),
		saveButton = document.getElementById("save_button");
		
	var methods = [false, false];
	var methodsStack = []
	
	//Method 0:
	turnGrayscaleButton.onclick = function() {
		methods[0] = true;
		methodsStack.push(0);
		processor.render(methods);
	}
	//Method 2:
	rotateButton.onclick = function() {
		methods[2] = true;
		methodsStack.push(2);
		rotationAngle = parseInt(document.getElementById('degrees_input').value, 10);
		processor.render(methods, {rotationAngle: rotationAngle});
	}
	cancelButton.onclick = function() {
		if (methodsStack.length > 0) {
			methods[methodsStack.pop()] = false;
			processor.render(methods);
		}
	}
	//Method 1:
	saveButton.onclick = function() {
		var canvas = document.createElement('canvas'),
			gl = canvas.getContext('webgl', {preserveDrawingBuffer: true}) || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
		canvas.style.display = "none";
		document.body.appendChild(canvas);
		
		canvas.width = img.width;
		canvas.height = img.height;
		gl.viewport(0, 0, img.width, img.height);
		
		methods[1] = true;
		processor.render(methods, canvas, gl);
		var image = canvas.toDataURL(imgFile.type); //TODO big files transform incorrectly, needs fixing
		document.body.removeChild(canvas);
		methods[1] = false;
		
		var download = document.createElement('a');
		download.href = image;
		download.download = imgFile.name;
		download.click();
	}
	
	turnGrayscaleButton.disabled = false;
	rotateButton.disabled = false;
	cancelButton.disabled = false;
	saveButton.disabled = false;
}