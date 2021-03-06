
//----------------------------------------------------------------------------
//
// Global Variables
//

//SETTINGS
var gl = null; // WebGL context
var shaderProgram = null;
var noShadowProgram = null;
var shadowProgram = null;
var shadowMapProgram = null;
var fogProgram = null;
var lightSource = null
var currentShader = 'Shadows';
var textureSize = getParameterByName('texSize') || 512;

//CAMERA parameters
var camera = new Camera(
	vec3.fromValues(-0.79, 4.95, 1.85),
	vec3.fromValues(-0.3, -1, 1.85),
	vec3.fromValues(0, 0, 1)
);
var cameraSpeed = 0.2
var cameraSpeedAngle = 5
var fieldOfView = 90

//Shadows
var projMatrix = mat4.create();
var viewMatrix = mat4.create();

// MODELS
var model_list = []
var object_list = []
var textures_available = []

//SHADOW MAP
var shadowMapCube = null;
var shadowMapCameras = null;
var shadowMapViewMatrices = null;
var shadowMapProj = null;
var shadowMapFramebuffer = null;
var shadowMapRenderbuffer = null;
var shadowClipNearFar = null;
var floatExtension = null;
var floatLinearExtension = null;
var lightDisplacementInputAngle = 0;

//FOG
var currentFog=0;

//----------------------------------------------------------------------------
// The WebGL code
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//  Drawing the 3D scene
//----------------------------------------------------------------------------
function drawSceneShadows() {
	var currentSceneLightPosition = getCurrentLightPosition()
	shadowMapCameras = [
		// +X 
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(1, 0, 0)),
			vec3.fromValues(0, -1, 0)
		),
		// -X
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(-1, 0, 0)),
			vec3.fromValues(0, -1, 0)
		),
		// +Y
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 1, 0)),
			vec3.fromValues(0, 0, 1)
		),
		// -Y
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, -1, 0)),
			vec3.fromValues(0, 0, -1)
		),
		// +Z
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 0, 1)),
			vec3.fromValues(0, -1, 0)
		),
		// -Z
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 0, -1)),
			vec3.fromValues(0, -1, 0)
		),
	];
	// Clearing with the background color
	// Clear back buffer, set per-frame uniforms
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	// Use shaders
	gl.useProgram(shadowProgram);

	for (var i = 0; i < shadowMapCameras.length; i++) {
		mat4.getTranslation(shadowMapCameras[i].position, getCurrentLightSource().world);
		shadowMapCameras[i].GetViewMatrix(shadowMapViewMatrices[i]);
	}
	
	gl.uniformMatrix4fv(shadowProgram.uniforms.mProj, gl.FALSE, projMatrix);
	gl.uniform3fv(shadowProgram.uniforms.pointLightPosition, getCurrentLightPosition());
	gl.uniform2fv(shadowProgram.uniforms.shadowClipNearFar, shadowClipNearFar);

	if (floatExtension && floatLinearExtension) {
		gl.uniform1f(shadowProgram.uniforms.bias, 0.0001);
	} else {
		gl.uniform1f(shadowProgram.uniforms.bias, 0.003);
	}
	gl.uniform1i(shadowProgram.uniforms.lightShadowMap, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);

	for (var i = 0; i < object_list.length; i++) {
		var obj = object_list[i]
		// console.log(obj)
		obj.updatePosition()
		// Computing the Model-View Matrix
		gl.uniformMatrix4fv(
			shadowProgram.uniforms.mWorld,
			gl.FALSE,
			obj.world
		);
		var colors = [0.8,0.8,0.8]
		if(obj.R || obj.R == 0 || obj.G == 0 || obj.B == 0){
			colors = [obj.R/255,obj.G/255,obj.B/255]
		}
		gl.uniform4fv(
			shadowProgram.uniforms.meshColor,
			vec4.fromValues(colors[0], colors[1], colors[2], 1.0)
		);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.vbo);
		gl.vertexAttribPointer(
			shadowProgram.attribs.vPos,
			3, gl.FLOAT, gl.FALSE,
			0, 0
		);
		gl.enableVertexAttribArray(shadowProgram.attribs.vPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.nbo);
		gl.vertexAttribPointer(
			shadowProgram.attribs.vNorm,
			3, gl.FLOAT, gl.FALSE,
			0, 0
		);
		gl.enableVertexAttribArray(shadowProgram.attribs.vNorm);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);
		gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
	}
}

