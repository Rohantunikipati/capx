import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { StockEnum } from "@/lib/centralstrocks";
import { StockChart } from "./Chart";

export function SellSheet({
  id,
  avl,
  portfolioId,
}: {
  id: number;
  avl: number;
  portfolioId: number;
}) {
  return (
    <Sheet>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border border-green-300 bg-green-50 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:hover:bg-green-900"
      >
        <SheetTrigger>Sell</SheetTrigger>
      </Button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold tracking-tight">
            {StockEnum[id].symbol}{" "}
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Are you absolutely sure about selling this stock.This action cannot
            be undone. This will permanently delete your stock and remove your
            data from our servers.
          </SheetDescription>
          <SheetContent>
            <StockChart portfolioId={portfolioId} id={id} avl={avl} />
          </SheetContent>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
