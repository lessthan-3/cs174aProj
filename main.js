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
let tol = 0;

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.set(-90, 10, 10 );











function degRot(degrees){
    return degrees * (Math.PI / 180)
}


class PlayerModel {
    constructor() {	

	this.group = new THREE.Group();
	scene.add(this.group);

	this.group.position.set(0, 0, 0);
	this.group.scale.set(1, 1, 1);
	this.group.rotation.set(Math.PI /2, 0 ,0 );
	
	this.legMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
	

	//body
	const bodyTexture = new THREE.TextureLoader().load('fit4.png'); 
	this.bodyMaterial = new THREE.MeshStandardMaterial({ map: bodyTexture });
	this.body = new THREE.Group();
	const geometryBody = new THREE.CylinderGeometry(.5, .5, 1.8, 10);
	const bodyMain = new THREE.Mesh(geometryBody, this.bodyMaterial);
	bodyMain.castShadow = true;
	this.body.rotateY(degRot(180));
	this.body.add(bodyMain);
	this.group.add(this.body);
	

	//head
	this.headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac});
	this.head = new THREE.Group();
	const geometryHead = new THREE.SphereGeometry(.8, 10, 10);
	const headMain = new THREE.Mesh(geometryHead, this.headMaterial);
	headMain.castShadow = true;
	this.head.add(headMain);
	this.group.add(this.head);
	this.head.position.y = 1.5;

	//eyes

	const eyes = new THREE.Group();
	const geometryEye = new THREE.SphereGeometry(0.15, 10, 10);
	const material = new THREE.MeshPhongMaterial({ color: 0x44445c });
	const eye1 = new THREE.Mesh(geometryEye, material);
	const eye2 = new THREE.Mesh(geometryEye, material);
	eyes.add(eye1);
	eyes.add(eye2);
	
	eye1.position.set(-.4, -0.1, 0.6);
	eye2.position.set(.4, -0.1, 0.6);
	this.head.add(eyes);
	

	//arms
	this.arms = [];
	this.armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac});

	
	const geometryArm = new THREE.BoxGeometry(0.2, 2, 0.2);
	const arm1 = new THREE.Mesh(geometryArm, this.armMaterial);
	arm1.castShadow = true;

	this.body.add(arm1);

	arm1.position.y = -0.5;
	arm1.position.set(-.3, 0.6, 0);
	arm1.rotation.z = degRot(-30);

	const arm2 = new THREE.Mesh(geometryArm, this.armMaterial);
	arm2.castShadow = true;

	this.body.add(arm2);

	arm2.position.y = -0.5;
	arm2.position.set(.3, 0.6, 0);
	arm2.rotation.z = degRot(30);


	this.arms.push(arm1);
	this.arms.push(arm2);

	//legs
	this.legs = [];
	const geometryLeg = new THREE.BoxGeometry(0.2, 1, 0.2);


	const leg1 = new THREE.Mesh(geometryLeg, this.legMaterial);
	leg1.castShadow = true;
	
	leg1.position.y = -0.2;
	leg1.position.set(-0.2, -1.15, 0);
	this.body.add(leg1);
	this.legs.push(leg1);

	const leg2 = new THREE.Mesh(geometryLeg, this.legMaterial);
	leg2.castShadow = true;
	
	leg2.position.y = -0.2;
	leg2.position.set(0.2, -1.15, 0);
	this.body.add(leg2);
	this.legs.push(leg2);

	//hair

	const hairGroup = new THREE.Group(); 

	const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x2c1d0a });

	for (let i = 0; i < 100; i++) {
	    let hairGeometry = new THREE.BoxGeometry(0.1, 0.3 + Math.random() * .3 , .1);
	    const hairStrand = new THREE.Mesh(hairGeometry, hairMaterial);
	    const offsetX = (Math.random() - 0.5) * 1.2; 
	    const offsetY = -.1;
	    const offsetZ = (Math.random() - 0.5) * 1.2; 

	    hairStrand.rotation.x = degRot((Math.random() - 0.5) * 30);
	    hairStrand.rotation.y = degRot((Math.random() - 0.5) * 180);
	    hairStrand.rotation.z = degRot((Math.random() - 0.5) * 180);
	    hairStrand.position.set(offsetX, offsetY, offsetZ);
	    hairGroup.add(hairStrand); 
	}

	this.head.add(hairGroup);
	hairGroup.position.y = 0.8; 


	this.crouching = false;
	this.stop = true;
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
	if (this.crouching) return; 

	this.body.position.y = -0.5;

	this.legs[0].rotation.x = degRot(45); 
	this.legs[1].rotation.x = degRot(-45); 

	this.head.position.y = 1.0;

	this.crouching = true; 
	global_crouching = true;
    }

    stand() {
	if (!this.crouching) return; 


	this.body.position.y = 0;

	this.legs[0].rotation.x = 0; 
	this.legs[1].rotation.x = 0; 


	this.head.position.y = 1.65;

	this.crouching = false; 
	global_crouching = false;
    }




    animateRun(elapsedTime) {

	if (!this.stop){
	    const speed = 5; 
	    const angle = Math.sin(elapsedTime * speed) * 0.5;

	    this.arms[0].rotation.x = angle;
	    this.arms[1].rotation.x = -angle;
	    this.legs[0].rotation.x = -angle;
	    this.legs[1].rotation.x = angle;
	}



    }

    updateDirection(velocity) {


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
	this.object = object; 
	this.fixedSize = fixedSize; 
	this.box = new THREE.Box3();
	this.corners = []; 
	this.axes = []; 

	if (this.fixedSize) {
	    this.initializeFixedSize();
	} else {
	    this.update(); 
	}
    }

    initializeFixedSize() {
	const size = this.fixedSize.clone();
	const halfSize = size.multiplyScalar(0.5);

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

	const rotationMatrix = new THREE.Matrix4().extractRotation(this.object.matrixWorld);
	this.axes = [
	    new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 0, 1).applyMatrix4(rotationMatrix),
	];

	this.corners = this.corners.map((corner) => corner.applyMatrix4(this.object.matrixWorld));
    }


    update() {
	if (this.fixedSize) {
	    this.initializeFixedSize();
	    return;
	}



	this.box.setFromObject(this.object);

	//Workaround to solve issues with sizing since obb only used for player
	const size = new THREE.Vector3(1, 3.5, 1); 

	const center = global_crouching ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(0, 0.5, 0);


	const halfSize = size.clone().multiplyScalar(0.5);

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

	this.corners = this.corners.map((corner) => {
	    return corner.applyMatrix4(this.object.matrixWorld);
	});

	const rotationMatrix = new THREE.Matrix4().extractRotation(this.object.matrixWorld);
	this.axes = [
	    new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix),
	    new THREE.Vector3(0, 0, 1).applyMatrix4(rotationMatrix),
	];

    }

    createBoxGeometry() {
	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	const edges = [
	    [0, 1], [1, 2], [2, 3], [3, 0], 
	    [4, 5], [5, 6], [6, 7], [7, 4], 
	    [0, 4], [1, 5], [2, 6], [3, 7], 
	];

	edges.forEach(([i, j]) => {
	    vertices.push(this.corners[i].x, this.corners[i].y, this.corners[i].z);
	    vertices.push(this.corners[j].x, this.corners[j].y, this.corners[j].z);
	});

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	return geometry;
    }


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
		return false; 
	    }
	}

	return true; 
    }

    projectOntoAxis(axis) {
	const projections = this.corners.map((corner) => corner.dot(axis));
	return [Math.min(...projections), Math.max(...projections)];
    }
}



