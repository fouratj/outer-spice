/**
 * SceneManager - Manages the Three.js scene, camera, renderer, and lighting
 */

import * as THREE from 'three';
import { CelestialBody } from '../models/CelestialBody.js';
import { SOLAR_SYSTEM_DATA, MOONS_DATA, getScaledData } from '../data/SolarSystemData.js';
import { PlanetTravelSystem } from './PlanetTravelSystem.js';

export class SceneManager {
  constructor(container) {
    this.container = container;

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Lighting
    this.ambientLight = null;
    this.sunLight = null;

    // Scene objects
    this.celestialBodies = new Map();
    this.starField = null;

    // Systems
    this.planetTravelSystem = null;

    // Settings
    this.currentMode = 'realistic'; // 'realistic' or 'artistic'
    this.timeScale = 1.0;

    // Performance
    this.renderTarget = null;
  }

  /**
   * Initialize the scene manager
   */
  async init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLighting();
    await this.createStarField();

    console.log('✅ SceneManager initialized');
  }

  /**
   * Initialize the planet travel system (called after navigation controls are ready)
   */
  initializeTravelSystem(navigationControls) {
    this.planetTravelSystem = new PlanetTravelSystem(
      this.camera,
      this,
      navigationControls
    );
    console.log('✅ Planet travel system initialized');
  }

  /**
   * Create the Three.js scene
   */
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Add fog for depth perception (disabled by default)
    // this.scene.fog = new THREE.Fog(0x000000, 1000, 10000);
  }

  /**
   * Create the camera
   */
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(
      60, // Field of view
      aspect, // Aspect ratio
      0.1, // Near clipping plane
      100000 // Far clipping plane
    );

    // Set initial camera position
    this.camera.position.set(0, 0, 50);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Create the WebGL renderer
   */
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    // Configure renderer
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set color space
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Enable tone mapping for better lighting
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Append to container
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Create lighting system
   */
  createLighting() {
    // Ambient light for general illumination (increased for debugging)
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(this.ambientLight);

    // Sun light (point light at origin)
    this.sunLight = new THREE.PointLight(0xffffff, 2, 0);
    this.sunLight.position.set(0, 0, 0);
    this.sunLight.castShadow = true;

    // Configure shadow properties
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 1000;

    this.scene.add(this.sunLight);
  }

  /**
   * Create a starfield background
   */
  async createStarField() {
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    // Generate random star positions and colors
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Random position on a sphere
      const radius = 50000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);

      // Random star color (bluish to reddish)
      const temperature = Math.random();
      starColors[i3] = 0.5 + temperature * 0.5; // Red
      starColors[i3 + 1] = 0.5 + temperature * 0.3; // Green
      starColors[i3 + 2] = 0.8 + temperature * 0.2; // Blue
    }

    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    );
    starGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(starColors, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  /**
   * Load solar system data and create celestial bodies
   */
  async loadSolarSystem() {
    console.log('🌌 Loading solar system...');

    // Clear existing bodies
    this.celestialBodies.clear();

    // Create all planets and the sun
    const bodyNames = Object.keys(SOLAR_SYSTEM_DATA);
    const loadPromises = [];

    for (const bodyName of bodyNames) {
      const bodyData = getScaledData(bodyName, this.currentMode);
      const celestialBody = new CelestialBody(bodyName, bodyData);

      // Store the celestial body
      this.celestialBodies.set(bodyName, celestialBody);

      // Add to scene
      this.scene.add(celestialBody.getObject3D());

      // Add creation promise
      loadPromises.push(celestialBody.create());
    }

    // Create major moons
    const moonNames = Object.keys(MOONS_DATA);
    for (const moonName of moonNames) {
      const moonData = getScaledData(moonName, this.currentMode);
      const moon = new CelestialBody(moonName, moonData);

      // Store the moon
      this.celestialBodies.set(moonName, moon);

      // Add to parent planet's group (for now, add to scene)
      this.scene.add(moon.getObject3D());

      // Add creation promise
      loadPromises.push(moon.create());
    }

    // Wait for all bodies to be created
    await Promise.all(loadPromises);

    console.log(`✅ Loaded ${this.celestialBodies.size} celestial bodies`);
  }

  /**
   * Update the scene
   */
  update(deltaTime) {
    // Update celestial body animations
    this.celestialBodies.forEach((body) => {
      if (body.update) {
        body.update(deltaTime, this.timeScale);
      }
    });

    // Update planet travel system
    if (this.planetTravelSystem) {
      this.planetTravelSystem.update(deltaTime);
    }

    // Subtle starfield rotation
    if (this.starField) {
      this.starField.rotation.y += deltaTime * 0.001;
    }
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
  }

  /**
   * Switch between realistic and artistic modes
   */
  async setVisualizationMode(mode) {
    if (mode === this.currentMode) return;

    this.currentMode = mode;

    // Update lighting
    if (mode === 'realistic') {
      this.ambientLight.intensity = 0.2;
      this.sunLight.intensity = 2;
      this.renderer.toneMappingExposure = 1.0;
    } else {
      this.ambientLight.intensity = 0.5;
      this.sunLight.intensity = 1.5;
      this.renderer.toneMappingExposure = 1.2;
    }

    // Reload solar system with new scaling for artistic mode
    console.log(`🎨 Switching to ${mode} mode - reloading solar system...`);
    await this.reloadSolarSystem();

    console.log(`🎨 Switched to ${mode} mode`);
  }

  /**
   * Reload the solar system (useful when switching modes)
   */
  async reloadSolarSystem() {
    // Dispose of existing bodies
    this.celestialBodies.forEach((body) => {
      if (body.dispose) {
        body.dispose();
      }
      // Remove from scene
      this.scene.remove(body.getObject3D());
    });

    // Reload with current mode
    await this.loadSolarSystem();
  }

  /**
   * Get celestial body by name
   */
  getCelestialBody(name) {
    return this.celestialBodies.get(name);
  }

  /**
   * Get all celestial bodies
   */
  getAllCelestialBodies() {
    return Array.from(this.celestialBodies.values());
  }

  /**
   * Get planet travel system
   */
  getPlanetTravelSystem() {
    return this.planetTravelSystem;
  }

  /**
   * Travel to a celestial body
   */
  async travelTo(bodyName, speed = 1.0) {
    if (!this.planetTravelSystem) {
      console.warn('Planet travel system not initialized');
      return false;
    }

    return await this.planetTravelSystem.travelTo(bodyName, speed);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    // Dispose of celestial bodies
    this.celestialBodies.forEach((body) => {
      if (body.dispose) {
        body.dispose();
      }
    });

    // Dispose of starfield
    if (this.starField) {
      this.starField.geometry.dispose();
      this.starField.material.dispose();
    }

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(
          this.renderer.domElement
        );
      }
    }

    console.log('🧹 SceneManager disposed');
  }
}
