/**
 * SolarSystemData - Accurate astronomical data for celestial bodies
 * Data sources: NASA JPL, IAU, and other astronomical databases
 */

// Scale factors for visualization
const DISTANCE_SCALE = 1 / 10000000; // 1 unit = 10 million km
const SIZE_SCALE_REALISTIC = 1 / 100000; // 1 unit = 100,000 km

export const SOLAR_SYSTEM_DATA = {
  sun: {
    radius: 696340 * SIZE_SCALE_REALISTIC, // km
    mass: 1.989e30, // kg
    rotationPeriod: 609.12, // hours (25.05 days)
    axialTilt: 7.25, // degrees
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.5,
    semiMajorAxis: 0, // At center
    orbitalPeriod: 0,
    eccentricity: 0,
    inclination: 0,
    textures: {
      diffuse: '/assets/textures/sun_diffuse.jpg'
    }
  },

  mercury: {
    radius: 2439.7 * SIZE_SCALE_REALISTIC, // km
    mass: 3.301e23, // kg
    rotationPeriod: 1407.6, // hours (58.65 days)
    axialTilt: 0.034, // degrees
    color: 0x8c7853,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 57.91e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 87.97, // days
    eccentricity: 0.2056,
    inclination: 7.005, // degrees
    textures: {
      diffuse: '/assets/textures/mercury_diffuse.jpg'
    }
  },

  venus: {
    radius: 6051.8 * SIZE_SCALE_REALISTIC, // km
    mass: 4.867e24, // kg
    rotationPeriod: -5832.5, // hours (retrograde, 243.02 days)
    axialTilt: 177.4, // degrees (nearly upside down)
    color: 0xffc649,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 108.21e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 224.7, // days
    eccentricity: 0.0067,
    inclination: 3.39, // degrees
    textures: {
      diffuse: '/assets/textures/venus_diffuse.jpg'
    }
  },

  earth: {
    radius: 6371 * SIZE_SCALE_REALISTIC, // km
    mass: 5.972e24, // kg
    rotationPeriod: 23.93, // hours
    axialTilt: 23.44, // degrees
    color: 0x6b93d6,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 149.6e6 * DISTANCE_SCALE, // km (1 AU)
    orbitalPeriod: 365.26, // days
    eccentricity: 0.0167,
    inclination: 0, // degrees (reference plane)
    textures: {
      diffuse: '/assets/textures/earth_diffuse.jpg',
      normal: '/assets/textures/earth_normal.jpg',
      specular: '/assets/textures/earth_specular.jpg'
    }
  },

  mars: {
    radius: 3389.5 * SIZE_SCALE_REALISTIC, // km
    mass: 6.39e23, // kg
    rotationPeriod: 24.62, // hours
    axialTilt: 25.19, // degrees
    color: 0xcd5c5c,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 227.92e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 686.98, // days
    eccentricity: 0.0934,
    inclination: 1.85, // degrees
    textures: {
      diffuse: '/assets/textures/mars_diffuse.jpg'
    }
  },

  jupiter: {
    radius: 69911 * SIZE_SCALE_REALISTIC, // km
    mass: 1.898e27, // kg
    rotationPeriod: 9.93, // hours
    axialTilt: 3.13, // degrees
    color: 0xd8ca9d,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 778.57e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 4332.59, // days (11.86 years)
    eccentricity: 0.0489,
    inclination: 1.304, // degrees
    textures: {
      diffuse: '/assets/textures/jupiter_diffuse.jpg'
    }
  },

  saturn: {
    radius: 58232 * SIZE_SCALE_REALISTIC, // km
    mass: 5.683e26, // kg
    rotationPeriod: 10.66, // hours
    axialTilt: 26.73, // degrees
    color: 0xfab27b,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 1432e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 10759.22, // days (29.46 years)
    eccentricity: 0.0565,
    inclination: 2.485, // degrees
    textures: {
      diffuse: '/assets/textures/saturn_diffuse.jpg'
    },
    rings: {
      texture: '/assets/textures/saturn_ring.png',
      innerRadius: 1.2,
      outerRadius: 2.2
    }
  },

  uranus: {
    radius: 25362 * SIZE_SCALE_REALISTIC, // km
    mass: 8.681e25, // kg
    rotationPeriod: -17.24, // hours (retrograde)
    axialTilt: 97.77, // degrees (rotates on its side)
    color: 0x4fd0e7,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 2867e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 30688.5, // days (84.01 years)
    eccentricity: 0.0457,
    inclination: 0.773, // degrees
    textures: {
      diffuse: '/assets/textures/uranus_diffuse.jpg'
    }
  },

  neptune: {
    radius: 24622 * SIZE_SCALE_REALISTIC, // km
    mass: 1.024e26, // kg
    rotationPeriod: 16.11, // hours
    axialTilt: 28.32, // degrees
    color: 0x4b70dd,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 4515e6 * DISTANCE_SCALE, // km
    orbitalPeriod: 60182, // days (164.8 years)
    eccentricity: 0.0113,
    inclination: 1.77, // degrees
    textures: {
      diffuse: '/assets/textures/neptune_diffuse.jpg'
    }
  }
};

