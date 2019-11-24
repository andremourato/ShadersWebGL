
class EntityModel {
    constructor(tx,ty,tz,angleXX,angleYY,angleZZ,scale,vertices,colors){
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleXX = angleXX
        this.angleYY = angleYY
        this.angleZZ = angleZZ
        this.scale = scale
        this.vertices = null ? [] : vertices
        this.colors = null ? [] : colors
        this.pMatrix = null
        this.mvMatrix = null
    }
}