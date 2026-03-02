import { motion } from "framer-motion";

export default function VariablesPanel({ variables }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(variables||{}).map(([k,v])=>(
        <motion.div key={k} layout className="bg-slate-900 border border-slate-700 rounded px-3 py-2">
          <div className="text-[10px] text-slate-500 font-mono">{k}</div>
          <div className="text-xs text-cyan-300 font-mono truncate">{typeof v==="object"?JSON.stringify(v):String(v)}</div>
        </motion.div>
      ))}
    </div>
  );
}