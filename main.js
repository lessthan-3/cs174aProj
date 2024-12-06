// Global Variables

let global_crouching = false;
let level = 0;
let cube_exists = 0;
let gameStarted = false;
let gameEnded = false;
let mouseMode = false;
let invincible = 0;
let cubeToggle = 0;
let demoMode = 0;

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const aspectRatio = window.innerWidth / window.innerHeight;
// const zoom = 30; // Adjust zoom factor to control visible area
// const frustumSize = zoom;

// const camera = new THREE.OrthographicCamera(
//     frustumSize * aspectRatio / -2, // left
//     frustumSize * aspectRatio / 2,  // right
//     frustumSize / 2,                // top
//     frustumSize / -2,               // bottom
//     0.1,                            // near
//     1000                            // far
// );
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//test comment

// Camera Position
camera.position.set(-90, 10, 10 );







// Orbit Controls (for testing)
// const controls = new OrbitControls(camera, renderer.domElement);







const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180)
}


// Player Character (Figure)
class Figure {
    constructor(params) {	
	this.params = {
	    x: 0,
	    y: 0,
	    z: 0,
	    ry: 0,
	    ...params
	};

	// Create group and add to scene
	this.group = new THREE.Group();
	scene.add(this.group);

	// Set initial position and scale
	this.group.position.set(this.params.x, this.params.y, this.params.z);
	this.group.scale.set(1, 1, 1);
	this.group.rotation.set(Math.PI /2, 0 ,0 );

	// Material
	this.headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac});
	this.legMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

	const bodyTexture = new THREE.TextureLoader().load('fit4.png'); // Load your texture

	// // Configure the material with the texture
	// const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
	this.bodyMaterial = new THREE.MeshStandardMaterial({ map: bodyTexture });



	this.init(); // Initialize the player parts

	this.crouching = false;
	this.stop = true;
    }

    init() {
	this.createBody();
	this.createHead();
	this.createArms();
	this.createLegs();
	this.createHair();
	//this.createLives();
    }



    createBody() {
	this.body = new THREE.Group();
	const geometry = new THREE.CylinderGeometry(.5, .5, 1.8, 10);
	const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
	bodyMain.castShadow = true;
	this.body.rotateY(degreesToRadians(180));
	this.body.add(bodyMain);
	this.group.add(this.body);
    }

    createHead() {
	this.head = new THREE.Group();
	const geometry = new THREE.SphereGeometry(.8, 10, 10);
	const headMain = new THREE.Mesh(geometry, this.headMaterial);
	headMain.castShadow = true;
	this.head.add(headMain);
	this.group.add(this.head);
	this.head.position.y = 1.65;
	this.createEyes();
    }


    createEyes() {
	const eyes = new THREE.Group();
	const geometry = new THREE.SphereGeometry(0.15, 12, 8);
	const material = new THREE.MeshPhongMaterial({ color: 0x44445c });

	for(let i = 0; i < 2; i++) {
	    const eye = new THREE.Mesh(geometry, material);
	    const m = i % 2 === 0 ? 1 : -1;
	    eyes.add(eye);
	    eye.position.x = 0.36 * m;
	}

	this.head.add(eyes);
	eyes.position.set(0, -0.1, 0.7);
    }

    createArms() {
	this.arms = [];
	const height = 1.0;

	for(let i = 0; i < 2; i++) {
	    const armGroup = new THREE.Group();
	    const geometry = new THREE.BoxGeometry(0.25, height, 0.25);
	    const arm = new THREE.Mesh(geometry, this.headMaterial);
	    arm.castShadow = true;
	    const m = i % 2 === 0 ? 1 : -1;

	    armGroup.add(arm);
	    this.body.add(armGroup);

	    arm.position.y = height * -0.5;
	    armGroup.position.set(m * 0.3, 0.6, 0);
	    armGroup.rotation.z = degreesToRadians(30 * m);
	    this.arms.push(armGroup);
	}
    }

    createLegs() {
	this.legs = [];
	const geometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);

	for(let i = 0; i < 2; i++) {
	    const leg = new THREE.Mesh(geometry, this.legMaterial);
	    leg.castShadow = true;
	    const m = i % 2 === 0 ? 1 : -1;
	    const legGroup = new THREE.Group();
	    legGroup.add(leg);
	    leg.position.y = -0.2;
	    legGroup.position.set(m * 0.22, -1.15, 0);
	    this.body.add(legGroup);
	    this.legs.push(legGroup);
	}


    }
    createHair() {
	const hairGroup = new THREE.Group(); // Create a group to hold the hair

	// Define the geometry and material for the hair
	// Small rectangle dimensions
	const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x2c1d0a }); // Brown hair color

	for (let i = 0; i < 100; i++) {
	    let hairGeometry = new THREE.BoxGeometry(0.1, 0.3 + Math.random() * .3 , .1);
	    const hairStrand = new THREE.Mesh(hairGeometry, hairMaterial);


	    // Randomize the position of the hair strands
	    const offsetX = (Math.random() - 0.5) * 1.2; // Random X position within a range
	    const offsetY = -.1; // Position slightly above the head
	    const offsetZ = (Math.random() - 0.5) * 1.2; // Random Z position within a range

	    hairStrand.rotation.x = degreesToRadians((Math.random() - 0.5) * 30);
	    hairStrand.rotation.y = degreesToRadians((Math.random() - 0.5) * 180);
	    hairStrand.rotation.z = degreesToRadians((Math.random() - 0.5) * 180);
	    hairStrand.position.set(offsetX, offsetY, offsetZ);
	    hairGroup.add(hairStrand); // Add each strand to the hair group
	}

	// Attach the hair group to the head
	this.head.add(hairGroup);
	hairGroup.position.y = 0.8; // Position the hair group on top of the head
    }

    bigHair(){
	const hairGroup = this.head.children[2];
	hairGroup.scale.set(1.5,1.5,1.5);
    }


    smallHair(){
	const hairGroup = this.head.children[2];
	hairGroup.scale.set(1,1,1);
    }

    crouch() {
	if (this.crouching) return; // Avoid reapplying the crouch pose if already crouched

	// Lower the body
	this.body.position.y = -0.5;

	// Bend the legs
	this.legs[0].rotation.x = degreesToRadians(45); // Front leg bends backward
	this.legs[1].rotation.x = degreesToRadians(-45); // Back leg bends forward

	// Optionally adjust the head position
	this.head.position.y = 1.0;

	this.crouching = true; // Mark the figure as crouching
	global_crouching = true;
    }

    stand() {
	if (!this.crouching) return; // Avoid resetting if already standing

	// Reset the body position
	this.body.position.y = 0;

	// Reset the legs
	this.legs[0].rotation.x = 0; // Front leg straight
	this.legs[1].rotation.x = 0; // Back leg straight

	// Reset the head position
	this.head.position.y = 1.65;

	this.crouching = false; // Mark the figure as standing
	global_crouching = false;
    }




    // Run animation - move arms and legs


    animateRun(elapsedTime) {

	if (!this.stop){
	    const speed = 5; // Control speed of running animation
	    const angle = Math.sin(elapsedTime * speed) * 0.5;

	    this.arms[0].rotation.x = angle;
	    this.arms[1].rotation.x = -angle;
	    this.legs[0].rotation.x = -angle;
	    this.legs[1].rotation.x = angle;
	}



    }

    // Update direction to face movement
    updateDirection(velocity) {

	// if(way == 1){
	//   this.group.rotation.set(Math.PI /2, Math.PI ,0 );
	// }
	// if(way == 2){
	//   this.group.rotation.set(Math.PI /2, 0 ,0 );
	// }
	// if(way == 3){
	//   this.group.rotation.set(Math.PI /2, -Math.PI/2 ,0 );
	// }
	// if(way == 4){
	//   this.group.rotation.set(Math.PI /2, Math.PI/2 ,0 );
	// }

	if(velocity.x == 0){
	    if(velocity.y == 0){
	    }
	    else if (velocity.y > 0){ 
		this.group.rotation.set(Math.PI /2, Math.PI ,0 );
	    }
	    else if (velocity.y < 0){ 
		this.group.rotation.set(Math.PI /2, 0 ,0 );
	    }
	}
	if(velocity.x < 0){
	    if(velocity.y == 0){
		this.group.rotation.set(Math.PI /2, -Math.PI/2 ,0 );
	    }
	    else if (velocity.y > 0){ 
		this.group.rotation.set(Math.PI /2, -3*Math.PI/4 ,0 );
	    }
	    else if (velocity.y < 0){ 
		this.group.rotation.set(Math.PI /2, -Math.PI/4 ,0 );
	    }
	}
	if(velocity.x > 0){
	    if(velocity.y == 0){
		this.group.rotation.set(Math.PI /2, Math.PI/2 ,0 );
	    }
	    else if (velocity.y > 0){ 
		this.group.rotation.set(Math.PI /2, 3*Math.PI/4 ,0 );
	    }
	    else if (velocity.y < 0){ 
		this.group.rotation.set(Math.PI /2, Math.PI/4 ,0 );
	    }
	}



    }
}



