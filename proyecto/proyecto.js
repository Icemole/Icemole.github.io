/**
 * GPC Project
 * Author: Nahuel Unai Roselló Beneitez
 */

// Important stuff
var renderer, scene, camera
var floorWidthX = 200, floorWidthZ
var scenery, mirrorScenery
var raycaster, mouse = {x: 0, y: 0}

// Player variables and constants (player states)
var player, mirrorPlayer, leftArm
var left = false, right = false, straight = false, backwards = false
const STATE_IDLE = 0, STATE_WALKING = 1
var sprinting = false, canMine = false, trespassedMirror = false
var previousState
var playerAngle = 0, playerSpeed = 10, playerSpeedSprinting = 20
var mixer, animationWalking, animationIdle  // Animation stuff
var flashLight
var gotAchievementOneBlock = false, gotAchievementTenBlocks = false

// Environment variables
var pickaxe, informationPanel, miningCube  //, spotLight
var counter, counterDiv
var trees = [], treeModel, treeMixers, treeAnimations, numTrees = 6, treeId = 0
var clouds = [], cloudMaterial, cloudGeometry
var environment

// FPS stats
var stats

// GUI
var guiController

// Clock (keeps track of update() delta)
var clock


init()
loadScene()
setupGUI()
render()

function init() {
    floorWidthX = 200
    floorWidthZ = 200

    // Create the renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0xCEF5F3))
    renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // renderer.autoClear = false

    // Add the renderer to the canvas
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Create the scene
    scene = new THREE.Scene()

    // Create the camera
    let aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angle, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000)
    camera.position.set(0, 8, 0)
    camera.lookAt(new THREE.Vector3(-1, 8, 0))
    scene.add(camera)
    
    // Display interesting stats such as FPS
    stats = new Stats()
	stats.setMode(0)
	// stats.domElement.style.position = "absolute"
	// stats.domElement.style.top = "300px"
	// stats.domElement.style.left = "0px"
    document.getElementById("canvas").appendChild(stats.domElement)

    clock = new THREE.Clock()
    clock.start()

    raycaster = new THREE.Raycaster()
    
    window.addEventListener("resize", resize)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    // https://riptutorial.com/three-js/example/17088/object-picking---raycasting
    renderer.domElement.addEventListener("click", raycast, false)
}

