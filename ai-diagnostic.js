// AI Diagnostic Tool for Network Navigator
// Run this in the browser console to diagnose AI issues

function diagnoseAI() {
    console.log('🔍 Network Navigator AI Diagnostic Tool');
    console.log('=====================================');
    
    // Check 1: Transformers.js library
    console.log('\n1. Checking Transformers.js library...');
    if (typeof transformers !== 'undefined') {
        console.log('✅ Transformers.js library is loaded');
        console.log('   Version:', transformers.version || 'Unknown');
    } else {
        console.log('❌ Transformers.js library is NOT loaded');
        console.log('   This is likely the main issue.');
        console.log('   Solution: Check your internet connection and try refreshing the page.');
        return;
    }
    
    // Check 2: App instance
    console.log('\n2. Checking Network Navigator app...');
    if (typeof app !== 'undefined') {
        console.log('✅ Network Navigator app is loaded');
        console.log('   Model loaded:', app.modelLoaded);
        console.log('   Model loading:', app.modelLoading);
        console.log('   AI model exists:', !!app.aiModel);
    } else {
        console.log('❌ Network Navigator app is NOT loaded');
        console.log('   Solution: Make sure you\'re on the main app page (index.html)');
        return;
    }
    
    // Check 3: AI Model status
    console.log('\n3. Checking AI Model status...');
    if (app.modelLoaded && app.aiModel) {
        console.log('✅ AI model is loaded and ready');
    } else if (app.modelLoading) {
        console.log('⏳ AI model is currently loading...');
        console.log('   This can take 2-5 minutes on first load');
    } else {
        console.log('❌ AI model is not loaded');
        console.log('   Attempting to reload...');
        app.initializeAIModel();
    }
    
    // Check 4: Network connectivity
    console.log('\n4. Checking network connectivity...');
    fetch('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.2/dist/transformers.min.js', { method: 'HEAD' })
        .then(() => {
            console.log('✅ Network connectivity is good');
        })
        .catch(() => {
            console.log('❌ Network connectivity issues detected');
            console.log('   Solution: Check your internet connection');
        });
    
    // Check 5: Browser compatibility
    console.log('\n5. Checking browser compatibility...');
    const hasWebAssembly = typeof WebAssembly !== 'undefined';
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const hasWebGL = !!document.createElement('canvas').getContext('webgl');
    
    console.log('   WebAssembly:', hasWebAssembly ? '✅' : '❌');
    console.log('   SharedArrayBuffer:', hasSharedArrayBuffer ? '✅' : '❌');
    console.log('   WebGL:', hasWebGL ? '✅' : '❌');
    
    if (!hasWebAssembly) {
        console.log('❌ WebAssembly is required for AI models');
        console.log('   Solution: Update your browser to a modern version');
    }
    
    console.log('\n🔧 Quick Fixes:');
    console.log('1. Refresh the page and wait 2-5 minutes for AI model to load');
    console.log('2. Check your internet connection');
    console.log('3. Try opening the app in a different browser');
    console.log('4. Clear browser cache and cookies');
    console.log('5. The app will work with template-based messages even if AI fails');
}

// Auto-run diagnostic
diagnoseAI();