class OBB {
    constructor(object, fixedSize = null) {
	this.object = object; // The linked Three.js object
	this.fixedSize = fixedSize; // Hardset size of the bounding box (optional)
	this.box = new THREE.Box3(); // The bounding box
	this.helper = null; // Visualization helper
	this.corners = []; // Store the corner points for the OBB
	this.axes = []; // Store the axes for SAT

	if (this.fixedSize) {
	    // Use the fixed size and set up the box directly
	    this.initializeFixedSize();
	} else {
	    this.update(); // Compute initial OBB based on object
	}
    }

    // Initialize the bounding box with a fixed size
    initializeFixedSize() {
	const size = this.fixedSize.clone();
	const halfSize = size.multiplyScalar(0.5);

	// Compute the local-space corners based on the fixed size
	this.corners = [
	    new THREE.Vector3(-halfSize.x, -halfSize.y, -halfSize.z),
	    new THREE.Vector3(halfSize.x, -halfSize.y, -halfSize.z),
	    new THREE.Vector3(halfSize.x, halfSize.y, -halfSize.z),
	    new THREE.Vector3(-halfSize.x, halfSize.y, -halfSize.z),
	    new THREE.Vector3(-halfSize.x, -halfSize.y, halfSize.z),
	    new THREE.Vector3(halfSize.x, -halfSize.y, halfSize.z),
	    new THREE.Vector3(halfSize.x, halfSize.y, halfSize.z),
	    new THREE.Vector3(-halfSize.x, halfSize.y, halfSize.z),
	];

	// Update the world-space axes
	const rotationMatrix = new THREE.Matrix4().extractRotation(this.object.matrixWorld);
	this.axes = [
	    new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 0, 1).applyMatrix4(rotationMatrix),
	];

