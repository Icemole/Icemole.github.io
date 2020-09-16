/**
*	Seminario GPC #1. Pintar un rectángulo de azul.
*/

function main() {
	// Recuperar el canvas (lienzo)
	var canvas = document.getElementById("canvas")
	
	// Obtener contexto de render (herramientas de dibujo)
	var gl = getWebGLContext(canvas)
	
	// Fijar color de borrado del lienzo
	gl.clearColor(0.0, 0.0, 0.3, 1.0)
	
	// Borrar el canvas
	gl.clear(gl.COLOR_BUFFER_BIT)
}