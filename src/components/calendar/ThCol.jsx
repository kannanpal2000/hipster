import { memo } from 'react';
import { useDispatch }      from '../../store/StoreContext';
import { SLOTS, SLOT_H, slot2t } from '../../utils/timeUtils';
import BkBlock              from './BkBlock';

const ThCol = memo(
  function ThCol({ th, bookings, selBkId, dragOver, onDragStart, onDragOver, onDrop }) {
    const dispatch = useDispatch();
    const colH     = SLOTS * SLOT_H;

    return (
      <div
        className={`th-col${dragOver ? ' col-drag' : ''}`}
        style={{ height: colH, position: 'relative' }}
        onDragOver={(e) => { e.preventDefault(); onDragOver(th.id); }}
        onDrop={(e)     => onDrop(e, th.id)}
      >
        {Array.from({ length: SLOTS }, (_, i) => (
          <div
            key={i}
            className={`gcell${i % 4 === 0 ? ' hs' : i % 2 === 0 ? ' qs' : ''}`}
            onClick={() =>
              dispatch({ type: 'OPEN_PANEL', mode: 'create', slot: { thId: th.id, time: slot2t(i) } })
            }
          />
        ))}
        {bookings.map((b) => (
          <BkBlock
            key={b.id}
            bk={b}
            selected={b.id === selBkId}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    );
  },
  (prev, next) =>
    prev.th.id    === next.th.id &&
    prev.bookings === next.bookings &&
    prev.selBkId  === next.selBkId &&
    prev.dragOver === next.dragOver
);

export default ThCol;
