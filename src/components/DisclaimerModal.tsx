import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Shown on every fresh page load — the disclaimer is a gate on the data, so it
// should re-read on a new visit rather than hide itself forever after a click.
// Deliberately NOT fired on websocket reconnects: the socket lives in another
// component and reconnection is invisible to the user.
export const DisclaimerModal: React.FC = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        // The whole backdrop is the close target — "click anywhere" means anywhere.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/[0.86] px-4 pt-[9vh] backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            className="w-full max-w-[580px]"
          >
            {/* Outer div is the 1px stair outline; inner is the panel. Flat
                inside — sections separated by hairlines only, no nested cards. */}
            <div className="cs-frame bg-brand p-px">
              <div className="cs-frame bg-panel">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <span className="flex items-center gap-2.5">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-none bg-danger"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <h2
                      id="notice-title"
                      className="font-pixel text-[11px] leading-none text-ink"
                    >
                      SCANNER NOTICE
                    </h2>
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-danger">
                    scanned, not vetted
                  </span>
                </div>

                {/* Two sentences, sized to be read at a glance rather than scanned. */}
                <div className="px-5 py-6 text-[15px] leading-[1.6] text-ink">
                  <p>
                    The scanner lists every pair here <span className="text-brand">seconds after it
                    goes live</span> — appearing means a contract exists and moved, nothing more.
                  </p>
                  <p className="mt-4">
                    <span className="text-danger">You are not endorsed to buy any of these new
                    pairs.</span> Check the mint, the LP and the holders yourself before sizing a
                    position.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-white/[0.07] px-5 py-3">
                  <span className="text-[9px] uppercase tracking-[0.14em] text-faint">
                    not financial advice
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-brand/80">
                    click anywhere to continue
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
