/**
 * Engine — Spreads Module
 *
 * Manages spread layout definitions — position coordinates, labels,
 * descriptions, and rotation angles for card placement.
 */
import type { SpreadType, SpreadLayout, SpreadPosition } from '../types';

/** Standard spread layout definitions */
export const SPREAD_LAYOUTS: Record<SpreadType, SpreadLayout> = {
  'three-card': {
    type: 'three-card',
    name: 'Three Card Spread',
    positions: [
      { index: 0, label: 'Past', description: 'What has led to the present', x: 20, y: 50, rotation: 0 },
      { index: 1, label: 'Present', description: 'The current situation', x: 50, y: 50, rotation: 0 },
      { index: 2, label: 'Future', description: 'What lies ahead', x: 80, y: 50, rotation: 0 },
    ],
  },
  'celtic-cross': {
    type: 'celtic-cross',
    name: 'Celtic Cross',
    positions: [
      { index: 0, label: 'Present', description: 'The current situation', x: 30, y: 50, rotation: 0 },
      { index: 1, label: 'Challenge', description: 'The immediate challenge', x: 30, y: 50, rotation: 90 },
      { index: 2, label: 'Foundation', description: 'The basis of the situation', x: 30, y: 80, rotation: 0 },
      { index: 3, label: 'Recent Past', description: 'Recent influences', x: 10, y: 50, rotation: 0 },
      { index: 4, label: 'Crown', description: 'Best possible outcome', x: 30, y: 20, rotation: 0 },
      { index: 5, label: 'Near Future', description: 'What comes next', x: 50, y: 50, rotation: 0 },
      { index: 6, label: 'Self', description: 'Your attitude', x: 70, y: 80, rotation: 0 },
      { index: 7, label: 'Environment', description: 'External influences', x: 70, y: 60, rotation: 0 },
      { index: 8, label: 'Hopes/Fears', description: 'Hopes and fears', x: 70, y: 40, rotation: 0 },
      { index: 9, label: 'Outcome', description: 'Final outcome', x: 70, y: 20, rotation: 0 },
    ],
  },
  horseshoe: {
    type: 'horseshoe',
    name: 'Horseshoe Spread',
    positions: [
      { index: 0, label: 'Past', description: 'Past influences', x: 10, y: 70, rotation: 0 },
      { index: 1, label: 'Present', description: 'Current situation', x: 22, y: 45, rotation: 0 },
      { index: 2, label: 'Hidden', description: 'Hidden influences', x: 37, y: 25, rotation: 0 },
      { index: 3, label: 'Obstacle', description: 'Main obstacle', x: 50, y: 15, rotation: 0 },
      { index: 4, label: 'Environment', description: 'External influences', x: 63, y: 25, rotation: 0 },
      { index: 5, label: 'Advice', description: 'Recommended action', x: 78, y: 45, rotation: 0 },
      { index: 6, label: 'Outcome', description: 'Likely outcome', x: 90, y: 70, rotation: 0 },
    ],
  },
  star: {
    type: 'star',
    name: 'Star Spread',
    positions: [
      { index: 0, label: 'Self', description: 'Your current state', x: 50, y: 15, rotation: 0 },
      { index: 1, label: 'Spiritual', description: 'Spiritual aspect', x: 80, y: 40, rotation: 0 },
      { index: 2, label: 'Material', description: 'Material aspect', x: 68, y: 75, rotation: 0 },
      { index: 3, label: 'Emotional', description: 'Emotional aspect', x: 32, y: 75, rotation: 0 },
      { index: 4, label: 'Mental', description: 'Mental aspect', x: 20, y: 40, rotation: 0 },
      { index: 5, label: 'Synthesis', description: 'Overall synthesis', x: 50, y: 50, rotation: 0 },
    ],
  },
  custom: {
    type: 'custom',
    name: 'Custom Spread',
    positions: [],
  },
};

/**
 * Get a spread layout by type
 */
export function getSpreadLayout(type: SpreadType): SpreadLayout {
  return SPREAD_LAYOUTS[type] ?? SPREAD_LAYOUTS['three-card'];
}

/**
 * Get the positions for a given spread type
 */
export function getSpreadPositions(type: SpreadType): SpreadPosition[] {
  return getSpreadLayout(type).positions;
}

/**
 * Get default card count for a spread type
 */
export function getDefaultCardCount(type: SpreadType): number {
  return getSpreadLayout(type).positions.length || 3;
}

/**
 * All available spread types with metadata
 */
export const SPREAD_OPTIONS: { type: SpreadType; label: string; cards: number; desc: string }[] = [
  { type: 'three-card', label: 'Three Card', cards: 3, desc: 'Past, Present, Future' },
  { type: 'celtic-cross', label: 'Celtic Cross', cards: 10, desc: 'Classic 10-card spread' },
  { type: 'horseshoe', label: 'Horseshoe', cards: 7, desc: '7-card arc spread' },
  { type: 'star', label: 'Star', cards: 6, desc: '6-point star layout' },
];
