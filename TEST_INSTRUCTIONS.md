# 🧪 Testing Your Hand-Tracked Coin Toss

## Quick Start

### 1. Start Local Server
```bash
cd /home/user/ixp1final1
python -m http.server 8000
```

### 2. Open in Browser
```
http://localhost:8000
```

### 3. What to Expect

#### **Loading Screen**
- Purple gradient background
- Spinning loader
- Message: "Loading textures and initializing hand tracking..."

#### **When Loaded**
- Camera feed fills entire screen (mirrored)
- 3D coin appears in center with YOUR textures
- Status panel (top left) shows:
  - Weight: Light
  - Acceleration: 0.00
  - Hand: Searching...
  - Result: -
- Control panel (bottom) shows three weight buttons
- Hint at top: "👋 Move your hand upward to flip the coin"

### 4. Testing Checklist

✅ **Texture Loading**
- [ ] Open browser console (F12)
- [ ] Look for "Coin created with PBR materials"
- [ ] Should NOT see "Using fallback color" messages
- [ ] Coin should show your custom front texture initially

✅ **Camera & Hand Tracking**
- [ ] Allow camera permissions when prompted
- [ ] Camera feed shows full-screen mirrored
- [ ] Show your hand to camera
- [ ] Green hand skeleton appears
- [ ] Status shows "Hand: ✓ Detected"

✅ **Coin Appearance**
- [ ] Front face shows your coin_front.png design
- [ ] Metallic reflective appearance
- [ ] Normal map adds surface depth
- [ ] Edge shows your edge texture

✅ **Throwing Mechanics**
- [ ] Make quick upward hand motion
- [ ] Acceleration value spikes above 0.12
- [ ] Coin launches upward
- [ ] Spins on multiple axes
- [ ] Both front and back textures visible during spin

✅ **Weight Testing**
- [ ] Click "Light" button
  - Coin throws high easily
  - Falls slowly
- [ ] Click "Medium" button
  - Moderate throw height
  - Normal fall speed
- [ ] Click "Heavy" button
  - Harder to throw high
  - Falls quickly

✅ **Landing & Results**
- [ ] Coin lands on ground
- [ ] Rotation stops
- [ ] Result shows "HEADS" or "TAILS"
- [ ] Correct texture face is showing
- [ ] Result text turns gold (HEADS) or silver (TAILS)

## Console Verification

Open browser console and look for these messages:

```
✅ Good Messages:
"Initializing Hand-Tracked Coin Toss..."
"Coin created with PBR materials"
"Initialization complete!"
"Application ready!"

❌ Bad Messages (textures failed):
"Using fallback color for front"
"Using fallback color for back"
"Using fallback color for edge"
"Texture loading error:"
```

## Performance Check

### Expected FPS
- **3D Rendering**: 60 FPS
- **Hand Tracking**: 30-60 FPS
- **Physics**: 60 Hz

### If Slow
1. Close other browser tabs
2. Check CPU usage
3. Try lowering camera resolution in main.js:
   ```javascript
   // Line ~525
   width: 640,   // Lower from 1280
   height: 480   // Lower from 720
   ```

## Troubleshooting

### Textures Don't Load
**Symptoms**: Coin is plain gold/silver
**Fix**:
- Ensure you're using `http://localhost:8000` NOT `file://`
- Check browser console for errors
- Verify all 5 PNG files are in `/assets/` folder

### Hand Not Detected
**Symptoms**: "Hand: Not Found" in status
**Fix**:
- Improve lighting
- Move hand closer to camera
- Ensure hand is fully visible
- Check camera permissions

### Coin Won't Throw
**Symptoms**: Moving hand doesn't trigger toss
**Fix**:
- Make FASTER upward motion
- Watch "Acceleration" value - must exceed 0.12
- Try lowering threshold in main.js line 34:
  ```javascript
  accelerationThreshold: 0.08  // Lower = easier
  ```

### Low FPS
**Symptoms**: Choppy animation
**Fix**:
- Close other apps
- Use Chrome (best performance)
- Lower texture quality if needed
- Reduce coin segments in main.js line 29:
  ```javascript
  segments: 32  // Lower from 64
  ```

## Browser Console Commands

Open console (F12) and try these:

```javascript
// Check if textures loaded
console.log(state.texturesLoaded);  // Should be true

// Check current physics
console.log(state.gravity);         // -9.8, -16.0, or -24.0
console.log(state.velocityMultiplier);  // 1.0, 0.7, or 0.4

// Manual coin throw (for testing)
throwCoin(0.15);  // Throws with acceleration 0.15

// Reset coin position
resetCoin();
```

## Advanced Testing

### Texture Quality Check
1. Pause animation when coin is visible
2. Take screenshot
3. Verify:
   - Sharp texture details
   - No blurry edges
   - Proper metallic reflections
   - Normal map depth visible

### Physics Accuracy
1. Throw light coin - count seconds in air
2. Throw heavy coin - count seconds in air
3. Heavy should be significantly faster

### Mobile Testing
1. Open on phone/tablet
2. Use landscape orientation for best view
3. Touch controls should work
4. Camera should work on mobile browsers

## Success Criteria

Your app is working perfectly if:

✅ All 5 textures load without fallback colors
✅ Coin shows your custom front design initially
✅ Camera feed displays full-screen
✅ Hand tracking works smoothly
✅ Quick upward motions trigger throws
✅ Coin spins showing both your textures
✅ Three weight options behave differently
✅ Landing shows correct HEADS/TAILS
✅ Performance is 60 FPS
✅ Mobile devices work properly

---

**Ready to test? Fire up that local server!** 🚀
