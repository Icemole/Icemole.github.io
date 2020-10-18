/**
 * GPC Project
 * Author: Nahuel Unai Roselló Beneitez
 */

// SI REFLECTOR NO FUNCIONA: USAR https://stackoverflow.com/questions/28630097/flip-mirror-any-object-with-three-js

// Important stuff
var renderer, scene, camera
var sceneWidthX, sceneWidthZ

// Player variables
var player
var left = false, right = false, straight = false, backwards = false
var playerAngle = 0, playerSpeed = 10

// FPS stats
var stats

// Clock (keeps track of update() delta)
var clock


init()
loadScene()
render()

function init() {
    sceneWidthX = 200
    sceneWidthZ = 200

    // Create the renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio( window.devicePixelRatio );
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
    camera.position.set(0, 10, 0)

    scene.add(camera)
    scene.add(new THREE.AxesHelper(10))

    // Create the camera controller and link it to the camera
    // cameraController = new THREE.OrbitControls(camera, renderer.domElement)
    // The target will be set when initializing the player
    // cameraController.target.set(-1, 10, 0)
    camera.lookAt(new THREE.Vector3(-1, 10, 0))
    
    // Display interesting stats such as FPS
    stats = new Stats()
	stats.setMode( 0 )
	// stats.domElement.style.position = "absolute"
	// stats.domElement.style.top = "300px"
	// stats.domElement.style.left = "0px"
    document.getElementById("canvas").appendChild(stats.domElement)

    clock = new THREE.Clock()
    clock.start()
    
    window.addEventListener("resize", resize)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
}

function loadScene() {
    let materialFloor = new THREE.MeshBasicMaterial({color: "green", wireframe: true})
    let geometryFloor = new THREE.BoxGeometry(sceneWidthX, 0, sceneWidthZ)

    let mirrorGeometry = new THREE.PlaneBufferGeometry(100, 100)
    let verticalMirror = new Reflector(mirrorGeometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x889999
    });
    verticalMirror.position.x = -100
    verticalMirror.rotation.y = Math.PI / 2
    scene.add(verticalMirror)
    let kekGeometry = new THREE.PlaneBufferGeometry(100, 100)
    let kekWall = new THREE.Mesh(kekGeometry, materialFloor)
    kekWall.position.x = verticalMirror.position.x
    kekWall.rotation.y = verticalMirror.rotation.y
    // scene.add(kekWall)

    let geometryHitboxVertical = new THREE.BoxGeometry(2, 8, 2)
    let geometryHitboxHorizontal = new THREE.BoxGeometry(1.25, 1.25, 8)

    player = new THREE.Object3D()
    let hitboxVertical = new THREE.Mesh(geometryHitboxVertical, materialFloor)
    hitboxVertical.position.y += 4.5
    let hitboxHorizontal = new THREE.Mesh(geometryHitboxHorizontal, materialFloor)
    hitboxHorizontal.position.y += 6
    let floor = new THREE.Mesh(geometryFloor, materialFloor)
    let loader = new THREE.ObjectLoader()
    loader.load("modelos/minecraft-steve/minecraft-steve.json",
                function(loadedModel) {
                    player.add(loadedModel)
                })
    player.add(hitboxVertical)
    player.add(hitboxHorizontal)

    scene.add(player)
    scene.add(floor)
}

function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}

function update() {
    if (left) {
        playerAngle += 0.02
    }
    if (right) {
        playerAngle -= 0.02
    }
    player.rotation.y = playerAngle
    camera.rotation.y = playerAngle + Math.PI / 2
    let delta = clock.getDelta()
    player.position.x += (Number(backwards) - Number(straight)) * Math.cos(playerAngle) * delta * playerSpeed
    player.position.z += (Number(straight) - Number(backwards)) * Math.sin(playerAngle) * delta * playerSpeed
    camera.position.x = player.position.x
    camera.position.z = player.position.z

    stats.update()
}

function resize() {
    // Indicate to the renderer the new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Update the camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

function onKeyDown(event) {
    let keyCode = event.keyCode
    if (keyCode == 87) {  // w
        straight = true
    }
    if (keyCode == 65) {  // a
        left = true
    }
    if (keyCode == 83) { // s
        backwards = true
    }
    if (keyCode == 68) {  // d
        right = true
    }
}

function onKeyUp(event) {
    let keyCode = event.keyCode
    if (keyCode == 87) {  // w
        straight = false
    }
    if (keyCode == 65) {  // a
        left = false
    }
    if (keyCode == 83) { // s
        backwards = false
    }
    if (keyCode == 68) {  // d
        right = false
    }
}