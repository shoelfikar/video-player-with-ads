/**
 * VideoPlayer Class - Dynamic Video Player with Ad Support
 *
 * Usage:
 * const player = new VideoPlayer({
 *   containerId: 'video-player-container',
 *   mainVideo: {
 *     url: 'https://example.com/video.mp4',
 *     title: 'My Video Title',
 *     description: 'Video description here'
 *   },
 *   adVideo: {
 *     url: 'https://example.com/ad.mp4',
 *     skipAfter: 5
 *   },
 *   thumbnailUrl: 'https://example.com/thumbnail.mp4'
 * });
 */

class VideoPlayer {
    constructor(config) {
        // Validate config
        if (!config || !config.wrapperId) {
            throw new Error('VideoPlayer requires a wrapperId');
        }

        // Default configuration
        this.config = {
            wrapperId: config.wrapperId,
            mainVideo: {
                url: config.mainVideo?.url || '',
                title: config.mainVideo?.title || 'Untitled Video',
                description: config.mainVideo?.description || 'No description available',
                type: config.mainVideo?.type || 'video/mp4'
            },
            adVideo: {
                url: config.adVideo?.url || '',
                skipAfter: config.adVideo?.skipAfter || 5,
                type: config.adVideo?.type || 'video/mp4'
            },
            thumbnailUrl: config.thumbnailUrl || config.mainVideo?.url || '',
            skipBackwardSeconds: config.skipBackwardSeconds || 10,
            skipForwardSeconds: config.skipForwardSeconds || 10,
            autoHideControlsDelay: config.autoHideControlsDelay || 3000,
            section: config.section || null, // { title: '...', description: '...' }
            infoText: config.infoText || 'Video akan memutar iklan terlebih dahulu. Klik tombol Skip setelah beberapa detik atau tunggu hingga iklan selesai.'
        };

        // State variables
        this.adDuration = 0;
        this.hideControlsTimeout = null;
        this.isUserInteracting = false;
        this.isSettingsOpen = false;

        // Initialize
        this.init();
    }

    init() {
        // Get wrapper element
        this.wrapper = document.getElementById(this.config.wrapperId);
        if (!this.wrapper) {
            throw new Error(`Wrapper with id "${this.config.wrapperId}" not found`);
        }

        // Create player structure dynamically
        this.createPlayerStructure();

        // Get all elements
        this.getElements();

        // Set video sources and info
        this.setVideoSources();
        this.setVideoInfo();

        // Bind event listeners
        this.bindAdEvents();
        this.bindMainVideoEvents();
        this.bindControlEvents();
        this.bindSettingsEvents();
        this.bindKeyboardEvents();
    }

    /**
     * Create the entire player structure dynamically using createElement
     */
    createPlayerStructure() {
        // Clear wrapper
        this.wrapper.innerHTML = '';

        // Create section if title or description is provided
        if (this.config.section?.title || this.config.section?.description) {
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'mb-6 text-center';

            if (this.config.section.title) {
                const title = document.createElement('h1');
                title.className = 'text-white text-3xl font-bold mb-2';
                title.textContent = this.config.section.title;
                sectionContainer.appendChild(title);
            }

            if (this.config.section.description) {
                const description = document.createElement('p');
                description.className = 'text-gray-400 text-base';
                description.textContent = this.config.section.description;
                sectionContainer.appendChild(description);
            }

            this.wrapper.appendChild(sectionContainer);
        }

        // Create main container
        const container = document.createElement('div');
        container.id = 'video-player-container';
        container.className = 'relative bg-black rounded-lg overflow-hidden shadow-2xl';

        // Create thumbnail video
        container.appendChild(this.createThumbnailVideo());

        // Create ad video
        container.appendChild(this.createAdVideo());

        // Create main video
        container.appendChild(this.createMainVideo());

        // Create main video controls
        container.appendChild(this.createMainVideoControls());

        // Create ad overlay
        container.appendChild(this.createAdOverlay());

        // Create play overlay
        container.appendChild(this.createPlayOverlay());

        this.wrapper.appendChild(container);

        // Create info text section (conditional)
        if (this.config.infoText) {
            const infoSection = document.createElement('div');
            infoSection.className = 'mt-6 text-center text-gray-400 text-sm';

            const infoText = document.createElement('p');
            infoText.id = 'infoText';
            infoText.textContent = this.config.infoText;

            infoSection.appendChild(infoText);
            this.wrapper.appendChild(infoSection);
        }
    }

    createThumbnailVideo() {
        const video = document.createElement('video');
        video.id = 'thumbnailVideo';
        video.className = 'w-full aspect-video';
        video.setAttribute('playsinline', '');

        const source = document.createElement('source');
        source.type = 'video/mp4';
        video.appendChild(source);

        const fallbackText = document.createTextNode('Your browser does not support the video tag.');
        video.appendChild(fallbackText);

        return video;
    }

    createAdVideo() {
        const video = document.createElement('video');
        video.id = 'adVideo';
        video.className = 'w-full aspect-video hidden';
        video.setAttribute('playsinline', '');

        const source = document.createElement('source');
        source.type = 'video/mp4';
        video.appendChild(source);

        const fallbackText = document.createTextNode('Your browser does not support the video tag.');
        video.appendChild(fallbackText);

        return video;
    }

