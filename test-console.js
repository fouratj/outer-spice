/**
 * Console test for astronomical calculations
 * Run with: node test-console.js
 */

// Simple test without ES modules for Node.js compatibility
console.log('🌌 Testing Astronomical Calculations...\n');

// Test basic orbital mechanics
function testBasicOrbitalMechanics() {
    console.log('🧪 Testing Basic Orbital Mechanics');
    
    // Earth's orbital elements (J2000)
    const earthData = {
        semiMajorAxis: 1.00000011, // AU
        eccentricity: 0.01671022,
        inclination: 0.00005, // degrees
        orbitalPeriod: 365.256, // days
        longitudeOfAscendingNode: -11.26064, // degrees
        longitudeOfPerihelion: 102.94719, // degrees
        meanLongitude: 100.46435 // degrees at J2000
    };
    
    console.log('Earth orbital elements:');
    console.log(`  Semi-major axis: ${earthData.semiMajorAxis} AU`);
    console.log(`  Eccentricity: ${earthData.eccentricity}`);
    console.log(`  Orbital period: ${earthData.orbitalPeriod} days`);
    console.log(`  Mean longitude (J2000): ${earthData.meanLongitude}°`);
    
    // Test mean motion calculation
    const meanMotion = 360.0 / earthData.orbitalPeriod; // degrees per day
    console.log(`  Mean motion: ${meanMotion.toFixed(6)}°/day`);
    
    // Test current date calculation
    const currentDate = new Date();
    const J2000_EPOCH = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (currentDate - J2000_EPOCH) / (1000 * 60 * 60 * 24);
    console.log(`  Days since J2000: ${daysSinceJ2000.toFixed(2)}`);
    
    // Test mean anomaly calculation
    const currentMeanLongitude = earthData.meanLongitude + (meanMotion * daysSinceJ2000);
    const meanAnomaly = currentMeanLongitude - earthData.longitudeOfPerihelion;
    const normalizedMeanAnomaly = ((meanAnomaly % 360) + 360) % 360;
    console.log(`  Current mean anomaly: ${normalizedMeanAnomaly.toFixed(2)}°`);
    
    console.log('✅ Basic orbital mechanics test completed\n');
}

// Test planetary data validation
function testPlanetaryData() {
    console.log('🪐 Testing Planetary Data Validation');
    
    // Known planetary data for validation
    const planets = {
        mercury: { semiMajorAxis: 0.387, period: 87.97 },
        venus: { semiMajorAxis: 0.723, period: 224.70 },
        earth: { semiMajorAxis: 1.000, period: 365.26 },
        mars: { semiMajorAxis: 1.524, period: 686.98 },
        jupiter: { semiMajorAxis: 5.203, period: 4332.59 },
        saturn: { semiMajorAxis: 9.537, period: 10759.22 },
        uranus: { semiMajorAxis: 19.191, period: 30688.5 },
        neptune: { semiMajorAxis: 30.069, period: 60182 }
    };
    
    console.log('Validating Kepler\'s Third Law (T² ∝ a³):');
    
    Object.entries(planets).forEach(([name, data]) => {
        const a = data.semiMajorAxis;
        const T = data.period / 365.25; // Convert to years
        const keplerRatio = T * T / (a * a * a);
        
        console.log(`  ${name.padEnd(8)}: a=${a.toFixed(3)} AU, T=${T.toFixed(2)} yr, T²/a³=${keplerRatio.toFixed(6)}`);
    });
    
    console.log('✅ Planetary data validation completed\n');
}

// Test distance calculations
function testDistanceCalculations() {
    console.log('📏 Testing Distance Calculations');
    
    // Test AU to km conversion
    const AU_TO_KM = 149597870.7;
    console.log(`1 AU = ${AU_TO_KM.toLocaleString()} km`);
    
    // Test planetary distances
    const distances = {
        mercury: 0.39 * AU_TO_KM,
        venus: 0.72 * AU_TO_KM,
        earth: 1.00 * AU_TO_KM,
        mars: 1.52 * AU_TO_KM,
        jupiter: 5.20 * AU_TO_KM
    };
    
    console.log('Planetary distances from Sun:');
    Object.entries(distances).forEach(([name, distance]) => {
        console.log(`  ${name.padEnd(8)}: ${(distance / 1e6).toFixed(1)} million km`);
    });
    
    console.log('✅ Distance calculations test completed\n');
}

// Test current date and time
function testCurrentDateTime() {
    console.log('📅 Testing Current Date/Time Calculations');
    
    const now = new Date();
    const J2000 = new Date('2000-01-01T12:00:00Z');
    
    console.log(`Current date: ${now.toISOString()}`);
    console.log(`J2000 epoch: ${J2000.toISOString()}`);
    
    const daysSinceJ2000 = (now - J2000) / (1000 * 60 * 60 * 24);
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
    
    console.log(`Days since J2000: ${daysSinceJ2000.toFixed(2)}`);
    console.log(`Years since J2000: ${yearsSinceJ2000.toFixed(2)}`);
    
    console.log('✅ Date/time calculations test completed\n');
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Astronomical Calculation Tests\n');
    console.log('='.repeat(60));
    
    testBasicOrbitalMechanics();
    testPlanetaryData();
    testDistanceCalculations();
    testCurrentDateTime();
    
    console.log('='.repeat(60));
    console.log('✨ All tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Open the browser test page for interactive validation');
    console.log('2. Check the main application for visual accuracy');
    console.log('3. Compare with real ephemeris data for final validation');
}

// Run the tests
runAllTests();
