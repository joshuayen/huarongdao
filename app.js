
(function(){
'use strict';
var btnLoadExample=document.getElementById('btnLoadExample');
var mapFile=document.getElementById('mapFile');
var mapText=document.getElementById('mapText');
var btnSolveChest=document.getElementById('btnSolveChest');
var btnSolveExit=document.getElementById('btnSolveExit');
var statusMsg=document.getElementById('statusMsg');
var boardSizeEl=document.getElementById('boardSize');
var stepCountEl=document.getElementById('stepCount');
var perfLoadEl=document.getElementById('perfLoad');
var perfSolveEl=document.getElementById('perfSolve');
var perfTotalEl=document.getElementById('perfTotal');
var nodesExpandedEl=document.getElementById('nodesExpanded');
var statesVisitedEl=document.getElementById('statesVisited');
var peakQueueEl=document.getElementById('peakQueue');
var boardGrid=document.getElementById('boardGrid');
var stepList=document.getElementById('stepList');
var btnReplay=document.getElementById('btnReplay');
var btnPrev=document.getElementById('btnPrev');
var btnNext=document.getElementById('btnNext');
var btnDownload=document.getElementById('btnDownload');
var replayPos=document.getElementById('replayPos');
var lastUpdated=document.getElementById('lastUpdated');
var versionEl=document.getElementById('version');

var ROWS=7,COLS=4; var replayStates=[]; var replayIndex=0; var latestSolveMeta=null;

// 固定顯示打包時間與版本（不再使用當下時間）
try{
  var buildTime = window.__BUILD_TIME__ || '未設定';
  var version   = window.__APP_VERSION__ || 'v1.0.3';
  lastUpdated.textContent = buildTime;
  versionEl.textContent   = version;
}catch(e){}

// NL-safe split
var NL=String.fromCharCode(10);
function splitLines(s){
  var CR=String.fromCharCode(13);
  return (s||'').split(CR).join('')
    .split(NL).map(function(x){return x.trim();}).filter(function(x){return x.length;});
}

function setBusy(on){
  mapText.disabled=on; mapFile.disabled=on; btnLoadExample.disabled=on;
  btnSolveChest.disabled=on; btnSolveExit.disabled=on;
  btnReplay.disabled=on||!replayStates.length; btnPrev.disabled=on||!replayStates.length;
  btnNext.disabled=on||!replayStates.length; btnDownload.disabled=on||!replayStates.length;
  if(on) boardGrid.classList.add('is-busy'); else boardGrid.classList.remove('is-busy');
}
function setStatus(text,isBusy){
  statusMsg.textContent=text;
  if(isBusy){ var s=document.createElement('span'); s.className='spinner'; statusMsg.insertBefore(s,statusMsg.firstChild); statusMsg.insertBefore(document.createTextNode(' '), s.nextSibling); }
}

function renderBoardFromLines(lines){
  ROWS=lines.length; COLS=lines[0].length;
  boardGrid.innerHTML='';
  boardGrid.style.gridTemplateColumns='repeat('+COLS+', var(--cell-size))';
  boardGrid.style.gridTemplateRows='repeat('+ROWS+', var(--cell-size))';
  for(var r=0;r<ROWS;r++){
    for(var c=0;c<COLS;c++){
      var ch=lines[r][c];
      var cell=document.createElement('div');
      var kind=ch; if(ch==='.') kind='dot'; if(ch==='x') kind='X';
      cell.className='cell c-'+kind;
      cell.textContent=(kind==='dot'?'.':kind.toUpperCase());
      boardGrid.appendChild(cell);
    }
  }
  boardSizeEl.textContent=COLS+'x'+ROWS;
}

btnReplay.addEventListener('click',function(){ if(!replayStates.length) return; btnReplay.disabled=true; var i=0;(function step(){ if(i>=replayStates.length){ btnReplay.disabled=false; return;} replayIndex=i; var st=replayStates[i]; renderBoardFromLines(st); mapText.value=st.join(NL); replayPos.textContent=replayIndex+'/'+(replayStates.length-1); i++; setTimeout(step,350);} )(); });
btnPrev.addEventListener('click',function(){ if(!replayStates.length) return; replayIndex=Math.max(0,replayIndex-1); var st=replayStates[replayIndex]; renderBoardFromLines(st); mapText.value=st.join(NL); replayPos.textContent=replayIndex+'/'+(replayStates.length-1); });
btnNext.addEventListener('click',function(){ if(!replayStates.length) return; replayIndex=Math.min(replayStates.length-1,replayIndex+1); var st=replayStates[replayIndex]; renderBoardFromLines(st); mapText.value=st.join(NL); replayPos.textContent=replayIndex+'/'+(replayStates.length-1); });

btnDownload.addEventListener('click',function(){ if(!latestSolveMeta) return; var meta=latestSolveMeta; var now=new Date(); var stamp=now.toLocaleString('zh-TW'); var author='JoshuaYen'; var ver=(window.__APP_VERSION__||'v1.0.3'); var movesText=''; movesText+='模式: '+(meta.mode==='CHEST'?'BFS-關羽吃寶箱':'A*-曹操脫逃')+NL; movesText+='步數: '+meta.steps.length+NL; movesText+='效能(秒): 讀檔 '+meta.metrics.secLoad.toFixed(2)+'s, 求解 '+meta.metrics.secSolve.toFixed(2)+'s, 總計 '+meta.metrics.secTotal.toFixed(2)+'s'+NL; movesText+='節點: 展開 '+meta.metrics.nodesExpanded+', 訪問 '+meta.metrics.statesVisited+', 峰值 '+meta.metrics.peakQueue+NL+NL; for(var i=0;i<meta.steps.length;i++){ movesText+=((i+1)+'. '+meta.steps[i][0]+meta.steps[i][1]+NL);} movesText+=NL+'作者: '+author+'  版本: '+ver+'  更新時間: '+stamp+NL; var blob1=new Blob([movesText],{type:'text/plain;charset=utf-8'}); var a1=document.createElement('a'); a1.href=URL.createObjectURL(blob1); a1.download='solution_moves.txt'; a1.click(); var pathText=''; pathText+='模式: '+(meta.mode==='CHEST'?'BFS-關羽吃寶箱':'A*-曹操脫逃')+NL; pathText+='步數: '+meta.steps.length+NL; pathText+='效能(秒): 讀檔 '+meta.metrics.secLoad.toFixed(2)+'s, 求解 '+meta.metrics.secSolve.toFixed(2)+'s, 總計 '+meta.metrics.secTotal.toFixed(2)+'s'+NL; pathText+='節點: 展開 '+meta.metrics.nodesExpanded+', 訪問 '+meta.metrics.statesVisited+', 峰值 '+meta.metrics.peakQueue+NL+NL; for(var j=0;j<meta.states.length;j++){ pathText+='Step '+j+':'+NL; for(var r=0;r<meta.states[j].length;r++){ pathText+=meta.states[j][r]+NL;} pathText+=NL;} pathText+=NL+'作者: '+author+'  版本: '+ver+'  更新時間: '+stamp+NL; var blob2=new Blob([pathText],{type:'text/plain;charset=utf-8'}); var a2=document.createElement('a'); a2.href=URL.createObjectURL(blob2); a2.download='solution_path.txt'; a2.click(); });

var DEFAULT_EXAMPLE_URL='example/map.txt'; var EXAMPLE_FALLBACK=['CCSV','CCSV','VGGS','VSHH','X.HH','VVVV','VVVV'].join(NL);
function loadDefaultExample(){ if(!window.fetch){ mapText.value=EXAMPLE_FALLBACK; statusMsg.textContent='已載入內建範例（環境不支援 fetch）。'; return;} fetch(DEFAULT_EXAMPLE_URL).then(function(resp){return resp.text();}).then(function(txt){ mapText.value=txt; statusMsg.textContent='已載入預設範例 example/map.txt。'; }).catch(function(){ mapText.value=EXAMPLE_FALLBACK; statusMsg.textContent='讀取 example/map.txt 失敗，已載入內建範例。'; }); }
btnLoadExample.addEventListener('click',loadDefaultExample);
mapFile.addEventListener('change',function(e){ var f=e.target.files && e.target.files[0]; if(!f) return; var reader=new FileReader(); reader.onload=function(){ mapText.value=reader.result; statusMsg.textContent='已載入檔案：'+f.name; }; reader.readAsText(f); });

var worker=new Worker('solver-worker.js');
worker.onmessage=function(ev){ var data=ev.data||{}; if(data.type==='SOLVE_DONE'){ perfLoadEl.textContent='讀檔 '+(data.metrics.secLoad!=null?data.metrics.secLoad.toFixed(2)+'s':'—'); perfSolveEl.textContent='求解 '+(data.metrics.secSolve!=null?data.metrics.secSolve.toFixed(2)+'s':'—'); perfTotalEl.textContent='總計 '+(data.metrics.secTotal!=null?data.metrics.secTotal.toFixed(2)+'s':'—'); nodesExpandedEl.textContent='展開 '+(data.metrics.nodesExpanded!=null?data.metrics.nodesExpanded:'—'); statesVisitedEl.textContent='訪問 '+(data.metrics.statesVisited!=null?data.metrics.statesVisited:'—'); peakQueueEl.textContent='峰值 '+(data.metrics.peakQueue!=null?data.metrics.peakQueue:'—'); stepList.innerHTML=''; var steps=data.steps||[]; stepCountEl.textContent=steps.length?steps.length:'不可達'; if(!steps.length){ setStatus(data.msg||'未找到解',false); replayStates=[]; replayPos.textContent='—/—'; setBusy(false); latestSolveMeta=null; return;} setStatus((data.mode==='CHEST'?'已找到最短解！（BFS）':'已找到解！（A*：曹操脫逃）'),false); for(var i=0;i<steps.length;i++){ var li=document.createElement('li'); li.textContent=(i+1)+'. '+steps[i][0]+steps[i][1]; stepList.appendChild(li);} replayStates=data.states||[]; replayIndex=0; var st0=replayStates[0]; renderBoardFromLines(st0); mapText.value=st0.join(NL); replayPos.textContent=replayIndex+'/'+(replayStates.length-1); btnReplay.disabled=false; btnPrev.disabled=false; btnNext.disabled=false; btnDownload.disabled=false; latestSolveMeta={ mode:data.mode, steps:steps, states:replayStates, metrics:data.metrics }; setBusy(false); } else if(data.type==='SOLVE_ERROR'){ setStatus('錯誤：'+(data.error||'未知錯誤'),false); setBusy(false);} else if(data.type==='SOLVE_PROGRESS'){ setStatus('正在求解… '+data.progress+' 節點',true);} };

btnSolveChest.addEventListener('click',function(){ try{ var raw=(mapText.value||'').trim(); if(!raw) throw new Error('請先載入或貼上盤面文字'); setBusy(true); setStatus('正在求解（BFS：關羽吃寶箱）…請稍候',true); worker.postMessage({type:'SOLVE_CHEST', payload:{raw:raw}});}catch(err){ setStatus('錯誤：'+err.message,false); setBusy(false);} });
btnSolveExit.addEventListener('click',function(){ try{ var raw=(mapText.value||'').trim(); if(!raw) throw new Error('請先載入或貼上盤面文字'); setBusy(true); setStatus('正在求解（A*：曹操脫逃）…請稍候',true); worker.postMessage({type:'SOLVE_EXIT', payload:{raw:raw}});}catch(err){ setStatus('錯誤：'+err.message,false); setBusy(false);} });

loadDefaultExample();
})();
