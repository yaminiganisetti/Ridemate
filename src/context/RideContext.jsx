import { createContext, useContext, useReducer } from 'react';

const RideContext = createContext(null);

const initialState = {
  pickup: null,
  destination: null,
  vehicleType: 'auto',
  isShared: false,
  passengerCount: 1,
  estimatedFare: null,
  estimatedDistance: null,
  estimatedDuration: null,
  activeRide: null,
  nearbyDrivers: [],
  matchedSharedRides: [],
};

function rideReducer(state, action) {
  switch (action.type) {
    case 'SET_PICKUP': return { ...state, pickup: action.payload };
    case 'SET_DESTINATION': return { ...state, destination: action.payload };
    case 'SET_VEHICLE': return { ...state, vehicleType: action.payload, isShared: action.payload === 'bike' ? false : state.isShared };
    case 'SET_SHARED': return { ...state, isShared: action.payload };
    case 'SET_PASSENGERS': return { ...state, passengerCount: action.payload };
    case 'SET_ESTIMATE': return { ...state, ...action.payload };
    case 'SET_ACTIVE_RIDE': return { ...state, activeRide: action.payload };
    case 'SET_NEARBY_DRIVERS': return { ...state, nearbyDrivers: action.payload };
    case 'SET_MATCHED_RIDES': return { ...state, matchedSharedRides: action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

export function RideProvider({ children }) {
  const [state, dispatch] = useReducer(rideReducer, initialState);
  return (
    <RideContext.Provider value={{ ...state, dispatch }}>
      {children}
    </RideContext.Provider>
  );
}

export const useRide = () => {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error('useRide must be used within RideProvider');
  return ctx;
};