function refreshTexture(obj) {
	gl.bindTexture(gl.TEXTURE_2D, obj.texture.texture);
	gl.activeTexture(gl.TEXTURE0);
}

//----------------------------------------------------------------------------
// Timer
//----------------------------------------------------------------------------
function tick() {
	requestAnimFrame(tick);
	generateCamera();
	if(currentShader == 'Shadows'){
		generateShadowMap();
		drawSceneShadows();
	}else if(currentShader == 'Normal'){
		
	}else if(currentShader == 'Fog'){

	}else if(currentShader == 'Texture'){
		drawSceneTextures()
	}
	animate();
}
//----------------------------------------------------------------------------

function getCurrentLightPosition(){
	return vec3.fromValues(lightSource.tx, lightSource.ty, lightSource.tz-0.5)
}

function getCurrentLightSource(){
	return lightSource
}

function generateCamera(){
	camera.GetViewMatrix(viewMatrix)
	if(currentShader == 'Shadows'){
		gl.useProgram(shadowProgram)
		gl.uniformMatrix4fv(shadowProgram.uniforms.mView, gl.FALSE, viewMatrix);
	}else if(currentShader == 'Texture'){
		gl.useProgram(noShadowProgram)
		gl.uniformMatrix4fv(noShadowProgram.uniforms.mView, gl.FALSE, viewMatrix);
	}
}


function generateSceneTextures(obj){
	gl.useProgram(noShadowProgram)
	// Coordinates
	// console.log(obj)
	var objPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

	//Texture
	var objTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texCoords), gl.STATIC_DRAW);

	//Indices
	var objIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

	// Associating to the vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER,objPosVertexBufferObject)
	gl.vertexAttribPointer(
		noShadowProgram.positionAttribLocation, 
		3, 
		gl.FLOAT,
		gl.FALSE,
		3*Float32Array.BYTES_PER_ELEMENT,
		0);
	gl.enableVertexAttribArray(noShadowProgram.positionAttribLocation);

	// Associating to the vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER,objTexCoordVertexBufferObject)
	gl.vertexAttribPointer(
		noShadowProgram.texCoordAttribLocation, 
		2, 
		gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0);
	gl.enableVertexAttribArray(noShadowProgram.texCoordAttribLocation);
	gl.clearColor(0, 0, 0, 1);

}

function drawSceneTextures(){
	// Clearing with the background color
	var fogColor = [1,1,1,1];
	var fogAmount = currentFog;

	// gl.clearColor(...fogColor)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(noShadowProgram)
	gl.uniformMatrix4fv(noShadowProgram.uniforms.mProj, gl.FALSE, projMatrix);
	// gl.uniformMatrix4fv(shaderProgram.uniforms.mvUniform, false, viewMatrix);

	for(var i = 0; i < object_list.length; i++){
		var obj = object_list[i]
		obj.updatePosition()
		gl.uniformMatrix4fv(
			noShadowProgram.uniforms.mWorld,
			gl.FALSE,
			obj.world
		);
		refreshTexture(obj) 

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		generateSceneTextures(obj)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);

		// set the fog color and amount
		gl.uniform4fv(noShadowProgram.uniforms.fogColorLocation, fogColor);
		gl.uniform1f(noShadowProgram.uniforms.fogAmountLocation, fogAmount);

		gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
}


