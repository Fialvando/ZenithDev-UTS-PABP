import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';

type Kind = 'ok' | 'err';
interface Item { id: number; msg: string; kind: Kind }

const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const push = useCallback((msg: string, kind: Kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((c) => [...c, { id, msg, kind }]);
    setTimeout(() => setItems((c) => c.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'err' ? 'err' : ''}`}>
            {t.kind === 'ok' ? <Check size={16} /> : <X size={16} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(Ctx);
