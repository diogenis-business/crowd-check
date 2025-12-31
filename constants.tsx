
import React from 'react';

export const PLACE_CATEGORIES = [
  { id: 'gym', label: 'Gyms', icon: '🏋️' },
  { id: 'cafe', label: 'Cafés', icon: '☕' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍴' },
  { id: 'supermarket', label: 'Groceries', icon: '🛒' },
  { id: 'park', label: 'Parks', icon: '🌳' },
];

export const MOCK_PATTERNS: Record<string, number[]> = {
  gym: [5, 5, 5, 10, 20, 45, 80, 75, 50, 40, 45, 50, 55, 60, 65, 75, 90, 85, 60, 40, 20, 10, 5, 5],
  cafe: [0, 0, 0, 0, 10, 40, 70, 90, 85, 80, 75, 85, 95, 80, 60, 50, 40, 30, 10, 0, 0, 0, 0, 0],
  restaurant: [0, 0, 0, 0, 0, 0, 0, 10, 20, 30, 45, 80, 90, 70, 50, 55, 75, 95, 100, 85, 60, 30, 10, 5],
  supermarket: [0, 0, 0, 0, 0, 0, 5, 20, 40, 55, 60, 70, 80, 85, 75, 80, 95, 90, 60, 40, 20, 10, 5, 0],
  park: [0, 0, 0, 0, 0, 5, 15, 25, 35, 45, 60, 75, 90, 95, 85, 75, 60, 40, 20, 10, 5, 0, 0, 0],
  default: [10, 10, 10, 10, 15, 30, 50, 70, 80, 80, 70, 65, 70, 75, 70, 75, 85, 90, 80, 60, 40, 25, 15, 10],
};