// Major moons data (simplified for now)
export const MOONS_DATA = {
  moon: {
    parent: 'earth',
    radius: 1737.4 * SIZE_SCALE_REALISTIC, // km
    mass: 7.342e22, // kg
    rotationPeriod: 655.72, // hours (27.32 days, tidally locked)
    axialTilt: 6.68, // degrees
    color: 0xaaaaaa,
    emissive: 0x000000,
    emissiveIntensity: 0,
    semiMajorAxis: 384400 * DISTANCE_SCALE * 10, // km (scaled up for visibility)
    orbitalPeriod: 27.32, // days
    eccentricity: 0.0549,
    inclination: 5.145, // degrees
    textures: {
      diffuse: '/assets/textures/moon_diffuse.jpg'
    }
  }
};

// Artistic mode modifications
export const ARTISTIC_MODIFICATIONS = {
  sizeMultiplier: 5.0, // Make planets much larger for better visibility
  glowIntensity: 1.5, // Increase glow effects
  orbitVisibility: true, // Show orbit paths
  enhancedColors: true, // More vibrant colors
  particleEffects: true // Add particle effects
};

// Camera positions for planet visits (scaled appropriately for realistic sizes)
export const CAMERA_POSITIONS = {
  sun: { distance: 20, height: 10 },      // Sun radius: ~7 units
  mercury: { distance: 0.5, height: 0.2 }, // Mercury radius: ~0.024 units
  venus: { distance: 0.8, height: 0.3 },   // Venus radius: ~0.06 units
  earth: { distance: 1.0, height: 0.4 },   // Earth radius: ~0.064 units
  mars: { distance: 0.7, height: 0.3 },    // Mars radius: ~0.034 units
  jupiter: { distance: 3.0, height: 1.2 }, // Jupiter radius: ~0.7 units
  saturn: { distance: 3.5, height: 1.4 },  // Saturn radius: ~0.58 units
  uranus: { distance: 2.0, height: 0.8 },  // Uranus radius: ~0.25 units
  neptune: { distance: 2.0, height: 0.8 }, // Neptune radius: ~0.25 units
  moon: { distance: 0.3, height: 0.1 }     // Moon radius: ~0.017 units
};

// Texture fallback colors (used when textures fail to load)
export const FALLBACK_COLORS = {
  sun: 0xffff00,
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

/**
 * Get scaled data for visualization mode
 */
export function getScaledData(bodyName, mode = 'realistic') {
  const data = SOLAR_SYSTEM_DATA[bodyName] || MOONS_DATA[bodyName];
  if (!data) return null;

  const scaledData = { ...data };

  if (mode === 'artistic') {
    // Apply artistic modifications
    scaledData.radius *= ARTISTIC_MODIFICATIONS.sizeMultiplier;
    scaledData.emissiveIntensity *= ARTISTIC_MODIFICATIONS.glowIntensity;

    if (ARTISTIC_MODIFICATIONS.enhancedColors) {
      // Enhance color saturation (simplified)
      scaledData.color = enhanceColor(scaledData.color);
    }
  } else {
    // In realistic mode, ensure ALL planets are visible
    // Apply a universal scale boost for visibility
    if (bodyName !== 'sun') {
      // Make all planets at least 2 units radius for visibility
      const minRadius = 2.0;
      const scaleFactor = Math.max(3, minRadius / scaledData.radius);
      scaledData.radius *= scaleFactor;
      console.log(`🔍 Scaled ${bodyName}: original=${(scaledData.radius/scaleFactor).toFixed(4)}, scaled=${scaledData.radius.toFixed(4)}, factor=${scaleFactor.toFixed(2)}`);
    }
  }

  return scaledData;
}

/**
 * Enhance color saturation for artistic mode
 */
function enhanceColor(color) {
  // Simple color enhancement - can be improved
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  
  // Increase saturation by 20%
  const factor = 1.2;
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));
  
  return (newR << 16) | (newG << 8) | newB;
}

/**
 * Get all celestial body names
 */
export function getAllBodyNames() {
  return [...Object.keys(SOLAR_SYSTEM_DATA), ...Object.keys(MOONS_DATA)];
}

/**
 * Get planet names only (excluding sun and moons)
 */
export function getPlanetNames() {
  return Object.keys(SOLAR_SYSTEM_DATA).filter(name => name !== 'sun');
}

/**
 * Check if a body is a planet
 */
export function isPlanet(bodyName) {
  return bodyName !== 'sun' && bodyName in SOLAR_SYSTEM_DATA;
}

/**
 * Check if a body is a moon
 */
export function isMoon(bodyName) {
  return bodyName in MOONS_DATA;
}
