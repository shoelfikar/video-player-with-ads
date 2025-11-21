# VideoPlayer - Dynamic Video Player with Ad Support

A dynamically configurable video player with ad support, complete controls, and modern interface.

## Features

- ✅ **Dynamic & Reusable** - Can be initialized with different configurations
- ✅ **Ad Support** - Plays ads before main video with skip button
- ✅ **Custom Skip Time** - Configure when skip button appears
- ✅ **Custom Button Colors** - Customize play button and ad skip button colors
- ✅ **Full Video Controls** - Play/pause, volume, fullscreen, progress bar
- ✅ **Playback Speed** - Adjust playback speed (0.5x - 2x)
- ✅ **Quality Settings** - Video quality settings menu
- ✅ **Keyboard Shortcuts** - Keyboard controls for ease of use
- ✅ **Loading States** - Loading spinner during buffering
- ✅ **Responsive Design** - Adapts to various screen sizes
- ✅ **Modern UI** - Built with Tailwind CSS

## Screenshots

### Video Player Interface
![Video Player Main Interface](screenshoot/Screenshot%202025-10-26%20at%2009.22.12.png)

### Video Player with Controls
![Video Player Controls](screenshoot/Screenshot%202025-10-26%20at%2009.22.37.png)

## Installation

1. Download or clone this repository
2. Ensure the following files are in the same directory:
   - `index.html` (or your HTML file)
   - `script.js`
3. Make sure you have internet connection for Tailwind CSS CDN

## Basic Usage

### 1. HTML Structure

Add a container with unique ID in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-4xl">
        <!-- Video player container -->
        <div id="my-video-player" class="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            <!-- Video player HTML markup here -->
        </div>
    </div>

    <script src="script.js"></script>
    <script>
        // Initialize player
        const player = new VideoPlayer({
            wrapperId: 'my-video-player',
            mainVideo: {
                url: 'https://example.com/video.mp4',
                title: 'Video Title',
                description: 'Video description'
            },
            adVideo: {
                url: 'https://example.com/ad.mp4',
                skipAfter: 5
            }
        });
    </script>
</body>
</html>
```

### 2. Initialize VideoPlayer

```javascript
const player = new VideoPlayer({
    wrapperId: 'my-video-player',
    mainVideo: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        title: 'Big Buck Bunny',
        description: 'A large and lovable rabbit deals with three tiny bullies.',
        type: 'video/mp4'
    },
    adVideo: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        skipAfter: 5,
        type: 'video/mp4'
    },
    thumbnailUrl: 'https://example.com/thumbnail.mp4',
    skipBackwardSeconds: 10,
    skipForwardSeconds: 10,
    autoHideControlsDelay: 3000,
    infoText: 'The video will play ads first.'
});
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `wrapperId` | string | **required** | Wrapper element ID |
| `mainVideo.url` | string | `''` | Main video URL |
| `mainVideo.title` | string | `'Untitled Video'` | Video title |
| `mainVideo.description` | string | `'No description available'` | Video description |
| `mainVideo.type` | string | `'video/mp4'` | Video MIME type |
| `adVideo.url` | string | `''` | Ad video URL |
| `adVideo.skipAfter` | number | `5` | Seconds before skip button appears |
| `adVideo.type` | string | `'video/mp4'` | Ad video MIME type |
| `thumbnailUrl` | string | mainVideo.url | Thumbnail video URL |
| `skipBackwardSeconds` | number | `10` | Seconds to skip backward |
| `skipForwardSeconds` | number | `10` | Seconds to skip forward |
| `autoHideControlsDelay` | number | `3000` | Milliseconds before controls hide |
| `section.title` | string | `null` | Section title (optional) |
| `section.description` | string | `null` | Section description (optional) |
| `infoText` | string | `'The video will play...'` | Info text below player |
| `adButtonColor.background` | string | `'#ffffff'` | Ad skip button background color |
| `adButtonColor.backgroundHover` | string | `'#e5e7eb'` | Ad skip button hover background color |
| `adButtonColor.text` | string | `'#000000'` | Ad skip button text color |
| `playButtonColor.background` | string | `'#dc2626'` | Play button background color |
| `playButtonColor.backgroundHover` | string | `'#b91c1c'` | Play button hover background color |
| `playButtonColor.text` | string | `'#ffffff'` | Play button text/icon color |

## Methods (API)

### play()
Play the video.
```javascript
player.play();
```

