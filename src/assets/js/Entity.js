
class Entity {
    constructor(tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,vertices,texCoords,indices,texture){
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleXX = angleXX
        this.angleYY = angleYY
        this.angleZZ = angleZZ
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.vertices = vertices
        this.texCoords = texCoords
        this.indices = indices
        this.texture = texture
    }
}