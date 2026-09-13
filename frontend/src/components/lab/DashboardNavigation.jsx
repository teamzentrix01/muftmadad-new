"use client";

import { useState, useId } from 'react';
import { Building2, FlaskConical, Users, ChevronDown, Shield, UserCheck, Trash2 } from 'lucide-react';
import { labTabs } from '@/lib/lab-api';

export default function DashboardNavigation({ hospitalNav, activePage, onNavigate, staffNav }) {
  const isRecycleBin = activePage === 'recycle-bin';
  const isStaffPage = activePage === 'list-staff' || activePage === 'list-accounts' || activePage.startsWith('staff-');
  const current = activePage.startsWith('lab-') ? 'lab' : (isStaffPage ? 'staff' : (isRecycleBin ? 'recycle-bin' : 'hospital'));
  const [expanded, setExpanded] = useState(current);
  const [previousPage, setPreviousPage] = useState(activePage);
  const id = useId();

  if (previousPage !== activePage) {
    setPreviousPage(activePage);
    setExpanded(current);
  }

  const defaultStaffNav = [
    { key: 'list-staff', label: 'Staff Directory & Posts', icon: <Shield className="h-4 w-4 text-emerald-600" /> },
    { key: 'list-accounts', label: 'All Registered Accounts', icon: <UserCheck className="h-4 w-4 text-blue-600" /> },
  ];

  const groups = [
    { key: 'hospital', name: 'Hospital Dashboard', Icon: Building2, items: hospitalNav, home: 'dashboard' },
    { key: 'lab', name: 'Lab Dashboard', Icon: FlaskConical, items: labTabs.map(([key, label]) => ({ key: `lab-${key}`, label })), home: 'lab-overview' },
    { key: 'staff', name: 'Staff & Accounts', Icon: Users, items: staffNav || defaultStaffNav, home: 'list-staff' },
  ];

  return (
    <nav className="space-y-3" aria-label="Dashboard modules">
      {groups.map(({ key, name, Icon, items, home }) => (
        <section key={key}>
          <button
            type="button"
            aria-expanded={expanded === key}
            aria-controls={`${id}-${key}`}
            onClick={() => {
              if (expanded === key) setExpanded(null);
              else {
                setExpanded(key);
                onNavigate(home, true);
              }
            }}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold transition-all ${
              current === key
                ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${current === key ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className="flex-1">{name}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded === key ? 'rotate-180' : ''}`} />
          </button>
          <div id={`${id}-${key}`} hidden={expanded !== key} className="mt-2 space-y-1 border-l-2 border-slate-200 pl-2">
            {items.map((item, index) =>
              item.divider ? (
                <p key={index} className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {item.label}
                </p>
              ) : (
                <button
                  key={item.key}
                  type="button"
                  aria-current={activePage === item.key ? 'page' : undefined}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                    activePage === item.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        </section>
      ))}

      {/* Dedicated Recycle Bin Navigation Section */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          aria-current={isRecycleBin ? 'page' : undefined}
          onClick={() => onNavigate('recycle-bin')}
          className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-bold transition-all ${
            isRecycleBin
              ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-300 shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-rose-50/60 hover:text-rose-700'
          }`}
        >
          <div className={`p-1 rounded-lg ${isRecycleBin ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
            <Trash2 className="h-4 w-4 shrink-0" />
          </div>
          <span className="flex-1">Recycle Bin</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${isRecycleBin ? 'bg-rose-200 text-rose-900' : 'bg-slate-200/70 text-slate-600'}`}>
            Admin
          </span>
        </button>
      </div>
    </nav>
  );
}
