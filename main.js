// ============================================
// GLOBAL STATE AND CONFIGURATION
// ============================================

const CONFIG = {
    // Physics constants
    GRAVITY: 0.008,
    GROUND_LEVEL: -2,
    INITIAL_COIN_HEIGHT: 0,

    // Hand tracking
    VELOCITY_THRESHOLD: 0.015, // Minimum upward velocity to trigger toss
    VELOCITY_MULTIPLIER: 50,   // Convert hand velocity to coin velocity

    // Weights affect gravity multiplier and initial force
    WEIGHTS: {
        1: { label: 'Light', gravityMult: 0.7, forceMult: 1.5 },
        2: { label: 'Medium', gravityMult: 1.0, forceMult: 1.0 },
        3: { label: 'Heavy', gravityMult: 1.5, forceMult: 0.7 }
    }
};

// Application state
const state = {
    selectedWeight: 1,
    coinVelocityY: 0,
    coinPositionY: CONFIG.INITIAL_COIN_HEIGHT,
    coinRotationX: 0,
    coinRotationVelocity: 0,
    isFlying: false,
    lastHandY: null,
    handVelocityY: 0,
    result: null,
    handDetected: false
};

// ============================================
// THREE.JS SETUP - 3D COIN RENDERING
// ============================================

let scene, camera, renderer, coin, coinGroup;

function initThreeJS() {
    const container = document.getElementById('coin-container');

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffd700, 1, 100);
    pointLight.position.set(0, 3, 3);
    scene.add(pointLight);

    // Create coin group (for easier rotation management)
    coinGroup = new THREE.Group();
    scene.add(coinGroup);

    // Create coin (cylinder shape)
    const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);

    // Create materials for heads and tails
    const headsMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x332200
    });

    const tailsMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x111111
    });

    // Create coin mesh with different materials for top and bottom
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.7, roughness: 0.3 }), // edge
        headsMaterial, // top (heads)
        tailsMaterial  // bottom (tails)
    ];

    coin = new THREE.Mesh(coinGeometry, materials);
    coin.castShadow = true;
    coin.receiveShadow = true;
    coinGroup.add(coin);

    // Add text labels to coin (simple approach using shapes)
    addCoinLabel('H', 0.06, 0xffffff, true);  // Heads
    addCoinLabel('T', 0.06, 0x333333, false); // Tails

    // Add ground plane for visual reference
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x16213e,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = CONFIG.GROUND_LEVEL;
    ground.receiveShadow = true;
    scene.add(ground);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function addCoinLabel(text, height, color, isTop) {
    const loader = new THREE.FontLoader();
    // Create simple text geometry using shapes
    const shapes = createTextShapes(text);
    const geometry = new THREE.ShapeGeometry(shapes);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3
    });
    const textMesh = new THREE.Mesh(geometry, material);

    // Position text on coin face
    textMesh.position.y = isTop ? height : -height;
    textMesh.rotation.x = isTop ? -Math.PI / 2 : Math.PI / 2;
    textMesh.scale.set(0.01, 0.01, 0.01);

    coin.add(textMesh);
}

function createTextShapes(text) {
    // Simple shape for letters (simplified for demo)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 100);
    shape.lineTo(60, 100);
    shape.lineTo(60, 0);
    shape.lineTo(0, 0);
    return [shape];
}

