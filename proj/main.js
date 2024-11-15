import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera Position
camera.position.z = 10;

// Orbit Controls (for testing)
const controls = new OrbitControls(camera, renderer.domElement);

// Player Character (Box)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Laser Group
const lasers = [];
const laserGroup = new THREE.Group();
scene.add(laserGroup);

// Resize Event
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


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
    lasers.push(laser);
    laserGroup.add(laser);
  }
  
  // OBB for the Player
  const playerOBB = new OBB(player.position, new THREE.Vector3(0.5, 0.5, 0.5));

  function clearLasers() {
    lasers.forEach((laser) => {
      laserGroup.remove(laser); // Remove each laser from the laser group
      laser.geometry.dispose();  // Dispose of laser geometry
      laser.material.dispose();  // Dispose of laser material
    });
    lasers.length = 0; // Clear the lasers array
  }
  
  let clock = new THREE.Clock();
  let last_laser = clock.getElapsedTime();
  // Create New Lasers Every Few Seconds
  setInterval(() => {
    clearLasers();
    for (let i = 0; i < 10; i++) {
        createLaser();
        last_laser = clock.getElapsedTime();
      }
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
      const laserOBB = new OBB(laser.position, new THREE.Vector3(5, 0.05, 0.05));
      laserOBB.update(laser.position, laser.matrixWorld);
  
      // Check Collision
      if(laser.dim = false){
        if (playerOBB.intersectsOBB(laserOBB)) {
            console.log("Collision detected!");
            // Handle collision (e.g., restart game or reduce health)
          }
      }
      
    });
  }
  

  // Keyboard Controls for Player Movement
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);

function movePlayer() {
  if (keys.ArrowUp) player.position.y += 0.1;
  if (keys.ArrowDown) player.position.y -= 0.1;
  if (keys.ArrowLeft) player.position.x -= 0.1;
  if (keys.ArrowRight) player.position.x += 0.1;

  // Update Player OBB
  playerOBB.update(player.position, player.matrixWorld);
}



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


  

  controls.update(); 
  renderer.render(scene, camera);
}

animate();

