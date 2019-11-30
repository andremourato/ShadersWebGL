const express = require('express')
const fs = require('fs');
var cors = require('cors');
const app = express()
app.use(cors()); 

app.use('/static', express.static('assets/textures'))

app.get('/textures', function (req, res) {
  var body = {
    textures: []
  }
  var directoryPath = 'assets/textures/'
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
    }
    body.textures = files
    res.send(body)
	});
})

app.get('/models_json', function (req, res) {
  var body = {
    models: []
  }
  var directoryPath = 'assets/modelsJson/'
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
    } 
		//listing all files using forEach
		files.forEach(function (file) {
      // Do whatever you want to do with the file
      file = directoryPath + file
      console.log('Loaded model from',file);
      let rawdata = fs.readFileSync(file);
      let model = JSON.parse(rawdata);
      model.meshes.forEach(x => {
        x.indices = x.faces.flat()
        if(x.texturecoords){
          x.texturecoords = x.texturecoords[0]
        }
      })
      model.meshes.forEach(x => body.models.push(x))
    });
    res.send(body)
	});
})

app.get('/models_obj', function (req, res) {
  var body = {
    models: []
  }
  var directoryPath = 'assets/modelsOBJ/'
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
    } 

		files.forEach(function (file) {
      //   // Do whatever you want to do with the file
      var model = {
        name: null,
        vertices: [],
        normals: [],
        texturecoords: [],
        faces: [],
      }
      file = directoryPath + file
      console.log('Loaded model from',file);
      //listing all files using forEach
      var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(file)
      });
      var contents = fs.readFileSync(file, 'utf8').toString().split(/[\n\r]/).filter(x => x.length != 0)
      contents.forEach( (line) => {
        line = line.trim().replace(/\s\s+/g, ' ')
        var line_split = line.split(' ')
        if(line_split[0] == 'v'){
          model.vertices.push(parseFloat(line_split[1]))
          model.vertices.push(parseFloat(line_split[2]))
          model.vertices.push(parseFloat(line_split[3]))
        }
        else if(line_split[0] == 'vn'){
          // console.log(line_split)
          model.normals.push(parseFloat(line_split[1]))
          model.normals.push(parseFloat(line_split[2]))
          model.normals.push(parseFloat(line_split[3]))
        }else if(line_split[0] == 'vt'){
          // console.log(line_split)
          model.texturecoords.push(parseFloat(line_split[1]))
          model.texturecoords.push(parseFloat(line_split[2]))
          model.texturecoords.push(parseFloat(line_split[3]))
        }else if(line_split[0] == 'f'){
          for(var i = 1; i < line_split.length;i++){
            model.faces.push(line_split[i].split('/').map(x => parseInt(x)))
          }
        } else if(line_split[0] == 'o'){
          model.name = line_split[1]
        }
      });
      body.models.push(model)
    });
    res.send(body)
	});
})



app.get('/models', function (req, res) {
  var body = {
    models: []
  }
  var directoryPath = 'assets/models/'
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
    } 
		//listing all files using forEach
		files.forEach(function (file) {
      var originalFile = file
      // Do whatever you want to do with the file
      file = directoryPath + file
      console.log('Loaded model from',file);
      var contents = fs.readFileSync(file, 'utf8').toString().split('\n');
      var num_lines = parseInt(contents[0])
      var half_point = num_lines
      var model = {
        name: originalFile.split('.')[0],
        vertices: [],
        colors: []
      }
      for(var i = 1; i <= half_point; i++){
        contents[i].trim().split(' ').map(x => parseFloat(x)).forEach(e => model.vertices.push(e))
      }
      for(var i = half_point+1; i < contents.length-1; i++){
        contents[i].trim().split(' ').map(x => parseFloat(x)).forEach(e => {model.colors.push(e)})
      }
      model.indices = null
      body.models.push(model)
    });
    res.send(body)
	});
})


app.get('/scenes', function (req, res) {
  var directoryPath = 'assets/scenes/'
  //Reads the scenes from files
  var body = {
    scenes: []
  }
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		} 
		//listing all files using forEach
		files.forEach(function (file) {
      var originalFile = file
      // Do whatever you want to do with the file
      file = directoryPath + file
      console.log('Loaded scene from',file);
      var contents = fs.readFileSync(file, 'utf8').toString().split('\n');
      var num_objects = contents.length
      var scene = {
        name: originalFile.split('.')[0],
        objects:[]
      }
      for(var i = 0; i < num_objects; i++){
        var obj = contents[i].trim().split(' ')
        var newObj = {
          tx: parseFloat(obj[0]),
          ty: parseFloat(obj[1]),
          tz: parseFloat(obj[2]),
          angleXX: parseFloat(obj[3]),
          angleYY: parseFloat(obj[4]),
          angleZZ: parseFloat(obj[5]),
          sx: parseFloat(obj[6]),
          sy: parseFloat(obj[7]),
          sz: parseFloat(obj[8]),
          name: obj[9],
          texture: obj[10]
        }
        if(obj.length == 14){
          newObj.R = parseFloat(obj[11])
          newObj.G = parseFloat(obj[12])
          newObj.B = parseFloat(obj[13])
        }
        scene.objects.push(newObj)
      }
      body.scenes.push(scene)
    });
    res.send(body)
	});
})

 
app.listen(8000)