function loadScene() {
    cloudMaterial = new THREE.MeshLambertMaterial({color: "white", opacity: 0.75, transparent: true})
    // cloudGeometry = new THREE.SphereGeometry(20)
    cloudGeometry = new THREE.CubeGeometry(20, 20, 20)
    addCloud()
    // Añadir una nube cada [5, 15] segundos
    setInterval(function() {
        setTimeout(function() {
            addCloud()
        }, Math.random() * 10000)
    }, 5000)

    // Cargar el mapa de entorno
    let cubeTextureLoader = new THREE.CubeTextureLoader()
    cubeTextureLoader.setPath("texturas/cubemap/")
    let background = cubeTextureLoader.load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"])
    background.magFilter = THREE.LinearFilter
    background.minFilter = THREE.LinearFilter
    let shader = THREE.ShaderLib.cube
    shader.uniforms.tCube.value = background
    let wallsMaterial = new THREE.ShaderMaterial({fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: shader.uniforms, depthWrite: false, side: THREE.BackSide})
    environment = new THREE.Mesh(new THREE.CubeGeometry(1000, 1000, 1000), wallsMaterial)
    environment.position.y = 150
    scene.add(environment)

    let ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    // let directionalLight = new THREE.DirectionalLight(0x8A8A8A)
    // directionalLight.castShadow = true
    // directionalLight.shadow.camera.near = 1
    // directionalLight.shadow.camera.far = 10000
    // scene.add(directionalLight)
    let pointLight = new THREE.PointLight(0xAAAAAA)  // mrw I have to finish this
    pointLight.position.set(-200, 50, -50)
    pointLight.castShadow = true
    pointLight.shadow.camera.near = 1
    pointLight.shadow.camera.far = 10000
    // pointLight.shadow.bias = 0.0001
    pointLight.shadow.radius = 4
    scene.add(pointLight)

    // let hemisphereLight = new THREE.HemisphereLight(0x404040, 0x606060, 1)
    // hemisphereLight.position.set(0, 50, 0)
    // scene.add(hemisphereLight)

    let textureLoader = new THREE.TextureLoader()
    let floorTexture = textureLoader.load("texturas/floor.jpg")
    floorTexture.magFilter = THREE.LinearFilter
    floorTexture.minFilter = THREE.LinearFilter
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
    floorTexture.repeat = new THREE.Vector2(4, 4)
    let floorMaterial = new THREE.MeshLambertMaterial({color: "white", map: floorTexture})
    let floorGeometry = new THREE.BoxGeometry(floorWidthX, 0, floorWidthZ, 20, 20)
    let floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.receiveShadow = true

    // Create the pickaxe and the first pink information panel
    let pickaxeTexture = textureLoader.load("texturas/pickaxe.png")
    pickaxeTexture.magFilter = THREE.LinearFilter
    pickaxeTexture.minFilter = THREE.LinearFilter
    let pickaxeMaterial = new THREE.MeshPhongMaterial({color: "white", map: pickaxeTexture, side: THREE.DoubleSide, shininess: 50, transparent: true})
    let pickaxeGeometry = new THREE.PlaneGeometry(6, 6, 10, 10)
    pickaxe = new THREE.Mesh(pickaxeGeometry, pickaxeMaterial)
    pickaxe.position.y = 0
    pickaxe.position.x = -150
    scene.add(pickaxe)
    let informationTexture = textureLoader.load("texturas/info-goto.png")
    informationTexture.magFilter = THREE.LinearFilter
    informationTexture.minFilter = THREE.LinearFilter
    let informationMaterial = new THREE.MeshPhongMaterial({color: "white", map: informationTexture, side: THREE.DoubleSide, shininess: 50, transparent: true})
    let informationGeometry = new THREE.PlaneGeometry(4, 4, 100, 100)
    informationPanel = new THREE.Mesh(informationGeometry, informationMaterial)
    informationPanel.position.y = 20
    informationPanel.position.x = -50
    scene.add(informationPanel)
    
    // Create the player and the mirror player
    player = new THREE.Object3D()
    mirrorPlayer = new THREE.Object3D()
    previousState = STATE_IDLE
    let gltfLoader = new THREE.GLTFLoader()
    gltfLoader.load("modelos/minecraft-steve-animated.glb",
                    function(loadedModel) {
                        // Put a shadow to the model.
                        // https://stackoverflow.com/questions/49869345/how-to-cast-a-shadow-with-a-gltf-model-in-three-js
                        loadedModel.scene.traverse(function(node) {
                            if (node.isMesh) {
                                if (node.name == "Steve_LArm") {
                                    leftArm = node
                                }
                                node.castShadow = true
                                node.receiveShadow = true
                                node.material.side = THREE.FrontSide
                            }
                        })
                        animationWalking = []
                        animationIdle = []
                        mixer = new THREE.AnimationMixer(loadedModel.scene)
                        idleIndex = walkingIndex = 0
                        for (i = 0; i < loadedModel.animations.length; i++) {
                            let clip = loadedModel.animations[i]
                            if (clip.name.endsWith("idle")) {
                                animationIdle[idleIndex] = mixer.clipAction(clip)
                                animationIdle[idleIndex].clampWhenFinished = true
                                animationIdle[idleIndex].play()  // Play idle animation first
                                idleIndex++
                            } else {  // endsWith("walk")
                                animationWalking[walkingIndex] = mixer.clipAction(clip)
                                animationWalking[walkingIndex].clampWhenFinished = true
                                walkingIndex++
                            }
                        }
                        loadedModel.scene.rotation.y = Math.PI
                        player.add(loadedModel.scene)
                        mirrorPlayer.add(loadedModel.scene)
                        scene.add(mirrorPlayer)
                    })
    
    treeMixers = []
    treeAnimations = []
    gltfLoader.load("modelos/tree-animated.glb",
                    function(loadedTreeModel) {
                        treeModel = loadedTreeModel
                        for (let i = 0; i < numTrees; i += 2) {
                            addTree()
                        }
                    })
    
    scene.add(floor)
    floor2 = floor.clone()
    floor2.position.x = -200
    scene.add(floor2)
    scene.add(player)

    // Flashlight
    flashLight = new THREE.SpotLight(0xFFFFFF)
    flashLight.castShadow = true
    flashLight.position.set(0, 7, 0)
    flashLight.target.position.set(-1, 6.9, 0)
    flashLight.shadow.mapSize.width = 1024
    flashLight.shadow.mapSize.height = 1024
    // flashLight.shadow.bias = 0.00005
    player.add(flashLight.target)
    player.add(flashLight)
    flashLight.angle = Math.PI / 24
    flashLight.shadow.camera.near = 1
    flashLight.shadow.camera.far = 1000
    flashLight.visible = false
    // flashLight.shadow.camera.fov = 30

    // Mining cube
    let miningCubeGeometry = new THREE.BoxGeometry(4, 4, 4)
    let miningCubeMaterial = new THREE.MeshPhongMaterial({color: "white", shininess: 200, side: THREE.FrontSide})
    miningCube = new THREE.Mesh(miningCubeGeometry, miningCubeMaterial)
    miningCube.position.x = -100
    miningCube.position.y = 2
    miningCube.castShadow = true
    miningCube.receiveShadow = true
    miningCube.name = "mining cube"
    scene.add(miningCube)
    miningCube.visible = false
    
    // Spotlight
    // let spotLight = new THREE.SpotLight(0xFFFFFF)
    // spotLight.position.set(0, 20, 0)
    // spotLight.castShadow = true
    // spotLight.shadow.mapSize.width = 1024
    // spotLight.shadow.mapSize.height = 1024
    // spotLight.angle = Math.PI / 10
    // spotLight.shadow.camera.near = 1
    // spotLight.shadow.camera.far = 80
    // miningCube.add(spotLight)
    // let spotLightHelper = new THREE.SpotLightHelper(spotLight)
    // miningCube.add(spotLightHelper)
    // spotLight.shadow.camera.fov = 30
    // spotLight.visible = false

    // let debug = new THREE.AxesHelper(10)
    // debug.position.y = 5
    // scene.add(debug)
    
    counter = 0
    counterDiv = document.createElement("div")
    counterDiv.style.width = 100;
    counterDiv.style.height = 100;
    counterDiv.style.backgroundColor = "green";
    counterDiv.style.color = "white"
    counterDiv.innerHTML = "<b>" + counter + "</b>";
    counterDiv.style.position = "fixed"
    counterDiv.style.top = 0;
    counterDiv.style.right = 0;
    counterDiv.style.fontSize = "x-large"
}

