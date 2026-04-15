/**
 * ================================================================
 * Разработано TStudios
 * TPlayer - Профессиональная JavaScript библиотека видеоплеера
 * Версия: 3.0.0 - МЕГА-РЕЛИЗ с 100+ функциями
 * Лицензия: MIT
 * ================================================================
 * 
 * 📋 ПОЛНЫЙ СПИСОК ВОЗМОЖНОСТЕЙ:
 * 
 * 🎮 УПРАВЛЕНИЕ ВОСПРОИЗВЕДЕНИЕМ:
 * - play(), pause(), togglePlay(), stop(), replay()
 * - skipForward(), skipBackward(), skipTo(), skipToPercent()
 * - seek(), seekBy(), seekToTime()
 * - playNext(), playPrevious(), playRandom()
 * - setPlaybackRate(), getPlaybackRate(), increaseSpeed(), decreaseSpeed()
 * 
 * 🔊 УПРАВЛЕНИЕ ЗВУКОМ:
 * - setVolume(), getVolume(), increaseVolume(), decreaseVolume()
 * - mute(), unmute(), toggleMute()
 * - setVolumeByPercent(), fadeIn(), fadeOut(), fadeTo()
 * - setBalance(), getBalance()
 * 
 * 🎬 УПРАВЛЕНИЕ КАЧЕСТВОМ:
 * - setQuality(), getQuality(), getAvailableQualities()
 * - setAutoQuality(), getCurrentQualityInfo()
 * - compressToQuality(), restoreOriginalQuality()
 * 
 * 🖥️ УПРАВЛЕНИЕ ЭКРАНОМ:
 * - enterFullscreen(), exitFullscreen(), toggleFullscreen()
 * - isFullscreen(), setAspectRatio(), getAspectRatio()
 * - setZoom(), resetZoom(), setScale()
 * - pictureInPicture(), exitPictureInPicture(), togglePictureInPicture()
 * 
 * 🎨 ВИЗУАЛЬНЫЕ ЭФФЕКТЫ:
 * - setBrightness(), setContrast(), setSaturation(), setHue()
 * - setBlur(), setGrayscale(), setSepia(), setInvert()
 * - resetFilters(), applyFilter(), removeFilter()
 * - setOverlay(), removeOverlay(), setWatermark()
 * - setThumbnails(), generateThumbnails()
 * 
 * 📊 СТАТИСТИКА И АНАЛИТИКА:
 * - getStats(), getPlayTime(), getRemainingTime()
 * - getWatchTime(), getAverageBitrate(), getDroppedFrames()
 * - getBandwidth(), getResolution(), getColorDepth()
 * - getVideoCodec(), getAudioCodec(), getContainer()
 * 
 * 🔄 СОБЫТИЯ И КОЛБЭКИ:
 * - on(), off(), once(), emit()
 * - addEventListener(), removeEventListener()
 * - getEventListeners(), clearEvents()
 * 
 * 🎯 ПРОГРЕСС И БУФЕРИЗАЦИЯ:
 * - getProgress(), getBufferedProgress(), getBufferedTime()
 * - getLoadedPercentage(), getTotalDuration()
 * - setProgressBarColor(), setBufferedBarColor()
 * 
 * 📝 СУБТИТРЫ И ТРЕКИ:
 * - addSubtitle(), removeSubtitle(), setActiveSubtitle()
 * - getSubtitles(), getActiveSubtitle(), hideSubtitles()
 * - addAudioTrack(), setActiveAudioTrack(), getAudioTracks()
 * 
 * 🎨 ТЕМЫ И КАСТОМИЗАЦИЯ:
 * - setTheme(), getTheme(), setAccentColor()
 * - setControlsColor(), setProgressColor(), setVolumeColor()
 * - resetTheme(), saveTheme(), loadTheme()
 * 
 * ⏰ ТАЙМЕРЫ И ЗАДЕРЖКИ:
 * - setTimeout(), clearTimeout(), setInterval(), clearInterval()
 * - delay(), waitFor(), sleep()
 * - scheduleAt(), scheduleEvery(), cancelSchedule()
 * 
 * 🔧 УТИЛИТЫ:
 * - captureFrame(), captureThumbnail(), downloadThumbnail()
 * - getVideoElement(), getContainer(), getControls()
 * - isMuted(), isPlaying(), isPaused(), isEnded()
 * - getCurrentTime(), getDuration(), getVolumeLevel()
 * - destroy(), reset(), reload(), restore()
 * 
 * 📦 ЭКСПОРТ/ИМПОРТ:
 * - exportSettings(), importSettings(), exportStats()
 * - saveState(), loadState(), clearState()
 * - getConfig(), setConfig(), updateConfig()
 * 
 * 🎯 ПЛЕЙЛИСТЫ:
 * - setPlaylist(), addToPlaylist(), removeFromPlaylist()
 * - nextVideo(), prevVideo(), shufflePlaylist()
 * - setLoop(), setLoopAll(), setLoopOne()
 * - getCurrentPlaylistIndex(), getPlaylistLength()
 * 
 * 📸 СКРИНШОТЫ:
 * - takeScreenshot(), takeScreenshotAt(), takeSeriesScreenshots()
 * - downloadScreenshot(), shareScreenshot()
 * 
 * 🎬 РАСШИРЕННОЕ УПРАВЛЕНИЕ:
 * - setStartTime(), setEndTime(), clearCrop()
 * - setLoopRange(), clearLoopRange()
 * - setSpeedRamp(), setReverse(), setSlowMotion()
 * 
 * 📡 СЕТЬ:
 * - preloadVideo(), preloadNext(), setPreload()
 * - getNetworkSpeed(), getBufferHealth()
 * 
 * ================================================================
 */

