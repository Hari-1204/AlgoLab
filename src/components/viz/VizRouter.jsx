import GraphViz from "./GraphViz";
import GridViz  from "./GridViz";
import BoardViz from "./BoardViz";
import DPViz    from "./DPViz";
import BarViz   from "./BarViz";
import ArrayViz from "./ArrayViz";

export default function VizRouter({ step, algoKey }) {
  if(!step) return null;
  if(step.type==="graph") return <GraphViz step={step} algoKey={algoKey}/>;
  if(step.type==="grid")  return <GridViz step={step}/>;
  if(step.type==="board") return <BoardViz step={step}/>;
  if(step.type==="dp")    return <DPViz step={step}/>;
  if(step.type==="bars")  return <BarViz step={step}/>;
  return <ArrayViz step={step} algoKey={algoKey}/>;
}