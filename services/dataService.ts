
import { Location, PopularityData } from '../types';
import { MOCK_PATTERNS } from '../constants';

/**
 * Uses Photon API (powered by OpenStreetMap data) for 100% free location searching.
 * Photon is faster and more permissive than Nominatim for client-side 'as-you-type' search.
 */
export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    // Photon is an open-source geocoding API that is very friendly for client-side fetch.
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();

    // Photon returns GeoJSON. We map 'features' to our internal 'Location' type.
    return (data.features || []).map((feature: any) => {
      const p = feature.properties;
      const coords = feature.geometry.coordinates;
      
      // Construct a clean display address from available components
      const addressParts = [
        p.street,
        p.house_number,
        p.city || p.town || p.village,
        p.state,
        p.country
      ].filter(Boolean);
      
      return {
        id: `${p.osm_type || 'osm'}-${p.osm_id || Math.random()}`,
        name: p.name || addressParts[0] || 'Unknown Place',
        // 'osm_value' often contains the category like 'cafe', 'restaurant', 'gym'
        category: p.osm_value || p.osm_key || 'Place',
        address: addressParts.join(', ') || 'No address details available',
        lat: coords[1],
        lng: coords[0],
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    // Return an empty array so the UI can handle the failure gracefully
    return [];
  }
};

/**
 * Generates busyness data based on category mapping to mock patterns.
 */
export const getBusynessData = (category: string): PopularityData[] => {
  const catKey = Object.keys(MOCK_PATTERNS).find(k => 
    category.toLowerCase().includes(k)
  ) || 'default';
  
  const pattern = MOCK_PATTERNS[catKey];
  const currentHour = new Date().getHours();
  
  return Array.from({ length: 24 }, (_, hour) => {
    const historical = pattern[hour] / 100;
    let live = undefined;
    if (hour === currentHour) {
      // Simulate live busyness with a slight random variance from historical
      live = Math.max(0, Math.min(1, historical + (Math.random() - 0.5) * 0.15));
    }
    return { hour, historical, live };
  });
};
