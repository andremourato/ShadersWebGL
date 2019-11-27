'use scrict';

var createShaderProgram = function(gl, vertexShaderTxt, fragmentShaderTxt){
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource (vertexShader, vertexShaderTxt);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(framegmentShader, fragmentShaderTxt);
    gl.compileShader(fragmentShaderTxt);
    
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        return { error: "error linking program:" + gl.getProgramInfoLog(program)};
    }

    return program
}

var Camera = function (position, lookAt, up){
    this.forward = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();
    this.position = position;

    vec3.subtract(this.forward, lookAt, this.position);
    vec3.cross(this.right, this.forward, up);
    vec3.cross(this.up, this.right, this.forward);
    vec3.normalize(this.forward, this.forward);
    vec3.normalize(this.right, this.right);
    vec3.normalize(this.up, this.up);
} 

Camera.prototype.GetViewMatrix = function(out){
    var lookAt = vec3.create();
    vec3.add(lookAt, this.position, this.forward);
    mat4.lookAt(out,this.position,lookAt,this.up);
    return out;
}

Camera.prototype.rotateRight = function (rad) {
	var rightMatrix = mat4.create();
	mat4.rotate(rightMatrix, rightMatrix, rad, vec3.fromValues(0, 0, 1));
	vec3.transformMat4(this.forward, this.forward, rightMatrix);
	this._realign();
};

Camera.prototype.moveForward = function(dist){
    vec3.scaleAndAdd(this.position, this.position, this.forward, dist);
}

Camera.prototype.moveRight = function (dist) {
	vec3.scaleAndAdd(this.position, this.position, this.right, dist);
};

Camera.prototype.moveUp = function (dist) {
	vec3.scaleAndAdd(this.position, this.position, this.up, dist);
};