function setupGUI() {
    guiController = {
        addTree: function() {
            addTree()
        },
        removeTree: function() {
            removeTree()
        },
        addOrRemoveEnvMap: function() {
            environment.visible = !environment.visible
        }
    }

    let gui = new dat.GUI()
    let h = gui.addFolder("Árboles")
    h.add(guiController, "addTree").name("Añadir árbol")
    h.add(guiController, "removeTree").name("Quitar árbol")
    let i = gui.addFolder("Mapa de entorno")
    i.add(guiController, "addOrRemoveEnvMap").name("Activar/desactivar mapa de entorno")
}

function addTree() {
    // Create the tree
    let tree = treeModel.scene.clone()
    tree.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
            node.material.side = THREE.FrontSide
        }
    })
    trees[treeId] = tree
    // Animate the tree
    treeMixers[treeId] = new THREE.AnimationMixer(tree)
    treeAnimations[treeId] = treeMixers[treeId].clipAction(treeModel.animations[0])
    let animationTimeout = Math.random() * 5000
    setTimeout(function(id) {  // Closures are OP dude
        return function() {
            treeAnimations[id].play()
        }
    }(treeId), animationTimeout)
    // Set the tree's position
    tree.position.x = Math.random() * 200 - 100
    tree.position.z = Math.random() * 200 - 100
    let scale = Math.random() * 15 + 10
    tree.scale.set(scale, scale, scale)
    tree.position.y = scale / 2 - 1
    tree.name = "tree" + treeId++
    scene.add(tree)
    
    // Create the mirror tree
    let mirrorTree = treeModel.scene.clone()
    mirrorTree.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
            node.material.side = THREE.FrontSide
        }
    })
    trees[treeId] = mirrorTree
    // Animate the mirror tree
    treeMixers[treeId] = new THREE.AnimationMixer(mirrorTree)
    treeAnimations[treeId] = treeMixers[treeId].clipAction(treeModel.animations[0])
    setTimeout(function(id) {
        return function() {
            treeAnimations[id].play()
        }
    }(treeId), animationTimeout)
    // Set the mirror tree in the tree's mirror position
    mirrorTree.position.x = -200 - tree.position.x
    mirrorTree.position.z = tree.position.z
    mirrorTree.scale.set(scale, scale, scale)
    mirrorTree.position.y = scale / 2 - 1
    scene.add(mirrorTree)
    mirrorTree.name = "tree" + treeId++
}

