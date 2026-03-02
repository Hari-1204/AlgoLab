import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { categories }        from "./constants/categories";
import { algoMeta }          from "./constants/algoMeta";
import { problemStatements } from "./constants/problemStatements";
import { codeByLang }        from "./constants/codeByLang";
import { PRESET_GRAPHS, GRAPH_ALGO_IDS, GRID_ALGO_IDS, BOARD_ALGO_IDS, DP_ALGO_IDS, STRING_ALGO_IDS, TWOSUM_IDS } from "./constants/graphPresets";

// ─── CATEGORIES & SIDEBAR CONFIG ─────────────────────────────────────────────




// ─── STEP ENGINE ──────────────────────────────────────────────────────────────
const algorithms = {
  "two-sum-brute": { generate(nums=[2,7,11,15,3,6,4,1], target=9) {
    const steps=[];
    for(let i=0;i<nums.length;i++) for(let j=i+1;j<nums.length;j++) {
      const sum=nums[i]+nums[j],found=sum===target;
      steps.push({type:"array",array:[...nums],pointers:{i,j},highlight:[i,j],
        variables:{i,j,"nums[i]":nums[i],"nums[j]":nums[j],sum,target},
        explanation:found?`✓ Found! ${nums[i]}+${nums[j]}=${target}`:`${nums[i]}+${nums[j]}=${sum} ≠ ${target}`,
        codeLine:found?3:2,result:found?[i,j]:null});
      if(found) return steps;
    }
    steps.push({type:"array",array:[...nums],pointers:{},highlight:[],variables:{target},explanation:"No solution found.",codeLine:7,result:null});
    return steps;
  }},

  "two-sum-hash": { generate(nums=[2,7,11,15,3,6,4,1], target=9) {
    const steps=[], map={};
    for(let i=0;i<nums.length;i++) {
      const comp=target-nums[i], found=comp in map;
      steps.push({type:"array",array:[...nums],pointers:{i},highlight:found?[map[comp],i]:[i],
        variables:{i,"nums[i]":nums[i],complement:comp,target,map:{...map}},
        explanation:found?`✓ Complement ${comp} in map → [${map[comp]},${i}]`:`comp=${target}-${nums[i]}=${comp}. Store {${nums[i]}:${i}}`,
        codeLine:found?4:5,result:found?[map[comp],i]:null});
      if(found) return steps;
      map[nums[i]]=i;
    }
    return steps;
  }},

  "sliding-window": { generate(input="abcabcbb") {
    const s=typeof input==="string"?input:"abcabcbb";
    const steps=[]; let left=0,maxLen=0; const seen=new Set();
    for(let right=0;right<s.length;right++) {
      while(seen.has(s[right])) {
        steps.push({type:"string",string:s,window:{left,right},
          variables:{left,right,"s[right]":s[right],maxLen,window:s.slice(left,right)},
          explanation:`Duplicate '${s[right]}' — shrink: remove '${s[left]}'`,codeLine:4});
        seen.delete(s[left++]);
      }
      seen.add(s[right]); maxLen=Math.max(maxLen,right-left+1);
      steps.push({type:"string",string:s,window:{left,right},
        variables:{left,right,"s[right]":s[right],maxLen,window:s.slice(left,right+1)},
        explanation:`Expand: include '${s[right]}'. Window="${s.slice(left,right+1)}" maxLen=${maxLen}`,codeLine:7});
    }
    return steps;
  }},

  "kadane": { generate(nums=[-2,1,-3,4,-1,2,1,-5,4]) {
    const steps=[]; let maxSum=nums[0], currSum=nums[0];
    steps.push({type:"array",array:[...nums],pointers:{i:0},highlight:[0],
      variables:{i:0,currSum,maxSum,"nums[0]":nums[0]},
      explanation:`Init: currSum=${currSum}, maxSum=${maxSum}`,codeLine:1});
    for(let i=1;i<nums.length;i++) {
      const prev=currSum;
      currSum=Math.max(nums[i],currSum+nums[i]);
      maxSum=Math.max(maxSum,currSum);
      steps.push({type:"array",array:[...nums],pointers:{i},highlight:[i],
        variables:{i,currSum,maxSum,"nums[i]":nums[i],"prev+nums[i]":prev+nums[i]},
        explanation:currSum===nums[i]?`Reset: ${prev}+${nums[i]}=${prev+nums[i]} < ${nums[i]}, start fresh. currSum=${currSum}`:`Extend: max(${nums[i]},${prev}+${nums[i]})=${currSum}. maxSum=${maxSum}`,
        codeLine:4});
    }
    return steps;
  }},

  "trapping-rain": { generate(height=[0,1,0,2,1,0,1,3,2,1,2,1]) {
    const steps=[]; let left=0,right=height.length-1,leftMax=0,rightMax=0,water=0;
    steps.push({type:"bars",array:[...height],pointers:{left,right},leftMax,rightMax,water,highlight:[left,right],
      variables:{left,right,leftMax,rightMax,water},explanation:`Init: left=${left}, right=${right}`,codeLine:1});
    while(left<right) {
      if(height[left]<height[right]) {
        if(height[left]>=leftMax) { leftMax=height[left];
          steps.push({type:"bars",array:[...height],pointers:{left,right},leftMax,rightMax,water,highlight:[left],
            variables:{left,right,leftMax,rightMax,water},explanation:`height[${left}]=${height[left]} ≥ leftMax. Update leftMax=${leftMax}`,codeLine:5}); }
        else { water+=leftMax-height[left];
          steps.push({type:"bars",array:[...height],pointers:{left,right},leftMax,rightMax,water,highlight:[left],
            variables:{left,right,leftMax,rightMax,water,trapped:leftMax-height[left]},
            explanation:`Trap ${leftMax-height[left]} water at [${left}]. leftMax=${leftMax}, height=${height[left]}. Total=${water}`,codeLine:6}); }
        left++;
      } else {
        if(height[right]>=rightMax) { rightMax=height[right];
          steps.push({type:"bars",array:[...height],pointers:{left,right},leftMax,rightMax,water,highlight:[right],
            variables:{left,right,leftMax,rightMax,water},explanation:`height[${right}]=${height[right]} ≥ rightMax. Update rightMax=${rightMax}`,codeLine:9}); }
        else { water+=rightMax-height[right];
          steps.push({type:"bars",array:[...height],pointers:{left,right},leftMax,rightMax,water,highlight:[right],
            variables:{left,right,leftMax,rightMax,water,trapped:rightMax-height[right]},
            explanation:`Trap ${rightMax-height[right]} water at [${right}]. rightMax=${rightMax}, height=${height[right]}. Total=${water}`,codeLine:10}); }
        right--;
      }
    }
    steps.push({type:"bars",array:[...height],pointers:{},leftMax,rightMax,water,highlight:[],
      variables:{water},explanation:`Done! Total water trapped = ${water}`,codeLine:13});
    return steps;
  }},

  "next-greater": { generate(nums=[2,1,5,3,4]) {
    const steps=[]; const result=new Array(nums.length).fill(-1); const stack=[];
    for(let i=0;i<nums.length;i++) {
      while(stack.length && nums[stack[stack.length-1]]<nums[i]) {
        const idx=stack.pop(); result[idx]=nums[i];
        steps.push({type:"array",array:[...nums],pointers:{i},highlight:[idx,i],
          result:[...result],stack:[...stack],
          variables:{i,"nums[i]":nums[i],"popped index":idx,"result[idx]":nums[i],stack:`[${stack.join(",")}]`},
          explanation:`nums[${idx}]=${nums[idx]} < nums[${i}]=${nums[i]}. NGE of index ${idx} is ${nums[i]}`,codeLine:5});
      }
      stack.push(i);
      steps.push({type:"array",array:[...nums],pointers:{i},highlight:[i],
        result:[...result],stack:[...stack],
        variables:{i,"nums[i]":nums[i],stack:`[${stack.join(",")}]`},
        explanation:`Push index ${i} (val=${nums[i]}) onto stack. No larger element seen yet.`,codeLine:8});
    }
    steps.push({type:"array",array:[...nums],pointers:{},highlight:[],result:[...result],stack:[],
      variables:{result:JSON.stringify(result)},explanation:`Done! Remaining stack elements have NGE=-1`,codeLine:9});
    return steps;
  }},

  "binary-search-rotated": { generate(nums=[4,5,6,7,0,1,2], target=0) {
    const steps=[]; let lo=0,hi=nums.length-1;
    while(lo<=hi) {
      const mid=Math.floor((lo+hi)/2);
      const found=nums[mid]===target;
      let explanation="";
      if(found) explanation=`✓ Found target ${target} at index ${mid}!`;
      else if(nums[lo]<=nums[mid]) {
        if(nums[lo]<=target && target<nums[mid]) explanation=`Left half [${lo}..${mid}] is sorted. Target ${target} in range [${nums[lo]},${nums[mid]}). Search left.`;
        else explanation=`Left half sorted. Target ${target} not in [${nums[lo]},${nums[mid]}). Search right.`;
      } else {
        if(nums[mid]<target && target<=nums[hi]) explanation=`Right half [${mid}..${hi}] is sorted. Target ${target} in range (${nums[mid]},${nums[hi]}]. Search right.`;
        else explanation=`Right half sorted. Target ${target} not in (${nums[mid]},${nums[hi]}]. Search left.`;
      }
      steps.push({type:"array",array:[...nums],pointers:{lo,hi,mid},highlight:found?[mid]:[lo,mid,hi],
        variables:{lo,hi,mid,"nums[mid]":nums[mid],target},explanation,codeLine:found?4:5});
      if(found) return steps;
      if(nums[lo]<=nums[mid]) { if(nums[lo]<=target&&target<nums[mid]) hi=mid-1; else lo=mid+1; }
      else { if(nums[mid]<target&&target<=nums[hi]) lo=mid+1; else hi=mid-1; }
    }
    steps.push({type:"array",array:[...nums],pointers:{},highlight:[],variables:{target},explanation:`Target ${target} not found.`,codeLine:12});
    return steps;
  }},

  "merge-sort": { generate(nums=[5,2,4,6,1,3]) {
    const steps=[], arr=[...nums];
    function ms(a,l,r,depth=0) {
      if(l>=r) return;
      const mid=Math.floor((l+r)/2);
      steps.push({type:"array",array:[...a],pointers:{left:l,mid,right:r},highlight:Array.from({length:r-l+1},(_,i)=>i+l),
        variables:{left:l,right:r,mid,depth},explanation:`Split [${a.slice(l,r+1)}] at mid=${mid}`,codeLine:2});
      ms(a,l,mid,depth+1); ms(a,mid+1,r,depth+1);
      const L=a.slice(l,mid+1),R=a.slice(mid+1,r+1); let i=0,j=0,k=l;
      while(i<L.length&&j<R.length) {
        if(L[i]<=R[j]) a[k++]=L[i++]; else a[k++]=R[j++];
        steps.push({type:"array",array:[...a],pointers:{left:l,right:r,k:k-1},highlight:[k-1],
          variables:{i,j,"placing":a[k-1],depth},explanation:`Merge [${l}..${r}]: place ${a[k-1]} at idx ${k-1}`,codeLine:11});
      }
      while(i<L.length) a[k++]=L[i++]; while(j<R.length) a[k++]=R[j++];
      steps.push({type:"array",array:[...a],pointers:{left:l,right:r},highlight:Array.from({length:r-l+1},(_,i)=>i+l),
        variables:{depth,merged:a.slice(l,r+1).join(",")},explanation:`Merged [${l}..${r}] → [${a.slice(l,r+1)}]`,codeLine:4});
    }
    ms(arr,0,arr.length-1); return steps;
  }},

  "quick-sort": { generate(nums=[3,6,8,10,1,2,1]) {
    const steps=[], arr=[...nums];
    function qs(a,lo,hi) {
      if(lo>=hi) return;
      const pivot=a[hi]; let i=lo-1;
      steps.push({type:"array",array:[...a],pointers:{pivot:hi,low:lo,high:hi},highlight:[hi],
        variables:{pivot,low:lo,high:hi},explanation:`Pivot=${pivot} at idx ${hi}`,codeLine:7});
      for(let j=lo;j<hi;j++) {
        if(a[j]<=pivot) { i++; [a[i],a[j]]=[a[j],a[i]];
          steps.push({type:"array",array:[...a],pointers:{pivot:hi,i,j},highlight:[i,j,hi],
            variables:{pivot,i,j,"arr[j]":a[j]},explanation:`${a[j]}≤${pivot}: swap [${i}]↔[${j}]`,codeLine:10}); }
        else steps.push({type:"array",array:[...a],pointers:{pivot:hi,i,j},highlight:[j,hi],
          variables:{pivot,i,j,"arr[j]":a[j]},explanation:`${a[j]}>${pivot}: skip`,codeLine:9});
      }
      [a[i+1],a[hi]]=[a[hi],a[i+1]];
      steps.push({type:"array",array:[...a],pointers:{pivot:i+1},highlight:[i+1],
        variables:{pivot,"pivot idx":i+1},explanation:`Pivot ${pivot} → final position ${i+1}`,codeLine:11});
      qs(a,lo,i); qs(a,i+2,hi);
    }
    qs(arr,0,arr.length-1); return steps;
  }},

  "bfs": { generate(graphInput) {
    const graph=graphInput||{0:[1,2],1:[3,4],2:[5],3:[],4:[],5:[]};
    const steps=[]; const start=parseInt(Object.keys(graph)[0]);
    const visited=new Set([start]),queue=[start],order=[];
    steps.push({type:"graph",graph,queue:[...queue],visited:[...visited],order:[...order],currentNode:null,
      variables:{queue:`[${start}]`,visited:`{${start}}`,order:"[]"},
      explanation:`Init: enqueue start node ${start}`,codeLine:1});
    while(queue.length) {
      const node=queue.shift(); order.push(node);
      steps.push({type:"graph",graph,queue:[...queue],visited:[...visited],order:[...order],currentNode:node,
        variables:{node,queue:`[${queue.join(",")}]`,order:`[${order.join(",")}]`},
        explanation:`Dequeue ${node}. Neighbors: [${(graph[node]||[]).join(",")||"none"}]`,codeLine:4});
      for(const nb of(graph[node]||[])) if(!visited.has(nb)) {
        visited.add(nb); queue.push(nb);
        steps.push({type:"graph",graph,queue:[...queue],visited:[...visited],order:[...order],currentNode:node,processingNeighbor:nb,
          variables:{node,neighbor:nb,queue:`[${queue.join(",")}]`},
          explanation:`Node ${nb} unvisited → enqueue`,codeLine:6});
      }
    }
    return steps;
  }},

  "dfs": { generate(graphInput) {
    const graph=graphInput||{0:[1,2],1:[3,4],2:[5],3:[],4:[],5:[]};
    const steps=[],visited=new Set(),callStack=[],order=[];
    function dfs(node) {
      callStack.push(node); visited.add(node); order.push(node);
      steps.push({type:"graph",graph,visited:[...visited],order:[...order],callStack:[...callStack],currentNode:node,
        variables:{node,callStack:`[${callStack.join("→")}]`,visited:`{${[...visited].join(",")}}`},
        explanation:`Visit ${node}. Stack depth: ${callStack.length}`,codeLine:2});
      for(const nb of(graph[node]||[])) if(!visited.has(nb)) dfs(nb);
      callStack.pop();
      steps.push({type:"graph",graph,visited:[...visited],order:[...order],callStack:[...callStack],currentNode:node,
        variables:{node,callStack:callStack.length?`[${callStack.join("→")}]`:"empty"},
        explanation:`Backtrack from ${node} → return to ${callStack[callStack.length-1]??"caller"}`,codeLine:4});
    }
    dfs(parseInt(Object.keys(graph)[0])); return steps;
  }},

  "bfs-shortest": { generate(graphInput) {
    const graph=graphInput||{0:[1,2],1:[3],2:[3,4],3:[5],4:[5],5:[]};
    const nodes=Object.keys(graph).map(Number);
    const src=nodes[0], dst=nodes[nodes.length-1];
    const steps=[],visited=new Set([src]),queue=[[src,[src]]];
    steps.push({type:"graph",graph,queue:[src],visited:[...visited],path:[],currentNode:null,src,dst,
      variables:{src,dst,queue:`[${src}]`},explanation:`Find shortest path from ${src} to ${dst}. Enqueue ${src}.`,codeLine:1});
    while(queue.length) {
      const [node,path]=queue.shift();
      steps.push({type:"graph",graph,queue:queue.map(q=>q[0]),visited:[...visited],path:[...path],currentNode:node,src,dst,
        variables:{node,path:`[${path.join("→")}]`,queue:`[${queue.map(q=>q[0]).join(",")}]`},
        explanation:`Dequeue ${node}. Current path: ${path.join("→")}`,codeLine:3});
      if(node===dst) {
        steps.push({type:"graph",graph,queue:[],visited:[...visited],path:[...path],currentNode:node,src,dst,
          variables:{path:`[${path.join("→")}]`,length:path.length-1},
          explanation:`✓ Reached ${dst}! Shortest path: ${path.join("→")} (${path.length-1} edges)`,codeLine:4});
        return steps;
      }
      for(const nb of(graph[node]||[])) if(!visited.has(nb)) {
        visited.add(nb); queue.push([nb,[...path,nb]]);
        steps.push({type:"graph",graph,queue:queue.map(q=>q[0]),visited:[...visited],path:[...path],currentNode:node,processingNeighbor:nb,src,dst,
          variables:{node,neighbor:nb,newPath:`${path.join("→")}→${nb}`},
          explanation:`Enqueue ${nb} with path ${path.join("→")}→${nb}`,codeLine:7});
      }
    }
    return steps;
  }},

  "number-of-islands": { generate() {
    const grid=[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]];
    const steps=[]; const g=grid.map(r=>[...r]); let count=0;
    steps.push({type:"grid",grid:g.map(r=>[...r]),count,active:null,visited:[],
      variables:{count,rows:g.length,cols:g[0].length},explanation:`Scan grid for land cells ('1'). DFS flood-fill each island.`,codeLine:0});
    function dfs(r,c,islandId,visited) {
      if(r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!=="1") return;
      g[r][c]="0"; visited.push([r,c]);
      steps.push({type:"grid",grid:g.map(row=>[...row]),count,active:[r,c],visited:[...visited],
        variables:{r,c,"island#":islandId,visited:visited.length},
        explanation:`DFS: mark [${r},${c}] visited (island #${islandId}). Explore 4 directions.`,codeLine:9});
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>dfs(r+dr,c+dc,islandId,visited));
    }
    for(let r=0;r<g.length;r++) for(let c=0;c<g[0].length;c++) if(g[r][c]==="1") {
      count++; dfs(r,c,count,[]);
      steps.push({type:"grid",grid:g.map(row=>[...row]),count,active:null,visited:[],
        variables:{count},explanation:`Island #${count} fully explored. Total islands so far: ${count}`,codeLine:4});
    }
    return steps;
  }},

  "n-queens": { generate(n=4) {
    const steps=[]; const board=Array.from({length:n},()=>Array(n).fill("."));
    function isValid(row,col) {
      for(let r=0;r<row;r++) { if(board[r][col]==="Q") return false; }
      for(let r=row-1,c=col-1;r>=0&&c>=0;r--,c--) if(board[r][c]==="Q") return false;
      for(let r=row-1,c=col+1;r>=0&&c<n;r--,c++) if(board[r][c]==="Q") return false;
      return true;
    }
    let solutions=0;
    function backtrack(row) {
      if(row===n) { solutions++;
        steps.push({type:"board",board:board.map(r=>[...r]),row,n,solutions,
          variables:{solutions,row},explanation:`✓ Solution #${solutions} found! All ${n} queens placed safely.`,codeLine:4});
        return;
      }
      for(let col=0;col<n;col++) {
        const valid=isValid(row,col);
        if(valid) {
          board[row][col]="Q";
          steps.push({type:"board",board:board.map(r=>[...r]),row,col,n,solutions,
            variables:{row,col,solutions},explanation:`Place queen at (${row},${col}). Valid — no conflicts. Recurse row ${row+1}.`,codeLine:7});
          backtrack(row+1);
          board[row][col]=".";
          steps.push({type:"board",board:board.map(r=>[...r]),row,col,n,solutions,
            variables:{row,col,solutions},explanation:`Backtrack: remove queen from (${row},${col}). Try next column.`,codeLine:10});
        } else {
          steps.push({type:"board",board:board.map(r=>[...r]),row,col,n,solutions,
            variables:{row,col,solutions},explanation:`(${row},${col}) invalid — conflicts with existing queen. Skip.`,codeLine:8});
        }
      }
    }
    backtrack(0); return steps;
  }},

  "coin-change": { generate(coins=[1,5,11], amount=15) {
    const steps=[]; const dp=new Array(amount+1).fill(Infinity); dp[0]=0;
    steps.push({type:"dp",dp:[...dp],coins,amount,current:0,
      variables:{dp:`[${dp.slice(0,Math.min(amount+1,12)).join(",")}...]`,"dp[0]":0},
      explanation:`Init: dp[0]=0 (0 coins for amount 0). All others = ∞`,codeLine:1});
    for(let i=1;i<=amount;i++) {
      let best=dp[i];
      for(const coin of coins) {
        if(coin<=i && dp[i-coin]+1<dp[i]) {
          dp[i]=dp[i-coin]+1;
          steps.push({type:"dp",dp:[...dp],coins,amount,current:i,usedCoin:coin,
            variables:{i,coin,"dp[i-coin]":dp[i-coin],"new dp[i]":dp[i]},
            explanation:`dp[${i}]: use coin ${coin} → dp[${i-coin}]+1=${dp[i]} (better than ${best}). Updated!`,codeLine:5});
          best=dp[i];
        } else if(coin<=i) {
          steps.push({type:"dp",dp:[...dp],coins,amount,current:i,usedCoin:coin,
            variables:{i,coin,"dp[i-coin]+1":dp[i-coin]+1,"dp[i]":dp[i]},
            explanation:`dp[${i}]: coin ${coin} → dp[${i-coin}]+1=${dp[i-coin]+1} ≥ current ${dp[i]}. No update.`,codeLine:5});
        }
      }
    }
    steps.push({type:"dp",dp:[...dp],coins,amount,current:amount,
      variables:{answer:dp[amount]===Infinity?-1:dp[amount]},
      explanation:`Result: dp[${amount}]=${dp[amount]===Infinity?-1:dp[amount]} coins`,codeLine:9});
    return steps;
  }},
};

