/**
 * SolarSystemData - Accurate astronomical data for celestial bodies
 * Data sources: NASA JPL Planetary Fact Sheets, IAU, and other astronomical databases
 * Updated with precise J2000 epoch orbital elements and current position calculations
 */

import { calculateHeliocentricPosition, calculateAstronomicalInfo } from '../utils/AstronomicalCalculations.js';

// Astronomical constants
const AU_TO_KM = 149597870.7; // 1 AU in kilometers (IAU 2012 definition)

// True astronomical scaling - represents real space distances and sizes
const TRUE_ASTRONOMICAL_SCALING = {
  // True distance scaling: 1 AU = 1000 scene units (massive scale for realism)
  distanceScale: 1000, // 1 AU = 1000 units, making Neptune ~30,000 units away

  // Realistic size scaling - planets will be tiny dots at true scale
  baseSizeScale: 1 / 1000000, // 1 unit = 1 million km (planets become tiny)

  // Minimum sizes for visibility (still astronomically accurate relative scaling)
  minPlanetRadius: 0.001, // Extremely small but visible
  maxSizeEnhancement: 1.0, // No enhancement - true scale

  // Sun scaling - even the sun becomes small at true distances
  sunSizeScale: 1 / 100000, // Sun: 1 unit = 100,000 km
  sunMinRadius: 0.7 // Small but visible sun
};

// Compressed scaling for exploration and artistic mode
const EXPLORATION_SCALING = {
  // Compressed distances for better navigation (old "realistic" mode)
  distanceScale: 50, // 1 AU = 50 units (compressed but navigable)

  // Enhanced planet sizes for visibility
  baseSizeScale: 1 / 25000, // 1 unit = 25,000 km
  minPlanetRadius: 0.8, // Minimum radius for planets
  maxSizeEnhancement: 5.0, // Logarithmic enhancement for small planets

  // Sun scaling for exploration mode
  sunSizeScale: 1 / 200000, // Sun: 1 unit = 200,000 km
  sunMinRadius: 8.0 // Prominent sun
};

// Artistic mode with enhanced visuals
const ARTISTIC_SCALING = {
  // Very compressed distances for cinematic experience
  distanceScale: 25, // 1 AU = 25 units (very compressed)

  // Large, beautiful planets
  baseSizeScale: 1 / 8000, // Large planets
  minPlanetRadius: 2.0, // Big minimum size
  maxSizeEnhancement: 12.0, // Dramatic size enhancement

  // Large, dramatic sun
  sunSizeScale: 1 / 150000,
  sunMinRadius: 15.0
};

