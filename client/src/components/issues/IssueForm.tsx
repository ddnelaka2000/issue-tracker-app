import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Issue, IssueInput } from '@/types/issue';
import { PRIORITY_OPTIONS, SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/constants/issue';
import { issueSchema, type IssueFormValues } from '@/schemas/issue.schema';

interface IIssueForm {
  initialValues?: Issue;
  onSubmit: (values: IssueInput) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
  showStatus?: boolean;
}

export const IssueForm = ({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
  showStatus = false,
}: IIssueForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      priority: initialValues?.priority ?? 'medium',
      severity: initialValues?.severity ?? 'minor',
      status: initialValues?.status ?? 'open',
      tags: initialValues?.tags ?? [],
    },
  });

  const [tagInput, setTagInput] = useState('');
  const tags = watch('tags');
  const priority = watch('priority');
  const severity = watch('severity');
  const status = watch('status');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput('');
      return;
    }
    setValue('tags', [...tags, t], { shouldDirty: true });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t) => t !== tag),
      { shouldDirty: true },
    );
  };

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Short, descriptive title"
          autoComplete="off"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={6}
          placeholder="What's happening? Steps to reproduce, expected vs actual behaviour…"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) =>
              setValue('priority', v as IssueFormValues['priority'], { shouldDirty: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Severity</Label>
          <Select
            value={severity}
            onValueChange={(v) =>
              setValue('severity', v as IssueFormValues['severity'], { shouldDirty: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showStatus && (
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setValue('status', v as IssueFormValues['status'], { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tag-input">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
              } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                removeTag(tags[tags.length - 1]!);
              }
            }}
            placeholder="Type a tag and press Enter"
            autoComplete="off"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-sm text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-xs text-destructive">{errors.tags.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
