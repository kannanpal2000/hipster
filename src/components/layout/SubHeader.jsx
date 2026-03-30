import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';
import { addDays, fmtDate } from '../../utils/timeUtils';

const SubHeader = memo(function SubHeader() {
  const dispatch     = useDispatch();
  const selectedDate = useSelector((s) => s.selectedDate);
  const searchQ      = useSelector((s) => s.searchQ);
  const users        = useSelector((s) => s.users);   // ← from API
  const [showDD, setShowDD] = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return users.slice(0, 6);
    return users.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.contact_number || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    ).slice(0, 10);
  }, [searchQ, users]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDD(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const highlight = (text) => {
    const q = searchQ.trim();
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="hl">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="sub">
      <div className="outlet-sel">
        <div>
          <div className="outlet-name">Clarke Quay</div>
          <div className="outlet-disp">Display: 15 Min ▾</div>
        </div>
        <span style={{ color: 'var(--grey-t)', fontSize: 11, marginLeft: 4 }}>▾</span>
      </div>


      {/* Right controls */}
      <div className="sub-r">

      {/* Search */}
      <div className="search-wrap" ref={ref}>
        <span className="search-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input className="search-input" placeholder="Search Sales by phone/name"
          value={searchQ}
          onChange={(e) => { dispatch({ type: 'SET_SEARCH', q: e.target.value }); setShowDD(true); }}
          onFocus={() => setShowDD(true)} />
        {showDD && filtered.length > 0 && (
          <div className="search-dd">
            {filtered.map((c, i) => (
              <div key={c.id} className={`search-item${i === 0 && searchQ ? ' hi' : ''}`}
                onMouseDown={() => { dispatch({ type: 'SET_SEARCH', q: c.name || `User ${c.id}` }); setShowDD(false); }}>
                <div className="si-name">{highlight(c.name || `User ${c.id}`)}</div>
                <div className="si-phone">{c.contact_number || c.email || '—'}</div>
              </div>
            ))}
          </div>
        )}
        </div>
        <button className="filter-btn" onClick={() => dispatch({ type: 'OPEN_FILTER' })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filter
        </button>
        <div className="date-nav">
          <button className="today-btn" onClick={() => dispatch({ type: 'SET_DATE', payload: new Date().toISOString().slice(0, 10) })}>Today</button>
          <button className="dnb" onClick={() => dispatch({ type: 'SET_DATE', payload: addDays(selectedDate, -1) })}>‹</button>
          <span className="date-disp">{fmtDate(selectedDate)}</span>
          <button className="dnb" onClick={() => dispatch({ type: 'SET_DATE', payload: addDays(selectedDate, 1) })}>›</button>
          <button className="cal-icon" title="Calendar">📅</button>
        </div>
      </div>
    </div>
  );
});

export default SubHeader;
