
//----------------------------------------------------------------------------
//
// Global Variables
//

//SETTINGS
var gl = null; // WebGL context
var shaderProgram = null;
var currentSceneIndex = 0;
var rotate = false

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
		shaderProgram.positionAttribLocation, 
		3, 
		gl.FLOAT,
		gl.FALSE,
		3*Float32Array.BYTES_PER_ELEMENT,
		0);
	gl.enableVertexAttribArray(shaderProgram.positionAttribLocation);

	// Associating to the vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER,objTexCoordVertexBufferObject)
	gl.vertexAttribPointer(
		shaderProgram.texCoordAttribLocation, 
		2, 
		gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0);
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
	for(var i = 0; i < currentScene.objects.length; i++){
		var obj = currentScene.objects[i]
		// Computing the Model-View Matrix
		var mvMatrix = mult( rotationZZMatrix( obj.angleZZ ), 
							scalingMatrix( obj.sx, obj.sy, obj.sz ) );
		mvMatrix = mult( rotationYYMatrix( obj.angleYY ), mvMatrix );
		mvMatrix = mult( rotationXXMatrix( obj.angleXX ), mvMatrix );
		mvMatrix = mult( translationMatrix( obj.tx, obj.ty, obj.tz ), mvMatrix );
		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
		refreshTexture(obj)
		// Drawing the contents of the vertex buffer
		//gl.drawElements(gl.TRIANGLES, 0, object.objPosVertexBufferObject.numItems, 0);
			// console.log('got here',obj)
			// gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length);
			gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
	}
}

function refreshTexture(obj){
	gl.bindTexture(gl.TEXTURE_2D, obj.texture.texture);
	gl.activeTexture(gl.TEXTURE0);
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
		var currentScene = scene_list[currentSceneIndex]
		for(var i = 0; i < currentScene.objects.length; i++){
			if(rotate)
				currentScene.objects[i].angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
		}
	}
	lastTime = timeNow;
}

function setEventListeners(){

	document.getElementById('scenes').addEventListener('change',(event) => {
		var e = document.getElementById("scenes");
		currentSceneIndex = e.options[e.selectedIndex].value;
		loadCurrentScene()
	})

    window.addEventListener('resize', function() {resize()}, false);

	window.addEventListener("keypress", (event) => {
		var key = event.keyCode
		if(key == 82 || key == 114)
			rotate = !rotate
	});

	//Guide the camera
	kd.W.down(function () {
		// console.log('w')
		cameraY += 0.1
	});	

	kd.A.down(function () {
		// console.log('a')
		cameraX -= 0.1
	});	

	kd.S.down(function () {
		// console.log('s')
		cameraY -= 0.1
	});	

	kd.D.down(function () {
		// console.log('d')
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
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
	await loadModels()
	await loadModelsJson()
	await loadTextures()
	await loadScenes()
	setEventListeners();
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
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(gl.BACK);

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

function loadCurrentScene(){
	var scene = scene_list[currentSceneIndex]
	for(var i = 0; i < scene.objects.length; i++){
		initBuffers(scene.objects[i])
	}
}


function loadScenes(){
	return new Promise(function(resolve, reject){
		fetchScenes().then((sc_arr) => {
			var i = 0
			var scenesHTML = document.getElementById('scenes');
			sc_arr.scenes.forEach(scene => {
				var newScene = {
					name: scene.name,
					objects: []
				}
				scene.objects.forEach((obj) => {
					var {tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,name,texture} = obj
					var model = getModel(name)
					var vertices = [...model.vertices]
					var texCoords = [...model.texCoords]
					var indices = model.indices ? [...model.indices] : null
					texture = getTexture(texture)
					newScene.objects.push({tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,vertices,texCoords,indices,texture,simpleGeometry:model.simpleGeometry})
				})
				scenesHTML.options[scenesHTML.options.length] = new Option('Scene '+i, i);
				i += 1
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

function generateColor(n){
	arr = []
	for(var i = 0; i < n; i++)
		arr.push(Math.random())
	return arr
}

function getTexture(name){
	return textures_available.filter(x => {return x.name == name})[0]
}

function getModel(name){
	return {...model_list.filter(x => x.name == name)[0]}
}

function loadModelsJson(){
	return new Promise(function(resolve, reject){
		fetchModelsJson().then((mod_arr) => {
			mod_arr.models.forEach(x => {
				var simpleGeometry = true
				if(!x.texturecoords)
					x.texCoords = generateColor(x.vertices.length)
				else{
					simpleGeometry = false
					x.texCoords = x.texturecoords
				}
				model_list.push(new Model(x.name,x.vertices,x.texCoords,x.indices,simpleGeometry))
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
				model_list.push(new Model(x.name,x.vertices,generateColor(x.vertices.length),x.indices))
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
				image.id = i
				image.name = texture_list[i]
				image.style.visibility = 'hidden';
				var texture = gl.createTexture();
				textures_available.push({name:texture_list[i].split('.')[0],texture,image})
				//document.getElementById('containerDiv').appendChild(image);
				image.onload = function (im) {
					var id = im.path[0].id
					var textureName = textures_available[id].name
					var texture = textures_available[id].texture
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)
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
					console.log('Texture',textureName,'has been loaded!')
					resolve()
				};
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