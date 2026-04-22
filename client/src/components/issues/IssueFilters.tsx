import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IssuePriority, IssueSeverity, IssueStatus } from '@/types/issue';
import { PRIORITY_OPTIONS, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/constants/issue';

const ALL = '__all__';

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-updatedAt', label: 'Recently updated' },
  { value: 'updatedAt', label: 'Least recently updated' },
  { value: '-priority', label: 'Priority: high → low' },
  { value: 'priority', label: 'Priority: low → high' },
];

export const DEFAULT_SORT = '-createdAt';

export interface Filters {
  q: string;
  status: IssueStatus | '';
  priority: IssuePriority | '';
  severity: IssueSeverity | '';
}

interface IIssueFilters {
  filters: Filters;
  onChange: (next: Filters) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}

export const IssueFilters = ({ filters, onChange, sort, onSortChange }: IIssueFilters) => {
  const hasActive = filters.q || filters.status || filters.priority || filters.severity;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, status: v === ALL ? '' : (v as IssueStatus) })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, priority: v === ALL ? '' : (v as IssuePriority) })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {PRIORITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.severity || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, severity: v === ALL ? '' : (v as IssueSeverity) })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All severities</SelectItem>
          {SEVERITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[170px] gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ q: '', status: '', priority: '', severity: '' })}
        >
          Clear
        </Button>
      )}
    </div>
  );
};
