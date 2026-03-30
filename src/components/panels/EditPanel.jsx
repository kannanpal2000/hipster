import { memo, useState } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';
import { editBooking }              from '../../api/api';
import { calcEnd, toApiDateTime }   from '../../utils/timeUtils';
import { initials }                 from '../../utils/bookingUtils';
import logger                       from '../../utils/logger';

const SOURCES = ['Walk-in', 'WhatsApp', 'By Phone'];

const EditPanel = memo(function EditPanel({ bk }) {
  const dispatch   = useDispatch();
  const therapists = useSelector((s) => s.therapists);
  const services   = useSelector((s) => s.services);
  const selectedDate = useSelector((s) => s.selectedDate);

  const [startT, setStartT] = useState(bk.start_time  || '09:30');
  const [dur,    setDur]    = useState(bk.duration     || 60);
  const [thId,   setThId]   = useState(String(bk.therapist_id || ''));
  const [svcId,  setSvcId]  = useState(String(bk.service_id   || ''));
  const [src,    setSrc]    = useState(bk.source       || '');
  const [note,   setNote]   = useState(bk.note         || '');
  const [saving, setSaving] = useState(false);

  const th  = therapists.find((t) => t.id === Number(thId));
  const svc = services.find((s) => String(s.id || s.service_id) === svcId);

  const handleSave = async () => {
    setSaving(true);
    const endTime   = calcEnd(startT, dur);
    const serviceAt = toApiDateTime(selectedDate, startT);

    // Build item – include the existing booking_item id so the API updates it
    const rawItem = bk._raw_item || {};
    const items = [{
      id:               rawItem.id || bk.id,   // booking_item id for update
      service:          svcId ? Number(svcId) : bk.service_id,
      start_time:       startT,
      end_time:         endTime,
      duration:         dur,
      therapist:        Number(thId) || bk.therapist_id,
      requested_person: rawItem.requested_person || 0,
      price:            rawItem.nonMemberCommission || bk.price || '0.00',
      quantity:         '1',
      service_request:  rawItem.service_request || '',
      commission:       null,
      customer_name:    bk.customer_name,
      primary:          rawItem.primary ?? 1,
      item_number:      rawItem.item_number ?? 1,
      room_segments:    bk.room_items?.map((r) => ({
        room_id:       r.room_id,
        item_type:     'single-bed',
        meta_service:  null,
        start_time:    startT,
        end_time:      endTime,
        duration:      dur,
        priority:      r.priority || 1,
      })) || [],
    }];

    try {
      await editBooking(bk.booking_id, {
        customer:   bk.customer_id,
        service_at: serviceAt,
        source:     src,
        note,
        membership: bk.membership || 0,
        items,
      });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', title: 'Booking updated', sub: bk.customer_name } });
      logger.info('UI', 'Booking edited', { bookingId: bk.booking_id });
      dispatch({ type: 'CLOSE_PANEL' });
      window.__refreshBookings?.();
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', title: 'Update failed', sub: err.message } });
      logger.warn('UI', 'Edit booking failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const ini = initials(bk.customer_name);

  return (
    <>
      <div className="ph">
        <span className="ph-title">Update Booking</span>
        <button className="btn-cancel-close" onClick={() => dispatch({ type: 'CLOSE_PANEL' })}>Cancel</button>
      </div>

      <div className="pb">
        <div className="nb-outlet"><span className="l">Outlet </span><span className="v">Clarke Quay</span></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div>
            <span style={{ color: 'var(--grey-t)', fontStyle: 'italic', fontSize: 13 }}>On </span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {bk.booked_on ? new Date(bk.booked_on).toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--grey-t)', fontStyle: 'italic', fontSize: 13 }}>At </span>
            <input type="time" value={startT} onChange={(e) => setStartT(e.target.value)}
              style={{ border: 'none', fontWeight: 600, fontSize: 13, color: 'var(--dark)', background: 'none', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Client card (read-only) */}
        <div className="client-card">
          <div className="c-avatar">
            {ini}
            <div className="c-ver"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="c-name">{bk.customer_phone || '—'}</div>
            <div className="c-name" style={{ fontSize: 13 }}>{bk.customer_name}</div>
          </div>
        </div>

        {/* Service selector */}
        <div className="svc-item" style={{ marginTop: 8 }}>
          <div className="svc-name">
            <span style={{ flex: 1 }}>{bk.service_name}</span>
            <span style={{ color: 'var(--grey-t)', fontSize: 11 }}>▾</span>
          </div>

          {services.length > 0 && (
            <div className="fg">
              <label className="flbl">Change Service</label>
              <select className="fi" value={svcId}
                onChange={(e) => {
                  setSvcId(e.target.value);
                  const found = services.find((s) => String(s.id || s.service_id) === e.target.value);
                  if (found) setDur(found.duration || found.service_duration || dur);
                }}>
                <option value="">Keep current</option>
                {services.map((s) => (
                  <option key={s.id || s.service_id} value={s.id || s.service_id}>
                    {s.name || s.service_name} — {s.duration || s.service_duration || '?'} min
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="svc-row">
            <span className="slbl">With:</span>
            <select style={{ border: '1px solid var(--grey-b)', borderRadius: 6, padding: '3px 6px', fontSize: 12, background: '#fff' }}
              value={thId} onChange={(e) => setThId(e.target.value)}>
              <option value="">Select therapist</option>
              {therapists.map((t) => <option key={t.id} value={t.id}>{`${t.alias?t.alias:"Not Mentioned"} (${t.gender})`}</option>)}
            </select>
            {th && (
              <span className={`th-chip ${th.gender === 'male' ? 'm' : 'f'}`} style={{ marginLeft: 5 }}>
                <span className="th-dot" style={{ background: th.gender === 'male' ? 'var(--blue)' : 'var(--pink)' }} />
                {`${th.alias?th.alias:"Not Mentioned"}(${th.gender})`}
              </span>
            )}
          </div>

          <div className="svc-row">
            <span className="slbl">For:</span>
            <select style={{ border: '1px solid var(--grey-b)', borderRadius: 6, padding: '3px 6px', fontSize: 12, background: '#fff' }}
              value={dur} onChange={(e) => setDur(Number(e.target.value))}>
              {[15, 30, 45, 60, 75, 90, 105, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
            <span className="slbl" style={{ marginLeft: 8 }}>At:</span>
            <input type="time" value={startT} onChange={(e) => setStartT(e.target.value)}
              style={{ border: '1px solid var(--grey-b)', borderRadius: 6, padding: '3px 6px', fontSize: 12 }} />
          </div>

          <div className="comm">Commission (S$) <span>${bk.price || '0.00'}</span></div>
          {bk.room && (
            <div className="svc-row"><span className="slbl">Room:</span><span className="sval">{bk.room} ✏️</span></div>
          )}
          <button className="add-btn" style={{ marginTop: 5 }}>⊕ Add therapist (split commission)</button>
        </div>

        <button className="add-btn">⊕ Add service</button>

        <select className="src-sel" value={src} onChange={(e) => setSrc(e.target.value)} style={{ marginTop: 10 }}>
          <option value="">Select Source</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <textarea className="notes-ta" placeholder="Notes (Optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="pf">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </>
  );
});

export default EditPanel;
