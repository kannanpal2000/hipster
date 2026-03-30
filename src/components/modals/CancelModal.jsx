import { memo, useState } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';
import { cancelBookingItem, deleteBooking } from '../../api/api';
import logger from '../../utils/logger';

const CancelModal = memo(function CancelModal() {
  const dispatch     = useDispatch();
  const cancelTarget = useSelector((s) => s.cancelTarget);
  const bk           = cancelTarget?.booking;
  const [sel,    setSel]    = useState('normal');
  const [saving, setSaving] = useState(false);

  if (!bk) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      if (sel === 'delete') {
        await deleteBooking(bk.booking_id);
        dispatch({ type: 'DELETE_BOOKING', id: bk.booking_id });
        dispatch({ type: 'ADD_TOAST', payload: { type: 'info', title: 'Booking deleted', sub: bk.customer_name } });
        logger.info('UI', 'Booking deleted', { bookingId: bk.booking_id });
      } else {
        const type = sel === 'noshow' ? 'no-show' : 'normal';
        await cancelBookingItem(bk.booking_id, type);
        dispatch({ type: 'CANCEL_BOOKING', id: bk.booking_id });
        dispatch({ type: 'ADD_TOAST', payload: { type: 'info', title: 'Booking cancelled', sub: bk.customer_name } });
        logger.info('UI', 'Booking cancelled', { bookingId: bk.booking_id, type });
      }
      window.__refreshBookings?.();
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', title: 'Action failed', sub: err.message } });
      logger.warn('UI', 'Cancel/delete failed', err.message);
    } finally {
      setSaving(false);
      dispatch({ type: 'CLOSE_CANCEL' });
      dispatch({ type: 'CLOSE_PANEL' });
    }
  };

  return (
    <div className="moverlay" onClick={(e) => { if (e.target === e.currentTarget) dispatch({ type: 'CLOSE_CANCEL' }); }}>
      <div className="modal">
        <div className="mprog" />
        <div className="mbody">
          <div className="mtitle">Cancel / Delete Booking</div>
          <div className="msub">Booking #{bk.booking_id} — {bk.customer_name}</div>

          <label className={`mopt${sel === 'normal' ? ' sel' : ''}`}>
            <input type="radio" name="ct" value="normal" checked={sel === 'normal'} onChange={() => setSel('normal')} />
            <div><div className="mopt-lbl">Normal Cancellation</div></div>
          </label>

          <label className={`mopt${sel === 'noshow' ? ' sel' : ''}`} style={{ opacity: 0.7 }}>
            <input type="radio" name="ct" value="noshow" checked={sel === 'noshow'} onChange={() => setSel('noshow')} />
            <div><div className="mopt-lbl">No Show</div></div>
          </label>

          <div className="mdiv" />

          <label className={`mopt${sel === 'delete' ? ' sel' : ''}`}>
            <input type="radio" name="ct" value="delete" checked={sel === 'delete'} onChange={() => setSel('delete')} />
            <div>
              <div className="mopt-lbl">Just Delete It</div>
              <div className="mopt-desc">Bookings with a deposit cannot be deleted. Cancel instead to retain a record.</div>
            </div>
          </label>
        </div>

        <div className="mfoot">
          <button className="btn-mc" onClick={() => dispatch({ type: 'CLOSE_CANCEL' })} disabled={saving}>Cancel</button>
          <button className="btn-mx" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CancelModal;