// Initialize the player figure
const player = new PlayerModel();
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
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);


    const intersects = raycaster.intersectObject(floor);

    if (intersects.length > 0) {
	const point = intersects[0].point; 
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
	if (!gameStarted){
	    mouseMode = true;
	    tol = 1e-2;
	    startGame();
	}
    }
    if (event.key === 'g' || event.key === 'G') {
	demoMode = true;
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
	//from three.js site
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
	//let tol = 0.2;
	//let dy = clicky - player.group.position.y;
	//let dx = clickx - player.group.position.x;
	velocity.y = (clicky - player.group.position.y)/30;
	velocity.x = (clickx - player.group.position.x)/30;

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
	velocity.z = .3 
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

    if (Math.abs(velocity.x) > tol || Math.abs(velocity.y) > tol || Math.abs(velocity.z) > tol) {
	player.stop = false;
    } else {
	player.stop = true;
    }
    player.group.position.add(velocity);
    player.updateDirection(velocity);


    if (isJumping) {
	velocity.z += gravity;
	// console.log(velocity);

	if (player.group.position.z <= 0) {
	    player.group.position.z = 0;
	    isJumping = false;
	    velocity.z = 0;
	}
    }

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

let sweeperActive = false; 
let sweeperDirection = 1; 
let sweeperSpeed = 0.1; 
const sweeperBoundary = 40; 

function sweep() {
    if (!scene.children.includes(sweeper)) {
        sweeper.position.set(-sweeperBoundary, 0, 0); 
        scene.add(sweeper);
    }
    sweeperActive = true; 
}

// Laser Creation Function
function createLaser() {
    const laserGeometry = new THREE.BoxGeometry(100, 0.1, 0.1);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);


    laser.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, getHeight());
    laser.rotation.z = Math.random() * Math.PI;


    laser.dim = true; 
    laser.material.color.set(0x440000); 

    let n_lasers = 2+level/5;
    const numLights = 12/n_lasers; 
    for (let i = 0; i < numLights; i++) {
	const lightPosition = (i - numLights / 2) * (laserGeometry.parameters.width / numLights);
	const laserLight = new THREE.PointLight(0xff0000, 5, 20); 
	laserLight.position.set(lightPosition, 0, 0); 
	laser.add(laserLight);
    }

    lasers.push(laser);
    laserGroup.add(laser);
}



