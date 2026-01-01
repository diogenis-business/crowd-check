
export interface Location {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number; // Distance in kilometers
}

export interface PopularityData {
  hour: number;
  historical: number; // 0 to 1
  live?: number;      // 0 to 1
}

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
}
