class WebglImageProcessor {
	constructor(img, fileName) {
		this.img = img;
		this.canvas = document.getElementById("canvas");
		this.gl = canvas.getContext('webgl', {preserveDrawingBuffer: true}) || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
		
		//constants
		this.VERTEX_SHADER_NAME = "vertex_shader";
		this.FRAGMENT_SHADER_NAME = "fragment_shader"
	}
	
	//render image in canvas and apply given transformations to it successively
	render(methods, options) {
		if (options === undefined)
			options = {}
		var canvas = options.canvas || this.canvas,
			gl = options.gl || this.gl;
			gl.clearColor(1.0, 1.0, 1.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var	image = this.img;
		var imgWidth = image.width,
			imgHeight = image.height;
		
		// Инициализация шейдеров
		var fragmentShader = this.getShader(gl, this.FRAGMENT_SHADER_NAME);
		var vertexShader = this.getShader(gl, this.VERTEX_SHADER_NAME);		
		
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
		var u_matrixLoc = gl.getUniformLocation(program, "u_matrix");
		var u_methodsLoc = gl.getUniformLocation(program, "u_methods");
		
		gl.uniform1fv(u_methodsLoc, methods);
		
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
		
		var translationMatrix = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
		var rotationMatrix = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
		var scaleMatrix = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
		//fit canvas
		if (methods[1]) {
			translationMatrix = [
				1, 0, 0,
				0, 1, 0,
				-1, 1, 1
			];
			scaleMatrix = [
				2, 0, 0,
				0, -2, 0,
				0, 0, 1
			];
		} else {
			// convert dst pixel coords to clipspace coords
			var kw = imgWidth / gl.canvas.width,
				kh = imgHeight / gl.canvas.height;
			
			//It took me 3 hours and 9 notebook pages to count these values for M. Holy shit
			//If we can fit image in canvas without scaling it:
			if (kw < 1 && kh < 1) {
				translationMatrix = [
					1, 0, 0,
					0, 1, 0,
					-kw, kh, 1
				];
				scaleMatrix = [
					kw * 2, 0, 0,
					0, -kh * 2, 0,
					0, 0, 1
				];
			} else {
				//scale and fit width:
				if (kw >= kh) {
					var k = kh / kw;
					translationMatrix = [
						1, 0, 0,
						0, 1, 0,
						-1, k, 1
					];
					scaleMatrix = [
						2, 0, 0,
						0, -k * 2, 0,
						0, 0, 1
					];
				//scale and fit height
				} else {
					var k = kw / kh;
					translationMatrix = [
						1, 0, 0,
						0, 1, 0,
						-k, 1, 1
					];
					scaleMatrix = [
						k * 2, 0, 0,
						0, -2, 0,
						0, 0, 1
					];
				}
			}
		}
		
		if (methods[2]) {
			var angle = options.rotationAngle * Math.PI / 180,
				s = Math.sin(angle),
				c = Math.cos(angle);
			rotationMatrix = [
				c, -s, 0,
				s, c, 0,
				0, 0, 1
			]
		}
		
		var M = this.dotProduct(scaleMatrix, translationMatrix);
		M = this.dotProduct(M, rotationMatrix);
		
		// build a matrix that will stretch our
		// unit quad to our desired size and location
		gl.uniformMatrix3fv(u_matrixLoc, false, M);
		
		// Draw the rectangle.
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	//get shader from HTML script tag with given id
	getShader(gl, id) {
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
			console.error(gl.getShaderInfoLog(shader));
			return null;
		}
	
		return shader;
	}
	
	dotProduct(M1, M2) {
		var sum, res = [];
		for (var i = 0; i < 3; i++)
			for (var j = 0; j < 3; j++) {
				sum = 0;
				for (var k = 0; k < 3; k++)
					sum += M1[i * 3 + k] * M2[k * 3 + j]
				res[i * 3 + j] = sum;
			}
		return res;
	}
}