	// Transform the corners into world space
	this.corners = this.corners.map((corner) => corner.applyMatrix4(this.object.matrixWorld));
    }

    // Update the OBB based on the object's transformation
    update() {
	if (this.fixedSize) {
	    // Skip recalculating size if it's fixed
	    this.initializeFixedSize();
	    return;
	}



	// Update the AABB
	this.box.setFromObject(this.object);

	// Get the box size and center
	const size = new THREE.Vector3(1, 3.5, 1); // Box size
	// const center = new THREE.Vector3(0, 0.5, 0); // Box center
	const center = global_crouching ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(0, 0.5, 0); // Box center
	// this.box.getSize(size); // Uncomment if using bounding box dimensions
	// this.box.getCenter(center); // Uncomment if using bounding box center

	// Calculate half-size for dimensions
	const halfSize = size.clone().multiplyScalar(0.5);

	// Create the corner points in world space (adjusted by center)
	this.corners = [
	    new THREE.Vector3(-halfSize.x, -halfSize.y, -halfSize.z).add(center),
	    new THREE.Vector3(halfSize.x, -halfSize.y, -halfSize.z).add(center),
	    new THREE.Vector3(halfSize.x, halfSize.y, -halfSize.z).add(center),
	    new THREE.Vector3(-halfSize.x, halfSize.y, -halfSize.z).add(center),
	    new THREE.Vector3(-halfSize.x, -halfSize.y, halfSize.z).add(center),
	    new THREE.Vector3(halfSize.x, -halfSize.y, halfSize.z).add(center),
	    new THREE.Vector3(halfSize.x, halfSize.y, halfSize.z).add(center),
	    new THREE.Vector3(-halfSize.x, halfSize.y, halfSize.z).add(center),
	];

	// Transform the corner points into world space
	this.corners = this.corners.map((corner) => {
	    return corner.applyMatrix4(this.object.matrixWorld);
	});

	// Compute the OBB axes in world space
	const rotationMatrix = new THREE.Matrix4().extractRotation(this.object.matrixWorld);
	this.axes = [
	    new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 0, 1).applyMatrix4(rotationMatrix),
	];

	// If there's a helper, update its geometry
	if (this.helper) {
	    this.helper.geometry.dispose();
	    this.helper.geometry = this.createBoxGeometry();
	}
    }

    // Create a wireframe geometry for visualization
    createBoxGeometry() {
	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	// Define the edges of the box
	const edges = [
	    [0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
	    [4, 5], [5, 6], [6, 7], [7, 4], // Top face
	    [0, 4], [1, 5], [2, 6], [3, 7], // Vertical edges
	];

	edges.forEach(([i, j]) => {
	    vertices.push(this.corners[i].x, this.corners[i].y, this.corners[i].z);
	    vertices.push(this.corners[j].x, this.corners[j].y, this.corners[j].z);
	});

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	return geometry;
    }

    // Visualize the OBB
    display(scene, color = 0x00ff00) {
	if (!this.helper) {
	    const material = new THREE.LineBasicMaterial({ color });
	    const geometry = this.createBoxGeometry();
	    this.helper = new THREE.LineSegments(geometry, material);
	    scene.add(this.helper);
	}
    }

    // Check if this OBB intersects with another OBB
    intersects(other) {
	const axes = [
	    ...this.axes,
	    ...other.axes,
	    ...this.axes.flatMap((a) =>
		other.axes.map((b) => new THREE.Vector3().crossVectors(a, b).normalize())
	    ),
	];

	for (const axis of axes) {
	    if (!axis.length()) continue; 

	    const [min1, max1] = this.projectOntoAxis(axis);
	    const [min2, max2] = other.projectOntoAxis(axis);

	    if (max1 < min2 || max2 < min1) {
		return false; // Separating axis found
	    }
	}

	return true; // No separating axis found; OBBs intersect
    }

    // Project the OBB onto an axis
    projectOntoAxis(axis) {
	const projections = this.corners.map((corner) => corner.dot(axis));
	return [Math.min(...projections), Math.max(...projections)];
    }
}



