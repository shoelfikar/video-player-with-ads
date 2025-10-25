# Video Player with Ad System

A modern HTML5-based video player with integrated ad system, complete controls, and responsive interface.

## Key Features

### 1. Ad System
- **Pre-roll Ads**: Ads automatically play before the main video
- **Skip Button**: Skip button appears after 5 seconds
- **Ad Timer**: Countdown showing remaining ad time
- **Ad Badge**: Visual indicator showing ad is playing
- **Loading Indicator**: Loading spinner during ad buffering

### 2. Complete Video Controls
- **Play/Pause**: Playback control via button or video click
- **Progress Bar**: Interactive progress bar with handle
- **Time Display**: Shows current time and total duration
- **Volume Control**: Volume slider and mute/unmute button
- **Fullscreen**: Full-screen mode with toggle button
- **Skip Controls**: Skip backward/forward 10 seconds buttons

### 3. Advanced Settings
- **Playback Speed**:
  - 0.5x
  - 0.75x
  - Normal (1x)
  - 1.25x
  - 1.5x
  - 2x

- **Quality Settings**:
  - Auto
  - 1080p
  - 720p
  - 480p
  - 360p

### 4. Video Information
- **Video Title**: Video title displayed on hover
- **Video Description**: Brief video description
- **Auto-hide Controls**: Controls automatically hide when not interacting

### 5. Keyboard Shortcuts
- `Space` / `K`: Play/Pause
- `Arrow Left`: Rewind 10 seconds
- `Arrow Right`: Forward 10 seconds
- `Arrow Up`: Increase volume
- `Arrow Down`: Decrease volume
- `F`: Toggle fullscreen
- `M`: Mute/Unmute

## Technologies Used

- **HTML5 Video API**: For video playback
- **Tailwind CSS**: CSS framework for styling
- **Vanilla JavaScript**: For all interactions and controls

## File Structure

```
video-player/
├── index.html          # Main file containing HTML, CSS, and JavaScript
└── README.md          # This documentation
```

## How to Use

### 1. Open File
Simply open the [index.html](index.html) file in a modern browser (Chrome, Firefox, Safari, Edge)

### 2. Playback Flow
1. Click the red play button in the center
2. The ad will play first
3. Wait 5 seconds or click "Skip Ad" to skip
4. The main video will play after the ad finishes

### 3. Video Controls
- Click video to pause/play
- Hover to display controls
- Click settings icon (⚙️) to adjust speed and quality
- Drag progress bar to seek to specific time

## Main Components

### Video Elements
```html
<video id="thumbnailVideo">   <!-- Initial thumbnail -->
<video id="adVideo">          <!-- Ad video -->
<video id="mainVideo">        <!-- Main video -->
```

### Overlay Elements
- **Play Overlay**: Initial play button
- **Ad Overlay**: Ad overlay with timer and skip button
- **Main Video Controls**: Complete controls for main video

## UI/UX Features

### 1. Responsive Design
- Responsive layout for various screen sizes
- Touch-friendly controls for mobile

### 2. Visual Feedback
- Loading spinner during buffering
- Smooth transitions and hover effects
- Interactive progress bar with handle

### 3. Auto-hide Controls
- Controls automatically hide after 3 seconds of no interaction
- Reappear when mouse moves or video is paused

### 4. Professional Styling
- Gradient overlays for optimal contrast
- Rounded corners and shadows for depth
- Modern color scheme (black, red, gray)

## Customization

### Changing Videos
Edit the video source URL in the `<source>` tag:

```javascript
// For main video
<source src="YOUR_VIDEO_URL" type="video/mp4">

// For ad video
<source src="YOUR_AD_URL" type="video/mp4">
```

### Changing Skip Ad Duration
Edit the value in JavaScript:

```javascript
// Change the number 5 as desired (in seconds)
if (currentTime >= 5) {
    // ...
}
```

### Changing Video Information
Edit HTML content:

```html
<h2 id="videoTitle">Your Video Title</h2>
<p id="videoDescription">Your video description...</p>
```

## Browser Compatibility

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

## Security Features

- Right-click disabled on videos
- Context menu prevented to protect content
- Native browser controls hidden

## Performance

- Lightweight: Only uses Tailwind CDN
- Optimized: Vanilla JavaScript without additional libraries
- Fast loading: Single HTML file

## Usage Examples

### For Websites
```html
<iframe src="path/to/video-player/index.html"
        width="100%"
        height="500px"
        frameborder="0">
</iframe>
```

### For Embedding
Copy the entire HTML code and embed it on your page

## Development Notes

### Video Samples
This project uses sample videos from Google Cloud Storage:
- **Main Video**: Big Buck Bunny (Open source film)
- **Ad Video**: For Bigger Blazes (Sample ad)

### Quality Settings
Currently, quality settings are UI only. For full implementation, you need to:
1. Provide multiple video sources with different resolutions
2. Implement adaptive bitrate streaming (HLS/DASH)

## Troubleshooting

### Video Not Appearing
- Ensure active internet connection (video streaming from cloud)
- Check browser console for errors
- Ensure browser supports HTML5 video

### Controls Not Appearing
- Ensure JavaScript is enabled in browser
- Refresh the page
- Try a different browser

### Skip Button Not Appearing
- Wait until ad video runs for at least 5 seconds
- Check console for errors

## License

This project is created for educational and demonstration purposes.

## Contact & Support

For questions or issues, please create an issue or contact the developer.

---

**Version**: 1.0.0
**Last Updated**: 2025-10-26
**Built with**: HTML5, Tailwind CSS, Vanilla JavaScript
