/**
 * Test script to verify texture loading
 */

import { SOLAR_SYSTEM_DATA, MOONS_DATA } from './src/js/data/SolarSystemData.js';

// Function to check if a texture file exists
async function checkTexture(path) {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Test all configured textures
async function testTextures() {
  console.log('🧪 Testing texture availability...\n');
  
  const allBodies = { ...SOLAR_SYSTEM_DATA, ...MOONS_DATA };
  let totalTextures = 0;
  let loadedTextures = 0;
  let missingTextures = [];
  
  for (const [bodyName, bodyData] of Object.entries(allBodies)) {
    console.log(`Testing ${bodyName}:`);
    
    if (bodyData.textures) {
      for (const [textureType, texturePath] of Object.entries(bodyData.textures)) {
        if (texturePath) {
          totalTextures++;
          const exists = await checkTexture(texturePath);
          
          if (exists) {
            console.log(`  ✅ ${textureType}: ${texturePath}`);
            loadedTextures++;
          } else {
            console.log(`  ❌ ${textureType}: ${texturePath}`);
            missingTextures.push(`${bodyName}.${textureType}: ${texturePath}`);
          }
        }
      }
    }
    
    // Check ring textures for Saturn
    if (bodyData.rings && bodyData.rings.texture) {
      totalTextures++;
      const exists = await checkTexture(bodyData.rings.texture);
      
      if (exists) {
        console.log(`  ✅ rings: ${bodyData.rings.texture}`);
        loadedTextures++;
      } else {
        console.log(`  ❌ rings: ${bodyData.rings.texture}`);
        missingTextures.push(`${bodyName}.rings: ${bodyData.rings.texture}`);
      }
    }
    
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log(`Total textures: ${totalTextures}`);
  console.log(`Loaded successfully: ${loadedTextures}`);
  console.log(`Missing: ${totalTextures - loadedTextures}`);
  
  if (missingTextures.length > 0) {
    console.log('\n❌ Missing textures:');
    missingTextures.forEach(texture => console.log(`  - ${texture}`));
  } else {
    console.log('\n🎉 All textures are available!');
  }
  
  return {
    total: totalTextures,
    loaded: loadedTextures,
    missing: missingTextures
  };
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testTextures().then(results => {
    console.log('Texture test completed:', results);
  });
} else {
  // Node.js environment - export for use in other scripts
  export { testTextures, checkTexture };
}
