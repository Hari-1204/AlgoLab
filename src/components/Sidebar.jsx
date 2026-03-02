import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "../constants/categories";
import { algoMeta }   from "../constants/algoMeta";

const catIcons = {
  "Arrays":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><rect x="3" y="8" width="4" height="8" rx="1"/><rect x="10" y="5" width="4" height="11" rx="1"/><rect x="17" y="3" width="4" height="13" rx="1"/></svg>,
  "Sorting":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><path d="M3 6h18M6 12h12M9 18h6"/></svg>,
  "Graphs":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h5l7-7M7 12h5l7 7"/></svg>,
  "Backtracking":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/></svg>,
  "DP":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="10" y="3" width="5" height="5" rx="1"/><rect x="17" y="3" width="4" height="5" rx="1"/><rect x="3" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/></svg>,
};

export default function Sidebar({ selectedAlgo, onSelect }) {
  const [expanded,setExpanded]=useState(Object.fromEntries(Object.keys(categories).map(k=>[k,true])));
  return (
    <div className="w-52 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">AlgoLab</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">DSA Learning Platform</p>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {Object.entries(categories).map(([cat,algos])=>(
          <div key={cat}>
            <button onClick={()=>setExpanded(e=>({...e,[cat]:!e[cat]}))}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors">
              <span className="text-slate-500">{catIcons[cat]}</span>
              <span>{cat}</span>
              <motion.span animate={{rotate:expanded[cat]?90:0}} className="ml-auto text-slate-600 text-sm">›</motion.span>
            </button>
            <AnimatePresence>
              {expanded[cat]&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.18}} className="overflow-hidden">
                  {algos.map(id=>(
                    <button key={id} onClick={()=>onSelect(id)}
                      className={`w-full text-left px-7 py-1 text-[11px] transition-colors leading-snug ${selectedAlgo===id?"text-blue-400 bg-blue-950/50 border-r-2 border-blue-500":"text-slate-400 hover:text-slate-200 hover:bg-slate-900"}`}>
                      {algoMeta[id]?.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}