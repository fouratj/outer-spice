/**
 * AstronomicalValidation - Test and validate astronomical accuracy
 * Compare our calculations with known astronomical data and ephemeris
 */

import { calculateHeliocentricPosition, calculateAstronomicalInfo } from './AstronomicalCalculations.js';
import { SOLAR_SYSTEM_DATA } from '../data/SolarSystemData.js';

/**
 * Known planetary positions for validation (approximate values for Jan 1, 2025)
 * These are rough estimates for testing purposes
 */
const VALIDATION_DATA_2025 = {
  mercury: {
    expectedDistance: 0.39, // AU (approximate)
    expectedMeanAnomaly: 45, // degrees (approximate)
    tolerance: 0.1 // AU
  },
  venus: {
    expectedDistance: 0.72,
    expectedMeanAnomaly: 180,
    tolerance: 0.1
  },
  earth: {
    expectedDistance: 1.0,
    expectedMeanAnomaly: 100,
    tolerance: 0.05
  },
  mars: {
    expectedDistance: 1.52,
    expectedMeanAnomaly: 355,
    tolerance: 0.15
  },
  jupiter: {
    expectedDistance: 5.20,
    expectedMeanAnomaly: 34,
    tolerance: 0.3
  },
  saturn: {
    expectedDistance: 9.54,
    expectedMeanAnomaly: 50,
    tolerance: 0.5
  },
  uranus: {
    expectedDistance: 19.19,
    expectedMeanAnomaly: 313,
    tolerance: 1.0
  },
  neptune: {
    expectedDistance: 30.07,
    expectedMeanAnomaly: 305,
    tolerance: 1.5
  }
};

/**
 * Test orbital mechanics calculations
 */
export function testOrbitalMechanics() {
  console.log('🧪 Testing Orbital Mechanics Calculations...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test each planet
  Object.keys(VALIDATION_DATA_2025).forEach(planetName => {
    const planetData = SOLAR_SYSTEM_DATA[planetName];
    const validation = VALIDATION_DATA_2025[planetName];
    
    if (!planetData) {
      console.error(`❌ Planet data not found: ${planetName}`);
      results.failed++;
      return;
    }
    
    // Calculate current position
    const position = calculateHeliocentricPosition(planetData);
    const astroInfo = calculateAstronomicalInfo(planetName, planetData);
    
    // Test distance from sun
    const distanceError = Math.abs(position.distance - validation.expectedDistance);
    const distancePass = distanceError <= validation.tolerance;
    
    // Test mean anomaly (with wrap-around consideration)
    let anomalyError = Math.abs(astroInfo.meanAnomaly - validation.expectedMeanAnomaly);
    if (anomalyError > 180) {
      anomalyError = 360 - anomalyError; // Handle wrap-around
    }
    const anomalyPass = anomalyError <= 30; // 30 degree tolerance
    
    const testResult = {
      planet: planetName,
      distancePass,
      anomalyPass,
      calculatedDistance: position.distance,
      expectedDistance: validation.expectedDistance,
      distanceError,
      calculatedAnomaly: astroInfo.meanAnomaly,
      expectedAnomaly: validation.expectedMeanAnomaly,
      anomalyError
    };
    
    results.tests.push(testResult);
    
    if (distancePass && anomalyPass) {
      results.passed++;
      console.log(`✅ ${planetName.toUpperCase()}: PASS`);
    } else {
      results.failed++;
      console.log(`❌ ${planetName.toUpperCase()}: FAIL`);
    }
    
    console.log(`   Distance: ${position.distance.toFixed(3)} AU (expected: ${validation.expectedDistance} AU, error: ${distanceError.toFixed(3)})`);
    console.log(`   Mean Anomaly: ${astroInfo.meanAnomaly.toFixed(1)}° (expected: ${validation.expectedMeanAnomaly}°, error: ${anomalyError.toFixed(1)}°)`);
    console.log('');
  });
  
  // Summary
  const total = results.passed + results.failed;
  const passRate = (results.passed / total * 100).toFixed(1);
  
  console.log(`📊 Test Results: ${results.passed}/${total} passed (${passRate}%)`);
  
  if (results.passed === total) {
    console.log('🎉 All astronomical calculations are within acceptable tolerances!');
  } else {
    console.log('⚠️  Some calculations may need refinement.');
  }
  
  return results;
}

/**
 * Test scaling accuracy
 */
export function testScalingAccuracy() {
  console.log('\n🔍 Testing Scaling Accuracy...\n');
  
  const testPlanets = ['mercury', 'earth', 'jupiter', 'neptune'];
  
  testPlanets.forEach(planetName => {
    const planetData = SOLAR_SYSTEM_DATA[planetName];
    
    // Test that relative distances are preserved
    const earthData = SOLAR_SYSTEM_DATA.earth;
    const actualRatio = planetData.semiMajorAxis / earthData.semiMajorAxis;
    
    console.log(`🌍 ${planetName.toUpperCase()} vs Earth:`);
    console.log(`   Actual distance ratio: ${actualRatio.toFixed(3)}`);
    console.log(`   Semi-major axis: ${planetData.semiMajorAxis} AU`);
    console.log(`   Orbital period: ${planetData.orbitalPeriod.toFixed(1)} days`);
    console.log('');
  });
}

/**
 * Test current date calculations
 */
export function testCurrentDateCalculations() {
  console.log('\n📅 Testing Current Date Calculations...\n');
  
  const testDate = new Date('2025-01-01T12:00:00Z');
  console.log(`Test date: ${testDate.toISOString()}`);
  
  // Test a few planets with the specific date
  ['earth', 'mars', 'jupiter'].forEach(planetName => {
    const planetData = SOLAR_SYSTEM_DATA[planetName];
    const astroInfo = calculateAstronomicalInfo(planetName, planetData, testDate);
    
    console.log(`${planetName.toUpperCase()}:`);
    console.log(`   Mean Anomaly: ${astroInfo.meanAnomaly.toFixed(2)}°`);
    console.log(`   True Anomaly: ${astroInfo.trueAnomaly.toFixed(2)}°`);
    console.log(`   Distance: ${astroInfo.distanceFromSun.toFixed(4)} AU`);
    console.log(`   Orbital Velocity: ${astroInfo.orbitalVelocity.toFixed(2)} km/s`);
    console.log('');
  });
}

/**
 * Comprehensive validation suite
 */
export function runAstronomicalValidation() {
  console.log('🚀 Starting Astronomical Validation Suite...\n');
  console.log('=' * 60);
  
  const startTime = performance.now();
  
  // Run all tests
  const orbitalResults = testOrbitalMechanics();
  testScalingAccuracy();
  testCurrentDateCalculations();
  testAstronomicalDistances();
  testVisibilityFromPlanets();
  
  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);
  
  console.log('=' * 60);
  console.log(`✨ Validation completed in ${duration}ms`);
  
  return {
    orbitalMechanics: orbitalResults,
    duration: duration
  };
}

