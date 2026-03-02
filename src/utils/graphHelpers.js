export function parseGraphInput(text) {
  try {
    const graph={};
    for(const part of text.trim().split(/\s+/)) {
      const ci=part.indexOf(":");
      if(ci===-1) return null;
      const node=parseInt(part.slice(0,ci));
      if(isNaN(node)) return null;
      const nb=part.slice(ci+1);
      graph[node]=nb?nb.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)):[];
    }
    return Object.keys(graph).length>=2?graph:null;
  } catch { return null; }
}

export function buildLayout(graph) {
  const nodes=Object.keys(graph).map(Number), n=nodes.length;
  const cx=210,cy=180,r=Math.min(150,55+n*14);
  const pos={};
  nodes.forEach((id,i)=>{ const a=(2*Math.PI*i/n)-Math.PI/2; pos[id]={x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}; });
  return pos;
}

export function buildEdges(graph) {
  const edges=[],seen=new Set();
  for(const [node,neighbors] of Object.entries(graph)) for(const nb of neighbors) {
    const key=[Math.min(+node,nb),Math.max(+node,nb)].join("-");
    if(!seen.has(key)) { seen.add(key); edges.push([+node,nb]); }
  }
  return edges;
}