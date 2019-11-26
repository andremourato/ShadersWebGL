
//----------------------------------------------------------------------------
//
// Global Variables
//

//TESTING
var boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

var boxTexture = null

//SETTINGS
var gl = null; // WebGL context
var shaderProgram = null;
var currentSceneIndex = 0;

//CAMERA
var fieldOfViewDegrees = 45
var aspect = 9/16
var zNear = 0.05
var zFar = 2000
var cameraX = 0
var cameraY = 0
var cameraZ = 0
var cameraAngleX = 0
var cameraAngleY = 0
var cameraAngleZ = 0
var cameraScaleX = 0.5
var cameraScaleY = 1
var cameraScaleZ = 0.5

// SPEED
const GLOBAL_SPEED = 0.03;
var tx_speed = GLOBAL_SPEED;
var ty_speed = GLOBAL_SPEED;
var tz_speed = GLOBAL_SPEED;

// Animation controls
var rotationYY_ON = 0;
var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;

// DEFAULT POSITION VALUES
var DEFAULT_TX = 0;
var DEFAULT_TY = 0;
var DEFAULT_TZ = 0;
var DEFAULT_angleXX = 30;
var DEFAULT_angleYY = 45;
var DEFAULT_angleZZ = 0;
var DEFAULT_SX = 0.2;
var DEFAULT_SY = 0.2;
var DEFAULT_SZ = 0.2;

// MODELS
var model_list = []
var scene_list = []
var textures_available = []

//----------------------------------------------------------------------------
// The WebGL code
//----------------------------------------------------------------------------
//  Rendering
// Handling the Vertex and the Color Buffers
function initBuffers(obj) {
	
	// Coordinates
	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	console.log(boxVertices)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	//Indices
	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(
		shaderProgram.positionAttribLocation, 
		3, 
		gl.FLOAT,
		gl.FALSE,
		5*Float32Array.BYTES_PER_ELEMENT,
		0);

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(
		shaderProgram.texCoordAttribLocation, 
		2, 
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		3 * Float32Array.BYTES_PER_ELEMENT);
	gl.enableVertexAttribArray(shaderProgram.positionAttribLocation);
	gl.enableVertexAttribArray(shaderProgram.texCoordAttribLocation);
}

//----------------------------------------------------------------------------
//  Drawing the 3D scene
//----------------------------------------------------------------------------
function drawScene() {
	// Clearing with the background color
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	var pMatrix = perspective( fieldOfViewDegrees, aspect, zNear, zFar );
	pMatrix = mult( translationMatrix( cameraX, cameraY, cameraZ ), pMatrix );
	pMatrix = mult( rotationXXMatrix( cameraAngleX ), pMatrix );
	pMatrix = mult( rotationYYMatrix( cameraAngleY ), pMatrix );
	pMatrix = mult( rotationZZMatrix( cameraAngleZ ), pMatrix );
	pMatrix = mult( scalingMatrix(cameraScaleX,cameraScaleY,cameraScaleZ),pMatrix)
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	var currentScene = scene_list[currentSceneIndex]
	// refreshTextures()
	for(var i = 0; i < currentScene.objects.length; i++){
		var obj = currentScene.objects[i]
		// Computing the Model-View Matrix
		var mvMatrix = mult( rotationZZMatrix( obj.angleZZ ), 
							scalingMatrix( obj.sx, obj.sy, obj.sz ) );
		mvMatrix = mult( rotationYYMatrix( obj.angleYY ), mvMatrix );
		mvMatrix = mult( rotationXXMatrix( obj.angleXX ), mvMatrix );
		mvMatrix = mult( translationMatrix( obj.tx, obj.ty, obj.tz ), mvMatrix );
		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

		gl.bindTexture(gl.TEXTURE_2D,boxTexture);
		gl.activeTexture(gl.TEXTURE0);
		// Drawing the contents of the vertex buffer
		//gl.drawElements(gl.TRIANGLES, 0, object.boxVertexBufferObject.numItems, 0);
		// if(!obj.indices)
		// 	gl.drawArrays(gl.TRIANGLES, 0, obj.boxVertexBufferObject.numItems);
		// else
			gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
	}
}

function refreshTextures(){
	for(var i = 0; i < textures_available; i++){
		var t = textures_available[i]
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.activeTexture(gl.TEXTURE0);
	}
}

//----------------------------------------------------------------------------
// Timer
//----------------------------------------------------------------------------
function tick() {
	requestAnimFrame(tick);
	drawScene();
	animate();
}
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
//
//  Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if( lastTime != 0 ) {
		var elapsed = timeNow - lastTime;
		for(var i = 0; i < scene_list[0].objects.length; i++){
			scene_list[0].objects[i].angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
		}
	}
	lastTime = timeNow;
}