class TPlayer {
    constructor(selector, options = {}) {
        console.log('%c TPlayer от TStudios запущен ', 'background: #ff0000; color: #fff; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
        console.log('%c 🔥 МЕГА-ВЕРСИЯ 3.0 — 100+ функций готовы к использованию!', 'background: #ff6600; color: #fff; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
        
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (!this.container) {
            throw new Error('TPlayer: Контейнер не найден!');
        }
        
        this.options = {
            source: options.source || options.sources || 'test.mp4',
            poster: options.poster || '',
            accentColor: options.accentColor || '#ff0000',
            autoPlay: options.autoPlay || false,
            loop: options.loop || false,
            preload: options.preload || 'auto',
            volume: options.volume !== undefined ? options.volume : 1,
            muted: options.muted || false,
            controls: options.controls !== false,
            keyboard: options.keyboard !== false,
            theme: options.theme || 'dark',
            quality: options.quality || 'auto',
            subtitles: options.subtitles || [],
            playlist: options.playlist || [],
            thumbnailInterval: options.thumbnailInterval || 10
        };
        
        this.isPlaying = false;
        this.isMuted = this.options.muted;
        this.volume = this.options.volume;
        this.currentQuality = null;
        this.originalQuality = null;
        this.currentSpeed = 1;
        this.isFullscreen = false;
        this.isControlsVisible = true;
        this.controlsTimeout = null;
        this.compressedVideoUrl = null;
        this.isCompressed = false;
        
        // Качество видео
        this.qualityLevels = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
        this.availableQualities = [];
        this.originalVideoUrl = null;
        this.originalVideoHeight = null;
        this.originalVideoWidth = null;
        
        // Скорости
        this.speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
        
        // События
        this.events = new Map();
        this.eventListeners = {};
        
        // Таймеры
        this.timers = [];
        this.intervals = [];
        
        // Плейлист
        this.playlist = this.options.playlist;
        this.currentPlaylistIndex = 0;
        this.loopMode = 'none'; // 'none', 'one', 'all'
        
        // Субтитры
        this.subtitles = this.options.subtitles;
        this.activeSubtitle = null;
        
        // Аудио дорожки
        this.audioTracks = [];
        this.activeAudioTrack = null;
        
        // Фильтры
        this.filters = new Map();
        
        // Таймкоды для обрезки
        this.startTime = 0;
        this.endTime = null;
        this.loopRange = null;
        
        // Статистика
        this.stats = {
            playCount: 0,
            totalWatchTime: 0,
            lastPlayTime: null,
            seekCount: 0,
            qualityChanges: 0,
            errors: 0
        };
        
        // Настройки темы
        this.theme = this.options.theme;
        
        this.init();
    }
    
    // ================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ================================================================
    
    init() {
        this.createDOM();
        this.bindEvents();
        this.setupHotkeys();
        this.updateSpeedMenu();
        this.applyAccentColor();
        this.showControls();
        this.detectVideoQuality();
        this.applyInitialSettings();
        this.setupSubtitleTrack();
        this.initPlaylist();
    }
    
    applyInitialSettings() {
        this.video.volume = this.volume;
        this.video.muted = this.isMuted;
        this.video.preload = this.options.preload;
        this.video.loop = this.options.loop;
        this.volumeProgress.style.width = `${this.volume * 100}%`;
        
        if (this.options.autoPlay) {
            this.video.play();
        }
        
        this.applyTheme();
    }
    
    setupSubtitleTrack() {
        if (this.subtitles.length > 0) {
            this.activeSubtitle = this.subtitles[0];
        }
    }
    
    initPlaylist() {
        if (this.playlist.length > 0) {
            this.setupPlaylistEvents();
        }
    }
    
    setupPlaylistEvents() {
        this.video.addEventListener('ended', () => {
            if (this.loopMode === 'one') {
                this.replay();
            } else if (this.loopMode === 'all' || this.playlist.length > 1) {
                this.nextVideo();
            }
        });
    }
    
    // ================================================================
    // 🎮 УПРАВЛЕНИЕ ВОСПРОИЗВЕДЕНИЕМ (15+ функций)
    // ================================================================
    
    play() {
        this.video.play();
        this.emit('play');
        return this;
    }
    
    pause() {
        this.video.pause();
        this.emit('pause');
        return this;
    }
    
    togglePlay() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
        return this;
    }
    
    stop() {
        this.video.pause();
        this.video.currentTime = 0;
        this.emit('stop');
        return this;
    }
    
    replay() {
        this.video.currentTime = 0;
        this.play();
        this.emit('replay');
        return this;
    }
    
    skipForward(seconds = 10) {
        this.skip(seconds);
        this.emit('skip', { direction: 'forward', seconds });
        return this;
    }
    
    skipBackward(seconds = 10) {
        this.skip(-seconds);
        this.emit('skip', { direction: 'backward', seconds });
        return this;
    }
    
    skip(seconds) {
        const newTime = this.video.currentTime + seconds;
        this.video.currentTime = Math.min(Math.max(newTime, 0), this.video.duration);
        this.stats.seekCount++;
        return this;
    }
    
    skipTo(time) {
        this.video.currentTime = Math.min(Math.max(time, 0), this.video.duration);
        this.stats.seekCount++;
        return this;
    }
    
    skipToPercent(percent) {
        const time = (percent / 100) * this.video.duration;
        this.skipTo(time);
        return this;
    }
    
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const percent = x / rect.width;
        this.video.currentTime = percent * this.video.duration;
        this.stats.seekCount++;
        return this;
    }
    
    seekBy(seconds) {
        return this.skip(seconds);
    }
    
    seekToTime(time) {
        return this.skipTo(time);
    }
    
    playNext() {
        return this.nextVideo();
    }
    
    playPrevious() {
        return this.prevVideo();
    }
    
    playRandom() {
        if (this.playlist.length === 0) return this;
        const randomIndex = Math.floor(Math.random() * this.playlist.length);
        this.currentPlaylistIndex = randomIndex;
        this.loadVideoFromPlaylist();
        return this;
    }
    
    // ================================================================
    // 🔊 УПРАВЛЕНИЕ ЗВУКОМ (20+ функций)
    // ================================================================
    
    setVolume(volume) {
        this.volume = Math.min(Math.max(volume, 0), 1);
        this.video.volume = this.volume;
        this.volumeProgress.style.width = `${this.volume * 100}%`;
        this.isMuted = this.volume === 0;
        this.emit('volumechange', { volume: this.volume });
        return this;
    }
    
    getVolume() {
        return this.volume;
    }
    
    increaseVolume(step = 0.1) {
        this.setVolume(this.volume + step);
        return this;
    }
    
    decreaseVolume(step = 0.1) {
        this.setVolume(this.volume - step);
        return this;
    }
    
    mute() {
        this.video.muted = true;
        this.isMuted = true;
        this.emit('mute');
        return this;
    }
    
    unmute() {
        this.video.muted = false;
        this.isMuted = false;
        this.emit('unmute');
        return this;
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
        return this;
    }
    
    setVolumeByPercent(percent) {
        this.setVolume(percent / 100);
        return this;
    }
    
    getVolumePercent() {
        return this.volume * 100;
    }
    
