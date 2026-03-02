import { motion } from "framer-motion";
import BarViz from "./BarViz";

function NextGreaterViz({ step }) {
  if(!step?.array) return null;
  const arr=step.array, result=step.result||[], stack=step.stack||[];
  const hl=new Set(step.highlight||[]);
  return (
    <div className="flex flex-col items-center gap-6">
      <div>
        <div className="text-[10px] text-slate-500 mb-2">Input Array</div>
        <div className="flex gap-1.5">
          {arr.map((v,i)=>(
            <motion.div key={i} animate={{backgroundColor:hl.has(i)?"#7c3aed":"#1e293b",scale:hl.has(i)?1.1:1}} transition={{duration:0.25}}
              className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-10 flex items-center justify-center border rounded font-mono text-sm font-bold text-white"
                style={{borderColor:hl.has(i)?"#7c3aed":"#334155"}}>{v}</div>
              <span className="text-[9px] text-slate-600">{i}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-slate-500 mb-2">NGE Result</div>
        <div className="flex gap-1.5">
          {result.map((v,i)=>(
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className={`w-10 h-10 flex items-center justify-center border rounded font-mono text-sm font-bold ${v===-1?"text-red-400":"text-emerald-400"}`}
                style={{backgroundColor:v===-1?"#1c0e0e":"#0e1c0e",borderColor:v===-1?"#7f1d1d":"#14532d"}}>{v}</div>
              <span className="text-[9px] text-slate-600">{i}</span>
            </div>
          ))}
        </div>
      </div>
      {stack.length>0&&(
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Stack:</span>
          {stack.map((idx,i)=>(
            <motion.div key={i} initial={{opacity:0}} animate={{opacity:1}}
              className="px-2 py-1 bg-purple-900/50 border border-purple-700 rounded text-xs font-mono text-purple-300">
              {idx}(={arr[idx]})
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function BinarySearchViz({ step }) {
  if(!step?.array) return null;
  const arr=step.array, hl=new Set(step.highlight||[]);
  const {lo,hi,mid}=step.pointers||{};
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5 flex-wrap justify-center">
        {arr.map((v,i)=>{
          const inRange=lo!=null&&hi!=null&&i>=lo&&i<=hi;
          const isMid=i===mid, isLo=i===lo, isHi=i===hi;
          const found=hl.has(i)&&step.explanation?.includes("✓");
          let bg=found?"#16a34a":isMid?"#7c3aed":inRange?"#1e3a5f":"#0f172a";
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <motion.div animate={{backgroundColor:bg,scale:found||isMid?1.1:1}} transition={{duration:0.25}}
                className="w-10 h-10 flex items-center justify-center border rounded font-mono text-sm font-bold text-white"
                style={{borderColor:found?"#22c55e":isMid?"#a855f7":inRange?"#3b82f6":"#1e293b"}}>{v}</motion.div>
              <div className="text-[9px] font-mono flex gap-0.5">
                {isLo&&<span className="text-amber-400">lo</span>}
                {isMid&&<span className="text-purple-400">mid</span>}
                {isHi&&<span className="text-cyan-400">hi</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArrayViz({ step, algoKey }) {
  if(!step) return null;
  if(algoKey==="next-greater") return <NextGreaterViz step={step}/>;
  if(algoKey==="binary-search-rotated") return <BinarySearchViz step={step}/>;
  if(algoKey==="trapping-rain") return <BarViz step={step}/>;

  const arr=step.array||[], hl=new Set(step.highlight||[]);
  const pointers=step.pointers||{}, window=step.window;

  if(algoKey==="sliding-window"&&step.string) {
    const s=step.string, left=window?.left??0, right=window?.right??-1;
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-1 flex-wrap justify-center">
          {s.split("").map((ch,i)=>{
            const inW=i>=left&&i<=right, isL=i===left, isR=i===right;
            return (
              <motion.div key={i}
                animate={{backgroundColor:inW?"#1d4ed8":"#1e293b",borderColor:isL||isR?"#f59e0b":inW?"#3b82f6":"#334155",scale:inW?1.08:1}}
                transition={{duration:0.25}}
                className="w-10 h-10 flex items-center justify-center border-2 rounded font-mono text-sm font-bold text-white"
              >{ch}</motion.div>
            );
          })}
        </div>
        <div className="flex gap-6 text-xs font-mono">
          <span className="text-amber-400">L={left}</span>
          <span className="text-cyan-400">R={right}</span>
          <span className="text-emerald-400">window="{s.slice(left,right+1)}"</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5 flex-wrap justify-center">
        {arr.map((val,i)=>{
          const isHl=hl.has(i), isPivot=pointers.pivot===i;
          const isI=pointers.i===i, isJ=pointers.j===i;
          const isL=pointers.left===i||pointers.lo===i, isR=pointers.right===i||pointers.hi===i, isM=pointers.mid===i;
          let bg="#1e293b"; if(isPivot) bg="#dc2626"; else if(isHl) bg="#1d4ed8";
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <motion.div animate={{backgroundColor:bg,scale:isHl?1.1:1}} transition={{duration:0.25}}
                className="w-10 h-10 flex items-center justify-center border rounded font-mono text-sm font-bold text-white"
                style={{borderColor:isPivot?"#ef4444":isHl?"#3b82f6":"#334155"}}>{val}</motion.div>
              <div className="flex gap-0.5 text-[9px] font-mono">
                {isL&&<span className="text-amber-400">L</span>}
                {isM&&<span className="text-purple-400">M</span>}
                {isR&&<span className="text-cyan-400">R</span>}
                {isI&&<span className="text-emerald-400">i</span>}
                {isJ&&<span className="text-pink-400">j</span>}
                {isPivot&&<span className="text-red-400">P</span>}
              </div>
            </div>
          );
        })}
      </div>
      {step.result&&<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        className="px-4 py-2 bg-emerald-900/50 border border-emerald-600 rounded-lg text-emerald-300 text-sm font-mono">
        Result: [{step.result.join(", ")}]
      </motion.div>}
    </div>
  );
}