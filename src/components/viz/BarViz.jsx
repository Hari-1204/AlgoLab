import { motion } from "framer-motion";

export default function BarViz({ step }) {
  if(!step?.array) return null;
  const arr=step.array, max=Math.max(...arr)||1;
  const hl=new Set(step.highlight||[]);
  const {left,right}=step.pointers||{};
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-end gap-1 justify-center flex-wrap" style={{height:180}}>
        {arr.map((h,i)=>{
          const isLeft=i===left, isRight=i===right, isHl=hl.has(i);
          const pct=Math.max(h/max,0.02);
          let bg=isLeft?"#f59e0b":isRight?"#3b82f6":isHl?"#a78bfa":"#1e3a5f";
          return (
            <div key={i} className="flex flex-col items-center gap-0.5" style={{width:Math.max(22,480/arr.length-2)}}>
              <span className="text-[9px] text-slate-500 font-mono">{h}</span>
              <motion.div animate={{height:`${pct*160}px`,backgroundColor:bg}} transition={{duration:0.3}}
                className="w-full rounded-t" style={{minHeight:4}}/>
              <div className="text-[9px] font-mono flex gap-0.5">
                {isLeft&&<span className="text-amber-400">L</span>}
                {isRight&&<span className="text-blue-400">R</span>}
              </div>
            </div>
          );
        })}
      </div>
      {step.water!=null&&<div className="px-4 py-2 bg-blue-900/40 border border-blue-700 rounded-lg text-blue-300 text-sm font-mono">💧 Water = {step.water}</div>}
    </div>
  );
}