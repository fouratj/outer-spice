/**
 * OrbitLine - Represents the orbital path of a celestial body
 * Creates a visual representation of the elliptical orbit using Three.js line geometry
 */

import * as THREE from 'three';
import { calculateOrbitalPosition, transformToEcliptic } from '../utils/AstronomicalCalculations.js';

export class OrbitLine {
  constructor(name, orbitalElements, config = {}) {
    this.name = name;
    this.orbitalElements = orbitalElements;
    this.config = config;

    // Visual properties
    this.color = config.color || 0x444444;
    this.opacity = config.opacity || 0.6;
    this.lineWidth = config.lineWidth || 1;
    this.segments = config.segments || 256; // Number of points to create smooth curve

    // Enhanced visual properties
    this.glowEffect = config.glowEffect !== false; // Default to enabled
    this.fadeWithDistance = config.fadeWithDistance !== false; // Default to enabled
    this.minOpacity = config.minOpacity || 0.1;
    this.maxOpacity = config.maxOpacity || 0.8;
    
    // Three.js objects
    this.line = null;
    this.geometry = null;
    this.material = null;
    
    // Scaling properties
    this.scaleFactor = config.scaleFactor || 1.0;
    this.isVisible = config.visible !== false; // Default to visible
    
    // Performance settings
    this.levelOfDetail = config.levelOfDetail || 'high'; // 'low', 'medium', 'high'
  }

  /**
   * Create the orbital line geometry and material
   */
  create() {
    // Skip orbit creation for the Sun or bodies without orbits
    if (this.name === 'sun' || this.orbitalElements.semiMajorAxis === 0) {
      console.log(`⚪ Skipping orbit creation for ${this.name} (no orbital motion)`);
      return;
    }

    console.log(`🔄 Creating orbit line for ${this.name}...`);

    // Calculate orbit points
    const orbitPoints = this.calculateOrbitPoints();
    
    if (orbitPoints.length === 0) {
      console.warn(`⚠️ No orbit points calculated for ${this.name}`);
      return;
    }

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(orbitPoints.length * 3);
    
    for (let i = 0; i < orbitPoints.length; i++) {
      const point = orbitPoints[i];
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material with enhanced styling
    this.material = new THREE.LineBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: this.opacity,
      linewidth: this.lineWidth,
      // Enhanced visual properties
      fog: true, // Respond to scene fog
      vertexColors: false,
      // Blending for better visual effect
      blending: THREE.AdditiveBlending,
      depthWrite: false, // Prevent z-fighting issues
      depthTest: true
    });

    // Create line object
    this.line = new THREE.Line(this.geometry, this.material);
    this.line.userData = { 
      type: 'orbitLine', 
      bodyName: this.name,
      isOrbitLine: true 
    };

    // Set initial visibility
    this.line.visible = this.isVisible;

