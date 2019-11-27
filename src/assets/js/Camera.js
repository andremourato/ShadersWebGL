class Camera{
    constructor(fieldOfViewDegrees,aspect,zNear,zFar,
        tx,ty,tz,
        angleX,angleY,angleZ,
        scaleX,scaleY,scaleZ,
        speed){

        this.fieldOfViewDegrees = fieldOfViewDegrees
        this.aspect = aspect
        this.zNear = zNear
        this.zFar = zFar
        this.tx = tx
        this.ty = ty
        this.tz = tz
        this.angleX = angleX
        this.angleY = angleY
        this.angleZ = angleZ
        this.scaleX = scaleX
        this.scaleY = scaleY
        this.scaleZ = scaleZ
        this.speed = speed
    }
}