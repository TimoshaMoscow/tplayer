/**
 * ================================================================
 * Разработано TStudios
 * TPlayer - Профессиональная JavaScript библиотека видеоплеера
 * Версия: 2.1.0
 * Лицензия: MIT
 * ================================================================
 */

class TPlayer {
    /**
     * Конструктор класса TPlayer
     * @param {string|HTMLElement} selector - CSS селектор или DOM элемент контейнера
     * @param {Object} options - Опции конфигурации плеера
     * @param {string|Object} options.source - Путь к видео файлу (строка) или объект с разными качествами
     * @param {string} options.poster - URL постера видео
     * @param {string} options.accentColor - Акцентный цвет (CSS цвет, по умолчанию '#ff0000')
     */
    constructor(selector, options = {}) {
        console.log('%c TPlayer от TStudios запущен ', 'background: #ff0000; color: #fff; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
        
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (!this.container) {
            throw new Error('TPlayer: Контейнер не найден!');
        }
        
        this.options = {
            source: options.source || options.sources || 'test.mp4',
            poster: options.poster || '',
            accentColor: options.accentColor || '#ff0000'
        };
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 1;
        this.currentQuality = null;
        this.originalQuality = null;
        this.currentSpeed = 1;
        this.isFullscreen = false;
        this.isControlsVisible = true;
        this.controlsTimeout = null;
        this.compressedVideoUrl = null;
        
        // Доступные качества (в порядке возрастания)
        this.qualityLevels = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
        this.availableQualities = [];
        this.originalVideoUrl = null;
        this.originalVideoHeight = null;
        
        // Доступные скорости
        this.speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        
        this.init();
    }
    
    /**
     * Инициализация плеера
     */
    init() {
        this.createDOM();
        this.bindEvents();
        this.setupHotkeys();
        this.updateSpeedMenu();
        this.applyAccentColor();
        this.showControls();
        this.detectVideoQuality();
    }
    
    /**
     * Создание DOM структуры плеера
     */
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
        
        // Устанавливаем источник видео
        this.setInitialSource();
    }
    
