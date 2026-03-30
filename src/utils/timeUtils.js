export const SLOT_H = 15;
export const SLOTS  = 96;
export const COL_W  = 160;
export const TGUT   = 80;
export const HOURS  = Array.from({ length: 24 }, (_, i) => i);

export const t2slot = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 4 + Math.floor(m / 15);
};
export const slot2t = (s) => {
  const h = Math.floor(s / 4), m = (s % 4) * 15;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};
export const fmtH = (h) => {
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
};
export const fmtT12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap  = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2,'0')} ${ap}`;
};
export const bkTop = (startTime) => t2slot(startTime) * SLOT_H;
export const bkH   = (duration)  => Math.max(Math.ceil(duration / 15) * SLOT_H, SLOT_H * 2);

export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
export const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
};

/** YYYY-MM-DD → DD-MM-YYYY (API format for single dates / daterange) */
export const toApiDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
};

/** YYYY-MM-DD + HH:MM → "DD-MM-YYYY HH:mm"  (API service_at field) */
export const toApiDateTime = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y} ${timeStr}`;
};

export const calcEnd = (start, duration) => {
  const [h, m] = start.split(':').map(Number);
  const total  = h * 60 + m + duration;
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
};