function onWindowResize() {
    const container = document.getElementById('coin-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ============================================
// PHYSICS SYSTEM - MANUAL IMPLEMENTATION
// ============================================

function updatePhysics() {
    if (state.isFlying) {
        const weight = state.selectedWeight;
        const weightConfig = CONFIG.WEIGHTS[weight];

        // Apply gravity (adjusted by weight)
        const gravity = CONFIG.GRAVITY * weightConfig.gravityMult;
        state.coinVelocityY -= gravity;

        // Update position
        state.coinPositionY += state.coinVelocityY;

        // Update rotation (spinning effect)
        state.coinRotationVelocity += 0.001;
        state.coinRotationX += state.coinRotationVelocity;

        // Check if coin hit the ground
        if (state.coinPositionY <= CONFIG.GROUND_LEVEL + 0.5) {
            landCoin();
        }

        // Update Three.js coin position and rotation
        coinGroup.position.y = state.coinPositionY;
        coin.rotation.x = state.coinRotationX;
        coin.rotation.y += 0.02; // Slight Y rotation for visual effect
    }
}

function tossCoin(handVelocity) {
    if (state.isFlying) return; // Don't toss if already flying

    const weight = state.selectedWeight;
    const weightConfig = CONFIG.WEIGHTS[weight];

    // Calculate initial velocity based on hand velocity and weight
    const initialVelocity = handVelocity * CONFIG.VELOCITY_MULTIPLIER * weightConfig.forceMult;

    // Set coin state
    state.isFlying = true;
    state.coinVelocityY = initialVelocity;
    state.coinRotationVelocity = 0.15; // Initial rotation speed
    state.result = null;

    // Update UI
    updateStatusDisplay('toss-force', initialVelocity.toFixed(2));
    updateStatusDisplay('result', '-');
    document.getElementById('result').className = 'status-value result-text';

    console.log(`Coin tossed! Force: ${initialVelocity.toFixed(2)}, Weight: ${weight}`);
}

function landCoin() {
    // Stop coin movement
    state.isFlying = false;
    state.coinPositionY = CONFIG.GROUND_LEVEL + 0.5;
    state.coinVelocityY = 0;

    // Determine result based on rotation
    // Normalize rotation to 0-2π range
    const normalizedRotation = state.coinRotationX % (Math.PI * 2);
    const rotationDegrees = (normalizedRotation * 180 / Math.PI) % 360;

    // If the coin is facing up (0-90 or 270-360), it's heads, otherwise tails
    let result;
    if ((rotationDegrees >= 0 && rotationDegrees < 90) ||
        (rotationDegrees >= 270 && rotationDegrees < 360)) {
        result = 'HEADS';
    } else {
        result = 'TAILS';
    }

    state.result = result;

    // Update UI
    updateStatusDisplay('result', result);
    const resultElement = document.getElementById('result');
    resultElement.className = `status-value result-text ${result.toLowerCase()}`;

    // Settle coin to final position
    settleAnimation();

    console.log(`Coin landed: ${result} (rotation: ${rotationDegrees.toFixed(2)}°)`);
}

function settleAnimation() {
    // Animate coin settling to final rotation
    let settleDuration = 30;
    let settleCount = 0;

    const settleInterval = setInterval(() => {
        if (settleCount >= settleDuration) {
            clearInterval(settleInterval);
            // Final rotation adjustment
            const targetRotation = state.result === 'HEADS' ? 0 : Math.PI;
            coin.rotation.x = targetRotation;
            state.coinRotationX = targetRotation;
            return;
        }

        // Gradually slow down rotation
        coin.rotation.y += 0.02 * (1 - settleCount / settleDuration);
        settleCount++;
    }, 16);
}

function resetCoin() {
    state.coinPositionY = CONFIG.INITIAL_COIN_HEIGHT;
    state.coinVelocityY = 0;
    state.coinRotationX = 0;
    state.coinRotationVelocity = 0;
    state.isFlying = false;
    state.result = null;

    coinGroup.position.y = state.coinPositionY;
    coin.rotation.x = 0;
    coin.rotation.y = 0;
}

// ============================================
// MEDIAPIPE HAND TRACKING
// ============================================

let hands, camera_hands;

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
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => onHandResults(results, canvasCtx));

    // Set up camera
    camera_hands = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera_hands.start();

    // Set canvas size
    canvasElement.width = 640;
    canvasElement.height = 480;
}

function onHandResults(results, canvasCtx) {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    // Draw video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        state.handDetected = true;
        updateStatusDisplay('hand-status', 'Detected ✓');

        // Get hand landmarks
        const landmarks = results.multiHandLandmarks[0];

        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });

        // Get palm position (landmark 9 is middle of palm)
        const palmLandmark = landmarks[9];
        const currentHandY = palmLandmark.y;

        // Calculate hand velocity
        if (state.lastHandY !== null) {
            const velocityY = state.lastHandY - currentHandY; // Positive = upward movement
            state.handVelocityY = velocityY;

            // Detect toss gesture (quick upward movement)
            if (velocityY > CONFIG.VELOCITY_THRESHOLD && !state.isFlying) {
                tossCoin(velocityY);
            }
        }

        state.lastHandY = currentHandY;
    } else {
        state.handDetected = false;
        state.lastHandY = null;
        state.handVelocityY = 0;
        updateStatusDisplay('hand-status', 'Not Detected');
    }

    canvasCtx.restore();
}

// ============================================
// UI CONTROLS AND UPDATES
// ============================================

function initUI() {
    // Weight button listeners
    const weightButtons = document.querySelectorAll('.weight-btn');
    weightButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            weightButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Update selected weight
            const weight = parseInt(button.dataset.weight);
            state.selectedWeight = weight;

            updateStatusDisplay('current-weight', weight);

            // Reset coin when weight changes
            if (!state.isFlying) {
                resetCoin();
            }
        });
    });

    // Initialize displays
    updateStatusDisplay('current-weight', state.selectedWeight);
    updateStatusDisplay('toss-force', '0.0');
    updateStatusDisplay('hand-status', 'Initializing...');
    updateStatusDisplay('result', '-');
}

function updateStatusDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    // Update physics
    updatePhysics();

    // Render Three.js scene
    renderer.render(scene, camera);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('Initializing Hand-Tracked Coin Toss...');

    // Initialize all systems
    initThreeJS();
    initUI();
    initHandTracking();

    // Start animation loop
    animate();

    console.log('Application initialized successfully!');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