function generateShadowMap(){
	var currentSceneLightPosition = getCurrentLightPosition()
	shadowMapCameras = [
		// +X 
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(1, 0, 0)),
			vec3.fromValues(0, -1, 0)
		),
		// -X
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(-1, 0, 0)),
			vec3.fromValues(0, -1, 0)
		),
		// +Y
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 1, 0)),
			vec3.fromValues(0, 0, 1)
		),
		// -Y
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, -1, 0)),
			vec3.fromValues(0, 0, -1)
		),
		// +Z
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 0, 1)),
			vec3.fromValues(0, -1, 0)
		),
		// -Z
		new Camera(
			currentSceneLightPosition,
			vec3.add(vec3.create(), currentSceneLightPosition, vec3.fromValues(0, 0, -1)),
			vec3.fromValues(0, -1, 0)
		),
	];
	shadowMapViewMatrices = [
		mat4.create(),
		mat4.create(),
		mat4.create(),
		mat4.create(),
		mat4.create(),
		mat4.create()
	];
	shadowMapProj = mat4.create();
	shadowClipNearFar = vec2.fromValues(0.05, 15.0);
	mat4.perspective(
		shadowMapProj,
		glMatrix.toRadian(fieldOfView),
		1.0,
		shadowClipNearFar[0],
		shadowClipNearFar[1]
	);

	gl.useProgram(shadowMapProgram);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);
	gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderbuffer);

	gl.viewport(0, 0, textureSize, textureSize);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	// Set per-frame uniforms
	gl.uniform2fv(
		shadowMapProgram.uniforms.shadowClipNearFar,
		shadowClipNearFar
	);

	gl.uniform3fv(
		shadowMapProgram.uniforms.pointLightPosition,
		getCurrentLightPosition()
	);
	gl.uniformMatrix4fv(
		shadowMapProgram.uniforms.mProj,
		gl.FALSE,
		shadowMapProj
	);

	for (var i = 0; i < shadowMapCameras.length; i++) {
		// Set per light uniforms
		gl.uniformMatrix4fv(
			shadowMapProgram.uniforms.mView,
			gl.FALSE,
			shadowMapCameras[i].GetViewMatrix(shadowMapViewMatrices[i])
		);

		// Set framebuffer destination
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
			shadowMapCube,
			0
		);
		gl.framebufferRenderbuffer(
			gl.FRAMEBUFFER,
			gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER,
			shadowMapRenderbuffer
		);

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		for (var j = 0; j < object_list.length; j++) {
			// Per object uniforms
			var obj = object_list[j]
			gl.uniformMatrix4fv(
				shadowMapProgram.uniforms.mWorld,
				gl.FALSE,
				obj.world
			);

			// Set attributes
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.vbo);
			gl.vertexAttribPointer(
				shadowMapProgram.attribs.vPos,
				3, gl.FLOAT, gl.FALSE,
				0, 0
			);
			gl.enableVertexAttribArray(shadowMapProgram.attribs.vPos);

			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);
			gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		}
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}



//----------------------------------------------------------------------------
//
//  Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		//animate here
		dt =  40
		lightDisplacementInputAngle += dt / 2337;
		var xDisplacement = Math.sin(this.lightDisplacementInputAngle) * 2.8;
		object_list[0].tx = xDisplacement;
	}
	lastTime = timeNow;
}

