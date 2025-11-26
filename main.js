// ============================================
// CONFIGURATION AND GLOBAL STATE
// ============================================

const CONFIG = {
    // Physics constants for different weights
    WEIGHTS: {
        light: {
            gravity: -9.8,
            velocityMultiplier: 1.0,
            label: 'Light'
        },
        medium: {
            gravity: -16.0,
            velocityMultiplier: 0.7,
            label: 'Medium'
        },
        heavy: {
            gravity: -24.0,
            velocityMultiplier: 0.4,
            label: 'Heavy'
        }
    },

    // Coin dimensions
    COIN: {
        radius: 1,
        thickness: 0.1,
        segments: 64
    },

    // Hand tracking thresholds
    HAND: {
        accelerationThreshold: 0.05,  // Lower = more sensitive (was 0.12)
        velocitySmoothing: 0.2,       // Lower = more responsive (was 0.3)
        positionHistory: 5
    },

    // Physics simulation
    PHYSICS: {
        timeStep: 1 / 60,
        groundLevel: -0.5,  // Raised from -3 to keep coin visible
        initialHeight: 0,
        damping: 0.98,
        rotationMultiplier: 15
    }
};

// Application state
const state = {
    // Current weight settings
    currentWeight: 'light',
    gravity: CONFIG.WEIGHTS.light.gravity,
    velocityMultiplier: CONFIG.WEIGHTS.light.velocityMultiplier,

    // Coin physics
    coinPosition: new THREE.Vector3(0, CONFIG.PHYSICS.initialHeight, 0),
    coinVelocity: new THREE.Vector3(0, 0, 0),
    coinRotation: new THREE.Euler(0, 0, 0),
    coinAngularVelocity: new THREE.Vector3(0, 0, 0),
    isFlying: false,

    // Hand tracking
    handPositionHistory: [],
    handVelocityY: 0,
    handAccelerationY: 0,
    lastHandY: null,
    lastVelocityY: 0,
    handDetected: false,

    // Result
    result: null,

    // Loading
    texturesLoaded: false,
    cameraReady: false
};

// ============================================
// THREE.JS SCENE SETUP
// ============================================

let scene, camera, renderer, coin, coinGroup;
let textureLoader, pmremGenerator, envMap;

function initThreeJS() {
    const container = document.getElementById('coin-container');

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);

    // Create renderer with transparency
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Create environment map for reflections
    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    createEnvironmentMap();

    // Add lights
    setupLights();

    // Create coin group
    coinGroup = new THREE.Group();
    scene.add(coinGroup);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createEnvironmentMap() {
    // Create a simple gradient environment map
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            void main() {
                vec3 topColor = vec3(0.5, 0.6, 0.8);
                vec3 bottomColor = vec3(0.1, 0.1, 0.2);
                vec3 color = mix(bottomColor, topColor, vUv.y);
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderTarget = new THREE.WebGLRenderTarget(512, 512);
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    envMap = pmremGenerator.fromEquirectangular(renderTarget.texture).texture;
    renderTarget.dispose();
}

function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Point light for metallic highlights
    const pointLight = new THREE.PointLight(0xffd700, 1.5, 50);
    pointLight.position.set(0, 5, 3);
    scene.add(pointLight);
}

// ============================================
// COIN CREATION WITH PBR MATERIALS
// ============================================

function fixCoinUVMapping(geometry) {
    // Get UV attribute
    const uvAttribute = geometry.attributes.uv;
    const positionAttribute = geometry.attributes.position;

    // Calculate the number of vertices for one cap
    const segments = CONFIG.COIN.segments;
    const capVertexCount = segments + 1;

    // Fix UVs for both caps (top and bottom)
    // The caps are at the end of the vertex array in CylinderGeometry
    const totalVertices = positionAttribute.count;
    const topCapStart = totalVertices - capVertexCount * 2;
    const bottomCapStart = totalVertices - capVertexCount;

    // Fix top cap UVs (HEADS)
    for (let i = 0; i < capVertexCount; i++) {
        const index = topCapStart + i;
        const x = positionAttribute.getX(index);
        const z = positionAttribute.getZ(index);

        // Map to full 0-1 range for entire circle
        const u = (x / CONFIG.COIN.radius + 1) * 0.5;
        const v = (z / CONFIG.COIN.radius + 1) * 0.5;

        uvAttribute.setXY(index, u, v);
    }

    // Fix bottom cap UVs (TAILS)
    for (let i = 0; i < capVertexCount; i++) {
        const index = bottomCapStart + i;
        const x = positionAttribute.getX(index);
        const z = positionAttribute.getZ(index);

        // Map to full 0-1 range for entire circle
        const u = (x / CONFIG.COIN.radius + 1) * 0.5;
        const v = (z / CONFIG.COIN.radius + 1) * 0.5;

        uvAttribute.setXY(index, u, v);
    }

    // Mark UVs as needing update
    uvAttribute.needsUpdate = true;
}

