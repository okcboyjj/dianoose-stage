import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * MobileSelect — drop-in replacement for <select> that renders a
 * native-feel bottom sheet on mobile and a styled popover on desktop.
 *
 * Props:
 *   value       — currently selected value (string)
 *   onChange    — (value: string) => void
 *   options     — string[] or { value, label }[]
 *   placeholder — string (shown when nothing selected)
 *   className   — extra classes for the trigger button
 */
export default function MobileSelect({ value, onChange, options = [], placeholder = "Select…", className = "" }) {
  const [open, setOpen] = useState(false);

  const normalised = options.map(o =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const selected = normalised.find(o => o.value === value);

  const choose = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between w-full min-h-[44px] px-3 py-2.5 rounded-md border border-input bg-transparent text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Bottom sheet / backdrop */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card border-t border-border/50 rounded-t-2xl shadow-2xl overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              {/* Options */}
              <div className="overflow-y-auto max-h-[60vh] py-2">
                {normalised.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => choose(opt.value)}
                    className="w-full flex items-center justify-between min-h-[52px] px-5 text-sm font-medium text-foreground active:bg-secondary/60 transition-colors"
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>

              {/* Cancel */}
              <div className="px-4 pb-3 pt-1 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full min-h-[44px] rounded-xl bg-secondary/60 text-sm font-semibold text-foreground transition-colors active:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}