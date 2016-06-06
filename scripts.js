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
			processor.render(img, processor.FRAGMENT_SHADER_NAMES.BASE);
			initializeButtonHandlers(img, processor, file.name);
		}
	}	
}

function initializeButtonHandlers(img, processor, imgFileName) {
	var turnGrayscaleButton = document.getElementById("turn_grayscale_button"),
		cancelButton = document.getElementById("cancel_button"),
		saveButton = document.getElementById("save_button");
	
	turnGrayscaleButton.onclick = function() {
		processor.render(img, processor.FRAGMENT_SHADER_NAMES.GRAYSCALE);
	}
	cancelButton.onclick = function() {
		processor.render(img, processor.FRAGMENT_SHADER_NAMES.BASE);
	}
	saveButton.onclick = function() {
		var canvas = document.getElementById("canvas");
		var image = canvas.toDataURL();
		var download = document.createElement('a');
		download.href = image;
		download.download = imgFileName; //todo change extention
		download.click();
	}
	
	turnGrayscaleButton.disabled = false;
	cancelButton.disabled = false;
	saveButton.disabled = false;
}