function setEventListeners() {
	document.getElementById('shaders').addEventListener('change', (event) => {
		var e = document.getElementById("shaders");
		currentShader = e.options[e.selectedIndex].value.split(' ')[0];
		var texHTML = document.getElementById('texture_only')
		if(currentShader == 'Shadows'){
			texHTML.style.visibility = 'hidden'
		}else{
			texHTML.style.visibility = 'visible'
		}
	})

	document.getElementById('textures-cube').addEventListener('change', (event) => {
		var e = document.getElementById("textures-cube");
		selectedTextureName = e.options[e.selectedIndex].value;
		var selectedTexture = textures_available.filter(x => x.name == selectedTextureName)[0]
		if(selectedTexture){
			object_list[1].texture = selectedTexture
		}
	})

	document.getElementById('textures-table').addEventListener('change', (event) => {
		var e = document.getElementById("textures-table");
		selectedTextureName = e.options[e.selectedIndex].value;
		var selectedTexture = textures_available.filter(x => x.name == selectedTextureName)[0]
		if(selectedTexture){
			object_list[2].texture = selectedTexture
		}
	})

	document.getElementById('textures-sofa').addEventListener('change', (event) => {
		var e = document.getElementById("textures-sofa");
		selectedTextureName = e.options[e.selectedIndex].value;
		var selectedTexture = textures_available.filter(x => x.name == selectedTextureName)[0]
		if(selectedTexture){
			object_list[3].texture = selectedTexture
		}
	})

	document.getElementById('textures-monkey').addEventListener('change', (event) => {
		var e = document.getElementById("textures-monkey");
		selectedTextureName = e.options[e.selectedIndex].value;
		var selectedTexture = textures_available.filter(x => x.name == selectedTextureName)[0]
		if(selectedTexture){
			object_list[4].texture = selectedTexture
		}
	})

	document.getElementById('textures-wall').addEventListener('change', (event) => {
		var e = document.getElementById("textures-wall");
		selectedTextureName = e.options[e.selectedIndex].value;
		var selectedTexture = textures_available.filter(x => x.name == selectedTextureName)[0]
		if(selectedTexture){
			object_list[5].texture = selectedTexture
		}
	})

	window.addEventListener('resize', function () { resize() }, false);

	window.addEventListener("keypress", (event) => {
		var key = event.keyCode
		// if (key == 82 || key == 114)
		// 	rotate = !rotate
	});

	//Control the source light
	kd.UP.down(function () {
		getCurrentLightSource().ty -= 0.3
	});

	//Control the source light
	kd.DOWN.down(function () {
		getCurrentLightSource().ty += 0.3
	});

	//Control the source light
	kd.RIGHT.down(function () {
		getCurrentLightSource().tx -= 0.3
	});

	//Control the source light
	kd.LEFT.down(function () {
		getCurrentLightSource().tx += 0.3
	});

	//Guide the camera
	kd.W.down(function () {
		camera.moveForward(cameraSpeed)
	});

	kd.A.down(function () {
		camera.moveRight(-cameraSpeed)
	});

	kd.S.down(function () {
		camera.moveForward(-cameraSpeed)
	});

	kd.D.down(function () {
		camera.moveRight(cameraSpeed)
	});

	kd.Q.down(function () {
		camera.rotateRight(glMatrix.toRadian(cameraSpeedAngle))
	});

	kd.E.down(function () {
		camera.rotateRight(-glMatrix.toRadian(cameraSpeedAngle))
	});

	kd.SHIFT.down(function () {
		camera.moveUp(-cameraSpeed)
	});

	kd.SPACE.down(function () {
		camera.moveUp(cameraSpeed)
	});
}

function updateDensity(){
	var e = document.getElementById("fog-density");
	currentFog = e.value/100;
}

function initCamera(){
	mat4.perspective(
		projMatrix,
		glMatrix.toRadian(fieldOfView),
		gl.canvas.width / gl.canvas.height,
		0.35,
		85.0
	);
}

