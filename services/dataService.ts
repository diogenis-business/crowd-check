
import { Location, PopularityData } from '../types';
import { MOCK_PATTERNS } from '../constants';

/**
 * Helper to calculate distance between two coordinates in miles
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

/**
 * Uses Photon API (powered by OpenStreetMap data) for 100% free location searching.
 * Biases results based on user coordinates if provided.
 */
export const searchLocations = async (query: string, userLat?: number, userLng?: number): Promise<Location[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    // Increase limit to 30 to ensure we find local matches even if they aren't the top global match
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=30`;
    
    // Bias results towards the user's location if available
    if (userLat !== undefined && userLng !== undefined) {
      url += `&lat=${userLat}&lon=${userLng}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();

    return (data.features || []).map((feature: any) => {
      const p = feature.properties;
      const coords = feature.geometry.coordinates;
      const lat = coords[1];
      const lng = coords[0];
      
      const addressParts = [
        p.street,
        p.house_number,
        p.city || p.town || p.village,
        p.state,
        p.country
      ].filter(Boolean);

      const location: Location = {
        id: `${p.osm_type || 'osm'}-${p.osm_id || Math.random()}`,
        name: p.name || addressParts[0] || 'Unknown Place',
        category: p.osm_value || p.osm_key || 'Place',
        address: addressParts.join(', ') || 'No address details available',
        lat,
        lng,
      };

      if (userLat !== undefined && userLng !== undefined) {
        location.distance = calculateDistance(userLat, userLng, lat, lng);
      }
      
      return location;
    }).sort((a: Location, b: Location) => {
      // Prioritize nearby results strictly if user coordinates are available
      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    }).slice(0, 10); // Still only show top 10 relevant (closest) results
  } catch (error) {
    console.error('Search error:', error);
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
      live = Math.max(0, Math.min(1, historical + (Math.random() - 0.5) * 0.15));
    }
    return { hour, historical, live };
  });
};
