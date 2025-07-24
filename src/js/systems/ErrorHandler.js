/**
 * ErrorHandler - Manages error display and logging
 */

export class ErrorHandler {
  constructor() {
    this.errorScreen = null;
    this.errorContent = null;
  }

  /**
   * Initialize the error handler
   */
  init() {
    this.errorScreen = document.getElementById('error-screen');
    this.errorContent = document.querySelector('.error-content');

    if (!this.errorScreen) {
      console.warn('Error screen element not found');
      return;
    }

    console.log('✅ ErrorHandler initialized');
  }

  /**
   * Show error screen with message
   * @param {string} message - Error message to display
   * @param {string} title - Optional error title
   */
  showError(message, title = '⚠️ Error') {
    if (!this.errorScreen) {
      this.init();
    }

    if (!this.errorScreen) {
      // Fallback to alert if no error screen
      alert(`${title}: ${message}`);
      return;
    }

    // Update error content
    if (this.errorContent) {
      const titleElement = this.errorContent.querySelector('h2');
      const messageElements = this.errorContent.querySelectorAll('p');

      if (titleElement) {
        titleElement.textContent = title;
      }

      if (messageElements.length > 0) {
        messageElements[0].textContent = message;
      }
    }

    // Hide loading screen if visible
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    // Show error screen
    this.errorScreen.classList.remove('hidden');

    console.error(`💥 Error displayed: ${title} - ${message}`);
  }

  /**
   * Hide error screen
   */
  hideError() {
    if (this.errorScreen) {
      this.errorScreen.classList.add('hidden');
    }
  }

  /**
   * Log error to console with formatting
   * @param {string} message - Error message
   * @param {Error} error - Optional error object
   */
  logError(message, error = null) {
    console.error(`❌ ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Log warning to console with formatting
   * @param {string} message - Warning message
   */
  logWarning(message) {
    console.warn(`⚠️ ${message}`);
  }
}