    createMainVideo() {
        const video = document.createElement('video');
        video.id = 'mainVideo';
        video.className = 'w-full aspect-video hidden';
        video.setAttribute('playsinline', '');

        const source = document.createElement('source');
        source.type = 'video/mp4';
        video.appendChild(source);

        const fallbackText = document.createTextNode('Your browser does not support the video tag.');
        video.appendChild(fallbackText);

        return video;
    }

    createMainVideoControls() {
        const controls = document.createElement('div');
        controls.id = 'mainVideoControls';
        controls.className = 'hidden';

        // Video info (top left)
        const videoInfo = document.createElement('div');
        videoInfo.id = 'videoInfo';
        videoInfo.className = 'absolute top-4 left-4 max-w-sm bg-gradient-to-r from-black/80 to-transparent p-3 pr-6 rounded-lg opacity-0 transition-opacity duration-300';

        const videoTitle = document.createElement('h2');
        videoTitle.id = 'videoTitle';
        videoTitle.className = 'text-white text-base font-bold mb-1';
        videoInfo.appendChild(videoTitle);

        const videoDescription = document.createElement('p');
        videoDescription.id = 'videoDescription';
        videoDescription.className = 'text-gray-300 text-xs leading-relaxed';
        videoInfo.appendChild(videoDescription);

        controls.appendChild(videoInfo);

        // Settings button (top right)
        controls.appendChild(this.createSettingsContainer());

        // Loading spinner
        controls.appendChild(this.createLoadingSpinner());

        // Center play/pause controls
        controls.appendChild(this.createCenterControls());

        // Bottom controls
        controls.appendChild(this.createBottomControls());

        return controls;
    }

    createSettingsContainer() {
        const container = document.createElement('div');
        container.id = 'settingsContainer';
        container.className = 'absolute top-4 right-4 opacity-0 transition-opacity duration-300';

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settingsBtn';
        settingsBtn.className = 'bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all';
        settingsBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>`;

        const settingsMenu = this.createSettingsMenu();

        container.appendChild(settingsBtn);
        container.appendChild(settingsMenu);

        return container;
    }

    createSettingsMenu() {
        const menu = document.createElement('div');
        menu.id = 'settingsMenu';
        menu.className = 'hidden absolute top-12 right-0 bg-black/95 text-white rounded-lg shadow-2xl overflow-hidden w-56';

        // Speed settings
        const speedSection = document.createElement('div');
        speedSection.className = 'border-b border-gray-700';

        const speedMenuBtn = document.createElement('button');
        speedMenuBtn.id = 'speedMenuBtn';
        speedMenuBtn.className = 'w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between';
        speedMenuBtn.innerHTML = `
            <span class="font-semibold">Speed</span>
            <div class="flex items-center">
                <span id="currentSpeed" class="text-sm text-gray-300 mr-2">1x</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
            </div>
        `;

        const speedSubmenu = document.createElement('div');
        speedSubmenu.id = 'speedSubmenu';
        speedSubmenu.className = 'hidden bg-black/98';

        const speeds = [
            { value: '0.5', label: '0.5x' },
            { value: '0.75', label: '0.75x' },
            { value: '1', label: 'Normal (1x)', selected: true },
            { value: '1.25', label: '1.25x' },
            { value: '1.5', label: '1.5x' },
            { value: '2', label: '2x' }
        ];

        speeds.forEach(speed => {
            const btn = document.createElement('button');
            btn.className = `speed-option w-full px-6 py-2 hover:bg-white/10 transition-colors text-left text-sm${speed.selected ? ' bg-white/20' : ''}`;
            btn.setAttribute('data-speed', speed.value);
            btn.textContent = speed.label;
            speedSubmenu.appendChild(btn);
        });

        speedSection.appendChild(speedMenuBtn);
        speedSection.appendChild(speedSubmenu);

        // Quality settings
        const qualitySection = document.createElement('div');

        const qualityMenuBtn = document.createElement('button');
        qualityMenuBtn.id = 'qualityMenuBtn';
        qualityMenuBtn.className = 'w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between';
        qualityMenuBtn.innerHTML = `
            <span class="font-semibold">Quality</span>
            <div class="flex items-center">
                <span id="currentQuality" class="text-sm text-gray-300 mr-2">Auto</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
            </div>
        `;

        const qualitySubmenu = document.createElement('div');
        qualitySubmenu.id = 'qualitySubmenu';
        qualitySubmenu.className = 'hidden bg-black/98';

        const qualities = [
            { value: 'auto', label: 'Auto', selected: true },
            { value: '1080p', label: '1080p' },
            { value: '720p', label: '720p' },
            { value: '480p', label: '480p' },
            { value: '360p', label: '360p' }
        ];

        qualities.forEach(quality => {
            const btn = document.createElement('button');
            btn.className = `quality-option w-full px-6 py-2 hover:bg-white/10 transition-colors text-left text-sm${quality.selected ? ' bg-white/20' : ''}`;
            btn.setAttribute('data-quality', quality.value);
            btn.textContent = quality.label;
            qualitySubmenu.appendChild(btn);
        });

        qualitySection.appendChild(qualityMenuBtn);
        qualitySection.appendChild(qualitySubmenu);

        menu.appendChild(speedSection);
        menu.appendChild(qualitySection);

        return menu;
    }

    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.className = 'absolute inset-0 flex items-center justify-center pointer-events-none hidden';
        spinner.innerHTML = `
            <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
        return spinner;
    }

