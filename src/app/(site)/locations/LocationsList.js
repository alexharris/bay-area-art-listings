'use client';

import { useMemo, useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Current shows as a share of all shows ever; null when a venue has no shows.
const ratioOf = loc => (loc.totalShowCount > 0 ? loc.showCount / loc.totalShowCount : null);

function instagramUrl(handle) {
  const clean = handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  return { href: `https://instagram.com/${clean}`, label: `@${clean}` };
}

function Chip({ label, count, active, onClick }) {
  const disabled = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap select-none transition-colors ${
        active
          ? 'bg-gray-900 text-white border-gray-900 cursor-pointer'
          : disabled
            ? 'bg-white text-gray-300 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 cursor-pointer'
      }`}
    >
      <span>{label}</span>
      {!active && count != null && <span className="opacity-50">({count})</span>}
      {active && <span className="ml-0.5 leading-none">×</span>}
    </button>
  );
}

function SortHeader({ label, sortKey: key, activeKey, dir, onToggle, align = 'right' }) {
  const active = activeKey === key;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`py-2 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onToggle(key)}
        className={`inline-flex items-center gap-1 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-900 ${
          active ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {label}
        <span aria-hidden="true" className="leading-none">
          {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

function LocationRow({ loc }) {
  const ig = loc.Instagram ? instagramUrl(loc.Instagram) : null;
  const hours = loc.Hours ? DAYS.filter(d => loc.Hours[d]) : [];

  return (
    <tr className="border-b border-gray-200 align-top">
      <td className="py-4 pr-4">
        <h3 className="font-semibold">
          {loc.Url ? (
            <a href={loc.Url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {loc.Name}
            </a>
          ) : (
            loc.Name
          )}
        </h3>
        {(loc.Address || loc.City) && (
          <p className="text-sm text-gray-600 mt-0.5">
            {[loc.Address, loc.City].filter(Boolean).join(', ')}
          </p>
        )}
        {ig && (
          <a href={ig.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:underline">
            {ig.label}
          </a>
        )}
        {hours.length > 0 && (
          <details className="mt-1 text-sm text-gray-500">
            <summary className="cursor-pointer">Hours</summary>
            <dl className="mt-1 grid grid-cols-[6rem_1fr]">
              {hours.map(d => (
                <div key={d} className="contents">
                  <dt>{d}</dt>
                  <dd>{loc.Hours[d]}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </td>
      <td className="py-4 pl-4 text-right text-sm tabular-nums w-20">{loc.showCount}</td>
      <td className="py-4 pl-4 text-right text-sm tabular-nums w-20">{loc.totalShowCount}</td>
      <td className="py-4 pl-4 text-right text-sm tabular-nums w-20 text-gray-500">
        {ratioOf(loc) === null ? '—' : `${Math.round(ratioOf(loc) * 100)}%`}
      </td>
    </tr>
  );
}

export default function LocationsList({ locations }) {
  const [county, setCounty] = useState(null);
  const [currentOnly, setCurrentOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = key => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'ratio' ? 'asc' : 'desc');
    }
  };

  const countyOf = loc => loc.county || 'Other';

  const q = query.trim().toLowerCase();
  const matchesQuery = loc =>
    !q || [loc.Name, loc.Address, loc.City, loc.county].some(v => v?.toLowerCase().includes(q));
  const searched = useMemo(() => locations.filter(matchesQuery), [locations, q]);

  // County counts respect the "current shows" toggle; the toggle count respects the county.
  const counties = useMemo(() => {
    const base = currentOnly ? searched.filter(l => l.showCount > 0) : searched;
    const counts = {};
    for (const loc of locations) counts[countyOf(loc)] ??= 0;
    for (const loc of base) counts[countyOf(loc)]++;
    return Object.entries(counts).sort(([a], [b]) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
  }, [locations, searched, currentOnly]);

  const currentCount = useMemo(
    () => searched.filter(l => l.showCount > 0 && (!county || countyOf(l) === county)).length,
    [searched, county]
  );

  const filtered = searched
    .filter(l => (!county || countyOf(l) === county) && (!currentOnly || l.showCount > 0))
    .sort((a, b) => {
      const byName = a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' });
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'current') return (a.showCount - b.showCount) * dir || byName;
      if (sortKey === 'total') return (a.totalShowCount - b.totalShowCount) * dir || byName;
      if (sortKey === 'ratio') {
        const ra = ratioOf(a);
        const rb = ratioOf(b);
        if (ra === null && rb === null) return byName;
        if (ra === null) return 1; // venues with no shows always last
        if (rb === null) return -1;
        return (ra - rb) * dir || (b.totalShowCount - a.totalShowCount) || byName;
      }
      return byName * dir;
    });

  return (
    <>
      <p className="text-sm text-gray-500 -mt-6 mb-4">
        {filtered.length} venue{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search locations"
          aria-label="Search locations"
          className="px-3 py-1.5 rounded-full border border-gray-300 text-sm bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-500 w-full sm:w-56"
        />
        <Chip
          label="Current shows"
          count={currentCount}
          active={currentOnly}
          onClick={() => setCurrentOnly(v => !v)}
        />
        <select
          value={county ?? ''}
          onChange={e => setCounty(e.target.value || null)}
          aria-label="Filter by county"
          className={`px-3 py-1.5 rounded-full border text-sm cursor-pointer ${
            county ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
          }`}
        >
          <option value="">All counties</option>
          {counties.map(([name, count]) => (
            <option key={name} value={name} disabled={count === 0 && county !== name}>
              {name} ({count})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">No locations match these filters.</div>
      ) : (
        <table className="w-full border-collapse">
          <thead className="border-b border-gray-300">
            <tr>
              <SortHeader label="Location" sortKey="name" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} align="left" />
              <SortHeader label="Current" sortKey="current" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
              <SortHeader label="Total" sortKey="total" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
              <SortHeader label="Ratio" sortKey="ratio" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {filtered.map(loc => (
              <LocationRow key={loc._id} loc={loc} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
