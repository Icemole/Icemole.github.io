/**
 * GPC Project
 * Author: Nahuel Unai Roselló Beneitez
 */

// SI REFLECTOR NO FUNCIONA: USAR https://stackoverflow.com/questions/28630097/flip-mirror-any-object-with-three-js

// Important stuff
var renderer, scene, camera
var sceneWidthX, sceneWidthZ
var scenery, mirrorScenery

// Player variables and constants (player states)
var player, mirrorPlayer
var left = false, right = false, straight = false, backwards = false
const STATE_WALKING = 1, STATE_IDLE = 0
var previousState
var playerAngle = 0, playerSpeed = 10
var mixers, actions, animationWalking, animationIdle  // Animation stuff

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
    renderer.shadowMapEnabled = true
    // renderer.autoClear = false  // Multiple cameras

    // Add the renderer to the canvas
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Create the scene
    scene = new THREE.Scene()

    // Create the camera
    let aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angle, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000)
    camera.position.set(0, 8, 0)

    scene.add(camera)
    scene.add(new THREE.AxesHelper(10))

    // Create the camera controller and link it to the camera
    // cameraController = new THREE.OrbitControls(camera, renderer.domElement)
    // The target will be set when initializing the player
    // cameraController.target.set(-1, 10, 0)
    camera.lookAt(new THREE.Vector3(-1, 8, 0))
    
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

    // let mirrorGeometry = new THREE.PlaneBufferGeometry(100, 100)
    // let verticalMirror = new Reflector(mirrorGeometry, {
    //     clipBias: 0.003,
    //     textureWidth: window.innerWidth * window.devicePixelRatio,
    //     textureHeight: window.innerHeight * window.devicePixelRatio,
    //     color: 0x889999
    // });
    // verticalMirror.position.x = -100
    // verticalMirror.rotation.y = Math.PI / 2
    // scene.add(verticalMirror)

    let textureLoader = new THREE.TextureLoader()
    let playerTexture = textureLoader.load("modelos/minecraft-steve-threejs/Steve.png")
    playerTexture.magFilter = THREE.LinearFilter
    playerTexture.minFilter = THREE.LinearFilter


    let geometryHitboxVertical = new THREE.BoxGeometry(2, 8, 2)
    let geometryHitboxHorizontal = new THREE.BoxGeometry(1.25, 1.25, 8)

    player = new THREE.Object3D()
    mirrorPlayer = new THREE.Object3D()
    previousState = STATE_IDLE
    let gltfLoader = new THREE.GLTFLoader()
    gltfLoader.load("modelos/minecraft-steve-animated.glb",
                    function(loadedModel) {
                        animationWalking = []
                        animationIdle = []
                        mixer = new THREE.AnimationMixer(loadedModel.scene)
                        idleIndex = walkingIndex = 0
                        for (i = 0; i < loadedModel.animations.length; i++) {
                            let clip = loadedModel.animations[i]
                            if (clip.name.endsWith("idle")) {
                                animationIdle[idleIndex] = mixer.clipAction(clip)
                                animationIdle[idleIndex].clampWhenFinished = true
                                animationIdle[idleIndex].play()  // First, play idle.
                                idleIndex++
                            } else {  // endsWith("walk")
                                animationWalking[walkingIndex] = mixer.clipAction(clip)
                                animationWalking[walkingIndex].clampWhenFinished = true
                                walkingIndex++
                            }
                        }
                        loadedModel.scene.rotation.y = Math.PI

                        
                        // player.add(loadedModel.scene)
                        mirrorPlayer.add(loadedModel.scene)
                        // mirrorPlayer = player.clone()
                        
                        mirrorScenery.add(mirrorPlayer)
                    })


    let floor = new THREE.Mesh(geometryFloor, materialFloor)
    floor.receiveShadow = true
    
    scenery = new THREE.Object3D()
    scenery.add(floor)
    mirrorScenery = scenery.clone()
    mirrorScenery.position.x = -200
    

    scenery.add(player)
    scene.add(scenery)
    scene.add(mirrorScenery)

    let ambientLight = new THREE.AmbientLight(0x606060)
    scene.add(ambientLight)

    let hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 1)
    hemisphereLight.position.set(0, 50, 0)
    scene.add(hemisphereLight)

    let spotLight = new THREE.SpotLight(0xFFFFFF)
    spotLight.position.set(player.position.x, 50, player.position.z)
    spotLight.target.position.set(player.position.x, player.position.y, player.position.z)
    scene.add(spotLight)
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
        // playerAngle += 0.02
        playerAngle += 0.1
    }
    if (right) {
        // playerAngle -= 0.02
        playerAngle -= 0.1
    }
    player.rotation.y = playerAngle
    camera.rotation.y = playerAngle + Math.PI / 2

    let delta = clock.getDelta()

    player.position.x += (Number(backwards) - Number(straight)) * Math.cos(playerAngle) * delta * playerSpeed
    player.position.z += (Number(straight) - Number(backwards)) * Math.sin(playerAngle) * delta * playerSpeed

    if (mirrorPlayer != null) {
        mirrorPlayer.rotation.y = -player.rotation.y + Math.PI
        mirrorPlayer.position.z = player.position.z
        mirrorPlayer.position.x = -player.position.x
    }
    // camera.position.x = player.position.x - 0.9 * Math.cos(playerAngle)
    // camera.position.z = player.position.z + 0.9 * Math.sin(playerAngle)
    camera.position.x = player.position.x - Math.cos(playerAngle) + 30
    camera.position.z = player.position.z + Math.sin(playerAngle)
    // console.log(playerAngle)
    // console.log(-Math.cos(playerAngle), 10, Math.sin(playerAngle))
    // camera.lookAt(new THREE.Vector3(-Math.cos(playerAngle), 10, Math.sin(playerAngle)))

    stats.update()

    let currentState = Number(backwards || straight)
    if (currentState != previousState) {
        let animationToStop, animationToStart
        if (currentState == STATE_IDLE) {
            animationToStop = animationWalking
            animationToStart = animationIdle
        } else {  // currentState == STATE_WALKING
            animationToStop = animationIdle
            animationToStart = animationWalking
        }

        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_morph.html
        // Stop the previous animation
        for (i = 0; i < animationToStop.length; i++) {
            animationToStop[i].fadeOut(0.5)
        }
        // Start the current animation
        for (i = 0; i < animationToStop.length; i++) {
            animationToStart[i].reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.5).play()
        }
    }
    previousState = currentState

    // Update the animations.
    if (mixer) {
        mixer.update(delta)
    }
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