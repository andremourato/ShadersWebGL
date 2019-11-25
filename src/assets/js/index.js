
//----------------------------------------------------------------------------
//
// Global Variables
//

var {Model} = require('~/assets/js/Model.js')
var {Entity} = require('~/assets/js/Entity.js')
var {initShaders} = require('~/assets/js/initShaders.js')
require('~/assets/js/webgl-utils.js')
var kd = require('keydrown')
var axios = require('axios')
var {perspective, flatten, mult,
	rotationZZMatrix,rotationYYMatrix,rotationXXMatrix,
	scalingMatrix,translationMatrix} = require('~/assets/js/maths.js')

//SETTINGS
var gl = null; // WebGL context
var shaderProgram = null;

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
function initBuffers(model) {
	
	// Coordinates
		
	model.triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, model.triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	model.triangleVertexPositionBuffer.itemSize = 3;
	model.triangleVertexPositionBuffer.numItems = model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			model.triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Colors
		
	model.triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, model.triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);
	model.triangleVertexColorBuffer.itemSize = 3;
	model.triangleVertexColorBuffer.numItems = model.colors.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			model.triangleVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
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
	// A standard view volume.
	// Viewer is at (0,0,0)
	// Ensure that the model is "inside" the view volume
	var pMatrix = perspective( 45, 1, 0.05, 10 );

	var scene = scene_list[0] //HARDCODED: REMOVE LATER
	//console.log(scene)
	for(var i = 0; i < scene.objects.length;i++){
		var object = scene.objects[i]
		//console.log(object.model)
		object.tz = -1.5;

		gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
		// Computing the Model-View Matrix
		// Pay attention to the matrix multiplication order!!
		// First transformation ?
		// Last transformation ?
		var mvMatrix = mult( rotationZZMatrix( object.angleZZ ), 
							scalingMatrix( object.sx, object.sy, object.sz ) );
		mvMatrix = mult( rotationYYMatrix( object.angleYY ), mvMatrix );
		mvMatrix = mult( rotationXXMatrix( object.angleXX ), mvMatrix );
		mvMatrix = mult( translationMatrix( object.tx, object.ty, object.tz ), mvMatrix );

		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
		// Drawing the contents of the vertex buffer
		// primitiveType allows drawing as filled triangles / wireframe / vertices
		object.tz = -1.5;
		console.log(object.model.triangleVertexPositionBuffer.numItems)
		gl.drawArrays(gl.TRIANGLES, 0, object.model.triangleVertexPositionBuffer.numItems);
	}
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
		model_list[0].ty += ty_speed;
	});	

	kd.A.down(function () {
		model_list[0].tx -= tx_speed;
	});	

	kd.S.down(function () {
		model_list[0].ty -= ty_speed;
	});	

	kd.D.down(function () {
		model_list[0].tx += tx_speed;
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
export async function runWebGL() {
	console.log('Loading webgl...')
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	await loadModels()
	console.log('Loaded all models!')
	await loadScenes()
	console.log('Loaded all scenes!')
	setEventListeners();
	shaderProgram = initShaders( gl );
	//Initializes all different models of objects
	console.log(model_list)
	for(var i = 0; i < model_list.length; i++){
		initBuffers(model_list[i]);
	}
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

function loadScenes(){
	return new Promise(function(resolve, reject){
		// Make a request for a user with a given ID
		axios.get('http://localhost:8000/scenes')
		.then(function (response) {
			// handle success
			response.data.scenes.forEach(scene => {
				var newScene = {
					name: scene.name,
					objects: []
				}
				scene.objects.forEach((obj) => {
					var {tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,modelname} = obj
					newScene.objects.push(new Entity(tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,getModel(modelname)))
				})
				scene_list.push(newScene)
			})
			resolve({'status':'ok'})
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
		axios.get('http://localhost:8000/models')
		.then(function (response) {
			// handle success
			response.data.models.forEach(x => {
				model_list.push(new Model(x.vertices,x.colors))
			})
			resolve({'status':'ok'})
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

