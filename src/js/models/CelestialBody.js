/**
 * CelestialBody - Represents planets, moons, and the sun with accurate properties
 */

import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { calculateHeliocentricPosition, calculateAstronomicalInfo, calculateVisibilityFromPosition } from '../utils/AstronomicalCalculations.js';
import { OrbitLine } from './OrbitLine.js';

export class CelestialBody {
  constructor(name, config) {
    this.name = name;
    this.config = config;

    // 3D objects
    this.mesh = null;
    this.group = new THREE.Group();
    this.rings = null; // For Saturn
    this.atmosphere = null; // For planets with atmospheres
    this.orbitLine = null; // Orbital path visualization

    // Physical properties (scaled for visualization)
    this.radius = config.radius || 1;
    this.mass = config.mass || 1;
    this.rotationPeriod = config.rotationPeriod || 24; // hours
    this.axialTilt = config.axialTilt || 0; // degrees

    // Orbital properties (scaled for visualization)
    this.semiMajorAxis = config.semiMajorAxis || 0;
    this.eccentricity = config.eccentricity || 0;
    this.inclination = config.inclination || 0;
    this.orbitalPeriod = config.orbitalPeriod || 365; // days
    this.meanAnomaly = config.meanAnomaly || 0;

    // Store original astronomical data for accurate calculations
    this.originalData = {
      semiMajorAxis: config.semiMajorAxis || 0, // AU for planets, km for moons
      eccentricity: config.eccentricity || 0,
      inclination: config.inclination || 0,
      orbitalPeriod: config.orbitalPeriod || 365,
      longitudeOfAscendingNode: config.longitudeOfAscendingNode || 0,
      longitudeOfPerihelion: config.longitudeOfPerihelion || 0,
      meanLongitude: config.meanLongitude || 0
    };

    // Current position from astronomical calculations
    this.currentPosition = config.currentPosition || { x: 0, y: 0, z: 0 };

    // Visual properties
    this.color = config.color || 0xffffff;
    this.emissive = config.emissive || 0x000000;
    this.emissiveIntensity = config.emissiveIntensity || 0;

    // Visibility and scaling properties
    this.currentVisibility = null;
    this.baseRadius = this.radius; // Store original radius
    this.currentMode = 'exploration'; // Default mode
    this.observerPosition = { x: 0, y: 0, z: 0 }; // Current observer position
    
    // Texture paths
    this.textures = {
      diffuse: config.textures?.diffuse || null,
      normal: config.textures?.normal || null,
      specular: config.textures?.specular || null,
      bump: config.textures?.bump || null,
      displacement: config.textures?.displacement || null
    };
    
    // Animation state
    this.currentRotation = 0;
    this.currentOrbitalAngle = 0;
    
    // Modes
    this.currentMode = 'realistic';
    this.isVisible = true;

    // Orbit line configuration
    this.orbitLineConfig = {
      visible: config.orbitLineVisible !== false, // Default to visible
      color: config.orbitLineColor || this.getOrbitLineColor(),
      opacity: config.orbitLineOpacity || 0.6,
      levelOfDetail: config.orbitLineLOD || 'medium'
    };

    // Note: create() must be called explicitly and awaited after construction
  }

  /**
   * Create the 3D representation of the celestial body
   */
  async create() {
    // Create geometry based on body type
    const segments = this.getGeometrySegments();
    const geometry = new THREE.SphereGeometry(this.radius, segments, segments);
    
    // Create material
    const material = await this.createMaterial();
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Set axial tilt
    this.mesh.rotation.z = THREE.MathUtils.degToRad(this.axialTilt);
    
    // Add to group
    this.group.add(this.mesh);
    
    // Create special features
    await this.createSpecialFeatures();
    
    // Set initial position using current astronomical data
    this.updateOrbitalPosition(0);
    
    console.log(`✅ Created celestial body: ${this.name}`);
  }

  /**
   * Get geometry segments based on importance and distance
   */
  getGeometrySegments() {
    // Higher detail for larger/more important bodies
    if (this.name === 'sun') return 64;
    if (this.name === 'earth') return 64;
    if (['jupiter', 'saturn'].includes(this.name)) return 48;
    if (['mars', 'venus', 'mercury'].includes(this.name)) return 32;
    return 24; // For moons and distant planets
  }