function removeTree() {
    // Remove the tree and its mirror one
    scene.remove(trees[treeId - 1])
    scene.remove(trees[treeId - 2])
    trees.pop()
    trees.pop()
    treeMixers.pop()
    treeMixers.pop()
    treeAnimations.pop()
    treeAnimations.pop()
    // treeMixers[treeId - 1] = null
    // treeMixers[treeId - 2] = null
    // treeAnimations[treeId - 1] = null
    // treeAnimations[treeId - 2] = null
    treeId -= 2
}

function addCloud() {
    // Create the cloud
    let cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
    cloud.castShadow = true
    let scaleX = Math.random() + 0.25
    let scaleY = Math.random() * 0.1 + 0.25
    let scaleZ = Math.random() + 0.25
    cloud.scale.set(scaleX, scaleY, scaleZ)
    cloud.position.x = Math.random() * 200 - 100
    cloud.position.y = Math.random() * 20 + 50
    cloud.position.z = -100
    let velocity = Math.random() * 10 + 5
    cloud.velocity = velocity
    scene.add(cloud)
    clouds.push(cloud)

    // Create the mirror cloud
    let mirrorCloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
    mirrorCloud.castShadow = true
    mirrorCloud.scale.set(scaleX, scaleY, scaleZ)
    mirrorCloud.position.x = -200 - cloud.position.x
    mirrorCloud.position.y = cloud.position.y
    mirrorCloud.position.z = cloud.position.z
    mirrorCloud.velocity = velocity
    scene.add(mirrorCloud)
    clouds.push(mirrorCloud)
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
        playerAngle += 0.06
    }
    if (right) {
        // playerAngle -= 0.02
        playerAngle -= 0.06
    }
    player.rotation.y = playerAngle
    camera.rotation.y = playerAngle + Math.PI / 2

    let delta = clock.getDelta()

    player.position.x += (Number(backwards) - Number(straight)) * Math.cos(playerAngle) * delta * (Number(!sprinting) * playerSpeed + Number(sprinting) * playerSpeedSprinting)
    player.position.z += (Number(straight) - Number(backwards)) * Math.sin(playerAngle) * delta * (Number(!sprinting) * playerSpeed + Number(sprinting) * playerSpeedSprinting)
    camera.position.x = player.position.x - Math.cos(playerAngle)
    camera.position.z = player.position.z + Math.sin(playerAngle)
    // The following call is necessary because the player is moving
    flashLight.shadow.update(flashLight)

    // Update mirror player's position
    if (mirrorPlayer != null) {
        mirrorPlayer.rotation.y = -player.rotation.y + Math.PI
        mirrorPlayer.position.z = player.position.z
        mirrorPlayer.position.x = -200 - player.position.x
    }

    // Update other stuff (pickaxe, pink information panel)
    if (!canMine) {
        pickaxe.rotation.y += Math.PI * 32 * delta / 180
        pickaxe.position.y = 8 + Math.cos(clock.getElapsedTime())
    }
    informationPanel.rotation.y += Math.PI * 32 * delta / 180
    informationPanel.position.y = 8 + Math.cos(clock.getElapsedTime())

    // Little achievement when getting the pickaxe
    let px = player.position.x
    let pz = player.position.z
    let ix = informationPanel.position.x
    let iz = informationPanel.position.z
    if (!canMine
        && ix - 5 < px && px < ix + 5
        && iz - 5 < pz && pz < iz + 5) {
            canMine = true
            miningCube.visible = true

            // Create the achievement
            createAchievement("Jugando con reflejos")

            // Put the pickaxe on the player's hand
            // pickaxe.rotation.y = 0
            scene.remove(pickaxe)
            // pickaxe.position.set(0, 0, 0)
            pickaxe.scale.set(0.5, 0.5, 0.5)
            pickaxe.rotation.y = Math.PI / 2
            pickaxe.rotation.x = Math.PI
            // pickaxe.rotation.y = playerAngle
            pickaxe.position.z = -3
            pickaxe.position.y = -1
            pickaxe.position.x = -0.2
            leftArm.add(pickaxe)

            // Put the pink information panel above the cube and change its texture
            scene.remove(informationPanel)
            let informationTexture = new THREE.TextureLoader().load("texturas/info-click.png")
            informationTexture.magFilter = THREE.LinearFilter
            informationTexture.minFilter = THREE.LinearFilter
            informationPanel.material.map = informationTexture
            informationPanel.material.map.needsUpdate = true
            informationPanel.position.y = 10
            informationPanel.position.x = 0
            miningCube.add(informationPanel)
            
            // Add the counter to the top right of the screen
            document.body.appendChild(counterDiv);
        }
    
    // Little achievement when making the mirror player get the pickaxe
    // (making the player get the pickaxe? I don't even know)
    // px, pz already hold the player's position
    let pix = pickaxe.position.x
    let piz = pickaxe.position.z
    if (!canMine
        && pix - 5 < px && px < pix + 5
        && piz - 5 < pz && pz < piz + 5) {
            createAchievement("¿La tienes tú? ¿La tengo yo?")
        }
    
    // Little achievement to check if the player has surpassed the mirror player
    if (!trespassedMirror && mirrorPlayer.position.x > player.position.x) {
        trespassedMirror = true
        createAchievement("Realidad aumentada")
    }

    // Little achievement to celebrate 1 block mined
    if (!gotAchievementOneBlock && counter == 1) {
        gotAchievementOneBlock = true
        createAchievement("Cazador de cubos")
    }

    // Little achievement to celebrate 20 blocks mined
    if (!gotAchievementTenBlocks && counter == 10) {
        gotAchievementTenBlocks = true
        createAchievement("Cinco minutos más, mamá...")
    }

    // Check if the player is leaving the scene boundaries
    if (player.position.x > 100) {
        player.position.x = 100
    }
    if (player.position.x < -300) {
        player.position.x = -300
    }
    if (player.position.z > 100) {
        player.position.z = 100
    }
    if (player.position.z < -100) {
        player.position.z = -100
    }

    // Update the stats
    stats.update()

    // Animate the player according to if it is moving or not
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
    if (treeMixers) {
        for (let i = 0; i < treeMixers.length; i++) {
            if (treeMixers[i]) {
                treeMixers[i].update(delta)
            }
        }
    }

    // Update the clouds
    for (let i = 0; i < clouds.length; i++) {
        clouds[i].position.z += clouds[i].velocity * delta
        if (clouds[i].position.z > 100) {
            // Delete the cloud from the scene
            scene.remove(clouds[i])
            clouds.splice(i, 1)
        }
    }
}

