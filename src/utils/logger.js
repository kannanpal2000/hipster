const logs = [];

const log = (level, cat, msg, data) => {
  const entry = { level, cat, msg, data, ts: new Date().toISOString() };
  logs.push(entry);
  const style =
    level === 'ERROR' ? 'color:#EF4444' :
    level === 'WARN'  ? 'color:#F59E0B' :
                        'color:#10B981';
  console.log(
    `%c[${entry.ts.slice(11, 19)}][${level}][${cat}] ${msg}`,
    style,
    data || ''
  );
};

const logger = {
  info:    (cat, msg, data) => log('INFO',  cat, msg, data),
  warn:    (cat, msg, data) => log('WARN',  cat, msg, data),
  error:   (cat, msg, data) => log('ERROR', cat, msg, data),
  getLogs: ()               => [...logs],
};

export default logger;
