

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const aspectRatio = window.innerWidth / window.innerHeight;
// const zoom = 10; // Adjust zoom factor to control visible area
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

//test comment

// Camera Position
camera.position.set(0, -17, 6 );
camera.lookAt(0,0,0);

// Orbit Controls (for testing)
const controls = new OrbitControls(camera, renderer.domElement);

function initialize_event_listeners() {
  const arrow_keys = [ 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft' ];

  window.addEventListener( 'pointerdown', ( event ) => {}, false);
  window.addEventListener( 'pointerup', ( event ) => {}, false);
  window.addEventListener( 'wheel', ( event ) => {}, false);
  window.addEventListener( 'keydown', ( event ) => {
    if (arrow_keys.some( k => k === event.key ) || event.ctrlKey || event.metaKey || event.shiftKey) {
      controls.listenToKeyEvents( window );
    }
  }, false);
  window.addEventListener( 'keyup', ( event ) => {
    if (arrow_keys.some( k => k === event.key )) {
      controls.stopListenToKeyEvents();
    }
  }, false);
}

initialize_event_listeners();

controls.keys = {

  LEFT: 'ArrowLeft', 

  UP: 'ArrowUp', 

  RIGHT: 'ArrowRight', 

  BOTTOM: 'ArrowDown' 

};

const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5)
scene.add(lightAmbient)


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
      this.headHue = 10;
      this.bodyHue = 30;
      this.headLightness = 55;
      this.headMaterial = new THREE.MeshPhongMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` });
      this.bodyMaterial = new THREE.MeshPhongMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` });
      
      this.init(); // Initialize the player parts

      this.stop = true;
  }

  init() {
      this.createBody();
      this.createHead();
      this.createArms();
      this.createLegs();
      //this.createLives();
  }

  createBody() {
      this.body = new THREE.Group();
      const geometry = new THREE.CylinderGeometry(.5,.5, 1.8, 10);
      const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
      this.body.add(bodyMain);
      this.group.add(this.body);
  }

  createHead() {
      this.head = new THREE.Group();
      const geometry = new THREE.SphereGeometry(.8, 10, 10);
      const headMain = new THREE.Mesh(geometry, this.headMaterial);
      this.head.add(headMain);
      this.group.add(this.head);
      this.head.position.y = 1.65;
      this.createEyes();
  }

  // createLives(){
  //   const lives = new THREE.Group();
  //   const x = 0, y = 0;
  //   const heartShape = new THREE.Shape();

  //     heartShape.moveTo( x + 5, y + 5 );
  //     heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
  //     heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
  //     heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
  //     heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
  //     heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
  //     heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

  //     const geometry = new THREE.ShapeGeometry( heartShape );
  //     const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  //     for(let i = 0; i < 2; i++) {
  //       const heart = new THREE.Mesh( geometry, material );
  //       heart.rotation.set(0,0,Math.Pi/2);
  //       heart.material.side = THREE.DoubleSide;
  //       const m = i % 2 === 0 ? 1 : -1;
  //       lives.add(heart);
  //       heart.position.x = 0.5* m;
  //       heart.scale.set(.5,.5,.5);
        
  //   }
      
  //     this.head.add(lives)
  //     lives.position.set(0, 20, 0);
  // }

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
          const leg = new THREE.Mesh(geometry, this.headMaterial);
          const m = i % 2 === 0 ? 1 : -1;
          const legGroup = new THREE.Group();
          legGroup.add(leg);
          leg.position.y = -0.2;
          legGroup.position.set(m * 0.22, -1.15, 0);
          this.body.add(legGroup);
          this.legs.push(legGroup);
      }
  }

  // Run animation - move arms and legs


  animateRun(elapsedTime) {

      const speed = 5; // Control speed of running animation
      const angle = Math.sin(elapsedTime * speed) * 0.5;
      
      this.arms[0].rotation.x = angle;
      this.arms[1].rotation.x = -angle;
      this.legs[0].rotation.x = -angle;
      this.legs[1].rotation.x = angle;
      
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
  constructor(position, size) {
      this.position = position.clone();      // Center of the OBB
      this.size = size.clone();              // Half-sizes along each axis
      this.rotationMatrix = new THREE.Matrix4(); // Initial rotation as identity
  }

  update(position, rotationMatrix) {
      this.position.copy(position);
      this.rotationMatrix.copy(rotationMatrix);
  }

  intersectsOBB(other) {
      const EPSILON = 1e-6;
      const aAxes = [
          new THREE.Vector3(1, 0, 0).applyMatrix4(this.rotationMatrix),
          new THREE.Vector3(0, 1, 0).applyMatrix4(this.rotationMatrix),
          new THREE.Vector3(0, 0, 1).applyMatrix4(this.rotationMatrix),
      ];
      const bAxes = [
          new THREE.Vector3(1, 0, 0).applyMatrix4(other.rotationMatrix),
          new THREE.Vector3(0, 1, 0).applyMatrix4(other.rotationMatrix),
          new THREE.Vector3(0, 0, 1).applyMatrix4(other.rotationMatrix),
      ];

      const translation = other.position.clone().sub(this.position);
      const translationInA = [
          translation.dot(aAxes[0]),
          translation.dot(aAxes[1]),
          translation.dot(aAxes[2]),
      ];

      const ra = [];
      const rb = [];
      const R = [];
      const absR = [];

      for (let i = 0; i < 3; i++) {
          ra[i] = this.size.getComponent(i);
          rb[i] = other.size.getComponent(i);
          R[i] = [];
          absR[i] = [];
          for (let j = 0; j < 3; j++) {
              R[i][j] = aAxes[i].dot(bAxes[j]);
              absR[i][j] = Math.abs(R[i][j]) + EPSILON;
          }
      }

      for (let i = 0; i < 3; i++) {
          const rSum = ra[i] + rb[0] * absR[i][0] + rb[1] * absR[i][1] + rb[2] * absR[i][2];
          if (Math.abs(translationInA[i]) > rSum) return false;
      }

      for (let i = 0; i < 3; i++) {
          const rSum = rb[i] + ra[0] * absR[0][i] + ra[1] * absR[1][i] + ra[2] * absR[2][i];
          const translationInB = translation.dot(bAxes[i]);
          if (Math.abs(translationInB) > rSum) return false;
      }

      return true;
  }
}