// Accurate astronomical data with J2000 orbital elements from NASA JPL
export const SOLAR_SYSTEM_DATA = {
  sun: {
    // Physical properties
    radius: 696340, // km (actual radius)
    mass: 1.989e30, // kg
    rotationPeriod: 609.12, // hours (25.05 days at equator)
    axialTilt: 7.25, // degrees (to ecliptic)

    // Visual properties
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.8,

    // Orbital properties (Sun is at center)
    semiMajorAxis: 0,
    orbitalPeriod: 0,
    eccentricity: 0,
    inclination: 0,
    longitudeOfAscendingNode: 0,
    longitudeOfPerihelion: 0,
    meanLongitude: 0,

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/sun_diffuse.jpg'
    }
  },

  mercury: {
    // Physical properties (NASA Mercury Fact Sheet)
    radius: 2439.7, // km
    mass: 3.301e23, // kg
    rotationPeriod: 1407.6, // hours (58.646 days)
    axialTilt: 0.034, // degrees

    // Visual properties
    color: 0x8c7853,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 0.387098, // AU
    orbitalPeriod: 87.969, // days
    eccentricity: 0.20563, // orbital eccentricity
    inclination: 7.005, // degrees (to ecliptic)
    longitudeOfAscendingNode: 48.331, // degrees
    longitudeOfPerihelion: 77.456, // degrees
    meanLongitude: 252.251, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/mercury_diffuse.jpg'
    }
  },

  venus: {
    // Physical properties (NASA Venus Fact Sheet)
    radius: 6051.8, // km
    mass: 4.867e24, // kg
    rotationPeriod: -5832.5, // hours (retrograde, 243.025 days)
    axialTilt: 177.4, // degrees (nearly upside down)

    // Visual properties
    color: 0xffc649,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 0.723332, // AU
    orbitalPeriod: 224.701, // days
    eccentricity: 0.006772, // orbital eccentricity
    inclination: 3.39458, // degrees (to ecliptic)
    longitudeOfAscendingNode: 76.680, // degrees
    longitudeOfPerihelion: 131.564, // degrees
    meanLongitude: 181.980, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/venus_diffuse.jpg'
    }
  },

  earth: {
    // Physical properties (NASA Earth Fact Sheet)
    radius: 6371.0, // km (volumetric mean radius)
    mass: 5.9722e24, // kg
    rotationPeriod: 23.9345, // hours (sidereal day)
    axialTilt: 23.44, // degrees (obliquity to orbit)

    // Visual properties
    color: 0x6b93d6,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL) - Reference plane
    semiMajorAxis: 1.00000011, // AU (by definition)
    orbitalPeriod: 365.256, // days (sidereal year)
    eccentricity: 0.01671022, // orbital eccentricity
    inclination: 0.00005, // degrees (reference plane)
    longitudeOfAscendingNode: -11.26064, // degrees
    longitudeOfPerihelion: 102.94719, // degrees
    meanLongitude: 100.46435, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/earth_diffuse.jpg',
      normal: '/assets/textures/earth_normal.jpg',
      specular: '/assets/textures/earth_specular.jpg'
    }
  },

  mars: {
    // Physical properties (NASA Mars Fact Sheet)
    radius: 3389.5, // km (volumetric mean radius)
    mass: 6.4169e23, // kg
    rotationPeriod: 24.6229, // hours (sidereal day)
    axialTilt: 25.19, // degrees (obliquity to orbit)

    // Visual properties
    color: 0xcd5c5c,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 1.52366231, // AU
    orbitalPeriod: 686.980, // days (sidereal orbit period)
    eccentricity: 0.09341233, // orbital eccentricity
    inclination: 1.85061, // degrees (to ecliptic)
    longitudeOfAscendingNode: 49.57854, // degrees
    longitudeOfPerihelion: 336.04084, // degrees
    meanLongitude: 355.45332, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/mars_diffuse.jpg'
    }
  },

  jupiter: {
    // Physical properties (NASA Jupiter Fact Sheet)
    radius: 69911, // km (volumetric mean radius)
    mass: 1.89813e27, // kg
    rotationPeriod: 9.9250, // hours (System III rotation)
    axialTilt: 3.13, // degrees (obliquity to orbit)

    // Visual properties
    color: 0xd8ca9d,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 5.20336301, // AU
    orbitalPeriod: 4332.589, // days (11.862 years)
    eccentricity: 0.04839266, // orbital eccentricity
    inclination: 1.30530, // degrees (to ecliptic)
    longitudeOfAscendingNode: 100.55615, // degrees
    longitudeOfPerihelion: 14.75385, // degrees
    meanLongitude: 34.40438, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/jupiter_diffuse.jpg'
    }
  },

  saturn: {
    // Physical properties (NASA Saturn Fact Sheet)
    radius: 58232, // km (volumetric mean radius)
    mass: 5.683e26, // kg
    rotationPeriod: 10.66, // hours (System III rotation)
    axialTilt: 26.73, // degrees (obliquity to orbit)

    // Visual properties
    color: 0xfab27b,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 9.53707032, // AU
    orbitalPeriod: 10759.22, // days (29.457 years)
    eccentricity: 0.05415060, // orbital eccentricity
    inclination: 2.48446, // degrees (to ecliptic)
    longitudeOfAscendingNode: 113.71504, // degrees
    longitudeOfPerihelion: 92.43194, // degrees
    meanLongitude: 49.94432, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/saturn_diffuse.jpg'
    },

    // Ring system
    rings: {
      texture: '/assets/textures/saturn_ring.png',
      innerRadius: 1.2,
      outerRadius: 2.2
    }
  },

  uranus: {
    // Physical properties (NASA Uranus Fact Sheet)
    radius: 25362, // km (volumetric mean radius)
    mass: 8.681e25, // kg
    rotationPeriod: -17.24, // hours (retrograde rotation)
    axialTilt: 97.77, // degrees (rotates on its side)

    // Visual properties
    color: 0x4fd0e7,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 19.19126393, // AU
    orbitalPeriod: 30688.5, // days (84.017 years)
    eccentricity: 0.04716771, // orbital eccentricity
    inclination: 0.76986, // degrees (to ecliptic)
    longitudeOfAscendingNode: 74.22988, // degrees
    longitudeOfPerihelion: 170.96424, // degrees
    meanLongitude: 313.23218, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/uranus_diffuse.jpg'
    }
  },

  neptune: {
    // Physical properties (NASA Neptune Fact Sheet)
    radius: 24622, // km (volumetric mean radius)
    mass: 1.024e26, // kg
    rotationPeriod: 16.11, // hours
    axialTilt: 28.32, // degrees (obliquity to orbit)

    // Visual properties
    color: 0x4b70dd,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // J2000 Orbital Elements (NASA JPL)
    semiMajorAxis: 30.06896348, // AU
    orbitalPeriod: 60182, // days (164.791 years)
    eccentricity: 0.00858587, // orbital eccentricity
    inclination: 1.76917, // degrees (to ecliptic)
    longitudeOfAscendingNode: 131.72169, // degrees
    longitudeOfPerihelion: 44.97135, // degrees
    meanLongitude: 304.88003, // degrees at J2000

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/neptune_diffuse.jpg'
    }
  }
};

