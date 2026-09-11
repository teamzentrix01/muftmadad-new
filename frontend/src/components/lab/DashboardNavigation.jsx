"use client";

import { useState, useId } from 'react';
import { Building2, FlaskConical, ChevronDown } from 'lucide-react';
import { labTabs } from '@/lib/lab-api';

export default function DashboardNavigation({ hospitalNav, activePage, onNavigate }) {
  const current = activePage.startsWith('lab-') ? 'lab' : 'hospital';
  const [expanded, setExpanded] = useState(current);
  const [previousPage, setPreviousPage] = useState(activePage);
  const id = useId();
  if (previousPage !== activePage) {
    setPreviousPage(activePage);
    setExpanded(current);
  }
  const groups = [
    { key: 'hospital', name: 'Hospital Dashboard', Icon: Building2, items: hospitalNav, home: 'dashboard' },
    { key: 'lab', name: 'Lab Dashboard', Icon: FlaskConical, items: labTabs.map(([key, label]) => ({ key: `lab-${key}`, label })), home: 'lab-overview' },
  ];
  return <nav className="space-y-3" aria-label="Dashboard modules">
    {groups.map(({ key, name, Icon, items, home }) => <section key={key}>
      <button type="button" aria-expanded={expanded === key} aria-controls={`${id}-${key}`}
        onClick={() => { if (expanded === key) setExpanded(null); else { setExpanded(key); onNavigate(home, true); } }}
        className={`w-full flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold ${current === key ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-700'}`}>
        <Icon className="h-5 w-5 shrink-0" /><span className="flex-1">{name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded === key ? 'rotate-180' : ''}`} />
      </button>
      <div id={`${id}-${key}`} hidden={expanded !== key} className="mt-2 space-y-1 border-l border-slate-200 pl-2">
        {items.map((item, index) => item.divider ? <p key={index} className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400">{item.label}</p> :
          <button key={item.key} type="button" aria-current={activePage === item.key ? 'page' : undefined} onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${activePage === item.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {item.icon}<span>{item.label}</span>
          </button>)}
      </div>
    </section>)}
  </nav>;
}
