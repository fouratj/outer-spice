/**
 * PlanetTravelSystem - Handles smooth camera transitions between celestial bodies
 */

import * as THREE from 'three';
import { CAMERA_POSITIONS } from '../data/SolarSystemData.js';

export class PlanetTravelSystem {
  constructor(camera, sceneManager, navigationControls) {
    this.camera = camera;
    this.sceneManager = sceneManager;
    this.navigationControls = navigationControls;
    
    // Travel state
    this.isTransitioning = false;
    this.currentTarget = null;
    this.startPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.startLookAt = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    
    // Travel settings
    this.travelSpeed = 1.0; // Multiplier for travel speed
    this.transitionDuration = 3.0; // Base duration in seconds
    this.currentTransitionTime = 0;
    
    // Easing function
    this.easingFunction = this.easeInOutCubic;
  }

  /**
   * Travel to a specific celestial body
   */
  async travelTo(bodyName, speed = 1.0) {
    if (this.isTransitioning) {
      console.warn('Already transitioning to another target');
      return false;
    }

    const targetBody = this.sceneManager.getCelestialBody(bodyName);
    if (!targetBody) {
      console.error(`Celestial body '${bodyName}' not found`);
      return false;
    }

    console.log(`🚀 Starting travel to ${bodyName}`);

    // Pause navigation controls during travel
    if (this.navigationControls.setPaused) {
      this.navigationControls.setPaused(true);
    }

    // Set up transition
    this.isTransitioning = true;
    this.currentTarget = bodyName;
    this.travelSpeed = speed;
    this.currentTransitionTime = 0;

    // Store starting position and look direction
    this.startPosition.copy(this.camera.position);
    this.calculateLookDirection(this.startLookAt);

    // Calculate target position and look direction
    this.calculateTargetPosition(targetBody, bodyName);

    return new Promise((resolve) => {
      this.transitionResolve = resolve;
    });
  }

  /**
   * Calculate target camera position for a celestial body
   */
  calculateTargetPosition(targetBody, bodyName) {
    const bodyPosition = targetBody.getPosition();
    const bodyRadius = targetBody.getRadius ? targetBody.getRadius() : 1;

    // Get base camera configuration
    const cameraConfig = CAMERA_POSITIONS[bodyName] || { distance: 10, height: 3 };

    // Calculate distance based on planet radius for optimal viewing
    // Position camera close enough so planet fills significant portion of screen
    const radiusMultiplier = 2.5; // Much closer for better visibility
    const distance = Math.max(bodyRadius * radiusMultiplier, 1.0); // Minimum 1.0 units
    const height = bodyRadius * 0.5; // Lower height, more direct view

    // Calculate position offset from the body (better angle for viewing)
    const angle = Math.PI / 8; // 22.5 degrees - more direct view
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    const offset = new THREE.Vector3(x, height, z);
    this.targetPosition.copy(bodyPosition).add(offset);

    // Look at the celestial body
    this.targetLookAt.copy(bodyPosition);

    console.log(`📍 Camera position for ${bodyName}:`, {
      bodyRadius: bodyRadius.toFixed(4),
      distance: distance.toFixed(4),
      height: height.toFixed(4),
      bodyPosition: bodyPosition.toArray().map(v => v.toFixed(2)),
      targetPosition: this.targetPosition.toArray().map(v => v.toFixed(2)),
      distanceFromBody: this.targetPosition.distanceTo(bodyPosition).toFixed(4)
    });
  }

  /**
   * Calculate current look direction
   */
  calculateLookDirection(lookAt) {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    lookAt.copy(this.camera.position).add(direction.multiplyScalar(100));
  }

  /**
   * Update the travel system
   */
  update(deltaTime) {
    if (!this.isTransitioning) return;

    // Update transition time
    this.currentTransitionTime += deltaTime * this.travelSpeed;
    const duration = this.transitionDuration / this.travelSpeed;
    const progress = Math.min(this.currentTransitionTime / duration, 1.0);

    // Apply easing
    const easedProgress = this.easingFunction(progress);

    // Interpolate position
    const currentPosition = new THREE.Vector3().lerpVectors(
      this.startPosition,
      this.targetPosition,
      easedProgress
    );

    // Interpolate look direction
    const currentLookAt = new THREE.Vector3().lerpVectors(
      this.startLookAt,
      this.targetLookAt,
      easedProgress
    );

    // Update camera
    this.camera.position.copy(currentPosition);
    this.camera.lookAt(currentLookAt);

    // Update navigation controls to match camera orientation during transition
    // This ensures smooth synchronization throughout the animation
    if (this.navigationControls.euler) {
      const tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
      tempEuler.setFromQuaternion(this.camera.quaternion);
      this.navigationControls.euler.copy(tempEuler);
    }

    // Check if transition is complete
    if (progress >= 1.0) {
      this.completeTransition();
    }
  }

