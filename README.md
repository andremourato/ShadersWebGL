# ShadersWebGL

### Introduction
The objective of this project was to learn and create
shaders not used in the class. We created a program which
lets you dynamically change the state of a scene with
several objects on display, in which you can apply a set of
predefined shaders and visualize the effects in real time.
WebGL Shaders allows
the user to dynamically change the position of a light
source in the Shadows mode, change the texture and the
fog of the objects dynamically in the Textures and Fog
mode. User can move the camera freely in both modes.


## Screenshots

#### Shadows
In Shadows mode you can observe phong lightning
locally on each object surface and shadows of the objects
dynamically changing as the light source moves across the
room.

<img  width="600" src="https://user-images.githubusercontent.com/23279460/80324271-f2fd2580-8827-11ea-9be0-b907c6c39efc.png" alt="alt text" >

#### Textures and Fog
In Textures and Fog mode you can use dropdowns to
select which object you want to change and apply a new
texture for each object, from the list of available textures.
A new texture can be added by placing an image in the
folder src/assets/textures. Once the page is refreshed the
texture will be available.
In Textures and Fog mode you can use dropdowns to
select which object you want to change and apply a new
texture for each object, from the list of available textures.
A new texture can be added by placing an image in the
folder src/assets/textures. Once the page is refreshed the
texture will be available.

<img  width="600" src="https://user-images.githubusercontent.com/23279460/80324269-f1cbf880-8827-11ea-86f8-bdacbff2bf57.png" alt="alt text" >
<img  width="600" src="https://user-images.githubusercontent.com/23279460/80324268-f0023500-8827-11ea-8ee6-84a7e5d3c42b.png" alt="alt text" >

## Prerequisites
NodeJS </br>
NPM (Node Package Manager) 

## Installing prerequisites (skip if already installed)
```
sudo npm cache clean -f
sudo npm install -g n
sudo n 12.13.0
```

## Installing dependencies
```
cd src
npm i
```

## Running Server
```
cd src
npm run server
```
Finally, open the <b><i>index.html</i></b> file
</br>
</br></br>
