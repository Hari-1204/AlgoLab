import { problemStatements } from "../constants/problemStatements";

export default function ProblemPanel({ algoKey }) {
  const p=problemStatements[algoKey]; if(!p) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.diffColor} bg-slate-900 border border-slate-700`}>{p.difficulty}</span>
        <span className="text-[10px] text-slate-500 font-mono">{p.platform}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Constraints</div>
        <ul className="space-y-1">{p.constraints.map((c,i)=>(
          <li key={i} className="text-[11px] text-slate-400 font-mono flex items-start gap-2">
            <span className="text-slate-600 mt-0.5">·</span><span>{c}</span>
          </li>
        ))}</ul>
      </div>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Examples</div>
        {p.examples.map((ex,i)=>(
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1 mb-2">
            <div className="text-[11px] font-mono"><span className="text-slate-500">Input:  </span><span className="text-slate-300">{ex.input}</span></div>
            <div className="text-[11px] font-mono"><span className="text-slate-500">Output: </span><span className="text-emerald-400">{ex.output}</span></div>
            <div className="text-[11px] text-slate-500 italic border-t border-slate-800 pt-1 mt-1">{ex.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}