// ─── GRAPH HELPERS ────────────────────────────────────────────────────────────
function parseGraphInput(text) {
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

function buildLayout(graph) {
  const nodes=Object.keys(graph).map(Number), n=nodes.length;
  const cx=210,cy=180,r=Math.min(150,55+n*14);
  const pos={};
  nodes.forEach((id,i)=>{ const a=(2*Math.PI*i/n)-Math.PI/2; pos[id]={x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}; });
  return pos;
}

function buildEdges(graph) {
  const edges=[],seen=new Set();
  for(const [node,neighbors] of Object.entries(graph)) for(const nb of neighbors) {
    const key=[Math.min(+node,nb),Math.max(+node,nb)].join("-");
    if(!seen.has(key)) { seen.add(key); edges.push([+node,nb]); }
  }
  return edges;
}



// ─── VISUALIZATIONS ───────────────────────────────────────────────────────────
function GraphViz({ step, algoKey }) {
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

function BarViz({ step }) {
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

function GridViz({ step }) {
  if(!step?.grid) return null;
  const {grid,active,visited=[]}=step;
  const visitedSet=new Set(visited.map(([r,c])=>`${r},${c}`));
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-1">
        {grid.map((row,r)=>(
          <div key={r} className="flex gap-1">
            {row.map((cell,c)=>{
              const isActive=active&&active[0]===r&&active[1]===c;
              const isVisited=visitedSet.has(`${r},${c}`);
              const isLand=cell==="1";
              let bg=isActive?"#f59e0b":isLand?"#16a34a":isVisited?"#1d4ed8":"#0f172a";
              return (
                <motion.div key={c} animate={{backgroundColor:bg,scale:isActive?1.15:1}} transition={{duration:0.2}}
                  className="w-10 h-10 flex items-center justify-center rounded border text-xs font-mono font-bold text-white"
                  style={{borderColor:isActive?"#fbbf24":isLand?"#22c55e":"#1e293b"}}>
                  {isActive?"★":cell==="1"?"■":"○"}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block"/>water</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block"/>land</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"/>active</span>
      </div>
      {step.count>0&&<div className="text-sm text-emerald-400 font-mono">Islands found: {step.count}</div>}
    </div>
  );
}

function BoardViz({ step }) {
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

function DPViz({ step }) {
  if(!step?.dp) return null;
  const {dp,amount,current,usedCoin,coins}=step;
  const show=dp.slice(0,Math.min(dp.length,amount+1));
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {show.map((val,i)=>{
          const isCurrent=i===current;
          const isUsed=isCurrent&&usedCoin!=null;
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

function ArrayViz({ step, algoKey }) {
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

function VizRouter({ step, algoKey }) {
  if(!step) return null;
  if(step.type==="graph") return <GraphViz step={step} algoKey={algoKey}/>;
  if(step.type==="grid") return <GridViz step={step}/>;
  if(step.type==="board") return <BoardViz step={step}/>;
  if(step.type==="dp") return <DPViz step={step}/>;
  if(step.type==="bars") return <BarViz step={step}/>;
  return <ArrayViz step={step} algoKey={algoKey}/>;
}

// ─── CODE PANEL ───────────────────────────────────────────────────────────────
const LANG_ACCENT={javascript:"border-yellow-500 text-yellow-400",python:"border-blue-500 text-blue-400",java:"border-orange-500 text-orange-400"};

function CodePanel({algoKey,activeLine,lang,onLangChange}) {
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

// ─── PROBLEM PANEL ────────────────────────────────────────────────────────────
function ProblemPanel({algoKey}) {
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

// ─── VARIABLES PANEL ─────────────────────────────────────────────────────────
function VariablesPanel({variables}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(variables||{}).map(([k,v])=>(
        <motion.div key={k} layout className="bg-slate-900 border border-slate-700 rounded px-3 py-2">
          <div className="text-[10px] text-slate-500 font-mono">{k}</div>
          <div className="text-xs text-cyan-300 font-mono truncate">{typeof v==="object"?JSON.stringify(v):String(v)}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const catIcons={
  "Arrays":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><rect x="3" y="8" width="4" height="8" rx="1"/><rect x="10" y="5" width="4" height="11" rx="1"/><rect x="17" y="3" width="4" height="13" rx="1"/></svg>,
  "Sorting":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><path d="M3 6h18M6 12h12M9 18h6"/></svg>,
  "Graphs":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h5l7-7M7 12h5l7 7"/></svg>,
  "Backtracking":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/></svg>,
  "DP":<svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={1.5}><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="10" y="3" width="5" height="5" rx="1"/><rect x="17" y="3" width="4" height="5" rx="1"/><rect x="3" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/></svg>,
};

function Sidebar({selectedAlgo,onSelect}) {
  const [expanded,setExpanded]=useState(Object.fromEntries(Object.keys(categories).map(k=>[k,true])));
  return (
    <div className="w-52 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">AlgoLab</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">DSA Learning Platform</p>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {Object.entries(categories).map(([cat,algos])=>(
          <div key={cat}>
            <button onClick={()=>setExpanded(e=>({...e,[cat]:!e[cat]}))}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors">
              <span className="text-slate-500">{catIcons[cat]}</span>
              <span>{cat}</span>
              <motion.span animate={{rotate:expanded[cat]?90:0}} className="ml-auto text-slate-600 text-sm">›</motion.span>
            </button>
            <AnimatePresence>
              {expanded[cat]&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.18}} className="overflow-hidden">
                  {algos.map(id=>(
                    <button key={id} onClick={()=>onSelect(id)}
                      className={`w-full text-left px-7 py-1 text-[11px] transition-colors leading-snug ${selectedAlgo===id?"text-blue-400 bg-blue-950/50 border-r-2 border-blue-500":"text-slate-400 hover:text-slate-200 hover:bg-slate-900"}`}>
                      {algoMeta[id]?.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INPUT BAR ────────────────────────────────────────────────────────────────

function generateInputFor(algoId,type) {
  const size=10;
  if(algoId==="sliding-window") return {random:"pwwkew",sorted:"abcdef",reverse:"fedcba",duplicates:"aababcabcde"}[type]||"abcabcbb";
  if(algoId==="trapping-rain") return ({
    random:Array.from({length:12},()=>Math.floor(Math.random()*5)).join(","),
    sorted:"0,1,2,3,4,5",reverse:"5,4,3,2,1,0",duplicates:"0,1,0,2,1,0,1,3,2,1,2,1"
  })[type]||"0,1,0,2,1,0,1,3,2,1,2,1";
  if(algoId==="kadane") return ({
    random:Array.from({length:8},()=>Math.floor(Math.random()*10)-5).join(","),
    sorted:"-5,-3,-1,0,1,3,5",reverse:"5,3,1,0,-1,-3,-5",duplicates:"-2,1,-3,4,-1,2,1,-5,4"
  })[type]||"-2,1,-3,4,-1,2,1,-5,4";
  if(algoId==="next-greater") return ({
    random:Array.from({length:6},()=>Math.floor(Math.random()*9)+1).join(","),
    sorted:"1,2,3,4,5",reverse:"5,4,3,2,1",duplicates:"2,1,5,3,4"
  })[type]||"2,1,5,3,4";
  if(algoId==="binary-search-rotated") return ({
    random:"4,5,6,7,0,1,2",sorted:"1,2,3,4,5,6,7",reverse:"7,6,5,4,3,2,1",duplicates:"3,4,5,1,2"
  })[type]||"4,5,6,7,0,1,2";
  const pools={random:Array.from({length:size},()=>Math.floor(Math.random()*90)+10),
    sorted:Array.from({length:size},(_,i)=>(i+1)*9),
    reverse:Array.from({length:size},(_,i)=>(size-i)*9),
    duplicates:[15,30,45,60,15,30,75,45,60,75]};
  return (pools[type]||pools.random).join(",");
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedAlgo,setSelectedAlgo]=useState("two-sum-hash");
  const [steps,setSteps]=useState([]);
  const [stepIdx,setStepIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(700);
  const [customInput,setCustomInput]=useState("2,7,11,15,3,6,4,1");
  const [target,setTarget]=useState(9);
  const [bsTarget,setBsTarget]=useState(0);
  const [coinAmount,setCoinAmount]=useState(15);
  const [nQueensN,setNQueensN]=useState(4);
  const [graphInput,setGraphInput]=useState(PRESET_GRAPHS.default);
  const [graphError,setGraphError]=useState("");
  const [inputError,setInputError]=useState("");
  const [isLoading,setIsLoading]=useState(false);
  const [lang,setLang]=useState("javascript");
  const [rightTab,setRightTab]=useState("explain");
  const intervalRef=useRef(null);

  const meta=algoMeta[selectedAlgo]||{};
  const step=steps[stepIdx];
  const isGraph=GRAPH_ALGO_IDS.has(selectedAlgo);
  const isGrid=GRID_ALGO_IDS.has(selectedAlgo);
  const isBoard=BOARD_ALGO_IDS.has(selectedAlgo);
  const isDP=DP_ALGO_IDS.has(selectedAlgo);
  const isString=STRING_ALGO_IDS.has(selectedAlgo);
  const isTwoSum=TWOSUM_IDS.has(selectedAlgo);
  const isBSRotated=selectedAlgo==="binary-search-rotated";
  const fixedInput=isGrid||isBoard;

  const runAlgo=useCallback((algoId,input,extraParams={})=>{
    setIsLoading(true); setPlaying(false);
    setTimeout(()=>{
      try {
        const a=algorithms[algoId]; let result;
        if(isGraph||GRAPH_ALGO_IDS.has(algoId)) result=a.generate(extraParams.graph||null);
        else if(GRID_ALGO_IDS.has(algoId)||BOARD_ALGO_IDS.has(algoId)) {
          if(algoId==="n-queens") result=a.generate(extraParams.n||4);
          else result=a.generate();
        } else if(DP_ALGO_IDS.has(algoId)) {
          const nums=typeof input==="string"?input.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)):input;
          result=a.generate(nums,extraParams.amount||15);
        } else if(STRING_ALGO_IDS.has(algoId)) result=a.generate(typeof input==="string"?input:"abcabcbb");
        else {
          const nums=typeof input==="string"?input.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)):input;
          if(algoId==="two-sum-brute"||algoId==="two-sum-hash") result=a.generate(nums,extraParams.target??9);
          else if(algoId==="binary-search-rotated") result=a.generate(nums,extraParams.bsTarget??0);
          else result=a.generate(nums);
        }
        setSteps(result||[]); setStepIdx(0);
      } catch(e) { console.error(e); }
      setIsLoading(false);
    },200);
  },[]);

  useEffect(()=>{
    setCustomInput(generateInputFor(selectedAlgo,"random")||"2,7,11,15,3,6,4,1");
    runAlgo(selectedAlgo, generateInputFor(selectedAlgo,"random")||"2,7,11,15,3,6,4,1",{target,bsTarget,amount:coinAmount,n:nQueensN});
  },[selectedAlgo]);

  useEffect(()=>{
    if(playing) {
      intervalRef.current=setInterval(()=>{
        setStepIdx(i=>{ if(i>=steps.length-1){setPlaying(false);return i;} return i+1; });
      },speed);
    }
    return ()=>clearInterval(intervalRef.current);
  },[playing,speed,steps.length]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="ArrowRight") setStepIdx(i=>Math.min(i+1,steps.length-1));
      if(e.key==="ArrowLeft") setStepIdx(i=>Math.max(i-1,0));
      if(e.key===" "){e.preventDefault();setPlaying(p=>!p);}
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[steps.length]);

  const handleRun=()=>{
    setInputError(""); setGraphError("");
    if(isGraph) {
      const parsed=parseGraphInput(graphInput);
      if(!parsed){setGraphError("Invalid. Use: 0:1,2 1:3 2: (space-separated)");return;}
      runAlgo(selectedAlgo,null,{graph:parsed}); return;
    }
    if(fixedInput) { runAlgo(selectedAlgo,null,{n:nQueensN}); return; }
    if(isString) { runAlgo(selectedAlgo,customInput); return; }
    const nums=customInput.split(",").map(x=>parseInt(x.trim()));
    if(nums.some(isNaN)||nums.length<1){setInputError("Enter comma-separated integers");return;}
    if(nums.length>25){setInputError("Max 25 elements");return;}
    runAlgo(selectedAlgo,customInput,{target,bsTarget,amount:coinAmount});
  };

  const handleGenerate=(type)=>{
    if(isGraph){ const v=PRESET_GRAPHS[type]||PRESET_GRAPHS.default; setGraphInput(v); const p=parseGraphInput(v); if(p) runAlgo(selectedAlgo,null,{graph:p}); return; }
    if(fixedInput) return;
    const val=generateInputFor(selectedAlgo,type);
    setCustomInput(val);
    if(isString) { runAlgo(selectedAlgo,val); return; }
    const nums=typeof val==="string"?val.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)):val;
    runAlgo(selectedAlgo,nums,{target,bsTarget,amount:coinAmount});
  };

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
