/**
 * Práctica GPC #2. Robot.
 */

// Variables imprescindibles con nombre predeterminado.
var renderer, scene, camera

var cameraTop, r = 100, t = 100, l = -100, b = -100, n = 0.1, f = 500

// Variables globales.
var esferacubo, angulo = 0

// GUI
var gui

// Controlador del robot
var robotController

// Partes del robot que interaccionan con los controles
var base, brazo, antebrazo, mano, pinzaIzq, pinzaDer

// Control del movimiento del robot
var turnLeft = turnRight = goStraight = goBackwards = false
var w = 87, a = 65, s = 83, d = 68

// Luces
var luzFocal
// Calidad de la sombra arrojada
var shadowQuality

// Acciones
init()
loadScene()
setupGUI()
render()

function resize() {
    // Indicar al motor las nuevas dimensiones del canvas.
    renderer.setSize(window.innerWidth, window.innerHeight)

    let aspectRatio = window.innerWidth / window.innerHeight
    cameraTop.updateProjectionMatrix()

    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()
}

// Crea el motor, la escena y la cámara.
function init() {
    // Crear el motor de render.
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0xFFFFFF))
    renderer.autoClear = false
    renderer.shadowMapEnabled = true

    // Añade el canvas declarado a algún contenedor existente en la página.
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Crear la escena
    scene = new THREE.Scene()

    // Crear la cámara
    var aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angulo_en_grados, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000)
    angle = 90 * Math.PI / 180
    camera.position.set(300, 300, 300)
    scene.add(camera)
    
    // Controlador de cámara.
    cameraController = new THREE.OrbitControls(camera, renderer.domElement)
    cameraController.target.set(0, 100, 0)
    camera.lookAt(0, 100, 0)

    // Cámara de planta.
    cameraTop = new THREE.OrthographicCamera(l, r, t, b, n, f)
    cameraTop.position.set(0, 300, 0)
    cameraTop.lookAt(0, 0, 0)
    
    cameraTop.up = new THREE.Vector3(0, 0, -1)

    window.addEventListener("resize", resize)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
}

