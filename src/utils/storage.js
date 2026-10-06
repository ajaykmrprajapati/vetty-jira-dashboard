const KEY = 'vetty-board-state-v1';
export const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export function createInitialBoard() {
  const now = Date.now();
  return [
    { id:createId(), title:'Todo', cards:[
      {id:createId(),title:'Review requirements',description:'Read the assignment and identify the required features.',createdAt:new Date(now-3600000).toISOString()},
      {id:createId(),title:'Set up project',description:'Create the React application structure.',createdAt:new Date(now-1800000).toISOString()}]},
    { id:createId(), title:'In Progress', cards:[{id:createId(),title:'Build board UI',description:'Implement lists, cards, and add controls.',createdAt:new Date(now-900000).toISOString()}]},
    { id:createId(), title:'Done', cards:[{id:createId(),title:'Create project plan',description:'Break the task into small implementation steps.',createdAt:new Date(now-300000).toISOString()}]}
  ];
}
function validBoard(v){return Array.isArray(v)&&v.every(l=>l&&typeof l.id==='string'&&typeof l.title==='string'&&Array.isArray(l.cards)&&l.cards.every(c=>c&&typeof c.id==='string'&&typeof c.title==='string'&&typeof c.description==='string'&&typeof c.createdAt==='string'));}
export function loadBoard(){try{const raw=localStorage.getItem(KEY);if(raw===null){const b=createInitialBoard();saveBoard(b);return b;}const b=JSON.parse(raw);return validBoard(b)?b:createInitialBoard();}catch(e){console.error('Could not load board:',e);return createInitialBoard();}}
export function saveBoard(board){try{localStorage.setItem(KEY,JSON.stringify(board));}catch(e){console.error('Could not save board:',e);window.alert('The board could not be saved. Check browser storage availability.');}}
export const getStorageKey=()=>KEY;
