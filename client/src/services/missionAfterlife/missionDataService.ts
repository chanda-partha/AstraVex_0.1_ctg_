/**
 * MISSION AFTERLIFE — Data Service
 * Provides access to the full mission registry.
 */

import type { MADestination, MAMissionData } from '../../types/missionAfterlife';
import { LUNAR_AFTERLIFE_MISSIONS } from '../../data/missionAfterlife/lunarMissions';
import { MARS_AFTERLIFE_MISSIONS } from '../../data/missionAfterlife/marsMissions';

export function getAllAfterlifeMissions(): MAMissionData[] {
  return [...LUNAR_AFTERLIFE_MISSIONS, ...MARS_AFTERLIFE_MISSIONS];
}

export function getMissionsByDestination(destination: MADestination): MAMissionData[] {
  return destination === 'Moon' ? LUNAR_AFTERLIFE_MISSIONS : MARS_AFTERLIFE_MISSIONS;
}

export function getMissionById(id: string): MAMissionData | undefined {
  return getAllAfterlifeMissions().find((m) => m.id === id);
}

export function getDefaultMission(destination: MADestination): MAMissionData {
  return destination === 'Moon' ? LUNAR_AFTERLIFE_MISSIONS[0] : MARS_AFTERLIFE_MISSIONS[0];
}