    /**
     * Получение иконки Play/Pause
     */
    getPlayIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path class="tplayer-play-icon" d="M8 5v14l11-7z" fill="currentColor"/>
                <path class="tplayer-pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" style="display: none;"/>
            </svg>
        `;
    }
    
    /**
     * Получение иконки громкости
     */
    getVolumeIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
            </svg>
        `;
    }
    
    /**
     * Получение иконки настроек
     */
    getSettingsIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.33-.02-.64-.06-.94l2.02-1.58c.18-.14.23-.38.12-.56l-1.89-3.28c-.12-.19-.36-.26-.56-.18l-2.38.96c-.5-.38-1.06-.68-1.66-.88L14.45 3.5c-.04-.2-.2-.34-.4-.34h-3.78c-.2 0-.36.14-.4.34l-.3 2.52c-.6.2-1.16.5-1.66.88l-2.38-.96c-.2-.08-.44-.01-.56.18l-1.89 3.28c-.12.19-.07.42.12.56l2.02 1.58c-.04.3-.06.61-.06.94 0 .33.02.64.06.94l-2.02 1.58c-.18.14-.23.38-.12.56l1.89 3.28c.12.19.36.26.56.18l2.38-.96c.5.38 1.06.68 1.66.88l.3 2.52c.04.2.2.34.4.34h3.78c.2 0 .36-.14.4-.34l.3-2.52c.6-.2 1.16-.5 1.66-.88l2.38.96c.2.08.44.01.56-.18l1.89-3.28c.12-.19.07-.42-.12-.56l-2.02-1.58zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
            </svg>
        `;
    }
    
    /**
     * Получение иконки полноэкранного режима
     */
    getFullscreenIcon() {
        return `
            <svg class="tplayer-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
            </svg>
        `;
    }
    
    /**
     * Определение качества видео и настройка доступных опций
     */
    detectVideoQuality() {
        this.video.addEventListener('loadedmetadata', () => {
            const videoWidth = this.video.videoWidth;
            const videoHeight = this.video.videoHeight;
            this.originalVideoHeight = videoHeight;
            
            // Определяем качество на основе высоты видео
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
            
            // Сохраняем оригинальный URL видео
            this.originalVideoUrl = this.video.src;
            this.originalQuality = detectedQuality;
            
            // Создаем доступные качества (от 144p до определенного качества)
            const qualityIndex = this.qualityLevels.indexOf(detectedQuality);
            this.availableQualities = this.qualityLevels.slice(0, qualityIndex + 1);
            
            // Добавляем опцию "Оригинал" в начало списка
            this.availableQualities.unshift('Оригинал');
            
            // Устанавливаем текущее качество как "Оригинал"
            this.currentQuality = 'Оригинал';
            
            // Обновляем меню качества
            this.updateQualityMenu();
            
            console.log(`TPlayer: Доступные качества: ${this.availableQualities.join(', ')}`);
            console.log(`TPlayer: Текущее качество: ${this.currentQuality} (${detectedQuality})`);
        });
    }
    
    /**
     * Установка начального источника видео
     */
    setInitialSource() {
        // Определяем источник видео
        let videoSource = '';
        if (typeof this.options.source === 'string') {
            videoSource = this.options.source;
        } else if (typeof this.options.source === 'object') {
            // Для обратной совместимости с объектом sources
            const sourcesKeys = Object.keys(this.options.source);
            videoSource = sourcesKeys.length > 0 ? this.options.source[sourcesKeys[0]] : 'test.mp4';
        } else {
            videoSource = 'test.mp4';
        }
        
        this.video.src = videoSource;
    }
    
    /**
     * Привязка событий
     */
    bindEvents() {
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('progress', () => this.updateBuffered());
        this.video.addEventListener('ended', () => this.onEnded());
        
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
    }
    
    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
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
            }
        });
    }
    
    /**
     * Применение акцентного цвета
     */
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
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Обновление меню качества
     */
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
    
    /**
     * Обновление меню скорости
     */
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
    
    /**
     * Получение высоты видео для качества
     */
    getQualityHeight(quality) {
        const heights = {
            '144p': 144,
            '240p': 240,
            '360p': 360,
            '480p': 480,
            '720p': 720,
            '1080p': 1080,
            '1440p': 1440,
            '2160p': 2160
        };
        return heights[quality] || this.originalVideoHeight;
    }
    
    /**
     * Сжатие видео для более низкого качества
     */
    async changeQuality(quality) {
        if (quality === this.currentQuality) return;
        
        const currentTime = this.video.currentTime;
        const wasPlaying = !this.video.paused;
        
        // Если выбран "Оригинал" - возвращаем исходное видео
        if (quality === 'Оригинал') {
            this.video.src = this.originalVideoUrl;
            this.currentQuality = quality;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.currentTime = currentTime;
                if (wasPlaying) this.video.play();
                this.updateQualityMenu();
                if (this.compressedVideoUrl) {
                    URL.revokeObjectURL(this.compressedVideoUrl);
                    this.compressedVideoUrl = null;
                }
            }, { once: true });
            return;
        }
        
        const qualityHeight = this.getQualityHeight(quality);
        
        // Если выбранное качество выше или равно оригинальному, используем оригинал
        if (qualityHeight >= this.originalVideoHeight) {
            this.video.src = this.originalVideoUrl;
            this.currentQuality = quality;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.currentTime = currentTime;
                if (wasPlaying) this.video.play();
                this.updateQualityMenu();
            }, { once: true });
            return;
        }
        
        // Сжатие видео до более низкого качества
        this.showLoading();
        
        try {
            // Создаем видео элемент для захвата кадров
            const tempVideo = document.createElement('video');
            tempVideo.src = this.originalVideoUrl;
            tempVideo.crossOrigin = 'Anonymous';
            
            await new Promise((resolve) => {
                tempVideo.addEventListener('loadedmetadata', resolve);
            });
            
            tempVideo.currentTime = currentTime;
            
            await new Promise((resolve) => {
                tempVideo.addEventListener('seeked', resolve);
            });
            
            // Создаем canvas для перекодирования
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const scaleFactor = qualityHeight / this.originalVideoHeight;
            canvas.width = this.video.videoWidth * scaleFactor;
            canvas.height = qualityHeight;
            
            // Создаем поток для записи
            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm',
                videoBitsPerSecond: 2500000
            });
            
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            
            const recordedVideo = new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };
            });
            
            mediaRecorder.start();
            
            // Захватываем кадры
            const duration = Math.min(10, this.video.duration - currentTime);
            const startTime = currentTime;
            
            const captureFrame = () => {
                if (tempVideo.currentTime >= startTime + duration || tempVideo.ended) {
                    mediaRecorder.stop();
                    return;
                }
                
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(captureFrame);
            };
            
            tempVideo.play();
            captureFrame();
            
            const compressedUrl = await recordedVideo;
            tempVideo.pause();
            
            // Освобождаем предыдущий сжатый URL если есть
            if (this.compressedVideoUrl) {
                URL.revokeObjectURL(this.compressedVideoUrl);
            }
            
            this.compressedVideoUrl = compressedUrl;
            this.video.src = compressedUrl;
            this.currentQuality = quality;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.currentTime = currentTime;
                if (wasPlaying) this.video.play();
                this.updateQualityMenu();
                this.hideLoading();
            }, { once: true });
            
        } catch (error) {
            console.error('TPlayer: Ошибка при сжатии видео:', error);
            this.hideLoading();
            // Если сжатие не удалось, используем оригинал
            this.video.src = this.originalVideoUrl;
            this.video.currentTime = currentTime;
            if (wasPlaying) this.video.play();
        }
    }
    
    /**
     * Смена скорости воспроизведения
     */
    changeSpeed(speed) {
        this.currentSpeed = speed;
        this.video.playbackRate = speed;
        this.updateSpeedMenu();
    }
    
    /**
     * Переключение воспроизведения
     */
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    /**
     * Обработчик начала воспроизведения
     */
    onPlay() {
        this.isPlaying = true;
        this.updatePlayIcon(true);
    }
    
    /**
     * Обработчик паузы
     */
    onPause() {
        this.isPlaying = false;
        this.updatePlayIcon(false);
    }
    
    /**
     * Обновление иконки Play/Pause
     */
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
    
    /**
     * Перемотка на секунды
     */
    skip(seconds) {
        this.video.currentTime = Math.min(Math.max(this.video.currentTime + seconds, 0), this.video.duration);
    }
    
    /**
     * Переключение звука
     */
    toggleMute() {
        this.video.muted = !this.video.muted;
        this.isMuted = this.video.muted;
        this.updateVolumeIcon();
    }
    
    /**
     * Установка громкости
     */
    setVolume(e) {
        const rect = this.volumeSlider.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const volume = x / rect.width;
        this.video.volume = volume;
        this.volumeProgress.style.width = `${volume * 100}%`;
        this.isMuted = volume === 0;
        this.updateVolumeIcon();
    }
    
    /**
     * Обновление иконки громкости
     */
    updateVolumeIcon() {
        this.volumeBtn.title = this.isMuted ? 'Включить звук (M)' : 'Выключить звук (M)';
    }
    
    /**
     * Обновление прогресса
     */
    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTimeSpan.textContent = this.formatTime(this.video.currentTime);
    }
    
    /**
     * Обновление буферизации
     */
    updateBuffered() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const percent = (bufferedEnd / this.video.duration) * 100;
            this.progressBuffered.style.width = `${percent}%`;
        }
    }
    
    /**
     * Обновление длительности
     */
    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.video.duration);
    }
    
    /**
     * Поиск позиции
     */
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const percent = x / rect.width;
        this.video.currentTime = percent * this.video.duration;
    }
    
    /**
     * Показать загрузку
     */
    showLoading() {
        this.loadingEl.classList.add('active');
    }
    
    /**
     * Скрыть загрузку
     */
    hideLoading() {
        this.loadingEl.classList.remove('active');
    }
    
    /**
     * Окончание видео
     */
    onEnded() {
        this.updatePlayIcon(false);
    }
    
    /**
     * Переключение меню настроек
     */
    toggleSettings() {
        this.settingsMenu.classList.toggle('active');
    }
    
    /**
     * Переключение полноэкранного режима
     */
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (this.player.requestFullscreen) {
                this.player.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
        });
    }
    
    /**
     * Показать контроллы
     */
    showControls() {
        this.controls.classList.add('visible');
        this.isControlsVisible = true;
        
        if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
        
        if (this.isPlaying) {
            this.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
        }
    }
    
    /**
     * Скрыть контроллы
     */
    hideControls() {
        if (this.isPlaying && !this.settingsMenu.classList.contains('active')) {
            this.controls.classList.remove('visible');
            this.isControlsVisible = false;
        }
    }
    
    /**
     * Форматирование времени
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Уничтожение плеера
     */
    destroy() {
        this.video.pause();
        this.video.src = '';
        if (this.compressedVideoUrl) {
            URL.revokeObjectURL(this.compressedVideoUrl);
        }
        this.container.innerHTML = '';
        console.log('TPlayer: Плеер уничтожен');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TPlayer;
}
if (typeof window !== 'undefined') {
    window.TPlayer = TPlayer;
}
