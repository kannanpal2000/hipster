import { useSelector } from '../../store/StoreContext';
import ViewPanel        from './ViewPanel';
import CreatePanel      from './CreatePanel';
import EditPanel        from './EditPanel';

function RightPanel() {
  const mode  = useSelector((s) => s.panelMode);
  const bkId  = useSelector((s) => s.selectedBkId);
  const bks   = useSelector((s) => s.bookings);
  const bk    = bks.find((b) => b.id === bkId);


  if (!mode) return null;

  return (
    <div className="rpanel">
      {mode === 'view'   && bk && <ViewPanel   bk={bk} />}
      {mode === 'create' &&        <CreatePanel />}
      {mode === 'edit'   && bk && <EditPanel   bk={bk} />}
    </div>
  );
}

export default RightPanel;
