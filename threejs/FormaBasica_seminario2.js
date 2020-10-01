/**
 * Seminario GPC #2. FormaBasica
 * Dibujar formas básicas con animación.
 */

 // Variables imprescindibles con nombre predeterminado.
 var renderer, scene, camera

 // Variables globales.
var esferacubo, angulo = 0, cubo

// Acciones
init()
loadScene()
render()

// Crea el motor, la escena y la cámara.
function init() {
    // Crear el motor de render.
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0x0000AA))
    // Añade el canvas declarado a algún contenedor existente en la página.
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Crear la escena
    scene = new THREE.Scene()

    // Crear la cámara
    var aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angulo_en_grados, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 100)
    scene.add(camera)
    // Mover la cámara
    camera.position.set(0.5, 3, 9)
    // Mirar hacia un determinado punto (inicialmente mira hacia -z)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
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
    loader.load("models/soldado/soldado.json",
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
    angulo += Math.PI / 100
    esferacubo.rotation.y = angulo
    cubo.rotation.x = angulo / 2
}

// Dibuja cada frame.
function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)

    update()

    renderer.render(scene, camera)
}