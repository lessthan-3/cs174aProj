const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180)
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Helpers
const center = (group) => {
	new THREE.Box3().setFromObject(group).getCenter( group.position ).multiplyScalar(-1)
	scene.add(group)
}

const random = (min, max, float = false) => {
  const val = Math.random() * (max - min) + min

  if (float) {
    return val
  }

  return Math.floor(val)
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas })

const render = () => {
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	renderer.render(scene, camera)
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 25
scene.add(camera)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    render(renderer)
})

// Material
const material = new THREE.MeshLambertMaterial({ color: 0xffffff })

// Lighting
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5)
scene.add(lightAmbient)

const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.8)
scene.add(lightDirectional)

// Move the light source towards us
lightDirectional.position.set(5, 5, 5)

// Figure
class Figure {
	constructor(params) {
		this.params = {
			x: 0,
			y: 0,
			z: 0,
			ry: 0,
			...params
		}
		
		// Create group and add to scene
		this.group = new THREE.Group()
		scene.add(this.group)
		
		// Position according to params
		this.group.position.x = this.params.x
		this.group.position.y = this.params.y
		this.group.position.z = this.params.z
		this.group.rotation.y = this.params.ry
		this.group.scale.set(5, 5, 5)
		
		// Material
		this.headHue = random(0, 360)
		this.bodyHue = random(0, 360)
		this.headLightness = random(40, 65)
		this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` })
		this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` })
	}
	
	createBody() {
		this.body = new THREE.Group()
		const geometry = new THREE.BoxGeometry(1, 1.5, 1)
		const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial)
		
		this.body.add(bodyMain)
		this.group.add(this.body)
		
		this.createLegs()
	}
	
	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group()
		
		// Create the main cube of the head and add to the group
		const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4)
		const headMain = new THREE.Mesh(geometry, this.headMaterial)
		this.head.add(headMain)
		
		// Add the head group to the figure
		this.group.add(this.head)
		
		// Position the head group
		this.head.position.y = 1.65
		
		// Add the eyes
		this.createEyes()
	}
	
	createArms() {
		const height = 0.85
		
		for(let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group()
			const geometry = new THREE.BoxGeometry(0.25, height, 0.25)
			const arm = new THREE.Mesh(geometry, this.headMaterial)
			const m = i % 2 === 0 ? 1 : -1
			
			// Add arm to group
			armGroup.add(arm)
			
			// Add group to figure
			this.body.add(armGroup)
			
			// Translate the arm by half the height
			arm.position.y = height * -0.5
			
			// Position the arm relative to the figure
			armGroup.position.x = m * 0.8
			armGroup.position.y = 0.6
			
			// Rotate the arm
			armGroup.rotation.z = degreesToRadians(30 * m)
		}
	}
	
	createEyes() {
		const eyes = new THREE.Group()
		const geometry = new THREE.SphereGeometry(0.15, 12, 8)
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c })
		
		for(let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(geometry, material)
			const m = i % 2 === 0 ? 1 : -1
			
			eyes.add(eye)
			eye.position.x = 0.36 * m
		}
		
		this.head.add(eyes)
		
		eyes.position.y = -0.1
		eyes.position.z = 0.7
	}
	
	createLegs() {
		const legs = new THREE.Group()
		const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25)
		
		for(let i = 0; i < 2; i++) {
			const leg = new THREE.Mesh(geometry, this.headMaterial)
			const m = i % 2 === 0 ? 1 : -1
			
			legs.add(leg)
			leg.position.x = m * 0.22
		}
		
		this.group.add(legs)
		legs.position.y = -1.15
		
		this.body.add(legs)
	}
	
	init() {
		this.createBody()
		this.createHead()
		this.createArms()
	}
}

const figure = new Figure({
	ry: degreesToRadians(30)
})
figure.init()
center(figure.group)

render()


//
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
        this.group.scale.set(5, 5, 5);
        
        // Material
        this.headHue = random(0, 360);
        this.bodyHue = random(0, 360);
        this.headLightness = random(40, 65);
        this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` });
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` });
        
        this.init(); // Initialize the player parts
    }

    init() {
        this.createBody();
        this.createHead();
        this.createArms();
        this.createLegs();
    }

    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        this.body.add(bodyMain);
        this.group.add(this.body);
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

    createEyes() {
        const eyes = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.15, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

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
        const height = 0.85;
        
        for(let i = 0; i < 2; i++) {
            const armGroup = new THREE.Group();
            const geometry = new THREE.BoxGeometry(0.25, height, 0.25);
            const arm = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;
            
            armGroup.add(arm);
            this.body.add(armGroup);
            
            arm.position.y = height * -0.5;
            armGroup.position.set(m * 0.8, 0.6, 0);
            armGroup.rotation.z = degreesToRadians(30 * m);
            this.arms.push(armGroup);
        }
    }

    createLegs() {
        this.legs = [];
        const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);
        
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
        const angle = Math.atan2(velocity.y, velocity.x);
        this.group.rotation.z = angle - Math.PI / 2; // Adjust to face movement direction
    }
}

// Update and animate player in the main animation loop
const player = new Figure({ x: 0, y: 0, z: 0 });
let velocity = new THREE.Vector3(); // Movement velocity

function movePlayer() {
    if (keys.ArrowUp) velocity.y = 0.1;
    if (keys.ArrowDown) velocity.y = -0.1;
    if (keys.ArrowLeft) velocity.x = -0.1;
    if (keys.ArrowRight) velocity.x = 0.1;

    player.group.position.add(velocity);
    player.updateDirection(velocity);

    // Reset velocity for next frame
    velocity.set(0, 0, 0);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    movePlayer();
    player.animateRun(elapsedTime);

    controls.update();
    renderer.render(scene, camera);
}

animate();
