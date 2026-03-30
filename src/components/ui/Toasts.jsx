import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../store/StoreContext';

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

function Toast({ t }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const id = setTimeout(() => dispatch({ type: 'RM_TOAST', id: t.id }), 4000);
    return () => clearTimeout(id);
  }, []); 

  return (
    <div className={`toast ${t.type || 'info'}`}>
      <span className="t-ico">{ICONS[t.type] || 'ℹ'}</span>
      <div>
        <div className="t-title">{t.title}</div>
        {t.sub && <div className="t-sub">{t.sub}</div>}
      </div>
      <button className="t-close" onClick={() => dispatch({ type: 'RM_TOAST', id: t.id })}>✕</button>
    </div>
  );
}

function Toasts() {
  const toasts = useSelector((s) => s.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => <Toast key={t.id} t={t} />)}
    </div>
  );
}

export default Toasts;
