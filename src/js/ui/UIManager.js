/**
 * UIManager - Manages user interface interactions and updates
 */

export class UIManager {
  constructor(sceneManager, navigationControls) {
    this.sceneManager = sceneManager;
    this.navigationControls = navigationControls;

    // UI elements
    this.modeToggle = null;
    this.speedSlider = null;
    this.speedValue = null;
    this.planetButtons = null;
    this.helpToggle = null;
    this.helpPanel = null;
    this.infoPanel = null;
    this.currentTarget = null;
    this.targetInfo = null;

    // State
    this.currentMode = 'realistic';
    this.isHelpVisible = false;
    this.selectedPlanet = null;
    this.debugMode = false;

    // Bind methods
    this.onModeToggle = this.onModeToggle.bind(this);
    this.onSpeedChange = this.onSpeedChange.bind(this);
    this.onPlanetSelect = this.onPlanetSelect.bind(this);
    this.onHelpToggle = this.onHelpToggle.bind(this);
  }

  /**
   * Initialize the UI manager
   */
  init() {
    this.setupElements();
    this.setupEventListeners();
    this.updateUI();

    console.log('✅ UIManager initialized');
  }

  /**
   * Set up UI element references
   */
  setupElements() {
    // Mode toggle
    this.modeToggle = document.getElementById('mode-toggle');

    // Speed controls
    this.speedSlider = document.getElementById('speed-slider');
    this.speedValue = document.getElementById('speed-value');

    // Planet buttons
    this.planetButtons = document.querySelectorAll('.planet-button');

    // Help panel
    this.helpToggle = document.getElementById('help-toggle');
    this.helpPanel = document.getElementById('help-panel');

    // Info panel
    this.infoPanel = document.getElementById('info-panel');
    this.currentTarget = document.getElementById('current-target');
    this.targetInfo = document.getElementById('target-info');

    // Check if all elements are found
    const elements = [
      this.modeToggle,
      this.speedSlider,
      this.speedValue,
      this.helpToggle,
      this.helpPanel,
      this.infoPanel,
      this.currentTarget,
      this.targetInfo,
    ];

    const missingElements = elements.filter(el => !el);
    if (missingElements.length > 0) {
      console.warn('Some UI elements not found:', missingElements);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Mode toggle
    if (this.modeToggle) {
      this.modeToggle.addEventListener('click', this.onModeToggle);
    }

    // Speed slider
    if (this.speedSlider) {
      this.speedSlider.addEventListener('input', this.onSpeedChange);
    }

    // Planet buttons
    this.planetButtons.forEach(button => {
      button.addEventListener('click', this.onPlanetSelect);
    });

    // Help toggle
    if (this.helpToggle) {
      this.helpToggle.addEventListener('click', this.onHelpToggle);
    }
  }

  /**
   * Handle mode toggle
   */
  async onModeToggle() {
    // Check if traveling - don't allow mode switch during travel
    const travelSystem = this.sceneManager.getPlanetTravelSystem();
    if (travelSystem && travelSystem.isTransitioning) {
      console.log(`⚠️ Cannot switch modes while traveling`);
      this.showNotification('Cannot switch modes while traveling', 'warning');
      return;
    }

    this.currentMode =
      this.currentMode === 'realistic' ? 'artistic' : 'realistic';

    // Show loading state
    if (this.modeToggle) {
      this.modeToggle.disabled = true;
      this.modeToggle.textContent = 'Switching...';
    }

    try {
      // Update scene manager
      await this.sceneManager.setVisualizationMode(this.currentMode);

      // Update UI
      this.updateModeToggle();

      console.log(`🎨 Mode switched to: ${this.currentMode}`);
    } catch (error) {
      console.error('Failed to switch mode:', error);
      this.showNotification('Failed to switch visualization mode', 'error');
    } finally {
      // Re-enable button
      if (this.modeToggle) {
        this.modeToggle.disabled = false;
      }
    }
  }

  /**
   * Handle speed change
   */
  onSpeedChange() {
    if (!this.speedSlider || !this.speedValue) return;

    const speed = parseFloat(this.speedSlider.value);

    // Update navigation controls
    this.navigationControls.setMoveSpeed(speed * 10); // Scale for better feel

    // Update display
    this.speedValue.textContent = `${speed.toFixed(1)}x`;

    console.log(`🚀 Speed changed to: ${speed}x`);
  }

  /**
   * Handle planet selection
   */
  async onPlanetSelect(event) {
    // Prevent event bubbling and multiple handling
    event.preventDefault();
    event.stopPropagation();

    console.log(`🔍 Planet button clicked:`, event.target.dataset.planet);

    const planetName = event.target.dataset.planet;
    if (!planetName) return;

    // Check if already traveling
    const travelSystem = this.sceneManager.getPlanetTravelSystem();
    if (travelSystem && travelSystem.isTransitioning) {
      console.log(`⚠️ Already traveling to ${travelSystem.getCurrentTarget()}, ignoring click on ${planetName}`);
      return;
    }

    this.selectedPlanet = planetName;

    // Update info panel
    this.updateInfoPanel(planetName);

    // Disable all planet buttons during travel
    this.setButtonsEnabled(false);

    console.log(`🪐 Starting travel to: ${planetName}`);

    // Travel to the selected planet
    if (travelSystem) {
      const speed = this.speedSlider ? parseFloat(this.speedSlider.value) : 1.0;

      try {
        await this.sceneManager.travelTo(planetName, speed);
        this.showNotification(`Arrived at ${planetName}`, 'success');
        console.log(`✅ Successfully arrived at ${planetName}`);
      } catch (error) {
        console.error('Travel failed:', error);
        this.showNotification(`Failed to travel to ${planetName}`, 'error');
      } finally {
        // Re-enable buttons after travel
        this.setButtonsEnabled(true);
      }
    }
  }

  /**
   * Handle help toggle
   */
  onHelpToggle() {
    this.isHelpVisible = !this.isHelpVisible;

    if (this.helpPanel) {
      if (this.isHelpVisible) {
        this.helpPanel.classList.remove('collapsed');
      } else {
        this.helpPanel.classList.add('collapsed');
      }
    }

    console.log(`❓ Help panel ${this.isHelpVisible ? 'shown' : 'hidden'}`);
  }

  /**
   * Update mode toggle appearance
   */
  updateModeToggle() {
    if (!this.modeToggle) return;

    const icon = this.modeToggle.querySelector('.mode-icon');
    const text = this.modeToggle.querySelector('.mode-text');

    if (this.currentMode === 'realistic') {
      this.modeToggle.className = 'mode-button realistic';
      if (icon) icon.textContent = '🔬';
      if (text) text.textContent = 'Realistic';
    } else {
      this.modeToggle.className = 'mode-button artistic';
      if (icon) icon.textContent = '🎨';
      if (text) text.textContent = 'Artistic';
    }
  }

  /**
   * Update info panel with planet information
   */
  updateInfoPanel(planetName) {
    if (!this.currentTarget || !this.targetInfo) return;

    // Planet data (simplified for now)
    const planetData = {
      sun: {
        name: 'The Sun',
        info: 'Our star - the center of the solar system. A massive ball of hot plasma held together by gravity.',
      },
      mercury: {
        name: 'Mercury',
        info: 'The smallest planet and closest to the Sun. Extreme temperature variations.',
      },
      venus: {
        name: 'Venus',
        info: 'The hottest planet with a thick, toxic atmosphere. Often called Earth\'s twin.',
      },
      earth: {
        name: 'Earth',
        info: 'Our home planet. The only known planet with life in the universe.',
      },
      mars: {
        name: 'Mars',
        info: 'The Red Planet. Has the largest volcano and canyon in the solar system.',
      },
      jupiter: {
        name: 'Jupiter',
        info: 'The largest planet. A gas giant with a Great Red Spot storm.',
      },
      saturn: {
        name: 'Saturn',
        info: 'Famous for its beautiful ring system. A gas giant less dense than water.',
      },
      uranus: {
        name: 'Uranus',
        info: 'An ice giant that rotates on its side. Has a faint ring system.',
      },
      neptune: {
        name: 'Neptune',
        info: 'The windiest planet with speeds up to 2,100 km/h. Deep blue color.',
      },
    };

    const data = planetData[planetName];
    if (data) {
      this.currentTarget.textContent = data.name;
      this.targetInfo.innerHTML = `<p>${data.info}</p>`;
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    this.updateModeToggle();

    // Set initial speed value
    if (this.speedSlider && this.speedValue) {
      const speed = parseFloat(this.speedSlider.value);
      this.speedValue.textContent = `${speed.toFixed(1)}x`;
    }
  }

  /**
   * Update method called from main loop
   */
  update(_deltaTime) {
    // Update travel progress if traveling
    const travelSystem = this.sceneManager.getPlanetTravelSystem();
    if (travelSystem && travelSystem.isTransitioning) {
      const progress = travelSystem.getTransitionProgress();
      const target = travelSystem.getCurrentTarget();

      if (target && this.currentTarget) {
        this.currentTarget.textContent = `Traveling to ${target}... ${Math.round(progress * 100)}%`;
      }
    }
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    // TODO: Implement notification system
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
  }

  /**
   * Get current visualization mode
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Get selected planet
   */
  getSelectedPlanet() {
    return this.selectedPlanet;
  }

  /**
   * Enable/disable planet buttons
   */
  setButtonsEnabled(enabled) {
    this.planetButtons.forEach(button => {
      button.disabled = !enabled;
      if (enabled) {
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      } else {
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      }
    });
  }

  /**
   * Dispose of the UI manager
   */
  dispose() {
    // Remove event listeners
    if (this.modeToggle) {
      this.modeToggle.removeEventListener('click', this.onModeToggle);
    }

    if (this.speedSlider) {
      this.speedSlider.removeEventListener('input', this.onSpeedChange);
    }

    this.planetButtons.forEach(button => {
      button.removeEventListener('click', this.onPlanetSelect);
    });

    if (this.helpToggle) {
      this.helpToggle.removeEventListener('click', this.onHelpToggle);
    }

    console.log('🧹 UIManager disposed');
  }
}
