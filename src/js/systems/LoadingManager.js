/**
 * LoadingManager - Handles loading screen and progress tracking
 */

export class LoadingManager {
  constructor() {
    this.loadingScreen = null;
    this.progressFill = null;
    this.progressText = null;
    this.currentProgress = 0;
    this.isVisible = false;
  }

  /**
   * Initialize the loading manager
   */
  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    if (!this.loadingScreen || !this.progressFill || !this.progressText) {
      console.warn('Loading screen elements not found');
      return;
    }

    console.log('✅ LoadingManager initialized');
  }

  /**
   * Show the loading screen
   */
  show() {
    if (!this.loadingScreen) {
      this.init();
    }

    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'flex';
      this.loadingScreen.style.opacity = '1';
      this.isVisible = true;
    }
  }

  /**
   * Hide the loading screen with animation
   */
  async hide() {
    if (!this.loadingScreen || !this.isVisible) return;

    return new Promise(resolve => {
      this.loadingScreen.style.opacity = '0';

      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.style.display = 'none';
        }
        this.isVisible = false;
        resolve();
      }, 500); // Match CSS transition duration
    });
  }

  /**
   * Update loading progress
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Optional loading message
   */
  updateProgress(progress, message = '') {
    this.currentProgress = Math.max(0, Math.min(100, progress));

    if (this.progressFill) {
      this.progressFill.style.width = `${this.currentProgress}%`;
    }

    if (this.progressText) {
      this.progressText.textContent = `${Math.round(this.currentProgress)}%`;
    }

    // Update message if provided
    if (message) {
      const loadingContent = document.querySelector('.loading-content h2');
      if (loadingContent) {
        loadingContent.textContent = message;
      }
    }

    console.log(`📊 Loading progress: ${this.currentProgress}% - ${message}`);
  }

  /**
   * Get current progress
   */
  getProgress() {
    return this.currentProgress;
  }

  /**
   * Check if loading screen is visible
   */
  isLoading() {
    return this.isVisible;
  }
}
