import { memo, useState } from 'react';
import { useDispatch }         from '../../store/StoreContext';
import { sClass, initials }    from '../../utils/bookingUtils';
import { fmtT12 }              from '../../utils/timeUtils';
import { updateBookingStatus } from '../../api/api';
import logger                  from '../../utils/logger';

const ViewPanel = memo(function ViewPanel({ bk }) {
  const dispatch  = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const cls    = sClass(bk.status);
  const isConf = cls === 'conf';
  const isChk  = cls === 'chk';
  const isCan  = cls === 'can';
  const isComp = cls === 'comp';
  const ini    = initials(bk.customer_name);

  const handleSetStatus = async (status) => {
    // Optimistic update
    dispatch({ type: 'SET_STATUS', id: bk.booking_id, status });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', title: `Status: ${status}`, sub: bk.customer_name } });
    try {
      await updateBookingStatus(bk.booking_id, status);
      window.__refreshBookings?.();
      logger.info('UI', 'Status updated via API', { bookingId: bk.booking_id, status });
    } catch (err) {
      logger.warn('UI', 'Status update fallback (local only)', err.message);
    }
  };

  const fmtDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const fmtDateTimeFull = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="ph">
        <span className="ph-title">Appointment</span>
        <div className="ph-actions">
          <button className="pib" onClick={() => setMenuOpen((v) => !v)} style={{ fontSize: 16, letterSpacing: 1 }}>···</button>
          <button className="pib" title="Edit" onClick={() => dispatch({ type: 'OPEN_PANEL', mode: 'edit', bkId: bk.id })}>✏️</button>
          {menuOpen && (
            <div className="cmenu">
              <div className="cmi d" onClick={() => { setMenuOpen(false); dispatch({ type: 'OPEN_CANCEL', payload: { booking: bk } }); }}>
                Cancel / Delete
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb" onClick={() => setMenuOpen(false)}>
        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className={`sbadge ${cls}`}>{bk.status || 'Confirmed'}</span>
          {isConf && <button className="btn-ci" onClick={() => handleSetStatus('Check-in (In Progress)')}>Check-in</button>}
          {isChk  && <button className="btn-co" onClick={() => handleSetStatus('Completed')}>Checkout</button>}
          {isComp && <button className="btn-vs">View Sale</button>}
        </div>

        {/* Date / time */}
        <div className="pdr">
          <div className="pon">
            <span className="l">On </span>
            <span className="v">{bk.booked_on ? fmtDateTime(bk.booked_on) : '—'}</span>
          </div>
          <div className="pat">
            <span className="l">At </span>
            <span className="v">{fmtT12(bk.start_time) || '—'}</span>
          </div>
        </div>
        <div className="pdivider" />

        {/* Client */}
        <div className="client-card">
          <div className="c-avatar">
            {ini}
            <div className="c-ver">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="c-name">{bk.customer_phone || '—'} (#{String(bk.customer_id || '').slice(-4) || '—'})</div>
            <div className="c-name" style={{ fontSize: 13 }}>{bk.customer_name}</div>
            {bk.customer_phone && <div className="c-ph">Phone: {bk.customer_phone}</div>}
          </div>
        </div>

        {/* Membership */}
        <div className="mem-row">
          <span className="mem-lbl">Membership applied:</span>
          <div className={`tog ${bk.membership ? 'on' : 'off'}`}><div className="tog-thumb" /></div>
        </div>
        <div className="pdivider" />

        {/* Service */}
        <div className="svc-item">
          <div className="svc-name">
            {bk.service_name}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
          <div className="svc-row">
            <span className="slbl">With:</span>
            <span className={`th-chip ${bk.therapist_gender === 'male' ? 'm' : 'f'}`}>
              <span className="th-dot" style={{ background: bk.therapist_gender === 'male' ? 'var(--blue)' : 'var(--pink)' }} />
              {bk.therapist_name}
            </span>
            {bk.is_requested_therapist && (
              <>
                <div className="req-chk"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="10" height="10"><path d="M20 6L9 17l-5-5" /></svg></div>
                <span className="req-lbl">Requested Therapist</span>
              </>
            )}
            {!isCan && <button className="del-ico">🗑</button>}
          </div>
          <div className="svc-row">
            <span className="slbl">For:</span><span className="sval">{bk.duration} min</span>
            <span className="slbl" style={{ marginLeft: 10 }}>At:</span><span className="sval">{fmtT12(bk.start_time)}</span>
          </div>
          {!isCan && <div className="comm">Commission (S$) <span>${bk.price || '0.00'}</span></div>}
          {bk.room && (
            <div className="svc-row"><span className="slbl">Room:</span><span className="sval">{bk.room}</span></div>
          )}
        </div>

        {!isCan && (
          <div className="add-row">
            <button className="add-btn">⊕ Add service</button>
            <button className="add-btn">⊕ Add pax</button>
          </div>
        )}

        {bk.note && <div className="note-box">{bk.note}</div>}
        <div className="pdivider" />

        {/* Booking metadata */}
        <div>
          <div className="bd-title">Booking details</div>
          {bk.booked_on && (
            <div className="dr"><span className="dl">Booked on:</span><span className="dv">{fmtDateTimeFull(bk.booked_on)}</span></div>
          )}
          {bk.booked_by && (
            <div className="dr"><span className="dl">Booked by:</span><span className="dv">{bk.booked_by}</span></div>
          )}
          {bk.updated_by && (
            <div className="dr"><span className="dl">Updated by:</span><span className="dv">{bk.updated_by}</span></div>
          )}
          {bk.source && (
            <div className="dr"><span className="dl">Source:</span><span className="dv">{bk.source}</span></div>
          )}
          <div className="dr"><span className="dl">Booking #:</span><span className="dv">{bk.booking_id}</span></div>
        </div>
      </div>
    </>
  );
});

export default ViewPanel;
