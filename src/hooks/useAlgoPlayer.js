import { useState, useEffect, useCallback, useRef } from "react";
import { algorithms }       from "../utils/algorithms";
import { generateInputFor } from "../utils/inputGenerators";
import { parseGraphInput }  from "../utils/graphHelpers";
import { PRESET_GRAPHS, GRAPH_ALGO_IDS, GRID_ALGO_IDS, BOARD_ALGO_IDS, DP_ALGO_IDS, STRING_ALGO_IDS, TWOSUM_IDS } from "../constants/graphPresets";

export function useAlgoPlayer(selectedAlgo) {
  const [steps, setSteps]             = useState([]);
  const [stepIdx, setStepIdx]         = useState(0);
  const [playing, setPlaying]         = useState(false);
  const [speed, setSpeed]             = useState(700);
  const [customInput, setCustomInput] = useState("2,7,11,15,3,6,4,1");
  const [target, setTarget]           = useState(9);
  const [bsTarget, setBsTarget]       = useState(0);
  const [coinAmount, setCoinAmount]   = useState(15);
  const [nQueensN, setNQueensN]       = useState(4);
  const [graphInput, setGraphInput]   = useState(PRESET_GRAPHS.default);
  const [graphError, setGraphError]   = useState("");
  const [inputError, setInputError]   = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [lang, setLang]               = useState("javascript");
  const [rightTab, setRightTab]       = useState("explain");
  const intervalRef = useRef(null);

  const step = steps[stepIdx];

  const isGraph     = GRAPH_ALGO_IDS.has(selectedAlgo);
  const isGrid      = GRID_ALGO_IDS.has(selectedAlgo);
  const isBoard     = BOARD_ALGO_IDS.has(selectedAlgo);
  const isDP        = DP_ALGO_IDS.has(selectedAlgo);
  const isString    = STRING_ALGO_IDS.has(selectedAlgo);
  const isTwoSum    = TWOSUM_IDS.has(selectedAlgo);
  const isBSRotated = selectedAlgo === "binary-search-rotated";
  const fixedInput  = isGrid || isBoard;

  const runAlgo = useCallback((algoId, input, extraParams={}) => {
    setIsLoading(true); setPlaying(false);
    setTimeout(() => {
      try {
        const a = algorithms[algoId]; let result;
        if(GRAPH_ALGO_IDS.has(algoId)) result = a.generate(extraParams.graph||null);
        else if(GRID_ALGO_IDS.has(algoId)) result = a.generate();
        else if(BOARD_ALGO_IDS.has(algoId)) result = a.generate(extraParams.n||4);
        else if(DP_ALGO_IDS.has(algoId)) {
          const nums = typeof input==="string" ? input.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)) : input;
          result = a.generate(nums, extraParams.amount||15);
        }
        else if(STRING_ALGO_IDS.has(algoId)) result = a.generate(typeof input==="string" ? input : "abcabcbb");
        else {
          const nums = typeof input==="string" ? input.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)) : input;
          if(algoId==="two-sum-brute"||algoId==="two-sum-hash") result = a.generate(nums, extraParams.target??9);
          else if(algoId==="binary-search-rotated") result = a.generate(nums, extraParams.bsTarget??0);
          else result = a.generate(nums);
        }
        setSteps(result||[]); setStepIdx(0);
      } catch(e) { console.error(e); }
      setIsLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    setCustomInput(generateInputFor(selectedAlgo, "random") || "2,7,11,15,3,6,4,1");
    runAlgo(selectedAlgo, generateInputFor(selectedAlgo, "random"), { target, bsTarget, amount: coinAmount, n: nQueensN });
  }, [selectedAlgo]);

  useEffect(() => {
    if(playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx(i => { if(i >= steps.length-1) { setPlaying(false); return i; } return i+1; });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed, steps.length]);

  useEffect(() => {
    const h = (e) => {
      if(e.key==="ArrowRight") setStepIdx(i => Math.min(i+1, steps.length-1));
      if(e.key==="ArrowLeft")  setStepIdx(i => Math.max(i-1, 0));
      if(e.key===" ") { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [steps.length]);

  const handleRun = () => {
    setInputError(""); setGraphError("");
    if(isGraph) {
      const parsed = parseGraphInput(graphInput);
      if(!parsed) { setGraphError("Invalid. Use: 0:1,2 1:3 2: (space-separated)"); return; }
      runAlgo(selectedAlgo, null, { graph: parsed }); return;
    }
    if(fixedInput) { runAlgo(selectedAlgo, null, { n: nQueensN }); return; }
    if(isString)   { runAlgo(selectedAlgo, customInput); return; }
    const nums = customInput.split(",").map(x => parseInt(x.trim()));
    if(nums.some(isNaN) || nums.length < 1) { setInputError("Enter comma-separated integers"); return; }
    if(nums.length > 25) { setInputError("Max 25 elements"); return; }
    runAlgo(selectedAlgo, customInput, { target, bsTarget, amount: coinAmount });
  };

  const handleGenerate = (type) => {
    if(isGraph) {
      const v = PRESET_GRAPHS[type] || PRESET_GRAPHS.default;
      setGraphInput(v);
      const p = parseGraphInput(v);
      if(p) runAlgo(selectedAlgo, null, { graph: p });
      return;
    }
    if(fixedInput) return;
    const val = generateInputFor(selectedAlgo, type);
    setCustomInput(val);
    if(isString) { runAlgo(selectedAlgo, val); return; }
    const nums = typeof val==="string" ? val.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)) : val;
    runAlgo(selectedAlgo, nums, { target, bsTarget, amount: coinAmount });
  };

  return {
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
  };
}