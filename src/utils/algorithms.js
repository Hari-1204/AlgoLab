export const algorithms = {
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