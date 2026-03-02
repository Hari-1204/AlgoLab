import { motion } from "framer-motion";
import { codeByLang } from "../constants/codeByLang";

const LANG_ACCENT = {
  javascript:"border-yellow-500 text-yellow-400",
  python:"border-blue-500 text-blue-400",
  java:"border-orange-500 text-orange-400"
};

export default function CodePanel({ algoKey, activeLine, lang, onLangChange }) {
  const code=((codeByLang[algoKey]||{})[lang]||(codeByLang[algoKey]||{}).javascript)||[];
  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
      <div className="flex border-b border-slate-800">
        {["javascript","python","java"].map(l=>(
          <button key={l} onClick={()=>onLangChange(l)}
            className={`px-3 py-1.5 text-[11px] font-semibold transition-colors border-b-2 capitalize ${lang===l?`${LANG_ACCENT[l]} bg-slate-900/60`:"border-transparent text-slate-500 hover:text-slate-300"}`}>
            {l==="javascript"?"JS":l==="python"?"Python":"Java"}
          </button>
        ))}
      </div>
      <div className="font-mono text-xs leading-6 p-3 overflow-auto max-h-64">
        {code.map((line,i)=>(
          <motion.div key={`${lang}-${i}`} animate={{backgroundColor:activeLine===i?"rgba(59,130,246,0.18)":"transparent"}} transition={{duration:0.2}}
            className="flex items-center gap-3 px-2 rounded min-h-[24px]">
            <span className="text-slate-700 w-4 text-right select-none shrink-0">{i+1}</span>
            <span className="whitespace-pre" style={{color:activeLine===i?"#93c5fd":"#94a3b8"}}>{line||" "}</span>
            {activeLine===i&&<motion.span initial={{opacity:0}} animate={{opacity:1}} className="ml-auto text-blue-400 text-[10px] shrink-0">◀</motion.span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}