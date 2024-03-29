//////////////////////////////////////////////////////////////////////////////
//
//  Mathematical functions 
//
//  Ref. Original code from the Angel / Shreiner examples
//	
//	Additional functions by J. Madeira - Sep./Oct. 2015
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Helper functions
//

function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2Math()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

function vec3Math()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

function vec4Math()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2Math()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec2Math( v[0],  0.0 ),
            vec2Math(  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec2Math(v) );  v.splice( 0, 2 );
        m.push( vec2Math(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat3Math()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec3Math( v[0],  0.0,  0.0 ),
            vec3Math(  0.0, v[0],  0.0 ),
            vec3Math(  0.0,  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec3Math(v) );  v.splice( 0, 3 );
        m.push( vec3Math(v) );  v.splice( 0, 3 );
        m.push( vec3Math(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat4Math()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec4Math( v[0], 0.0,  0.0,   0.0 ),
            vec4Math( 0.0,  v[0], 0.0,   0.0 ),
            vec4Math( 0.0,  0.0,  v[0],  0.0 ),
            vec4Math( 0.0,  0.0,  0.0,  v[0] )
        ];
        break;

    default:
        m.push( vec4Math(v) );  v.splice( 0, 4 );
        m.push( vec4Math(v) );  v.splice( 0, 4 );
        m.push( vec4Math(v) );  v.splice( 0, 4 );
        m.push( vec4Math(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal( u, v )
{
    if ( u.length != v.length ) { return false; }
   
    if ( u.matrix && v.matrix ) {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) { return false; }
            for ( var j = 0; j < u[i].length; ++j ) {
                if ( u[i][j] !== v[i][j] ) { return false; }
            }
        }
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        return false;
    }
    else {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i] !== v[i] ) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "add(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] + v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "add(): trying to add matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "add(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] + v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function subtract( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "subtract(): trying to subtract matrices" +
                " of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "subtract(): trying to subtact matrices" +
                    " of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] - v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "subtact(): trying to subtact  matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "subtract(): vectors are not the same length";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] - v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function mult( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "mult(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "mult(): trying to add matrices of different dimensions";
            }
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( [] );

            for ( var j = 0; j < v.length; ++j ) {
                var sum = 0.0;
                for ( var k = 0; k < u.length; ++k ) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push( sum );
            }
        }

        result.matrix = true;

        return result;
    }
    else {
        if ( u.length != v.length ) {
            throw "mult(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] * v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    if ( !m.matrix ) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [];
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = true;
    
    return result;
}

//----------------------------------------------------------------------------
//
//  Helper function: Column-major 1D representation
//

function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------
//
//  To get the number of bytes
//

var sizeof = {
    'vec2Math' : new Float32Array( flatten(vec2Math()) ).byteLength,
    'vec3Math' : new Float32Array( flatten(vec3Math()) ).byteLength,
    'vec4Math' : new Float32Array( flatten(vec4Math()) ).byteLength,
    'mat2Math' : new Float32Array( flatten(mat2Math()) ).byteLength,
    'mat3Math' : new Float32Array( flatten(mat3Math()) ).byteLength,
    'mat4Math' : new Float32Array( flatten(mat4Math()) ).byteLength
};

//----------------------------------------------------------------------------
//
//  Constructing the 4 x 4 transformation matrices - J. Madeira 
//

function rotationXXMatrix( degrees )
{
	m = mat4Math();
	
	m[1][1] = Math.cos( radians( degrees ) );
	
	m[1][2] = -Math.sin( radians( degrees ) );
	
	m[2][1] = Math.sin( radians( degrees ) );
	
	m[2][2]	= Math.cos( radians( degrees ) )
	
	return m;	
}

function rotationYYMatrix( degrees )
{
	m = mat4Math();
	
	m[0][0] = Math.cos( radians( degrees ) );
	
	m[0][2] = Math.sin( radians( degrees ) );
	
	m[2][0] = -Math.sin( radians( degrees ) );
	
	m[2][2]	= Math.cos( radians( degrees ) )
	
	return m;	
}

function rotationZZMatrix( degrees )
{
	m = mat4Math();
	
	m[0][0] = Math.cos( radians( degrees ) );
	
	m[0][1] = -Math.sin( radians( degrees ) );
	
	m[1][0] = Math.sin( radians( degrees ) );
	
	m[1][1]	= Math.cos( radians( degrees ) )
	
	return m;	
}

function scalingMatrix( sx, sy, sz )
{
	m = mat4Math();
	
	m[0][0] = sx;
	
	m[1][1] = sy;
	
	m[2][2] = sz;	
	
	return m;	
}

function translationMatrix( tx, ty, tz )
{
	m = mat4Math();
	
	m[0][3] = tx;
	
	m[1][3] = ty;
	
	m[2][3] = tz;	
	
	return m;	
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators - Angel / Shreiner
//

function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4Math();
    
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4Math();
    
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}
