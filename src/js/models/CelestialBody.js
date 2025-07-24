/**
 * CelestialBody - Represents planets, moons, and the sun with accurate properties
 */

import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class CelestialBody {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    
    // 3D objects
    this.mesh = null;
    this.group = new THREE.Group();
    this.rings = null; // For Saturn
    this.atmosphere = null; // For planets with atmospheres
    
    // Physical properties
    this.radius = config.radius || 1;
    this.mass = config.mass || 1;
    this.rotationPeriod = config.rotationPeriod || 24; // hours
    this.axialTilt = config.axialTilt || 0; // degrees
    
    // Orbital properties
    this.semiMajorAxis = config.semiMajorAxis || 0;
    this.eccentricity = config.eccentricity || 0;
    this.inclination = config.inclination || 0;
    this.orbitalPeriod = config.orbitalPeriod || 365; // days
    this.meanAnomaly = config.meanAnomaly || 0;
    
    // Visual properties
    this.color = config.color || 0xffffff;
    this.emissive = config.emissive || 0x000000;
    this.emissiveIntensity = config.emissiveIntensity || 0;
    
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
    
    // Set initial position
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
   * Update orbital position using simplified Kepler's laws
   */
  updateOrbitalPosition(deltaTime) {
    // Mean motion (rad/s)
    const meanMotion = (2 * Math.PI) / (this.orbitalPeriod * 24 * 3600);
    
    // Update mean anomaly
    this.meanAnomaly += meanMotion * deltaTime;
    
    // For now, use circular orbits (can be enhanced later with elliptical)
    const x = this.semiMajorAxis * Math.cos(this.meanAnomaly);
    const z = this.semiMajorAxis * Math.sin(this.meanAnomaly);
    const y = 0; // Can add inclination later
    
    this.group.position.set(x, y, z);
  }

  /**
   * Set visualization mode
   */
  setMode(mode) {
    this.currentMode = mode;

    if (!this.mesh) return;

    if (mode === 'artistic') {
      // Enhanced visuals for artistic mode
      this.mesh.material.emissiveIntensity = this.emissiveIntensity * 2;
      this.mesh.material.wireframe = false;
      if (this.atmosphere) {
        this.atmosphere.material.opacity = 0.2;
      }
    } else {
      // Realistic mode with enhanced visibility
      this.mesh.material.emissiveIntensity = Math.max(this.emissiveIntensity, 0.1);
      this.mesh.material.wireframe = false;
      if (this.atmosphere) {
        this.atmosphere.material.opacity = 0.1;
      }
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
    
    console.log(`🧹 Disposed celestial body: ${this.name}`);
  }
}
