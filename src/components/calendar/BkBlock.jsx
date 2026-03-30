import { memo } from 'react';
import { useDispatch } from '../../store/StoreContext';
import { sClass }      from '../../utils/bookingUtils';
import { bkTop, bkH }  from '../../utils/timeUtils';

const BkBlock = memo(
  function BkBlock({ bk, selected, onDragStart }) {
    const dispatch = useDispatch();
    const cls   = sClass(bk.status);
    const top   = bkTop(bk.start_time);
    const h     = bkH(bk.duration);
    const short = h < 45;

    return (
      <div
        className={`bk ${cls}${selected ? ' sel' : ''}`}
        style={{ top, height: h, minHeight: 30 }}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'OPEN_PANEL', mode: 'view', bkId: bk.id });
        }}
        draggable
        onDragStart={() => onDragStart(bk.id)}
      >
        {!short && (
          <div className="bk-svc" title={bk.service_name}>
            {bk.service_name}
          </div>
        )}
        {h >= 50 && (
          <>
            <div className="bk-ph">{bk.customer_phone}</div>
            <div className="bk-cl">{bk.customer_name}</div>
          </>
        )}
        <div className="bk-icons">
          {cls === 'conf' && <span className="bico bi-c">C</span>}
          {cls === 'chk'  && <span className="bico bi-h">H</span>}
          {bk.is_requested_therapist && <span className="bico bi-t">T</span>}
          {bk.is_requested_room      && <span className="bico bi-r">R</span>}
          {bk.note                   && <span className="bico bi-n">✎</span>}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.bk.id         === next.bk.id &&
    prev.bk.status     === next.bk.status &&
    prev.bk.start_time === next.bk.start_time &&
    prev.bk.duration   === next.bk.duration &&
    prev.selected      === next.selected
);

export default BkBlock;
