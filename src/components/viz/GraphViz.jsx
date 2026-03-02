import { motion } from "framer-motion";
import { buildLayout, buildEdges } from "../../utils/graphHelpers";

export default function GraphViz({ step, algoKey }) {
  if(!step?.graph) return null;
  const visited=new Set(step.visited||[]);
  const currentNode=step.currentNode, processingNeighbor=step.processingNeighbor;
  const callStack=new Set(step.callStack||[]);
  const pos=buildLayout(step.graph), edges=buildEdges(step.graph);
  const shortestPath=new Set(step.path||[]);
  const src=step.src, dst=step.dst;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="420" height="360" className="mx-auto overflow-visible">
        {edges.map(([a,b])=>{
          const pa=pos[a],pb=pos[b]; if(!pa||!pb) return null;
          const isActive=(currentNode===a&&processingNeighbor===b)||(currentNode===b&&processingNeighbor===a);
          const onPath=shortestPath.has(a)&&shortestPath.has(b);
          return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={isActive?"#f59e0b":onPath?"#10b981":"#334155"} strokeWidth={onPath||isActive?3:2}/>;
        })}
        {Object.entries(pos).map(([id,p])=>{
          const nid=parseInt(id);
          const isActive=nid===currentNode, isVisited=visited.has(nid), inStack=callStack.has(nid);
          const isSrc=nid===src, isDst=nid===dst, onPath=shortestPath.has(nid);
          let fill=isActive?"#f59e0b":onPath?"#10b981":isVisited?"#1d4ed8":"#1e293b";
          let stroke=inStack?"#818cf8":isActive?"#fbbf24":isSrc?"#a3e635":isDst?"#f87171":"#334155";
          return (
            <motion.g key={id} initial={false}>
              <motion.circle cx={p.x} cy={p.y} r={24} fill={fill} stroke={stroke} strokeWidth={isActive||isSrc||isDst?3:2}
                animate={{r:isActive?28:24}} transition={{duration:0.3}}/>
              <text x={p.x} y={p.y+5} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{id}</text>
            </motion.g>
          );
        })}
      </svg>
      {algoKey==="dfs"&&step.callStack?.length>0&&(
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <span className="text-xs text-slate-500 mr-1">Stack:</span>
          {step.callStack.map((n,i)=>(
            <motion.div key={i} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              className="px-2 py-1 bg-indigo-900 border border-indigo-600 rounded text-xs text-indigo-300 font-mono">{n}</motion.div>
          ))}
        </div>
      )}
      {(algoKey==="bfs"||algoKey==="bfs-shortest")&&(
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <span className="text-xs text-slate-500 mr-1">Queue:</span>
          {(step.queue||[]).length===0?<span className="text-xs text-slate-600 italic">empty</span>
            :(step.queue||[]).map((n,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}}
                className="px-2 py-1 bg-amber-900/50 border border-amber-700 rounded text-xs text-amber-300 font-mono">{n}</motion.div>
            ))}
        </div>
      )}
      {algoKey==="bfs-shortest"&&step.path?.length>0&&(
        <div className="text-xs font-mono text-emerald-400">Path: {step.path.join(" → ")}</div>
      )}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-700 inline-block border border-slate-600"/>unvisited</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-700 inline-block"/>visited</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"/>active</span>
        {algoKey==="bfs-shortest"&&<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"/>path</span>}
      </div>
    </div>
  );
}