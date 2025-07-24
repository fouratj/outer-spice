/**
 * TelescopeSystem - Implements telescopic zoom and enhanced visibility for distant objects
 * Allows viewing of planets that would be invisible at true astronomical distances
 */

import * as THREE from 'three';

export class TelescopeSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    
    // Telescope properties
    this.isTelescopeMode = false;
    this.zoomLevel = 1.0;
    this.maxZoom = 1000.0; // 1000x magnification
    this.minZoom = 1.0;
    this.zoomStep = 1.5;
    
    // Target tracking
    this.targetObject = null;
    this.isTracking = false;
    
    // Original camera properties
    this.originalFOV = camera.fov;
    this.originalNear = camera.near;
    this.originalFar = camera.far;
    
    // Enhanced visibility for distant objects
    this.enhancedVisibilityObjects = new Map();
    this.originalMaterials = new Map();
    
    // UI elements for telescope mode
    this.telescopeUI = null;
    this.crosshairs = null;
    
    this.setupTelescopeUI();
  }

  /**
   * Setup telescope UI elements
   */
  setupTelescopeUI() {
    // Create crosshairs for telescope mode
    const crosshairGeometry = new THREE.BufferGeometry();
    const crosshairMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.7 
    });
    
    // Create crosshair lines
    const crosshairVertices = new Float32Array([
      -0.02, 0, 0,  0.02, 0, 0,  // Horizontal line
      0, -0.02, 0,  0, 0.02, 0   // Vertical line
    ]);
    
    crosshairGeometry.setAttribute('position', new THREE.BufferAttribute(crosshairVertices, 3));
    this.crosshairs = new THREE.LineSegments(crosshairGeometry, crosshairMaterial);
    this.crosshairs.visible = false;
    
    // Position crosshairs in front of camera
    this.crosshairs.position.set(0, 0, -1);
    this.camera.add(this.crosshairs);
  }

  /**
   * Toggle telescope mode
   */
  toggleTelescopeMode() {
    this.isTelescopeMode = !this.isTelescopeMode;
    
    if (this.isTelescopeMode) {
      this.enterTelescopeMode();
    } else {
      this.exitTelescopeMode();
    }
    
    console.log(`🔭 Telescope mode: ${this.isTelescopeMode ? 'ON' : 'OFF'}`);
    return this.isTelescopeMode;
  }

  /**
   * Enter telescope mode
   */
  enterTelescopeMode() {
    // Show crosshairs
    this.crosshairs.visible = true;
    
    // Adjust camera for telescopic viewing
    this.camera.fov = this.originalFOV / this.zoomLevel;
    this.camera.updateProjectionMatrix();
    
    // Enable enhanced visibility for distant objects
    this.enableEnhancedVisibility();
    
    // Add telescope mode indicator to scene
    this.showTelescopeUI();
  }

  /**
   * Exit telescope mode
   */
  exitTelescopeMode() {
    // Hide crosshairs
    this.crosshairs.visible = false;
    
    // Reset camera
    this.camera.fov = this.originalFOV;
    this.camera.updateProjectionMatrix();
    
    // Reset zoom
    this.zoomLevel = 1.0;
    
    // Disable enhanced visibility
    this.disableEnhancedVisibility();
    
    // Stop tracking
    this.stopTracking();
    
    // Hide telescope UI
    this.hideTelescopeUI();
  }

  /**
   * Zoom in (increase magnification)
   */
  zoomIn() {
    if (!this.isTelescopeMode) return;
    
    this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel * this.zoomStep);
    this.updateZoom();
    
    console.log(`🔍 Zoom: ${this.zoomLevel.toFixed(1)}x`);
  }

  /**
   * Zoom out (decrease magnification)
   */
  zoomOut() {
    if (!this.isTelescopeMode) return;
    
    this.zoomLevel = Math.max(this.minZoom, this.zoomLevel / this.zoomStep);
    this.updateZoom();
    
    console.log(`🔍 Zoom: ${this.zoomLevel.toFixed(1)}x`);
  }

  /**
   * Update camera zoom
   */
  updateZoom() {
    this.camera.fov = this.originalFOV / this.zoomLevel;
    this.camera.updateProjectionMatrix();
    
    // Update enhanced visibility based on zoom level
    this.updateEnhancedVisibility();
  }

  /**
   * Track a specific object
   */
  trackObject(object) {
    this.targetObject = object;
    this.isTracking = true;
    
    console.log(`🎯 Tracking: ${object.name || 'Unknown object'}`);
  }

  /**
   * Stop tracking current object
   */
  stopTracking() {
    this.targetObject = null;
    this.isTracking = false;
    
    console.log(`🎯 Tracking stopped`);
  }

  /**
   * Update tracking (call in animation loop)
   */
  updateTracking() {
    if (!this.isTracking || !this.targetObject) return;
    
    // Point camera at target object
    this.camera.lookAt(this.targetObject.position);
  }

  /**
   * Enable enhanced visibility for distant objects
   */
  enableEnhancedVisibility() {
    this.scene.traverse((object) => {
      if (object.userData && object.userData.isPlanet) {
        this.enhanceObjectVisibility(object);
      }
    });
  }

  /**
   * Disable enhanced visibility
   */
  disableEnhancedVisibility() {
    this.enhancedVisibilityObjects.forEach((enhancedData, object) => {
      this.restoreObjectVisibility(object, enhancedData);
    });
    
    this.enhancedVisibilityObjects.clear();
  }

  /**
   * Enhance visibility of a specific object
   */
  enhanceObjectVisibility(object) {
    if (this.enhancedVisibilityObjects.has(object)) return;
    
    // Store original properties
    const originalData = {
      scale: object.scale.clone(),
      material: object.material ? object.material.clone() : null,
      visible: object.visible
    };
    
    this.enhancedVisibilityObjects.set(object, originalData);
    
    // Apply enhancements
    if (object.material) {
      // Increase emissive intensity for better visibility
      object.material.emissiveIntensity = Math.max(
        object.material.emissiveIntensity || 0, 
        0.2
      );
      
      // Add slight glow effect
      object.material.transparent = true;
      object.material.opacity = Math.max(object.material.opacity || 1.0, 0.8);
    }
    
    // Make object visible if it was hidden due to distance
    object.visible = true;
  }

  /**
   * Restore original visibility of an object
   */
  restoreObjectVisibility(object, originalData) {
    if (originalData.material && object.material) {
      object.material.copy(originalData.material);
    }
    
    object.scale.copy(originalData.scale);
    object.visible = originalData.visible;
  }

  /**
   * Update enhanced visibility based on zoom level
   */
  updateEnhancedVisibility() {
    const enhancementFactor = Math.log10(this.zoomLevel + 1);
    
    this.enhancedVisibilityObjects.forEach((originalData, object) => {
      if (object.material) {
        // Increase visibility with zoom level
        const emissiveBoost = enhancementFactor * 0.1;
        object.material.emissiveIntensity = Math.min(
          (originalData.material?.emissiveIntensity || 0) + emissiveBoost,
          1.0
        );
      }
    });
  }

  /**
   * Show telescope UI
   */
  showTelescopeUI() {
    // This would integrate with the main UI system
    // For now, just log the telescope status
    console.log('🔭 Telescope UI: Showing zoom controls and object finder');
  }

  /**
   * Hide telescope UI
   */
  hideTelescopeUI() {
    console.log('🔭 Telescope UI: Hidden');
  }

  /**
   * Get telescope status information
   */
  getStatus() {
    return {
      isActive: this.isTelescopeMode,
      zoomLevel: this.zoomLevel,
      isTracking: this.isTracking,
      targetObject: this.targetObject?.name || null,
      fov: this.camera.fov
    };
  }

  /**
   * Find and track nearest visible planet
   */
  findNearestPlanet() {
    if (!this.isTelescopeMode) return null;
    
    let nearestPlanet = null;
    let nearestDistance = Infinity;
    
    this.scene.traverse((object) => {
      if (object.userData && object.userData.isPlanet) {
        const distance = this.camera.position.distanceTo(object.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlanet = object;
        }
      }
    });
    
    if (nearestPlanet) {
      this.trackObject(nearestPlanet);
      console.log(`🔍 Found nearest planet: ${nearestPlanet.name} at distance ${nearestDistance.toFixed(2)}`);
    }
    
    return nearestPlanet;
  }

  /**
   * Cleanup telescope system
   */
  dispose() {
    this.exitTelescopeMode();
    
    if (this.crosshairs) {
      this.camera.remove(this.crosshairs);
      this.crosshairs.geometry.dispose();
      this.crosshairs.material.dispose();
    }
    
    this.enhancedVisibilityObjects.clear();
    this.originalMaterials.clear();
  }
}
