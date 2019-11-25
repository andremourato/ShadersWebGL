
export class EntityModel {
    constructor(tx,ty,tz,angleXX,angleYY,angleZZ,sx,sy,sz,vertices,colors){
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleXX = angleXX
        this.angleYY = angleYY
        this.angleZZ = angleZZ
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.vertices = null ? [] : vertices
        this.colors = null ? [] : colors
    }
}