// Initialize the player figure
const player = new Figure({ x: 0, y: 0, z: 0 });
let velocity = new THREE.Vector3();
const playerSize = new THREE.Vector3(1, 1, 2);
const playerOBB = new OBB(player.group);

let clickx = 0;
let clicky = 0;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


window.addEventListener('click', onMouseClick, false);

let mouseLock = false;

function onMouseClick(event) {
    console.log(camera.position);
    mouseLock = true;
    // Convert screen coordinates to normalized device coordinates (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);


    // Intersect with the floor
    const intersects = raycaster.intersectObject(floor);

    if (intersects.length > 0) {
	const point = intersects[0].point; // The exact point of intersection
	console.log(`Clicked position on floor: X=${point.x}, Y=${point.y}`);
	clickx = point.x;
	clicky = point.y;

    }
}




window.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W'){
	mouseLock = false;
	keys.W = true;
    } 
    if (event.key === 's' || event.key === 'S') {
	mouseLock = false;
	keys.S = true;
    }
    if (event.key === 'a' || event.key === 'A') {
	mouseLock = false;
	keys.A = true;
    }
    if (event.key === 'd' || event.key === 'D') {
	mouseLock = false;
	keys.D = true;
    }
    if (event.code === 'Space') {
	event.preventDefault();
	keys.Space = true;
    }
    if (event.code === 'Shift') {
	event.preventDefault();
	keys.Shift = true;
    }


});

window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'W') keys.W = false;
    if (event.key === 's' || event.key === 'S') keys.S = false;
    if (event.key === 'a' || event.key === 'A') keys.A = false;
    if (event.key === 'd' || event.key === 'D') keys.D = false;
    if (event.key === 'r' || event.key === 'R') startGame();
    if (event.key === 't' || event.key === 'T') {
	mouseMode = true;
	startGame();
    }
    if (event.key === 'g' || event.key === 'G') {
	demoMode = true;
	startGame();
    }
    if (event.code === 'Space') keys.Space = false;
    if (event.code === 'Shift') keys.Shift = false;
});


const lives = []
const livesGroup = new THREE.Group();
scene.add(livesGroup);

// const geometry = new THREE.Shape;
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );


function createLives(){



    const x = 0, y = 0;
    const heartShape = new THREE.Shape();

    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
    heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

    const geometry = new THREE.ShapeGeometry( heartShape );
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    let num_lives = demoMode ? 99 : 3;
    for(let i = 0; i < num_lives; i++) {
	const heart = new THREE.Mesh( geometry, material );
	heart.material.side = THREE.DoubleSide;

	heart.rotateX(Math.PI/2);
	heart.rotateZ(Math.PI);
	heart.position.x = 5* i - 5;
	heart.position.y= 39;
	heart.position.z = 4;
	heart.scale.set(.2,.2,.2);
	lives.push(heart);
	livesGroup.add(heart);

    }

}

