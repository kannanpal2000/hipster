import { createStore } from 'redux';

/* ── Initial State ─────────────────────────────────────────────────────── */
const INITIAL_STATE = {
  bookings:     [],      // flat calendar entries (normalised from API)
  therapists:   [],      // from API
  services:     [],      // from API  (used in Create/Edit dropdowns)
  rooms:        [],      // from API  (used in Create/Edit dropdowns)
  users:        [],      // from API  (client search)
  loading:      true,

  selectedDate: new Date().toISOString().slice(0, 10),
  panelMode:    null,
  selectedBkId: null,
  newSlot:      null,
  filterOpen:   false,
  cancelModal:  false,
  cancelTarget: null,
  toasts:       [],
  searchQ:      '',
  filter: {
    groupBy:      'all',
    statuses:     [],
    therapistIds: [],
  },
};

/* ── Reducer ───────────────────────────────────────────────────────────── */
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    /* ── Data loading ── */
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload, loading: false };
    case 'SET_THERAPISTS':
      return { ...state, therapists: action.payload };
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };

    /* ── Date ── */
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, loading: true };

    /* ── Panel ── */
    case 'OPEN_PANEL':
      return { ...state, panelMode: action.mode, selectedBkId: action.bkId || null, newSlot: action.slot || null };
    case 'CLOSE_PANEL':
      return { ...state, panelMode: null, selectedBkId: null, newSlot: null };

    /* ── Filter ── */
    case 'OPEN_FILTER':   return { ...state, filterOpen: true };
    case 'CLOSE_FILTER':  return { ...state, filterOpen: false };
    case 'SET_FILTER':    return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'CLEAR_FILTER':  return { ...state, filter: { groupBy: 'all', statuses: [], therapistIds: [] } };

    /* ── Cancel modal ── */
    case 'OPEN_CANCEL':   return { ...state, cancelModal: true,  cancelTarget: action.payload };
    case 'CLOSE_CANCEL':  return { ...state, cancelModal: false, cancelTarget: null };

    /* ── Toasts ── */
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now() + Math.random(), ...action.payload }] };
    case 'RM_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    /* ── Search ── */
    case 'SET_SEARCH':
      return { ...state, searchQ: action.q };

    /* ── Local optimistic updates (keep UI snappy before re-fetch) ── */
    case 'SET_STATUS':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.booking_id === action.id ? { ...b, status: action.status } : b
        ),
      };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.booking_id === action.id ? { ...b, status: 'Cancelled' } : b
        ),
      };
    case 'DELETE_BOOKING':
      return { ...state, bookings: state.bookings.filter((b) => b.booking_id !== action.id) };

    default:
      return state;
  }
}

const store = createStore(reducer);
export default store;