/**
 * Quick validation for development
 */
export function quickValidation() {
  console.log('⚡ Quick Astronomical Validation...\n');
  
  // Test just Earth and Mars for quick feedback
  const testPlanets = ['earth', 'mars'];
  
  testPlanets.forEach(planetName => {
    const planetData = SOLAR_SYSTEM_DATA[planetName];
    const position = calculateHeliocentricPosition(planetData);
    const astroInfo = calculateAstronomicalInfo(planetName, planetData);
    
    console.log(`${planetName.toUpperCase()}:`);
    console.log(`   Position: (${position.x.toFixed(3)}, ${position.y.toFixed(3)}, ${position.z.toFixed(3)}) AU`);
    console.log(`   Distance from Sun: ${position.distance.toFixed(4)} AU`);
    console.log(`   Mean Anomaly: ${astroInfo.meanAnomaly.toFixed(2)}°`);
    console.log('');
  });
  
  console.log('✅ Quick validation complete');
}

/**
 * Test true astronomical distance scaling
 */
export function testAstronomicalDistances() {
  console.log('📏 Testing True Astronomical Distance Scaling...\n');

  // Test distance relationships
  const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  console.log('Distance relationships from Earth:');
  const earthData = SOLAR_SYSTEM_DATA.earth;
  const earthDistance = earthData.semiMajorAxis; // 1 AU

  planets.forEach(planetName => {
    if (planetName === 'earth') return;

    const planetData = SOLAR_SYSTEM_DATA[planetName];
    const planetDistance = planetData.semiMajorAxis;
    const ratio = planetDistance / earthDistance;

    console.log(`   ${planetName.padEnd(8)}: ${planetDistance.toFixed(3)} AU (${ratio.toFixed(1)}x Earth distance)`);

    // Test visibility at true scale
    if (ratio > 10) {
      console.log(`     🔭 At true scale: Would be extremely difficult to see from Earth`);
    } else if (ratio > 5) {
      console.log(`     👁️  At true scale: Would be faint, requiring good conditions`);
    } else {
      console.log(`     ✅ At true scale: Should be visible to naked eye`);
    }
  });

  console.log('\n📐 Angular size calculations (from Earth):');
  planets.forEach(planetName => {
    if (planetName === 'earth') return;

    const planetData = SOLAR_SYSTEM_DATA[planetName];
    const distance = Math.abs(planetData.semiMajorAxis - earthDistance); // Simplified distance
    const radius = planetData.radius; // km

    // Calculate angular size in arcseconds
    const distanceKm = distance * 149597870.7; // Convert AU to km
    const angularSize = (radius / distanceKm) * 206265; // arcseconds

    console.log(`   ${planetName.padEnd(8)}: ${angularSize.toFixed(2)}" (${angularSize < 1 ? 'tiny' : angularSize < 10 ? 'small' : 'visible'} disk)`);
  });

  console.log('✅ Astronomical distance testing complete\n');
}

/**
 * Test visibility from different planetary perspectives
 */
export function testVisibilityFromPlanets() {
  console.log('👁️  Testing Visibility from Different Planets...\n');

  const observers = ['earth', 'mars', 'jupiter'];
  const targets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  observers.forEach(observerName => {
    console.log(`View from ${observerName.toUpperCase()}:`);
    const observerData = SOLAR_SYSTEM_DATA[observerName];
    const observerDistance = observerData.semiMajorAxis;

    targets.forEach(targetName => {
      if (targetName === observerName) return;

      const targetData = SOLAR_SYSTEM_DATA[targetName];
      const targetDistance = targetData.semiMajorAxis;
      const distance = Math.abs(targetDistance - observerDistance);

      let visibility = 'visible';
      if (distance > 20) {
        visibility = 'invisible';
      } else if (distance > 10) {
        visibility = 'telescopic';
      } else if (distance > 5) {
        visibility = 'faint';
      }

      console.log(`   ${targetName.padEnd(8)}: ${distance.toFixed(1)} AU away - ${visibility}`);
    });
    console.log('');
  });

  console.log('✅ Visibility testing complete\n');
}
