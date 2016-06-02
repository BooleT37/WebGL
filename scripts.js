function onLoad() {	
	document.getElementById("file_input").onchange = function(e) {

		var URL = window.URL;
		var url = URL.createObjectURL(e.target.files[0]);
		var img = new Image();
		img.src = url;
	
		img.onload = function() {
	
				img_width = img.width;
				img_height = img.height;
	
				render(img, img_width, img_height);
		}
	}
}

function render(image, img_width, img_height) {
	console.log(img_width, img_height)
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	
	if (img_width === undefined && img_height === undefined) {
		var size = Math.min(window.innerWidth, window.innerHeight); 
		canvas.width = canvas.height = size;
		gl.viewport(0, 0, size, size);
	} else {
		//if (img_height === undefined)
		//	img_height = img_width;
		//canvas.width = img_width
		//canvas.height = img_height;
		//gl.viewport(0, 0, img_width, img_height);
	}
	
	// Инициализация шейдеров
	var fragmentShader = getShader(gl, "fragment_shader");
    var vertexShader = getShader(gl, "vertex_shader");
	
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	//console.log(gl.getProgramParameter(program, gl.LINK_STATUS))
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
	}
	
	// Укажем какую шейдерную программу мы намерены далее использовать
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
	
	// Set the parameters so we can render any size image.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	var dstX = 10;
	var dstY = 10;
	var dstWidth = 64;
	var dstHeight = 64; //отсюда продолжить
	
	// convert dst pixel coords to clipspace coords      
	var clipX = dstX / gl.canvas.width  *  2 - 1;
	var clipY = dstY / gl.canvas.height * -2 + 1;
	var clipWidth = dstWidth  / gl.canvas.width  *  2;
	var clipHeight = dstHeight / gl.canvas.height * -2;
	
	// build a matrix that will stretch our
	// unit quad to our desired size and location
	gl.uniformMatrix3fv(u_matrixLoc, false, [
		clipWidth, 0, 0,
		0, clipHeight, 0,
		clipX, clipY, 1,
		]);
	
	// Draw the rectangle.
	gl.drawArrays(gl.TRIANGLES, 0, 6);
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