function addLife(){
    console.log('got here')


    const x = 0, y = 0;
    const heartShape = new THREE.Shape();

    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
    heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

    const geometry = new THREE.ShapeGeometry( heartShape );
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const heart = new THREE.Mesh( geometry, material );
    heart.material.side = THREE.DoubleSide;

    heart.rotateX(Math.PI/2);
    heart.rotateZ(Math.PI);
    let i = lives.length;
    heart.position.x = 5* i - 5;
    heart.position.y= 39;
    heart.position.z = 4;
    heart.scale.set(.2,.2,.2);
    lives.push(heart);
    livesGroup.add(heart);

}


// Update player AABB position in the movePlayer function
let isJumping = false;
const gravity = -.01;

function movePlayer() {
    if(!mouseMode){
	if (keys.W) velocity.y = 0.2;
	if (keys.S) velocity.y = -0.2;
	if (keys.A) velocity.x = -0.2;
	if (keys.D) velocity.x = 0.2;
    }


    if (mouseMode) {
	let tol = 0.2;
	//let dy = clicky - player.group.position.y;
	//let dx = clickx - player.group.position.x;
	velocity.y = (clicky - player.group.position.y)/40;
	velocity.x = (clickx - player.group.position.x)/40;

	//console.log(player.group.position.x)
	//console.log(player.group.position.y)
	// if (dx**2 + dy**2 > tol){
	//     velocity.y = Math.sign(dy) * 0.15 * (1 + (dy/dx)**2)**(-0.5);
	//     velocity.x = Math.sign(dx) * 0.15 * (1 + (dx/dy)**2)**(-0.5);
	//     //velocity.x = Math.sign(dx) * Math.sqrt(0.15**2 - (velocity.y)**2);
	// }
    }

    if(player.group.position.x > 39 && velocity.x > 0){
	velocity.x = 0
    }
    if(player.group.position.y > 39 && velocity.y > 0){
	velocity.y = 0
    }
    if(player.group.position.x < -39 && velocity.x < 0){
	velocity.x = 0
    }
    if(player.group.position.y < -32 && velocity.y < 0){
	velocity.y = 0
    }

    if (keys.Space && !isJumping) {
	isJumping = true;
	velocity.z = .3 // Initial upward velocity, tweak this with gravity const for smoother/faster animations
	//console.log("jump, position at");
	//console.log(player.group.position);
    }

    if (keys.Shift && !isJumping) {
	player.crouch();
	player.stop = true;
	velocity.x = velocity.x * 0.5;
	velocity.y = velocity.y * 0.5;	
	console.log(player.group.position.x);
	console.log(player.group.position.y);
	console.log(camera.position);
    }
    if (!keys.Shift && !isJumping) {
	player.stand();
	player.stop = false;
    }

    if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
	player.stop = false;
    }
    else {
	player.stop = true;
    }
    player.group.position.add(velocity);
    player.updateDirection(velocity);


    if (isJumping) {
	velocity.z += gravity;
	// console.log(velocity);
	// Check if the player lands back on the ground
	if (player.group.position.z <= 0) {
	    player.group.position.z = 0;
	    isJumping = false;
	    velocity.z = 0;
	}
    }

    // Reset velocity for next frame
    velocity.set(0, 0, velocity.z);

    playerOBB.update();
}





// Resize Event
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});



let clock = new THREE.Clock();
// Laser Group
const lasers = [];
const laserGroup = new THREE.Group();
scene.add(laserGroup);
let last_collision = 0;

function getHeight() {
    var i = true;
    i = (Math.floor(Math.random() * 2) == 0);
    if(i){
	return 2;
    }
    else{
	return 0;
    }
}

const sweeperGeometry = new THREE.BoxGeometry(0.1, 100, 0.1);
const sweeperMaterial = new THREE.MeshBasicMaterial({ color: 0xffA500 });
const sweeper = new THREE.Mesh(sweeperGeometry, sweeperMaterial);

let sweeperActive = false; // Flag to control the sweeper's movement
let sweeperDirection = 1; // 1 for right, -1 for left
let sweeperSpeed = 0.1; // Speed of sweeper
const sweeperBoundary = 40; // X-axis boundary for the sweeper

function sweep() {
    if (!scene.children.includes(sweeper)) {
        sweeper.position.set(-sweeperBoundary, 0, 0); // Reset the sweeper's position
        scene.add(sweeper); // Add the sweeper to the scene
    }
    sweeperActive = true; // Activate the sweeper
}