function clearLasers() {
    lasers.forEach((laser) => {
	laserGroup.remove(laser);
	laser.geometry.dispose();  
	laser.material.dispose();  
    });
    lasers.length = 0; 
}


let last_laser = clock.getElapsedTime();

let cube = null;
let cube_light = new THREE.PointLight(0xffffff, 6, 12);
cube_light.castShadow = true;


//interval for gameplay
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


}, 3000);

const laserSize = new THREE.Vector3(100, 0.1, 0.1);

function updateLasers() {
    lasers.forEach((laser, index) => {


	const laserOBB = new OBB(laser, laserSize);
	laserOBB.update();



	// Check Collision
	if(laser.dim == false && clock.getElapsedTime() - last_collision > 1){
	    if (playerOBB.intersects(laserOBB)) {
		//laserOBB.display(scene);
		//console.log("Collision detected!");
		takeDamage();

	    }
	}


    });
}


function createCube(){
    cube_exists = 1;
    const geometry = new THREE.BoxGeometry(1, 1, 1); 
    const cubeTexture = new THREE.TextureLoader().load('earth.gif');
    cubeTexture.wrapS = THREE.RepeatWrapping; 
    cubeTexture.wrapT = THREE.RepeatWrapping; 
    const material = new THREE.MeshStandardMaterial({ map: cubeTexture }); 
    const cube = new THREE.Mesh(geometry, material); 
    cube.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0.1);
    cube.castShadow = true;


    cube.updateTexture = function () {
        cubeTexture.offset.x += 0.01; 
    };

    cube.wobble = function (elapsedTime) {
        cube.position.z += Math.sin(elapsedTime * 5) * 0.05; 
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


        const intensity = Math.sin((elapsedTime / duration) * Math.PI);
        light.intensity = intensity;

        if (elapsedTime < duration) {
            requestAnimationFrame(animatePulse); 
        } else {
            light.intensity = 0; 
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
	livesGroup.remove(life); 
	life.geometry.dispose();  
	life.material.dispose();  
	last_collision = clock.getElapsedTime();
	if (!lives.length) {
	    displayGameOverScreen();
	}
    }
}


