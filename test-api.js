async function testDataForSEO() {
  const login = 'yavor@effectivemarketer.com';
  const password = '9b8140d8b2dff367';
  const credentials = `${login}:${password}`;
  const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;

  console.log('Testing DataForSEO API...');
  console.log('Login:', login);
  console.log('Password:', password ? '***' : 'MISSING');
  console.log('Auth Header:', authHeader.substring(0, 20) + '...');

  try {
    const response = await fetch('https://api.dataforseo.com/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        language_name: "English",
        location_code: 2840, // US
        keywords: ["test"]
      }])
    });

    console.log('Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDataForSEO();