async function loadTextures() {
    textureLoader = new THREE.TextureLoader();

    return new Promise((resolve, reject) => {
        const textures = {
            frontColor: null,
            backColor: null,
            edgeColor: null,
            frontNormal: null,
            backNormal: null
        };

        let loadedCount = 0;
        const totalTextures = 5;

        const onLoad = () => {
            loadedCount++;
            if (loadedCount === totalTextures) {
                resolve(textures);
            }
        };

        const onError = (error) => {
            console.warn('Texture loading error:', error);
            loadedCount++;
            if (loadedCount === totalTextures) {
                resolve(textures);
            }
        };

        // Load color maps
        textureLoader.load('assets/coin_front.png',
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                textures.frontColor = texture;
                onLoad();
            },
            undefined,
            onError
        );

        textureLoader.load('assets/coin_back.png',
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                textures.backColor = texture;
                onLoad();
            },
            undefined,
            onError
        );

        textureLoader.load('assets/coin_edge.png',
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.wrapS = THREE.RepeatWrapping;
                texture.repeat.x = 10;
                textures.edgeColor = texture;
                onLoad();
            },
            undefined,
            onError
        );

        // Load normal maps
        textureLoader.load('assets/coin_front_normal.png',
            (texture) => {
                textures.frontNormal = texture;
                onLoad();
            },
            undefined,
            onError
        );

        textureLoader.load('assets/coin_back_normal.png',
            (texture) => {
                textures.backNormal = texture;
                onLoad();
            },
            undefined,
            onError
        );
    });
}

