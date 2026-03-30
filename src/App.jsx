import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, StoreCtx, store } from './store/StoreContext';
import { apiLogin, fetchBookings, fetchTherapists, fetchServices, fetchRooms, fetchUsers } from './api/api';
import { normalizeApiBookings } from './utils/bookingUtils';

import Navbar       from './components/layout/Navbar';
import SubHeader    from './components/layout/SubHeader';
import CalendarView from './components/calendar/CalendarView';
import RightPanel   from './components/panels/RightPanel';
import FilterPanel  from './components/modals/FilterPanel';
import CancelModal  from './components/modals/CancelModal';
import Toasts       from './components/ui/Toasts';

import './styles/index.css';

/* ── Inner app ──────────────────────────────────────────────────────────── */
function AppInner() {
  const dispatch    = useDispatch();
  const bookings    = useSelector((s) => s.bookings);
  const therapists  = useSelector((s) => s.therapists);
  const filter      = useSelector((s) => s.filter);
  const filterOpen  = useSelector((s) => s.filterOpen);
  const cancelModal = useSelector((s) => s.cancelModal);
  const selBkId     = useSelector((s) => s.selectedBkId);
  const selectedDate= useSelector((s) => s.selectedDate);
  const loading     = useSelector((s) => s.loading);

  /* ── Load bookings for the selected date ─────────────────────────────── */
  const loadBookings = useCallback(async (dateStr, therapistList) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const raw = await fetchBookings(dateStr);
      const entries = normalizeApiBookings(raw, therapistList);
      dispatch({ type: 'SET_BOOKINGS', payload: entries });
          dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_BOOKINGS', payload: [] });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', title: 'Failed to load bookings', sub: err.message } });
          dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  /* ── Bootstrap: login → load therapists + services + rooms + users ───── */
  useEffect(() => {
    (async () => {
      const ok = await apiLogin();
      dispatch({
        type: 'ADD_TOAST',
        payload: ok
          ? { type: 'success', title: 'Connected to API', sub: 'Live data loaded' }
          : { type: 'info',    title: 'Demo mode',        sub: 'Using local fallback' },
      });

      // Load all dropdown data in parallel
      const [ths, svcs, usrs] = await Promise.allSettled([
        fetchTherapists(),
        fetchServices(),
        fetchUsers(),
      ]);

      const therapistList = ths.status === 'fulfilled' ? ths.value : [];
      dispatch({ type: 'SET_THERAPISTS', payload: therapistList });
      if (svcs.status === 'fulfilled') dispatch({ type: 'SET_SERVICES', payload: svcs.value });
      if (usrs.status === 'fulfilled') dispatch({ type: 'SET_USERS',    payload: usrs.value });

      // Now load today's bookings (needs therapist list for gender lookup)
      await loadBookings(selectedDate, therapistList);
    })();
  }, []); 

  /* ── Re-fetch bookings whenever the date changes ─────────────────────── */
  useEffect(() => {
    if (therapists.length > 0) {
      loadBookings(selectedDate, therapists);
    }
  }, [selectedDate]); 

  /* ── Re-fetch rooms whenever date changes ───────────────────────────── */
  useEffect(() => {
    fetchRooms(selectedDate)
      .then((rooms) => dispatch({ type: 'SET_ROOMS', payload: rooms }))
      .catch(() => {});
  }, [selectedDate, dispatch]);

  /* ── Expose a global refetch helper (used by CRUD panels) ───────────── */
  // We store it on window so panels can trigger a refresh without prop drilling
  useEffect(() => {
    window.__refreshBookings = () => loadBookings(selectedDate, therapists);
    return () => { delete window.__refreshBookings; };
  }, [selectedDate, therapists, loadBookings]);

  /* ── Filter therapists ──────────────────────────────────────────────── */
  const visibleTherapists = useMemo(() => {
    let list = [...therapists];
    if (filter.groupBy === 'male')   list = list.filter((t) => t.gender === 'male');
    if (filter.groupBy === 'female') list = list.filter((t) => t.gender === 'female');
    if (filter.therapistIds.length)  list = list.filter((t) => filter.therapistIds.includes(t.id));
    return list;
  }, [therapists, filter]);

  /* ── Filter bookings ────────────────────────────────────────────────── */
  const visibleBookings = useMemo(() => {
    if (!filter.statuses.length) return bookings;
    return bookings.filter((b) =>
      filter.statuses.some((s) => b.status?.toLowerCase().includes(s.toLowerCase()))
    );
  }, [bookings, filter.statuses]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />
      <SubHeader />
      <div className="app-body">
        <div className="cal-area">
          {loading && therapists.length === 0 ? (
            <div className="loading"><div className="spin" /><span>Loading…</span></div>
          ) : (
            <CalendarView
              therapists={visibleTherapists}
              bookings={visibleBookings}
              selBkId={selBkId}
              loading={loading}
            />
          )}
        </div>
        <RightPanel />
      </div>
      {filterOpen  && <FilterPanel />}
      {cancelModal && <CancelModal />}
      <Toasts />
    </div>
  );
}

/* ── Root with store provider ───────────────────────────────────────────── */
function App() {
  return (
    <StoreCtx.Provider value={store}>
      <AppInner />
    </StoreCtx.Provider>
  );
}

export default App;
