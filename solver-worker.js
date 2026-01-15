
// （節錄：handleSolve 產生 states 同時收集 1‑based 座標）
const states=[ stateToLines(pieces,chest) ];
let cur=pieces;

// ✅ 座標版步驟（1‑based, 左上角為 (1,1)）
const movesWithCoords=[];
for(let j=0;j<result.path.length;j++){
  const name=result.path[j][0], dir=result.path[j][1];
  let idx=-1;
  for(let k=0;k<cur.length;k++){
    if(cur[k].name===name){ idx=k; break; }
  }
  const pBefore=cur[idx]; // 0-based 內部座標（棋子左上角）
  const from1Based={ x: pBefore.c + 1, y: pBefore.r + 1 };

  const dr=(dir==='上'?-1:(dir==='下'?1:0)), dc=(dir==='左'?-1:(dir==='右'?1:0));
  const gridIdx=piecesToGridIdx(cur);
  if(!canMove(cur[idx],gridIdx,dr,dc)) throw new Error('回放移動無效：'+name+dir);

  const curAfter=movePiece(cur,idx,dr,dc);
  const pAfter=curAfter[idx];
  const to1Based={ x: pAfter.c + 1, y: pAfter.r + 1 };

  movesWithCoords.push({ name, dir, from: from1Based, to: to1Based });

  cur=curAfter;
  states.push( stateToLines(cur,chest) );
}

postMessage({
  type:'SOLVE_DONE',
  mode,
  steps:result.path,
  states,
  metrics,
  movesWithCoords   // ✅ 帶回前端
});
``