function resize() {
	var targetHeight = window.innerWidth * 9 / 16;

	if (window.innerHeight > targetHeight) {
		// Center vertically
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = targetHeight - 10;
		gl.canvas.style.left = '0px';
		gl.canvas.style.top = (window.innerHeight - targetHeight) / 2 + 'px';
	} else {
		// Center horizontally
		gl.canvas.width = window.innerHeight * 16 / 9;
		gl.canvas.height = window.innerHeight - 10;
		gl.canvas.style.left = (window.innerWidth - (gl.canvas.width)) / 2 + 'px';
		gl.canvas.style.top = '0px';
	}

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

//----------------------------------------------------------------------------
// Running WebGL
//----------------------------------------------------------------------------
async function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL(canvas);
	shaderProgram = initShaders(gl, 'shader');
	noShadowProgram = initShaders(gl, 'noshadow');
	shadowProgram = initShaders(gl, 'shadow');
	shadowMapProgram = initShaders(gl, 'shadowmap');
	loadShaders();

	//Initializes all different models of objects
	initCamera()
	// await loadModelsObj()
	await loadModelsJson()
	await loadTextures()
	await loadScenes()
	var texturesCubeHTML = document.getElementById('textures-cube');
	var texturesTableHTML = document.getElementById('textures-table');
	var texturesSofaHTML = document.getElementById('textures-sofa');
	var texturesMonkeyHTML = document.getElementById('textures-monkey');
	var texturesWallHTML = document.getElementById('textures-wall');
	texturesCubeHTML.options[texturesCubeHTML.options.length] = new Option('Cube texture...');
	texturesTableHTML.options[texturesTableHTML.options.length] = new Option('Table texture...');
	texturesSofaHTML.options[texturesSofaHTML.options.length] = new Option('Sofa texture...');
	texturesMonkeyHTML.options[texturesMonkeyHTML.options.length] = new Option('Monkey texture...');
	texturesWallHTML.options[texturesWallHTML.options.length] = new Option('Wall texture...');
	var texHTML = document.getElementById('texture_only')
	texHTML.style.visibility = 'hidden'
	for(var i = 0; i < textures_available.length; i++){
		texturesCubeHTML.options[texturesCubeHTML.options.length] = new Option(textures_available[i].name);
		texturesTableHTML.options[texturesTableHTML.options.length] = new Option(textures_available[i].name);
		texturesSofaHTML.options[texturesSofaHTML.options.length] = new Option(textures_available[i].name);
		texturesMonkeyHTML.options[texturesMonkeyHTML.options.length] = new Option(textures_available[i].name);
		texturesWallHTML.options[texturesWallHTML.options.length] = new Option(textures_available[i].name);
	}
	// await loadModels()

	setEventListeners();
	tick();	// A timer controls the rendering / animation
}

function loadShaders() {
	var shadersHTML = document.getElementById('shaders');
	shadersHTML.options[shadersHTML.options.length] = new Option('Shadows');
	shadersHTML.options[shadersHTML.options.length] = new Option('Texture and Fog');

	shaderProgram.positionAttribLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	shaderProgram.texCoordAttribLocation = gl.getAttribLocation(shaderProgram, "vertTexCoord");
	shaderProgram.uniforms = {
		pUniform: gl.getUniformLocation(shaderProgram, "uPMatrix"),
		mvUniform: gl.getUniformLocation(shaderProgram, "uMVMatrix"),
		mWorld: gl.getUniformLocation(shaderProgram, "mWorld"),
	}

	noShadowProgram.positionAttribLocation = gl.getAttribLocation(noShadowProgram, "vPos");
	noShadowProgram.texCoordAttribLocation = gl.getAttribLocation(noShadowProgram, "vertTexCoord");
	noShadowProgram.uniforms = {
		mProj: gl.getUniformLocation(noShadowProgram, 'mProj'),
		mView: gl.getUniformLocation(noShadowProgram, 'mView'),
		mWorld: gl.getUniformLocation(noShadowProgram, 'mWorld'),

		pointLightPosition: gl.getUniformLocation(noShadowProgram, 'pointLightPosition'),
		meshColor: gl.getUniformLocation(noShadowProgram, 'meshColor'),
		fogColorLocation: gl.getUniformLocation(noShadowProgram, 'u_fogColor'),
		fogAmountLocation: gl.getUniformLocation(noShadowProgram, 'u_fogAmount')
	};
	noShadowProgram.attribs = {
		vPos: gl.getAttribLocation(noShadowProgram, 'vPos'),
		vNorm: gl.getAttribLocation(noShadowProgram, 'vNorm'),
	};

	shadowProgram.uniforms = {
		mProj: gl.getUniformLocation(shadowProgram, 'mProj'),
		mView: gl.getUniformLocation(shadowProgram, 'mView'),
		mWorld: gl.getUniformLocation(shadowProgram, 'mWorld'),

		pointLightPosition: gl.getUniformLocation(shadowProgram, 'pointLightPosition'),
		meshColor: gl.getUniformLocation(shadowProgram, 'meshColor'),
		lightShadowMap: gl.getUniformLocation(shadowProgram, 'lightShadowMap'),
		shadowClipNearFar: gl.getUniformLocation(shadowProgram, 'shadowClipNearFar'),

		bias: gl.getUniformLocation(shadowProgram, 'bias')
	};
	shadowProgram.attribs = {
		vPos: gl.getAttribLocation(shadowProgram, 'vPos'),
		vNorm: gl.getAttribLocation(shadowProgram, 'vNorm'),
	};

	shadowMapProgram.uniforms = {
		mProj: gl.getUniformLocation(shadowMapProgram, 'mProj'),
		mView: gl.getUniformLocation(shadowMapProgram, 'mView'),
		mWorld: gl.getUniformLocation(shadowMapProgram, 'mWorld'),

		pointLightPosition: gl.getUniformLocation(shadowMapProgram, 'pointLightPosition'),
		shadowClipNearFar: gl.getUniformLocation(shadowMapProgram, 'shadowClipNearFar'),
	};
	shadowMapProgram.attribs = {
		vPos: gl.getAttribLocation(shadowMapProgram, 'vPos'),
	};
	if(currentShader == 'Shadows')
		loadShadowTexturesAndFrameBuffers();
}

