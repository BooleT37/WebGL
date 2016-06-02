function onLoad() {
	var c = document.getElementById("canvas");
	var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	
	var size = Math.min(window.innerWidth, window.innerHeight); 
	canvas.width = canvas.height = size;
	gl.viewport(0, 0, size, size);
	
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
	
	var vertexBuffer = gl.createBuffer();
	var vertices = [0, 0, 0, 0.5, 1, 0, 1, 0, 0];
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	var colorBuffer = gl.createBuffer();
	var colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	// Получим местоположение переменных в программе шейдеров
	var uPosition = gl.getUniformLocation(program, 'u_position');
	var aPosition = gl.getAttribLocation(program, 'a_position');
	var aColor = gl.getAttribLocation(program, 'a_color');
	
	// Укажем какую шейдерную программу мы намерены далее использовать
	gl.useProgram(program);
	
	// Передаем в uniform-переменную положение треугольника
	gl.uniform3fv(uPosition, [0, 0, 0]);
	
	// Связываем данные цветов
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.enableVertexAttribArray(aColor);
	// Вторым аргументом передаём размерность, RGB имеет 3 компоненты
	gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
	
	// И вершин
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
	
	// Очищаем сцену, закрашивая её в белый цвет
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Рисуем треугольник
	// Третьим аргументом передаём количество вершин геометрии
	gl.drawArrays(gl.TRIANGLES, 0, 3);
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