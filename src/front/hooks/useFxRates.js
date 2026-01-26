import { useEffect, useState } from "react";
import { getRates } from "../services/fx";

const TTL_MS = 5 * 60 * 1000;

function cacheKey(base){ return `fx_rates_${base}`; }

export function useFxRates(base) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let alive = true;

    async function run() {
      setState({ loading: true, error: null, data: null });

      
      try {
        const raw = localStorage.getItem(cacheKey(base));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() - parsed.ts < TTL_MS) {
            if (alive) setState({ loading: false, error: null, data: parsed.data });
            return;
          }
        }
      } catch {}

      
      try {
        const payload = await getRates(base);
        if (!alive) return;

        
        setState({ loading: false, error: null, data: payload });

        try {
          localStorage.setItem(cacheKey(base), JSON.stringify({ ts: Date.now(), data: payload }));
        } catch {}
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Error", data: null });
      }
    }

    run();
    return () => { alive = false; };
  }, [base]);

  return state;
}
