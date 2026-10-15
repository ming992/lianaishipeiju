(function(){
const KEY='love-fit-studio:v1';
const empty=()=>({schema:1,draft:null,history:[],wishes:{},calendar:{},gameRuns:[]});
let volatile=empty(), available=true;
try { const probe=KEY+':probe'; localStorage.setItem(probe,'1');localStorage.removeItem(probe); } catch {available=false;}
function get(){try{const raw=available?localStorage.getItem(KEY):null; const d=raw?JSON.parse(raw):volatile;return d&&d.schema===1?Object.assign(empty(),d):empty();}catch{return volatile;}}
function put(d){volatile=d;try{if(available)localStorage.setItem(KEY,JSON.stringify(d));return available;}catch{available=false;return false;}}
window.LoveStore={get,put,available:()=>available,patch(key,value){const d=get();d[key]=value;return put(d);},saveReport(report){const d=get();d.history=[report,...d.history.filter(r=>r.id!==report.id)].slice(0,30);d.draft=null;return put(d);},clear(){try{localStorage.removeItem(KEY);}catch{}volatile=empty();},removeReport(id){const d=get();d.history=d.history.filter(r=>r.id!==id);put(d);}};
})();
