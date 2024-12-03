

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

      this.crouching = false;
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

  crouch() {
      if (this.crouching) return; // Avoid reapplying the crouch pose if already crouched

      // Lower the body
      this.body.position.y = -0.7;

      // Bend the legs
      this.legs[0].rotation.x = degreesToRadians(45); // Front leg bends backward
      this.legs[1].rotation.x = degreesToRadians(-45); // Back leg bends forward

      // Optionally adjust the head position
      this.head.position.y = 1.0;

      this.crouching = true; // Mark the figure as crouching
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


// class AABB {
//   constructor(position, size) {
//       this.position = position.clone();      // Center of the AABB
//       this.size = size.clone();              // Half-sizes along each axis
//       this.rotationMatrix = new THREE.Matrix4(); // Initial rotation as identity
//   }

//   update(position, rotationMatrix) {
//       this.position.copy(position);
//       this.rotationMatrix.copy(rotationMatrix);
//   }

//   intersectsAABB(other) {
//       const EPSILON = 1e-6;
//       const aAxes = [
//           new THREE.Vector3(1, 0, 0).applyMatrix4(this.rotationMatrix),
//           new THREE.Vector3(0, 1, 0).applyMatrix4(this.rotationMatrix),
//           new THREE.Vector3(0, 0, 1).applyMatrix4(this.rotationMatrix),
//       ];
//       const bAxes = [
//           new THREE.Vector3(1, 0, 0).applyMatrix4(other.rotationMatrix),
//           new THREE.Vector3(0, 1, 0).applyMatrix4(other.rotationMatrix),
//           new THREE.Vector3(0, 0, 1).applyMatrix4(other.rotationMatrix),
//       ];

//       const translation = other.position.clone().sub(this.position);
//       const translationInA = [
//           translation.dot(aAxes[0]),
//           translation.dot(aAxes[1]),
//           translation.dot(aAxes[2]),
//       ];

//       const ra = [];
//       const rb = [];
//       const R = [];
//       const absR = [];

//       for (let i = 0; i < 3; i++) {
//           ra[i] = this.size.getComponent(i);
//           rb[i] = other.size.getComponent(i);
//           R[i] = [];
//           absR[i] = [];
//           for (let j = 0; j < 3; j++) {
//               R[i][j] = aAxes[i].dot(bAxes[j]);
//               absR[i][j] = Math.abs(R[i][j]) + EPSILON;
//           }
//       }

//       for (let i = 0; i < 3; i++) {
//           const rSum = ra[i] + rb[0] * absR[i][0] + rb[1] * absR[i][1] + rb[2] * absR[i][2];
//           if (Math.abs(translationInA[i]) > rSum) return false;
//       }

//       for (let i = 0; i < 3; i++) {
//           const rSum = rb[i] + ra[0] * absR[0][i] + ra[1] * absR[1][i] + ra[2] * absR[2][i];
//           const translationInB = translation.dot(bAxes[i]);
//           if (Math.abs(translationInB) > rSum) return false;
//       }

//       return true;
//   }
// }


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
      const size = new THREE.Vector3(1, 2.5, 1);
      const center = new THREE.Vector3();
      //this.box.getSize(size);
      this.box.getCenter(center);
      

      // Create the corner points in local space
      const heightSize = size.clone().multiplyScalar(0.5);
      const ySize = size.clone().multiplyScalar(.5);
      const halfSize = size.clone().multiplyScalar(0.5);


     
      this.corners = [
          new THREE.Vector3(-halfSize.x, -ySize.y, -heightSize.z),
          new THREE.Vector3(halfSize.x, -ySize.y, -heightSize.z),
          new THREE.Vector3(halfSize.x, ySize.y, -heightSize.z),
          new THREE.Vector3(-halfSize.x, ySize.y, -heightSize.z),
          new THREE.Vector3(-halfSize.x, -ySize.y, heightSize.z),
          new THREE.Vector3(halfSize.x, -ySize.y, heightSize.z),
          new THREE.Vector3(halfSize.x, ySize.y, heightSize.z),
          new THREE.Vector3(-halfSize.x, ySize.y, heightSize.z),
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


class AABB {
  constructor(object) {
      this.object = object; // The linked Three.js object
      this.min = new THREE.Vector3(); // Minimum corner of the bounding box
      this.max = new THREE.Vector3(); // Maximum corner of the bounding box
      this.boxHelper = null; // Helper for visualization
      this.update(); // Initialize the bounds based on the object
  }

  update() {
      const box = new THREE.Box3().setFromObject(this.object);
      this.min.copy(box.min);
      this.max.copy(box.max);

      if (this.boxHelper) {
          this.boxHelper.box.setFromObject(this.object);
      }
  }

  display(scene) {
      if (!this.boxHelper) {
          this.boxHelper = new THREE.Box3Helper(new THREE.Box3().setFromObject(this.object), 0xff0000);
          scene.add(this.boxHelper);
      }
  }

  intersects(other) {
      return (
          this.min.x <= other.max.x &&
          this.max.x >= other.min.x &&
          this.min.y <= other.max.y &&
          this.max.y >= other.min.y &&
          this.min.z <= other.max.z &&
          this.max.z >= other.min.z
      );
  }
}


// Initialize the player figure
const player = new Figure({ x: 0, y: 0, z: 0 });
let velocity = new THREE.Vector3();
const playerSize = new THREE.Vector3(1, 1, 2);
const playerOBB = new OBB(player.group);


window.addEventListener('keydown', (event) => {
  if (event.key === 'w' || event.key === 'W') keys.W = true;
  if (event.key === 's' || event.key === 'S') keys.S = true;
  if (event.key === 'a' || event.key === 'A') keys.A = true;
  if (event.key === 'd' || event.key === 'D') keys.D = true;
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
// Update player AABB position in the movePlayer function
let isJumping = false;
const gravity = -.01;

function movePlayer() {
    if (keys.W) velocity.y = 0.1;
    if (keys.S) velocity.y = -0.1;
    if (keys.A) velocity.x = -0.1;
    if (keys.D) velocity.x = 0.1;

    if (keys.Space && !isJumping) {
      isJumping = true;
      velocity.z = .3 // Initial upward velocity, tweak this with gravity const for smoother/faster animations
      console.log("jump, position at");
      console.log(player.group.position);
    }

    if (keys.Shift && !isJumping) {
      player.crouch();
      player.stop = true;
      velocity.x = 0;
      velocity.y = 0;
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
      console.log(velocity);
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
let last_collision = clock.getElapsedTime();

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
    for (let i = 0; i < 5; i++) {
        createLaser();
        last_laser = clock.getElapsedTime();
      }
    console.log(camera.position)
  }, 3000);

  const laserSize = new THREE.Vector3(100, 0.1, 0.1);
  // Update Lasers and Check for Collision
  function updateLasers() {
    lasers.forEach((laser, index) => {
  
      // Update Laser AABB
      const laserOBB = new OBB(laser, laserSize);
      laserOBB.update();
      
      
      
      // Check Collision
      if(laser.dim == false && clock.getElapsedTime() - last_collision > 3){
        if (playerOBB.intersects(laserOBB)) {
            laserOBB.display(scene);
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
  });
}

  // Keyboard Controls for Player Movement
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false};
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);




createLives();
console.log(lives);

playerOBB.display(scene);

// Animation Loop
function animate() {
  
  requestAnimationFrame(animate);
  let time = clock.getElapsedTime();
  playerOBB.update();
  movePlayer();
  updateLasers();
  if((time - last_laser) > 1){
    lasers.forEach((laser, index) => {
        laser.dim = false;
        laser.material.color.set(0xff0000);
    });
  }
  player.animateRun(time);
  //updateAABBHelper();
  playerOBB.update();
  controls.update(); 
  renderer.render(scene, camera);
}



animate();



