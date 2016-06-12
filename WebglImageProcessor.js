class WebglImageProcessor {
	constructor(img, canvas) {
		this.img = img;
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {preserveDrawingBuffer: true}) || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
		var gl = this.gl;
		
		//constants
		this.VERTEX_SHADER_NAME = "vertex_shader";
		this.FRAGMENT_SHADER_NAME = "fragment_shader";
		
		var fragmentShader = this.getShader(gl, this.FRAGMENT_SHADER_NAME);
		var vertexShader = this.getShader(gl, this.VERTEX_SHADER_NAME);
		this.program = gl.createProgram();
		var program = this.program;
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
		}
		
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		
		var positionLocation = gl.getAttribLocation(program, "a_position"); 
		
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
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		} catch(e) {
			console.error(e);
		}
		
		gl.useProgram(program);
		
		this.u_locations = {
			matrix: gl.getUniformLocation(program, "u_matrix"),
			gamma: gl.getUniformLocation(program, "u_gamma"),
			colorMatrix4x4: gl.getUniformLocation(program, "u_colorMatrix4x4"),
			colorMatrixLastRow: gl.getUniformLocation(program, "u_colorMatrixLastRow")
		}
	}
	
	//render image in canvas and apply given transformations to it
	render(options) {
		if (options === undefined)
			options = {};
		var canvas = this.canvas,
			gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var imgWidth = this.img.width,
			imgHeight = this.img.height;
		
		var scaleTranslationsMatrix;
		//fit canvas
		if (options.fitCanvas) {
			scaleTranslationsMatrix = MatrixHelpers.getFitCanvasMatrix();
		} else {
			// convert dst pixel coords to clipspace coords
			scaleTranslationsMatrix = MatrixHelpers.getMatrixToFitImageInsideCanvas(imgWidth, imgHeight, gl.canvas.width, gl.canvas.height)
		}
		
		var M;
		//rotate
		if (options.rotationAngle) {
			var rotationMatrix = MatrixHelpers.getRotationMatrix(options.rotationAngle);
			M = MatrixHelpers.dotProduct(scaleTranslationsMatrix, rotationMatrix);
		} else {
			M = scaleTranslationsMatrix;
		}
		
		var gamma = options.gamma === undefined ? 1 : options.gamma;
		
		gl.uniform1f(this.u_locations.gamma, gamma);
		
		if (options.colorMatrix === undefined)
			options.colorMatrix = {
				matrix4x4: [
					1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					0,0,0,1
				],
				lastRow: [0,0,0,0]
			};
		
			
		gl.uniformMatrix4fv(this.u_locations.colorMatrix4x4, false, options.colorMatrix.matrix4x4);
		gl.uniform4fv(this.u_locations.colorMatrixLastRow, options.colorMatrix.lastRow);
		
		gl.uniformMatrix3fv(this.u_locations.matrix, false, M);
		
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
	
	
}