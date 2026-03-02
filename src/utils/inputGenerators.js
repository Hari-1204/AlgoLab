export function generateInputFor(algoId, type) {
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
  const pools={
    random:Array.from({length:size},()=>Math.floor(Math.random()*90)+10),
    sorted:Array.from({length:size},(_,i)=>(i+1)*9),
    reverse:Array.from({length:size},(_,i)=>(size-i)*9),
    duplicates:[15,30,45,60,15,30,75,45,60,75]
  };
  return (pools[type]||pools.random).join(",");
}