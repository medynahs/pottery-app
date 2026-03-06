// redux or context setup for global state

import { GlobalState } from '../types';

// placeholder store; replace with real implementation (Redux, MobX etc.)

export const initialState: GlobalState = {};

export function createStore() {
  return {
    state: initialState,
    // dispatch, subscribe, etc.
  };
}
