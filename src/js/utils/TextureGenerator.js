/**
 * TextureGenerator - Creates procedural textures as fallbacks
 */

import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Create a procedural planet texture
   */
  static createPlanetTexture(planetName, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create gradient based on planet
    const colors = this.getPlanetColors(planetName);
    
    // Create base gradient
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    
    gradient.addColorStop(0, colors.center);
    gradient.addColorStop(0.7, colors.middle);
    gradient.addColorStop(1, colors.edge);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add some noise/texture
    this.addNoise(ctx, size, planetName);
    
    // Create Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Get color scheme for each planet
   */
  static getPlanetColors(planetName) {
    const colorSchemes = {
      sun: {
        center: '#ffff88',
        middle: '#ffaa00',
        edge: '#ff4400'
      },
      mercury: {
        center: '#aaaaaa',
        middle: '#888888',
        edge: '#666666'
      },
      venus: {
        center: '#ffdd88',
        middle: '#ffcc44',
        edge: '#cc9900'
      },
      earth: {
        center: '#88ccff',
        middle: '#4499dd',
        edge: '#2266aa'
      },
      mars: {
        center: '#ffaa88',
        middle: '#dd6644',
        edge: '#aa3322'
      },
      jupiter: {
        center: '#ffddaa',
        middle: '#ddbb88',
        edge: '#bb9966'
      },
      saturn: {
        center: '#ffffcc',
        middle: '#ddddaa',
        edge: '#bbbb88'
      },
      uranus: {
        center: '#88ffff',
        middle: '#66dddd',
        edge: '#44bbbb'
      },
      neptune: {
        center: '#8888ff',
        middle: '#6666dd',
        edge: '#4444bb'
      },
      moon: {
        center: '#cccccc',
        middle: '#aaaaaa',
        edge: '#888888'
      }
    };

    return colorSchemes[planetName] || colorSchemes.moon;
  }

  /**
   * Add noise/texture patterns
   */
  static addNoise(ctx, size, _planetName) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Create a starfield texture
   */
  static createStarfieldTexture(size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Add stars
    const starCount = 1000;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random();
      const starSize = Math.random() * 2 + 0.5;

      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, starSize, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  /**
   * Create a simple normal map
   */
  static createNormalMap(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create a simple normal map (mostly flat with some variation)
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Normal map: R = X, G = Y, B = Z (pointing outward)
      data[i] = 128 + (Math.random() - 0.5) * 20;     // X (red)
      data[i + 1] = 128 + (Math.random() - 0.5) * 20; // Y (green)
      data[i + 2] = 255;                               // Z (blue) - pointing out
      data[i + 3] = 255;                               // Alpha
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }
}