async function createCoin() {
    const textures = await loadTextures();

    // Create cylinder geometry
    const geometry = new THREE.CylinderGeometry(
        CONFIG.COIN.radius,
        CONFIG.COIN.radius,
        CONFIG.COIN.thickness,
        CONFIG.COIN.segments
    );

    // Fix UV mapping for coin caps to fill entire circle
    fixCoinUVMapping(geometry);

    // Create materials array for different faces
    const materials = [];

    // Edge material (index 0)
    const edgeMaterial = new THREE.MeshStandardMaterial({
        map: textures.edgeColor,
        metalness: 1.0,
        roughness: 0.3,
        envMap: envMap,
        envMapIntensity: 1.5
    });
    materials.push(edgeMaterial);

    // Top face material - Front (HEADS) (index 1)
    const frontMaterial = new THREE.MeshStandardMaterial({
        map: textures.frontColor,
        normalMap: textures.frontNormal,
        metalness: 1.0,
        roughness: 0.25,
        envMap: envMap,
        envMapIntensity: 1.5
    });
    materials.push(frontMaterial);

    // Bottom face material - Back (TAILS) (index 2)
    const backMaterial = new THREE.MeshStandardMaterial({
        map: textures.backColor,
        normalMap: textures.backNormal,
        metalness: 1.0,
        roughness: 0.25,
        envMap: envMap,
        envMapIntensity: 1.5
    });
    materials.push(backMaterial);

    // If textures didn't load, use fallback colors
    if (!textures.frontColor) {
        frontMaterial.color.setHex(0xFFD700); // Gold
        console.log('Using fallback color for front');
    }
    if (!textures.backColor) {
        backMaterial.color.setHex(0xC0C0C0); // Silver
        console.log('Using fallback color for back');
    }
    if (!textures.edgeColor) {
        edgeMaterial.color.setHex(0xB8860B); // Dark gold
        console.log('Using fallback color for edge');
    }

    // Create coin mesh
    coin = new THREE.Mesh(geometry, materials);
    coin.castShadow = true;
    coin.receiveShadow = true;

    // Rotate to show front initially
    coin.rotation.x = 0;

    coinGroup.add(coin);
    state.texturesLoaded = true;

    console.log('Coin created with PBR materials');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// PHYSICS SYSTEM
// ============================================

function updatePhysics(deltaTime) {
    if (!state.isFlying) return;

    // Apply gravity
    state.coinVelocity.y += state.gravity * deltaTime;

    // Update position
    state.coinPosition.add(
        state.coinVelocity.clone().multiplyScalar(deltaTime)
    );

    // Apply angular velocity (rotation)
    state.coinRotation.x += state.coinAngularVelocity.x * deltaTime;
    state.coinRotation.y += state.coinAngularVelocity.y * deltaTime;
    state.coinRotation.z += state.coinAngularVelocity.z * deltaTime;

    // Apply damping to angular velocity
    state.coinAngularVelocity.multiplyScalar(CONFIG.PHYSICS.damping);

    // Check ground collision
    if (state.coinPosition.y <= CONFIG.PHYSICS.groundLevel) {
        landCoin();
    }

    // Update Three.js objects
    coinGroup.position.copy(state.coinPosition);
    coin.rotation.copy(state.coinRotation);
}

function throwCoin(acceleration) {
    if (state.isFlying) return;

    // Calculate throw velocity based on acceleration and weight
    const throwStrength = acceleration * 100 * state.velocityMultiplier;

    // Set initial velocity
    state.coinVelocity.set(0, throwStrength, 0);

    // Set random angular velocity for spinning
    const randomSpinX = (Math.random() - 0.5) * CONFIG.PHYSICS.rotationMultiplier;
    const randomSpinY = (Math.random() - 0.5) * CONFIG.PHYSICS.rotationMultiplier * 0.5;
    const randomSpinZ = (Math.random() - 0.5) * CONFIG.PHYSICS.rotationMultiplier * 0.3;

    state.coinAngularVelocity.set(randomSpinX, randomSpinY, randomSpinZ);

    state.isFlying = true;
    state.result = null;

    // Update UI
    updateStatusDisplay('result', '-');
    document.getElementById('result').className = 'status-value result-text';

    console.log(`Coin thrown! Acceleration: ${acceleration.toFixed(4)}, Velocity: ${throwStrength.toFixed(2)}`);
}

function landCoin() {
    state.isFlying = false;
    state.coinVelocity.set(0, 0, 0);
    state.coinAngularVelocity.set(0, 0, 0);
    state.coinPosition.y = CONFIG.PHYSICS.groundLevel;

    // Determine result based on rotation
    // Normalize rotation to determine which face is up
    const xRot = state.coinRotation.x % (Math.PI * 2);
    const normalizedRot = xRot < 0 ? xRot + Math.PI * 2 : xRot;

    // If coin is facing up (0 to PI/2 or 3PI/2 to 2PI), it's HEADS
    // Otherwise it's TAILS
    let result;
    if ((normalizedRot >= 0 && normalizedRot < Math.PI / 2) ||
        (normalizedRot >= 3 * Math.PI / 2 && normalizedRot < 2 * Math.PI)) {
        result = 'HEADS';
        // Settle to exact heads position
        state.coinRotation.x = 0;
    } else {
        result = 'TAILS';
        // Settle to exact tails position
        state.coinRotation.x = Math.PI;
    }

    state.result = result;

    // Update UI with result
    updateStatusDisplay('result', result);
    const resultElement = document.getElementById('result');
    resultElement.className = `status-value result-text ${result.toLowerCase()}`;

    // Animate settling
    animateSettle();

    console.log(`Coin landed: ${result} (rotation: ${(normalizedRot * 180 / Math.PI).toFixed(2)}°)`);
}

function animateSettle() {
    const duration = 500;
    const startTime = Date.now();
    const startRotY = coin.rotation.y;
    const targetRotY = Math.round(startRotY / (Math.PI * 2)) * Math.PI * 2;

    function settle() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        coin.rotation.y = startRotY + (targetRotY - startRotY) * eased;

        if (progress < 1) {
            requestAnimationFrame(settle);
        }
    }

    settle();
}

function resetCoin() {
    state.coinPosition.set(0, CONFIG.PHYSICS.initialHeight, 0);
    state.coinVelocity.set(0, 0, 0);
    state.coinRotation.set(0, 0, 0);
    state.coinAngularVelocity.set(0, 0, 0);
    state.isFlying = false;
    state.result = null;

    if (coin) {
        coinGroup.position.copy(state.coinPosition);
        coin.rotation.copy(state.coinRotation);
    }
}

// ============================================
// HAND TRACKING WITH MEDIAPIPE
// ============================================

let hands, cameraMP;

