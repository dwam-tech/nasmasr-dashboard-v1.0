'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function DateInput(props: { value: string; onChange: (v: string) => void; className?: string; placeholder?: string }) {
  const { value, onChange, className, placeholder } = props;
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }, [value]);
  const [viewDate, setViewDate] = useState<Date>(() => parsed || new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (ev: MouseEvent) => {
      if (!wrapperRef.current) return;
      const target = ev.target as Node;
      if (!wrapperRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (parsed && open) setViewDate(parsed);
  }, [parsed, open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 1) % 7;
  const blanks = Array.from({ length: startOffset });
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const fmt = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const monthLabel = viewDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  const weekdays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  return (
    <div className="date-input-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className={className ?? 'filter-input'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'YYYY-MM-DD'}
        style={{ direction: 'ltr' }}
      />
      <button
        type="button"
        className="calendar-button"
        onClick={() => setOpen((p) => !p)}
        aria-label="فتح التقويم"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="date-popover">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            >
              ◀
            </button>
            <div className="calendar-title">{monthLabel}</div>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            >
              ▶
            </button>
          </div>
          <div className="calendar-weekdays">
            {weekdays.map((w) => (
              <div key={w} className="weekday-cell">{w}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {blanks.map((_, i) => (
              <div key={`b-${i}`} className="calendar-cell empty" />
            ))}
            {days.map((d) => {
              const dt = new Date(year, month, d);
              const today = isSameDate(dt, new Date());
              const selected = parsed ? isSameDate(dt, parsed) : false;
              return (
                <button
                  key={d}
                  type="button"
                  className={`calendar-cell day ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
                  onClick={() => {
                    onChange(fmt(dt));
                    setOpen(false);
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