function createAchievement(msg) {
    let achievement = document.createElement("div")
    achievement.style.width = 100
    achievement.style.height = 100
    achievement.style.backgroundColor = "green"
    achievement.style.color = "white"
    achievement.innerHTML = "<b>Logro desbloqueado</b><br>" + msg
    achievement.style.position = "fixed"
    achievement.style.bottom = 0
    achievement.style.right = 0
    achievement.style.fontSize = "x-large"
    document.body.appendChild(achievement)
    setTimeout(function() {
        document.body.removeChild(achievement)
    }, 2000)
}

function resize() {
    // Indicate to the renderer the new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Update the camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

function raycast(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera( mouse, camera )    

    let intersects = raycaster.intersectObjects(scene.children)
    if (canMine && intersects[0].object.name == "mining cube") {
        px = player.position.x
        pz = player.position.z
        cx = intersects[0].object.position.x
        cz = intersects[0].object.position.z
        if (   cx - 20 < px && px < cx + 20
            && cz - 20 < pz && pz < cz + 20) {
            intersects[0].object.material.color.set(Math.random() * 0xFFFFFF)
            intersects[0].object.position.z = Math.random() * 200 - 100
            counter++
            counterDiv.innerHTML = "<b>" + counter + "</b>";
        }
    }
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
    if (keyCode == 16) {  // shift
        sprinting = true
    }
    if (keyCode == 78) {  // n
        flashLight.visible = !flashLight.visible
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
    if (keyCode == 16) {  // shift
        sprinting = false
    }
}