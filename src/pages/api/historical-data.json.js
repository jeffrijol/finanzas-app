// src/pages/api/historical-data.json.js
export async function GET() {
  try {
    // En desarrollo, servir los datos históricos
    const historicalDataModules = import.meta.glob('../../../content/*.json');
    const historicalDataPromises = Object.values(historicalDataModules).map(module => module());
    const historicalDataResults = await Promise.allSettled(historicalDataPromises);
    
    const historicalData = historicalDataResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(data => data && data.periodo && data.transacciones);

    return new Response(JSON.stringify(historicalData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error loading historical data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}