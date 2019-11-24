
//----------------------------------------------------------------------------
//
// Global Variables
//

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
var DEFAULT_SX = 1;
var DEFAULT_SY = 1;
var DEFAULT_SZ = 1;

// MODELS
var model_files = ['modeloCuboV0.txt','modeloCuboV1.txt']
var model_list = []

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
	for(var i = 0; i < model_list.length;i++){
		var model = model_list[i]
		model.tz = -1.5;


		gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
		// Computing the Model-View Matrix
		// Pay attention to the matrix multiplication order!!
		// First transformation ?
		// Last transformation ?
		var mvMatrix = mult( rotationZZMatrix( model.angleZZ ), 
							scalingMatrix( model.sx, model.sy, model.sz ) );
		mvMatrix = mult( rotationYYMatrix( model.angleYY ), mvMatrix );
		mvMatrix = mult( rotationXXMatrix( model.angleXX ), mvMatrix );
		mvMatrix = mult( translationMatrix( model.tx, model.ty, model.tz ), mvMatrix );

		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
		// Drawing the contents of the vertex buffer
		// primitiveType allows drawing as filled triangles / wireframe / vertices
		model.tz = -1.5;
		if( primitiveType == gl.LINE_LOOP ) {
			// To simulate wireframe drawing!
			// No faces are defined! There are no hidden lines!
			// Taking the vertices 3 by 3 and drawing a LINE_LOOP
			var i;
			for( i = 0; i < model.triangleVertexPositionBuffer.numItems / 3; i++ ) {
				gl.drawArrays( primitiveType, 3 * i, 3 ); 
			}
		}	
		else {
			gl.drawArrays(primitiveType, 0, model.triangleVertexPositionBuffer.numItems); 
		}
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
		model_list[1].angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

function setEventListeners(){
	// Dropdown list
	var projection = document.getElementById("projection-selection");
	projection.addEventListener("click", function(){
		// Getting the selection
		var p = projection.selectedIndex;
		switch(p){
			case 0 : projectionType = 0;
				break;
			case 1 : projectionType = 1;
				break;
		}  	
	});      

	// Dropdown list
	var list = document.getElementById("rendering-mode-selection");
	list.addEventListener("click", function(){
		// Getting the selection
		var mode = list.selectedIndex;
		switch(mode){
			case 0 : primitiveType = gl.TRIANGLES;
				break;
			case 1 : primitiveType = gl.LINE_LOOP;
				break;
			case 2 : primitiveType = gl.POINTS;
				break;
		}
	});      

	// Button events
	
	// document.getElementById("YY-on-off-button").onclick = function(){
	// 	// Switching on / off
	// 	if( rotationYY_ON ) 
	// 		rotationYY_ON = 0;
	// 	else 
	// 		rotationYY_ON = 1;
	// };

	// document.getElementById("YY-direction-button").onclick = function(){
	// 	// Switching the direction
	// 	if( rotationYY_DIR == 1 )
	// 		rotationYY_DIR = -1;
	// 	else 
	// 		rotationYY_DIR = 1;
	// };      

	// document.getElementById("YY-slower-button").onclick = function(){
		
	// 	rotationYY_SPEED *= 0.75;  
	// };      

	// document.getElementById("YY-faster-button").onclick = function(){
	// 	rotationYY_SPEED *= 1.25;  
	// };      

	// document.getElementById("reset-button").onclick = function(){
	// 	// The initial values
	// 	tx = 0.0;
	// 	ty = 0.0;
	// 	tz = 0.0;
	// 	angleXX = 0.0;
	// 	angleYY = 0.0;
	// 	angleZZ = 0.0;
	// 	sx = 1.0;
	// 	sy = 1.0;
	// 	sz = 1.0;
	// 	rotationYY_ON = 0;
	// 	rotationYY_DIR = 1;
	// 	rotationYY_SPEED = 1;
	// };      

	document.getElementById("face-culling-button").onclick = function(){
		if( gl.isEnabled( gl.CULL_FACE ) )
			gl.disable( gl.CULL_FACE );
		else
			gl.enable( gl.CULL_FACE );
	};

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

//----------------------------------------------------------------------------
// Running WebGL
//----------------------------------------------------------------------------
function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	loadModels()
	setEventListeners();
	shaderProgram = initShaders( gl );
	//Initializes all different models of objects
	for(var i = 0; i < model_list.length; i++){
		initBuffers(model_list[i]);
	}
	tick();		// A timer controls the rendering / animation
}

//----------------------------------------------------------------------------
// WebGL Initialization
//----------------------------------------------------------------------------
function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		// DEFAULT: The viewport occupies the whole canvas 
		// DEFAULT: The viewport background color is WHITE
		// Drawing the triangles defining the model
		primitiveType = gl.TRIANGLES;
		
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
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

function loadModels(){
	for(var i = 0; i < model_files.length; i++){
		console.log('Loading file',model_files[i])
		model_list[i] = getModelFromFile(model_files[i])
	}
}

function readSingleFile(e) {
	var file = e.target.files[0];
	if (!file) {
	  return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
	  var contents = e.target.result;
	  // Display file content
	  displayContents(contents);
	};
	reader.readAsText(file);
}

function displayContents(contents) {
	var element = document.getElementById('file-content');
	element.innerHTML = contents;
}

function getModelFromFile(filename){

	var vertices = [
		// FRONT FACE
		-0.25, -0.25,  0.25,
		 0.25, -0.25,  0.25,
		 0.25,  0.25,  0.25,
		 0.25,  0.25,  0.25,
		-0.25,  0.25,  0.25,
		-0.25, -0.25,  0.25,
		// TOP FACE
		-0.25,  0.25,  0.25,
		 0.25,  0.25,  0.25,
		 0.25,  0.25, -0.25,
		 0.25,  0.25, -0.25,
		-0.25,  0.25, -0.25,
		-0.25,  0.25,  0.25,
		// BOTTOM FACE 
		-0.25, -0.25, -0.25,
		 0.25, -0.25, -0.25,
		 0.25, -0.25,  0.25,
		 0.25, -0.25,  0.25,
		-0.25, -0.25,  0.25,
		-0.25, -0.25, -0.25,
		// LEFT FACE 
		-0.25,  0.25,  0.25,
		-0.25, -0.25, -0.25,
		-0.25, -0.25,  0.25,
		-0.25,  0.25,  0.25,
		-0.25,  0.25, -0.25,
		-0.25, -0.25, -0.25,
		// RIGHT FACE 
		 0.25,  0.25, -0.25,
		 0.25, -0.25,  0.25,
		 0.25, -0.25, -0.25,
		 0.25,  0.25, -0.25,
		 0.25,  0.25,  0.25,
		 0.25, -0.25,  0.25,
		// BACK FACE 
		-0.25,  0.25, -0.25,
		 0.25, -0.25, -0.25,
		-0.25, -0.25, -0.25,
		-0.25,  0.25, -0.25,
		 0.25,  0.25, -0.25,
		 0.25, -0.25, -0.25,			 
	];

	var colors = [
		// FRONT FACE
		1.00,  0.00,  0.00,
		1.00,  0.00,  0.00,
		1.00,  0.00,  0.00,
		1.00,  1.00,  0.00,
		1.00,  1.00,  0.00,
		1.00,  1.00,  0.00,
		// TOP FACE
		0.00,  0.00,  0.00,
		0.00,  0.00,  0.00,
		0.00,  0.00,  0.00,
		0.50,  0.50,  0.50,
		0.50,  0.50,  0.50,
		0.50,  0.50,  0.50,
		// BOTTOM FACE
		0.00,  1.00,  0.00,
		0.00,  1.00,  0.00,
		0.00,  1.00,  0.00,
		0.00,  1.00,  1.00,
		0.00,  1.00,  1.00,
		0.00,  1.00,  1.00,
		// LEFT FACE
		0.00,  0.00,  1.00,
		0.00,  0.00,  1.00,
		0.00,  0.00,  1.00,
		1.00,  0.00,  1.00,
		1.00,  0.00,  1.00,
		1.00,  0.00,  1.00,
		// RIGHT FACE
		0.25,  0.50,  0.50,
		0.25,  0.50,  0.50,
		0.25,  0.50,  0.50,
		0.50,  0.25,  0.00,
		0.50,  0.25,  0.00,
		0.50,  0.25,  0.00,
		// BACK FACE
		0.25,  0.00,  0.75,
		0.25,  0.00,  0.75,
		0.25,  0.00,  0.75,
		0.50,  0.35,  0.35,
		0.50,  0.35,  0.35,
		0.50,  0.35,  0.35,			 			 
	];
	return new EntityModel(
		DEFAULT_TX,
		DEFAULT_TY,
		DEFAULT_TZ,
		DEFAULT_angleXX,
		DEFAULT_angleYY,
		DEFAULT_angleZZ,
		DEFAULT_SX,
		DEFAULT_SY,
		DEFAULT_SZ,
		vertices,
		colors
	);
}