// Major moons data with accurate orbital elements
export const MOONS_DATA = {
  moon: {
    parent: 'earth',

    // Physical properties (NASA Moon Fact Sheet)
    radius: 1737.4, // km
    mass: 7.342e22, // kg
    rotationPeriod: 655.72, // hours (27.32 days, tidally locked)
    axialTilt: 6.68, // degrees

    // Visual properties
    color: 0xaaaaaa,
    emissive: 0x000000,
    emissiveIntensity: 0,

    // Orbital elements (relative to Earth)
    semiMajorAxis: 384400, // km from Earth center
    orbitalPeriod: 27.32166, // days (sidereal month)
    eccentricity: 0.0549, // orbital eccentricity
    inclination: 5.145, // degrees (to ecliptic)

    // Texture configuration
    textures: {
      diffuse: '/assets/textures/moon_diffuse.jpg'
    }
  }
};

// Artistic mode modifications
export const ARTISTIC_MODIFICATIONS = {
  sizeMultiplier: 8.0, // Make planets much larger for better visibility
  glowIntensity: 2.0, // Increase glow effects
  orbitVisibility: true, // Show orbit paths
  enhancedColors: true, // More vibrant colors
  particleEffects: true // Add particle effects
};

// Camera positions for planet visits (dynamically calculated based on planet size)
export const CAMERA_POSITIONS = {
  sun: { distance: 25, height: 12 },
  mercury: { distance: 3, height: 1.5 },
  venus: { distance: 4, height: 2 },
  earth: { distance: 4, height: 2 },
  mars: { distance: 3, height: 1.5 },
  jupiter: { distance: 6, height: 3 },
  saturn: { distance: 8, height: 4 }, // Extra distance for rings
  uranus: { distance: 5, height: 2.5 },
  neptune: { distance: 5, height: 2.5 },
  moon: { distance: 2, height: 1 }
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
 * Calculate current mean anomaly for a planet based on current date
 */
export function getCurrentMeanAnomaly(bodyData) {
  return calculateAstronomicalInfo('temp', bodyData).meanAnomaly;
}

/**
 * Calculate current position using accurate Kepler's laws
 */
export function calculateCurrentPosition(bodyData) {
  return calculateHeliocentricPosition(bodyData);
}

/**
 * Calculate radius with appropriate scaling for the visualization mode
 */
function calculateScaledRadius(originalRadius, bodyName, scaling, mode) {
  if (bodyName === 'sun') {
    const scaledRadius = originalRadius * scaling.sunSizeScale;
    return Math.max(scaledRadius, scaling.sunMinRadius || 0.1);
  }

  // Base scaled radius
  const baseScaledRadius = originalRadius * scaling.baseSizeScale;

  if (mode === 'realistic') {
    // True astronomical mode: no artificial enhancement, planets are tiny dots
    return Math.max(baseScaledRadius, scaling.minPlanetRadius || 0.001);
  }

  // For exploration and artistic modes: enhance small planets for visibility
  if (scaling.minPlanetRadius && baseScaledRadius < scaling.minPlanetRadius) {
    const enhancementFactor = Math.min(
      scaling.maxSizeEnhancement || 3.0,
      scaling.minPlanetRadius / baseScaledRadius
    );

    const enhancedRadius = baseScaledRadius * enhancementFactor;
    console.log(`🔍 Enhanced ${bodyName}: ${originalRadius}km → ${enhancedRadius.toFixed(3)} units (${enhancementFactor.toFixed(1)}x)`);
    return enhancedRadius;
  }

  return baseScaledRadius;
}

/**
 * Get scaling configuration based on visualization mode
 */
function getScalingConfig(mode) {
  switch (mode) {
    case 'realistic':
      return TRUE_ASTRONOMICAL_SCALING;
    case 'exploration':
      return EXPLORATION_SCALING;
    case 'artistic':
      return ARTISTIC_SCALING;
    default:
      return EXPLORATION_SCALING; // Default fallback
  }
}

/**
 * Get scaled data for visualization mode with accurate positioning
 */
export function getScaledData(bodyName, mode = 'exploration') {
  const data = SOLAR_SYSTEM_DATA[bodyName] || MOONS_DATA[bodyName];
  if (!data) return null;

  const scaledData = { ...data };

  // Calculate current position
  const currentPos = calculateCurrentPosition(data);
  scaledData.currentPosition = currentPos;

  // Get scaling configuration for the mode
  const scaling = getScalingConfig(mode);

  // Apply radius scaling
  scaledData.radius = calculateScaledRadius(data.radius, bodyName, scaling, mode);

  // Apply distance scaling
  scaledData.semiMajorAxis = data.semiMajorAxis * scaling.distanceScale;

  // Apply visual enhancements based on mode
  if (mode === 'artistic') {
    scaledData.emissiveIntensity = (data.emissiveIntensity || 0) * ARTISTIC_MODIFICATIONS.glowIntensity;

    if (ARTISTIC_MODIFICATIONS.enhancedColors) {
      scaledData.color = enhanceColor(data.color);
    }
  } else {
    // Realistic and exploration modes maintain original emissive properties
    scaledData.emissiveIntensity = data.emissiveIntensity || 0;
  }

  // Log scaling information for debugging
  if (bodyName !== 'sun') {
    const actualDistanceAU = data.semiMajorAxis;
    const scaledDistance = scaledData.semiMajorAxis;
    const actualRadiusKm = data.radius;
    const scaledRadius = scaledData.radius;

    console.log(`📏 ${mode.toUpperCase()} - ${bodyName}:`);
    console.log(`   Distance: ${actualDistanceAU.toFixed(3)} AU → ${scaledDistance.toFixed(1)} units`);
    console.log(`   Radius: ${actualRadiusKm.toLocaleString()} km → ${scaledRadius.toFixed(4)} units`);

    if (mode === 'realistic') {
      console.log(`   🔭 At true scale - may be barely visible!`);
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

/**
 * Get astronomical information for a celestial body
 */
export function getAstronomicalInfo(bodyName) {
  const data = SOLAR_SYSTEM_DATA[bodyName] || MOONS_DATA[bodyName];
  if (!data) return null;

  const currentPos = calculateCurrentPosition(data);
  const distanceFromSun = Math.sqrt(currentPos.x * currentPos.x + currentPos.y * currentPos.y + currentPos.z * currentPos.z);

  return {
    name: bodyName,
    radius: data.radius,
    mass: data.mass,
    semiMajorAxis: data.semiMajorAxis,
    orbitalPeriod: data.orbitalPeriod,
    eccentricity: data.eccentricity,
    inclination: data.inclination,
    rotationPeriod: data.rotationPeriod,
    axialTilt: data.axialTilt,
    currentDistanceFromSun: distanceFromSun,
    currentMeanAnomaly: getCurrentMeanAnomaly(data),
    currentPosition: currentPos
  };
}

/**
 * Get real-time distance between two celestial bodies
 */
export function getDistanceBetweenBodies(bodyName1, bodyName2) {
  const pos1 = calculateCurrentPosition(SOLAR_SYSTEM_DATA[bodyName1] || MOONS_DATA[bodyName1]);
  const pos2 = calculateCurrentPosition(SOLAR_SYSTEM_DATA[bodyName2] || MOONS_DATA[bodyName2]);

  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
