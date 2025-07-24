/**
 * Solar System Explorer - Main Entry Point
 * A 3D interactive solar system with 6DoF controls and realistic/artistic modes
 */

import Stats from 'stats.js';

// Import application modules
import { SceneManager } from './js/systems/SceneManager.js';
import { NavigationControls } from './js/controls/NavigationControls.js';
import { UIManager } from './js/ui/UIManager.js';
import { LoadingManager } from './js/systems/LoadingManager.js';
import { ErrorHandler } from './js/systems/ErrorHandler.js';

/**
 * Main Application Class
 * Orchestrates all systems and manages the application lifecycle
 */
class SolarSystemApp {
  constructor() {
    this.container = null;
    this.sceneManager = null;
    this.navigationControls = null;
    this.uiManager = null;
    this.loadingManager = null;
    this.errorHandler = null;
    this.stats = null;

    // Application state
    this.isInitialized = false;
    this.isRunning = false;
    this.lastTime = 0;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Solar System Explorer...');

      // Check WebGL support
      if (!this.checkWebGLSupport()) {
        throw new Error('WebGL not supported');
      }

      // Initialize error handler first
      this.errorHandler = new ErrorHandler();

      // Initialize loading manager
      this.loadingManager = new LoadingManager();
      this.loadingManager.show();

      // Get container element
      this.container = document.getElementById('scene-container');
      if (!this.container) {
        throw new Error('Scene container not found');
      }

      // Initialize performance stats (development mode)
      if (import.meta.env.DEV) {
        this.initStats();
      }

      // Initialize core systems
      await this.initializeSystems();

      // Set up event listeners
      this.setupEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      console.log('✅ Solar System Explorer initialized successfully');

      // Hide loading screen and start the application
      await this.loadingManager.hide();
      this.start();
    } catch (error) {
      console.error('❌ Failed to initialize Solar System Explorer:', error);
      this.errorHandler?.showError(error.message);
    }
  }

  /**
   * Check if WebGL is supported
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const context =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!context;
    } catch {
      return false;
    }
  }

  /**
   * Initialize performance stats
   */
  initStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '0px';
    this.stats.dom.style.left = '0px';

    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
      statsContainer.appendChild(this.stats.dom);
    }
  }

  /**
   * Initialize all core systems
   */
  async initializeSystems() {
    // Update loading progress
    this.loadingManager.updateProgress(10, 'Initializing 3D scene...');

    // Initialize scene manager
    this.sceneManager = new SceneManager(this.container);
    await this.sceneManager.init();

    this.loadingManager.updateProgress(30, 'Setting up controls...');

    // Initialize navigation controls
    this.navigationControls = new NavigationControls(
      this.sceneManager.camera,
      this.container
    );
    this.navigationControls.init();

    this.loadingManager.updateProgress(50, 'Loading celestial bodies...');

    // Load solar system data and create celestial bodies
    await this.sceneManager.loadSolarSystem();

    this.loadingManager.updateProgress(70, 'Setting up travel system...');

    // Initialize planet travel system
    this.sceneManager.initializeTravelSystem(this.navigationControls);

    this.loadingManager.updateProgress(80, 'Initializing user interface...');

    // Initialize UI manager
    this.uiManager = new UIManager(this.sceneManager, this.navigationControls);
    this.uiManager.init();

    this.loadingManager.updateProgress(100, 'Ready to explore!');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', this.onWindowResize, false);

    // Visibility change (pause when tab is not active)
    document.addEventListener(
      'visibilitychange',
      this.onVisibilityChange,
      false
    );

    // Prevent context menu on right click
    this.container.addEventListener('contextmenu', event => {
      event.preventDefault();
    });
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    if (this.sceneManager) {
      this.sceneManager.onWindowResize();
    }
  }

  /**
   * Handle visibility change (pause/resume)
   */
  onVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Start the application
   */
  start() {
    if (!this.isInitialized) {
      console.warn('Cannot start app: not initialized');
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();

    console.log('🎮 Solar System Explorer started');
  }

  /**
   * Pause the application
   */
  pause() {
    this.isRunning = false;
    console.log('⏸️ Solar System Explorer paused');
  }

  /**
   * Resume the application
   */
  resume() {
    if (this.isInitialized && !this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animate();
      console.log('▶️ Solar System Explorer resumed');
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    if (!this.isRunning) return;

    // Request next frame
    requestAnimationFrame(this.animate);

    // Update stats
    if (this.stats) {
      this.stats.begin();
    }

    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update systems
    if (this.navigationControls) {
      this.navigationControls.update(deltaTime);
    }

    if (this.sceneManager) {
      this.sceneManager.update(deltaTime);
    }

    if (this.uiManager) {
      this.uiManager.update(deltaTime);
    }

    // Render the scene
    if (this.sceneManager) {
      this.sceneManager.render();
    }

    // Update stats
    if (this.stats) {
      this.stats.end();
    }
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose() {
    this.pause();

    if (this.sceneManager) {
      this.sceneManager.dispose();
    }

    if (this.navigationControls) {
      this.navigationControls.dispose();
    }

    if (this.uiManager) {
      this.uiManager.dispose();
    }

    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    console.log('🧹 Solar System Explorer disposed');
  }
}

/**
 * Application entry point
 */
async function main() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // Create and initialize the application
  const app = new SolarSystemApp();

  // Make app globally accessible for debugging
  if (import.meta.env.DEV) {
    window.solarSystemApp = app;
  }

  // Initialize the application
  await app.init();

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
}

// Start the application
main().catch(error => {
  console.error('💥 Fatal error starting Solar System Explorer:', error);

  // Show error screen
  const errorScreen = document.getElementById('error-screen');
  const loadingScreen = document.getElementById('loading-screen');

  if (errorScreen) {
    errorScreen.classList.remove('hidden');
  }

  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
});
