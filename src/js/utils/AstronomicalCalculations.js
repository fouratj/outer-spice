/**
 * AstronomicalCalculations - Utility functions for accurate astronomical calculations
 * Implements real-time planetary position calculations based on current date/time
 */

// Astronomical constants
const AU_TO_KM = 149597870.7; // 1 AU in kilometers
const J2000_EPOCH = 2451545.0; // Julian date for J2000.0 epoch
const SECONDS_PER_DAY = 86400;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * Get current Julian Date
 */
export function getCurrentJulianDate() {
  return (Date.now() / (SECONDS_PER_DAY * 1000)) + 2440587.5;
}

/**
 * Get days since J2000 epoch
 */
export function getDaysSinceJ2000(date = null) {
  const julianDate = date ? dateToJulianDate(date) : getCurrentJulianDate();
  return julianDate - J2000_EPOCH;
}

/**
 * Convert Date object to Julian Date
 */
export function dateToJulianDate(date) {
  return (date.getTime() / (SECONDS_PER_DAY * 1000)) + 2440587.5;
}

/**
 * Calculate mean anomaly for a given date
 */
export function calculateMeanAnomaly(orbitalElements, date = null) {
  const daysSinceJ2000 = getDaysSinceJ2000(date);
  const meanMotion = 360.0 / orbitalElements.orbitalPeriod; // degrees per day
  const currentMeanLongitude = orbitalElements.meanLongitude + (meanMotion * daysSinceJ2000);
  const meanAnomaly = currentMeanLongitude - orbitalElements.longitudeOfPerihelion;
  
  // Normalize to 0-360 degrees
  return ((meanAnomaly % 360) + 360) % 360;
}

/**
 * Solve Kepler's equation for eccentric anomaly
 * Uses iterative method for better accuracy
 */
export function solveKeplersEquation(meanAnomaly, eccentricity, tolerance = 1e-6, maxIterations = 20) {
  const meanAnomalyRad = meanAnomaly * DEGREES_TO_RADIANS;
  let eccentricAnomaly = meanAnomalyRad;
  
  for (let i = 0; i < maxIterations; i++) {
    const delta = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomalyRad;
    const deltaE = delta / (1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= deltaE;
    
    if (Math.abs(deltaE) < tolerance) {
      break;
    }
  }
  
  return eccentricAnomaly;
}

/**
 * Calculate true anomaly from eccentric anomaly
 */
export function calculateTrueAnomaly(eccentricAnomaly, eccentricity) {
  return 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
  );
}

/**
 * Calculate heliocentric position in orbital plane
 */
export function calculateOrbitalPosition(orbitalElements, date = null) {
  // Calculate mean anomaly
  const meanAnomaly = calculateMeanAnomaly(orbitalElements, date);
  
  // Solve Kepler's equation for eccentric anomaly
  const eccentricAnomaly = solveKeplersEquation(meanAnomaly, orbitalElements.eccentricity);
  
  // Calculate true anomaly
  const trueAnomaly = calculateTrueAnomaly(eccentricAnomaly, orbitalElements.eccentricity);
  
  // Calculate distance from sun (in AU)
  const distance = orbitalElements.semiMajorAxis * (1 - orbitalElements.eccentricity * Math.cos(eccentricAnomaly));
  
  // Position in orbital plane
  const x = distance * Math.cos(trueAnomaly);
  const y = distance * Math.sin(trueAnomaly);
  
  return { x, y, distance, trueAnomaly, eccentricAnomaly, meanAnomaly };
}

/**
 * Transform orbital plane coordinates to ecliptic coordinates
 */
