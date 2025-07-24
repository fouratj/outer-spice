/**
 * DistantObjectIndicators - Visual indicators for planets too distant to see clearly
 * Provides labels, direction arrows, and enhanced visibility for astronomical accuracy
 */

import * as THREE from 'three';

export class DistantObjectIndicators {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Indicator objects
    this.indicators = new Map();
    this.labelGroup = new THREE.Group();
    this.arrowGroup = new THREE.Group();
    
    // Settings
    this.maxIndicatorDistance = 1000; // Maximum distance to show indicators
    this.minVisibilityThreshold = 0.1; // Minimum visibility to show object normally
    this.labelDistance = 50; // Distance from camera to place labels
    
    // Materials
    this.labelMaterial = new THREE.SpriteMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    this.arrowMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6
    });
    
    this.distantPlanetMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    // Add groups to scene
    this.scene.add(this.labelGroup);
    this.scene.add(this.arrowGroup);
    
    // Canvas for text rendering
    this.textCanvas = document.createElement('canvas');
    this.textContext = this.textCanvas.getContext('2d');
    this.textCanvas.width = 256;
    this.textCanvas.height = 64;
  }

  /**
   * Update indicators for all celestial bodies
   */
  updateIndicators(celestialBodies, mode = 'exploration') {
    // Clear existing indicators
    this.clearIndicators();
    
    if (mode !== 'realistic') {
      // Only show indicators in realistic mode
      return;
    }
    
    celestialBodies.forEach((body, name) => {
      if (name === 'sun') return; // Skip sun
      
      this.updateBodyIndicator(body, name);
    });
  }

  /**
   * Update indicator for a specific celestial body
   */
  updateBodyIndicator(body, name) {
    const bodyPosition = body.getPosition();
    const distance = this.camera.position.distanceTo(bodyPosition);
    
    // Get visibility information
    const visibility = body.currentVisibility;
    
    if (!visibility) return;
    
    // Determine if we need indicators
    const needsIndicator = visibility.visibilityLevel === 'faint' || 
                          visibility.visibilityLevel === 'telescopic' ||
                          visibility.visibilityLevel === 'invisible';
    
    if (needsIndicator) {
      this.createIndicator(body, name, distance, visibility);
    }
  }

  /**
   * Create visual indicator for a distant object
   */
  createIndicator(body, name, distance, visibility) {
    const bodyPosition = body.getPosition();
    
    // Create direction arrow
    this.createDirectionArrow(bodyPosition, name, distance);
    
    // Create distance label
    this.createDistanceLabel(bodyPosition, name, distance, visibility);
    
    // Create enhanced dot for very distant objects
    if (visibility.visibilityLevel === 'invisible') {
      this.createEnhancedDot(bodyPosition, name);
    }
  }

  /**
   * Create direction arrow pointing to distant object
   */
  createDirectionArrow(targetPosition, name, distance) {
    // Calculate direction from camera to target
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.camera.position)
      .normalize();
    
    // Position arrow at fixed distance from camera
    const arrowPosition = new THREE.Vector3()
      .copy(this.camera.position)
      .add(direction.clone().multiplyScalar(this.labelDistance * 0.8));
    
    // Create arrow geometry
    const arrowGeometry = new THREE.BufferGeometry();
    const arrowVertices = new Float32Array([
      0, 0, 0,  // Start point
      2, 0, 0,  // End point
      1.5, 0.5, 0,  // Arrow head top
      2, 0, 0,  // Back to end
      1.5, -0.5, 0  // Arrow head bottom
    ]);
    
    arrowGeometry.setAttribute('position', new THREE.BufferAttribute(arrowVertices, 3));
    
    const arrow = new THREE.Line(arrowGeometry, this.arrowMaterial.clone());
    arrow.position.copy(arrowPosition);
    arrow.lookAt(targetPosition);
    arrow.userData = { type: 'arrow', target: name };
    
    this.arrowGroup.add(arrow);
    this.indicators.set(`arrow_${name}`, arrow);
  }

  /**
   * Create distance label for distant object
   */
  createDistanceLabel(targetPosition, name, distance, visibility) {
    // Create text texture
    const texture = this.createTextTexture(name, distance, visibility);
    
    // Create sprite
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Position label between camera and target
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.camera.position)
      .normalize();
    
    const labelPosition = new THREE.Vector3()
      .copy(this.camera.position)
      .add(direction.clone().multiplyScalar(this.labelDistance));
    
    sprite.position.copy(labelPosition);
    sprite.scale.set(10, 3, 1); // Adjust size as needed
    sprite.userData = { type: 'label', target: name };
    
    this.labelGroup.add(sprite);
    this.indicators.set(`label_${name}`, sprite);
  }

  /**
   * Create enhanced dot for invisible objects
   */
  createEnhancedDot(targetPosition, name) {
    const dotGeometry = new THREE.SphereGeometry(0.5, 8, 6);
    const dotMaterial = this.distantPlanetMaterial.clone();
    
    // Color code by planet type
    const planetColors = {
      mercury: 0x8c7853,
      venus: 0xffc649,
      mars: 0xcd5c5c,
      jupiter: 0xd8ca9d,
      saturn: 0xfab27b,
      uranus: 0x4fd0e7,
      neptune: 0x4b70dd
    };
    
    dotMaterial.color.setHex(planetColors[name] || 0xffffff);
    
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.copy(targetPosition);
    dot.userData = { type: 'enhancedDot', target: name, originalBody: true };
    
    this.scene.add(dot);
    this.indicators.set(`dot_${name}`, dot);
  }

  /**
   * Create text texture for labels
   */
  createTextTexture(name, distance, visibility) {
    const canvas = this.textCanvas;
    const context = this.textContext;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set font and style
    context.font = '16px Arial';
    context.fillStyle = '#00ff00';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw planet name
    const planetName = name.charAt(0).toUpperCase() + name.slice(1);
    context.fillText(planetName, canvas.width / 2, canvas.height / 2 - 8);
    
    // Draw distance and visibility info
    context.font = '12px Arial';
    context.fillStyle = '#88ff88';
    
    const distanceText = distance > 1000 ? 
      `${(distance / 1000).toFixed(1)}k units` : 
      `${distance.toFixed(0)} units`;
    
    const visibilityText = visibility.visibilityLevel === 'invisible' ? 
      'Invisible' : 
      `Mag: ${visibility.apparentMagnitude?.toFixed(1) || 'N/A'}`;
    
    context.fillText(`${distanceText} - ${visibilityText}`, canvas.width / 2, canvas.height / 2 + 8);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }

  /**
   * Clear all indicators
   */
  clearIndicators() {
    // Remove arrows
    this.arrowGroup.children.forEach(arrow => {
      arrow.geometry.dispose();
      arrow.material.dispose();
    });
    this.arrowGroup.clear();
    
    // Remove labels
    this.labelGroup.children.forEach(label => {
      if (label.material.map) {
        label.material.map.dispose();
      }
      label.material.dispose();
    });
    this.labelGroup.clear();
    
    // Remove enhanced dots
    this.indicators.forEach((indicator, key) => {
      if (key.startsWith('dot_')) {
        this.scene.remove(indicator);
        indicator.geometry.dispose();
        indicator.material.dispose();
      }
    });
    
    this.indicators.clear();
  }

  /**
   * Update indicator positions (call in animation loop)
   */
  updatePositions() {
    // Update label and arrow positions to face camera
    this.labelGroup.children.forEach(label => {
      label.lookAt(this.camera.position);
    });
    
    // Update arrow orientations
    this.arrowGroup.children.forEach(arrow => {
      // Arrows should point toward their targets
      // This would need target position tracking
    });
  }

  /**
   * Set indicator visibility
   */
  setVisible(visible) {
    this.labelGroup.visible = visible;
    this.arrowGroup.visible = visible;
    
    this.indicators.forEach((indicator, key) => {
      if (key.startsWith('dot_')) {
        indicator.visible = visible;
      }
    });
  }

  /**
   * Get indicator for specific object
   */
  getIndicator(name, type = 'label') {
    return this.indicators.get(`${type}_${name}`);
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    this.clearIndicators();
    
    // Remove groups from scene
    this.scene.remove(this.labelGroup);
    this.scene.remove(this.arrowGroup);
    
    // Dispose materials
    this.labelMaterial.dispose();
    this.arrowMaterial.dispose();
    this.distantPlanetMaterial.dispose();
  }
}
