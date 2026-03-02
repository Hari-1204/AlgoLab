import { motion } from "framer-motion";

export default function DPViz({ step }) {
  if(!step?.dp) return null;
  const {dp,amount,current,usedCoin,coins}=step;
  const show=dp.slice(0,Math.min(dp.length,amount+1));
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {show.map((val,i)=>{
          const isCurrent=i===current;
          const bg=isCurrent?"#7c3aed":val===Infinity?"#1e293b":"#1d4ed8";
          return (
            <motion.div key={i} animate={{backgroundColor:bg,scale:isCurrent?1.12:1}} transition={{duration:0.25}}
              className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-10 flex items-center justify-center border rounded font-mono text-xs font-bold text-white"
                style={{borderColor:isCurrent?"#7c3aed":val===Infinity?"#334155":"#3b82f6"}}>
                {val===Infinity?"∞":val}
              </div>
              <span className="text-[9px] text-slate-600">{i}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-3 text-xs font-mono text-slate-400">
        <span>Coins: [{coins?.join(", ")}]</span>
        <span>Amount: {amount}</span>
        {current!=null&&<span className="text-purple-400">→ dp[{current}]</span>}
      </div>
      <div className="flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-700 inline-block"/>computed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-700 inline-block"/>current</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700 inline-block"/>∞ (unreachable)</span>
      </div>
    </div>
  );
}