    createCenterControls() {
        const container = document.createElement('div');
        container.id = 'centerPlayPause';
        container.className = 'absolute inset-0 flex items-center justify-center pointer-events-none';

        const controlsWrapper = document.createElement('div');
        controlsWrapper.className = 'flex items-center space-x-4';

        // Skip backward button
        const skipBackBtn = document.createElement('button');
        skipBackBtn.id = 'skipBackwardBtn';
        skipBackBtn.className = 'bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-2xl pointer-events-auto opacity-0';

        const skipBackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        skipBackSvg.setAttribute('class', 'w-8 h-8');
        skipBackSvg.setAttribute('fill', 'currentColor');
        skipBackSvg.setAttribute('viewBox', '0 0 24 24');

        const skipBackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        skipBackPath.setAttribute('d', 'M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z');
        skipBackPath.setAttribute('opacity', '0.4');

        const skipBackText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        skipBackText.setAttribute('x', '9');
        skipBackText.setAttribute('y', '16');
        skipBackText.setAttribute('font-size', '8');
        skipBackText.setAttribute('fill', 'currentColor');
        skipBackText.setAttribute('font-weight', 'bold');
        skipBackText.setAttribute('text-anchor', 'middle');
        skipBackText.textContent = '10';

        skipBackSvg.appendChild(skipBackPath);
        skipBackSvg.appendChild(skipBackText);
        skipBackBtn.appendChild(skipBackSvg);

        // Play/Pause button
        const playBtn = document.createElement('button');
        playBtn.id = 'centerPlayButton';
        playBtn.className = 'bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transform hover:scale-110 transition-all shadow-2xl pointer-events-auto opacity-0';

        const playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        playIcon.id = 'centerPlayIcon';
        playIcon.setAttribute('class', 'w-10 h-10');
        playIcon.setAttribute('fill', 'currentColor');
        playIcon.setAttribute('viewBox', '0 0 24 24');

        const playPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        playPath.setAttribute('d', 'M8 5v14l11-7z');
        playIcon.appendChild(playPath);

        const pauseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        pauseIcon.id = 'centerPauseIcon';
        pauseIcon.setAttribute('class', 'w-10 h-10 hidden');
        pauseIcon.setAttribute('fill', 'currentColor');
        pauseIcon.setAttribute('viewBox', '0 0 24 24');

        const pausePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pausePath.setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z');
        pauseIcon.appendChild(pausePath);

        playBtn.appendChild(playIcon);
        playBtn.appendChild(pauseIcon);

        // Skip forward button
        const skipForwardBtn = document.createElement('button');
        skipForwardBtn.id = 'skipForwardBtn';
        skipForwardBtn.className = 'bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-2xl pointer-events-auto opacity-0';

        const skipForwardSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        skipForwardSvg.setAttribute('class', 'w-8 h-8');
        skipForwardSvg.setAttribute('fill', 'currentColor');
        skipForwardSvg.setAttribute('viewBox', '0 0 24 24');

        const skipForwardPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        skipForwardPath.setAttribute('d', 'M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z');
        skipForwardPath.setAttribute('opacity', '0.4');

        const skipForwardText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        skipForwardText.setAttribute('x', '15');
        skipForwardText.setAttribute('y', '16');
        skipForwardText.setAttribute('font-size', '8');
        skipForwardText.setAttribute('fill', 'currentColor');
        skipForwardText.setAttribute('font-weight', 'bold');
        skipForwardText.setAttribute('text-anchor', 'middle');
        skipForwardText.textContent = '10';

        skipForwardSvg.appendChild(skipForwardPath);
        skipForwardSvg.appendChild(skipForwardText);
        skipForwardBtn.appendChild(skipForwardSvg);

        controlsWrapper.appendChild(skipBackBtn);
        controlsWrapper.appendChild(playBtn);
        controlsWrapper.appendChild(skipForwardBtn);
        container.appendChild(controlsWrapper);

        return container;
    }

    createBottomControls() {
        const controls = document.createElement('div');
        controls.id = 'bottomControls';
        controls.className = 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300';

        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'mb-3';

        const progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'progressBarContainer';
        progressBarContainer.className = 'relative w-full h-1 bg-gray-600 rounded-full cursor-pointer group';

        const progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        progressBar.className = 'absolute h-full bg-red-600 rounded-full';
        progressBar.style.width = '0%';

        const progressHandle = document.createElement('div');
        progressHandle.id = 'progressHandle';
        progressHandle.className = 'absolute w-3 h-3 bg-white rounded-full -top-1 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity';
        progressHandle.style.left = '0%';

        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressHandle);
        progressContainer.appendChild(progressBarContainer);