    console.log(`✅ Created orbit line for ${this.name} with ${orbitPoints.length} points`);
  }

  /**
   * Calculate points along the orbital path
   */
  calculateOrbitPoints() {
    const points = [];
    const segments = this.getSegmentCount();
    
    // Calculate points around the complete orbit (0 to 360 degrees)
    for (let i = 0; i <= segments; i++) {
      const meanAnomaly = (i / segments) * 360; // degrees
      
      // Create temporary orbital elements with this mean anomaly
      const tempElements = {
        ...this.orbitalElements,
        meanLongitude: this.orbitalElements.longitudeOfPerihelion + meanAnomaly
      };
      
      try {
        // Calculate position in orbital plane
        const orbitalPos = calculateOrbitalPosition(tempElements);
        
        // Transform to ecliptic coordinates
        const eclipticPos = transformToEcliptic(orbitalPos, this.orbitalElements);
        
        // Apply scaling and coordinate system transformation
        // The coordinate system uses X-Z as horizontal plane, Y as vertical
        const scaledPoint = {
          x: eclipticPos.x * this.scaleFactor,
          y: eclipticPos.z * this.scaleFactor, // Z becomes Y (vertical)
          z: eclipticPos.y * this.scaleFactor  // Y becomes Z (depth)
        };
        
        points.push(scaledPoint);
      } catch (error) {
        console.warn(`⚠️ Error calculating orbit point ${i} for ${this.name}:`, error);
      }
    }
    
    return points;
  }

  /**
   * Get segment count based on level of detail and orbital characteristics
   */
  getSegmentCount() {
    let baseSegments = this.segments;
    
    // Adjust based on level of detail
    switch (this.levelOfDetail) {
      case 'low':
        baseSegments = Math.max(32, this.segments / 4);
        break;
      case 'medium':
        baseSegments = Math.max(64, this.segments / 2);
        break;
      case 'high':
      default:
        baseSegments = this.segments;
        break;
    }
    
    // Increase segments for highly eccentric orbits for better visual accuracy
    if (this.orbitalElements.eccentricity > 0.1) {
      baseSegments = Math.floor(baseSegments * (1 + this.orbitalElements.eccentricity));
    }
    
    return Math.min(baseSegments, 512); // Cap at 512 for performance
  }

  /**
   * Update the orbit line (for scaling changes, etc.)
   */
  update(newScaleFactor) {
    if (newScaleFactor !== undefined && newScaleFactor !== this.scaleFactor) {
      this.scaleFactor = newScaleFactor;
      this.recreate();
    }
  }

  /**
   * Recreate the orbit line with current parameters
   */
  recreate() {
    this.dispose();
    this.create();
  }

  /**
   * Set visibility of the orbit line
   */
  setVisible(visible) {
    this.isVisible = visible;
    if (this.line) {
      this.line.visible = visible;
    }
  }

  /**
   * Set the color of the orbit line
   */
  setColor(color) {
    this.color = color;
    if (this.material) {
      this.material.color.setHex(color);
    }
  }

  /**
   * Set the opacity of the orbit line
   */
  setOpacity(opacity) {
    this.opacity = opacity;
    if (this.material) {
      this.material.opacity = opacity;
    }
  }

  /**
   * Set level of detail for the orbit line
   */
  setLevelOfDetail(lod) {
    if (lod !== this.levelOfDetail) {
      this.levelOfDetail = lod;
      this.recreate();
    }
  }

  /**
   * Get the Three.js line object
   */
  getObject3D() {
    return this.line;
  }

  /**
   * Check if the orbit line is visible
   */
  isOrbitVisible() {
    return this.isVisible && this.line && this.line.visible;
  }

  /**
   * Get orbital information
   */
  getOrbitInfo() {
    return {
      name: this.name,
      semiMajorAxis: this.orbitalElements.semiMajorAxis,
      eccentricity: this.orbitalElements.eccentricity,
      inclination: this.orbitalElements.inclination,
      orbitalPeriod: this.orbitalElements.orbitalPeriod,
      scaleFactor: this.scaleFactor,
      segments: this.getSegmentCount(),
      isVisible: this.isVisible
    };
  }

  /**
   * Update orbit line based on camera distance for performance optimization
   */
  updateLevelOfDetail(cameraPosition) {
    if (!this.line || !cameraPosition) return;

    // Calculate distance from camera to orbit center (sun)
    const distanceToCenter = cameraPosition.length();

    // Calculate appropriate level of detail based on distance
    let newLOD = 'high';
    if (distanceToCenter > 1000) {
      newLOD = 'low';
    } else if (distanceToCenter > 100) {
      newLOD = 'medium';
    }

    // Update if LOD changed
    if (newLOD !== this.levelOfDetail) {
      this.setLevelOfDetail(newLOD);
    }

    // Update opacity based on distance if fade with distance is enabled
    if (this.fadeWithDistance && this.material) {
      const maxDistance = 500; // Distance at which orbit becomes fully transparent
      const fadeStart = 50; // Distance at which fading starts

      if (distanceToCenter > fadeStart) {
        const fadeProgress = Math.min(1, (distanceToCenter - fadeStart) / (maxDistance - fadeStart));
        const targetOpacity = this.opacity * (1 - fadeProgress * 0.7); // Fade to 30% of original opacity
        this.material.opacity = Math.max(this.minOpacity, targetOpacity);
      } else {
        this.material.opacity = Math.min(this.maxOpacity, this.opacity);
      }
    }
  }

  /**
   * Optimize orbit line for performance
   */
  optimizeForPerformance() {
    if (!this.line) return;

    // Use simpler blending for better performance
    if (this.material) {
      this.material.blending = THREE.NormalBlending;
      this.material.depthWrite = true;
    }

    // Reduce segments for distant orbits
    if (this.orbitalElements.semiMajorAxis > 10) { // For outer planets
      this.levelOfDetail = 'low';
      this.recreate();
    }
  }

  /**
   * Enable high-quality rendering
   */
  enableHighQuality() {
    if (!this.material) return;

    // Use additive blending for glow effect
    this.material.blending = THREE.AdditiveBlending;
    this.material.depthWrite = false;

    // Increase segments for smoother curves
    this.levelOfDetail = 'high';
    this.recreate();
  }

  /**
   * Dispose of resources
   */
  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    
    this.line = null;
    
    console.log(`🧹 Disposed orbit line for ${this.name}`);
  }
}
