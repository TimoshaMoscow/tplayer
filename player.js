/**
 * ================================================================
 * Разработано TStudios
 * TPlayer - Профессиональная JavaScript библиотека видеоплеера
 * Версия: 1.0.0
 * Лицензия: MIT
 * ================================================================
 */

class TPlayer {
    /**
     * Конструктор класса TPlayer
     * @param {string|HTMLElement} selector - CSS селектор или DOM элемент контейнера
     * @param {Object} options - Опции конфигурации плеера
     * @param {Object} options.sources - Объект с ссылками на видео {360p, 720p, 1080p}
     * @param {string} options.poster - URL постера видео
     * @param {string} options.accentColor - Акцентный цвет (CSS цвет, по умолчанию '#ff0000')
     */
    constructor(selector, options = {}) {
        // Консольное приветствие
        console.log('%c TPlayer от TStudios запущен ', 'background: #ff0000; color: #fff; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
        
        // Получаем контейнер
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (!this.container) {
            throw new Error('TPlayer: Контейнер не найден!');
        }
        
        // Опции по умолчанию
        this.options = {
            sources: options.sources || {},
            poster: options.poster || '',
            accentColor: options.accentColor || '#ff0000'
        };
        
        // Состояние плеера
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 1;
        this.currentQuality = null;
        this.currentSpeed = 1;
        this.isFullscreen = false;
        this.isControlsVisible = true;
        this.controlsTimeout = null;
        
        // Доступные качества
        this.qualities = ['1080p', '720p', '360p'];
        this.availableQualities = [];
        
        // Доступные скорости
        this.speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        
        // Инициализация
        this.init();
    }
    
    /**
     * Инициализация плеера
     */
    init() {
        this.createDOM();
        this.bindEvents();
        this.setupHotkeys();
        this.updateQualityMenu();
        this.updateSpeedMenu();
        this.applyAccentColor();
        this.showControls();
    }
    
    /**
     * Создание DOM структуры плеера
     */
    createDOM() {
        // Очищаем контейнер
        this.container.innerHTML = '';
        this.container.classList.add('tplayer-container');
        
        // Основная структура
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
        
        // Получаем элементы
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
     * Установка начального источника видео
     */
    setInitialSource() {
        // Определяем доступные качества
        this.availableQualities = this.qualities.filter(q => this.options.sources[q]);
        
        if (this.availableQualities.length === 0) {
            console.error('TPlayer: Нет доступных источников видео!');
            return;
        }
        
        // Выбираем лучшее доступное качество
        this.currentQuality = this.availableQualities[0];
        this.video.src = this.options.sources[this.currentQuality];
    }
    
    /**
     * Привязка событий
     */
    bindEvents() {
        // Видео события
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('progress', () => this.updateBuffered());
        this.video.addEventListener('ended', () => this.onEnded());
        
        // Прогресс бар
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.progressBar.addEventListener('mousemove', (e) => this.updatePreview(e));
        
        // Перетаскивание прогресса
        let isDragging = false;
        this.progressHandle.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mousemove', (e) => {
            if (isDragging) this.seek(e);
        });
        document.addEventListener('mouseup', () => isDragging = false);
        
        // Кнопки управления
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Регулировка громкости
        this.volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        
        // Скрытие контроллов
        this.player.addEventListener('mousemove', () => this.showControls());
        this.player.addEventListener('mouseleave', () => this.hideControls());
        
        // Закрытие меню настроек при клике вне
        document.addEventListener('click', (e) => {
            if (!this.settingsBtn.contains(e.target) && !this.settingsMenu.contains(e.target)) {
                this.settingsMenu.classList.remove('active');
            }
        });
        
        // Обновление иконки громкости при изменении
        this.video.addEventListener('volumechange', () => this.updateVolumeIcon());
    }
    
    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Предотвращаем срабатывание на инпутах
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
     * Бесшовная смена качества
     */
    changeQuality(quality) {
        if (quality === this.currentQuality || !this.options.sources[quality]) return;
        
        const currentTime = this.video.currentTime;
        const wasPlaying = !this.video.paused;
        
        this.currentQuality = quality;
        this.video.src = this.options.sources[quality];
        
        this.video.addEventListener('loadedmetadata', () => {
            this.video.currentTime = currentTime;
            if (wasPlaying) {
                this.video.play();
            }
            this.updateQualityMenu();
        }, { once: true });
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
        // Простое обновление, можно усложнить с разными иконками для разных уровней
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
     * Предпросмотр при наведении
     */
    updatePreview(e) {
        // Можно добавить предпросмотр кадров, но для простоты пропустим
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
        this.container.innerHTML = '';
        console.log('TPlayer: Плеер уничтожен');
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TPlayer;
}
if (typeof window !== 'undefined') {
    window.TPlayer = TPlayer;
}