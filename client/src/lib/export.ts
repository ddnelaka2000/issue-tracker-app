import type { Issue } from '@/types/issue';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CSV_COLUMNS: { key: keyof Issue; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'severity', label: 'Severity' },
  { key: 'tags', label: 'Tags' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
  { key: 'resolvedAt', label: 'Resolved At' },
  { key: 'closedAt', label: 'Closed At' },
];

export function exportIssuesToCsv(issues: Issue[], filename = 'issues.csv') {
  const header = CSV_COLUMNS.map((c) => escapeCsv(c.label)).join(',');
  const rows = issues.map((issue) =>
    CSV_COLUMNS.map((col) => {
      const value = issue[col.key];
      if (Array.isArray(value)) return escapeCsv(value.join('; '));
      return escapeCsv(value);
    }).join(','),
  );
  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function exportIssuesToJson(issues: Issue[], filename = 'issues.json') {
  const blob = new Blob([JSON.stringify(issues, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, filename);
}