        // Controls row
        const controlsRow = document.createElement('div');
        controlsRow.className = 'flex items-center justify-between';

        // Left side - time display
        const leftControls = document.createElement('div');
        leftControls.className = 'flex items-center space-x-3';

        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'text-white text-sm font-medium';
        timeDisplay.innerHTML = '<span id="currentTime">0:00</span> / <span id="duration">0:00</span>';

        leftControls.appendChild(timeDisplay);

        // Right side - volume and fullscreen
        const rightControls = document.createElement('div');
        rightControls.className = 'flex items-center space-x-3';

        // Volume controls
        const volumeControls = document.createElement('div');
        volumeControls.className = 'flex items-center space-x-2';

        const volumeBtn = document.createElement('button');
        volumeBtn.id = 'volumeBtn';
        volumeBtn.className = 'text-white hover:text-red-500 transition-colors';

        const volumeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        volumeIcon.id = 'volumeIcon';
        volumeIcon.setAttribute('class', 'w-7 h-7');
        volumeIcon.setAttribute('fill', 'currentColor');
        volumeIcon.setAttribute('viewBox', '0 0 24 24');

        const volumePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        volumePath.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
        volumeIcon.appendChild(volumePath);

        const muteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        muteIcon.id = 'muteIcon';
        muteIcon.setAttribute('class', 'w-7 h-7 hidden');
        muteIcon.setAttribute('fill', 'currentColor');
        muteIcon.setAttribute('viewBox', '0 0 24 24');

        const mutePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        mutePath.setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z');
        muteIcon.appendChild(mutePath);

        volumeBtn.appendChild(volumeIcon);
        volumeBtn.appendChild(muteIcon);

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.id = 'volumeSlider';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '100';
        volumeSlider.className = 'w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer';
        volumeSlider.style.accentColor = '#ef4444';

        volumeControls.appendChild(volumeBtn);
        volumeControls.appendChild(volumeSlider);

        // Fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.id = 'fullscreenBtn';
        fullscreenBtn.className = 'text-white hover:text-red-500 transition-colors';

        const fullscreenIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        fullscreenIcon.id = 'fullscreenIcon';
        fullscreenIcon.setAttribute('class', 'w-7 h-7');
        fullscreenIcon.setAttribute('fill', 'currentColor');
        fullscreenIcon.setAttribute('viewBox', '0 0 24 24');

        const fullscreenPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fullscreenPath.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
        fullscreenIcon.appendChild(fullscreenPath);

        const exitFullscreenIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        exitFullscreenIcon.id = 'exitFullscreenIcon';
        exitFullscreenIcon.setAttribute('class', 'w-7 h-7 hidden');
        exitFullscreenIcon.setAttribute('fill', 'currentColor');
        exitFullscreenIcon.setAttribute('viewBox', '0 0 24 24');

        const exitFullscreenPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        exitFullscreenPath.setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z');
        exitFullscreenIcon.appendChild(exitFullscreenPath);

        fullscreenBtn.appendChild(fullscreenIcon);
        fullscreenBtn.appendChild(exitFullscreenIcon);

        rightControls.appendChild(volumeControls);
        rightControls.appendChild(fullscreenBtn);

        controlsRow.appendChild(leftControls);
        controlsRow.appendChild(rightControls);

        controls.appendChild(progressContainer);
        controls.appendChild(controlsRow);

