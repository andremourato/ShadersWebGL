<template>
	<div id="containerDiv" style="text-align: center">
		<canvas id="my-canvas" class="webgl-content" style="border:1px solid #000000;position:absolute;left:0;top:0"></canvas>
	</div>
</template>

<script>
export default {
  mounted(){
    var {runWebGL} = require('~/assets/js/index.js')
    runWebGL()
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
