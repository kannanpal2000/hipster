  import { memo, useRef, useState, useMemo, useEffect } from 'react';
  import { useDispatch } from '../../store/StoreContext';
  import { SLOT_H, SLOTS, COL_W, TGUT, HOURS, fmtH, fmtT12, slot2t } from '../../utils/timeUtils';
  import ThCol from './ThCol';

  const CalendarView = memo(function CalendarView({ therapists, bookings, selBkId, loading }) {
    const dispatch  = useDispatch();
    const scrollRef = useRef(null);
    const hdrRef    = useRef(null);
    const [scrollL,    setScrollL]    = useState(0);
    const [dragTarget, setDragTarget] = useState(null);
    const [draggingId, setDraggingId] = useState(null);

    /* ── Group calendar entries by therapist_id ─────────────────────────── */
    const bkByTh = useMemo(() => {
      const map = {};
      therapists.forEach((t) => { map[t.id] = []; });
      bookings.forEach((b) => {
        if (map[b.therapist_id] !== undefined) map[b.therapist_id].push(b);
      });
      return map;
    }, [bookings, therapists]);

    /* ── Virtual windowing ──────────────────────────────────────────────── */
    const visible = useMemo(() => {
      const vw    = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const start = Math.max(0, Math.floor(scrollL / COL_W) - 2);
      const cols  = Math.ceil((vw - TGUT - 440) / COL_W) + 5;
      return { start, end: Math.min(therapists.length - 1, start + cols) };
    }, [scrollL, therapists.length]);

    /* ── Sync header scroll ─────────────────────────────────────────────── */
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => { if (hdrRef.current) hdrRef.current.scrollLeft = el.scrollLeft; };
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => el.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Drag-and-drop: move optimistically, then re-fetch ──────────────── */
    const handleDrop = (e, thId) => {
      e.preventDefault();
      if (!draggingId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const y    = e.clientY - rect.top;
      const slot = Math.max(0, Math.min(SLOTS - 1, Math.floor(y / SLOT_H)));
      const time = slot2t(slot);
      // Note: for real CRUD, drag-drop would need an editBooking call.
      // For now we show a toast and re-fetch is triggered by parent.
      dispatch({ type: 'ADD_TOAST', payload: { type: 'info', title: 'Use Edit panel to move bookings', sub: `Drop at ${fmtT12(time)}` } });
      setDraggingId(null);
      setDragTarget(null);
    };

    const totalW = therapists.length * COL_W;

    return (
      <div className="cal-container" style={{ position: 'relative' }}>
        {/* Loading overlay */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spin" />
          </div>
        )}

        {/* Therapist header */}
        <div className="th-header">
          <div className="tgut-header" />
          <div className="th-cols-hdr" ref={hdrRef}>
            <div style={{ width: totalW, display: 'flex', flexShrink: 0 }}>
              {therapists.map((t, i) => {
                if (i < visible.start || i > visible.end)
                  return <div key={t.id} style={{ width: COL_W, minWidth: COL_W, borderRight: '1px solid var(--grey-b)', flexShrink: 0 }} />;
                return (
                  <div key={t.id} className="th-col-hdr">
                     <div className="th-position">
                  <div className="th-avatar-wrap">
                    <div className={`th-avatar ${t.gender === 'male' ? 'm' : 'f'}`}>
                      {i+1}
                    </div>
                  </div>
                    <div>
                  <div className="th-name">{t.alias?t.alias:"Not Mentioned"}</div>
                  <div
                    className="th-gen"
                    style={{ color: t.gender === 'male' ? 'var(--blue)' : 'var(--pink)' }}
                  >
                    {t.gender === 'male' ? 'Male' : 'Female'}
                  </div>
                  </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="cal-scroll" ref={scrollRef} onScroll={(e) => setScrollL(e.target.scrollLeft)}>
          <div className="cal-grid" style={{ width: TGUT + totalW }}>
            <div className="tgut">
              {HOURS.map((h) => <div key={h} className="tslot">{fmtH(h)}</div>)}
            </div>
            <div className="th-cols" style={{ width: totalW }}>
              {therapists.map((t, i) => {
                if (i < visible.start || i > visible.end)
                  return <div key={t.id} style={{ width: COL_W, minWidth: COL_W, height: SLOTS * SLOT_H, borderRight: '1px solid var(--grey-b)', flexShrink: 0 }} />;
                return (
                  <ThCol key={t.id} th={t}
                    bookings={bkByTh[t.id] || []}
                    selBkId={selBkId}
                    dragOver={dragTarget === t.id}
                    onDragStart={setDraggingId}
                    onDragOver={setDragTarget}
                    onDrop={handleDrop}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  });

  export default CalendarView;
