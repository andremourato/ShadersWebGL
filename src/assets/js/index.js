
//----------------------------------------------------------------------------
//
// Global Variables
//

//SETTINGS
var gl = null; // WebGL context
var shaderProgram = null;
var currentSceneIndex = 0;

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

//----------------------------------------------------------------------------
// The WebGL code
//----------------------------------------------------------------------------
//  Rendering
// Handling the Vertex and the Color Buffers
function initBuffers(object) {
	
	// Coordinates
	console.log(object)
	object.triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, object.triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
	object.triangleVertexPositionBuffer.itemSize = 3;
	object.triangleVertexPositionBuffer.numItems = object.model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			object.triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Colors
		
	object.triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, object.triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.colors), gl.STATIC_DRAW);
	object.triangleVertexColorBuffer.itemSize = 3;
	object.triangleVertexColorBuffer.numItems = object.model.colors.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			object.triangleVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
}

function printInfo(){
	var numAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
	for (var ii = 0; ii < numAttribs; ++ii) {
	var attribInfo = gl.getActiveAttrib(shaderProgram, ii);
	if (!attribInfo) {
		break;
	}
		console.log(gl.getAttribLocation(shaderProgram, attribInfo.name), attribInfo.name);
	}
}

//----------------------------------------------------------------------------
//  Drawing the 3D scene
//----------------------------------------------------------------------------
function drawScene() {
	var currentScene = scene_list[currentSceneIndex]
	// Clearing with the background color
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	var pMatrix = perspective( 45, 0.5, 0.05, 10 );
	// A standard view volume.
	// Viewer is at (0,0,0)
	// Ensure that the model is "inside" the view volume
	// for(var i = 0; i < currentScene.objects.length; i++){
	// 	var object = currentScene.objects[i]
	var object = currentScene.objects[0]
		object.tz = -1.5 //TODO: REMOVE LATER
		gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
		// Computing the Model-View Matrix
		var mvMatrix = mult( rotationZZMatrix( object.angleZZ ), 
							scalingMatrix( object.sx, object.sy, object.sz ) );
		mvMatrix = mult( rotationYYMatrix( object.angleYY ), mvMatrix );
		mvMatrix = mult( rotationXXMatrix( object.angleXX ), mvMatrix );
		mvMatrix = mult( translationMatrix( object.tx, object.ty, object.tz ), mvMatrix );

		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
		// Drawing the contents of the vertex buffer
		//gl.drawElements(gl.TRIANGLES, 0, object.triangleVertexPositionBuffer.numItems, 0);
		gl.drawArrays(gl.TRIANGLES, 0, object.triangleVertexPositionBuffer.numItems);
	// }
}

//----------------------------------------------------------------------------
// Timer
//----------------------------------------------------------------------------
function tick() {
	window.requestAnimFrame(tick);
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
		//model_list[1].angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

function setEventListeners(){

    window.addEventListener('resize', function() {resize()}, false);

	//Guide the camera
	kd.W.down(function () {
		console.log('w')
	});	

	kd.A.down(function () {
		console.log('a')
	});	

	kd.S.down(function () {
		console.log('s')
	});	

	kd.D.down(function () {
		console.log('d')
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
	gl.viewport(0, 0, gl.canvas.width,gl.canvas.height);
  }

//----------------------------------------------------------------------------
// Running WebGL
//----------------------------------------------------------------------------
async function runWebGL() {
	console.log('Loading webgl...')
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	var mod_arr = await loadModels()
	mod_arr.models.forEach(x => {
		model_list.push({vertices:x.vertices,colors:x.colors})
	})
	console.log('Loaded all models!')
	var sc_arr = await fetchScenes()
	sc_arr.scenes.forEach(scene => {
		var newScene = {
			name: scene.name,
			objects: []
		}
		scene.objects.forEach((obj) => {
			var {tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,modelname} = obj
			newScene.objects.push({tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,model:getModel(modelname)})
		})
		scene_list.push(newScene)
	})
	console.log('Loaded all scenes!')
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

function loadCurrentScene(){
	var scene = scene_list[currentSceneIndex]
	console.log(scene)
	for(var i = 0; i < scene.objects.length; i++){
		initBuffers(scene.objects[i])
	}
	console.log('BUffers inited')
}

function fetchScenes(){
	return new Promise(function(resolve, reject){
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/scenes')
		.then(async function (response) {
			// handle success
			resolve(await response.json())
		})
		.catch(function (error) {
			// handle error
			console.log(error);
			reject(error)
		})
		.finally(function () {
			// always executed
		});
	})
}

function getModel(name){
	return model_list.filter(x => x.name == name)[0]
}

function loadModels(){
	return new Promise(function(resolve, reject){
		// Make a request for a user with a given ID
		fetch('http://localhost:8000/models')
		.then(async function (response) {
			// handle success
			resolve(await response.json())
		})
		.catch(function (error) {
			// handle error
			console.log(error);
			reject(error)
		})
		.finally(function () {
			// always executed
		});
	})
}

