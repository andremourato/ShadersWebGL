//////////////////////////////////////////////////////////////////////////////
//
//  initShaders.js 
//
//	Getting, compiling and linking the vertex and the fragment shaders
//
//  J. Madeira - October 2015
//
//////////////////////////////////////////////////////////////////////////////


// Getting and compiling a shader

var vertexShaderText = [
	'attribute vec3 aVertexPosition;',
	'attribute vec3 aVertexColor;',
	'uniform mat4 uMVMatrix;',
	'uniform mat4 uPMatrix;',
	'varying vec4 vertexColor;',
	'void main(void) {',
		'gl_PointSize = 5.0;',
		'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
		'vertexColor = vec4(aVertexColor, 1.0);',
	'}'
].join('\n')

var fragmentShaderText = [
	'precision mediump float;',
	'varying vec4 vertexColor;',
	'void main(void) {',
		'gl_FragColor = vertexColor;',
	'}'
].join('\n')


export function getShader(gl, id) {

	var shader;
	var str;
	if (id == "fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
		str = fragmentShaderText;
	} else if (id == "vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
		str = vertexShaderText;
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

//----------------------------------------------------------------------------

// Initializing the shader program

export function initShaders( gl ) {
	var fragmentShader = getShader(gl, "fragment");
	var vertexShader = getShader(gl, "vertex");

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	// Coordinates 
	
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// Colors 
	
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
	return shaderProgram;
}
