// Simple test to verify basic functionality
console.log('🧪 Testing basic functionality...')

// Test 1: Check if projects can be loaded
async function testProjectLoading() {
  try {
    console.log('📝 Testing project loading...')
    
    const response = await fetch('/api/mentions/status')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Project loading works:', {
        success: data.success,
        brandTrackingCount: data.brandTracking?.length || 0,
        hasData: !!data.brandTracking
      })
    } else {
      console.error('❌ Project loading failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ Project loading error:', error)
  }
}

// Test 2: Check if project creation works
async function testProjectCreation() {
  try {
    console.log('📝 Testing project creation...')
    
    const testProject = {
      brandName: 'Test Brand',
      description: 'Test Description',
      website: 'https://test.com',
      keywords: ['test'],
      topics: ['Test topic']
    }
    
    const response = await fetch('/api/mentions/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProject)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Project creation works:', {
        success: data.success,
        trackingId: data.tracking?.id
      })
    } else {
      const error = await response.json()
      console.error('❌ Project creation failed:', error)
    }
  } catch (error) {
    console.error('❌ Project creation error:', error)
  }
}

// Run tests
console.log('🚀 Starting tests...')
testProjectLoading()
  .then(() => testProjectCreation())
  .then(() => console.log('✅ All tests completed'))
  .catch(error => console.error('❌ Test suite failed:', error))
