function onLoad() {
	
	var img;
	var gl;
	document.getElementById("file_input").onchange = function(e) {

		var URL = window.URL;
		var url = URL.createObjectURL(e.target.files[0]);
		img = new Image();
		img.src = url;
		
		img.onload = function() {
			gl = render(img, img.width, img.height, "fragment_shader_base");
		}
	}
	
	document.getElementById("turn_grayscale_button").onclick = function() {
		if (!img)
			return;
		gl = render(img, img.width, img.height, "fragment_shader_grayscale");

	}
	document.getElementById("cancel_button").onclick = function() {
		if (!img)
			return;
		gl = render(img, img.width, img.height, "fragment_shader_base");
	}
}

function render(image, imgWidth, imgHeight, fragmentShaderName) {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	
	if (imgWidth === undefined && imgHeight === undefined) {
		var size = Math.min(window.innerWidth, window.innerHeight); 
		canvas.width = canvas.height = size;
		gl.viewport(0, 0, size, size);
	} else {
		//if (imgHeight === undefined)
		//	imgHeight = imgWidth;
		//canvas.width = imgWidth
		//canvas.height = imgHeight;
		//gl.viewport(0, 0, imgWidth, imgHeight);
	}
	
	// Инициализация шейдеров
	var fragmentShader = getShader(gl, fragmentShaderName);
    var vertexShader = getShader(gl, "vertex_shader");
	
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	//console.log(gl.getProgramParameter(program, gl.LINK_STATUS))
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
	}
	
	gl.useProgram(program);
	
	var positionLocation = gl.getAttribLocation(program, "a_position"); 
  
	// look up uniform locations
	var u_imageLoc = gl.getUniformLocation(program, "u_image");
	var u_matrixLoc = gl.getUniformLocation(program, "u_matrix");
	
	// provide texture coordinates for the rectangle.
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		0.0,  0.0,
		1.0,  0.0,
		0.0,  1.0,
		0.0,  1.0,
		1.0,  0.0,
		1.0,  1.0]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	// Set the parameters so we can render any size image
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
	// Upload the image into the texture
	try {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	} catch(e) {
		console.log(e);
	}
	
	// convert dst pixel coords to clipspace coords
	var kw = imgWidth / gl.canvas.width,
		kh = imgHeight / gl.canvas.height;
	var M;
	
	//It took me 3 hours and 9 notebook pages to count these values for M. Holy shit
	//If we can fit image in canvas without scaling it:
	if (kw < 1 && kh < 1) {
		M = [
			kw * 2, 0, 0,
			0, -kh * 2, 0,
			-kw, kh, 1
		];
	} else {
		//scale and fit width:
		if (kw >= kh) {
			var k = kh / kw;
			M = [
				2, 0, 0,
				0, -k * 2, 0,
				-1, k, 1
			];
		//scale and fit height
		} else {
			var k = kw / kh;
			M = [
				k * 2, 0, 0,
				0, -2, 0,
				-k, 1, 1
			]
		}
	}
	
	
	// build a matrix that will stretch our
	// unit quad to our desired size and location
	gl.uniformMatrix3fv(u_matrixLoc, false, M);
	
	// Draw the rectangle.
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	return gl;
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }