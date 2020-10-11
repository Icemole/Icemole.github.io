/**
 * Proyecto GPC
 * Autor: Nahuel Unai Roselló Beneitez
 */

var renderer, scene, camera

init()
render()

function init() {
    // Create the renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0xCEF5F3))
    // renderer.autoClear = false  // Multiple cameras

    // Add the renderer to the canvas
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Create the scene
    scene = new THREE.Scene()

    // Create the camera
    let aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angle, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000)
    // camera.position.set(0, 0, 0)
    scene.add(camera)
    scene.add(new THREE.AxesHelper(10))

    // Create the camera controller and link it to the camera
    cameraController = new THREE.OrbitControls(camera, renderer.domElement)
    cameraController.target.set(0, 10, 0)

    window.addEventListener("resize", resize)
}

function loadScene() {
    let loader = new THREE.ObjectLoader()
    loader.load("modelos/minecraft-steve/minecraft-steve.json",
                function(loadedModel) {
                    scene.add(loadedModel)
                })
}

function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}

function update() {

}

function resize() {
    // Indicate to the renderer the new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Update the camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}