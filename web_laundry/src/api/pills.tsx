import { Check, CreditCard } from 'lucide-react';
import { ALUR, STATUS_FLOW, jenisOf } from '../types/laundry';

const COLOR: Record<string, { bg: string; text: string }> = {
  Antri: { bg: '#f1f5f9', text: '#475569' },
  Diterima: { bg: '#fef3c7', text: '#d97706' },
  Dicuci: { bg: '#e0f2fe', text: '#0284c7' },
  Disetrika: { bg: '#fae8ff', text: '#c084fc' },
  'Siap Ambil': { bg: '#dcfce7', text: '#16a34a' },
  Selesai: { bg: '#f1f5f9', text: '#64748b' },
};

export const nextStatus = (status: string, jenis?: string | null): string | null => {
  const flow = ALUR[jenisOf(jenis)];
  
  if (status === 'Antri' || !status) {
    return flow[0] ?? null;
  }

  const cur = flow.indexOf(status);
  if (cur < 0 || cur + 1 >= flow.length) return null;
  
  return flow[cur + 1];
};

export function StatusBadge({ status, jenis, onAdvance, disabled }: { status: string; jenis: string; onAdvance: () => void; disabled?: boolean }) {
  const theme = COLOR[status] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <button
      type="button"
      onClick={onAdvance}
      disabled={disabled}
      style={{
        background: theme.bg,
        color: theme.text,
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
      title="Klik untuk lanjut ke tahap berikutnya"
    >
      {status}
    </button>
  );
}

export function PayBadge({ status, onToggle, disabled }: { status: string; onToggle?: () => void; disabled?: boolean }) {
  const lunas = status === 'Lunas';
  const cls = `pill ${lunas ? 'c-green' : 'c-rose'}`;
  const inner = (<>{lunas ? <Check size={12} /> : <CreditCard size={12} />} {status}</>);
  if (!onToggle) return <span className={cls}>{inner}</span>;
  return (
    <button className={cls} onClick={onToggle} disabled={disabled} title="Klik untuk ubah status bayar">
      {inner}
    </button>
  );
}