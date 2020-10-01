/**
 * Seminario GPC #3. FormaBasica
 * Manejar cámaras.
 */

// Variables imprescindibles con nombre predeterminado.
var renderer, scene, camera
var alzado, planta, perfil

// Variables globales.
var esferacubo, angulo = 0, cubo

// Variables de la cámara.
// Derecha, arriba.
var r = t = 4
// Izquierda, abajo.
var l = b = -4
// Controlador de cámara (para mover la cámara)
var cameraController

// Acciones
init()
loadScene()
render()

// Construye las cuatro cámaras.
function setCameras(aspectRatio) {
    var orthographicCamera
    if (aspectRatio > 1) {
        orthographicCamera = new THREE.OrthographicCamera(l * aspectRatio, r * aspectRatio, t, b, -20, 20)
    } else {
        // Dividir para tener un número más grande.
        orthographicCamera = new THREE.OrthographicCamera(l, r, t / aspectRatio, b / aspectRatio, -20, 20)
    }

    // Cámaras ortográficas.
    origin = new THREE.Vector3(0, 0, 0)
    alzado = orthographicCamera.clone()
    alzado.position.set(0, 0, 4)
    alzado.lookAt(origin)

    perfil = orthographicCamera.clone()
    perfil.position.set(4, 0, 0)
    perfil.lookAt(origin)

    planta = orthographicCamera.clone()
    planta.position.set(0, 4, 0)
    planta.lookAt(origin)
    planta.up = new THREE.Vector3(0, 0, -1)

    // Cámara perspectiva.
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 100)

    scene.add(alzado)
    scene.add(perfil)
    scene.add(planta)
    scene.add(camera)
    // Mover la cámara
    camera.position.set(0.5, 3, 9)
    // Mirar hacia un determinado punto (inicialmente mira hacia -z)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
}

// Crea el motor, la escena y la cámara.
function init() {
    // Crear el motor de render.
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0x0000AA))

    // Para que interactúen las cuatro cámaras.
    renderer.autoClear = false

    // Añade el canvas declarado a algún contenedor existente en la página.
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Crear la escena
    scene = new THREE.Scene()

    // Crear la cámara
    var aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angulo_en_grados, aspect_ratio, near, far)

    // Cámara perspectiva
    // camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100)
    
    // Cámara ortográfica
    // camera = new THREE.OrthographicCamera(l, r, t, b, -20, 20)
    // Solo con esto es posible que haya una deformación.
    // Hay que jugar con la razón de aspecto.
    setCameras(aspectRatio)

    // Controlador de cámara: necesita una cámara y el canvas.
    cameraController = new THREE.OrbitControls(camera, renderer.domElement)
    cameraController.target.set(0, 0, 0)
    cameraController.noKeys = true

    // Declaración de eventos.
    window.addEventListener("resize", updateAspectRatio)
    renderer.domElement.addEventListener("dblclick", rotate)
}

// Carga la escena con objetos.
function loadScene() {
    // Declarar materiales.
    var material = new THREE.MeshBasicMaterial({color: "yellow", wireframe: true})

    // Declarar geometrías.
    var geocubo = new THREE.BoxGeometry(2, 2, 2)
    var geoesfera = new THREE.SphereGeometry(1, 30, 30)

    // Declarar objetos.
    // Objeto := geometría + material
    cubo = new THREE.Mesh(geocubo, material)
    cubo.position.x = -1
    var esfera = new THREE.Mesh(geoesfera, material)
    esfera.position.x = 1

    esferacubo = new THREE.Object3D()
    esferacubo.position.y = 1

    // Modelo importado.
    // Páginas web interesantes para encontrar modelos:
    // https://clara.io/
    // https://sketchfab.com/
    var loader = new THREE.ObjectLoader()
    loader.load("/models/soldado/soldado.json",
            function(modeloCargado) {
                modeloCargado.position.y = 1
                cubo.add(modeloCargado)
            })

    // Construir la escena.
    esferacubo.add(cubo)
    esferacubo.add(esfera)
    scene.add(esferacubo)
    scene.add(new THREE.AxisHelper(3))
}

function rotate(event) {
    // Localiza el objeto seleccionado y lo gira 45 grados.

    // x -> izquierda a derecha
    // y -> arriba a abajo
    let x = event.clientX
    let y = event.clientY

    // Cosas para interactuar con las cuatro cámaras (clic).
    var derecha = abajo = false
    var cam = null
    // Conocer el cuadrante de la selección.
    if (x > window.innerWidth / 2) {
        x -= window.innerWidth / 2
        derecha = true
    }
    if (y > window.innerHeight / 2) {
        y -= window.innerHeight / 2
        abajo = true
    }
    // Conocer la cámara.
    if (derecha) {
        if (abajo) {
            cam = camera
        } else {
            cam = perfil
        }
    } else {
        if (abajo) {
            cam = planta
        } else {
            cam = alzado
        }
    }

    // Convertir al cuadrado canónico (2x2).
    // Se multiplican la x y la y por 2 para afrontar las 4 cámaras.
    x = (2 * x / window.innerWidth) * 2 - 1
    y = -(2 * y / window.innerHeight) * 2 + 1

    // Construir el rayo e intersección con la escena.
    let rayo = new THREE.Raycaster()
    rayo.setFromCamera(new THREE.Vector2(x, y), cam)

    // true -> recorrer recursivamente los hijos de la escena.
    var interseccion = rayo.intersectObjects(scene.children, true)
    if (interseccion.length > 0) {
        interseccion[0].object.rotation.y += Math.PI / 4
    }
}

function updateAspectRatio() {
    // Indicar al motor las nuevas dimensiones del canvas.
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Variar el volumen de la vista según el ratio de aspecto.
    var aspectRatio = window.innerWidth / window.innerHeight
    if (aspectRatio > 1) {
        alzado.left = perfil.left = planta.left = l * aspectRatio
        alzado.right = perfil.right = planta.right = r * aspectRatio
        alzado.top = perfil.top = planta.top = t
        alzado.bottom = perfil.bottom = planta.bottom = b
    } else {
        alzado.left = perfil.left = planta.left = l
        alzado.right = perfil.right = planta.right = r
        alzado.top = perfil.top = planta.top = t / aspectRatio
        alzado.bottom = perfil.bottom = planta.bottom = b / aspectRatio
    }

    camera.aspect = aspectRatio

    camera.updateProjectionMatrix()
    alzado.updateProjectionMatrix()
    perfil.updateProjectionMatrix()
    planta.updateProjectionMatrix()
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
    // angulo += Math.PI / 100
    // esferacubo.rotation.y = angulo
    // cubo.rotation.x = angulo / 2
}

// Dibuja cada frame.
function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)

    update()

    renderer.clear()

    renderer.setViewport(0, window.innerHeight / 2,
                            window.innerWidth / 2, window.innerHeight / 2)
    renderer.render(scene, planta)

    renderer.setViewport(window.innerWidth / 2, 0,
                            window.innerWidth / 2, window.innerHeight / 2)
    renderer.render(scene, perfil)

    renderer.setViewport(0, 0,
                            window.innerWidth / 2, window.innerHeight / 2)
    renderer.render(scene, alzado)

    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2,
                            window.innerWidth / 2, window.innerHeight / 2)
    renderer.render(scene, camera)
}