// Initialize the player figure
const player = new Figure({ x: 0, y: 0, z: 0 });
let velocity = new THREE.Vector3();
const playerOBB = new OBB(player.group.position, new THREE.Vector3(0.1, 0.1, 0.1));


window.addEventListener('keydown', (event) => {
  if (event.key === 'w' || event.key === 'W') keys.W = true;
  if (event.key === 's' || event.key === 'S') keys.S = true;
  if (event.key === 'a' || event.key === 'A') keys.A = true;
  if (event.key === 'd' || event.key === 'D') keys.D = true;
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'w' || event.key === 'W') keys.W = false;
  if (event.key === 's' || event.key === 'S') keys.S = false;
  if (event.key === 'a' || event.key === 'A') keys.A = false;
  if (event.key === 'd' || event.key === 'D') keys.D = false;
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
      for(let i = 0; i < 3; i++) {
        const heart = new THREE.Mesh( geometry, material );
        heart.material.side = THREE.DoubleSide;

        heart.rotateX(Math.PI/2);
        heart.rotateZ(Math.PI);
        heart.position.x = 5* i - 5;
        heart.position.y= 80;
        heart.position.z = 30;
        heart.scale.set(.2,.2,.2);

        lives.push(heart);
        livesGroup.add(heart);
        
    }
    
  }
// Update player OBB position in the movePlayer function
function movePlayer() {
    if (keys.W) velocity.y = 0.1;
    if (keys.S) velocity.y = -0.1;
    if (keys.A) velocity.x = -0.1;
    if (keys.D) velocity.x = 0.1;

    //console.log(velocity)
    if(velocity.y > 0 || velocity.x > 0){
      player.stop == false;
    }
    else{
      player.stop;
    }
    player.group.position.add(velocity);
    player.updateDirection(velocity);

    // Reset velocity for next frame
    velocity.set(0, 0, 0);

    playerOBB.update(player.group.position, player.group.matrixWorld);
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
let last_collision = clock.getElapsedTime();

// Laser Creation Function
function createLaser() {
  const laserGeometry = new THREE.BoxGeometry(100, 0.1, 0.1);
  const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const laser = new THREE.Mesh(laserGeometry, laserMaterial);

  // Random Position and Rotation
  laser.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0);
  laser.rotation.z = Math.random() * Math.PI;

  // Laser Properties
  laser.dim = true; // Initial state
  laser.material.color.set(0x440000); // Dim color

  const numLights = 5; // Number of lights along the laser
  for (let i = 0; i < numLights; i++) {
      const lightPosition = (i - numLights / 2) * (laserGeometry.parameters.width / numLights);
      const laserLight = new THREE.PointLight(0xff0000, 0.5, 5); // Light color, intensity, range
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
  // Create New Lasers Every Few Seconds
  setInterval(() => {
    clearLasers();
    for (let i = 0; i < 10; i++) {
        createLaser();
        last_laser = clock.getElapsedTime();
      }
    console.log(camera.position)
  }, 3000);

  
  // Update Lasers and Check for Collision
  function updateLasers() {
    lasers.forEach((laser, index) => {
      // Transition laser to bright mode
    //   if (laser.dim) {
    //     laser.dim = false;
    //     laser.material.color.set(0xff0000);
    //   }
  
      // Update Laser OBB
      const laserOBB = new OBB(laser.position, new THREE.Vector3(100, 0.05, 0.05));
      laserOBB.update(laser.position, laser.matrixWorld);
      
      
      // Check Collision
      if(laser.dim == false && clock.getElapsedTime() - last_collision > 3){
        if (playerOBB.intersectsOBB(laserOBB)) {
            console.log("Collision detected!");
            takeDamage();

            // Handle collision (e.g., restart game or reduce health)
          }
      }
      
    });
  }
  
function takeDamage(){
  if(lives.length){
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
          height: 0.1, 
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
        height: 0.1,
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

      cancelAnimationFrame(animation);
  });
}

  // Keyboard Controls for Player Movement
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);


// const playerOBBHelper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 1)), 0x00ff00);
// scene.add(playerOBBHelper);

// function updateOBBHelper() {
//   playerOBBHelper.position.copy(playerOBB.position);
//   playerOBBHelper.rotation.setFromRotationMatrix(playerOBB.rotationMatrix);
// }


createLives();
console.log(lives);

// Animation Loop
function animate() {
  
  requestAnimationFrame(animate);
  let time = clock.getElapsedTime();
  movePlayer();
  updateLasers();
  if((time - last_laser) > 1){
    lasers.forEach((laser, index) => {
        laser.dim = false;
        laser.material.color.set(0xff0000);
    });
  }
  player.animateRun(time);
  //updateOBBHelper();
  
  playerOBB.update(player.group.position, player.group.matrixWorld);
  controls.update(); 
  renderer.render(scene, camera);
}



animate();