  /**
   * Create material based on textures and properties
   */
  async createMaterial() {
    const materialConfig = {
      color: 0xffffff, // Use white to avoid tinting textures
      emissive: this.emissive,
      emissiveIntensity: this.emissiveIntensity
    };

    // Try to load textures, fall back to procedural if they fail
    if (this.textures.diffuse) {
      try {
        console.log(`🔄 Attempting to load texture for ${this.name}: ${this.textures.diffuse}`);
        const textureLoader = new THREE.TextureLoader();
        materialConfig.map = await this.loadTexture(textureLoader, this.textures.diffuse);
        console.log(`✅ Successfully loaded diffuse texture for ${this.name}`);
        console.log(`📊 Texture details:`, {
          width: materialConfig.map.image?.width,
          height: materialConfig.map.image?.height,
          format: materialConfig.map.format,
          type: materialConfig.map.type
        });
      } catch (error) {
        console.error(`❌ Failed to load diffuse texture for ${this.name}:`, error);
        console.log(`🔄 Falling back to procedural texture for ${this.name}`);
        materialConfig.map = TextureGenerator.createPlanetTexture(this.name);
        // Use original color for fallback
        materialConfig.color = this.color;
      }
    } else {
      // Use procedural texture as default
      console.log(`📝 No diffuse texture configured for ${this.name}, using procedural`);
      materialConfig.map = TextureGenerator.createPlanetTexture(this.name);
      // Use original color for procedural texture
      materialConfig.color = this.color;
    }

    if (this.textures.normal) {
      try {
        const textureLoader = new THREE.TextureLoader();
        materialConfig.normalMap = await this.loadTexture(textureLoader, this.textures.normal);
        console.log(`✅ Loaded normal map for ${this.name}: ${this.textures.normal}`);
      } catch (error) {
        console.warn(`Failed to load normal texture for ${this.name}:`, error);
        materialConfig.normalMap = TextureGenerator.createNormalMap();
      }
    }

    if (this.textures.bump) {
      try {
        const textureLoader = new THREE.TextureLoader();
        materialConfig.bumpMap = await this.loadTexture(textureLoader, this.textures.bump);
        materialConfig.bumpScale = 0.1;
      } catch (error) {
        console.warn(`Failed to load bump texture for ${this.name}:`, error);
      }
    }

    // Use appropriate material type based on celestial body
    if (this.name === 'sun') {
      // Sun should emit light, use basic material
      return new THREE.MeshBasicMaterial(materialConfig);
    } else {
      // Temporarily use MeshBasicMaterial for debugging texture loading
      console.log(`🔧 Using MeshBasicMaterial for ${this.name} (debugging)`);
      return new THREE.MeshBasicMaterial(materialConfig);
    }
  }

  /**
   * Load texture with promise and optimization
   */
  loadTexture(loader, path) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          // Set wrapping mode for planet textures
          texture.wrapS = THREE.RepeatWrapping; // Horizontal wrapping for sphere
          texture.wrapT = THREE.ClampToEdgeWrapping; // Vertical clamping to avoid pole distortion

          // Enable anisotropic filtering for better quality at distance
          texture.anisotropy = 4; // Conservative value that works on most devices

          // Set appropriate filtering
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;

          // Generate mipmaps for better performance
          texture.generateMipmaps = true;

          // Flip Y coordinate for proper texture mapping
          texture.flipY = false;

          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Create special features like rings, atmospheres, etc.
   */
  async createSpecialFeatures() {
    // Saturn's rings
    if (this.name === 'saturn') {
      await this.createRings();
    }

    // Atmospheric glow for gas giants and Earth
    if (['earth', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
      this.createAtmosphere();
    }

    // Create orbit line for all bodies except the Sun
    this.createOrbitLine();
  }

  /**
   * Create Saturn's ring system
   */
  async createRings() {
    const ringConfig = this.config.rings || {};
    const innerRadius = this.radius * (ringConfig.innerRadius || 1.2);
    const outerRadius = this.radius * (ringConfig.outerRadius || 2.2);

    const ringGeometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      64 // Segments
    );

    let ringMaterial;

    if (ringConfig.texture) {
      try {
        const textureLoader = new THREE.TextureLoader();
        const ringTexture = await this.loadTexture(textureLoader, ringConfig.texture);

        ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
      } catch (error) {
        console.warn(`Failed to load ring texture for ${this.name}:`, error);
        ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xaaaaaa,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
      }
    } else {
      ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
    }

    this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
    this.rings.rotation.x = Math.PI / 2; // Rotate to horizontal
    this.group.add(this.rings);
  }