// Carga la escena con objetos.
function loadScene() {
    // Declarar texturas.
    var texturaSuelo = new THREE.TextureLoader().load("texturas/paving_stones_color.jpg")
    texturaSuelo.magFilter = THREE.LinearFilter
    texturaSuelo.minFilter = THREE.LinearFilter
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping

    var texturaBrillante = new THREE.TextureLoader().load("texturas/metal_color.jpg")
    texturaSuelo.magFilter = THREE.LinearFilter
    texturaSuelo.minFilter = THREE.LinearFilter
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping

    // Declarar materiales.
    var materialSuelo = new THREE.MeshLambertMaterial({color: "white", map: texturaSuelo})
    var materialMate = new THREE.MeshLambertMaterial({color: "red", shading: THREE.SmoothShading})
    var materialBrillante = new THREE.MeshPhongMaterial({color: "white", specular: "white", shininess: 50, map: texturaBrillante})

    // Declarar geometrías.
    var geometriaSuelo = new THREE.BoxGeometry(1000, 0, 1000)
    var geometriaBase = new THREE.CylinderGeometry(50, 50, 15)
    brazo = new THREE.Object3D()
    var geometriaEje = new THREE.CylinderGeometry(20, 20, 18)
    var geometriaEsparrago = new THREE.BoxGeometry(18, 120, 12)
    var geometriaRotula = new THREE.SphereGeometry(20)
    antebrazo = new THREE.Object3D()
    antebrazo.position.y = 120
    var geometriaDisco = new THREE.CylinderGeometry(22, 22, 6)
    var geometriaNervio = new THREE.BoxGeometry(4, 80, 4)
    var geometriaMano = new THREE.CylinderGeometry(15, 15, 40)
    const geometriaPinza = new THREE.Geometry()
    geometriaPinza.vertices.push(
        new THREE.Vector3(0, -10, -2),  // 0
        new THREE.Vector3(0, 10, -2),   // 1
        new THREE.Vector3(0, 10, 2),    // 2
        new THREE.Vector3(0, -10, 2),   // 3
        new THREE.Vector3(19, -10, -2), // 4
        new THREE.Vector3(19, 10, -2),  // 5
        new THREE.Vector3(19, 10, 2),   // 6
        new THREE.Vector3(19, -10, 2),  // 7
        new THREE.Vector3(38, -5, -1),  // 8
        new THREE.Vector3(38, 5, -1),   // 9
        new THREE.Vector3(38, 5, 1),    // 10
        new THREE.Vector3(38, -5, 1)    // 11
    )
    geometriaPinza.faces.push(
        // Cara trasera (lo más atrás)
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(1, 2, 3),
        // Atrás izquierda
        new THREE.Face3(0, 4, 1),
        new THREE.Face3(1, 4, 5),
        // Atrás abajo
        new THREE.Face3(0, 3, 4),
        new THREE.Face3(3, 7, 4),
        // Atrás derecha
        new THREE.Face3(3, 2, 6),
        new THREE.Face3(3, 6, 7),
        // Atrás arriba
        new THREE.Face3(1, 5, 2, new Vector3(0, 1, 0)),
        new THREE.Face3(2, 5, 6, new Vector3(0, 1, 0)),
        // Adelante izquierda
        new THREE.Face3(4, 8, 5),
        new THREE.Face3(5, 8, 9),
        // Adelante abajo
        new THREE.Face3(4, 7, 8, new Vector3(0, -1, 0)),
        new THREE.Face3(7, 11, 8, new Vector3(0, -1, 0)),
        // Adelante derecha
        new THREE.Face3(7, 6, 10),
        new THREE.Face3(7, 10, 11),
        // Adelante arriba
        new THREE.Face3(5, 9, 6),
        new THREE.Face3(6, 9, 10),
        // Cara frontal (lo más adelante)
        new THREE.Face3(8, 10, 9),
        new THREE.Face3(8, 11, 10),
    )
    // geometriaPinza.computeFaceNormals()

    // Declarar objetos.
    // Objeto := geometría + material
    var suelo = new THREE.Mesh(geometriaSuelo, materialSuelo)
    suelo.receiveShadow = true

    base = new THREE.Mesh(geometriaBase, materialMate)
    base.castShadow = true
    base.receiveShadow = true

    var eje = new THREE.Mesh(geometriaEje, materialMate)
    eje.rotation.x = Math.PI / 2
    eje.castShadow = true
    eje.receiveShadow = true

    var esparrago = new THREE.Mesh(geometriaEsparrago, materialBrillante)
    esparrago.position.y = 60
    esparrago.castShadow = true
    esparrago.receiveShadow = true

    var rotula = new THREE.Mesh(geometriaRotula, materialMate)
    rotula.position.y = 120
    rotula.castShadow = true
    rotula.receiveShadow = true

    var disco = new THREE.Mesh(geometriaDisco, materialMate)
    disco.castShadow = true
    disco.receiveShadow = true

    var nervio1 = new THREE.Mesh(geometriaNervio, materialBrillante)
    nervio1.position.y = 40
    nervio1.position.x = 10
    nervio1.position.z = 10
    nervio1.castShadow = true
    nervio1.receiveShadow = true

    var nervio2 = new THREE.Mesh(geometriaNervio, materialBrillante)
    nervio2.position.y = 40
    nervio2.position.x = 10
    nervio2.position.z = -10
    nervio2.castShadow = true
    nervio2.receiveShadow = true
    
    var nervio3 = new THREE.Mesh(geometriaNervio, materialBrillante)
    nervio3.position.y = 40
    nervio3.position.x = -10
    nervio3.position.z = 10
    nervio3.castShadow = true
    nervio3.receiveShadow = true
    
    var nervio4 = new THREE.Mesh(geometriaNervio, materialBrillante)
    nervio4.position.y = 40
    nervio4.position.x = -10
    nervio4.position.z = -10
    nervio4.castShadow = true
    nervio4.receiveShadow = true
    
    mano = new THREE.Mesh(geometriaMano, materialMate)
    mano.position.y = 80
    mano.rotation.x = Math.PI / 2
    mano.castShadow = true
    mano.receiveShadow = true
    
    // Pinzas
    pinzaIzq = new THREE.Mesh(geometriaPinza, materialBrillante)
    pinzaIzq.rotation.x = Math.PI / 2
    pinzaIzq.position.x = 10
    pinzaIzq.position.y = -15
    pinzaIzq.castShadow = true
    pinzaIzq.receiveShadow = true
    // pinzaIzq.position.z = -10

    pinzaDer = new THREE.Mesh(geometriaPinza, materialBrillante)
    pinzaDer.rotation.x = -Math.PI / 2
    pinzaDer.position.x = 10
    pinzaDer.position.y = 15
    // pinzaDer.position.z = -10
    // pinzaDer.rotation.x = 10
    pinzaDer.castShadow = true
    pinzaDer.receiveShadow = true

    // Construir la escena.
    scene.add(suelo)
    suelo.add(base)
    base.add(brazo)
    brazo.add(eje)
    brazo.add(esparrago)
    brazo.add(rotula)
    brazo.add(antebrazo)
    antebrazo.add(disco)
    antebrazo.add(nervio1)
    antebrazo.add(nervio2)
    antebrazo.add(nervio3)
    antebrazo.add(nervio4)
    antebrazo.add(mano)
    mano.add(pinzaIzq)
    mano.add(pinzaDer)

    var luzAmbiental = new THREE.AmbientLight(0x606060)
    scene.add(luzAmbiental)

    var luzPuntual = new THREE.PointLight(0xA0A0A0)
    luzPuntual.position.set(100, 300, 0)
    scene.add(luzPuntual)

    luzFocal = new THREE.SpotLight(0xFFFFFF)
    luzFocal.position.set(0, 400, 200)
    luzFocal.target.position.set(0, 0, 0)
    luzFocal.castShadow = true
    luzFocal.shadow.mapSize.width = 1024
    luzFocal.shadow.mapSize.height = 1024
    luzFocal.shadow.camera.near = 100
    luzFocal.shadow.camera.far = 4000
    luzFocal.shadow.camera.fov = 30
    scene.add(luzFocal)
    
    var axes = new THREE.AxesHelper(100)
    axes.position.y = 10
    scene.add(axes)
}

