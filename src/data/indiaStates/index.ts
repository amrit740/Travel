import { IndiaState, StateDestination, StateAttraction, StateItineraryTemplate, StateFoodItem } from '../../types/indiaStates';
import { SOUTH_INDIAN_STATES } from './statesSouth';
import { WEST_INDIAN_STATES } from './statesWest';
import { EAST_INDIAN_STATES } from './statesEast';
import { CENTRAL_INDIAN_STATES } from './statesCentral';
import { NORTH_INDIAN_STATES } from './statesNorth';
import { NORTH_EAST_STATES_PART1 } from './statesNorthEastPart1';
import { NORTH_EAST_STATES_PART2 } from './statesNorthEastPart2';

export const NORTH_EAST_INDIAN_STATES: IndiaState[] = [
  ...NORTH_EAST_STATES_PART1,
  ...NORTH_EAST_STATES_PART2,
];

export const ALL_INDIA_STATES: IndiaState[] = [
  ...SOUTH_INDIAN_STATES,
  ...WEST_INDIAN_STATES,
  ...EAST_INDIAN_STATES,
  ...CENTRAL_INDIAN_STATES,
  ...NORTH_INDIAN_STATES,
  ...NORTH_EAST_INDIAN_STATES,
];

export const INDIA_STATES_BY_REGION: Record<string, IndiaState[]> = {
  'South India': SOUTH_INDIAN_STATES,
  'West India': WEST_INDIAN_STATES,
  'East India': EAST_INDIAN_STATES,
  'Central India': CENTRAL_INDIAN_STATES,
  'North India': NORTH_INDIAN_STATES,
  'North East India': NORTH_EAST_INDIAN_STATES,
};

export const INDIA_STATES_BY_ID: Record<string, IndiaState> = ALL_INDIA_STATES.reduce(
  (acc, state) => {
    acc[state.id] = state;
    return acc;
  },
  {} as Record<string, IndiaState>
);

export function getStateById(id: string): IndiaState | undefined {
  if (!id) return undefined;
  return INDIA_STATES_BY_ID[id.toLowerCase().trim()];
}

export function getStateByName(name: string): IndiaState | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return ALL_INDIA_STATES.find(
    (s) => s.name.toLowerCase() === lower || s.id.toLowerCase() === lower
  );
}

export function getAllDestinations(): Array<StateDestination & { state_id: string; state_name: string }> {
  return ALL_INDIA_STATES.flatMap((state) =>
    state.destinations.map((dest) => ({
      ...dest,
      state_id: state.id,
      state_name: state.name,
    }))
  );
}

export function getAllAttractions(): Array<StateAttraction & { destination_id: string; destination_name: string; state_id: string; state_name: string }> {
  return ALL_INDIA_STATES.flatMap((state) =>
    state.destinations.flatMap((dest) =>
      dest.attractions.map((att) => ({
        ...att,
        destination_id: dest.id,
        destination_name: dest.name,
        state_id: state.id,
        state_name: state.name,
      }))
    )
  );
}

export function getDestinationsByState(stateId: string): StateDestination[] {
  const state = getStateById(stateId);
  return state ? state.destinations : [];
}

export function searchStates(query: string): IndiaState[] {
  if (!query || !query.trim()) return ALL_INDIA_STATES;
  const q = query.toLowerCase().trim();
  return ALL_INDIA_STATES.filter((state) => {
    return (
      state.name.toLowerCase().includes(q) ||
      state.capital.toLowerCase().includes(q) ||
      state.description.toLowerCase().includes(q) ||
      state.best_known_for.some((b) => b.toLowerCase().includes(q)) ||
      state.popular_themes.some((t) => t.toLowerCase().includes(q)) ||
      state.major_languages.some((l) => l.toLowerCase().includes(q)) ||
      state.destinations.some(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.attractions.some((a) => a.name.toLowerCase().includes(q))
      )
    );
  });
}

export function filterStatesByTheme(theme: string): IndiaState[] {
  if (!theme || theme === 'All') return ALL_INDIA_STATES;
  const t = theme.toLowerCase();
  return ALL_INDIA_STATES.filter((state) =>
    state.popular_themes.some((pt) => pt.toLowerCase().includes(t)) ||
    state.destinations.some((d) => d.type.toLowerCase().includes(t))
  );
}

export function filterStatesByMonth(month: string): IndiaState[] {
  if (!month || month === 'All') return ALL_INDIA_STATES;
  const m = month.toLowerCase();
  return ALL_INDIA_STATES.filter((state) =>
    state.recommended_months.some((rm) => rm.toLowerCase().includes(m))
  );
}

export function getAllStateItineraries(): Array<StateItineraryTemplate & { state_id: string; state_name: string }> {
  return ALL_INDIA_STATES.flatMap((state) =>
    state.sample_itineraries.map((itinerary) => ({
      ...itinerary,
      state_id: state.id,
      state_name: state.name,
    }))
  );
}

export function getAllStateFoods(): Array<StateFoodItem & { state_id: string; state_name: string }> {
  return ALL_INDIA_STATES.flatMap((state) =>
    state.food.map((foodItem) => ({
      ...foodItem,
      state_id: state.id,
      state_name: state.name,
    }))
  );
}

export {
  SOUTH_INDIAN_STATES,
  WEST_INDIAN_STATES,
  EAST_INDIAN_STATES,
  CENTRAL_INDIAN_STATES,
  NORTH_INDIAN_STATES,
  NORTH_EAST_STATES_PART1,
  NORTH_EAST_STATES_PART2,
};