//----------------------------------------------------------------------------
// WebGL Initialization
//----------------------------------------------------------------------------
function initWebGL(canvas) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		resize()
		// DEFAULT: Face culling is DISABLED
		// Enable FACE CULLING
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(gl.BACK);

		// DEFAULT: The BACK FACE is culled!!
		// The next instruction is not needed...
		gl.cullFace(gl.BACK);
		//activates the continuous key event
		kd.run(function () {
			kd.tick();
		});

	} catch (e) {
		console.log('ERROR: ', e)
	}
	if (!gl) {
		console.log("Could not initialise WebGL, sorry! :-(");
	}
}

function loadScenes() {
	return new Promise(function (resolve, reject) {
		fetchScenes().then((sc_arr) => {
			sc_arr.scenes.forEach(scene => {
				var newScene = {
					name: scene.name,
					objects: []
				}
				scene.objects.forEach((obj) => {
					var { tx, ty, tz, angleXX, angleYY, angleZZ, sx, sy, sz, name, texture, R, G, B } = obj
					var model = getModel(name)
					var vertices = [...model.vertices]
					var texCoords = [...model.texCoords]
					var indices = model.indices ? [...model.indices] : null
					var normals = model.normals ? [...model.normals] : null
					texture = getTexture(texture)
					var newEntity = new Entity(tx, ty, tz, angleXX, angleYY, angleZZ, sx, sy, sz, vertices, normals, texCoords, indices, texture)
					if (name == 'LightBulbMesh') {
						lightSource = newEntity
					}
					if(R || R == 0 || G == 0 || B == 0){
						newEntity.R = R
						newEntity.G = G
						newEntity.B = B
					}
					object_list.push(newEntity)
					resolve()
				})
			})
		})
	})
}

