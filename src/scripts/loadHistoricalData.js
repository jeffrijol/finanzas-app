// src/scripts/loadHistoricalData.js
export async function loadHistoricalData() {
  try {
    // En producción, Astro inyectará los datos via script tag
    // En desarrollo, podemos cargarlos via fetch si es necesario
    if (import.meta.env.DEV) {
      // Intentar cargar datos históricos via fetch (solo para desarrollo)
      const response = await fetch('/api/historical-data');
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.error('Error cargando datos históricos:', error);
  }
  return [];
}