"use client";

import { Check, ChevronsUpDown, Clock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";

export const title = "Recent vs All Items";
export type SelectorOptionType = { value: string; label: string; }
// const recentProjects = [
//   { value: "project-a", label: "Project Alpha" },
//   { value: "project-b", label: "Project Beta" },
// ];

// const allProjects = [
//   { value: "project-a", label: "Project Alpha" },
//   { value: "project-b", label: "Project Beta" },
//   { value: "project-c", label: "Project Charlie" },
//   { value: "project-d", label: "Project Delta" },
//   { value: "project-e", label: "Project Echo" },
// ];

const CitySelector = ({
  data,
  buttonLabel,
  onChange
}: {
  data: SelectorOptionType[];
  buttonLabel: string
  onChange: (value: string) => void
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if(!data) return null

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="mx-w-sm h-11 justify-between"
          role="combobox"
          variant="outline"
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : buttonLabel}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-0">
        <Command dir="rtl" >
          <CommandInput className="h-8!" dir="rtl" placeholder="جستجو ..." />
          <CommandList>
            <CommandEmpty>گزینه ای یافت نشد.</CommandEmpty>
            {/* <CommandGroup heading="Recent"> */}
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    onChange(currentValue)
                  }}
                  value={item.value}
                  keywords={[item.label]}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {/* <Clock className="mr-2 size-3 opacity-50" /> */}
                  {item.label}
                </CommandItem>
              ))}
            {/* </CommandGroup> */}
            {/* <CommandSeparator />
            <CommandGroup heading="All Projects">
              {allProjects
                .filter(
                  (item) =>
                    !recentProjects.find(
                      (recent) => recent.value === item.value,
                    ),
                )
                .map((item) => (
                  <CommandItem
                    key={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    value={item.value}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
            </CommandGroup> */}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CitySelector;