function initHandTracking() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('hand-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    // Initialize MediaPipe Hands
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults((results) => onHandResults(results, canvasCtx));

    // Set up camera
    cameraMP = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });

    cameraMP.start().then(() => {
        state.cameraReady = true;
        checkLoadingComplete();
    });

    // Set canvas size
    function resizeCanvas() {
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function onHandResults(results, canvasCtx) {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        state.handDetected = true;
        updateStatusDisplay('hand-status', '✓ Detected');

        const landmarks = results.multiHandLandmarks[0];

        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: 'rgba(0, 255, 100, 0.8)',
            lineWidth: 4
        });
        drawLandmarks(canvasCtx, landmarks, {
            color: 'rgba(255, 100, 0, 0.9)',
            lineWidth: 2,
            radius: 6
        });

        // Calculate hand acceleration
        processHandMovement(landmarks);
    } else {
        state.handDetected = false;
        state.handPositionHistory = [];
        state.lastHandY = null;
        state.handVelocityY = 0;
        state.handAccelerationY = 0;
        updateStatusDisplay('hand-status', 'Not Found');
        updateStatusDisplay('acceleration', '0.00');
    }

    canvasCtx.restore();
}

function processHandMovement(landmarks) {
    // Use palm center (landmark 9)
    const palmLandmark = landmarks[9];
    const currentHandY = palmLandmark.y;

    // Add to position history
    state.handPositionHistory.push(currentHandY);
    if (state.handPositionHistory.length > CONFIG.HAND.positionHistory) {
        state.handPositionHistory.shift();
    }

    // Calculate velocity (change in position)
    if (state.lastHandY !== null) {
        const rawVelocityY = state.lastHandY - currentHandY; // Positive = upward

        // Smooth velocity
        state.handVelocityY = state.handVelocityY * CONFIG.HAND.velocitySmoothing +
                              rawVelocityY * (1 - CONFIG.HAND.velocitySmoothing);

        // Calculate acceleration (change in velocity)
        const rawAccelerationY = state.handVelocityY - state.lastVelocityY;

        // Smooth acceleration
        state.handAccelerationY = rawAccelerationY;

        // Update UI
        updateStatusDisplay('acceleration', state.handAccelerationY.toFixed(3));

        // Check for throw gesture (upward acceleration exceeds threshold)
        if (state.handAccelerationY > CONFIG.HAND.accelerationThreshold && !state.isFlying) {
            throwCoin(state.handAccelerationY);
        }

        state.lastVelocityY = state.handVelocityY;
    }

    state.lastHandY = currentHandY;
}

// ============================================
// UI CONTROLS
// ============================================

function initUI() {
    // Weight button listeners
    const weightButtons = document.querySelectorAll('.weight-btn');
    weightButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all
            weightButtons.forEach(btn => btn.classList.remove('active'));

            // Add active to clicked
            button.classList.add('active');

            // Update state
            const weight = button.dataset.weight;
            const weightConfig = CONFIG.WEIGHTS[weight];

            state.currentWeight = weight;
            state.gravity = weightConfig.gravity;
            state.velocityMultiplier = weightConfig.velocityMultiplier;

            updateStatusDisplay('current-weight', weightConfig.label);

            // Reset coin if not flying
            if (!state.isFlying) {
                resetCoin();
            }

            console.log(`Weight changed to: ${weight}`);
        });
    });

    // Initialize displays
    updateStatusDisplay('current-weight', CONFIG.WEIGHTS[state.currentWeight].label);
    updateStatusDisplay('acceleration', '0.00');
    updateStatusDisplay('hand-status', 'Initializing...');
    updateStatusDisplay('result', '-');
}

function updateStatusDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function checkLoadingComplete() {
    if (state.texturesLoaded && state.cameraReady) {
        const loadingOverlay = document.getElementById('loading');
        loadingOverlay.classList.add('hidden');
        console.log('Application ready!');
    }
}

// ============================================
// ANIMATION LOOP
// ============================================

let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
    lastTime = currentTime;

    // Update physics
    updatePhysics(deltaTime);

    // Render scene
    renderer.render(scene, camera);
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('Initializing Hand-Tracked Coin Toss...');

    try {
        // Initialize Three.js
        initThreeJS();

        // Initialize UI
        initUI();

        // Load textures and create coin
        await createCoin();

        // Initialize hand tracking
        initHandTracking();

        // Start animation loop
        animate();

        console.log('Initialization complete!');
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading').innerHTML =
            '<div style="color: white; padding: 20px; text-align: center;">' +
            '<h2>Error Loading Application</h2>' +
            '<p>' + error.message + '</p>' +
            '<p>Please ensure all textures are in the /assets/ folder.</p>' +
            '</div>';
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