// Laser Creation Function
function createLaser() {
    const laserGeometry = new THREE.BoxGeometry(100, 0.1, 0.1);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    // Random Position and Rotation
    laser.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, getHeight());
    laser.rotation.z = Math.random() * Math.PI;

    // Laser Properties
    laser.dim = true; // Initial state
    laser.material.color.set(0x440000); // Dim color

    let n_lasers = 2+level/5;
    const numLights = 12/n_lasers; // Number of lights along the laser
    for (let i = 0; i < numLights; i++) {
	const lightPosition = (i - numLights / 2) * (laserGeometry.parameters.width / numLights);
	const laserLight = new THREE.PointLight(0xff0000, 5, 20); // Light color, intensity, range
	laserLight.position.set(lightPosition, 0, 0); // Position along laser length
	laser.add(laserLight);
    }

    // Add a light to the laser
    // Attach light to laser mesh so it moves with it

    // Add to laser arrays for management
    lasers.push(laser);
    laserGroup.add(laser);
}



function clearLasers() {
    lasers.forEach((laser) => {
	laserGroup.remove(laser); // Remove each laser from the laser group
	laser.geometry.dispose();  // Dispose of laser geometry
	laser.material.dispose();  // Dispose of laser material
    });
    lasers.length = 0; // Clear the lasers array
}


let last_laser = clock.getElapsedTime();

let cube = null;
const cube_light = new THREE.PointLight(0xffffff, 6, 12);
cube_light.castShadow = true;
// Create New Lasers Every Few Seconds
setInterval(() => {
    if(gameStarted && !gameEnded){
	level+=1;
	sweeperSpeed = Math.min(1, level * 0.1 - 0.2);
	clearLasers();
	let num_lasers = 2+level/5;
	for (let i = 0; i < num_lasers; i++) {
	    createLaser();
	    last_laser = clock.getElapsedTime();
	}

	if (!cube_exists && level % 3 === 1){
	    cube = createCube();
	    scene.add(cube);
	    cube_light.position.copy(cube.position);
	    cube_light.position.z = 2.1;
	    scene.add(cube_light);
	}

	if (level == 3){
	    sweep();
	}
    } 

    //console.log(camera.position)
}, 3000);

const laserSize = new THREE.Vector3(100, 0.1, 0.1);
// Update Lasers and Check for Collision
function updateLasers() {
    lasers.forEach((laser, index) => {

	// Update Laser AABB
	const laserOBB = new OBB(laser, laserSize);
	laserOBB.update();



	// Check Collision
	if(laser.dim == false && clock.getElapsedTime() - last_collision > 1){
	    if (playerOBB.intersects(laserOBB)) {
		//laserOBB.display(scene);
		//console.log("Collision detected!");
		takeDamage();

		// Handle collision (e.g., restart game or reduce health)
	    }
	}


    });
}


function createCube(){
    cube_exists = 1;
    const geometry = new THREE.BoxGeometry(1, 1, 1); 
    const cubeTexture = new THREE.TextureLoader().load('earth.gif');
    cubeTexture.wrapS = THREE.RepeatWrapping; // Horizontal wrapping
    cubeTexture.wrapT = THREE.RepeatWrapping; // Vertical wrapping
    const material = new THREE.MeshStandardMaterial({ map: cubeTexture }); 
    const cube = new THREE.Mesh(geometry, material); 
    cube.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0.1);
    cube.castShadow = true;

    // Add scrolling effect to the texture
    cube.updateTexture = function () {
        cubeTexture.offset.x += 0.01; // Adjust speed of horizontal scroll
        //cubeTexture.offset.y += 0.005; // Adjust speed of vertical scroll
    };

    // Add wobbling effect to the cube's Y position
    cube.wobble = function (elapsedTime) {
        cube.position.z += Math.sin(elapsedTime * 5) * 0.05; // Adjust speed and height
    };

    return cube;
}

function giveReward(){
    switch (cubeToggle){
	case 0:
	    addLife();
	    pulseLight(500, lifeLight);
	    cubeToggle = 1;
	    break;
	case 1:
	    invincible = 1;
	    player.bigHair();
	    setTimeout(() => {
		invincible = 0;
		player.smallHair();
	    }, 5000);
	    pulseLight(5000, invLight);
	    cubeToggle = 0;
	    break;
    }
}

const damageLight = new THREE.AmbientLight(0xff0000, 0);
scene.add(damageLight);