function fetchScenes() {
	return new Promise(function (resolve, reject) {
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/scenes')
			.then(async function (response) {
				// handle success
				console.log('Loaded all scene objects!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function loadModelsObj() {
	return new Promise(function (resolve, reject) {
		fetchModelsObj().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				var simpleGeometry = true
				if (!x.texturecoords)
					x.texCoords = generateColor(x.vertices.length)
				else {
					simpleGeometry = false
					x.texCoords = x.texturecoords
				}
				model_list.push(new Model(x.name, x.vertices, x.normals, x.texCoords, x.indices, simpleGeometry))
			})
			resolve()
		})
	})
}

function fetchModelsObj() {
	return new Promise(function (resolve, reject) {
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/models_obj')
			.then(async function (response) {
				// handle success
				console.log('Loaded all models obj!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function generateColor(n) {
	arr = []
	for (var i = 0; i < n; i++)
		arr.push(Math.random())
	return arr
}

function getTexture(name) {
	return textures_available.filter(x => { return x.name == name })[0]
}

function getModel(name) {
	return { ...model_list.filter(x => x.name == name)[0] }
}

function loadModelsJson() {
	return new Promise(function (resolve, reject) {
		fetchModelsJson().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				var simpleGeometry = true
				if (!x.texturecoords)
					x.texCoords = generateColor(x.vertices.length)
				else {
					simpleGeometry = false
					x.texCoords = x.texturecoords
				}
				model_list.push(new Model(x.name, x.vertices, x.normals, x.texCoords, x.indices, simpleGeometry))
			})
			resolve()
		})
	})
}


function fetchModelsJson() {
	return new Promise(function (resolve, reject) {
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/models_json')
			.then(async function (response) {
				// handle success
				console.log('Loaded all json models!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function loadModels() {
	return new Promise(function (resolve, reject) {
		fetchModels().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				model_list.push(new Model(x.name, x.vertices, generateColor(x.vertices.length), x.indices))
			})
			resolve()
		})
	})
}

function fetchModels() {
	return new Promise(function (resolve, reject) {
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/models')
			.then(async function (response) {
				// handle success
				console.log('Loaded all models!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function loadShadowTexturesAndFrameBuffers(){
	shadowMapCube = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	floatExtension = gl.getExtension("OES_texture_float");
	floatLinearExtension = gl.getExtension("OES_texture_float_linear");

	if (floatExtension && floatLinearExtension) {
		for (var i = 0; i < 6; i++) {
			gl.texImage2D(
				gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
				0, gl.RGBA,
				textureSize, textureSize,
				0, gl.RGBA,
				gl.FLOAT, null
			);
		}
	} else {
		for (var i = 0; i < 6; i++) {
			gl.texImage2D(
				gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
				0, gl.RGBA,
				textureSize, textureSize,
				0, gl.RGBA,
				gl.UNSIGNED_BYTE, null
			);
		}
	}

	shadowMapFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);

	shadowMapRenderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderbuffer);
	gl.renderbufferStorage(
		gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
		textureSize, textureSize
	);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function loadTextures() {
	return new Promise(function (resolve, reject) {
		fetchTextures().then((texture_list) => {
			texture_list = texture_list.textures
			for (var i = 0; i < texture_list.length; i++) {
				var image = new Image();
				var imageName = texture_list[i]
				image.crossOrigin = "anonymous"
				image.src = 'http://127.0.0.1:8000/static/' + texture_list[i];
				image.id = i
				image.name = texture_list[i]
				image.style.visibility = 'hidden';
				var texture = gl.createTexture();
				textures_available.push({ name: texture_list[i].split('.')[0], texture, image })
				//document.getElementById('containerDiv').appendChild(image);
				image.onload = function (im) {
					var id = im.path[0].id
					var textureName = textures_available[id].name
					var texture = textures_available[id].texture
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texImage2D(
						gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
						gl.UNSIGNED_BYTE,
						textures_available[id].image
					);
					gl.bindTexture(gl.TEXTURE_2D, null);
					console.log('Texture', textureName, 'has been loaded!')
					resolve()
				};
			}
		})
	})
}

function fetchTexture(tex) {
	return new Promise(function (resolve, reject) {
		fetch('http://localhost:8000/' + tex)
			.then(async function (response) {
				// handle success
				console.log('Loaded all models!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function fetchTextures() {
	return new Promise(function (resolve, reject) {
		fetch('http://localhost:8000/textures')
			.then(async function (response) {
				// handle success
				console.log('Loaded all models!')
				resolve(await response.json())
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
