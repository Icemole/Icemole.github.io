/**
 * Práctica GPC #2. Robot.
 */

// Variables imprescindibles con nombre predeterminado.
var renderer, scene, camera

// Variables globales.
var esferacubo, angulo = 0

// Acciones
init()
loadScene()
render()

// Crea el motor, la escena y la cámara.
function init() {
    // Crear el motor de render.
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(new THREE.Color(0xFFFFFF))
    // Añade el canvas declarado a algún contenedor existente en la página.
    document.getElementById("canvas").appendChild(renderer.domElement)

    // Crear la escena
    scene = new THREE.Scene()

    // Crear la cámara
    var aspectRatio = window.innerWidth / window.innerHeight
    // THREE.PerspectiveCamera(angulo_en_grados, aspect_ratio, near, far)
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000)
    // angle = 90 * Math.PI / 180
    camera.position.set(200, 300, 200)
    camera.lookAt(0, 100, 0)
    scene.add(camera)
}

// Carga la escena con objetos.
function loadScene() {
    // Declarar materiales.
    var material = new THREE.MeshBasicMaterial({color: "red", wireframe: true})

    // Declarar geometrías.
    var geometriaSuelo = new THREE.BoxGeometry(1000, 0, 1000)
    var geometriaBase = new THREE.CylinderGeometry(50, 50, 15)
    var brazo = new THREE.Object3D()
    var geometriaEje = new THREE.CylinderGeometry(20, 20, 18)
    var geometriaEsparrago = new THREE.BoxGeometry(18, 120, 12)
    var geometriaRotula = new THREE.SphereGeometry(20)
    var antebrazo = new THREE.Object3D()
    antebrazo.position.y = 120
    var geometriaDisco = new THREE.CylinderGeometry(22, 22, 6)
    var geometriaNervio = new THREE.BoxGeometry(4, 80, 4)
    var geometriaMano = new THREE.CylinderGeometry(15, 15, 40)
    const geometriaPinza = new THREE.Geometry()
    geometriaPinza.vertices.push(
        new THREE.Vector3(0, -10, 2),  // 0
        new THREE.Vector3(0, 10, 2),   // 1
        new THREE.Vector3(0, 10, -2),    // 2
        new THREE.Vector3(0, -10, -2),   // 3
        new THREE.Vector3(19, -10, 2), // 4
        new THREE.Vector3(19, 10, 2),  // 5
        new THREE.Vector3(19, 10, -2),   // 6
        new THREE.Vector3(19, -10, -2),  // 7
        new THREE.Vector3(38, -5, 1),  // 8
        new THREE.Vector3(38, 5, 1),   // 9
        new THREE.Vector3(38, 5, -1),    // 10
        new THREE.Vector3(38, -5, -1)    // 11
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
        new THREE.Face3(1, 5, 2),
        new THREE.Face3(2, 5, 6),
        // Adelante izquierda
        new THREE.Face3(4, 8, 5),
        new THREE.Face3(5, 8, 9),
        // Adelante abajo
        new THREE.Face3(4, 7, 8),
        new THREE.Face3(7, 11, 8),
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
    geometriaPinza.computeFaceNormals()

    // Declarar objetos.
    // Objeto := geometría + material
    var suelo = new THREE.Mesh(geometriaSuelo, material)
    var base = new THREE.Mesh(geometriaBase, material)
    var eje = new THREE.Mesh(geometriaEje, material)
    eje.rotation.x = Math.PI / 2
    var esparrago = new THREE.Mesh(geometriaEsparrago, material)
    esparrago.position.y = 60
    var rotula = new THREE.Mesh(geometriaRotula, material)
    rotula.position.y = 120
    var disco = new THREE.Mesh(geometriaDisco, material)
    var nervio1 = new THREE.Mesh(geometriaNervio, material)
    nervio1.position.y = 40
    nervio1.position.x = 10
    nervio1.position.z = 10
    var nervio2 = new THREE.Mesh(geometriaNervio, material)
    nervio2.position.y = 40
    nervio2.position.x = 10
    nervio2.position.z = -10
    var nervio3 = new THREE.Mesh(geometriaNervio, material)
    nervio3.position.y = 40
    nervio3.position.x = -10
    nervio3.position.z = 10
    var nervio4 = new THREE.Mesh(geometriaNervio, material)
    nervio4.position.y = 40
    nervio4.position.x = -10
    nervio4.position.z = -10
    var mano = new THREE.Mesh(geometriaMano, material)
    mano.position.y = 80
    mano.rotation.x = Math.PI / 2
    var pinzaIzq = new THREE.Mesh(geometriaPinza, material)
    pinzaIzq.rotation.x = Math.PI / 2
    pinzaIzq.position.x = 10
    pinzaIzq.position.y = -15
    // pinzaIzq.position.z = -10
    var pinzaDer = new THREE.Mesh(geometriaPinza, material)
    pinzaDer.rotation.x = -Math.PI / 2
    pinzaDer.position.x = 10
    pinzaDer.position.y = 15
    // pinzaDer.position.z = -10
    // pinzaDer.rotation.x = 10


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

}

// Dibuja cada frame.
function render() {
    // Indicar la callback que atiende al evento del dibujo
    // (bucle de dibujo).
    requestAnimationFrame(render)

    update()

    renderer.render(scene, camera)
}