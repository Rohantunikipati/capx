import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, StoreIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePortfolioStore } from "@/Hooks/use-fetch-data";
import { api } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { useModal } from "@/Hooks/use-modal-hook";

const fetchPortfolioData = async () => {
  const res = await api.portfolio.$get("/");
  const data = await res.json();
  console.log(data);
  return data.portfolios || []; // Ensure the response is extracted correctly
};

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const navigate = useNavigate();

  const onOpen = useModal((state)=>state.onOpen)

  const { data: portfolios, setData } = usePortfolioStore();

  // Load portfolio data on component mount
  React.useEffect(() => {
    const loadPortfolioData = async () => {
      const portfolioData = await fetchPortfolioData();
      setData(portfolioData);
    };
    loadPortfolioData();
  }, [setData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? portfolios.find(portfolio => portfolio.name === value)?.name
            : "Select a portfolio"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search portfolio..." />
          <CommandList>
            <CommandEmpty>No Portfolio found.</CommandEmpty>
            <CommandGroup>
              {portfolios.map(portfolio => (
                <CommandItem
                  key={portfolio.id}
                  value={portfolio.name}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div
                    className="flex w-full items-center justify-between cursor-pointer"
                    onClick={() => {
                      navigate({ to: `/portfolio/${portfolio.id}` });
                    }}
                  >
                    <StoreIcon className="size-4 mr-2" />
                    {portfolio.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === portfolio.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
              <CommandItem onSelect={onOpen} > <PlusCircle className="size-4" /> Create New Portfolio </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
