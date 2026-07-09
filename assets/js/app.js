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
            this.hasSessionStarted = false;

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
            this.formationSelector = documentObject.getElementById('formationSelector');
            this.toast = documentObject.getElementById('toast');
            this.toastText = documentObject.getElementById('toastText');
            this.toastUndo = documentObject.getElementById('toastUndo');
        }

        init() {
            this.renderPitch();
            this.bindEvents();
            this.checkCompletion();
            this.triggerInitialHint();
            this.initPanel();
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

            documentObject.getElementById('sheetClose').addEventListener('click', () => this.closePanel());
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
                const tab = event.target.closest('.sheet-team-tab');
                if (!tab) return;
                this.currentSheetTeam = tab.dataset.team;
                this.syncTeamTabs();
                this.renderSheetPlayers();
            });

            this.sheetTeamTabs.addEventListener('wheel', (event) => {
                if (event.deltaY === 0) return;
                event.preventDefault();
                this.sheetTeamTabs.scrollLeft += event.deltaY;
            }, { passive: false });

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
                    <div class="player-slot filled" data-slot-id="${slotId}" data-pos="${row.pos}" role="button" tabindex="0" aria-label="Posicion ${label}, actualmente ${player.name} de ${player.teamName}. Activa para editar." ${animationStyle}>
                        <div class="filled-avatar" style="background:${player.color}" aria-hidden="true">${player.number}</div>
                        <div class="filled-info" aria-hidden="true">
                            <div class="filled-info__main">
                                <span class="filled-info__flag" style="background:${player.flag}"></span>
                                <span class="filled-info__name">${player.name}</span>
                            </div>
                            <span class="filled-info__pos">${player.pos}</span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="player-slot empty" data-slot-id="${slotId}" data-pos="${row.pos}" role="button" tabindex="0" aria-label="Posicion ${label} vacia. Activa para seleccionar jugador." ${animationStyle}>
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
            windowObject.setTimeout(() => this.searchInput.focus(), 300);
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
        }

        openPicker() {
            this.pickerView.classList.remove('hidden');
            this.summaryView.classList.remove('active');

            if (this.activePos) {
                this.sheetTitle.textContent = `Elegir ${this.config.positionNames[this.activePos]}`;
                this.sheetSubtitle.textContent = `Posicion ${this.activePos}`;
            } else {
                this.sheetTitle.textContent = 'Seleccionar Jugador';
                this.sheetSubtitle.textContent = 'Toca un puesto en el campo';
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
                            <span class="sheet-team-flag" style="background:${this.teams[teamName].flag}" aria-hidden="true"></span>
                            <span>${teamName}</span>
                        </button>
                    `;
                }).join('');
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
                ? `<button class="remove-btn" id="removePlayerBtn" aria-label="Quitar a ${this.activeCurrentPlayer.name} del equipo">Quitar a ${this.activeCurrentPlayer.name} del XI</button>`
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
                return '<div class="sheet-empty-state sheet-empty-state--desktop">Toca un puesto vacio en el campo para empezar a construir tu XI.</div>';
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
                    <div class="player-card__img" style="background:${player.color}" aria-hidden="true">${player.number}</div>
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
                    this.showToast(`No hay espacio para mas ${player.pos}`);
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
            this.sheetTitle.textContent = 'XI Ideal Completado';
            this.sheetSubtitle.textContent = 'Tu alineacion final';
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

        buildSummaryMarkup() {
            return this.formations[this.currentFormation].map((row) => `
                <div class="summary-group" role="list" aria-label="${this.config.summaryTitles[row.pos]}">
                    <h3>${this.config.summaryTitles[row.pos]}</h3>
                    ${Array.from({ length: row.count }, (_, index) => {
                        const player = this.selectedPlayers[`${row.pos}-${index}`];
                        if (!player) return '';
                        return `
                            <div class="summary-item" role="listitem" aria-label="${player.name}, ${player.teamName}">
                                <div class="summary-item__number" style="background:${player.color}" aria-hidden="true">${player.number}</div>
                                <div class="summary-item__info">
                                    <span class="summary-item__name">${player.name}</span>
                                    <span class="summary-item__team">${player.teamName}</span>
                                </div>
                                <span class="summary-item__flag" style="background:${player.flag}" aria-hidden="true"></span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('');
        }

        countSelectedPlayers() {
            return Object.keys(this.selectedPlayers).length;
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

            if (isComplete) {
                this.statusText.textContent = 'XI Ideal Completado';
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
                windowObject.confetti({
                    particleCount: 120,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#FFD700', '#FFEC8B', '#FFFFFF'],
                });
            } catch (error) {}
        }

        assignPlayerToSlot(player, slotId) {
            const benchIndex = this.benchPlayers.findIndex((benchedPlayer) => benchedPlayer.id === player.id);
            if (benchIndex !== -1) this.benchPlayers.splice(benchIndex, 1);

            this.selectedPlayers[slotId] = player;
            this.hasSessionStarted = true;
            this.lastRemoved = null;
            this.toastUndo.style.display = 'none';

            this.renderPitch();
            this.checkCompletion();
            this.showToast(`${player.name} en el XI`);
        }

        removePlayerFromSlot(slotId, showUndo = false) {
            const player = this.selectedPlayers[slotId];
            if (!player) return;

            this.lastRemoved = { player, slotId };
            delete this.selectedPlayers[slotId];

            this.renderPitch();
            this.checkCompletion();
            if (showUndo) this.showToast(`${player.name} removido`, true);
        }

        restoreLastRemoved() {
            if (!this.lastRemoved) return;

            this.selectedPlayers[this.lastRemoved.slotId] = this.lastRemoved.player;
            this.hasSessionStarted = true;
            const restoredPlayer = this.lastRemoved.player;
            this.lastRemoved = null;
            this.renderPitch();
            this.checkCompletion();
            this.toast.classList.remove('show');
            this.showToast(`${restoredPlayer.name} restaurado`);
        }

        showToast(message, showUndo = false) {
            this.toastText.textContent = message;
            this.toast.classList.add('show');
            this.toastUndo.style.display = showUndo && this.lastRemoved ? 'block' : 'none';

            windowObject.clearTimeout(this.toastTimeout);
            this.toastTimeout = windowObject.setTimeout(() => {
                this.toast.classList.remove('show');
            }, 4000);
        }

        async downloadXI() {
            if (typeof windowObject.html2canvas === 'undefined') {
                this.showToast('Error: libreria de imagen no cargada.');
                return;
            }

            this.showToast('Generando imagen...');

            const actions = documentObject.getElementById('completionActions');
            const originalDisplay = actions.style.display;
            actions.style.display = 'none';

            const frame = this.createExportFrame();
            this.pitchSection.appendChild(frame);

            try {
                const canvas = await windowObject.html2canvas(this.pitchSection, {
                    backgroundColor: '#1A4D2E',
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                const link = documentObject.createElement('a');
                link.download = 'mi-xi-ideal-mundial-2026.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                this.showToast('Imagen guardada en tu dispositivo');
            } catch (error) {
                this.showToast('Hubo un error al generar la imagen');
            } finally {
                this.pitchSection.removeChild(frame);
                actions.style.display = originalDisplay;
            }
        }

        createExportFrame() {
            const frame = documentObject.createElement('div');
            frame.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:40;pointer-events:none;display:flex;flex-direction:column;';

            const topBar = documentObject.createElement('div');
            topBar.style.cssText = 'padding:2rem 2rem 1rem;text-align:center;background:linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);';
            topBar.innerHTML = `
                <h2 style="font-family:'Barlow Condensed', sans-serif;font-size:2rem;margin:0;color:#FFD700;font-weight:800;letter-spacing:0.03em;text-transform:uppercase;">Mundial 2026</h2>
                <p style="font-family:'Sora', sans-serif;color:white;margin:0.5rem 0 0;text-transform:uppercase;letter-spacing:0.15em;font-size:0.8rem;font-weight:600;">Mi XI Ideal | Formacion ${this.currentFormation}</p>
            `;

            const bottomBar = documentObject.createElement('div');
            bottomBar.style.cssText = 'padding:1rem 2rem 1.5rem;text-align:center;background:linear-gradient(to top, rgba(0,0,0,0.6), transparent);margin-top:auto;';
            bottomBar.innerHTML = `
                <p style="font-family:'Sora', sans-serif;color:rgba(255,255,255,0.6);margin:0;text-transform:uppercase;letter-spacing:0.1em;font-size:0.7rem;">Creado con el Builder Oficial</p>
            `;

            frame.append(topBar, bottomBar);
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