function setupGUI() {
    robotController = {
        giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY: 0,
        giroAntebrazoZ: 0,
        giroPinzas: 0,
        separacionPinzas: 15,
        shadowQuality: 1024
    }

    gui = new dat.GUI()

    var menu = gui.addFolder("Control Robot")
    var giroBa = menu.add(robotController, "giroBase", -180, 180, 1).name("Giro Base").listen()
    giroBa.onChange(function(nuevaRotacion) {
        base.rotation.y = nuevaRotacion * Math.PI / 180
    })
    var giroBr = menu.add(robotController, "giroBrazo", -45, 45, 1).name("Giro Brazo")
    giroBr.onChange(function(nuevaRotacion) {
        brazo.rotation.z = nuevaRotacion * Math.PI / 180
    })
    var giroAntebrY = menu.add(robotController, "giroAntebrazoY", -180, 180, 1).name("Giro Antebrazo Y")
    giroAntebrY.onChange(function(nuevaRotacion) {
        antebrazo.rotation.y = nuevaRotacion * Math.PI / 180
    })
    var giroAntebrZ = menu.add(robotController, "giroAntebrazoZ", -90, 90, 1).name("Giro Antebrazo Z")
    giroAntebrZ.onChange(function(nuevaRotacion) {
        antebrazo.rotation.z = nuevaRotacion * Math.PI / 180
    })
    var giroPi = menu.add(robotController, "giroPinzas", -40, 220, 1).name("Giro Pinzas")
    giroPi.onChange(function(nuevaRotacion) {
        // pinzaIzq.rotation.x = nuevaRotacion * Math.PI / 180 + Math.PI / 2
        // pinzaDer.rotation.x = -nuevaRotacion * Math.PI / 180 + Math.PI / 2
        mano.rotation.y = nuevaRotacion * Math.PI / 180
    })
    var sepPinzas = menu.add(robotController, "separacionPinzas", 0, 15, 1).name("Sep. Pinzas")
    sepPinzas.onChange(function(nuevaSeparacion) {
        pinzaIzq.position.y = -nuevaSeparacion
        pinzaDer.position.y = nuevaSeparacion
    })
    var shadowQ = menu.add(robotController, "shadowQuality", 1, 2048, 1).name("Calidad Sombra")
    shadowQ.onChange(function(nuevaCalidadSombra) {
        luzFocal.shadow.mapSize.width = nuevaCalidadSombra
        luzFocal.shadow.mapSize.height = nuevaCalidadSombra
    })
}

// Aplica cambios entre frames.
// Orden usual: Escalado -> Rotación -> Traslación
// Si se quiere alterar este orden:
//
// objeto.matrixAutoUpdate = false
// var ms, mt = new THREE.Matrix4(), new THREE.Matrix4()
// mt.makeTranslation(x, y, z)
// ms.makeScale(x, y, z)
// objeto.matrix = mt.multiply(ms) 
function update() {
    var deltaRotation = 2.5
    var deltaMovement = 2
    var radians = robotController.giroBase * Math.PI / 180
    base.position.x += (Number(goStraight) - Number(goBackwards)) * Math.cos(radians) * deltaMovement
    base.position.z += (Number(goBackwards) - Number(goStraight)) * Math.sin(radians) * deltaMovement
    
    cameraTop.position.x = base.position.x
    cameraTop.position.z = base.position.z
    
    if (turnRight && robotController.giroBase > -180) {
        robotController.giroBase -= deltaRotation
        base.rotation.y -= deltaRotation * Math.PI / 180
    }
    if (turnLeft && robotController.giroBase < 180) {
        robotController.giroBase += deltaRotation
        base.rotation.y += deltaRotation * Math.PI / 180
    }
}

function onKeyDown(event) {
    var keyCode = event.keyCode

    if (keyCode == w) {
        goStraight = true
    }
    if (keyCode == a) {
        turnLeft = true
    }
    if (keyCode == s) {
        goBackwards = true
    }
    if (keyCode == d) {
        turnRight = true
    }
}

function onKeyUp(event) {
    var keyCode = event.keyCode
    if (keyCode == w) {
        goStraight = false
    }
    if (keyCode == a) {
        turnLeft = false
    }
    if (keyCode == s) {
        goBackwards = false
    }
    if (keyCode == d) {
        turnRight = false
    }
}

// Dibuja cada frame.
function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)

    update()

    renderer.clear()
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)

    // let min_coord = (window.innerWidth > window.innerHeight)?
    //         window.innerHeight / 4:
    //         window.innerWidth / 4
    if (window.innerWidth > window.innerHeight) {
        renderer.setViewport(0, 0, window.innerHeight / 4, window.innerHeight / 4)
    } else {
        renderer.setViewport(0, 0, window.innerWidth / 4, window.innerWidth / 4)
    }
    // renderer.setViewport(0, 0, min_coord, min_coord)
    renderer.render(scene, cameraTop)
}