        return controls;
    }

    createAdOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'adOverlay';
        overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none';

        // Ad loading spinner
        const adLoadingSpinner = document.createElement('div');
        adLoadingSpinner.id = 'adLoadingSpinner';
        adLoadingSpinner.className = 'absolute inset-0 flex items-center justify-center pointer-events-none hidden';
        adLoadingSpinner.innerHTML = `
            <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;

        // Ad badge
        const adBadge = document.createElement('div');
        adBadge.className = 'absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold';
        adBadge.textContent = 'Ad';

        // Ad timer
        const adTimer = document.createElement('div');
        adTimer.id = 'adTimeRemaining';
        adTimer.className = 'absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm';
        adTimer.innerHTML = '<span id="adTimer">--</span>s';

        // Skip button
        const skipButton = document.createElement('button');
        skipButton.id = 'skipButton';
        skipButton.className = 'absolute bottom-8 right-8 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all transform hover:scale-105 opacity-0 pointer-events-none';
        skipButton.textContent = 'Skip Ad →';

        // Skip countdown
        const skipCountdown = document.createElement('div');
        skipCountdown.id = 'skipCountdown';
        skipCountdown.className = 'absolute bottom-8 right-8 bg-black/70 text-white px-6 py-3 rounded-lg font-bold';
        skipCountdown.innerHTML = 'Skip in <span id="skipTimer">5</span>s';

        overlay.appendChild(adLoadingSpinner);
        overlay.appendChild(adBadge);
        overlay.appendChild(adTimer);
        overlay.appendChild(skipButton);
        overlay.appendChild(skipCountdown);

        return overlay;
    }

    createPlayOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'playOverlay';
        overlay.className = 'absolute inset-0 flex items-center justify-center bg-black/40';

        const playButton = document.createElement('button');
        playButton.id = 'playButton';
        playButton.className = 'bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform hover:scale-110 transition-all shadow-2xl';
        playButton.innerHTML = `
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;

        overlay.appendChild(playButton);

        return overlay;
    }

    getElements() {
        // Get the dynamically created container
        this.container = this.wrapper.querySelector('#video-player-container');

        // Thumbnail Elements
        this.thumbnailVideo = this.container.querySelector('#thumbnailVideo');

        // Ad Elements
        this.adVideo = this.container.querySelector('#adVideo');
        this.adOverlay = this.container.querySelector('#adOverlay');
        this.skipButton = this.container.querySelector('#skipButton');
        this.skipCountdown = this.container.querySelector('#skipCountdown');
        this.skipTimer = this.container.querySelector('#skipTimer');
        this.adTimer = this.container.querySelector('#adTimer');
        this.playOverlay = this.container.querySelector('#playOverlay');
        this.playButton = this.container.querySelector('#playButton');
        this.adLoadingSpinner = this.container.querySelector('#adLoadingSpinner');

        // Main Video Elements
        this.mainVideo = this.container.querySelector('#mainVideo');
        this.mainVideoControls = this.container.querySelector('#mainVideoControls');
        this.videoInfo = this.container.querySelector('#videoInfo');
        this.videoTitle = this.container.querySelector('#videoTitle');
        this.videoDescription = this.container.querySelector('#videoDescription');
        this.centerPlayButton = this.container.querySelector('#centerPlayButton');
        this.centerPlayIcon = this.container.querySelector('#centerPlayIcon');
        this.centerPauseIcon = this.container.querySelector('#centerPauseIcon');
        this.skipBackwardBtn = this.container.querySelector('#skipBackwardBtn');
        this.skipForwardBtn = this.container.querySelector('#skipForwardBtn');
        this.bottomControls = this.container.querySelector('#bottomControls');
        this.progressBarContainer = this.container.querySelector('#progressBarContainer');
        this.progressBar = this.container.querySelector('#progressBar');
        this.progressHandle = this.container.querySelector('#progressHandle');
        this.currentTimeEl = this.container.querySelector('#currentTime');
        this.durationEl = this.container.querySelector('#duration');
        this.volumeBtn = this.container.querySelector('#volumeBtn');
        this.volumeIcon = this.container.querySelector('#volumeIcon');
        this.muteIcon = this.container.querySelector('#muteIcon');
        this.volumeSlider = this.container.querySelector('#volumeSlider');
        this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');
        this.fullscreenIcon = this.container.querySelector('#fullscreenIcon');
        this.exitFullscreenIcon = this.container.querySelector('#exitFullscreenIcon');
        this.settingsBtn = this.container.querySelector('#settingsBtn');
        this.settingsMenu = this.container.querySelector('#settingsMenu');
        this.settingsContainer = this.container.querySelector('#settingsContainer');
        this.speedMenuBtn = this.container.querySelector('#speedMenuBtn');
        this.speedSubmenu = this.container.querySelector('#speedSubmenu');
        this.qualityMenuBtn = this.container.querySelector('#qualityMenuBtn');
        this.qualitySubmenu = this.container.querySelector('#qualitySubmenu');
        this.currentSpeed = this.container.querySelector('#currentSpeed');
        this.currentQuality = this.container.querySelector('#currentQuality');
        this.speedOptions = this.container.querySelectorAll('.speed-option');
        this.qualityOptions = this.container.querySelectorAll('.quality-option');
        this.loadingSpinner = this.container.querySelector('#loadingSpinner');
        this.videoContainer = this.container;
        this.infoTextEl = this.wrapper.querySelector('#infoText');
    }

    setVideoSources() {
        // Set thumbnail video source
        if (this.thumbnailVideo) {
            const thumbnailSource = this.thumbnailVideo.querySelector('source');
            if (thumbnailSource) {
                thumbnailSource.src = this.config.thumbnailUrl;
                thumbnailSource.type = this.config.mainVideo.type;
            }
            this.thumbnailVideo.load();
        }

        // Set ad video source
        if (this.adVideo && this.config.adVideo.url) {
            const adSource = this.adVideo.querySelector('source');
            if (adSource) {
                adSource.src = this.config.adVideo.url;
                adSource.type = this.config.adVideo.type;
            }
            this.adVideo.load();
        }

        // Set main video source
        if (this.mainVideo) {
            const mainSource = this.mainVideo.querySelector('source');
            if (mainSource) {
                mainSource.src = this.config.mainVideo.url;
                mainSource.type = this.config.mainVideo.type;
            }
            this.mainVideo.load();
        }
    }

    setVideoInfo() {
        // Set video title and description
        if (this.videoTitle) {
            this.videoTitle.textContent = this.config.mainVideo.title;
        }
        if (this.videoDescription) {
            this.videoDescription.textContent = this.config.mainVideo.description;
        }
        if (this.infoTextEl) {
            this.infoTextEl.textContent = this.config.infoText;
        }

        // Update skip timer text
        if (this.skipTimer) {
            this.skipTimer.textContent = this.config.adVideo.skipAfter;
        }
    }

    // ============ AD VIDEO FUNCTIONS ============

    bindAdEvents() {
        if (!this.adVideo) return;

        // Play button click handler
        this.playButton?.addEventListener('click', () => {
            this.thumbnailVideo?.classList.add('hidden');
            this.adVideo.classList.remove('hidden');
            this.adVideo.play();
            this.playOverlay?.classList.add('hidden');
        });

        // When ad video metadata is loaded
        this.adVideo.addEventListener('loadedmetadata', () => {
            this.adDuration = Math.floor(this.adVideo.duration);
        });

        // Update ad timer and skip countdown
        this.adVideo.addEventListener('timeupdate', () => {
            const currentTime = Math.floor(this.adVideo.currentTime);
            const remainingTime = Math.floor(this.adVideo.duration - this.adVideo.currentTime);

            // Update ad time remaining
            if (this.adTimer) {
                this.adTimer.textContent = remainingTime;
            }

            // Show skip button after configured seconds
            if (currentTime >= this.config.adVideo.skipAfter) {
                this.skipCountdown?.classList.add('hidden');
                this.skipButton?.classList.remove('opacity-0', 'pointer-events-none');
                this.skipButton?.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                // Update countdown
                if (this.skipTimer) {
                    this.skipTimer.textContent = this.config.adVideo.skipAfter - currentTime;
                }
            }
        });

        // When ad starts playing
        this.adVideo.addEventListener('play', () => {
            this.skipCountdown?.classList.remove('hidden');
            this.skipButton?.classList.add('opacity-0', 'pointer-events-none');
            this.skipButton?.classList.remove('opacity-100', 'pointer-events-auto');
        });

        // Skip button click handler
        this.skipButton?.addEventListener('click', () => {
            this.skipToMainVideo();
        });

        // When ad ends, automatically play main video
        this.adVideo.addEventListener('ended', () => {
            this.skipToMainVideo();
        });

        // Ad video loading events
        this.adVideo.addEventListener('waiting', () => {
            this.adLoadingSpinner?.classList.remove('hidden');
        });

        this.adVideo.addEventListener('canplay', () => {
            this.adLoadingSpinner?.classList.add('hidden');
        });

        this.adVideo.addEventListener('playing', () => {
            this.adLoadingSpinner?.classList.add('hidden');
        });

        this.adVideo.addEventListener('seeking', () => {
            this.adLoadingSpinner?.classList.remove('hidden');
        });

        this.adVideo.addEventListener('seeked', () => {
            this.adLoadingSpinner?.classList.add('hidden');
        });

        // Prevent right-click context menu
        this.adVideo.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    skipToMainVideo() {
        // Stop and reset ad video
        this.adVideo?.pause();
        if (this.adVideo) this.adVideo.currentTime = 0;

        // Hide ad elements
        this.adVideo?.classList.add('hidden');
        this.adOverlay?.classList.add('hidden');

        // Show and play main video
        this.mainVideo?.classList.remove('hidden');
        this.mainVideoControls?.classList.remove('hidden');
        this.mainVideo?.play();
    }

    // ============ MAIN VIDEO CONTROLS ============

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    togglePlayPause() {
        if (this.mainVideo.paused) {
            this.mainVideo.play();
        } else {
            this.mainVideo.pause();
        }
    }

    updatePlayPauseIcons(isPlaying) {
        if (isPlaying) {
            this.centerPlayIcon?.classList.add('hidden');
            this.centerPauseIcon?.classList.remove('hidden');
        } else {
            this.centerPlayIcon?.classList.remove('hidden');
            this.centerPauseIcon?.classList.add('hidden');
        }
    }

    showControls() {
        if (this.bottomControls) this.bottomControls.style.opacity = '1';
        if (this.centerPlayButton) this.centerPlayButton.style.opacity = '1';
        if (this.skipBackwardBtn) this.skipBackwardBtn.style.opacity = '1';
        if (this.skipForwardBtn) this.skipForwardBtn.style.opacity = '1';
        if (this.videoInfo) this.videoInfo.style.opacity = '1';
        if (this.settingsContainer) this.settingsContainer.style.opacity = '1';

        clearTimeout(this.hideControlsTimeout);

        if (!this.mainVideo.paused && !this.isUserInteracting && !this.isSettingsOpen) {
            this.hideControlsTimeout = setTimeout(() => {
                if (this.bottomControls) this.bottomControls.style.opacity = '0';
                if (this.centerPlayButton) this.centerPlayButton.style.opacity = '0';
                if (this.skipBackwardBtn) this.skipBackwardBtn.style.opacity = '0';
                if (this.skipForwardBtn) this.skipForwardBtn.style.opacity = '0';
                if (this.videoInfo) this.videoInfo.style.opacity = '0';
                if (this.settingsContainer) this.settingsContainer.style.opacity = '0';
            }, this.config.autoHideControlsDelay);
        }
    }

    bindMainVideoEvents() {
        if (!this.mainVideo) return;

        // Update UI when playing
        this.mainVideo.addEventListener('play', () => {
            this.updatePlayPauseIcons(true);
            this.showControls();
        });

        // Update UI when paused
        this.mainVideo.addEventListener('pause', () => {
            this.updatePlayPauseIcons(false);
            clearTimeout(this.hideControlsTimeout);
            if (this.bottomControls) this.bottomControls.style.opacity = '1';
            if (this.centerPlayButton) this.centerPlayButton.style.opacity = '1';
            if (this.skipBackwardBtn) this.skipBackwardBtn.style.opacity = '1';
            if (this.skipForwardBtn) this.skipForwardBtn.style.opacity = '1';
            if (this.videoInfo) this.videoInfo.style.opacity = '1';
            if (this.settingsContainer) this.settingsContainer.style.opacity = '1';
        });

        // Update progress bar and time
        this.mainVideo.addEventListener('timeupdate', () => {
            const percent = (this.mainVideo.currentTime / this.mainVideo.duration) * 100;
            if (this.progressBar) this.progressBar.style.width = percent + '%';
            if (this.progressHandle) this.progressHandle.style.left = percent + '%';
            if (this.currentTimeEl) this.currentTimeEl.textContent = this.formatTime(this.mainVideo.currentTime);
        });

        // Update duration when metadata loads
        this.mainVideo.addEventListener('loadedmetadata', () => {
            if (this.durationEl) this.durationEl.textContent = this.formatTime(this.mainVideo.duration);
        });

        // Loading events
        this.mainVideo.addEventListener('waiting', () => {
            this.loadingSpinner?.classList.remove('hidden');
        });

        this.mainVideo.addEventListener('canplay', () => {
            this.loadingSpinner?.classList.add('hidden');
        });

        this.mainVideo.addEventListener('playing', () => {
            this.loadingSpinner?.classList.add('hidden');
        });

        this.mainVideo.addEventListener('seeking', () => {
            this.loadingSpinner?.classList.remove('hidden');
        });

        this.mainVideo.addEventListener('seeked', () => {
            this.loadingSpinner?.classList.add('hidden');
        });

        // Click anywhere on video to play/pause
        this.mainVideo.addEventListener('click', () => this.togglePlayPause());

        // Prevent right-click context menu
        this.mainVideo.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    bindControlEvents() {
        // Center play/pause button
        this.centerPlayButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause();
        });

        // Skip backward
        this.skipBackwardBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - this.config.skipBackwardSeconds);
            this.showControls();
        });

        // Skip forward
        this.skipForwardBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.mainVideo.currentTime = Math.min(this.mainVideo.duration, this.mainVideo.currentTime + this.config.skipForwardSeconds);
            this.showControls();
        });

        // Progress bar click to seek
        this.progressBarContainer?.addEventListener('click', (e) => {
            const rect = this.progressBarContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.mainVideo.currentTime = percent * this.mainVideo.duration;
        });

        // Volume control
        this.volumeBtn?.addEventListener('click', () => {
            if (this.mainVideo.volume > 0) {
                this.mainVideo.volume = 0;
                this.volumeSlider.value = 0;
                this.volumeIcon?.classList.add('hidden');
                this.muteIcon?.classList.remove('hidden');
            } else {
                this.mainVideo.volume = 1;
                this.volumeSlider.value = 100;
                this.volumeIcon?.classList.remove('hidden');
                this.muteIcon?.classList.add('hidden');
            }
        });

        this.volumeSlider?.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.mainVideo.volume = volume;

            if (volume === 0) {
                this.volumeIcon?.classList.add('hidden');
                this.muteIcon?.classList.remove('hidden');
            } else {
                this.volumeIcon?.classList.remove('hidden');
                this.muteIcon?.classList.add('hidden');
            }
        });

        // Fullscreen control
        this.fullscreenBtn?.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.videoContainer?.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Update fullscreen icon
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                this.fullscreenIcon?.classList.add('hidden');
                this.exitFullscreenIcon?.classList.remove('hidden');
            } else {
                this.fullscreenIcon?.classList.remove('hidden');
                this.exitFullscreenIcon?.classList.add('hidden');
            }
        });

        // Mouse movement on video container
        this.videoContainer?.addEventListener('mousemove', () => {
            if (!this.mainVideoControls?.classList.contains('hidden')) {
                this.showControls();
            }
        });

        this.videoContainer?.addEventListener('mouseenter', () => {
            if (!this.mainVideoControls?.classList.contains('hidden')) {
                this.showControls();
            }
        });

        this.videoContainer?.addEventListener('mouseleave', () => {
            if (!this.mainVideo?.paused && !this.mainVideoControls?.classList.contains('hidden') && !this.isSettingsOpen) {
                if (this.bottomControls) this.bottomControls.style.opacity = '0';
                if (this.centerPlayButton) this.centerPlayButton.style.opacity = '0';
                if (this.skipBackwardBtn) this.skipBackwardBtn.style.opacity = '0';
                if (this.skipForwardBtn) this.skipForwardBtn.style.opacity = '0';
                if (this.videoInfo) this.videoInfo.style.opacity = '0';
                if (this.settingsContainer) this.settingsContainer.style.opacity = '0';
            }
        });

        // Track user interaction
        this.bottomControls?.addEventListener('mouseenter', () => {
            this.isUserInteracting = true;
            clearTimeout(this.hideControlsTimeout);
        });

        this.bottomControls?.addEventListener('mouseleave', () => {
            this.isUserInteracting = false;
            this.showControls();
        });
    }

    // ============ SETTINGS MENU CONTROLS ============

    bindSettingsEvents() {
        // Toggle settings menu
        this.settingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isSettingsOpen = !this.isSettingsOpen;
            this.settingsMenu?.classList.toggle('hidden');

            if (this.isSettingsOpen) {
                this.speedSubmenu?.classList.add('hidden');
                this.qualitySubmenu?.classList.add('hidden');
            }
        });

        // Toggle speed submenu
        this.speedMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.speedSubmenu?.classList.toggle('hidden');
            this.qualitySubmenu?.classList.add('hidden');
        });

        // Toggle quality submenu
        this.qualityMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.qualitySubmenu?.classList.toggle('hidden');
            this.speedSubmenu?.classList.add('hidden');
        });

        // Speed option click handlers
        this.speedOptions?.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = parseFloat(option.dataset.speed);
                this.mainVideo.playbackRate = speed;

                if (this.currentSpeed) {
                    this.currentSpeed.textContent = speed === 1 ? '1x' : speed + 'x';
                }

                this.speedOptions.forEach(opt => opt.classList.remove('bg-white/20'));
                option.classList.add('bg-white/20');

                this.speedSubmenu?.classList.add('hidden');
                this.settingsMenu?.classList.add('hidden');
                this.isSettingsOpen = false;
            });
        });

        // Quality option click handlers
        this.qualityOptions?.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const quality = option.dataset.quality;

                if (this.currentQuality) {
                    this.currentQuality.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
                }

                this.qualityOptions.forEach(opt => opt.classList.remove('bg-white/20'));
                option.classList.add('bg-white/20');

                this.qualitySubmenu?.classList.add('hidden');
                this.settingsMenu?.classList.add('hidden');
                this.isSettingsOpen = false;

                console.log('Quality changed to:', quality);
            });
        });

        // Close settings menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isSettingsOpen && !this.settingsContainer?.contains(e.target)) {
                this.settingsMenu?.classList.add('hidden');
                this.speedSubmenu?.classList.add('hidden');
                this.qualitySubmenu?.classList.add('hidden');
                this.isSettingsOpen = false;
            }
        });

        // Track settings menu interaction
        this.settingsContainer?.addEventListener('mouseenter', () => {
            this.isUserInteracting = true;
            clearTimeout(this.hideControlsTimeout);
        });

        this.settingsContainer?.addEventListener('mouseleave', () => {
            if (!this.isSettingsOpen) {
                this.isUserInteracting = false;
                this.showControls();
            }
        });
    }

    // ============ KEYBOARD CONTROLS ============

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.mainVideoControls?.classList.contains('hidden')) return;

            switch(e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - this.config.skipBackwardSeconds);
                    this.showControls();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.mainVideo.currentTime = Math.min(this.mainVideo.duration, this.mainVideo.currentTime + this.config.skipForwardSeconds);
                    this.showControls();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.mainVideo.volume = Math.min(1, this.mainVideo.volume + 0.1);
                    this.volumeSlider.value = this.mainVideo.volume * 100;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.mainVideo.volume = Math.max(0, this.mainVideo.volume - 0.1);
                    this.volumeSlider.value = this.mainVideo.volume * 100;
                    break;
                case 'f':
                    e.preventDefault();
                    this.fullscreenBtn?.click();
                    break;
                case 'm':
                    e.preventDefault();
                    this.volumeBtn?.click();
                    break;
            }
        });
    }

    // ============ PUBLIC METHODS ============

    /**
     * Play the video
     */
    play() {
        this.mainVideo?.play();
    }

    /**
     * Pause the video
     */
    pause() {
        this.mainVideo?.pause();
    }

    /**
     * Set video volume (0-1)
     */
    setVolume(volume) {
        if (this.mainVideo) {
            this.mainVideo.volume = Math.max(0, Math.min(1, volume));
            if (this.volumeSlider) {
                this.volumeSlider.value = this.mainVideo.volume * 100;
            }
        }
    }

    /**
     * Seek to specific time (in seconds)
     */
    seekTo(seconds) {
        if (this.mainVideo) {
            this.mainVideo.currentTime = seconds;
        }
    }

    /**
     * Get current time
     */
    getCurrentTime() {
        return this.mainVideo?.currentTime || 0;
    }

    /**
     * Get duration
     */
    getDuration() {
        return this.mainVideo?.duration || 0;
    }

    /**
     * Destroy the player and cleanup
     */
    destroy() {
        clearTimeout(this.hideControlsTimeout);
        // Additional cleanup if needed
    }
}