### pause()
Pause the video.
```javascript
player.pause();
```

### setVolume(volume)
Set video volume (0-1).
```javascript
player.setVolume(0.5); // Set volume to 50%
```

### seekTo(seconds)
Seek to specific time (in seconds).
```javascript
player.seekTo(30); // Jump to 30 seconds
```

### getCurrentTime()
Get current playback time.
```javascript
const currentTime = player.getCurrentTime();
console.log(currentTime); // e.g., 15.5
```

### getDuration()
Get total video duration.
```javascript
const duration = player.getDuration();
console.log(duration); // e.g., 120
```

### destroy()
Cleanup and destroy player instance.
```javascript
player.destroy();
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `Arrow Left` | Skip backward (default 10s) |
| `Arrow Right` | Skip forward (default 10s) |
| `Arrow Up` | Increase volume |
| `Arrow Down` | Decrease volume |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |

## Usage Examples

### Example 1: Minimal Configuration
```javascript
const player = new VideoPlayer({
    wrapperId: 'player-1',
    mainVideo: {
        url: 'https://example.com/video.mp4'
    }
});
```

### Example 2: With Ads and Custom Skip Time
```javascript
const player = new VideoPlayer({
    wrapperId: 'player-2',
    mainVideo: {
        url: 'https://example.com/main-video.mp4',
        title: 'JavaScript Tutorial',
        description: 'Learn JavaScript from basics to advanced'
    },
    adVideo: {
        url: 'https://example.com/ad-video.mp4',
        skipAfter: 3 // Skip button appears after 3 seconds
    }
});
```

### Example 3: Multiple Players on One Page
```javascript
// Player 1
const player1 = new VideoPlayer({
    wrapperId: 'player-1',
    mainVideo: {
        url: 'https://example.com/video1.mp4',
        title: 'Video 1'
    }
});

// Player 2
const player2 = new VideoPlayer({
    wrapperId: 'player-2',
    mainVideo: {
        url: 'https://example.com/video2.mp4',
        title: 'Video 2'
    }
});
```

### Example 4: Custom Button Colors
```javascript
const player = new VideoPlayer({
    wrapperId: 'my-player',
    mainVideo: {
        url: 'https://example.com/video.mp4',
        title: 'My Video'
    },
    adVideo: {
        url: 'https://example.com/ad.mp4',
        skipAfter: 5
    },
    // Custom colors for ad skip button
    adButtonColor: {
        background: '#4ade80',       // Green
        backgroundHover: '#22c55e',  // Darker green
        text: '#000000'              // Black
    },
    // Custom colors for play button
    playButtonColor: {
        background: '#3b82f6',       // Blue
        backgroundHover: '#2563eb',  // Darker blue
        text: '#ffffff'              // White
    }
});
```

### Example 5: Programmatic Control
```javascript
const player = new VideoPlayer({
    wrapperId: 'my-player',
    mainVideo: {
        url: 'https://example.com/video.mp4'
    }
});

// Control player from code
setTimeout(() => {
    player.play();
}, 2000);

setTimeout(() => {
    player.setVolume(0.5);
}, 5000);

setTimeout(() => {
    player.seekTo(30);
}, 10000);
```

## File Structure

```
video-player/
├── index.html          # Main HTML file with implementation example
├── script.js           # VideoPlayer class
├── example.html        # Example page with various configurations
└── README.md          # Documentation (this file)
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## Troubleshooting

### Video not appearing
- Ensure video URL is correct and accessible
- Check browser console for errors
- Ensure video format is supported by browser

### Player not working
- Ensure wrapperId matches the element ID in HTML
- Ensure script.js is loaded before initialization
- Check for errors in browser console

### Controls not appearing
- Ensure all elements with required IDs are present in HTML
- Check CSS, ensure nothing overrides opacity/visibility

## License

MIT License - Free to use for personal and commercial projects.

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## Changelog

### v1.1.0 (2025-11-21)
- ✨ Added custom button color configuration
- 🎨 Support for custom ad skip button colors (background, hover, text)
- 🎨 Support for custom play button colors (background, hover, text)
- 🔧 Improved skip button design (compact circle background)
- 📝 Updated documentation with custom color examples

### v1.0.0 (2025-10-26)
- Initial release
- Class-based architecture
- Dynamic configuration
- Ad support with skip button
- Full video controls
- Keyboard shortcuts
- Loading states
- Settings menu (speed & quality)
