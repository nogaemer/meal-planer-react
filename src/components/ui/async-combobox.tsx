import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {Check, ChevronsUpDown} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { httpClient } from '@/services/httpClient';

export interface AsyncComboboxProps<T> {
  value?: T;
  onChange: (value?: T) => void;
  fetchUrl: string;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  renderOption?: (item: T, isSelected: boolean) => React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  limit?: number;
  emptyMessage?: string;
}

export function AsyncCombobox<T>({
  value,
  onChange,
  fetchUrl,
  getLabel,
  getValue,
  renderOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  limit = 10,
  emptyMessage = "No item found.",
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      (async () => {
        setLoading(true);
        let fetched: T[];
        try {
          const q = encodeURIComponent(query || '');
          const separator = fetchUrl.includes('?') ? '&' : '?';
          const url = `${fetchUrl}${separator}limit=${limit}&query=${q}`;

          const res = await httpClient.get<T[]>(url);
          fetched = Array.isArray(res) ? res : [];
        } catch (error) {
          console.error('AsyncCombobox fetch failed', error);
          fetched = [];
        }

        if (mounted) {
          setItems(fetched);
          setLoading(false);
        }
      })();
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query, limit, fetchUrl]);

  // focus the input when the popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal ",
            !value && "text-muted-foreground"
          )}
        >
            <p className="truncate">{value ? getLabel(value) : placeholder}</p>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={(v) => setQuery(v)}
            className="h-9"
          />
          <CommandList>
            {loading && <CommandEmpty>Loading…</CommandEmpty>}
            {!loading && items.length === 0 && <CommandEmpty>{emptyMessage}</CommandEmpty>}

            <CommandGroup>
              {items.map((item) => {
                const itemValue = getValue(item);
                const isSelected = value ? getValue(value) === itemValue : false;

                return (
                  <CommandItem
                    key={itemValue}
                    value={itemValue}
                    onSelect={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    {renderOption ? (
                      renderOption(item, isSelected)
                    ) : (
                      <>
                        {getLabel(item)}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

