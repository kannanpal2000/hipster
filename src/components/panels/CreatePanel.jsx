import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';
import { createBooking, fetchUsers } from '../../api/api';
import { calcEnd, fmtDate, toApiDateTime } from '../../utils/timeUtils';
import { initials }                  from '../../utils/bookingUtils';
import logger                        from '../../utils/logger';

const SOURCES = ['Walk-in', 'WhatsApp', 'By Phone'];

const CreatePanel = memo(function CreatePanel() {
  const dispatch   = useDispatch();
  const newSlot    = useSelector((s) => s.newSlot);
  const therapists = useSelector((s) => s.therapists);
  const services   = useSelector((s) => s.services);
  const rooms      = useSelector((s) => s.rooms);
  const selDate    = useSelector((s) => s.selectedDate);

  const [client,   setClient]   = useState(null);
  const [clientQ,  setClientQ]  = useState('');
  const [showCli,  setShowCli]  = useState(false);
  const [clientList, setClientList] = useState([]);

  const [svc,    setSvc]    = useState(null);
  const [thId,   setThId]   = useState(newSlot?.thId || '');
  const [startT, setStartT] = useState(newSlot?.time || '09:00');
  const [dur,    setDur]    = useState(60);
  const [room,   setRoom]   = useState('');
  const [src,    setSrc]    = useState('');
  const [note,   setNote]   = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const cliRef = useRef(null);
console.log("therapists1",therapists);

  /* ── Load initial user list ─────────────────────────────────────────── */
  useEffect(() => {
    fetchUsers(1).then(setClientList).catch(() => {});
  }, []);
console.log("clientList",clientList);

  /* ── Filter users client-side ───────────────────────────────────────── */
  const filtCli = useMemo(() => {
    const q = clientQ.toLowerCase().trim();
    if (!q) return clientList.slice(0, 6);
    return clientList.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.contact_number || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    ).slice(0, 8);
  }, [clientQ, clientList]);

  /* ── Close dropdown on outside click ───────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (cliRef.current && !cliRef.current.contains(e.target)) setShowCli(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const validate = () => {
    const e = {};
    if (!client) e.client = 'Please select a client';
    if (!svc)    e.svc    = 'Please select a service';
    if (!thId)   e.th     = 'Please select a therapist';
    return e;
  };

  const handleCreate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    const th       = therapists.find((t) => t.id === Number(thId));
    const endTime  = calcEnd(startT, dur);
    const serviceAt = toApiDateTime(selDate, startT); // "DD-MM-YYYY HH:mm"

    // Build items array as per API doc
    const roomId = room ? Number(room) : null;
    const roomSegments = roomId
      ? [{ room_id: 151, item_type: 'single-bed', meta_service: null, start_time: startT, end_time: endTime, duration: dur, priority: 1 }]
      : [];
console.log("roomSegments",roomSegments);

    const items = [{
      service:          svc.id || svc.service_id,
      start_time:       startT,
      end_time:         endTime,
      duration:         dur,
      therapist:        Number(thId),
      requested_person: 0,
      price:            svc.price || svc.selling_price || '0.00',
      quantity:         '1',
      service_request:  '',
      commission:       null,
      customer_name:    client.name,
      primary:          1,
      item_number:      1,
      room_segments:    roomSegments,
    }];

    try {
      await createBooking({ customer: client.id, service_at: serviceAt, source: src, note, items, });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', title: 'Booking created', sub: `${client.name} — ${svc.name}` } });
      logger.info('UI', 'Booking created', { client: client.name, service: svc.name });
      dispatch({ type: 'CLOSE_PANEL' });
      window.__refreshBookings?.();
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', title: 'Create failed', sub: err.message } });
      logger.warn('UI', 'Create booking failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const th = therapists.find((t) => t.id === Number(thId));

  return (
    <>
      <div className="ph">
        <span className="ph-title">New Booking</span>
        <button className="btn-cancel-close" onClick={() => dispatch({ type: 'CLOSE_PANEL' })}>Cancel</button>
      </div>

      <div className="pb">
        <div className="nb-outlet"><span className="l">Outlet </span><span className="v"> Clarke Quay</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div>
            <span style={{ color: 'var(--grey-t)', fontStyle: 'italic', fontSize: 13 }}>On </span>
            <span style={{ fontWeight: 600, fontSize: 13 }}> {fmtDate(selDate)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--grey-t)', fontStyle: 'italic', fontSize: 13 }}>At </span>
            <input type="time" value={startT} onChange={(e) => setStartT(e.target.value)}
              style={{ border: 'none', fontWeight: 600, fontSize: 13, color: 'var(--dark)', background: 'none', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Client search */}
        <div style={{ position: 'relative', marginBottom: 12 }} ref={cliRef}>
          {client ? (
            <div className="client-card">
              <div className="c-avatar">
                {initials(client.name)}
                <div className="c-ver"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="c-name">{client.contact_number}</div>
                <div className="c-name" style={{ fontSize: 13 }}>{client.name}</div>
              </div>
              <button className="c-del" onClick={() => setClient(null)}>🗑</button>
            </div>
          ) : (
            <>
              <input className="cli-search" placeholder="Search or create client"
                value={clientQ}
                onChange={(e) => { setClientQ(e.target.value); setShowCli(true); }}
                onFocus={() => setShowCli(true)} />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-t)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>+</span>
              {errors.client && <div className="ferr">{errors.client}</div>}
              {showCli && (
                <div className="search-dd">
                  {filtCli.length === 0 && <div className="search-item" style={{ color: 'var(--grey-t)' }}>No clients found</div>}
                  {filtCli.map((c) => (
                    <div key={c.id} className="search-item"
                      onMouseDown={() => { setClient(c); setClientQ(''); setShowCli(false); setErrors((p) => ({ ...p, client: null })); }}>
                      <div className="si-name">{c.name || `User ${c.id}`}</div>
                      <div className="si-phone">{c.contact_number || c.email || '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Service */}
        <div className="fg">
          <label className="flbl">Service</label>
          <select className={`fi${errors.svc ? ' err' : ''}`} value={svc?.id || svc?.service_id || ''}
            onChange={(e) => {
              const found = services.find((x) => String(x.id || x.service_id) === e.target.value);
              setSvc(found || null);
              if (found) setDur(found.duration || found.service_duration || 60);
              setErrors((p) => ({ ...p, svc: null }));
            }}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id || s.service_id} value={s.id || s.service_id}>
                {s.name || s.service_name} — {s.duration || s.service_duration || '?'} min
              </option>
            ))}
          </select>
          {errors.svc && <div className="ferr">{errors.svc}</div>}
        </div>

        {/* Therapist */}
        <div className="fg">
          <label className="flbl">Therapist</label>
          <select className={`fi${errors.th ? ' err' : ''}`} value={thId}
            onChange={(e) => { setThId(e.target.value); setErrors((p) => ({ ...p, th: null })); }}>
            <option value="">Select therapist</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>{t.alias?t.alias:"Not Mentioned"} ({t.gender || ''})</option>
            ))}
          </select>
          {errors.th && <div className="ferr">{errors.th}</div>}
        </div>

        {/* Duration */}
        <div className="fg">
          <label className="flbl">Duration (min)</label>
          <select className="fi" value={dur} onChange={(e) => setDur(Number(e.target.value))}>
            {[15, 30, 45, 60, 75, 90, 105, 120].map((d) => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>
        </div>

        {/* Room (optional) */}
        {rooms.length > 0 && (
          <div className="fg">
            <label className="flbl">Room (optional)</label>
            <select className="fi" value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="">No room</option>
              {rooms.map((r) => (
                <option key={r.id || r.room_id} value={r.room_id}>
                  {r.name || r.room_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="add-row">
          <button className="add-btn">⊕ Add service</button>
          <button className="add-btn">⊕ Add pax</button>
        </div>

        <select className="src-sel" value={src} onChange={(e) => setSrc(e.target.value)} style={{ marginTop: 10 }}>
          <option value="">Select Source</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <textarea className="notes-ta" placeholder="Notes (Optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="pf">
        <button className="btn-save" onClick={handleCreate} disabled={saving}>
          {saving ? 'Creating…' : 'Create Booking'}
        </button>
      </div>
    </>
  );
});

export default CreatePanel;
