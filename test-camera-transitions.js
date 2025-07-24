/**
 * Test script for camera transitions
 * Run this in the browser console to test camera behavior
 */

// Test function to check camera transitions
function testCameraTransitions() {
  console.log('🧪 Starting camera transition tests...');
  
  // Check if the app is available
  if (!window.solarSystemApp) {
    console.error('❌ Solar system app not found. Make sure the app is loaded.');
    return;
  }
  
  const app = window.solarSystemApp;
  const sceneManager = app.sceneManager;
  const navigationControls = app.navigationControls;
  
  if (!sceneManager || !navigationControls) {
    console.error('❌ Scene manager or navigation controls not found.');
    return;
  }
  
  // Test sequence of planet visits
  const testPlanets = ['earth', 'mars', 'jupiter', 'saturn'];
  let currentIndex = 0;
  
  function testNextPlanet() {
    if (currentIndex >= testPlanets.length) {
      console.log('✅ All camera transition tests completed!');
      return;
    }
    
    const planet = testPlanets[currentIndex];
    console.log(`🚀 Testing transition to ${planet}...`);
    
    // Record camera position before transition
    const beforePosition = sceneManager.camera.position.clone();
    console.log(`📍 Camera position before transition:`, beforePosition.toArray().map(v => v.toFixed(3)));
    
    // Start transition
    sceneManager.travelTo(planet, 2.0).then(() => {
      // Record camera position after transition
      const afterPosition = sceneManager.camera.position.clone();
      console.log(`📍 Camera position after transition:`, afterPosition.toArray().map(v => v.toFixed(3)));
      
      // Wait a bit to observe any potential camera jumps
      setTimeout(() => {
        const finalPosition = sceneManager.camera.position.clone();
        const drift = afterPosition.distanceTo(finalPosition);
        
        if (drift > 0.1) {
          console.warn(`⚠️ Camera drift detected for ${planet}: ${drift.toFixed(3)} units`);
        } else {
          console.log(`✅ Camera stable for ${planet} (drift: ${drift.toFixed(3)} units)`);
        }
        
        // Move to next planet
        currentIndex++;
        setTimeout(testNextPlanet, 1000); // Wait 1 second before next test
      }, 500); // Wait 500ms to check for drift
    }).catch(error => {
      console.error(`❌ Failed to travel to ${planet}:`, error);
      currentIndex++;
      setTimeout(testNextPlanet, 1000);
    });
  }
  
  // Start the test sequence
  testNextPlanet();
}

// Test function to manually trigger a planet transition
function testPlanetTransition(planetName) {
  if (!window.solarSystemApp) {
    console.error('❌ Solar system app not found.');
    return;
  }
  
  const sceneManager = window.solarSystemApp.sceneManager;
  if (!sceneManager) {
    console.error('❌ Scene manager not found.');
    return;
  }
  
  console.log(`🧪 Testing manual transition to ${planetName}...`);
  
  // Record positions
  const beforePosition = sceneManager.camera.position.clone();
  console.log(`📍 Before:`, beforePosition.toArray().map(v => v.toFixed(3)));
  
  sceneManager.travelTo(planetName, 1.0).then(() => {
    const afterPosition = sceneManager.camera.position.clone();
    console.log(`📍 After:`, afterPosition.toArray().map(v => v.toFixed(3)));
    
    // Check for drift after 1 second
    setTimeout(() => {
      const finalPosition = sceneManager.camera.position.clone();
      const drift = afterPosition.distanceTo(finalPosition);
      console.log(`📊 Drift check: ${drift.toFixed(3)} units`);
    }, 1000);
  });
}

// Make functions available globally
window.testCameraTransitions = testCameraTransitions;
window.testPlanetTransition = testPlanetTransition;

console.log('🧪 Camera transition test functions loaded!');
console.log('Run testCameraTransitions() to test all planets');
console.log('Run testPlanetTransition("planetName") to test a specific planet');
