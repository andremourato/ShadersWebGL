
class Entity {
    constructor(tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,model){
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleXX = angleXX
        this.angleYY = angleYY
        this.angleZZ = angleZZ
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.model = model
        this.triangleVertexPositionBuffer = null
        this.triangleVertexColorBuffer = null
    }
}