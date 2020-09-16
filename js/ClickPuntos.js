/**
*	Seminario GPC #1. Hacer click y pintar un punto rojo.
*/

// Shader de vértices
var VSHADER_SOURCE = 
"attribute vec4 posicion;                     \n" + 
"void main() {                                \n" + 
"	gl_Position = posicion;                   \n" + 
"	gl_PointSize = 10.0;                      \n" + 
"}                                            \n"

// Shader de fragmentos
var FSHADER_SOURCE = 
"void main() {                                \n" + 
"	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  \n" + 
"}                                            \n"

function main() {
	// Recuperar el canvas (lienzo)
	var canvas = document.getElementById("canvas")
	
	// Obtener contexto de render (herramientas de dibujo)
	var gl = getWebGLContext(canvas)
	
	// Fijar color de borrado del lienzo
	gl.clearColor(0.0, 0.0, 0.3, 1.0)
	
	// Cargar, compilar y montar los shaders en un 'program'
	// Nota: 'program' := vertex_shader + fragment_shader
	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Shaders could not be loaded.")
		return
	}
	
	gl.clear(gl.COLOR_BUFFER_BIT)
	
	// Enlazar el script con el shader (coordenadas -> posicion)
	var coordenadas = gl.getAttribLocation(gl.program, "posicion")
	
	// Crear el buffer, activarlo y enlazarlo a las coordenadas
	var bufferVertices = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices)
	gl.vertexAttribPointer(coordenadas, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(coordenadas)
	
	// Escuchar eventos de ratón (captura de clic y posición)
	canvas.onmousedown = function(evento) {
		click(evento, gl, canvas, coordenadas)
	}
}

var clics = []
var clics_lineas = []

function click(evento, gl, canvas, coordenadas) {
	// Coordenadas del clic
	var x = evento.clientX
	var y = evento.clientY
	var rect = evento.target.getBoundingClientRect()
	
	// Conversión de coordenadas al sistema de WebGL por defecto:
	// - Cuadrado de 2x2 centrado en el origen:
	//			+------+ (1, 1)
	//			|	   |
	//			|	   |
	// (-1, -1) +------+
	x = ((x - rect.left) - canvas.width / 2) * 2 / canvas.width
	y = (canvas.height / 2 - (y - rect.top)) * 2 / canvas.height
	
	// Guardar coordenadas
	clics.push(x)
	clics.push(y)
	clics.push(0.0)
	
	clics_lineas.push(x)
	clics_lineas.push(y)
	clics_lineas.push(0.0)
	console.log(clics_lineas)
	
	var puntos = new Float32Array(clics)
	var lineas = new Float32Array(clics_lineas)
	
	// Borrar el canvas 
	gl.clear(gl.COLOR_BUFFER_BIT)
	
	// Insertar las coordenadas como atributo y dibujarlos con el buffer
	gl.bufferData(gl.ARRAY_BUFFER, puntos, gl.STATIC_DRAW)
	gl.drawArrays(gl.POINTS, 0, puntos.length / 3)
	
	gl.bufferData(gl.ARRAY_BUFFER, lineas, gl.STATIC_DRAW)
	gl.drawArrays(gl.LINES, 0, puntos.length / 3)
}