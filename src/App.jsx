import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { categories }        from "./constants/categories";
import { algoMeta }          from "./constants/algoMeta";
import { problemStatements } from "./constants/problemStatements";
import { codeByLang }        from "./constants/codeByLang";
import { PRESET_GRAPHS, GRAPH_ALGO_IDS, GRID_ALGO_IDS, BOARD_ALGO_IDS, DP_ALGO_IDS, STRING_ALGO_IDS, TWOSUM_IDS } from "./constants/graphPresets";

import { algorithms }       from "./utils/algorithms";
import { parseGraphInput, buildLayout, buildEdges } from "./utils/graphHelpers";
import { generateInputFor } from "./utils/inputGenerators";

import VizRouter from "./components/viz/VizRouter";

import { useAlgoPlayer } from "./hooks/useAlgoPlayer";

// ─── CODE PANEL ───────────────────────────────────────────────────────────────
const LANG_ACCENT={javascript:"border-yellow-500 text-yellow-400",python:"border-blue-500 text-blue-400",java:"border-orange-500 text-orange-400"};


// ─── INPUT BAR ────────────────────────────────────────────────────────────────



// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedAlgo, setSelectedAlgo] = useState("two-sum-hash");
  const meta = algoMeta[selectedAlgo] || {};
  const {
    steps, stepIdx, setStepIdx, step,
    playing, setPlaying,
    speed, setSpeed,
    customInput, setCustomInput,
    target, setTarget,
    bsTarget, setBsTarget,
    coinAmount, setCoinAmount,
    nQueensN, setNQueensN,
    graphInput, setGraphInput,
    graphError, inputError,
    isLoading,
    lang, setLang,
    rightTab, setRightTab,
    isGraph, isGrid, isBoard, isDP, isString, isTwoSum, isBSRotated, fixedInput,
    handleRun, handleGenerate,
    PRESET_GRAPHS,
  } = useAlgoPlayer(selectedAlgo);

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden" style={{fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>
      <Sidebar selectedAlgo={selectedAlgo} onSelect={id=>{setSelectedAlgo(id);setStepIdx(0);setPlaying(false);}}/>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-white">{meta.name}</h1>
            <p className="text-[10px] text-slate-500">{meta.timeComplexity} time · {meta.spaceComplexity} space</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">← → step</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">space: play</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Center */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Input bar */}
            <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-950/30 flex items-center gap-2.5 flex-wrap shrink-0 min-h-[52px]">
              {isGraph&&(
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 shrink-0">Adjacency:</span>
                      <input value={graphInput} onChange={e=>{setGraphInput(e.target.value);setGraphError("");}}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono w-64 focus:outline-none focus:border-blue-600"
                        placeholder="0:1,2 1:3,4 2:5 3: 4: 5:"/>
                      <button onClick={handleRun} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-semibold transition-colors shrink-0">Run</button>
                    </div>
                    {graphError&&<span className="text-red-400 text-[10px]">{graphError}</span>}
                  </div>
                  <div className="h-4 w-px bg-slate-700"/>
                  {Object.keys(PRESET_GRAPHS).map(name=>(
                    <button key={name} onClick={()=>handleGenerate(name)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-400 hover:text-slate-200 transition-colors capitalize">{name}</button>
                  ))}
                </>
              )}
              {isBoard&&(
                <>
                  <span className="text-xs text-slate-400 font-mono">N =</span>
                  <input type="number" min={1} max={8} value={nQueensN} onChange={e=>setNQueensN(Math.min(8,Math.max(1,parseInt(e.target.value)||4)))}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-amber-300 font-mono w-16 focus:outline-none focus:border-amber-600"/>
                  <button onClick={handleRun} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-semibold transition-colors">Run</button>
                  <span className="text-[10px] text-slate-500">Tip: start with N=4 or N=5</span>
                </>
              )}
              {isGrid&&<span className="text-xs text-slate-500">Fixed 4×5 grid visualization. DFS flood-fill explores each island.</span>}
              {!isGraph&&!isGrid&&!isBoard&&(
                <>
                  <input value={customInput} onChange={e=>{setCustomInput(e.target.value);setInputError("");}}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono w-52 focus:outline-none focus:border-blue-600"
                    placeholder={isString?"Enter string...":"1, 2, 3, ..."}/>
                  {isTwoSum&&(
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">target=</span>
                      <input type="number" value={target} onChange={e=>setTarget(parseInt(e.target.value)||0)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-amber-300 font-mono w-16 focus:outline-none focus:border-amber-600"/>
                    </div>
                  )}
                  {isBSRotated&&(
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">search=</span>
                      <input type="number" value={bsTarget} onChange={e=>setBsTarget(parseInt(e.target.value)||0)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-purple-300 font-mono w-16 focus:outline-none focus:border-purple-600"/>
                    </div>
                  )}
                  {isDP&&(
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">amount=</span>
                      <input type="number" min={1} max={30} value={coinAmount} onChange={e=>setCoinAmount(parseInt(e.target.value)||15)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-purple-300 font-mono w-16 focus:outline-none focus:border-purple-600"/>
                    </div>
                  )}
                  {inputError&&<span className="text-red-400 text-xs">{inputError}</span>}
                  <button onClick={handleRun} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-semibold transition-colors">Run</button>
                  {!isDP&&<div className="h-4 w-px bg-slate-700"/>}
                  {!isDP&&["random","sorted","reverse","duplicates"].map(t=>(
                    <button key={t} onClick={()=>handleGenerate(t)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-400 hover:text-slate-200 transition-colors capitalize">{t}</button>
                  ))}
                </>
              )}
            </div>

            {/* Visualization */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              {isLoading?(
                <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}}
                  className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"/>
              ):step?(
                <AnimatePresence mode="wait">
                  <motion.div key={stepIdx} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}} className="w-full flex justify-center">
                    <VizRouter step={step} algoKey={selectedAlgo}/>
                  </motion.div>
                </AnimatePresence>
              ):null}
            </div>

            {/* Controls */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/30 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={()=>setStepIdx(0)} className="p-1.5 text-slate-400 hover:text-white transition-colors text-sm">⏮</button>
                <button onClick={()=>setStepIdx(i=>Math.max(0,i-1))} className="p-1.5 text-slate-400 hover:text-white transition-colors text-sm">◀</button>
                <button onClick={()=>setPlaying(p=>!p)} className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-sm font-semibold transition-colors min-w-[76px]">
                  {playing?"⏸ Pause":"▶ Play"}
                </button>
                <button onClick={()=>setStepIdx(i=>Math.min(steps.length-1,i+1))} className="p-1.5 text-slate-400 hover:text-white transition-colors text-sm">▶</button>
                <button onClick={()=>setStepIdx(steps.length-1)} className="p-1.5 text-slate-400 hover:text-white transition-colors text-sm">⏭</button>
                <div className="ml-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>Speed:</span>
                  <input type="range" min={100} max={2000} step={100} value={2100-speed} onChange={e=>setSpeed(2100-parseInt(e.target.value))} className="w-20 accent-blue-600"/>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-1 w-40 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-600 rounded-full"
                      animate={{width:steps.length>0?`${((stepIdx+1)/steps.length)*100}%`:"0%"}} transition={{duration:0.2}}/>
                  </div>
                  <span className="text-xs text-slate-500 font-mono w-18 text-right">{stepIdx+1}/{steps.length}</span>
                  <button onClick={()=>{setStepIdx(0);setPlaying(false);handleRun();}}
                    className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors">Reset</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-80 flex-shrink-0 border-l border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-800 shrink-0">
              {[["explain","Execution"],["problem","Problem"],["code","Code"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setRightTab(tab)}
                  className={`flex-1 py-2 text-[11px] font-semibold transition-colors border-b-2 ${rightTab===tab?"border-blue-500 text-blue-400 bg-slate-900/50":"border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {rightTab==="explain"&&(
                <>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Step Explanation</div>
                    <AnimatePresence mode="wait">
                      <motion.div key={stepIdx} initial={{opacity:0,x:4}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:0.18}}
                        className="text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg p-3 leading-relaxed min-h-[48px]">
                        {step?.explanation||"Configure input and press Run to begin."}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {step?.variables&&Object.keys(step.variables).length>0&&(
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Variables</div>
                      <VariablesPanel variables={step.variables}/>
                    </div>
                  )}
                </>
              )}
              {rightTab==="problem"&&<ProblemPanel algoKey={selectedAlgo}/>}
              {rightTab==="code"&&(
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Implementation</div>
                  <CodePanel algoKey={selectedAlgo} activeLine={step?.codeLine??-1} lang={lang} onLangChange={setLang}/>
                  <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">Active line highlights as you step through. Switch languages to compare implementations.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 shrink-0 space-y-2">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Complexity</div>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-900 rounded p-2 text-center">
                  <div className="text-[9px] text-slate-500">TIME</div>
                  <div className="text-xs text-amber-400 font-mono">{meta.timeComplexity}</div>
                </div>
                <div className="flex-1 bg-slate-900 rounded p-2 text-center">
                  <div className="text-[9px] text-slate-500">SPACE</div>
                  <div className="text-xs text-emerald-400 font-mono">{meta.spaceComplexity}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{meta.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
