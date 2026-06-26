import React from 'react';

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'order', label: 'Default order' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Date created' },
  { value: 'title', label: 'Title' },
];

const FilterBar = ({ filters, onChange }) => {
  const { priority, sortBy, sortOrder, search } = filters;

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = priority || sortBy !== 'order' || search;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Filter tasks…"
          className="input pl-8 py-1.5 text-xs h-8"
        />
        {search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Priority filter */}
      <select
        value={priority}
        onChange={(e) => update('priority', e.target.value)}
        className="input py-1.5 text-xs h-8 w-auto min-w-[130px]"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort by */}
      <select
        value={sortBy}
        onChange={(e) => update('sortBy', e.target.value)}
        className="input py-1.5 text-xs h-8 w-auto min-w-[120px]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort order toggle */}
      <button
        onClick={() => update('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')}
        className="btn-secondary btn-sm h-8 w-8 p-0 flex items-center justify-center"
        aria-label="Toggle sort order"
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ priority: '', sortBy: 'order', sortOrder: 'asc', search: '' })}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline px-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
