import { motion } from "framer-motion";

export default function BoardViz({ step }) {
  if(!step?.board) return null;
  const {board,n,row:curRow,col:curCol}=step;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-0.5">
        {board.map((row,r)=>(
          <div key={r} className="flex gap-0.5">
            {row.map((cell,c)=>{
              const isPlacing=r===curRow&&c===curCol;
              const isQueen=cell==="Q";
              const isCurrentRow=r===curRow;
              const dark=(r+c)%2===0;
              let bg=isPlacing&&isQueen?"#f59e0b":isQueen?"#3b82f6":isCurrentRow?"#1e293b":dark?"#0f172a":"#172033";
              return (
                <motion.div key={c} animate={{backgroundColor:bg,scale:isPlacing?1.1:1}} transition={{duration:0.2}}
                  className="w-10 h-10 flex items-center justify-center rounded text-lg"
                  style={{border:`1px solid ${isCurrentRow?"#334155":"#1e293b"}`}}>
                  {isQueen&&<span className={isPlacing?"text-amber-300":"text-blue-300"}>♛</span>}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      {step.solutions>0&&<div className="text-sm text-emerald-400 font-mono">Solutions: {step.solutions}</div>}
    </div>
  );
}