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

const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.1)
scene.add(lightAmbient)

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

        // Position according to params
        this.group.position.set(this.params.x, this.params.y, this.params.z);
        this.group.rotation.y = this.params.ry;
        this.group.rotation.set(Math.PI / 2, 0 , 0); // Rotate by 90 degrees (π/2 radians) along the z-axis
        this.group.scale.set(1, 1, 1);

        // Material
        this.headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDD88 });
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x88CCFF });

        this.init();
    }

    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        this.body.add(bodyMain);
        this.group.add(this.body);
        this.createLegs();
    }

    createHead() {
        this.head = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        this.head.add(headMain);
        this.group.add(this.head);
        this.head.position.y = 1.65;
        this.createEyes();
    }

    createArms() {
        const height = 0.85;
        for (let i = 0; i < 2; i++) {
            const armGroup = new THREE.Group();
            const geometry = new THREE.BoxGeometry(0.25, height, 0.25);
            const arm = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;
            armGroup.add(arm);
            this.body.add(armGroup);
            arm.position.y = height * -0.5;
            armGroup.position.set(m * 0.8, 0.6, 0);
            armGroup.rotation.z = Math.PI / 6 * m;
        }
    }

    createEyes() {
        const eyes = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.15, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x44445c });
        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material);
            const m = i % 2 === 0 ? 1 : -1;
            eyes.add(eye);
            eye.position.x = 0.36 * m;
        }
        this.head.add(eyes);
        eyes.position.set(0, -0.1, 0.7);
    }

    createLegs() {
        const legs = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);
        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;
            legs.add(leg);
            leg.position.x = m * 0.22;
        }
        legs.position.y = -1.15;
        this.body.add(legs);
    }

    init() {
        this.createBody();
        this.createHead();
        this.createArms();
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
const playerOBB = new OBB(player.group.position, new THREE.Vector3(0.5, 0.5, 0.5));

// Update player OBB position in the movePlayer function
function movePlayer() {
    if (keys.ArrowUp) player.group.position.y += 0.1;
    if (keys.ArrowDown) player.group.position.y -= 0.1;
    if (keys.ArrowLeft) player.group.position.x -= 0.1;
    if (keys.ArrowRight) player.group.position.x += 0.1;

    playerOBB.update(player.group.position, player.group.matrixWorld);
}

// Remaining code for lasers, collisions, resize, and rendering...




// Resize Event
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});




// Laser Group
const lasers = [];
const laserGroup = new THREE.Group();
scene.add(laserGroup);

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

  const numLights = 15; // Number of lights along the laser
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
