(function bootstrapDreamTeam(windowObject, documentObject) {
    const appData = windowObject.DreamTeamData;

    if (!appData) {
        console.error('DreamTeamData no esta disponible.');
        return;
    }

    class DreamTeamBuilder {
        constructor(config) {
            this.config = config;
            this.formations = config.formations;
            this.teams = config.teams;
            this.teamNames = Object.keys(this.teams);
            this.defaultFormation = config.defaultFormation;

            this.selectedPlayers = {};
            this.benchPlayers = [];
            this.currentFormation = this.defaultFormation;
            this.currentSheetTeam = this.teamNames[0];
            this.activeSlotId = null;
            this.activePos = null;
            this.activeCurrentPlayer = null;
            this.searchTerm = '';
            this.lastRemoved = null;
            this.toastTimeout = null;
            this.slotBubbleTimeout = null;
            this.slotBubbleSlotId = null;
            this.hasSessionStarted = false;
            this._canLeft = null;
            this._canRight = null;
            this._tabsRaf = null;
            this._tabsDrag = { active: false, moved: false, startX: 0, startScroll: 0 };

            this.cacheElements();
            this.init();
        }

        cacheElements() {
            this.pitchSection = documentObject.getElementById('pitchSection');
            this.pitchGrid = documentObject.getElementById('formationGrid');
            this.statusText = documentObject.getElementById('statusText');
            this.backdrop = documentObject.getElementById('backdrop');
            this.selectorPanel = documentObject.getElementById('selectorPanel');
            this.pickerView = documentObject.getElementById('pickerView');
            this.summaryView = documentObject.getElementById('summaryView');
            this.sheetTitle = documentObject.getElementById('sheetTitle');
            this.sheetSubtitle = documentObject.getElementById('sheetSubtitle');
            this.sheetContent = documentObject.getElementById('sheetContent');
            this.summaryContent = documentObject.getElementById('summaryContent');
            this.summaryActions = documentObject.getElementById('summaryActions');
            this.searchInput = documentObject.getElementById('searchInput');
            this.tabsWrapper = documentObject.getElementById('tabsWrapper');
            this.sheetTeamTabs = documentObject.getElementById('sheetTeamTabs');
            this.tabsPrev = documentObject.getElementById('tabsPrev');
            this.tabsNext = documentObject.getElementById('tabsNext');
            this.formationSelector = documentObject.getElementById('formationSelector');
            this.slotBubble = documentObject.getElementById('slotBubble');
            this.slotBubbleText = documentObject.getElementById('slotBubbleText');
            this.pitchMenu = documentObject.getElementById('pitchMenu');
            this.pitchMenuToggle = documentObject.getElementById('pitchMenuToggle');
            this.pitchMenuPanel = documentObject.getElementById('pitchMenuPanel');
            this.toast = documentObject.getElementById('toast');
            this.toastText = documentObject.getElementById('toastText');
            this.toastUndo = documentObject.getElementById('toastUndo');
            this.sheetCloseButton = documentObject.getElementById('sheetClose');
        }

        init() {
            this.renderPitch();
            this.bindEvents();
            this.checkCompletion();
            this.triggerInitialHint();
            this.initPanel();
            this.updateFieldAnchors();
        }

        bindEvents() {
            this.pitchGrid.addEventListener('click', (event) => {
                const slot = event.target.closest('.player-slot');
                if (slot) this.handleSlotClick(slot);
            });

            this.pitchGrid.addEventListener('keydown', (event) => {
                const slot = event.target.closest('.player-slot');
                if (slot && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    this.handleSlotClick(slot);
                }
            });

            this.formationSelector.addEventListener('click', (event) => {
                const button = event.target.closest('.formation-btn');
                if (!button) return;
                const formation = button.dataset.formation;
                if (formation && formation !== this.currentFormation) {
                    this.changeFormation(formation);
                    this.syncFormationButtons();
                }
            });

            if (this.pitchMenuToggle) {
                this.pitchMenuToggle.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.togglePitchMenu();
                });
            }

            this.sheetCloseButton.addEventListener('click', () => this.closePanel());
            this.backdrop.addEventListener('click', () => this.closePanel());
            documentObject.getElementById('floatSaveBtn').addEventListener('click', () => this.downloadXI());
            documentObject.getElementById('floatShareBtn').addEventListener('click', () => this.shareXI());
            documentObject.getElementById('floatResetBtn').addEventListener('click', () => this.resetBuilder());

            this.searchInput.addEventListener('input', (event) => {
                this.searchTerm = event.target.value.trim().toLowerCase();
                this.toggleTabsVisibility();
                this.renderSheetPlayers();
            });

            this.sheetTeamTabs.addEventListener('click', (event) => {
                if (this._tabsDrag && this._tabsDrag.moved) {
                    this._tabsDrag.moved = false;
                    return;
                }
                const tab = event.target.closest('.sheet-team-tab');
                if (!tab) return;
                this.currentSheetTeam = tab.dataset.team;
                this.syncTeamTabs();
                this.renderSheetPlayers();
            });

            this.sheetTeamTabs.addEventListener('scroll', () => this.updateTabsOverflow(), { passive: true });

            if (this.tabsPrev) {
                this.tabsPrev.addEventListener('click', () => this.scrollTabsBy(-1));
            }

            if (this.tabsNext) {
                this.tabsNext.addEventListener('click', () => this.scrollTabsBy(1));
            }

            this.sheetTeamTabs.addEventListener('wheel', (event) => {
                const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
                if (rawDelta === 0) return;
                let delta = rawDelta;
                if (event.deltaMode === 1) delta *= 16;
                else if (event.deltaMode === 2) delta *= this.sheetTeamTabs.clientWidth;

                const maxScroll = this.sheetTeamTabs.scrollWidth - this.sheetTeamTabs.clientWidth;
                const atStart = this.sheetTeamTabs.scrollLeft <= 0;
                const atEnd = this.sheetTeamTabs.scrollLeft >= maxScroll - 1;

                if ((delta < 0 && !atStart) || (delta > 0 && !atEnd)) {
                    event.preventDefault();
                    this.sheetTeamTabs.scrollLeft += delta;
                }
            }, { passive: false });

            this.sheetTeamTabs.addEventListener('keydown', (event) => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                const tabs = Array.from(this.sheetTeamTabs.querySelectorAll('.sheet-team-tab'));
                const currentIndex = tabs.indexOf(documentObject.activeElement);
                if (currentIndex === -1) return;
                event.preventDefault();
                const nextIndex = event.key === 'ArrowRight'
                    ? Math.min(currentIndex + 1, tabs.length - 1)
                    : Math.max(currentIndex - 1, 0);
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
            });

            this.sheetTeamTabs.addEventListener('pointerdown', (event) => {
                if (event.pointerType === 'touch') return;
                this._tabsDrag.active = true;
                this._tabsDrag.moved = false;
                this._tabsDrag.startX = event.clientX;
                this._tabsDrag.startScroll = this.sheetTeamTabs.scrollLeft;
                this.sheetTeamTabs.classList.add('is-dragging');
            });

            this.sheetTeamTabs.addEventListener('pointermove', (event) => {
                if (!this._tabsDrag.active) return;
                const delta = this._tabsDrag.startX - event.clientX;
                if (Math.abs(delta) > 5) this._tabsDrag.moved = true;
                this.sheetTeamTabs.scrollLeft = this._tabsDrag.startScroll + delta;
            });

            const endTabsDrag = () => {
                if (!this._tabsDrag.active) return;
                this._tabsDrag.active = false;
                this.sheetTeamTabs.classList.remove('is-dragging');
            };

            windowObject.addEventListener('pointerup', endTabsDrag);
            windowObject.addEventListener('pointercancel', endTabsDrag);

            [this.tabsPrev, this.tabsNext].forEach((button) => {
                if (!button) return;
                const direction = button === this.tabsPrev ? -1 : 1;
                let holdTimer = null;
                let holdInterval = null;
                const startHold = () => {
                    if (button.disabled) return;
                    holdTimer = windowObject.setTimeout(() => {
                        holdInterval = windowObject.setInterval(() => this.scrollTabsBy(direction), 120);
                    }, 350);
                };
                const stopHold = () => {
                    windowObject.clearTimeout(holdTimer);
                    windowObject.clearInterval(holdInterval);
                    holdTimer = null;
                    holdInterval = null;
                };
                button.addEventListener('pointerdown', (event) => {
                    event.preventDefault();
                    startHold();
                });
                button.addEventListener('pointerup', stopHold);
                button.addEventListener('pointerleave', stopHold);
                button.addEventListener('pointercancel', stopHold);
            });

            this.sheetContent.addEventListener('click', (event) => {
                const removeButton = event.target.closest('#removePlayerBtn');
                if (removeButton) {
                    this.removePlayerFromSlot(this.activeSlotId, true);
                    if (!this.isDesktop()) this.closePanel();
                    else this.openPicker();
                    return;
                }

                const card = event.target.closest('.player-card');
                if (card) this.handlePlayerCardSelection(card);
            });

            this.sheetContent.addEventListener('keydown', (event) => {
                const card = event.target.closest('.player-card');
                if (card && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    this.handlePlayerCardSelection(card);
                }
            });

            this.summaryActions.addEventListener('click', (event) => {
                if (event.target.closest('#saveBtn')) this.downloadXI();
                if (event.target.closest('#shareBtn')) this.shareXI();
                if (event.target.closest('#resetBtn')) {
                    this.resetBuilder();
                    if (!this.isDesktop()) this.closePanel();
                }
            });

            this.toastUndo.addEventListener('click', () => this.restoreLastRemoved());
            if (this.pitchMenuPanel) {
                this.pitchMenuPanel.addEventListener('click', (event) => {
                    if (event.target.closest('a')) this.closePitchMenu();
                });
            }

            documentObject.addEventListener('click', (event) => {
                if (!this.pitchMenu || !this.pitchMenu.classList.contains('open')) return;
                if (event.target.closest('#pitchMenu')) return;
                this.closePitchMenu();
            });
            documentObject.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') this.closePitchMenu();
            });
            windowObject.addEventListener('resize', () => {
                this.updateFieldAnchors();
                this.updateTabsOverflow();
            });
            windowObject.addEventListener('scroll', () => this.updateFieldAnchors(), { passive: true });
        }

        isDesktop() {
            return windowObject.innerWidth >= 1024;
        }

        initPanel() {
            if (!this.isDesktop()) return;
            if (this.countSelectedPlayers() === 11) this.openSummary();
            else this.openPicker();
        }

        vibrate(pattern) {
            try {
                if (windowObject.navigator.vibrate) windowObject.navigator.vibrate(pattern);
            } catch (error) {}
        }

        syncFormationButtons() {
            this.formationSelector.querySelectorAll('.formation-btn').forEach((button) => {
                const isActive = button.dataset.formation === this.currentFormation;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-selected', String(isActive));
            });
        }

        changeFormation(newFormation) {
            this.currentFormation = newFormation;
            const newStructure = this.formations[newFormation];
            const reassignedPlayers = [...Object.values(this.selectedPlayers), ...this.benchPlayers];

            this.selectedPlayers = {};
            this.benchPlayers = [];

            const allowedByPos = {};
            const usedByPos = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

            newStructure.forEach((row) => {
                allowedByPos[row.pos] = row.count;
            });

            reassignedPlayers.forEach((player) => {
                if (usedByPos[player.pos] < allowedByPos[player.pos]) {
                    const slotId = `${player.pos}-${usedByPos[player.pos]}`;
                    this.selectedPlayers[slotId] = player;
                    usedByPos[player.pos] += 1;
                } else {
                    this.benchPlayers.push(player);
                }
            });

            this.renderPitch(true);
            this.checkCompletion();

            if (this.isDesktop() && this.summaryView.classList.contains('active')) {
                this.openSummary();
            }
        }

        renderPitch(animate = false) {
            this.pitchGrid.innerHTML = this.buildPitchMarkup(animate);
        }

        buildPitchMarkup(animate) {
            const structure = this.formations[this.currentFormation];
            if (!structure) return '';

            return structure.map((row, rowIndex) => `
                <div class="formation-row" role="group" aria-label="Linea de ${row.pos}">
                    ${Array.from({ length: row.count }, (_, index) => this.buildSlotMarkup(row, rowIndex, index, animate)).join('')}
                </div>
            `).join('');
        }

        buildSlotMarkup(row, rowIndex, index, animate) {
            const slotId = `${row.pos}-${index}`;
            const label = row.labels[index] || row.pos;
            const player = this.selectedPlayers[slotId];
            const animationStyle = animate ? `style="animation-delay:${(rowIndex * 100) + (index * 50)}ms"` : 'style="animation:none"';

            if (player) {
                return `
                    <div class="player-slot filled" data-slot-id="${slotId}" data-pos="${row.pos}" role="button" tabindex="0" aria-label="Posición ${label}, actualmente ${player.name} de ${player.teamName}. Activa para editar." ${animationStyle}>
                        <div class="filled-avatar" style="background:${player.color};color:${this.getContrastColor(player.color)};border-color:${this.getContrastColor(player.color)}" aria-hidden="true">${player.number}</div>
                        <div class="filled-info" aria-hidden="true">
                            <div class="filled-info__main">
                                <span class="filled-info__flag" aria-hidden="true">
                                    <img src="${player.flag}" alt="" loading="lazy">
                                </span>
                                <span class="filled-info__name">${player.name}</span>
                            </div>
                            <span class="filled-info__pos">${player.pos}</span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="player-slot empty" data-slot-id="${slotId}" data-pos="${row.pos}" role="button" tabindex="0" aria-label="Posición ${label} vacía. Activa para seleccionar jugador." ${animationStyle}>
                    <span class="player-slot__icon" aria-hidden="true">+</span>
                    <span class="player-slot__pos" aria-hidden="true">${label}</span>
                </div>
            `;
        }

        triggerInitialHint() {
            if (this.countSelectedPlayers() !== 0) return;
            const firstGoalkeeperSlot = this.pitchGrid.querySelector('.player-slot[data-pos="GK"]');
            if (!firstGoalkeeperSlot) return;
            firstGoalkeeperSlot.classList.add('hint');
            windowObject.setTimeout(() => firstGoalkeeperSlot.classList.remove('hint'), 4000);
        }

        clearSlotStates() {
            this.pitchGrid.querySelectorAll('.player-slot.hint, .player-slot.is-selecting').forEach((slot) => {
                slot.classList.remove('hint', 'is-selecting');
            });
        }

        handleSlotClick(slot) {
            this.vibrate(10);
            this.clearSlotStates();

            if (this.pitchSection.classList.contains('complete')) {
                if (!this.isDesktop()) this.openSummary();
                return;
            }

            this.activeSlotId = slot.dataset.slotId;
            this.activePos = slot.dataset.pos;
            this.activeCurrentPlayer = this.selectedPlayers[this.activeSlotId] || null;
            this.searchInput.value = '';
            this.searchTerm = '';
            this.toggleTabsVisibility();

            slot.classList.add('is-selecting');
            this.openPicker();
        }

        openPanel() {
            if (this.isDesktop()) return;
            this.selectorPanel.classList.add('open');
            this.backdrop.classList.add('show');
            documentObject.body.classList.add('sheet-open');
        }

        closePanel() {
            if (!this.isDesktop()) {
                this.selectorPanel.classList.remove('open');
                this.backdrop.classList.remove('show');
                documentObject.body.classList.remove('sheet-open');
            }

            this.activeSlotId = null;
            this.activePos = null;
            this.activeCurrentPlayer = null;
            this.searchInput.value = '';
            this.searchTerm = '';
            this.clearSlotStates();

            if (this.isDesktop()) {
                this.openPicker();
            }
        }

        setPickerLockedState(locked) {
            if (!this.searchInput || !this.pickerView) return;
            this.searchInput.disabled = locked;
            this.pickerView.classList.toggle('is-locked', locked);

            if (locked) {
                this.searchInput.value = '';
                this.searchTerm = '';
            }

            this.toggleTabsVisibility();
            if (locked) this.tabsWrapper.style.display = 'none';
        }

        openPicker() {
            this.pickerView.classList.remove('hidden');
            this.summaryView.classList.remove('active');
            this.updateCloseButton();

            const locked = !this.activePos;
            this.setPickerLockedState(locked);

            if (this.activePos) {
                const posName = this.config.positionNames[this.activePos];
                this.sheetTitle.textContent = `Elegir ${posName}`;
                this.sheetSubtitle.textContent = `Posición ${this.activePos}`;
                this.searchInput.setAttribute('placeholder', `Buscar ${posName} o selección...`);
            } else {
                this.sheetTitle.textContent = 'Seleccionar Jugador';
                this.sheetSubtitle.textContent = 'Paso 1: elige un puesto en el campo';
                this.searchInput.setAttribute('placeholder', 'Primero elige un puesto en el campo');
            }

            if (!this.teamSupportsCurrentPosition(this.currentSheetTeam)) {
                this.currentSheetTeam = this.firstTeamForActivePosition();
            }

            this.renderTeamTabs();
            this.renderSheetContentShell();
            this.renderSheetPlayers();
            this.openPanel();
            this.scrollActiveTabIntoView();
        }

        teamSupportsCurrentPosition(teamName) {
            const team = this.teams[teamName];
            if (!team || !this.activePos) return Boolean(team);
            return team.players.some((player) => player.pos === this.activePos);
        }

        firstTeamForActivePosition() {
            return this.teamNames.find((teamName) => this.teamSupportsCurrentPosition(teamName)) || this.teamNames[0];
        }

        renderTeamTabs() {
            const pos = this.activePos;
            this.sheetTeamTabs.innerHTML = this.teamNames
                .filter((teamName) => !pos || this.teams[teamName].players.some((player) => player.pos === pos))
                .map((teamName) => {
                    const isActive = teamName === this.currentSheetTeam;
                    return `
                        <button class="sheet-team-tab ${isActive ? 'active' : ''}" data-team="${teamName}" role="tab" aria-selected="${String(isActive)}" aria-label="Seleccionar pais ${teamName}">
                            <span class="sheet-team-flag" aria-hidden="true">
                                <img src="${this.teams[teamName].flag}" alt="" loading="lazy">
                            </span>
                            <span>${teamName}</span>
                        </button>
                    `;
                }).join('');

            this._canLeft = null;
            this._canRight = null;
            this.updateTabsOverflow();
        }

        updateTabsOverflow() {
            if (!this.sheetTeamTabs || !this.tabsWrapper) return;
            if (this._tabsRaf) return;
            this._tabsRaf = windowObject.requestAnimationFrame(() => {
                this._tabsRaf = null;
                const maxScroll = this.sheetTeamTabs.scrollWidth - this.sheetTeamTabs.clientWidth;
                const hasOverflow = maxScroll > 1;
                const canLeft = hasOverflow && this.sheetTeamTabs.scrollLeft > 1;
                const canRight = hasOverflow && this.sheetTeamTabs.scrollLeft < maxScroll - 1;

                if (canLeft === this._canLeft && canRight === this._canRight) return;

                this._canLeft = canLeft;
                this._canRight = canRight;

                this.tabsWrapper.classList.toggle('can-scroll-left', canLeft);
                this.tabsWrapper.classList.toggle('can-scroll-right', canRight);

                if (this.tabsPrev) {
                    this.tabsPrev.hidden = !hasOverflow;
                    this.tabsPrev.disabled = !canLeft;
                }
                if (this.tabsNext) {
                    this.tabsNext.hidden = !hasOverflow;
                    this.tabsNext.disabled = !canRight;
                }
            });
        }

        scrollTabsBy(direction) {
            if (!this.sheetTeamTabs) return;
            const amount = Math.max(this.sheetTeamTabs.clientWidth * 0.8, 180);
            this.sheetTeamTabs.scrollBy({ left: direction * amount, behavior: 'smooth' });
        }

        syncTeamTabs() {
            this.sheetTeamTabs.querySelectorAll('.sheet-team-tab').forEach((tab) => {
                const isActive = tab.dataset.team === this.currentSheetTeam;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', String(isActive));
            });
        }

        renderSheetContentShell() {
            const removeButton = this.activeCurrentPlayer
                ? `<button class="remove-btn" id="removePlayerBtn" aria-label="Quitar a ${this.activeCurrentPlayer.name} del equipo">Quitar a ${this.activeCurrentPlayer.name} del 11</button>`
                : '';

            this.sheetContent.innerHTML = `${removeButton}<div class="sheet-player-list" id="sheetPlayerList"></div>`;
        }

        toggleTabsVisibility() {
            this.tabsWrapper.style.display = this.searchTerm ? 'none' : 'block';
        }

        renderSheetPlayers() {
            const listContainer = documentObject.getElementById('sheetPlayerList');
            if (!listContainer) return;

            const players = this.getPlayersForCurrentView();
            listContainer.style.opacity = '0';
            listContainer.style.transform = 'translateY(10px)';
            listContainer.style.transition = 'all 200ms ease';
            listContainer.innerHTML = this.buildPlayerListMarkup(players);

            windowObject.requestAnimationFrame(() => {
                listContainer.style.opacity = '1';
                listContainer.style.transform = 'translateY(0)';
            });
        }

        getPlayersForCurrentView() {
            if (this.searchTerm) {
                const foundPlayers = [];
                this.teamNames.forEach((teamName) => {
                    this.teams[teamName].players.forEach((player) => {
                        const matchesPosition = !this.activePos || player.pos === this.activePos;
                        const matchesSearch = player.name.toLowerCase().includes(this.searchTerm) || teamName.toLowerCase().includes(this.searchTerm);
                        if (matchesPosition && matchesSearch) {
                            foundPlayers.push(this.withTeamContext(player, teamName));
                        }
                    });
                });
                return foundPlayers;
            }

            if (!this.activePos) return [];

            return this.teams[this.currentSheetTeam].players
                .filter((player) => player.pos === this.activePos)
                .map((player) => this.withTeamContext(player, this.currentSheetTeam));
        }

        withTeamContext(player, teamName) {
            return {
                ...player,
                teamName,
                flag: this.teams[teamName].flag,
            };
        }

        buildPlayerListMarkup(players) {
            if (!this.activePos && this.isDesktop()) {
                return `
                    <div class="sheet-empty-state sheet-empty-state--desktop">
                        <span class="sheet-empty-state__badge">1</span>
                        <div class="sheet-empty-state__text">
                            <p class="sheet-empty-state__title">Elige un puesto del campo</p>
                            <p class="sheet-empty-state__copy">Toca cualquier casilla vacía (arquero, defensa, medio o delantero) para activar la búsqueda y ver los jugadores disponibles en esa posición.</p>
                        </div>
                    </div>`;
            }

            if (players.length === 0) {
                return '<div class="sheet-empty-state sheet-empty-state--results">No se encontraron jugadores.</div>';
            }

            return `
                <div class="sheet-list" role="list">
                    ${players.map((player) => this.buildPlayerCardMarkup(player)).join('')}
                </div>
            `;
        }

        buildPlayerCardMarkup(player) {
            const currentIds = Object.values(this.selectedPlayers).map((selectedPlayer) => selectedPlayer.id);
            const isInPitch = currentIds.includes(player.id);
            const isBenched = this.benchPlayers.some((benchedPlayer) => benchedPlayer.id === player.id);
            const isCurrent = this.activeCurrentPlayer && this.activeCurrentPlayer.id === player.id;

            let classes = 'player-card';
            let ariaLabel = `Seleccionar a ${player.name} de ${player.teamName}`;

            if (isInPitch && !isCurrent) {
                classes += ' selected';
                ariaLabel = `${player.name} de ${player.teamName}, ya seleccionado`;
            }

            if (isBenched) {
                classes += ' benched';
                ariaLabel = `${player.name} de ${player.teamName}, en el banquillo`;
            }

            if (isCurrent) {
                ariaLabel = `${player.name} de ${player.teamName}, seleccionado actualmente`;
            }

            return `
                <div class="${classes}" data-player-id="${player.id}" data-team="${player.teamName}" role="listitem" tabindex="0" aria-label="${ariaLabel}" ${isInPitch && !isCurrent ? 'aria-disabled="true"' : ''}>
                    <div class="player-card__img" style="background:${player.color};color:${this.getContrastColor(player.color)}" aria-hidden="true">${player.number}</div>
                    <div class="player-card__info">
                        <span class="player-card__name">${player.name}</span>
                        <span class="player-card__meta">${player.teamName}</span>
                    </div>
                    ${isBenched ? '<span class="player-card__badge player-card__badge--bench" aria-hidden="true">Suplente</span>' : ''}
                    ${isCurrent ? '<span class="player-card__badge player-card__badge--current" aria-hidden="true">Actual</span>' : ''}
                </div>
            `;
        }

        handlePlayerCardSelection(card) {
            if (card.classList.contains('selected')) return;

            this.vibrate(10);
            const teamName = card.dataset.team;
            const playerId = card.dataset.playerId;
            const player = this.teams[teamName].players.find((candidate) => candidate.id === playerId);

            if (!player) return;

            const enrichedPlayer = this.withTeamContext(player, teamName);

            if (this.isDesktop() && !this.activeSlotId) {
                const emptySlot = this.findEmptySlot(player.pos);
                if (!emptySlot) {
                    this.showToast(`No hay espacio para más ${player.pos}`);
                    return;
                }

                this.assignPlayerToSlot(enrichedPlayer, emptySlot.dataset.slotId);
                if (this.countSelectedPlayers() < 11) this.openPicker();
                return;
            }

            this.assignPlayerToSlot(enrichedPlayer, this.activeSlotId);
            if (!this.isDesktop()) this.closePanel();
            else this.openPicker();
        }

        findEmptySlot(pos) {
            return [...this.pitchGrid.querySelectorAll(`.player-slot[data-pos="${pos}"]`)]
                .find((slot) => !this.selectedPlayers[slot.dataset.slotId]) || null;
        }

        openSummary() {
            this.pickerView.classList.add('hidden');
            this.summaryView.classList.add('active');
            this.updateCloseButton();
            this.sheetTitle.textContent = '11 Ideal Completado';
            this.sheetSubtitle.textContent = 'Tu alineación final';
            this.summaryContent.innerHTML = this.buildSummaryMarkup();
            this.summaryActions.innerHTML = `
                <button class="btn btn-primary" id="saveBtn" aria-label="Guardar imagen de tu equipo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Guardar Imagen</span>
                </button>
                <div class="btn-row">
                    <button class="btn btn-secondary" id="shareBtn" aria-label="Compartir enlace de tu equipo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        <span>Compartir</span>
                    </button>
                    <button class="btn btn-ghost" id="resetBtn" aria-label="Reiniciar equipo y empezar de cero">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        <span>Reiniciar</span>
                    </button>
                </div>
            `;
            this.openPanel();
        }

        updateCloseButton() {
            if (!this.sheetCloseButton) return;

            const hasActiveSelection = Boolean(this.activePos || this.activeCurrentPlayer);
            const isSummaryVisible = this.summaryView.classList.contains('active');
            const label = isSummaryVisible ? 'Volver al selector' : hasActiveSelection ? 'Cancelar selección actual' : 'Cerrar selector';

            this.sheetCloseButton.setAttribute('aria-label', label);
            this.sheetCloseButton.setAttribute('title', label);
        }

        togglePitchMenu() {
            if (!this.pitchMenu || !this.pitchMenuToggle || !this.pitchMenuPanel) return;

            const shouldOpen = !this.pitchMenu.classList.contains('open');
            this.pitchMenu.classList.toggle('open', shouldOpen);
            this.pitchMenuToggle.setAttribute('aria-expanded', String(shouldOpen));
            this.pitchMenuPanel.hidden = !shouldOpen;

            if (this.pitchSection) {
                this.pitchSection.classList.toggle('menu-open', shouldOpen);
            }
        }

        closePitchMenu() {
            if (!this.pitchMenu || !this.pitchMenuToggle || !this.pitchMenuPanel) return;

            this.pitchMenu.classList.remove('open');
            this.pitchMenuToggle.setAttribute('aria-expanded', 'false');
            this.pitchMenuPanel.hidden = true;

            if (this.pitchSection) {
                this.pitchSection.classList.remove('menu-open');
            }
        }

        buildSummaryMarkup() {
            return this.formations[this.currentFormation].map((row) => `
                <div class="summary-group" role="list" aria-label="${this.config.summaryTitles[row.pos]}">
                    <h3>${this.config.summaryTitles[row.pos]}</h3>
                    ${Array.from({ length: row.count }, (_, index) => {
                        const player = this.selectedPlayers[`${row.pos}-${index}`];
                        if (!player) return '';
                        return `
                            <div class="summary-item" role="listitem" aria-label="${player.name}, ${player.teamName}">
                                <div class="summary-item__number" style="background:${player.color};color:${this.getContrastColor(player.color)}" aria-hidden="true">${player.number}</div>
                                <div class="summary-item__info">
                                    <span class="summary-item__name">${player.name}</span>
                                    <span class="summary-item__team">${player.teamName}</span>
                                </div>
                                <span class="summary-item__flag" aria-hidden="true">
                                    <img src="${player.flag}" alt="" loading="lazy">
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('');
        }

        countSelectedPlayers() {
            return Object.keys(this.selectedPlayers).length;
        }

        syncPitchStageUI(count) {
            this.pitchSection.classList.toggle('has-picked', count > 0 || this.hasSessionStarted);
        }

        getStatusMessage(count) {
            if (count === 0) {
                return 'Elige tu primer jugador';
            }

            if (!this.hasSessionStarted) {
                return 'Sigue armando tu 11';
            }

            return `Faltan ${11 - count} jugadores`;
        }

        checkCompletion() {
            const count = this.countSelectedPlayers();
            const wasComplete = this.pitchSection.classList.contains('complete');
            const isComplete = count === 11;

            this.syncPitchStageUI(count);

            if (isComplete) {
                this.statusText.textContent = '11 Ideal Completado';
                this.pitchSection.classList.add('complete');

                if (!wasComplete) {
                    this.pitchSection.classList.add('celebrate');
                    this.vibrate([20, 50, 20]);
                    this.launchConfetti();
                    windowObject.setTimeout(() => {
                        this.pitchSection.classList.remove('celebrate');
                        if (this.isDesktop()) this.openSummary();
                    }, 2500);
                } else if (this.isDesktop() && !this.summaryView.classList.contains('active')) {
                    this.openSummary();
                }
            } else {
                this.statusText.textContent = this.getStatusMessage(count);
                this.pitchSection.classList.remove('complete');

                if (this.isDesktop() && this.pickerView.classList.contains('hidden')) {
                    this.openPicker();
                }
            }
        }

        launchConfetti() {
            if (typeof windowObject.confetti === 'undefined') return;
            try {
                const rect = this.pitchSection.getBoundingClientRect();
                const originX = (rect.left + (rect.width / 2)) / windowObject.innerWidth;
                const originY = (rect.top + (rect.height * 0.58)) / windowObject.innerHeight;

                windowObject.confetti({
                    particleCount: 120,
                    spread: 70,
                    origin: {
                        x: Math.min(Math.max(originX, 0.1), 0.9),
                        y: Math.min(Math.max(originY, 0.1), 0.9),
                    },
                    colors: ['#D4AF37', '#FFD700', '#FFEC8B', '#FFFFFF'],
                });
            } catch (error) {}
        }

        assignPlayerToSlot(player, slotId) {
            const benchIndex = this.benchPlayers.findIndex((benchedPlayer) => benchedPlayer.id === player.id);
            if (benchIndex !== -1) this.benchPlayers.splice(benchIndex, 1);

            this.selectedPlayers[slotId] = player;
            if (this.activeSlotId === slotId) {
                this.activeCurrentPlayer = player;
            }
            this.hasSessionStarted = true;
            this.lastRemoved = null;
            this.toastUndo.style.display = 'none';

            this.renderPitch();
            this.checkCompletion();
            this.refreshPickerState();
            this.showSlotBubble(slotId, `${player.name}, adentro`);
        }

        removePlayerFromSlot(slotId, showUndo = false) {
            const player = this.selectedPlayers[slotId];
            if (!player) return;

            this.lastRemoved = { player, slotId };
            delete this.selectedPlayers[slotId];
            if (this.activeSlotId === slotId) {
                this.activeCurrentPlayer = null;
            }

            this.renderPitch();
            this.checkCompletion();
            this.refreshPickerState();
            if (showUndo) this.showToast(`${player.name}, afuera`, true);
        }

        restoreLastRemoved() {
            if (!this.lastRemoved) return;

            const restoredSlotId = this.lastRemoved.slotId;
            this.selectedPlayers[restoredSlotId] = this.lastRemoved.player;
            this.hasSessionStarted = true;
            const restoredPlayer = this.lastRemoved.player;
            this.lastRemoved = null;
            if (this.activeSlotId === restoredSlotId) {
                this.activeCurrentPlayer = restoredPlayer;
            }
            this.renderPitch();
            this.checkCompletion();
            this.refreshPickerState();
            this.toast.classList.remove('show');
            this.showSlotBubble(restoredSlotId, `${restoredPlayer.name}, de vuelta`);
        }

        refreshPickerState() {
            if (!this.pickerView || this.pickerView.classList.contains('hidden')) return;

            this.renderSheetContentShell();
            this.renderSheetPlayers();
        }

        showSlotBubble(slotId, message) {
            if (!slotId || !this.slotBubble || !this.slotBubbleText) {
                this.showToast(message);
                return;
            }

            const slot = this.pitchGrid.querySelector(`[data-slot-id="${slotId}"]`);
            if (!slot) {
                this.showToast(message);
                return;
            }

            this.slotBubbleSlotId = slotId;
            this.slotBubbleText.textContent = message;
            this.slotBubble.classList.remove('show');
            this.positionSlotBubble(slot);

            windowObject.requestAnimationFrame(() => {
                this.slotBubble.classList.add('show');
            });

            windowObject.clearTimeout(this.slotBubbleTimeout);
            this.slotBubbleTimeout = windowObject.setTimeout(() => {
                this.hideSlotBubble();
            }, 1850);
        }

        positionSlotBubble(slot) {
            if (!this.slotBubble || !this.pitchSection || !slot) return;

            const pitchRect = this.pitchSection.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();
            const bubbleRect = this.slotBubble.getBoundingClientRect();
            const bubbleWidth = bubbleRect.width || 180;
            const bubbleHeight = bubbleRect.height || 48;

            const idealLeft = (slotRect.left - pitchRect.left) + (slotRect.width / 2) - (bubbleWidth / 2);
            const clampedLeft = Math.min(
                Math.max(idealLeft, 14),
                pitchRect.width - bubbleWidth - 14
            );

            const top = Math.max((slotRect.top - pitchRect.top) - bubbleHeight - 12, 14);

            this.slotBubble.style.left = `${clampedLeft}px`;
            this.slotBubble.style.top = `${top}px`;
        }

        hideSlotBubble() {
            if (!this.slotBubble) return;
            this.slotBubble.classList.remove('show');
            this.slotBubbleSlotId = null;
        }

        showToast(message, showUndo = false) {
            this.updateFieldAnchors();
            this.toastText.textContent = message;
            this.toast.classList.add('show');
            this.toastUndo.style.display = showUndo && this.lastRemoved ? 'block' : 'none';

            windowObject.clearTimeout(this.toastTimeout);
            this.toastTimeout = windowObject.setTimeout(() => {
                this.toast.classList.remove('show');
            }, 4000);
        }

        updateFieldAnchors() {
            if (!this.toast || !this.pitchSection) return;

            if (!this.isDesktop()) {
                this.toast.classList.remove('toast--pitch-aligned');
                this.toast.style.left = '';
                this.toast.style.right = '';
                this.toast.style.bottom = '';
                return;
            }

            const rect = this.pitchSection.getBoundingClientRect();
            const bottomOffset = Math.max(windowObject.innerHeight - rect.bottom + 24, 24);

            this.toast.classList.add('toast--pitch-aligned');
            this.toast.style.left = `${rect.left + (rect.width / 2)}px`;
            this.toast.style.right = 'auto';
            this.toast.style.bottom = `${bottomOffset}px`;

            if (this.slotBubbleSlotId) {
                const slot = this.pitchGrid.querySelector(`[data-slot-id="${this.slotBubbleSlotId}"]`);
                if (slot) this.positionSlotBubble(slot);
            }
        }

        async downloadXI() {
            if (typeof windowObject.html2canvas === 'undefined') {
                this.showToast('Error: librería de imagen no cargada.');
                return;
            }

            this.showToast('Generando imagen...');

            const actions = documentObject.getElementById('completionActions');
            const originalDisplay = actions.style.display;
            actions.style.display = 'none';

            const frame = this.createExportFrame();
            this.pitchSection.appendChild(frame);

            const flagImages = Array.from(this.pitchSection.querySelectorAll('.filled-info__flag img'));
            const originalSources = flagImages.map((image) => image.getAttribute('src'));
            const loadFlags = flagImages.map((image) => new Promise((resolve) => {
                const exportSrc = this.getExportFlagSrc(image.getAttribute('src'));
                if (!exportSrc || image.getAttribute('src') === exportSrc) {
                    resolve();
                    return;
                }
                const done = () => resolve();
                image.onload = done;
                image.onerror = done;
                image.src = exportSrc;
                if (image.complete && image.naturalWidth > 0) done();
            }));

            try {
                await Promise.all(loadFlags);
                await this.preloadExportAssets();
                await new Promise((resolve) => windowObject.requestAnimationFrame(() => resolve()));

                const canvas = await windowObject.html2canvas(this.pitchSection, {
                    backgroundColor: '#1A4D2E',
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    onclone: (clonedDocument) => {
                        const statusPill = clonedDocument.getElementById('statusPill');
                        if (statusPill) statusPill.remove();

                        const pitchBrand = clonedDocument.getElementById('pitchBrand');
                        if (pitchBrand) pitchBrand.remove();

                        const pitchMenu = clonedDocument.getElementById('pitchMenu');
                        if (pitchMenu) pitchMenu.remove();

                        const slotBubble = clonedDocument.getElementById('slotBubble');
                        if (slotBubble) slotBubble.remove();

                        const toast = clonedDocument.getElementById('toast');
                        if (toast) toast.remove();

                        if (!this.isDesktop()) {
                            const pitchHeader = clonedDocument.querySelector('.pitch-header');
                            if (pitchHeader) pitchHeader.style.display = 'none';
                        }
                    },
                });

                const link = documentObject.createElement('a');
                link.download = 'mi-11-ideal-mundial-2026.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                this.showToast('Imagen guardada en tu dispositivo');
            } catch (error) {
                console.error('Error al generar la imagen del 11 ideal:', error);
                this.showToast('No se pudo generar la imagen. Prueba desde un servidor local.');
            } finally {
                flagImages.forEach((image, index) => {
                    if (originalSources[index] !== null) image.src = originalSources[index];
                });
                this.pitchSection.removeChild(frame);
                actions.style.display = originalDisplay;
            }
        }

        getExportFlagSrc(src) {
            if (!src) return '';
            return src.replace('/flags/', '/flags/png/').replace(/\.svg(\?.*)?$/, '.png');
        }

        getContrastColor(hex) {
            if (!hex) return '#0f1115';
            let value = hex.replace('#', '');
            if (value.length === 3) value = value.split('').map((char) => char + char).join('');
            const red = parseInt(value.substring(0, 2), 16);
            const green = parseInt(value.substring(2, 4), 16);
            const blue = parseInt(value.substring(4, 6), 16);
            const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
            return luminance > 0.6 ? '#0f1115' : '#ffffff';
        }

        async preloadExportAssets() {
            const sources = new Set(
                Object.values(this.selectedPlayers)
                    .map((player) => this.getExportFlagSrc(player.flag))
                    .filter(Boolean)
            );

            sources.add('assets/img/logo_rpp.png');

            await Promise.all([...sources].map((src) => new Promise((resolve) => {
                const image = new Image();
                image.onload = () => resolve();
                image.onerror = () => resolve();
                image.src = src;
            })));
        }

        createExportFrame() {
            const frame = documentObject.createElement('div');
            frame.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:40;pointer-events:none;display:flex;flex-direction:column;';

            const topBar = documentObject.createElement('div');
            topBar.style.cssText = 'padding:2rem 2rem 1rem;text-align:center;background:linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);';
            topBar.innerHTML = `
                <h2 style="font-family:'Barlow Condensed', sans-serif;font-size:2rem;margin:0;color:#FFD700;font-weight:800;letter-spacing:0.03em;text-transform:uppercase;">Mundial 2026</h2>
                <p style="font-family:'Sora', sans-serif;color:white;margin:0.5rem 0 0;text-transform:uppercase;letter-spacing:0.15em;font-size:0.8rem;font-weight:600;">Mi 11 Ideal | Formación ${this.currentFormation}</p>
            `;

            const footerBrand = documentObject.createElement('div');
            footerBrand.style.cssText = 'margin-top:auto;display:flex;justify-content:center;align-items:center;padding:0 2rem 0.7rem;';
            footerBrand.innerHTML = `
                <img src="assets/img/logo_rpp.png" alt="RPP" style="width:58px;height:58px;display:block;object-fit:contain;border-radius:50%;box-shadow:0 10px 24px rgba(0,0,0,0.24);">
            `;

            const bottomBar = documentObject.createElement('div');
            bottomBar.style.cssText = 'padding:0 2rem 1.5rem;text-align:center;background:linear-gradient(to top, rgba(0,0,0,0.6), transparent);';
            bottomBar.innerHTML = `
                <p style="font-family:'Sora', sans-serif;color:rgba(255,255,255,0.6);margin:0;text-transform:uppercase;letter-spacing:0.1em;font-size:0.7rem;">Hecho por RPP para la hinchada</p>
            `;

            frame.append(topBar, footerBrand, bottomBar);
            return frame;
        }

        async shareXI() {
            const currentUrl = windowObject.location.href;
            try {
                if (windowObject.navigator.clipboard && windowObject.navigator.clipboard.writeText) {
                    await windowObject.navigator.clipboard.writeText(currentUrl);
                    this.showToast('Enlace copiado al portapapeles');
                    return;
                }
            } catch (error) {}

            this.showToast(`Copia manualmente: ${currentUrl}`);
        }

        resetBuilder() {
            this.selectedPlayers = {};
            this.benchPlayers = [];
            this.currentFormation = this.defaultFormation;
            this.hasSessionStarted = false;
            this.activeSlotId = null;
            this.activePos = null;
            this.activeCurrentPlayer = null;
            this.searchInput.value = '';
            this.searchTerm = '';
            this.syncFormationButtons();
            this.renderPitch();
            this.checkCompletion();
            this.showToast('Equipo reiniciado. Empieza de cero.');
            this.triggerInitialHint();
            if (this.isDesktop()) this.openPicker();
        }

        scrollActiveTabIntoView() {
            windowObject.setTimeout(() => {
                const activeTab = this.sheetTeamTabs.querySelector('.sheet-team-tab.active');
                if (!activeTab) return;
                const containerWidth = this.sheetTeamTabs.getBoundingClientRect().width;
                const tabWidth = activeTab.getBoundingClientRect().width;
                const scrollPosition = activeTab.offsetLeft - (containerWidth / 2) + (tabWidth / 2);
                this.sheetTeamTabs.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                this.updateTabsOverflow();
            }, 100);
        }
    }

    documentObject.addEventListener('DOMContentLoaded', () => {
        try {
            new DreamTeamBuilder(appData);
        } catch (error) {
            console.error('Initialization error:', error);
            documentObject.body.innerHTML = '<div style="color:white;text-align:center;padding:50px;font-family:sans-serif;">Error al cargar la aplicacion. Revisa la consola.</div>';
        }
    });
}(window, document));