function setEventListeners(){

    window.addEventListener('resize', function() {resize()}, false);

	//Guide the camera
	kd.W.down(function () {
		console.log('w')
		cameraY += 0.1
	});	

	kd.A.down(function () {
		console.log('a')
		cameraX -= 0.1
	});	

	kd.S.down(function () {
		console.log('s')
		cameraY -= 0.1
	});	

	kd.D.down(function () {
		console.log('d')
		cameraX += 0.1
	});	

	kd.Q.down(function () {
		console.log('q')
	});	

	kd.E.down(function () {
		console.log('e')
	});	
}

function resize() {

	var ratio = 1
	var targetHeight = window.innerWidth * 1/ratio;

	if (window.innerHeight > targetHeight) {
		// Center vertically
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = targetHeight;
	} else {
		// Center horizontally
		gl.canvas.width = (window.innerHeight) * ratio;
		gl.canvas.height = window.innerHeight;
	}
	gl.viewport(0, 0, gl.canvas.height,gl.canvas.width);
  }

//----------------------------------------------------------------------------
// Running WebGL
//----------------------------------------------------------------------------
async function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	await loadModels()
	await loadModelsJson()
	await loadScenes()
	await loadTextures()
	initWebGL( canvas );
	setEventListeners();
	shaderProgram = initShaders( gl );
	//Initializes all different models of objects
	currentSceneIndex = 0
	loadCurrentScene()
	tick();	// A timer controls the rendering / animation
}

//----------------------------------------------------------------------------
// WebGL Initialization
//----------------------------------------------------------------------------
function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		resize()
		// DEFAULT: Face culling is DISABLED
		// Enable FACE CULLING
		gl.enable( gl.CULL_FACE );

		// DEFAULT: The BACK FACE is culled!!
		// The next instruction is not needed...
		gl.cullFace( gl.BACK );
		//activates the continuous key event
		kd.run(function () {
			kd.tick();
		});

	} catch (e) {
		console.log('ERROR: ',e)
	}
	if (!gl) {
		console.log("Could not initialise WebGL, sorry! :-(");
	}        
}

function generateColor(n){
	arr = []
	for(var i = 0; i < n; i++)
		arr.push(0)
	return arr
}

function loadCurrentScene(){
	var scene = scene_list[currentSceneIndex]
	for(var i = 0; i < scene.objects.length; i++){
		initBuffers(scene.objects[i])
	}
}

function loadScenes(){
	return new Promise(function(resolve, reject){
		fetchScenes().then((sc_arr) => {
			sc_arr.scenes.forEach(scene => {
				var newScene = {
					name: scene.name,
					objects: []
				}
				scene.objects.forEach((obj) => {
					var {tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,name} = obj
					var model = getModel(name)
					console.log(model)
					var vertices = [...model.vertices]
					var colors = [...model.colors]
					var indices = model.indices ? [...model.indices] : null
					newScene.objects.push({tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,vertices,colors,indices})
				})
				scene_list.push(newScene)
			})
			resolve()
		})
	})
}

function fetchScenes(){
	return new Promise(function(resolve, reject){
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/scenes')
		.then(async function (response) {
			// handle success
			console.log('Loaded all scenes!')
			resolve(await response.json())
		})
		.catch(function (error) {
			reject(error)
		})
	})
}

function getModel(name){
	return {...model_list.filter(x => x.name == name)[0]}
}

function loadModelsJson(){
	return new Promise(function(resolve, reject){
		fetchModelsJson().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				model_list.push(new Model(x.name,x.vertices,generateColor(x.vertices.length),x.indices))
			})
			resolve()
		})
	})
}


function fetchModelsJson(){
	return new Promise(function(resolve, reject){
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

function loadModels(){
	return new Promise(function(resolve, reject){
		fetchModels().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				model_list.push(new Model(x.name,x.vertices,x.colors,x.indices))
			})
			resolve()
		})
	})
}

function fetchModels(){
	return new Promise(function(resolve, reject){
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

function loadTextures() {
	return new Promise(function(resolve, reject){
		fetchTextures().then((texture_list) => {
			texture_list = texture_list.textures
			for(var i = 0; i < texture_list.length; i++){
				var image = new Image();
				var imageName = texture_list[i]
				image.crossOrigin="anonymous"
				image.src = 'http://127.0.0.1:8000/static/'+texture_list[i];
				image.id = imageName
				image.style.visibility = 'hidden';
				//document.getElementById('containerDiv').appendChild(image);
				image.onload = function (im) {
					var text = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, text);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texImage2D(
						gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
						gl.UNSIGNED_BYTE,
						image
					);
					gl.bindTexture(gl.TEXTURE_2D, null);
					textures_available.push(text)
					if(im.path[0].id == 'crate.png'){
						boxTexture = text
					}
					console.log('Image',im.path[0].id,'has been loaded!')
				};
			resolve()
			}
		})
	})
}

function fetchTexture(tex){
	return new Promise(function(resolve, reject){
		fetch('http://localhost:8000/'+tex)
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

function fetchTextures(){
	return new Promise(function(resolve, reject){
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