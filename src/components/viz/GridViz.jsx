import { motion } from "framer-motion";

export default function GridViz({ step }) {
  if(!step?.grid) return null;
  const {grid,active,visited=[]}=step;
  const visitedSet=new Set(visited.map(([r,c])=>`${r},${c}`));
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-1">
        {grid.map((row,r)=>(
          <div key={r} className="flex gap-1">
            {row.map((cell,c)=>{
              const isActive=active&&active[0]===r&&active[1]===c;
              const isVisited=visitedSet.has(`${r},${c}`);
              const isLand=cell==="1";
              let bg=isActive?"#f59e0b":isLand?"#16a34a":isVisited?"#1d4ed8":"#0f172a";
              return (
                <motion.div key={c} animate={{backgroundColor:bg,scale:isActive?1.15:1}} transition={{duration:0.2}}
                  className="w-10 h-10 flex items-center justify-center rounded border text-xs font-mono font-bold text-white"
                  style={{borderColor:isActive?"#fbbf24":isLand?"#22c55e":"#1e293b"}}>
                  {isActive?"★":cell==="1"?"■":"○"}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block"/>water</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block"/>land</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"/>active</span>
      </div>
      {step.count>0&&<div className="text-sm text-emerald-400 font-mono">Islands found: {step.count}</div>}
    </div>
  );
}