function displayGameOverScreen() {

    gameEnded = true;
    const loader = new FontLoader();

   
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
	scene.clear(); 


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

	gameOverMesh.position.set(-7, 1, 0); 
	survivedMesh.position.set(-7, -2, 0); 
	scene.add(gameOverMesh);
	scene.add(survivedMesh);
	camera.position.set(-2.5, 1, 15)
	camera.lookAt(-2.5, 1, 0);
    });
}

function displayStartScreen() {
    const loader = new FontLoader();


    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {


	let time = Math.floor(clock.getElapsedTime());
	const gameOverMessage = "Welcome to Laser Maze";
	const survivedMessage = `The goal is to survive, press r for keyboard and t for mouse.\nPress g to enable demo mode (100 lives).`;
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
	gameOverMesh.position.set(-95, 1, 0); 
	survivedMesh.position.set(-95, -2, 0); 
	scene.add(gameOverMesh);
	scene.add(survivedMesh);
	camera.position.set(-80, 1, 15)
	camera.lookAt(-80, 1, 0);
    });
}

displayStartScreen();




const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false};
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);





console.log(lives);

//playerOBB.display(scene);


//floor

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(50, 100, 50);
// scene.add(directionalLight);

const floorGeometry = new THREE.PlaneGeometry(80, 80); 


const floorTexture = new THREE.TextureLoader().load('graytexture.jpg'); 

const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });




const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
// floor.material = testMaterial;


floor.position.z = -1.9; 

floor.receiveShadow = true;


//scene.add(floor);

const wallGeometry = new THREE.PlaneGeometry(200, 200);
// Wall 1: Back wall
const wall1 = new THREE.Mesh(wallGeometry, floorMaterial);
wall1.position.x = -40 ; 
wall1.position.y = 40; 
wall1.rotation.x = Math.PI / 2; 


// Wall 2: Front wall
const wall2 = new THREE.Mesh(wallGeometry, floorMaterial);
wall2.position.x = 40 ; 
wall2.position.y = -40; 
wall2.rotation.x = Math.PI / 2; 


// Wall 3: Left wall
const wall3 = new THREE.Mesh(wallGeometry, floorMaterial);
wall3.position.x = -40; 
wall3.position.y = 40; 
wall3.rotation.y = Math.PI / 2; 


// Wall 4: Right wall
const wall4 = new THREE.Mesh(wallGeometry, floorMaterial);
wall4.position.x = 40;
wall4.position.y = 40; 
wall4.rotation.y = -Math.PI / 2; 


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

	    const elapsedTime = performance.now() / 1000; 
	    cube.wobble(elapsedTime);

	    if (Math.abs(cube.position.x - player.group.position.x) <= 1 && Math.abs(cube.position.y - player.group.position.y) <= 1){
		scene.remove(cube);
		scene.remove(cube_light);
		cube_exists = 0;
		giveReward();
	    }
	}


        if (sweeperActive) {
            sweeper.position.x += sweeperSpeed * sweeperDirection;

            if (sweeper.position.x >= sweeperBoundary || sweeper.position.x <= -sweeperBoundary) {
                sweeperDirection *= -1; 
            }

    
            if (Math.abs(sweeper.position.x - player.group.position.x) < 1 && player.group.position.z < 1 && time - last_collision > 1) {
                takeDamage();
		last_collision = time;
            }
        }

    }

    player.animateRun(time);
    playerOBB.update();
    //controls.update(); 
    renderer.render(scene, camera);
}

animate();