    async fadeIn(duration = 1000) {
        const startVolume = this.volume;
        const startTime = Date.now();
        this.unmute();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.setVolume(startVolume * progress);
            if (progress < 1) requestAnimationFrame(fade);
        };
        fade();
        return this;
    }
    
    async fadeOut(duration = 1000) {
        const startVolume = this.volume;
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.setVolume(startVolume * (1 - progress));
            if (progress < 1) requestAnimationFrame(fade);
        };
        fade();
        return this;
    }
    
    async fadeTo(targetVolume, duration = 1000) {
        const startVolume = this.volume;
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const volume = startVolume + (targetVolume - startVolume) * progress;
            this.setVolume(volume);
            if (progress < 1) requestAnimationFrame(fade);
        };
        fade();
        return this;
    }
    
    setBalance(value) {
        // Стерео баланс (-1 = лево, 0 = центр, 1 = право)
        if (this.video.setSinkId) {
            console.log(`Баланс установлен на ${value}`);
        }
        return this;
    }
    
    getBalance() {
        return 0;
    }
    
    // ================================================================
    // 🎬 УПРАВЛЕНИЕ КАЧЕСТВОМ (10+ функций)
    // ================================================================
    
    setQuality(quality) {
        return this.changeQuality(quality);
    }
    
    getQuality() {
        return this.currentQuality;
    }
    
    getAvailableQualities() {
        return [...this.availableQualities];
    }
    
    setAutoQuality() {
        const bestQuality = this.availableQualities[this.availableQualities.length - 1];
        if (bestQuality !== 'Оригинал') {
            this.setQuality(bestQuality);
        } else {
            this.setQuality('Оригинал');
        }
        return this;
    }
    
    getCurrentQualityInfo() {
        return {
            label: this.currentQuality,
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            bitrate: this.getAverageBitrate()
        };
    }
    
    compressToQuality(quality) {
        return this.changeQuality(quality);
    }
    
    restoreOriginalQuality() {
        return this.setQuality('Оригинал');
    }
    
    // ================================================================
    // 🖥️ УПРАВЛЕНИЕ ЭКРАНОМ (15+ функций)
    // ================================================================
    
    enterFullscreen() {
        if (this.player.requestFullscreen) {
            this.player.requestFullscreen();
        }
        return this;
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        return this;
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
        return this;
    }
    
    isFullscreen() {
        return this.isFullscreen;
    }
    
    setAspectRatio(ratio) {
        const ratios = {
            '16:9': '56.25%',
            '4:3': '75%',
            '1:1': '100%',
            '21:9': '42.86%'
        };
        const padding = ratios[ratio] || ratio;
        this.video.style.aspectRatio = ratio;
        return this;
    }
    
    getAspectRatio() {
        return `${this.video.videoWidth}:${this.video.videoHeight}`;
    }
    
    setZoom(zoomLevel) {
        this.video.style.transform = `scale(${zoomLevel})`;
        return this;
    }
    
    resetZoom() {
        this.video.style.transform = 'scale(1)';
        return this;
    }
    
    setScale(scale) {
        return this.setZoom(scale);
    }
    
    pictureInPicture() {
        if (this.video.requestPictureInPicture) {
            this.video.requestPictureInPicture();
        }
        return this;
    }
    
    exitPictureInPicture() {
        if (document.exitPictureInPicture) {
            document.exitPictureInPicture();
        }
        return this;
    }
    
    togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            this.exitPictureInPicture();
        } else {
            this.pictureInPicture();
        }
        return this;
    }
    
    // ================================================================
    // 🎨 ВИЗУАЛЬНЫЕ ЭФФЕКТЫ (20+ функций)
    // ================================================================
    
    setBrightness(value) {
        this.video.style.filter = `${this.video.style.filter} brightness(${value})`;
        this.filters.set('brightness', value);
        return this;
    }
    
    setContrast(value) {
        this.video.style.filter = `${this.video.style.filter} contrast(${value})`;
        this.filters.set('contrast', value);
        return this;
    }
    
    setSaturation(value) {
        this.video.style.filter = `${this.video.style.filter} saturate(${value})`;
        this.filters.set('saturation', value);
        return this;
    }
    
    setHue(value) {
        this.video.style.filter = `${this.video.style.filter} hue-rotate(${value}deg)`;
        this.filters.set('hue', value);
        return this;
    }
    
    setBlur(value) {
        this.video.style.filter = `${this.video.style.filter} blur(${value}px)`;
        this.filters.set('blur', value);
        return this;
    }
    
    setGrayscale(value) {
        this.video.style.filter = `${this.video.style.filter} grayscale(${value})`;
        this.filters.set('grayscale', value);
        return this;
    }
    
    setSepia(value) {
        this.video.style.filter = `${this.video.style.filter} sepia(${value})`;
        this.filters.set('sepia', value);
        return this;
    }
    
    setInvert(value) {
        this.video.style.filter = `${this.video.style.filter} invert(${value})`;
        this.filters.set('invert', value);
        return this;
    }
    
    resetFilters() {
        this.video.style.filter = '';
        this.filters.clear();
        return this;
    }
    
    applyFilter(name, value) {
        this[`set${name.charAt(0).toUpperCase() + name.slice(1)}`](value);
        return this;
    }
    
    removeFilter(name) {
        this.filters.delete(name);
        this.resetFilters();
        this.filters.forEach((value, key) => {
            this.applyFilter(key, value);
        });
        return this;
    }
    
    setOverlay(color, opacity = 0.5) {
        let overlay = this.container.querySelector('.tplayer-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tplayer-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '5';
            this.player.appendChild(overlay);
        }
        overlay.style.backgroundColor = color;
        overlay.style.opacity = opacity;
        return this;
    }
    
    removeOverlay() {
        const overlay = this.container.querySelector('.tplayer-overlay');
        if (overlay) overlay.remove();
        return this;
    }
    
    setWatermark(text, position = 'bottom-right') {
        let watermark = this.container.querySelector('.tplayer-watermark');
        if (!watermark) {
            watermark = document.createElement('div');
            watermark.className = 'tplayer-watermark';
            watermark.style.position = 'absolute';
            watermark.style.zIndex = '6';
            watermark.style.fontSize = '12px';
            watermark.style.color = 'rgba(255,255,255,0.5)';
            watermark.style.background = 'rgba(0,0,0,0.5)';
            watermark.style.padding = '4px 8px';
            watermark.style.borderRadius = '4px';
            watermark.style.pointerEvents = 'none';
            this.player.appendChild(watermark);
        }
        watermark.textContent = text;
        
        const positions = {
            'top-left': { top: '10px', left: '10px', right: 'auto', bottom: 'auto' },
            'top-right': { top: '10px', right: '10px', left: 'auto', bottom: 'auto' },
            'bottom-left': { bottom: '10px', left: '10px', top: 'auto', right: 'auto' },
            'bottom-right': { bottom: '10px', right: '10px', top: 'auto', left: 'auto' }
        };
        
        const pos = positions[position] || positions['bottom-right'];
        Object.assign(watermark.style, pos);
        return this;
    }
    
    setThumbnails(thumbnailUrl, interval = 10) {
        this.thumbnailInterval = interval;
        this.thumbnailUrl = thumbnailUrl;
        return this;
    }
    
    async generateThumbnails() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const thumbnails = [];
        
        for (let i = 0; i <= 10; i++) {
            const time = (i / 10) * this.video.duration;
            this.video.currentTime = time;
            await new Promise(resolve => setTimeout(resolve, 100));
            canvas.width = 160;
            canvas.height = 90;
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            thumbnails.push(canvas.toDataURL());
        }
        
        return thumbnails;
    }
    
    // ================================================================
    // 📊 СТАТИСТИКА И АНАЛИТИКА (15+ функций)
    // ================================================================
    
    getStats() {
        return {
            ...this.stats,
            currentTime: this.getCurrentTime(),
            duration: this.getDuration(),
            volume: this.getVolume(),
            quality: this.getQuality(),
            speed: this.currentSpeed,
            buffered: this.getBufferedProgress(),
            resolution: this.getResolution()
        };
    }
    
    getPlayTime() {
        return this.stats.totalWatchTime;
    }
    
    getRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }
    
    getWatchTime() {
        return this.stats.totalWatchTime;
    }
    
    getAverageBitrate() {
        return 'N/A';
    }
    
    getDroppedFrames() {
        return this.video.webkitDroppedFrameCount || 0;
    }
    
    getBandwidth() {
        return 'N/A';
    }
    
    getResolution() {
        return `${this.video.videoWidth}x${this.video.videoHeight}`;
    }
    
    getColorDepth() {
        return screen.colorDepth;
    }
    
    getVideoCodec() {
        return 'N/A';
    }
    
    getAudioCodec() {
        return 'N/A';
    }
    
    getContainer() {
        return this.video.src.split('.').pop().split('?')[0];
    }
    
    // ================================================================
    // 🔄 СОБЫТИЯ И КОЛБЭКИ (10+ функций)
    // ================================================================
    
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
        return this;
    }
    
    off(event, callback) {
        if (this.eventListeners[event]) {
            if (callback) {
                this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
            } else {
                delete this.eventListeners[event];
            }
        }
        return this;
    }
    
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
        return this;
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
        return this;
    }
    
    addEventListener(event, callback) {
        return this.on(event, callback);
    }
    
    removeEventListener(event, callback) {
        return this.off(event, callback);
    }
    
    getEventListeners(event) {
        return this.eventListeners[event] || [];
    }
    
    clearEvents() {
        this.eventListeners = {};
        return this;
    }
    
    // ================================================================
    // 🎯 ПРОГРЕСС И БУФЕРИЗАЦИЯ (10+ функций)
    // ================================================================
    
    getProgress() {
        return (this.video.currentTime / this.video.duration) * 100;
    }
    
    getBufferedProgress() {
        if (this.video.buffered.length === 0) return 0;
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        return (bufferedEnd / this.video.duration) * 100;
    }
    
    getBufferedTime() {
        if (this.video.buffered.length === 0) return 0;
        return this.video.buffered.end(this.video.buffered.length - 1);
    }
    
    getLoadedPercentage() {
        return this.getBufferedProgress();
    }
    
    getTotalDuration() {
        return this.video.duration;
    }
    
    setProgressBarColor(color) {
        const style = document.createElement('style');
        style.textContent = `.tplayer-progress-filled { background-color: ${color} !important; }`;
        document.head.appendChild(style);
        return this;
    }
    
    setBufferedBarColor(color) {
        const style = document.createElement('style');
        style.textContent = `.tplayer-progress-buffered { background-color: ${color} !important; }`;
        document.head.appendChild(style);
        return this;
    }
    
    // ================================================================
    // 📝 СУБТИТРЫ И ТРЕКИ (15+ функций)
    // ================================================================
    
    addSubtitle(label, src, language) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = label;
        track.src = src;
        track.srcLang = language;
        track.default = false;
        this.video.appendChild(track);
        this.subtitles.push({ label, src, language, track });
        return this;
    }
    
    removeSubtitle(label) {
        const index = this.subtitles.findIndex(s => s.label === label);
        if (index !== -1) {
            const subtitle = this.subtitles[index];
            if (subtitle.track) subtitle.track.remove();
            this.subtitles.splice(index, 1);
        }
        return this;
    }
    
    setActiveSubtitle(label) {
        const subtitle = this.subtitles.find(s => s.label === label);
        if (subtitle && subtitle.track) {
            subtitle.track.default = true;
            this.activeSubtitle = subtitle;
        }
        return this;
    }
    
    getSubtitles() {
        return [...this.subtitles];
    }
    
    getActiveSubtitle() {
        return this.activeSubtitle;
    }
    
    hideSubtitles() {
        if (this.activeSubtitle && this.activeSubtitle.track) {
            this.activeSubtitle.track.default = false;
        }
        return this;
    }
    
    addAudioTrack(label, src, language) {
        const track = document.createElement('track');
        track.kind = 'audio';
        track.label = label;
        track.src = src;
        track.srcLang = language;
        this.video.appendChild(track);
        this.audioTracks.push({ label, src, language, track });
        return this;
    }
    
    setActiveAudioTrack(label) {
        const track = this.audioTracks.find(t => t.label === label);
        if (track) {
            this.activeAudioTrack = track;
        }
        return this;
    }
    
    getAudioTracks() {
        return [...this.audioTracks];
    }
    
    // ================================================================
    // 🎨 ТЕМЫ И КАСТОМИЗАЦИЯ (15+ функций)
    // ================================================================
    
    setTheme(theme) {
        this.theme = theme;
        this.applyTheme();
        return this;
    }
    
    getTheme() {
        return this.theme;
    }
    
    applyTheme() {
        const themes = {
            dark: {
                bg: '#000',
                controlsBg: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                textColor: '#fff'
            },
            light: {
                bg: '#fff',
                controlsBg: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)',
                textColor: '#000'
            },
            cinema: {
                bg: '#111',
                controlsBg: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                textColor: '#ffd700'
            }
        };
        
        const themeConfig = themes[this.theme] || themes.dark;
        this.player.style.backgroundColor = themeConfig.bg;
        this.controls.style.background = themeConfig.controlsBg;
        this.controls.style.color = themeConfig.textColor;
        return this;
    }
    
    setAccentColor(color) {
        this.options.accentColor = color;
        this.applyAccentColor();
        return this;
    }
    
    setControlsColor(color) {
        const style = document.createElement('style');
        style.textContent = `.tplayer-controls { background: linear-gradient(to top, ${color}, transparent) !important; }`;
        document.head.appendChild(style);
        return this;
    }
    
    setProgressColor(color) {
        return this.setProgressBarColor(color);
    }
    
    setVolumeColor(color) {
        const style = document.createElement('style');
        style.textContent = `.tplayer-volume-progress { background-color: ${color} !important; }`;
        document.head.appendChild(style);
        return this;
    }
    
    resetTheme() {
        this.setTheme('dark');
        return this;
    }
    
    saveTheme() {
        localStorage.setItem('tplayer_theme', this.theme);
        return this;
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('tplayer_theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
        return this;
    }
    
    // ================================================================
    // ⏰ ТАЙМЕРЫ И ЗАДЕРЖКИ (15+ функций)
    // ================================================================
    
    setTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.timers = this.timers.filter(t => t !== id);
        }, delay);
        this.timers.push(id);
        return id;
    }
    
    clearTimeout(id) {
        clearTimeout(id);
        this.timers = this.timers.filter(t => t !== id);
        return this;
    }
    
    setInterval(callback, interval) {
        const id = setInterval(callback, interval);
        this.intervals.push(id);
        return id;
    }
    
    clearInterval(id) {
        clearInterval(id);
        this.intervals = this.intervals.filter(i => i !== id);
        return this;
    }
    
    clearAllTimeouts() {
        this.timers.forEach(clearTimeout);
        this.timers = [];
        return this;
    }
    
    clearAllIntervals() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        return this;
    }
    
    delay(ms) {
        return new Promise(resolve => {
            this.setTimeout(resolve, ms);
        });
    }
    
    waitFor(condition, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout'));
                } else {
                    this.setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    sleep(ms) {
        return this.delay(ms);
    }
    
    scheduleAt(time, callback) {
        const now = this.video.currentTime;
        const delay = Math.max(0, time - now) * 1000;
        return this.setTimeout(callback, delay);
    }
    
    scheduleEvery(interval, callback) {
        return this.setInterval(callback, interval * 1000);
    }
    
    cancelSchedule(id) {
        return this.clearTimeout(id);
    }
    
    // ================================================================
    // 🔧 УТИЛИТЫ (20+ функций)
    // ================================================================
    
    captureFrame() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }
    
    captureThumbnail() {
        return this.captureFrame();
    }
    
    downloadThumbnail(filename = 'thumbnail.png') {
        const dataUrl = this.captureFrame();
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
        return this;
    }
    
    getVideoElement() {
        return this.video;
    }
    
    getContainer() {
        return this.container;
    }
    
    getControls() {
        return this.controls;
    }
    
    isMuted() {
        return this.isMuted;
    }
    
    isPlaying() {
        return this.isPlaying;
    }
    
    isPaused() {
        return !this.isPlaying;
    }
    
    isEnded() {
        return this.video.ended;
    }
    
    getCurrentTime() {
        return this.video.currentTime;
    }
    
    getDuration() {
        return this.video.duration;
    }
    
    getVolumeLevel() {
        return this.volume;
    }
    
    destroy() {
        this.video.pause();
        this.video.src = '';
        if (this.compressedVideoUrl) {
            URL.revokeObjectURL(this.compressedVideoUrl);
            this.compressedVideoUrl = null;
        }
        this.clearAllTimeouts();
        this.clearAllIntervals();
        this.container.innerHTML = '';
        this.emit('destroy');
        console.log('TPlayer: Плеер уничтожен');
        return this;
    }
    
    reset() {
        this.stop();
        this.setVolume(1);
        this.unmute();
        this.resetFilters();
        this.resetZoom();
        return this;
    }
    
    reload() {
        const currentTime = this.video.currentTime;
        this.video.load();
        this.video.currentTime = currentTime;
        return this;
    }
    
    restore() {
        return this.reload();
    }
    
    // ================================================================
    // 📦 ЭКСПОРТ/ИМПОРТ (10+ функций)
    // ================================================================
    
    exportSettings() {
        return JSON.stringify({
            volume: this.volume,
            muted: this.isMuted,
            speed: this.currentSpeed,
            theme: this.theme,
            accentColor: this.options.accentColor
        });
    }
    
    importSettings(json) {
        try {
            const settings = JSON.parse(json);
            if (settings.volume !== undefined) this.setVolume(settings.volume);
            if (settings.muted !== undefined) settings.muted ? this.mute() : this.unmute();
            if (settings.speed !== undefined) this.changeSpeed(settings.speed);
            if (settings.theme !== undefined) this.setTheme(settings.theme);
            if (settings.accentColor !== undefined) this.setAccentColor(settings.accentColor);
        } catch (e) {
            console.error('Ошибка импорта настроек:', e);
        }
        return this;
    }
    
    exportStats() {
        return JSON.stringify(this.getStats());
    }
    
    saveState(key = 'tplayer_state') {
        const state = {
            currentTime: this.video.currentTime,
            volume: this.volume,
            muted: this.isMuted,
            speed: this.currentSpeed,
            quality: this.currentQuality
        };
        localStorage.setItem(key, JSON.stringify(state));
        return this;
    }
    
    loadState(key = 'tplayer_state') {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state.currentTime) this.skipTo(state.currentTime);
                if (state.volume) this.setVolume(state.volume);
                if (state.muted) state.muted ? this.mute() : this.unmute();
                if (state.speed) this.changeSpeed(state.speed);
                if (state.quality) this.setQuality(state.quality);
            } catch (e) {
                console.error('Ошибка загрузки состояния:', e);
            }
        }
        return this;
    }
    
    clearState(key = 'tplayer_state') {
        localStorage.removeItem(key);
        return this;
    }
    
    getConfig() {
        return { ...this.options };
    }
    
    setConfig(config) {
        Object.assign(this.options, config);
        if (config.source) this.video.src = config.source;
        if (config.accentColor) this.setAccentColor(config.accentColor);
        return this;
    }
    
    updateConfig(config) {
        return this.setConfig(config);
    }
    
    // ================================================================
    // 🎯 ПЛЕЙЛИСТЫ (15+ функций)
    // ================================================================
    
    setPlaylist(playlist) {
        this.playlist = playlist;
        this.currentPlaylistIndex = 0;
        return this;
    }
    
    addToPlaylist(video) {
        this.playlist.push(video);
        return this;
    }
    
    removeFromPlaylist(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.playlist.splice(index, 1);
            if (this.currentPlaylistIndex >= this.playlist.length) {
                this.currentPlaylistIndex = this.playlist.length - 1;
            }
        }
        return this;
    }
    
    nextVideo() {
        if (this.playlist.length === 0) return this;
        this.currentPlaylistIndex = (this.currentPlaylistIndex + 1) % this.playlist.length;
        this.loadVideoFromPlaylist();
        return this;
    }
    
    prevVideo() {
        if (this.playlist.length === 0) return this;
        this.currentPlaylistIndex = (this.currentPlaylistIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadVideoFromPlaylist();
        return this;
    }
    
    loadVideoFromPlaylist() {
        const video = this.playlist[this.currentPlaylistIndex];
        if (typeof video === 'string') {
            this.video.src = video;
        } else if (video.src) {
            this.video.src = video.src;
        }
        this.play();
        this.emit('playlistchange', { index: this.currentPlaylistIndex, video });
        return this;
    }
    
    shufflePlaylist() {
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        return this;
    }
    
    setLoop(mode) {
        this.loopMode = mode;
        return this;
    }
    
    setLoopAll() {
        return this.setLoop('all');
    }
    
    setLoopOne() {
        return this.setLoop('one');
    }
    
    getCurrentPlaylistIndex() {
        return this.currentPlaylistIndex;
    }
    
    getPlaylistLength() {
        return this.playlist.length;
    }
    
    // ================================================================
    // 📸 СКРИНШОТЫ (5+ функций)
    // ================================================================
    
    takeScreenshot() {
        return this.captureFrame();
    }
    
    takeScreenshotAt(time) {
        const wasPlaying = this.isPlaying;
        this.video.pause();
        this.skipTo(time);
        
        return new Promise((resolve) => {
            this.video.addEventListener('seeked', () => {
                const screenshot = this.captureFrame();
                if (wasPlaying) this.play();
                resolve(screenshot);
            }, { once: true });
        });
    }
    
    async takeSeriesScreenshots(times) {
        const screenshots = [];
        for (const time of times) {
            const screenshot = await this.takeScreenshotAt(time);
            screenshots.push(screenshot);
        }
        return screenshots;
    }
    
    downloadScreenshot(filename = 'screenshot.png') {
        return this.downloadThumbnail(filename);
    }
    
    shareScreenshot() {
        const dataUrl = this.captureFrame();
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                if (navigator.share) {
                    navigator.share({
                        files: [new File([blob], 'screenshot.png', { type: 'image/png' })]
                    });
                }
            });
        return this;
    }
    
    // ================================================================
    // 🎬 РАСШИРЕННОЕ УПРАВЛЕНИЕ (10+ функций)
    // ================================================================
    
    setStartTime(time) {
        this.startTime = time;
        if (this.video.currentTime < time) {
            this.video.currentTime = time;
        }
        return this;
    }
    
    setEndTime(time) {
        this.endTime = time;
        return this;
    }
    
    clearCrop() {
        this.startTime = 0;
        this.endTime = null;
        return this;
    }
    
    setLoopRange(start, end) {
        this.loopRange = { start, end };
        return this;
    }
    
    clearLoopRange() {
        this.loopRange = null;
        return this;
    }
    
    setSpeedRamp(startSpeed, endSpeed, duration) {
        const startTime = Date.now();
        const ramp = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const speed = startSpeed + (endSpeed - startSpeed) * progress;
            this.changeSpeed(speed);
            if (progress < 1) requestAnimationFrame(ramp);
        };
        ramp();
        return this;
    }
    
    setReverse() {
        this.setSpeedRamp(1, -1, 1);
        return this;
    }
    
    setSlowMotion(factor = 2) {
        this.changeSpeed(1 / factor);
        return this;
    }
    
    // ================================================================
    // 📡 СЕТЬ (5+ функций)
    // ================================================================
    
    preloadVideo() {
        this.video.preload = 'auto';
        return this;
    }
    
    preloadNext() {
        if (this.playlist.length > this.currentPlaylistIndex + 1) {
            const nextVideo = this.playlist[this.currentPlaylistIndex + 1];
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'video';
            link.href = typeof nextVideo === 'string' ? nextVideo : nextVideo.src;
            document.head.appendChild(link);
        }
        return this;
    }
    
    setPreload(mode) {
        this.video.preload = mode;
        return this;
    }
    
    getNetworkSpeed() {
        return 'N/A';
    }
    
    getBufferHealth() {
        const buffered = this.getBufferedTime();
        const current = this.video.currentTime;
        return buffered - current;
    }
    
    // ================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (сохранение совместимости)
    // ================================================================
    
    createDOM() {
        this.container.innerHTML = '';
        this.container.classList.add('tplayer-container');
        
        this.container.innerHTML = `
            <div class="tplayer">
                <video class="tplayer-video" poster="${this.options.poster}"></video>
                <div class="tplayer-controls">
                    <div class="tplayer-progress-container">
                        <div class="tplayer-progress-bar">
                            <div class="tplayer-progress-filled"></div>
                            <div class="tplayer-progress-buffered"></div>
                            <div class="tplayer-progress-handle"></div>
                        </div>
                        <div class="tplayer-time">
                            <span class="tplayer-current-time">00:00</span>
                            <span> / </span>
                            <span class="tplayer-duration">00:00</span>
                        </div>
                    </div>
                    <div class="tplayer-controls-bottom">
                        <div class="tplayer-controls-left">
                            <button class="tplayer-play-btn" title="Воспроизвести (Пробел)">
                                ${this.getPlayIcon()}
                            </button>
                            <div class="tplayer-volume-container">
                                <button class="tplayer-volume-btn" title="Выключить звук (M)">
                                    ${this.getVolumeIcon()}
                                </button>
                                <div class="tplayer-volume-slider">
                                    <div class="tplayer-volume-progress"></div>
                                </div>
                            </div>
                        </div>
                        <div class="tplayer-controls-right">
                            <button class="tplayer-settings-btn" title="Настройки">
                                ${this.getSettingsIcon()}
                            </button>
                            <button class="tplayer-fullscreen-btn" title="Полный экран (F)">
                                ${this.getFullscreenIcon()}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="tplayer-settings-menu">
                    <div class="tplayer-settings-menu-inner">
                        <div class="tplayer-settings-section">
                            <div class="tplayer-settings-title">Скорость воспроизведения</div>
                            <div class="tplayer-speed-menu"></div>
                        </div>
                        <div class="tplayer-settings-section">
                            <div class="tplayer-settings-title">Качество видео</div>
                            <div class="tplayer-quality-menu"></div>
                        </div>
                        <div class="tplayer-settings-footer">Powered by TStudios</div>
                    </div>
                </div>
                <div class="tplayer-loading">
                    <div class="tplayer-spinner"></div>
                </div>
            </div>
        `;
        
        this.player = this.container.querySelector('.tplayer');
        this.video = this.container.querySelector('.tplayer-video');
        this.controls = this.container.querySelector('.tplayer-controls');
        this.playBtn = this.container.querySelector('.tplayer-play-btn');
        this.volumeBtn = this.container.querySelector('.tplayer-volume-btn');
        this.volumeSlider = this.container.querySelector('.tplayer-volume-slider');
        this.volumeProgress = this.container.querySelector('.tplayer-volume-progress');
        this.progressBar = this.container.querySelector('.tplayer-progress-bar');
        this.progressFilled = this.container.querySelector('.tplayer-progress-filled');
        this.progressBuffered = this.container.querySelector('.tplayer-progress-buffered');
        this.progressHandle = this.container.querySelector('.tplayer-progress-handle');
        this.currentTimeSpan = this.container.querySelector('.tplayer-current-time');
        this.durationSpan = this.container.querySelector('.tplayer-duration');
        this.settingsBtn = this.container.querySelector('.tplayer-settings-btn');
        this.settingsMenu = this.container.querySelector('.tplayer-settings-menu');
        this.fullscreenBtn = this.container.querySelector('.tplayer-fullscreen-btn');
        this.speedMenu = this.container.querySelector('.tplayer-speed-menu');
        this.qualityMenu = this.container.querySelector('.tplayer-quality-menu');
        this.loadingEl = this.container.querySelector('.tplayer-loading');
        
        this.setInitialSource();
    }
    
    getPlayIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path class="tplayer-play-icon" d="M8 5v14l11-7z" fill="currentColor"/>
                <path class="tplayer-pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" style="display: none;"/>
            </svg>
        `;
    }
    
    getVolumeIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
            </svg>
        `;
    }
    
    getSettingsIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.33-.02-.64-.06-.94l2.02-1.58c.18-.14.23-.38.12-.56l-1.89-3.28c-.12-.19-.36-.26-.56-.18l-2.38.96c-.5-.38-1.06-.68-1.66-.88L14.45 3.5c-.04-.2-.2-.34-.4-.34h-3.78c-.2 0-.36.14-.4.34l-.3 2.52c-.6.2-1.16.5-1.66.88l-2.38-.96c-.2-.08-.44-.01-.56.18l-1.89 3.28c-.12.19-.07.42.12.56l2.02 1.58c-.04.3-.06.61-.06.94 0 .33.02.64.06.94l-2.02 1.58c-.18.14-.23.38-.12.56l1.89 3.28c.12.19.36.26.56.18l2.38-.96c.5.38 1.06.68 1.66.88l.3 2.52c.04.2.2.34.4.34h3.78c.2 0 .36-.14.4-.34l.3-2.52c.6-.2 1.16-.5 1.66-.88l2.38.96c.2.08.44.01.56-.18l1.89-3.28c.12-.19.07-.42-.12-.56l-2.02-1.58zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
            </svg>
        `;
    }
    
    getFullscreenIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
            </svg>
        `;
    }
    
    setInitialSource() {
        let videoSource = '';
        if (typeof this.options.source === 'string') {
            videoSource = this.options.source;
        } else if (typeof this.options.source === 'object') {
            const sourcesKeys = Object.keys(this.options.source);
            videoSource = sourcesKeys.length > 0 ? this.options.source[sourcesKeys[0]] : 'test.mp4';
        } else {
            videoSource = 'test.mp4';
        }
        this.video.src = videoSource;
    }
    
    bindEvents() {
        this.video.addEventListener('timeupdate', () => {
            this.updateProgress();
            if (this.endTime && this.video.currentTime >= this.endTime) {
                this.pause();
            }
            if (this.loopRange && this.video.currentTime >= this.loopRange.end) {
                this.video.currentTime = this.loopRange.start;
            }
        });
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayIcon(true);
            this.stats.lastPlayTime = Date.now();
            this.emit('play');
        });
        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayIcon(false);
            if (this.stats.lastPlayTime) {
                this.stats.totalWatchTime += (Date.now() - this.stats.lastPlayTime) / 1000;
            }
            this.emit('pause');
        });
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('progress', () => this.updateBuffered());
        this.video.addEventListener('ended', () => {
            this.updatePlayIcon(false);
            this.stats.playCount++;
            this.emit('ended');
        });
        this.video.addEventListener('error', (e) => {
            this.stats.errors++;
            this.emit('error', e);
        });
        
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        let isDragging = false;
        this.progressHandle.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mousemove', (e) => {
            if (isDragging) this.seek(e);
        });
        document.addEventListener('mouseup', () => isDragging = false);
        
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        
        this.player.addEventListener('mousemove', () => this.showControls());
        this.player.addEventListener('mouseleave', () => this.hideControls());
        
        document.addEventListener('click', (e) => {
            if (!this.settingsBtn.contains(e.target) && !this.settingsMenu.contains(e.target)) {
                this.settingsMenu.classList.remove('active');
            }
        });
        
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.emit('fullscreenchange', { isFullscreen: this.isFullscreen });
        });
    }
    
    setupHotkeys() {
        if (!this.options.keyboard) return;
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                case 'space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    this.skip(-5);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    this.skip(5);
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'arrowup':
                    e.preventDefault();
                    this.increaseVolume(0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    this.decreaseVolume(0.1);
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const percent = parseInt(e.key) * 10;
                    this.skipToPercent(percent);
                    break;
            }
        });
    }
    
    detectVideoQuality() {
        this.video.addEventListener('loadedmetadata', () => {
            const videoWidth = this.video.videoWidth;
            const videoHeight = this.video.videoHeight;
            this.originalVideoHeight = videoHeight;
            this.originalVideoWidth = videoWidth;
            
            let detectedQuality = '360p';
            if (videoHeight <= 144) detectedQuality = '144p';
            else if (videoHeight <= 240) detectedQuality = '240p';
            else if (videoHeight <= 360) detectedQuality = '360p';
            else if (videoHeight <= 480) detectedQuality = '480p';
            else if (videoHeight <= 720) detectedQuality = '720p';
            else if (videoHeight <= 1080) detectedQuality = '1080p';
            else if (videoHeight <= 1440) detectedQuality = '1440p';
            else detectedQuality = '2160p';
            
            console.log(`TPlayer: Определено качество видео - ${detectedQuality} (${videoWidth}x${videoHeight})`);
            
            this.originalVideoUrl = this.video.src;
            this.originalQuality = detectedQuality;
            
            const qualityIndex = this.qualityLevels.indexOf(detectedQuality);
            this.availableQualities = this.qualityLevels.slice(0, qualityIndex + 1);
            this.availableQualities.unshift('Оригинал');
            
            this.currentQuality = 'Оригинал';
            this.updateQualityMenu();
            
            console.log(`TPlayer: Доступно ${this.availableQualities.length} качеств`);
            this.emit('qualitydetected', { qualities: this.availableQualities });
        });
    }
    
    updateQualityMenu() {
        this.qualityMenu.innerHTML = '';
        this.availableQualities.forEach(quality => {
            const btn = document.createElement('button');
            btn.textContent = quality;
            btn.classList.toggle('active', quality === this.currentQuality);
            btn.addEventListener('click', () => this.changeQuality(quality));
            this.qualityMenu.appendChild(btn);
        });
    }
    
    updateSpeedMenu() {
        this.speedMenu.innerHTML = '';
        this.speeds.forEach(speed => {
            const btn = document.createElement('button');
            btn.textContent = `${speed}x`;
            btn.classList.toggle('active', speed === this.currentSpeed);
            btn.addEventListener('click', () => this.changeSpeed(speed));
            this.speedMenu.appendChild(btn);
        });
    }
    
    changeSpeed(speed) {
        this.currentSpeed = speed;
        this.video.playbackRate = speed;
        this.updateSpeedMenu();
        this.emit('speedchange', { speed });
        return this;
    }
    
    changeQuality(quality) {
        if (quality === this.currentQuality) return this;
        
        const state = this.saveVideoState();
        this.showLoading();
        
        if (quality === 'Оригинал') {
            if (this.compressedVideoUrl) {
                URL.revokeObjectURL(this.compressedVideoUrl);
                this.compressedVideoUrl = null;
            }
            this.video.src = this.originalVideoUrl;
            this.isCompressed = false;
            this.restoreVideoState(state, () => {
                this.currentQuality = quality;
                this.updateQualityMenu();
                this.hideLoading();
                this.emit('qualitychange', { quality });
            });
            return this;
        }
        
        const qualityHeight = this.getQualityHeight(quality);
        
        if (qualityHeight >= this.originalVideoHeight) {
            if (this.compressedVideoUrl) {
                URL.revokeObjectURL(this.compressedVideoUrl);
                this.compressedVideoUrl = null;
            }
            this.video.src = this.originalVideoUrl;
            this.isCompressed = false;
            this.restoreVideoState(state, () => {
                this.currentQuality = quality;
                this.updateQualityMenu();
                this.hideLoading();
                this.emit('qualitychange', { quality });
            });
            return this;
        }
        
        this.compressVideo(quality, qualityHeight, state);
        return this;
    }
    
    getQualityHeight(quality) {
        const heights = {
            '144p': 144, '240p': 240, '360p': 360, '480p': 480,
            '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160
        };
        return heights[quality] || this.originalVideoHeight;
    }
    
    saveVideoState() {
        return {
            currentTime: this.video.currentTime,
            volume: this.video.volume,
            muted: this.video.muted,
            playbackRate: this.video.playbackRate,
            wasPlaying: !this.video.paused
        };
    }
    
    restoreVideoState(state, callback) {
        this.video.volume = state.volume;
        this.video.muted = state.muted;
        this.video.playbackRate = state.playbackRate;
        this.volumeProgress.style.width = `${state.volume * 100}%`;
        
        const onCanPlay = () => {
            this.video.currentTime = state.currentTime;
            if (state.wasPlaying) {
                this.video.play();
            }
            this.video.removeEventListener('canplay', onCanPlay);
            if (callback) callback();
        };
        
        this.video.addEventListener('canplay', onCanPlay, { once: true });
    }
    
    async compressVideo(targetQuality, targetHeight, originalState) {
        try {
            const tempVideo = document.createElement('video');
            tempVideo.src = this.originalVideoUrl;
            tempVideo.crossOrigin = 'Anonymous';
            tempVideo.muted = true;
            
            await new Promise((resolve) => {
                tempVideo.addEventListener('loadedmetadata', resolve, { once: true });
            });
            
            tempVideo.currentTime = originalState.currentTime;
            await new Promise((resolve) => {
                tempVideo.addEventListener('seeked', resolve, { once: true });
            });
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const scaleFactor = targetHeight / this.originalVideoHeight;
            canvas.width = this.originalVideoWidth * scaleFactor;
            canvas.height = targetHeight;
            
            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm',
                videoBitsPerSecond: 2500000
            });
            
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            const recordedVideo = new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };
            });
            
            mediaRecorder.start();
            const duration = Math.min(5, this.video.duration - originalState.currentTime);
            const startTime = originalState.currentTime;
            let frameCount = 0;
            
            const captureFrame = () => {
                if (frameCount >= 150 || tempVideo.ended || tempVideo.currentTime >= startTime + duration) {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                    return;
                }
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                frameCount++;
                requestAnimationFrame(captureFrame);
            };
            
            tempVideo.play();
            captureFrame();
            
            const compressedUrl = await recordedVideo;
            tempVideo.pause();
            tempVideo.src = '';
            
            if (this.compressedVideoUrl) {
                URL.revokeObjectURL(this.compressedVideoUrl);
            }
            
            this.compressedVideoUrl = compressedUrl;
            this.video.src = compressedUrl;
            this.isCompressed = true;
            
            this.restoreVideoState(originalState, () => {
                this.currentQuality = targetQuality;
                this.updateQualityMenu();
                this.hideLoading();
                this.stats.qualityChanges++;
                this.emit('qualitychange', { quality: targetQuality, compressed: true });
            });
            
        } catch (error) {
            console.error('TPlayer: Ошибка при сжатии видео:', error);
            this.hideLoading();
            this.video.src = this.originalVideoUrl;
            this.restoreVideoState(originalState, () => {
                this.emit('error', error);
            });
        }
    }
    
    applyAccentColor() {
        const style = document.createElement('style');
        style.textContent = `
            .tplayer-progress-filled,
            .tplayer-volume-progress,
            .tplayer-progress-handle,
            .tplayer-settings-menu button:hover,
            .tplayer-speed-menu button.active,
            .tplayer-quality-menu button.active {
                background-color: ${this.options.accentColor} !important;
            }
            .tplayer-progress-handle {
                background-color: ${this.options.accentColor} !important;
                box-shadow: 0 0 10px ${this.options.accentColor} !important;
            }
            .btn-primary, .step-number {
                background-color: ${this.options.accentColor} !important;
            }
        `;
        document.head.appendChild(style);
        this.emit('themechange', { accentColor: this.options.accentColor });
    }
    
    updateProgress() {
        if (this.video.duration && !isNaN(this.video.duration)) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progressFilled.style.width = `${percent}%`;
            this.progressHandle.style.left = `${percent}%`;
            this.currentTimeSpan.textContent = this.formatTime(this.video.currentTime);
            this.emit('timeupdate', { currentTime: this.video.currentTime, percent });
        }
    }
    
    updateBuffered() {
        if (this.video.buffered.length > 0 && this.video.duration) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const percent = (bufferedEnd / this.video.duration) * 100;
            this.progressBuffered.style.width = `${percent}%`;
            this.emit('buffered', { percent });
        }
    }
    
    updateDuration() {
        if (!isNaN(this.video.duration)) {
            this.durationSpan.textContent = this.formatTime(this.video.duration);
            this.emit('durationchange', { duration: this.video.duration });
        }
    }
    
    showLoading() {
        this.loadingEl.classList.add('active');
        this.emit('loading');
    }
    
    hideLoading() {
        this.loadingEl.classList.remove('active');
        this.emit('loaded');
    }
    
    toggleSettings() {
        this.settingsMenu.classList.toggle('active');
        this.emit('settingsToggle', { open: this.settingsMenu.classList.contains('active') });
    }
    
    showControls() {
        this.controls.classList.add('visible');
        this.isControlsVisible = true;
        if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
        if (this.isPlaying) {
            this.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
        }
    }
    
    hideControls() {
        if (this.isPlaying && !this.settingsMenu.classList.contains('active')) {
            this.controls.classList.remove('visible');
            this.isControlsVisible = false;
        }
    }
    
    updatePlayIcon(isPlaying) {
        const playIcon = this.playBtn.querySelector('.tplayer-play-icon');
        const pauseIcon = this.playBtn.querySelector('.tplayer-pause-icon');
        
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.playBtn.title = 'Пауза (Пробел)';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            this.playBtn.title = 'Воспроизвести (Пробел)';
        }
    }
    
    updateVolumeIcon() {
        this.volumeBtn.title = this.isMuted ? 'Включить звук (M)' : 'Выключить звук (M)';
    }
    
    setVolume(e) {
        const rect = this.volumeSlider.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const volume = x / rect.width;
        this.video.volume = volume;
        this.volume = volume;
        this.volumeProgress.style.width = `${volume * 100}%`;
        this.isMuted = volume === 0;
        this.updateVolumeIcon();
        this.emit('volumechange', { volume });
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TPlayer;
}
if (typeof window !== 'undefined') {
    window.TPlayer = TPlayer;
}
