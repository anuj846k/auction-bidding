import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import type { AuctionItem } from '@/types/auction';

type Props = {
  item: AuctionItem;
  isWinning: boolean;
  onBid: () => void;
  timeRemainingLabel: string;
  disabled?: boolean;
};

export const AuctionItemCard = ({
  item,
  isWinning,
  onBid,
  timeRemainingLabel,
  disabled,
}: Props) => {
  return (
    <Card className="bg-card/70 border-border/60 shadow-lg shadow-black/40 hover:border-primary/60 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
          <CardDescription className="text-xs mt-1">
            Auction ends soon — place your best bid.
          </CardDescription>
        </div>

        <div className="flex flex-col items-end gap-1">
          {isWinning ? (
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40">
              Winning
            </Badge>
          ) : (
            <Badge className="bg-red-500/15 text-red-300 border-red-500/40">
              Outbid
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Item #{item.id}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground mb-1">
            Current Bid
          </p>
          <p className="text-2xl font-bold tracking-tight text-emerald-300">
            ${item.currentBid.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground mb-1">
            Time Remaining
          </p>
          <p className="text-sm font-mono">{timeRemainingLabel}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full bg-primary text-primary-foreground"
          onClick={onBid}
          disabled={disabled}
        >
          {disabled ? 'Placing bid...' : 'Bid +$10'}
        </Button>
      </CardFooter>
    </Card>
  );
};
