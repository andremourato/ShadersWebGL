
class Entity {
    constructor(tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,vertices,normals,texCoords,indices,texture){
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleXX = angleXX
        this.angleYY = angleYY
        this.angleZZ = angleZZ
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.normals = normals
        this.vertices = vertices
        this.texCoords = texCoords
        this.indices = indices
        this.texture = texture
        this.world = mat4.create()
        this.nbo = gl.createBuffer()
        this.vbo = gl.createBuffer()
        this.ibo = gl.createBuffer()
        this.tbo = gl.createBuffer()

        // Computing the Model-View Matrix
        console.log(this.tx,this.ty,this.tz)
        mat4.translate(this.world,this.world,vec4.fromValues(this.tx,this.ty,this.tz))
        //Rotate on the X Axis
        mat4.rotate(this.world,this.world,
            glMatrix.toRadian(this.angleXX),
            vec4.fromValues(1,0,0))
        //Rotate on the Y Axis
        mat4.rotate(this.world,this.world,
            glMatrix.toRadian(this.angleYY),
            vec4.fromValues(0,1,0))
        
        //Rotate on the Z Axis
        mat4.rotate(this.world,this.world,
            glMatrix.toRadian(this.angleZZ),
            vec4.fromValues(0,0,1))

        // //Texture
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}