export function transformToEcliptic(orbitalPos, orbitalElements) {
  const { x, y } = orbitalPos;
  
  // Convert angles to radians
  const inclinationRad = orbitalElements.inclination * DEGREES_TO_RADIANS;
  const nodeRad = orbitalElements.longitudeOfAscendingNode * DEGREES_TO_RADIANS;
  const perihelionRad = (orbitalElements.longitudeOfPerihelion - orbitalElements.longitudeOfAscendingNode) * DEGREES_TO_RADIANS;
  
  // Rotate by argument of perihelion
  const xPeri = x * Math.cos(perihelionRad) - y * Math.sin(perihelionRad);
  const yPeri = x * Math.sin(perihelionRad) + y * Math.cos(perihelionRad);
  
  // Apply inclination and longitude of ascending node
  const xEcliptic = xPeri * Math.cos(nodeRad) - yPeri * Math.cos(inclinationRad) * Math.sin(nodeRad);
  const yEcliptic = xPeri * Math.sin(nodeRad) + yPeri * Math.cos(inclinationRad) * Math.cos(nodeRad);
  const zEcliptic = yPeri * Math.sin(inclinationRad);
  
  return { x: xEcliptic, y: yEcliptic, z: zEcliptic };
}

/**
 * Calculate current heliocentric position of a celestial body
 */