const invLight = new THREE.AmbientLight(0x0000ff, 0);
scene.add(invLight);

const lifeLight = new THREE.AmbientLight(0x00ff00, 0);
scene.add(lifeLight);

// Function to pulse the light
function pulseLight(duration, light) {
    const startTime = performance.now();

    function animatePulse() {
        const elapsedTime = performance.now() - startTime;

        // Calculate intensity (0 to 1) based on elapsed time
        const intensity = Math.sin((elapsedTime / duration) * Math.PI);
        light.intensity = intensity;

        if (elapsedTime < duration) {
            requestAnimationFrame(animatePulse); // Continue animation
        } else {
            light.intensity = 0; // Reset intensity to 0 after pulsing
        }
    }

    animatePulse();
}

function takeDamage(){
    if (invincible){
	return;
    }
    if (lives.length){
	pulseLight(500, damageLight);
	let life = lives.pop();
	livesGroup.remove(life); // Remove each laser from the laser group
	life.geometry.dispose();  // Dispose of laser geometry
	life.material.dispose();  // Dispose of laser material
	last_collision = clock.getElapsedTime();
	if (!lives.length) {
	    displayGameOverScreen();
	}
    }
}


function displayGameOverScreen() {

    gameEnded = true;
    const loader = new FontLoader();

    // Load the font
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
	// Clear the scene or hide current game elements
	scene.clear(); // You might still need to manually clear objects if `.clear()` isn't sufficient.

	// Create a "Game Over" message 
	let time = Math.floor(clock.getElapsedTime());
	const gameOverMessage = "Game Over";
	const survivedMessage = `You survived for ${time} seconds`;
	const gameOverText = new TextGeometry(gameOverMessage, {
	    font: font, 
	    size: 2,  
	    depth: 0.1, 
	    curveSegments: 12, 
	    bevelEnabled: true,
	    bevelThickness: 0.02,
	    bevelSize: 0.02,
	    bevelOffset: 0,
	    bevelSegments: 3
	});

	const survivedText = new TextGeometry(survivedMessage, {
	    font: font,
	    size: 0.8,
	    depth: 0.1,
	    curveSegments: 12,
	    bevelEnabled: true,
	    bevelThickness: 0.02,
	    bevelSize: 0.02,
	    bevelOffset: 0,
	    bevelSegments: 3,
	});

	const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const gameOverMesh = new THREE.Mesh(gameOverText, textMaterial);
	const survivedMesh = new THREE.Mesh(survivedText, textMaterial);
	// Position the text at the center of the screen
	gameOverMesh.position.set(-7, 1, 0); // Adjust the coordinates to make sure that its in the middle
	survivedMesh.position.set(-7, -2, 0); 
	scene.add(gameOverMesh);
	scene.add(survivedMesh);
	camera.position.set(-2.5, 1, 15)
	camera.lookAt(-2.5, 1, 0);
    });
}

function displayStartScreen() {
    const loader = new FontLoader();

    // Load the font
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
	// Clear the scene or hide current game elements
	// You might still need to manually clear objects if `.clear()` isn't sufficient.

	// Create a "Game Over" message 
	let time = Math.floor(clock.getElapsedTime());
	const gameOverMessage = "Welcome to Laser Maze";
	const survivedMessage = `The goal is to survive, press r for keyboard and t for mouse,\ng for demo mode`;
	const gameOverText = new TextGeometry(gameOverMessage, {
	    font: font, 
	    size: 2,  
	    depth: 0.1, 
	    curveSegments: 12, 
	    bevelEnabled: true,
	    bevelThickness: 0.02,
	    bevelSize: 0.02,
	    bevelOffset: 0,
	    bevelSegments: 3
	});

	const survivedText = new TextGeometry(survivedMessage, {
	    font: font,
	    size: 0.8,
	    depth: 0.1,
	    curveSegments: 12,
	    bevelEnabled: true,
	    bevelThickness: 0.02,
	    bevelSize: 0.02,
	    bevelOffset: 0,
	    bevelSegments: 3,
	});

	const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const gameOverMesh = new THREE.Mesh(gameOverText, textMaterial);
	const survivedMesh = new THREE.Mesh(survivedText, textMaterial);
	// Position the text at the center of the screen
	gameOverMesh.position.set(-95, 1, 0); // Adjust the coordinates to make sure that its in the middle
	survivedMesh.position.set(-95, -2, 0); 
	scene.add(gameOverMesh);
	scene.add(survivedMesh);
	camera.position.set(-80, 1, 15)
	camera.lookAt(-80, 1, 0);
    });
}