  /**
   * Complete the current transition
   */
  completeTransition() {
    this.isTransitioning = false;

    // Ensure final camera position and orientation are exactly as intended
    this.camera.position.copy(this.targetPosition);
    this.camera.lookAt(this.targetLookAt);

    // Reset navigation controls velocity to prevent drift
    if (this.navigationControls.resetVelocity) {
      this.navigationControls.resetVelocity();
    }

    // Ensure navigation controls euler angles match final camera orientation perfectly
    this.syncNavigationControlsToCamera();

    console.log(`✅ Arrived at ${this.currentTarget}`, {
      finalPosition: this.camera.position.toArray().map(v => v.toFixed(3)),
      finalEuler: [
        (this.navigationControls.euler.x * 180 / Math.PI).toFixed(2) + '°',
        (this.navigationControls.euler.y * 180 / Math.PI).toFixed(2) + '°',
        (this.navigationControls.euler.z * 180 / Math.PI).toFixed(2) + '°'
      ]
    });

    // Resume navigation controls after a longer delay to ensure stable camera position
    // This prevents any potential race conditions between the travel system and navigation controls
    setTimeout(() => {
      if (this.navigationControls.setPaused) {
        console.log(`🎮 Resuming navigation controls for ${this.currentTarget}`);
        this.navigationControls.setPaused(false);
      }
    }, 200); // Increased delay to 200ms for better stability

    if (this.transitionResolve) {
      this.transitionResolve(this.currentTarget);
      this.transitionResolve = null;
    }

    this.currentTarget = null;
  }

  /**
   * Cancel current transition
   */
  cancelTransition() {
    if (!this.isTransitioning) return;

    this.isTransitioning = false;
    console.log('🛑 Travel cancelled');

    // Resume navigation controls
    if (this.navigationControls.setPaused) {
      this.navigationControls.setPaused(false);
    }

    if (this.transitionResolve) {
      this.transitionResolve(null);
      this.transitionResolve = null;
    }

    this.currentTarget = null;
  }

  /**
   * Set travel speed multiplier
   */
  setTravelSpeed(speed) {
    this.travelSpeed = Math.max(0.1, Math.min(10.0, speed));
  }

  /**
   * Get current travel speed
   */
  getTravelSpeed() {
    return this.travelSpeed;
  }

  /**
   * Check if currently transitioning
   */
  getIsTransitioning() {
    return this.isTransitioning;
  }

  /**
   * Get current target
   */
  getCurrentTarget() {
    return this.currentTarget;
  }

  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress() {
    if (!this.isTransitioning) return 0;
    
    const duration = this.transitionDuration / this.travelSpeed;
    return Math.min(this.currentTransitionTime / duration, 1.0);
  }

  /**
   * Easing function: ease in-out cubic
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Easing function: ease in-out sine
   */
  easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  /**
   * Easing function: ease out expo
   */
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * Set easing function
   */
  setEasingFunction(easingName) {
    const easingFunctions = {
      'cubic': this.easeInOutCubic,
      'sine': this.easeInOutSine,
      'expo': this.easeOutExpo
    };
    
    if (easingFunctions[easingName]) {
      this.easingFunction = easingFunctions[easingName];
    }
  }

  /**
   * Get distance to target body
   */
  getDistanceToTarget() {
    if (!this.currentTarget) return 0;
    
    const targetBody = this.sceneManager.getCelestialBody(this.currentTarget);
    if (!targetBody) return 0;
    
    return this.camera.position.distanceTo(targetBody.getPosition());
  }

  /**
   * Synchronize navigation controls euler angles with current camera orientation
   */
  syncNavigationControlsToCamera() {
    if (!this.navigationControls.euler) return;

    // Extract euler angles directly from camera quaternion for perfect accuracy
    const tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    tempEuler.setFromQuaternion(this.camera.quaternion);

    // Copy the euler angles to navigation controls
    this.navigationControls.euler.copy(tempEuler);

    console.log(`🔄 Synced navigation controls to camera orientation:`, {
      eulerY: (this.navigationControls.euler.y * 180 / Math.PI).toFixed(2) + '°',
      eulerX: (this.navigationControls.euler.x * 180 / Math.PI).toFixed(2) + '°',
      eulerZ: (this.navigationControls.euler.z * 180 / Math.PI).toFixed(2) + '°'
    });
  }

  /**
   * Quick travel (instant teleport)
   */
  quickTravelTo(bodyName) {
    const targetBody = this.sceneManager.getCelestialBody(bodyName);
    if (!targetBody) {
      console.error(`Celestial body '${bodyName}' not found`);
      return false;
    }

    // Cancel any current transition
    this.cancelTransition();

    // Calculate target position
    this.calculateTargetPosition(targetBody, bodyName);

    // Instantly move camera
    this.camera.position.copy(this.targetPosition);
    this.camera.lookAt(this.targetLookAt);

    // Synchronize navigation controls with new camera orientation
    this.syncNavigationControlsToCamera();

    console.log(`⚡ Quick travel to ${bodyName}`);
    return true;
  }
}
