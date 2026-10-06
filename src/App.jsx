import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, LayoutDashboard, RotateCcw, X, Check, Sparkles, Layers3, ListTodo, ArrowUpRight, CircleHelp } from 'lucide-react';
import BoardColumn from './components/BoardColumn.jsx';
import CardModal from './components/CardModal.jsx';
import { createId, createInitialBoard, getStorageKey, loadBoard, saveBoard } from './utils/storage.js';

export default function App() {
  const [board, setBoard] = useState(loadBoard);
  const [modal, setModal] = useState(null);
  const [listTitle, setListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => saveBoard(board), [board]);
  useEffect(() => {
    function sync(e) {
      if (e.key !== getStorageKey() || !e.newValue) return;
      try { const value = JSON.parse(e.newValue); if (Array.isArray(value)) setBoard(value); }
      catch (err) { console.error('Invalid board state from another tab', err); }
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timer); }, [toast]);

  const total = useMemo(() => board.reduce((n, list) => n + list.cards.length, 0), [board]);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? board.map(list => ({ ...list, cards: list.cards.filter(card => card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q)) })) : board;
  }, [board, search]);
  const addList = useCallback(e => {
    e.preventDefault(); const title = listTitle.trim(); if (!title) return;
    setBoard(current => [...current, { id: createId(), title, cards: [] }]);
    setListTitle(''); setAddingList(false); setToast('List added to your workspace');
  }, [listTitle]);
  function deleteList(id) {
    const list = board.find(item => item.id === id); if (!list) return;
    if (!confirm(`Delete "${list.title}" and all ${list.cards.length} card(s) inside it? This cannot be undone.`)) return;
    setBoard(current => current.filter(item => item.id !== id)); setToast('List deleted');
  }
  function deleteCard(listId, cardId) {
    setBoard(current => current.map(list => list.id === listId ? { ...list, cards: list.cards.filter(card => card.id !== cardId) } : list));
    setToast('Card deleted');
  }
  function saveCard(values) {
    const { listId, card } = modal;
    setBoard(current => current.map(list => {
      if (list.id !== listId) return list;
      if (card) return { ...list, cards: list.cards.map(item => item.id === card.id ? { ...item, ...values } : item) };
      const fresh = { id: createId(), ...values, createdAt: new Date().toISOString() };
      return { ...list, cards: [...list.cards, fresh].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    }));
    setModal(null); setToast(card ? 'Changes saved' : 'Task added');
  }
  function dropCard(cardId, sourceId, targetId) {
    if (sourceId === targetId) {
      setBoard(current => current.map(list => list.id === targetId ? { ...list, cards: [...list.cards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) } : list));
      return;
    }
    setBoard(current => {
      let moving = null;
      const next = current.map(list => {
        if (list.id !== sourceId) return list;
        moving = list.cards.find(card => card.id === cardId) || null;
        return { ...list, cards: list.cards.filter(card => card.id !== cardId) };
      });
      if (!moving || !next.some(list => list.id === targetId)) return current;
      return next.map(list => list.id === targetId ? { ...list, cards: [...list.cards, moving].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) } : list);
    });
    setToast('Task moved');
  }
  function reset() {
    if (!confirm('Replace the current board with the original demo board?')) return;
    setBoard(createInitialBoard()); setSearch(''); setToast('Demo board restored');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Layers3 size={21} strokeWidth={2.4} /></div><div><strong>vetty<span>.</span></strong><small>PROJECT SPACE</small></div></div>
        <div className="section-label">YOUR WORKSPACE</div>
        <div className="nav active"><LayoutDashboard size={17} /> <span className="nav-label">Project board</span><span className="nav-count">{board.length}</span></div>
        <div className="side-card"><div className="side-card-icon"><Sparkles size={16}/></div><div><b>Make work flow</b><small>A little progress every day adds up.</small></div></div>
        <div className="sidebar-bottom"><div className="online-indicator"><i/> All changes saved locally</div><div className="profile"><span className="avatar">VB</span><div><b>Vetty candidate</b><small>Demo workspace</small></div><span className="profile-dots">•••</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <b>Project board</b></div><div className="topbar-right"><span className="secure-pill"><Check size={13}/> Auto-saved</span><div className="top-avatar">A</div></div></header>
        <div className="page-content">
          <section className="hero">
            <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
            <div className="hero-copy"><div className="hero-kicker"><Sparkles size={13}/> YOUR SPACE TO GET THINGS DONE</div><h1>Big ideas. <span>Clear progress.</span></h1><p>Keep the moving pieces in one place. Plan a little, make progress, repeat.</p><div className="hero-meta"><span><i/> Workspace is ready</span><span className="hero-meta-dot">•</span><span>Drag tasks between lists to update progress</span></div></div>
            <div className="hero-art" aria-hidden="true"><div className="art-card art-card-back"><span/><span/><span/></div><div className="art-card art-card-front"><div className="art-check"><Check size={17}/></div><div className="art-lines"><i/><i/><i/></div><div className="art-progress"><span/></div></div><div className="art-sparkle"><Sparkles size={22}/></div></div>
          </section>

          <section className="page-heading"><div><div className="eyebrow">OVERVIEW <span>•</span> OCTOBER WORKSPACE</div><h2>Project board</h2><p>Your work, organized your way.</p></div><div className="actions"><button className="btn secondary" onClick={reset}><RotateCcw size={15}/> Reset demo</button><button className="btn primary" onClick={() => setAddingList(true)}><Plus size={17}/> New list</button></div></section>

          <section className="stats-grid" aria-label="Board summary"><div className="stat-card stat-purple"><div className="stat-icon"><ListTodo size={19}/></div><div><span>Total tasks</span><strong>{total}</strong><small>Across your board</small></div><div className="stat-decoration">01</div></div><div className="stat-card stat-coral"><div className="stat-icon"><Layers3 size={19}/></div><div><span>Lists</span><strong>{board.length}</strong><small>Work stages</small></div><div className="stat-decoration">02</div></div><div className="stat-card stat-mint"><div className="stat-icon"><Check size={19}/></div><div><span>Completed</span><strong>{board.filter(list => /done|complete|finished/i.test(list.title)).reduce((n, list) => n + list.cards.length, 0)}</strong><small>In completed lists</small></div><div className="stat-decoration">03</div></div><div className="stat-card stat-blue"><div className="stat-icon"><ArrowUpRight size={19}/></div><div><span>Stay in flow</span><strong className="flow-word">One task</strong><small>One step at a time</small></div><div className="stat-decoration">04</div></div></section>

          <section className="board-toolbar"><div className="board-title"><span className="board-title-mark"><LayoutDashboard size={16}/></span><div><strong>Board view</strong><small>{board.length} lists <span>·</span> {total} tasks</small></div></div><div className="toolbar-actions"><label className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search cards"/>{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</label><button className="help-button" title="Tip: drag a task into another list to move it"><CircleHelp size={17}/></button></div></section>

          {addingList && <form className="new-list" onSubmit={addList}><label htmlFor="list-title">New list name</label><input id="list-title" autoFocus maxLength={60} value={listTitle} onChange={e => setListTitle(e.target.value)} placeholder="e.g. In Review"/><button className="btn primary" disabled={!listTitle.trim()}><Check size={15}/> Create list</button><button type="button" className="icon" aria-label="Cancel" onClick={() => { setAddingList(false); setListTitle(''); }}><X size={17}/></button></form>}

          <div className="board-scroll"><div className="columns">{visible.map((list, index) => <BoardColumn key={list.id} list={list} colorIndex={index % 4} onAddCard={listId => setModal({ listId, card: null })} onDeleteList={deleteList} onDeleteCard={deleteCard} onEditCard={(listId, card) => setModal({ listId, card })} onDropCard={dropCard} onDragEnd={() => {}}/>)}<button className="add-list-tile" onClick={() => setAddingList(true)}><span><Plus size={18}/></span><div><b>Create a new list</b><small>Give your work a new home</small></div></button></div>{search && visible.every(list => !list.cards.length) && <p className="no-results">No tasks match “{search}”. Try another search.</p>}</div>
          <footer className="page-footer"><span>Made for better teamwork <span className="footer-heart">✦</span></span><span><Check size={12}/> Your board stays in this browser</span></footer>
        </div>
      </main>
      {modal && <CardModal initialCard={modal.card} onClose={() => setModal(null)} onSave={saveCard}/>}
      {toast && <div className="toast" role="status"><Check size={16}/>{toast}</div>}
    </div>
  );
}