displayStartScreen();




// Keyboard Controls for Player Movement
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false};
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);




//createLives();
console.log(lives);

//playerOBB.display(scene);


//floor

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(50, 100, 50);
// scene.add(directionalLight);


// Create a PlaneGeometry for the floor
const floorGeometry = new THREE.PlaneGeometry(80, 80); // 100x100 units]


const floorTexture = new THREE.TextureLoader().load('graytexture.jpg'); // Load your texture

// Configure the material with the texture
const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });



// Create the floor mesh
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green material
// floor.material = testMaterial;

// Rotate the floor to lie on the XZ plane
//floor.rotation.x = -Math.PI / 2; // Rotate 90 degrees to align with XZ
floor.position.z = -1.9; // Place it at y=0

// Optionally, receive shadows for realism
floor.receiveShadow = true;

// Add the floor to the scene
//scene.add(floor);

const wallGeometry = new THREE.PlaneGeometry(200, 200);
// Wall 1: Back wall
const wall1 = new THREE.Mesh(wallGeometry, floorMaterial);
wall1.position.x = -40 ; // Position at the back
wall1.position.y = 40; // Lift to match the center of the wall
wall1.rotation.x = Math.PI / 2; 


// Wall 2: Front wall
const wall2 = new THREE.Mesh(wallGeometry, floorMaterial);
wall2.position.x = 40 ; // Position at the back
wall2.position.y = -40; // Lift to match the center of the wall
wall2.rotation.x = Math.PI / 2; 


// Wall 3: Left wall
const wall3 = new THREE.Mesh(wallGeometry, floorMaterial);
wall3.position.x = -40; // Position to the left
wall3.position.y = 40; // Lift to match the center of the wall
wall3.rotation.y = Math.PI / 2; // Rotate 90 degrees to face inward


// Wall 4: Right wall
const wall4 = new THREE.Mesh(wallGeometry, floorMaterial);
wall4.position.x = 40; // Position to the right
wall4.position.y = 40; // Lift to match the center of the wall
wall4.rotation.y = -Math.PI / 2; // Rotate -90 degrees to face inward


wall1.receiveShadow = true;
wall2.receiveShadow = true;
wall3.receiveShadow = true;
wall4.receiveShadow = true;



function startGame(){
    if(!gameStarted){
	scene.add(wall1);
	scene.add(wall2);
	scene.add(wall3);
	scene.add(wall4);
	scene.add(floor);
	createLives();
	const lightAmbient = new THREE.AmbientLight(0x808080, 0.3)
	scene.add(lightAmbient)
	gameStarted = true;
	camera.position.set(0, -17, 6 );
	camera.lookAt(0,0,0);
    }

}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    let time = clock.getElapsedTime();

    if(gameStarted && !gameEnded){

	if(!mouseMode){
	    camera.position.set(player.group.position.x, player.group.position.y - 7, player.group.position.z + 4);
	    camera.lookAt(player.group.position); 
	}

	playerOBB.update();
	movePlayer();
	updateLasers();
	if((time - last_laser) > 1){
	    lasers.forEach((laser, index) => {
		laser.dim = false;
		laser.material.color.set(0xff0000);
	    });
	}

	if (cube_exists){
	    cube.updateTexture();

	    const elapsedTime = performance.now() / 1000; // Get time in seconds
	    cube.wobble(elapsedTime);

	    if (Math.abs(cube.position.x - player.group.position.x) <= 1 && Math.abs(cube.position.y - player.group.position.y) <= 1){
		scene.remove(cube);
		scene.remove(cube_light);
		cube_exists = 0;
		giveReward();
	    }
	}

        // Sweeper Movement
        if (sweeperActive) {
            sweeper.position.x += sweeperSpeed * sweeperDirection;

            // Reverse direction if sweeper hits the boundary
            if (sweeper.position.x >= sweeperBoundary || sweeper.position.x <= -sweeperBoundary) {
                sweeperDirection *= -1; // Reverse direction
            }

            // Collision Detection with Player
            if (Math.abs(sweeper.position.x - player.group.position.x) < 1 && player.group.position.z < 1 && time - last_collision > 1) {
                takeDamage();
		last_collision = elapsed_time;
            }
        }

    }

    player.animateRun(time);
    //updateAABBHelper();
    playerOBB.update();
    //controls.update(); 
    renderer.render(scene, camera);
}

animate();