  /**
   * Create atmospheric glow effect
   */
  createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: this.getAtmosphereColor(),
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    
    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.group.add(this.atmosphere);
  }

  /**
   * Get atmosphere color based on planet
   */
  getAtmosphereColor() {
    const atmosphereColors = {
      earth: 0x87ceeb,
      jupiter: 0xffa500,
      saturn: 0xffff99,
      uranus: 0x00ffff,
      neptune: 0x0000ff
    };

    return atmosphereColors[this.name] || 0xffffff;
  }

  /**
   * Get orbit line color based on planet
   */
  getOrbitLineColor() {
    const orbitColors = {
      mercury: 0x8c7853,
      venus: 0xffc649,
      earth: 0x6b93d6,
      mars: 0xcd5c5c,
      jupiter: 0xd8ca9d,
      saturn: 0xfab27b,
      uranus: 0x4fd0e7,
      neptune: 0x4b70dd,
      moon: 0xaaaaaa
    };

    return orbitColors[this.name] || 0x666666;
  }

  /**
   * Create orbital path visualization
   */
  createOrbitLine() {
    // Skip orbit line creation for the Sun or bodies without orbits
    if (this.name === 'sun' || this.originalData.semiMajorAxis === 0) {
      return;
    }

    // Calculate scale factor for orbit line
    const scaleFactor = this.semiMajorAxis / this.originalData.semiMajorAxis;

    // Create orbit line configuration
    const orbitConfig = {
      color: this.orbitLineConfig.color,
      opacity: this.orbitLineConfig.opacity,
      scaleFactor: scaleFactor,
      visible: this.orbitLineConfig.visible,
      levelOfDetail: this.orbitLineConfig.levelOfDetail
    };

    // Create the orbit line
    this.orbitLine = new OrbitLine(this.name, this.originalData, orbitConfig);
    this.orbitLine.create();

    // Add to scene (orbit lines are independent of the celestial body group)
    // They will be added to the scene by the SceneManager
    console.log(`🛸 Created orbit line for ${this.name}`);
  }

  /**
   * Update the celestial body's rotation and orbital position
   */
  update(deltaTime, timeScale = 1) {
    // Update rotation
    const rotationSpeed = (2 * Math.PI) / (this.rotationPeriod * 3600); // rad/s
    this.currentRotation += rotationSpeed * deltaTime * timeScale;
    
    if (this.mesh) {
      this.mesh.rotation.y = this.currentRotation;
    }
    
    // Update rings rotation (slightly different speed)
    if (this.rings) {
      this.rings.rotation.z += rotationSpeed * deltaTime * timeScale * 0.5;
    }
    
    // Update orbital position if not the sun
    if (this.name !== 'sun' && this.semiMajorAxis > 0) {
      this.updateOrbitalPosition(deltaTime * timeScale);
    }
  }

  /**
   * Update orbital position using accurate Kepler's laws with elliptical orbits
   */
  updateOrbitalPosition(deltaTime = 0) {
    // Skip orbital calculations for the Sun
    if (this.name === 'sun' || this.originalData.semiMajorAxis === 0) {
      this.group.position.set(0, 0, 0);
      return;
    }

    // Calculate current position using real astronomical data
    const currentPos = calculateHeliocentricPosition(this.originalData);

    // Apply scaling for visualization
    const scaleFactor = this.semiMajorAxis / this.originalData.semiMajorAxis;

    // Set position with proper scaling
    this.group.position.set(
      currentPos.x * scaleFactor,
      currentPos.z * scaleFactor, // Use Z as Y for 3D visualization
      currentPos.y * scaleFactor  // Use Y as Z for 3D visualization
    );

    // Store current astronomical position for reference
    this.currentAstronomicalPosition = currentPos;
  }

  /**
   * Set visualization mode and update visibility
   */
  setMode(mode) {
    this.currentMode = mode;

    // Update visibility based on new mode
    this.updateVisibility();

    if (!this.mesh) return;

    if (mode === 'artistic') {
      // Enhanced visuals for artistic mode
      this.mesh.material.emissiveIntensity = this.emissiveIntensity * 2;
      this.mesh.material.wireframe = false;
      if (this.atmosphere) {
        this.atmosphere.material.opacity = 0.2;
      }
    } else if (mode === 'realistic') {
      // True realistic mode - minimal artificial enhancement
      this.mesh.material.emissiveIntensity = this.emissiveIntensity;
      this.mesh.material.wireframe = false;
      if (this.atmosphere) {
        this.atmosphere.material.opacity = 0.05; // Very faint atmosphere
      }
    } else {
      // Exploration mode - balanced visibility
      this.mesh.material.emissiveIntensity = Math.max(this.emissiveIntensity, 0.1);
      this.mesh.material.wireframe = false;
      if (this.atmosphere) {
        this.atmosphere.material.opacity = 0.1;
      }
    }

    // Update orbit line for the new mode
    this.updateOrbitLine(mode);
  }

  /**
   * Update visibility based on distance from observer
   */
  updateVisibility(observerPosition = null) {
    if (observerPosition) {
      this.observerPosition = observerPosition;
    }

    // Skip visibility calculations for the sun or if no observer position
    if (this.name === 'sun' || !this.originalData.semiMajorAxis) {
      this.currentVisibility = {
        visibilityLevel: 'bright',
        scaleFactor: 1.0,
        shouldRender: true,
        needsLabel: false
      };
      return;
    }

    // Calculate visibility from current observer position
    this.currentVisibility = calculateVisibilityFromPosition(
      this.originalData,
      this.observerPosition,
      this.currentMode
    );

    // Apply visibility scaling to the mesh
    if (this.mesh && this.currentVisibility) {
      const scaleFactor = this.currentVisibility.scaleFactor;

      if (this.currentMode === 'realistic') {
        // In realistic mode, apply distance-based scaling
        const newRadius = this.baseRadius * scaleFactor;
        this.mesh.scale.setScalar(newRadius / this.baseRadius);

        // Adjust opacity based on visibility
        if (this.mesh.material.opacity !== undefined) {
          this.mesh.material.opacity = Math.max(0.3, scaleFactor);
          this.mesh.material.transparent = scaleFactor < 1.0;
        }
      }

      // Set visibility
      this.group.visible = this.currentVisibility.shouldRender;
    }
  }

  /**
   * Enable debug mode (wireframe + enhanced visibility)
   */
  setDebugMode(enabled) {
    if (!this.mesh) return;

    if (enabled) {
      this.mesh.material.wireframe = true;
      this.mesh.material.emissiveIntensity = 0.5;
      this.mesh.material.color.setHex(0xffffff);
    } else {
      this.mesh.material.wireframe = false;
      this.mesh.material.emissiveIntensity = this.emissiveIntensity;
      this.mesh.material.color.setHex(this.color);
    }
  }

  /**
   * Get current position
   */
  getPosition() {
    return this.group.position.clone();
  }

  /**
   * Get radius
   */
  getRadius() {
    return this.radius;
  }

  /**
   * Get the Three.js group object
   */
  getObject3D() {
    return this.group;
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    this.isVisible = visible;
    this.group.visible = visible;
  }

  /**
   * Get distance from another celestial body
   */
  getDistanceFrom(otherBody) {
    return this.getPosition().distanceTo(otherBody.getPosition());
  }

  /**
   * Get current astronomical information
   */
  getAstronomicalInfo() {
    return calculateAstronomicalInfo(this.name, this.originalData);
  }

  /**
   * Set orbit line visibility
   */
  setOrbitLineVisible(visible) {
    this.orbitLineConfig.visible = visible;
    if (this.orbitLine) {
      this.orbitLine.setVisible(visible);
    }
  }

  /**
   * Get orbit line visibility
   */
  isOrbitLineVisible() {
    return this.orbitLineConfig.visible && this.orbitLine && this.orbitLine.isOrbitVisible();
  }

  /**
   * Get the orbit line object
   */
  getOrbitLine() {
    return this.orbitLine;
  }

  /**
   * Update orbit line for mode changes
   */
  updateOrbitLine(mode) {
    if (!this.orbitLine) return;

    // Adjust orbit line properties based on mode
    let opacity = this.orbitLineConfig.opacity;
    let levelOfDetail = this.orbitLineConfig.levelOfDetail;

    switch (mode) {
      case 'realistic':
        opacity = Math.max(0.3, this.orbitLineConfig.opacity * 0.5);
        levelOfDetail = 'low';
        break;
      case 'exploration':
        opacity = this.orbitLineConfig.opacity;
        levelOfDetail = 'medium';
        break;
      case 'artistic':
        opacity = Math.min(1.0, this.orbitLineConfig.opacity * 1.5);
        levelOfDetail = 'high';
        break;
    }

    this.orbitLine.setOpacity(opacity);
    this.orbitLine.setLevelOfDetail(levelOfDetail);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material.map) this.mesh.material.map.dispose();
      if (this.mesh.material.normalMap) this.mesh.material.normalMap.dispose();
      if (this.mesh.material.bumpMap) this.mesh.material.bumpMap.dispose();
      this.mesh.material.dispose();
    }

    if (this.rings) {
      this.rings.geometry.dispose();
      this.rings.material.dispose();
    }

    if (this.atmosphere) {
      this.atmosphere.geometry.dispose();
      this.atmosphere.material.dispose();
    }

    if (this.orbitLine) {
      this.orbitLine.dispose();
    }

    console.log(`🧹 Disposed celestial body: ${this.name}`);
  }
}
