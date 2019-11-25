const express = require('express')
const fs = require('fs');
var cors = require('cors');
const app = express()
app.use(cors()); 

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
      var contents = fs.readFileSync(file, 'utf8').toString().split('\r\n');
      var num_lines = parseInt(contents[0])
      var half_point = num_lines / 2
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
      //console.log(contents)
      body.models.push(model)
      //console.log(body.models)
    });
    res.send(body)
	});
})

app.get('/scenes', function (req, res) {
  var body = {
    scenes: []
  }
  var directoryPath = 'assets/scenes/'
	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		} 
    console.log(files)
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
        scene.objects.push({
          tx: obj[0],
          ty: obj[1],
          tz: obj[2],
          angleXX: obj[3],
          angleYY: obj[4],
          angleZZ: obj[5],
          sx: obj[6],
          sy: obj[7],
          sz: obj[8],
          modelName: obj[9],
        })
      }
      body.scenes.push(scene)
    });
    res.send(body)
	});
})

 
app.listen(8000)