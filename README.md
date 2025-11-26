# Hand-Tracked 3D Coin Toss Web App

A fully interactive web application that uses hand tracking to control a 3D coin toss simulation with realistic physics.

## 🎯 Features

- **Hand Tracking**: Uses MediaPipe Hands to track your right hand movements in real-time
- **3D Coin Rendering**: Beautiful 3D coin rendered with Three.js
- **Three Weight Options**: Choose between Light, Medium, and Heavy coins with different physics properties
- **Manual Physics**: Custom-built physics system (no engine) with realistic gravity and rotation
- **Toss Detection**: Automatically detects upward hand movements and converts them to throwing force
- **Heads/Tails Results**: Determines the outcome based on the coin's final rotation

## 🚀 How to Run

### Option 1: Direct Browser Opening
1. Simply open `index.html` in a modern web browser (Chrome, Firefox, or Edge recommended)
2. Allow camera permissions when prompted
3. Start tossing coins with your hand!

### Option 2: Local Web Server (Recommended)
For best performance, use a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser and navigate to: `http://localhost:8000`

## 🎮 How to Use

1. **Camera Setup**: Position yourself so your hand is visible in the webcam feed (shown on the left)

2. **Select Weight**: Click one of the three weight buttons:
   - **Light (Weight: 1)**: Falls slowly, easy to toss high
   - **Medium (Weight: 2)**: Normal falling speed, balanced force
   - **Heavy (Weight: 3)**: Falls quickly, requires more force

3. **Toss the Coin**:
   - Show your right hand to the camera
   - Make a quick upward movement with your palm
   - The faster you move up, the higher the coin will fly!

4. **View Results**: Watch the coin spin in 3D and land on either HEADS or TAILS

## 📊 Status Panel

The status panel displays:
- **Selected Weight**: Currently active coin weight
- **Toss Force**: The force applied to the last toss
- **Hand Status**: Whether your hand is detected
- **Result**: The outcome of the coin toss (Heads or Tails)

## 🔧 Technical Details

### Physics System
The app uses a custom physics implementation:

```javascript
// Gravity application (affected by weight)
velocityY -= gravity * weightMultiplier;

// Position update
positionY += velocityY;

// Initial velocity calculation
initialVelocity = handVelocity * multiplier * (1 / weight);
```

### Weight Properties
- **Light (1)**: Gravity multiplier = 0.7, Force multiplier = 1.5
- **Medium (2)**: Gravity multiplier = 1.0, Force multiplier = 1.0
- **Heavy (3)**: Gravity multiplier = 1.5, Force multiplier = 0.7

### Hand Tracking
- Uses MediaPipe Hands for real-time hand landmark detection
- Tracks palm position (landmark 9) for velocity calculation
- Minimum velocity threshold: 0.015
- Detects upward movement by comparing Y coordinates over time

### Result Determination
The coin's result is determined by its final rotation angle:
- **Heads**: Rotation 0°-90° or 270°-360°
- **Tails**: Rotation 90°-270°

## 📦 Dependencies (Loaded via CDN)

All dependencies are loaded automatically via CDN:
- **Three.js** (r128): 3D rendering engine
- **MediaPipe Hands**: Hand tracking and landmark detection
- **MediaPipe Camera Utils**: Camera management
- **MediaPipe Drawing Utils**: Hand visualization

No installation required!

## 🌐 Browser Compatibility

Works best on:
- Google Chrome (recommended)
- Microsoft Edge
- Mozilla Firefox
- Safari (macOS)

**Note**: Requires a device with a webcam and support for WebGL and getUserMedia API.

## 🐛 Troubleshooting

### Hand Not Detected
- Ensure good lighting conditions
- Make sure your hand is fully visible in the camera frame
- Try moving closer or further from the camera
- Check that camera permissions are granted

### Coin Not Tossing
- Make a quicker upward motion with your hand
- Ensure the hand is detected (check status panel)
- Try increasing the speed of your upward gesture

### Poor Performance
- Close other browser tabs
- Use a local web server instead of file:// protocol
- Ensure hardware acceleration is enabled in your browser

## 📝 File Structure

```
├── index.html    # Main HTML structure with CDN links
├── style.css     # Complete styling and responsive design
├── main.js       # Core application logic (Three.js + MediaPipe + Physics)
└── README.md     # This file
```

## 🎨 Customization

You can easily customize the app by modifying constants in `main.js`:

```javascript
const CONFIG = {
    GRAVITY: 0.008,              // Base gravity strength
    VELOCITY_THRESHOLD: 0.015,   // Minimum velocity to trigger toss
    VELOCITY_MULTIPLIER: 50,     // Hand velocity to coin velocity conversion
    // ... more settings
};
```

## 🎓 Educational Value

This project demonstrates:
- Real-time hand tracking with MediaPipe
- 3D rendering with Three.js
- Custom physics implementation
- DOM manipulation and event handling
- Responsive web design
- Integration of multiple libraries via CDN

## 📄 License

This is a demonstration project. Feel free to use and modify as needed!

## 🤝 Contributing

This is a standalone demonstration project. Feel free to fork and enhance!

---

**Enjoy your hand-tracked coin tosses! 🪙✋**