export function calculateHeliocentricPosition(orbitalElements, date = null) {
  // Handle Sun (at origin)
  if (orbitalElements.semiMajorAxis === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  // Calculate position in orbital plane
  const orbitalPos = calculateOrbitalPosition(orbitalElements, date);
  
  // Transform to ecliptic coordinates
  const eclipticPos = transformToEcliptic(orbitalPos, orbitalElements);
  
  return {
    ...eclipticPos,
    distance: orbitalPos.distance,
    trueAnomaly: orbitalPos.trueAnomaly * RADIANS_TO_DEGREES,
    eccentricAnomaly: orbitalPos.eccentricAnomaly * RADIANS_TO_DEGREES,
    meanAnomaly: orbitalPos.meanAnomaly
  };
}

/**
 * Calculate distance between two celestial bodies
 */
export function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Get orbital velocity at current position
 */
export function calculateOrbitalVelocity(orbitalElements, currentDistance) {
  // Standard gravitational parameter for the Sun (km³/s²)
  const GM_SUN = 1.32712442018e11;
  const semiMajorAxisKm = orbitalElements.semiMajorAxis * AU_TO_KM;
  const currentDistanceKm = currentDistance * AU_TO_KM;
  
  // Vis-viva equation: v² = GM(2/r - 1/a)
  const velocitySquared = GM_SUN * (2 / currentDistanceKm - 1 / semiMajorAxisKm);
  return Math.sqrt(Math.max(0, velocitySquared)); // km/s
}

/**
 * Calculate phase angle (for moon phases, planet phases)
 */
export function calculatePhaseAngle(bodyPos, observerPos, sunPos = { x: 0, y: 0, z: 0 }) {
  // Vectors from observer to body and observer to sun
  const toBody = {
    x: bodyPos.x - observerPos.x,
    y: bodyPos.y - observerPos.y,
    z: bodyPos.z - observerPos.z
  };
  
  const toSun = {
    x: sunPos.x - observerPos.x,
    y: sunPos.y - observerPos.y,
    z: sunPos.z - observerPos.z
  };
  
  // Calculate angle between vectors
  const dotProduct = toBody.x * toSun.x + toBody.y * toSun.y + toBody.z * toSun.z;
  const magnitudeBody = Math.sqrt(toBody.x * toBody.x + toBody.y * toBody.y + toBody.z * toBody.z);
  const magnitudeSun = Math.sqrt(toSun.x * toSun.x + toSun.y * toSun.y + toSun.z * toSun.z);
  
  const cosPhase = dotProduct / (magnitudeBody * magnitudeSun);
  return Math.acos(Math.max(-1, Math.min(1, cosPhase))) * RADIANS_TO_DEGREES;
}

/**
 * Calculate apparent magnitude of a planet as seen from another location
 * Based on distance and intrinsic brightness
 */
export function calculateApparentMagnitude(bodyData, observerPos, sunPos = { x: 0, y: 0, z: 0 }) {
  const bodyPos = calculateHeliocentricPosition(bodyData);

  // Distance from observer to planet (AU)
  const distanceToObserver = calculateDistance(bodyPos, observerPos);

  // Distance from sun to planet (AU)
  const distanceFromSun = bodyPos.distance;

  // Phase angle (illumination)
  const phaseAngle = calculatePhaseAngle(bodyPos, observerPos, sunPos);

  // Base magnitudes for planets at 1 AU from both Sun and Earth
  const baseMagnitudes = {
    mercury: -0.42,
    venus: -4.40,
    mars: -2.94,
    jupiter: -2.94,
    saturn: -0.55,
    uranus: 5.68,
    neptune: 7.84
  };

  const baseMag = baseMagnitudes[bodyData.name] || 10.0;

  // Calculate apparent magnitude using inverse square law
  // Magnitude increases (dimmer) with distance squared
  const distanceMagnitude = 5 * Math.log10(distanceToObserver * distanceFromSun);

  // Phase correction (simplified)
  const phaseCorrection = phaseAngle > 90 ? (phaseAngle - 90) / 90 * 2 : 0;

  const apparentMag = baseMag + distanceMagnitude + phaseCorrection;

  return {
    apparentMagnitude: apparentMag,
    distanceToObserver: distanceToObserver,
    distanceFromSun: distanceFromSun,
    phaseAngle: phaseAngle,
    isVisible: apparentMag < 6.5, // Naked eye limit
    isEasilyVisible: apparentMag < 4.0, // Easily visible
    isBrightPlanet: apparentMag < 1.0 // Bright planet
  };
}

/**
 * Calculate visibility and apparent size from observer position
 */
export function calculateVisibilityFromPosition(bodyData, observerPos, mode = 'realistic') {
  const visibility = calculateApparentMagnitude(bodyData, observerPos);
  const bodyPos = calculateHeliocentricPosition(bodyData);

  // Calculate apparent angular size (in arcseconds)
  const physicalRadius = bodyData.radius || 1000; // km
  const distanceKm = visibility.distanceToObserver * AU_TO_KM;
  const angularSize = (physicalRadius / distanceKm) * 206265; // arcseconds

  // Determine visibility level
  let visibilityLevel = 'invisible';
  let scaleFactor = 0.0;

  if (mode === 'realistic') {
    // True astronomical visibility
    if (visibility.apparentMagnitude < 1.0) {
      visibilityLevel = 'bright';
      scaleFactor = 1.0;
    } else if (visibility.apparentMagnitude < 4.0) {
      visibilityLevel = 'visible';
      scaleFactor = 0.8;
    } else if (visibility.apparentMagnitude < 6.5) {
      visibilityLevel = 'faint';
      scaleFactor = 0.3;
    } else if (visibility.apparentMagnitude < 10.0) {
      visibilityLevel = 'telescopic';
      scaleFactor = 0.1;
    } else {
      visibilityLevel = 'invisible';
      scaleFactor = 0.0;
    }
  } else {
    // Enhanced visibility for exploration/artistic modes
    scaleFactor = Math.max(0.1, Math.min(1.0, 10.0 / visibility.distanceToObserver));
    visibilityLevel = scaleFactor > 0.5 ? 'visible' : 'faint';
  }

  return {
    ...visibility,
    angularSize: angularSize,
    visibilityLevel: visibilityLevel,
    scaleFactor: scaleFactor,
    shouldRender: scaleFactor > 0.0,
    needsLabel: visibilityLevel === 'faint' || visibilityLevel === 'telescopic'
  };
}

/**
 * Get current astronomical information for display
 */
export function calculateAstronomicalInfo(bodyName, orbitalElements, date = null) {
  const position = calculateHeliocentricPosition(orbitalElements, date);
  const velocity = calculateOrbitalVelocity(orbitalElements, position.distance);

  return {
    name: bodyName,
    date: date || new Date(),
    position: position,
    distanceFromSun: position.distance,
    orbitalVelocity: velocity,
    meanAnomaly: position.meanAnomaly,
    trueAnomaly: position.trueAnomaly,
    eccentricAnomaly: position.eccentricAnomaly
  };
}
