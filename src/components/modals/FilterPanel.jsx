import { memo, useState } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';

const STATUSES = [
  { k: 'Confirmed',              c: '#3B82F6' },
  { k: 'Unconfirmed',            c: '#F59E0B' },
  { k: 'Checked In',             c: '#EC4899' },
  { k: 'Completed',              c: '#10B981' },
  { k: 'Cancelled',              c: '#9CA3AF' },
  { k: 'No Show',                c: '#6B7280' },
  { k: 'Holding',                c: '#8B5CF6' },
  { k: 'Check-in (In Progress)', c: '#F472B6' },
];

const FilterPanel = memo(function FilterPanel() {
  const dispatch   = useDispatch();
  const filter     = useSelector((s) => s.filter);
  const therapists = useSelector((s) => s.therapists);
  const [thQ, setThQ] = useState('');

  const { groupBy, statuses, therapistIds } = filter;

  const toggleStatus = (k) => {
    const next = statuses.includes(k)
      ? statuses.filter((s) => s !== k)
      : [...statuses, k];
    dispatch({ type: 'SET_FILTER', payload: { statuses: next } });
  };

  const toggleTherapist = (id) => {
    const next = therapistIds.includes(id)
      ? therapistIds.filter((x) => x !== id)
      : [...therapistIds, id];
    dispatch({ type: 'SET_FILTER', payload: { therapistIds: next } });
  };

  const toggleAll = () => {
    const next =
      therapistIds.length === therapists.length
        ? []
        : therapists.map((t) => t.id);
    dispatch({ type: 'SET_FILTER', payload: { therapistIds: next } });
  };

  const filtTh = therapists.filter((t) =>
    t.name.toLowerCase().includes(thQ.toLowerCase())
  );

  return (
    <>
      <div className="foverlay" onClick={() => dispatch({ type: 'CLOSE_FILTER' })} />
      <div className="fpanel">
        {/* Header */}
        <div className="fhdr">
          <span className="ftitle">Filter</span>
          <button className="pib" onClick={() => dispatch({ type: 'CLOSE_FILTER' })}>✕</button>
        </div>

        {/* Body */}
        <div className="fbody">
          {/* Group by */}
          <div className="fsec">
            <div className="fsec-lbl">Show by group (Person who is on duty)</div>
            {['all', 'male', 'female'].map((g) => (
              <label key={g} className="fopt">
                <input
                  type="radio"
                  name="gb"
                  value={g}
                  checked={groupBy === g}
                  onChange={() => dispatch({ type: 'SET_FILTER', payload: { groupBy: g } })}
                />
                <span className="fopt-lbl">
                  {g === 'all' ? 'All Therapist' : g.charAt(0).toUpperCase() + g.slice(1)}
                </span>
                {g === 'all' && (
                  <span style={{ marginLeft: 'auto', width: 11, height: 11, borderRadius: '50%', background: 'var(--brown)', display: 'inline-block' }} />
                )}
              </label>
            ))}
          </div>

          <div className="fdiv" />

          {/* Resources */}
          <div className="fsec">
            <div className="fsec-sub">Resources</div>
            <div className="fres">
              {['Rooms', 'Sofa', 'Monkey Chair'].map((r) => (
                <div key={r} className="fres-item">{r}</div>
              ))}
            </div>
          </div>

          <div className="fdiv" />

          {/* Booking status */}
          <div className="fsec">
            <div className="fsec-lbl">Booking Status</div>
            <div className="fstatus-grid">
              {STATUSES.map(({ k, c }) => (
                <label key={k} className="fopt">
                  <input
                    type="checkbox"
                    checked={statuses.includes(k)}
                    onChange={() => toggleStatus(k)}
                  />
                  <span className="fopt-lbl" style={{ fontSize: 11 }}>{k}</span>
                  <span className="fdot" style={{ background: c }} />
                </label>
              ))}
            </div>
          </div>

          <div className="fdiv" />

          {/* Therapists */}
          <div className="fsec">
            <div className="fall-row">
              <span className="fall-lbl">Select Therapist</span>
              <label className="fall-chk">
                Select All
                <input
                  type="checkbox"
                  checked={therapistIds.length === therapists.length && therapists.length > 0}
                  onChange={toggleAll}
                  style={{ accentColor: 'var(--brown)', marginLeft: 4 }}
                />
              </label>
            </div>
            <input
              className="fth-search"
              placeholder="Search by therapist"
              value={thQ}
              onChange={(e) => setThQ(e.target.value)}
            />
            <div className="fth-list">
              {filtTh.map((t) => (
                <label key={t.id} className="fth-item">
                  <input
                    type="checkbox"
                    checked={therapistIds.includes(t.id)}
                    onChange={() => toggleTherapist(t.id)}
                  />
                  <div
                    className="fth-av"
                    style={{ background: t.gender === 'male' ? 'var(--blue)' : 'var(--pink)' }}
                  >
                    {t.avatar || t.gender[0]}
                  </div>
                  <span style={{ fontSize: 12 }}>{t.alias}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ffoot">
          <button className="fclear" onClick={() => dispatch({ type: 'CLEAR_FILTER' })}>
            Clear Filter (Return to Default)
          </button>
        </div>
      </div>
    </>
  );
});

export default FilterPanel;
