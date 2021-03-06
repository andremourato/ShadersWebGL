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
	if (shaderScript.type.split("/")[1] == 'x-fragment') {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type.split("/")[1] == 'x-vertex') {
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

//----------------------------------------------------------------------------

// Initializing the shader program

function initShaders( gl,shaderName ) {
	var fragmentShader = getShader(gl, shaderName+"-fs");
	var vertexShader = getShader(gl, shaderName+"-vs");

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	return shaderProgram;
}

