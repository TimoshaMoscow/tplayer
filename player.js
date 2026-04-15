/**
 * ================================================================
 * TPLAYER v3.0.0
 * Профессиональная JavaScript библиотека видеоплеера
 * Разработано TStudios
 * Лицензия: MIT
 * ================================================================
 * 
 * Установка: https://timoshamoscow.github.io/tplayer/
 * Документация: https://timoshamoscow.github.io/tplayer/docs
 * 
 * Особенности:
 * - Автоопределение качества видео
 * - Горячие клавиши (Пробел, стрелки, F, M, ↑, ↓)
 * - Кастомный прогресс-бар с перетаскиванием
 * - Меню выбора качества и скорости
 * - Плавное скрытие контроллов
 * - Полноэкранный режим
 * - Управление громкостью
 * ================================================================
 */

(function(global) {
    'use strict';

    class TPlayer {
        /**
         * Конструктор плеера
         * @param {string|HTMLElement} selector - CSS селектор или DOM элемент контейнера
         * @param {Object} options - Опции конфигурации
         * @param {string} options.source - Путь к видео файлу
         * @param {string} options.poster - Путь к постеру
         * @param {string} options.accentColor - Акцентный цвет (по умолчанию '#ff0000')
         * @param {boolean} options.autoPlay - Автовоспроизведение (по умолчанию false)
         * @param {string} options.preload - Предзагрузка (по умолчанию 'metadata')
         * @param {number} options.volume - Громкость от 0 до 1 (по умолчанию 1)
         * @param {boolean} options.muted - Звук выключен (по умолчанию false)
         * @param {boolean} options.keyboard - Включить горячие клавиши (по умолчанию true)
         */
        constructor(selector, options = {}) {
            // Проверка наличия селектора
            if (!selector) {
                throw new Error('[TPlayer] Ошибка: селектор контейнера не указан');
            }

            // Получение контейнера
            this.container = typeof selector === 'string' 
                ? document.querySelector(selector) 
                : selector;

            if (!this.container) {
                throw new Error(`[TPlayer] Ошибка: контейнер "${selector}" не найден в DOM`);
            }

            // Опции по умолчанию
            this.options = {
                source: options.source || null,
                poster: options.poster || '',
                accentColor: options.accentColor || '#ff0000',
                autoPlay: options.autoPlay || false,
                preload: options.preload || 'metadata',
                volume: options.volume !== undefined ? Math.min(1, Math.max(0, options.volume)) : 1,
                muted: options.muted || false,
                keyboard: options.keyboard !== false
            };

            // Проверка наличия источника видео
            if (!this.options.source) {
                throw new Error('[TPlayer] Ошибка: не указан источник видео (source)');
            }

            // Состояние плеера
            this.state = {
                isPlaying: false,
                isMuted: this.options.muted,
                volume: this.options.volume,
                currentTime: 0,
                duration: 0,
                currentSpeed: 1,
                isFullscreen: false,
                controlsVisible: true,
                controlsTimeout: null,
                currentQuality: 'Оригинал',
                availableQualities: ['Оригинал'],
                originalSource: this.options.source,
                originalHeight: null,
                originalWidth: null,
                originalQualityLabel: null
            };

            // DOM элементы
            this.dom = {};

            // Доступные качества
            this.qualityLevels = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
            
            // Доступные скорости
            this.speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            
            // Инициализация
            console.log('[TPlayer] Инициализация плеера');
            this.init();
        }

        /**
         * Инициализация плеера
         */
        init() {
            this.createDOM();
            this.bindEvents();
            this.setupHotkeys();
            this.applyAccentColor();
            this.initVideo();
        }

        /**
         * Создание DOM структуры плеера
         */
        createDOM() {
            // Очищаем контейнер
            this.container.innerHTML = '';
            this.container.classList.add('tplayer');

            // Создание видео элемента
            this.dom.video = document.createElement('video');
            this.dom.video.className = 'tplayer__video';
            this.dom.video.poster = this.options.poster;
            this.dom.video.preload = this.options.preload;
            this.dom.video.src = this.options.source;

            // Контейнер контроллов
            this.dom.controls = document.createElement('div');
            this.dom.controls.className = 'tplayer__controls';

            // Прогресс-бар
            this.dom.progress = document.createElement('div');
            this.dom.progress.className = 'tplayer__progress';

            this.dom.progressBar = document.createElement('div');
            this.dom.progressBar.className = 'tplayer__progress-bar';

            this.dom.progressFilled = document.createElement('div');
            this.dom.progressFilled.className = 'tplayer__progress-filled';

            this.dom.progressBuffered = document.createElement('div');
            this.dom.progressBuffered.className = 'tplayer__progress-buffered';

            this.dom.progressHandle = document.createElement('div');
            this.dom.progressHandle.className = 'tplayer__progress-handle';

            // Отображение времени
            this.dom.time = document.createElement('div');
            this.dom.time.className = 'tplayer__time';
            this.dom.time.innerHTML = '<span class="tplayer__time-current">00:00</span><span> / </span><span class="tplayer__time-duration">00:00</span>';

            // Сборка прогресс-бара
            this.dom.progressBar.appendChild(this.dom.progressFilled);
            this.dom.progressBar.appendChild(this.dom.progressBuffered);
            this.dom.progressBar.appendChild(this.dom.progressHandle);
            this.dom.progress.appendChild(this.dom.progressBar);
            this.dom.progress.appendChild(this.dom.time);

            // Нижняя панель контроллов
            this.dom.bottomBar = document.createElement('div');
            this.dom.bottomBar.className = 'tplayer__bottom';

            // Левая часть контроллов
            this.dom.leftControls = document.createElement('div');
            this.dom.leftControls.className = 'tplayer__controls-left';

            // Кнопки
            this.dom.playBtn = this.createButton('play', 'Воспроизвести (Пробел)');
            this.dom.volumeContainer = this.createVolumeControl();
            this.dom.speedBtn = this.createButton('speed', 'Скорость воспроизведения');
            this.dom.qualityBtn = this.createButton('quality', 'Качество видео');

            // Правая часть контроллов
            this.dom.rightControls = document.createElement('div');
            this.dom.rightControls.className = 'tplayer__controls-right';
            this.dom.fullscreenBtn = this.createButton('fullscreen', 'Полный экран (F)');

            // Сборка левой части
            this.dom.leftControls.appendChild(this.dom.playBtn);
            this.dom.leftControls.appendChild(this.dom.volumeContainer);
            this.dom.leftControls.appendChild(this.dom.speedBtn);
            this.dom.leftControls.appendChild(this.dom.qualityBtn);

            // Сборка правой части
            this.dom.rightControls.appendChild(this.dom.fullscreenBtn);

            // Сборка нижней панели
            this.dom.bottomBar.appendChild(this.dom.leftControls);
            this.dom.bottomBar.appendChild(this.dom.rightControls);

            // Сборка контроллов
            this.dom.controls.appendChild(this.dom.progress);
            this.dom.controls.appendChild(this.dom.bottomBar);

            // Меню настроек
            this.dom.speedMenu = this.createMenu('speed', this.speeds.map(s => ({ label: `${s}x`, value: s })));
            this.dom.qualityMenu = this.createMenu('quality', []);

            // Индикатор загрузки
            this.dom.loading = document.createElement('div');
            this.dom.loading.className = 'tplayer__loading';
            this.dom.loading.innerHTML = '<div class="tplayer__spinner"></div>';

            // Добавление всех элементов в контейнер
            this.container.appendChild(this.dom.video);
            this.container.appendChild(this.dom.controls);
            this.container.appendChild(this.dom.speedMenu);
            this.container.appendChild(this.dom.qualityMenu);
            this.container.appendChild(this.dom.loading);

            // Скрытие меню по умолчанию
            this.dom.speedMenu.classList.add('tplayer__menu--hidden');
            this.dom.qualityMenu.classList.add('tplayer__menu--hidden');
        }

        /**
         * Создание кнопки
         * @param {string} type - Тип кнопки
         * @param {string} title - Всплывающая подсказка
         * @returns {HTMLElement}
         */
        createButton(type, title) {
            const btn = document.createElement('button');
            btn.className = `tplayer__btn tplayer__btn--${type}`;
            btn.title = title;
            btn.innerHTML = this.getIcon(type);
            return btn;
        }

        /**
         * Создание элемента управления громкостью
         * @returns {HTMLElement}
         */
        createVolumeControl() {
            const container = document.createElement('div');
            container.className = 'tplayer__volume';

            this.dom.volumeBtn = this.createButton('volume', 'Выключить звук (M)');
            
            this.dom.volumeSlider = document.createElement('div');
            this.dom.volumeSlider.className = 'tplayer__volume-slider';
            
            this.dom.volumeProgress = document.createElement('div');
            this.dom.volumeProgress.className = 'tplayer__volume-progress';
            
            this.dom.volumeSlider.appendChild(this.dom.volumeProgress);
            container.appendChild(this.dom.volumeBtn);
            container.appendChild(this.dom.volumeSlider);

            return container;
        }

        /**
         * Создание меню
         * @param {string} type - Тип меню
         * @param {Array} items - Элементы меню
         * @returns {HTMLElement}
         */
        createMenu(type, items) {
            const menu = document.createElement('div');
            menu.className = `tplayer__menu tplayer__menu--${type}`;

            const inner = document.createElement('div');
            inner.className = 'tplayer__menu-inner';

            items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'tplayer__menu-item';
                btn.textContent = item.label;
                btn.dataset.value = item.value;
                btn.addEventListener('click', () => {
                    if (type === 'speed') this.setSpeed(item.value);
                    if (type === 'quality') this.setQuality(item.value);
                    menu.classList.add('tplayer__menu--hidden');
                });
                inner.appendChild(btn);
            });

            // Футер с копирайтом
            const footer = document.createElement('div');
            footer.className = 'tplayer__menu-footer';
            footer.textContent = 'Powered by TStudios';
            inner.appendChild(footer);

            menu.appendChild(inner);
            return menu;
        }

        /**
         * Получение иконки по типу
         * @param {string} type - Тип иконки
         * @returns {string}
         */
        getIcon(type) {
            const icons = {
                play: '<svg viewBox="0 0 24 24" width="20" height="20"><path class="tplayer__icon-play" d="M8 5v14l11-7z" fill="currentColor"/><path class="tplayer__icon-pause" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" style="display:none"/></svg>',
                volume: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>',
                speed: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" fill="currentColor"/></svg>',
                quality: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 6h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" fill="currentColor"/></svg>',
                fullscreen: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>'
            };
            return icons[type] || '';
        }

        /**
         * Привязка событий
         */
        bindEvents() {
            // События видео
            this.dom.video.addEventListener('timeupdate', () => this.updateProgress());
            this.dom.video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
            this.dom.video.addEventListener('play', () => this.onPlay());
            this.dom.video.addEventListener('pause', () => this.onPause());
            this.dom.video.addEventListener('waiting', () => this.showLoading());
            this.dom.video.addEventListener('canplay', () => this.hideLoading());
            this.dom.video.addEventListener('progress', () => this.updateBuffered());
            this.dom.video.addEventListener('ended', () => this.onEnded());
            this.dom.video.addEventListener('volumechange', () => this.updateVolumeUI());

            // Прогресс-бар
            this.dom.progressBar.addEventListener('click', (e) => this.seek(e));
            
            // Перетаскивание ползунка прогресса
            let isDragging = false;
            this.dom.progressHandle.addEventListener('mousedown', () => isDragging = true);
            document.addEventListener('mousemove', (e) => { if (isDragging) this.seek(e); });
            document.addEventListener('mouseup', () => isDragging = false);

            // Кнопки управления
            this.dom.playBtn.addEventListener('click', () => this.togglePlay());
            this.dom.volumeBtn.addEventListener('click', () => this.toggleMute());
            this.dom.volumeSlider.addEventListener('click', (e) => this.setVolume(e));
            this.dom.speedBtn.addEventListener('click', () => this.toggleMenu('speed'));
            this.dom.qualityBtn.addEventListener('click', () => this.toggleMenu('quality'));
            this.dom.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

            // Показ/скрытие контроллов
            this.container.addEventListener('mousemove', () => this.showControls());
            this.container.addEventListener('mouseleave', () => this.hideControls());

            // Закрытие меню при клике вне
            document.addEventListener('click', (e) => {
                if (!this.dom.speedBtn.contains(e.target) && !this.dom.speedMenu.contains(e.target)) {
                    this.dom.speedMenu.classList.add('tplayer__menu--hidden');
                }
                if (!this.dom.qualityBtn.contains(e.target) && !this.dom.qualityMenu.contains(e.target)) {
                    this.dom.qualityMenu.classList.add('tplayer__menu--hidden');
                }
            });

            // Полноэкранный режим
            document.addEventListener('fullscreenchange', () => {
                this.state.isFullscreen = !!document.fullscreenElement;
                this.updateFullscreenIcon();
            });
        }

        /**
         * Настройка горячих клавиш
         */
        setupHotkeys() {
            if (!this.options.keyboard) return;

            document.addEventListener('keydown', (e) => {
                // Игнорируем ввод в полях
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
                        this.adjustVolume(0.05);
                        break;
                    case 'arrowdown':
                        e.preventDefault();
                        this.adjustVolume(-0.05);
                        break;
                }
            });
        }

        /**
         * Инициализация видео
         */
        initVideo() {
            this.dom.video.volume = this.state.volume;
            this.dom.video.muted = this.state.isMuted;
            this.dom.volumeProgress.style.width = `${this.state.volume * 100}%`;

            // Автовоспроизведение
            if (this.options.autoPlay) {
                this.dom.video.play().catch(e => console.warn('[TPlayer] Автовоспроизведение заблокировано:', e));
            }

            // Определение качества
            this.dom.video.addEventListener('loadedmetadata', () => {
                this.detectQuality();
            }, { once: true });
        }

        /**
         * Определение качества видео
         */
        detectQuality() {
            const height = this.dom.video.videoHeight;
            const width = this.dom.video.videoWidth;
            
            this.state.originalHeight = height;
            this.state.originalWidth = width;

            let detected = '360p';
            if (height <= 144) detected = '144p';
            else if (height <= 240) detected = '240p';
            else if (height <= 360) detected = '360p';
            else if (height <= 480) detected = '480p';
            else if (height <= 720) detected = '720p';
            else if (height <= 1080) detected = '1080p';
            else if (height <= 1440) detected = '1440p';
            else detected = '2160p';

            this.state.originalQualityLabel = detected;
            console.log(`[TPlayer] Определено качество видео: ${detected} (${width}x${height})`);

            const index = this.qualityLevels.indexOf(detected);
            const qualities = ['Оригинал', ...this.qualityLevels.slice(0, index + 1)];
            
            this.state.availableQualities = qualities;
            this.updateQualityMenu();
        }

        /**
         * Обновление меню качества
         */
        updateQualityMenu() {
            this.dom.qualityMenu.innerHTML = '';
            const inner = document.createElement('div');
            inner.className = 'tplayer__menu-inner';

            this.state.availableQualities.forEach(quality => {
                const btn = document.createElement('button');
                btn.className = 'tplayer__menu-item';
                if (quality === this.state.currentQuality) {
                    btn.classList.add('tplayer__menu-item--active');
                }
                btn.textContent = quality;
                btn.addEventListener('click', () => this.setQuality(quality));
                inner.appendChild(btn);
            });

            const footer = document.createElement('div');
            footer.className = 'tplayer__menu-footer';
            footer.textContent = 'Powered by TStudios';
            inner.appendChild(footer);

            this.dom.qualityMenu.appendChild(inner);
        }

        /**
         * Смена качества видео
         * @param {string} quality - Качество видео
         */
        setQuality(quality) {
            if (quality === this.state.currentQuality) return;
            
            const currentTime = this.dom.video.currentTime;
            const wasPlaying = !this.dom.video.paused;
            const volume = this.dom.video.volume;
            const muted = this.dom.video.muted;

            this.state.currentQuality = quality;
            
            if (quality === 'Оригинал') {
                this.dom.video.src = this.state.originalSource;
            } else {
                console.log(`[TPlayer] Смена качества на ${quality}`);
                this.dom.video.src = this.state.originalSource;
            }

            this.dom.video.addEventListener('loadedmetadata', () => {
                this.dom.video.currentTime = currentTime;
                this.dom.video.volume = volume;
                this.dom.video.muted = muted;
                if (wasPlaying) {
                    this.dom.video.play();
                }
                this.updateQualityMenu();
            }, { once: true });
        }

        /**
         * Смена скорости воспроизведения
         * @param {number} speed - Скорость
         */
        setSpeed(speed) {
            this.state.currentSpeed = speed;
            this.dom.video.playbackRate = speed;
            
            const items = this.dom.speedMenu.querySelectorAll('.tplayer__menu-item');
            items.forEach(item => {
                const isActive = parseFloat(item.dataset.value) === speed;
                item.classList.toggle('tplayer__menu-item--active', isActive);
            });
            
            console.log(`[TPlayer] Скорость воспроизведения: ${speed}x`);
        }

        /**
         * Переключение меню
         * @param {string} type - Тип меню ('speed' или 'quality')
         */
        toggleMenu(type) {
            const speedHidden = this.dom.speedMenu.classList.contains('tplayer__menu--hidden');
            const qualityHidden = this.dom.qualityMenu.classList.contains('tplayer__menu--hidden');
            
            this.dom.speedMenu.classList.add('tplayer__menu--hidden');
            this.dom.qualityMenu.classList.add('tplayer__menu--hidden');
            
            if (type === 'speed' && speedHidden) {
                this.dom.speedMenu.classList.remove('tplayer__menu--hidden');
            } else if (type === 'quality' && qualityHidden) {
                this.dom.qualityMenu.classList.remove('tplayer__menu--hidden');
            }
        }

        /**
         * Переключение воспроизведения
         */
        togglePlay() {
            if (this.dom.video.paused) {
                this.dom.video.play();
            } else {
                this.dom.video.pause();
            }
        }

        /**
         * Обработчик начала воспроизведения
         */
        onPlay() {
            this.state.isPlaying = true;
            
            const playIcon = this.dom.playBtn.querySelector('.tplayer__icon-play');
            const pauseIcon = this.dom.playBtn.querySelector('.tplayer__icon-pause');
            
            if (playIcon && pauseIcon) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }
            
            this.dom.playBtn.title = 'Пауза (Пробел)';
            this.hideControlsDelayed();
        }

        /**
         * Обработчик паузы
         */
        onPause() {
            this.state.isPlaying = false;
            
            const playIcon = this.dom.playBtn.querySelector('.tplayer__icon-play');
            const pauseIcon = this.dom.playBtn.querySelector('.tplayer__icon-pause');
            
            if (playIcon && pauseIcon) {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
            
            this.dom.playBtn.title = 'Воспроизвести (Пробел)';
            this.showControls();
        }

        /**
         * Обработчик окончания видео
         */
        onEnded() {
            this.onPause();
        }

        /**
         * Переключение звука
         */
        toggleMute() {
            this.dom.video.muted = !this.dom.video.muted;
            this.state.isMuted = this.dom.video.muted;
            this.updateVolumeIcon();
        }

        /**
         * Установка громкости
         * @param {MouseEvent} e - Событие клика
         */
        setVolume(e) {
            const rect = this.dom.volumeSlider.getBoundingClientRect();
            const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const volume = x / rect.width;
            
            this.dom.video.volume = volume;
            this.state.volume = volume;
            this.dom.volumeProgress.style.width = `${volume * 100}%`;
            this.state.isMuted = volume === 0;
            this.updateVolumeIcon();
        }

        /**
         * Регулировка громкости с клавиатуры
         * @param {number} delta - Изменение громкости
         */
        adjustVolume(delta) {
            let newVolume = this.state.volume + delta;
            newVolume = Math.min(1, Math.max(0, newVolume));
            
            this.dom.video.volume = newVolume;
            this.state.volume = newVolume;
            this.dom.volumeProgress.style.width = `${newVolume * 100}%`;
            this.state.isMuted = newVolume === 0;
            this.updateVolumeIcon();
        }

        /**
         * Обновление UI громкости
         */
        updateVolumeUI() {
            this.dom.volumeProgress.style.width = `${this.dom.video.volume * 100}%`;
            this.state.volume = this.dom.video.volume;
            this.state.isMuted = this.dom.video.muted;
            this.updateVolumeIcon();
        }

        /**
         * Обновление иконки громкости
         */
        updateVolumeIcon() {
            this.dom.volumeBtn.title = this.state.isMuted ? 'Включить звук (M)' : 'Выключить звук (M)';
        }

        /**
         * Обновление прогресса воспроизведения
         */
        updateProgress() {
            if (this.dom.video.duration && !isNaN(this.dom.video.duration)) {
                const percent = (this.dom.video.currentTime / this.dom.video.duration) * 100;
                this.dom.progressFilled.style.width = `${percent}%`;
                this.dom.progressHandle.style.left = `${percent}%`;
                
                const currentTimeElem = this.dom.time.querySelector('.tplayer__time-current');
                if (currentTimeElem) {
                    currentTimeElem.textContent = this.formatTime(this.dom.video.currentTime);
                }
            }
        }

        /**
         * Обновление буферизации
         */
        updateBuffered() {
            if (this.dom.video.buffered.length > 0 && this.dom.video.duration) {
                const bufferedEnd = this.dom.video.buffered.end(this.dom.video.buffered.length - 1);
                const percent = (bufferedEnd / this.dom.video.duration) * 100;
                this.dom.progressBuffered.style.width = `${percent}%`;
            }
        }

        /**
         * Обработчик загрузки метаданных
         */
        onLoadedMetadata() {
            this.state.duration = this.dom.video.duration;
            const durationElem = this.dom.time.querySelector('.tplayer__time-duration');
            if (durationElem) {
                durationElem.textContent = this.formatTime(this.dom.video.duration);
            }
        }

        /**
         * Поиск позиции
         * @param {MouseEvent} e - Событие клика
         */
        seek(e) {
            const rect = this.dom.progressBar.getBoundingClientRect();
            const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const percent = x / rect.width;
            this.dom.video.currentTime = percent * this.dom.video.duration;
        }

        /**
         * Перемотка на указанное количество секунд
         * @param {number} seconds - Количество секунд
         */
        skip(seconds) {
            const newTime = this.dom.video.currentTime + seconds;
            this.dom.video.currentTime = Math.min(Math.max(newTime, 0), this.dom.video.duration);
        }

        /**
         * Переключение полноэкранного режима
         */
        toggleFullscreen() {
            if (!this.state.isFullscreen) {
                if (this.container.requestFullscreen) {
                    this.container.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }

        /**
         * Обновление иконки полноэкранного режима
         */
        updateFullscreenIcon() {
            this.dom.fullscreenBtn.title = this.state.isFullscreen ? 'Выйти из полноэкранного режима (F)' : 'Полный экран (F)';
        }

        /**
         * Показать контроллы
         */
        showControls() {
            this.dom.controls.classList.add('tplayer__controls--visible');
            this.state.controlsVisible = true;
            
            if (this.state.controlsTimeout) {
                clearTimeout(this.state.controlsTimeout);
            }
        }

        /**
         * Скрыть контроллы
         */
        hideControls() {
            if (this.state.isPlaying && this.state.controlsVisible) {
                this.dom.controls.classList.remove('tplayer__controls--visible');
                this.state.controlsVisible = false;
            }
        }

        /**
         * Скрыть контроллы с задержкой
         */
        hideControlsDelayed() {
            if (this.state.controlsTimeout) {
                clearTimeout(this.state.controlsTimeout);
            }
            this.state.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
        }

        /**
         * Показать индикатор загрузки
         */
        showLoading() {
            this.dom.loading.classList.add('tplayer__loading--visible');
        }

        /**
         * Скрыть индикатор загрузки
         */
        hideLoading() {
            this.dom.loading.classList.remove('tplayer__loading--visible');
        }

        /**
         * Применение акцентного цвета
         */
        applyAccentColor() {
            const style = document.createElement('style');
            style.textContent = `
                .tplayer__progress-filled,
                .tplayer__volume-progress,
                .tplayer__progress-handle,
                .tplayer__menu-item--active {
                    background-color: ${this.options.accentColor} !important;
                }
                .tplayer__progress-handle {
                    box-shadow: 0 0 0 2px ${this.options.accentColor} !important;
                }
                .tplayer__menu-item:hover {
                    background-color: ${this.options.accentColor}20 !important;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Форматирование времени
         * @param {number} seconds - Секунды
         * @returns {string}
         */
        formatTime(seconds) {
            if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
            
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            if (hrs > 0) {
                return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        /**
         * Получение текущего времени
         * @returns {number}
         */
        getCurrentTime() {
            return this.dom.video.currentTime;
        }

        /**
         * Получение длительности видео
         * @returns {number}
         */
        getDuration() {
            return this.dom.video.duration;
        }

        /**
         * Получение состояния воспроизведения
         * @returns {boolean}
         */
        isPlaying() {
            return this.state.isPlaying;
        }

        /**
         * Получение текущей громкости
         * @returns {number}
         */
        getVolume() {
            return this.state.volume;
        }

        /**
         * Уничтожение плеера
         */
        destroy() {
            this.dom.video.pause();
            this.dom.video.src = '';
            this.container.innerHTML = '';
            console.log('[TPlayer] Плеер уничтожен');
        }
    }

    // Экспорт для различных окружений
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TPlayer;
    }
    if (typeof window !== 'undefined') {
        window.TPlayer = TPlayer;
    }
})(typeof window !== 'undefined' ? window : this);
