import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserBids } from '@/services/api';
import type { UserBid } from '@/types/auction';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoaderPinwheel } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import { useAuth } from '@/auth/AuthContext';

export const MyBidsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadBids = async () => {
      try {
        setLoading(true);
        const data = await fetchUserBids();
        if (!cancelled) {
          setBids(data.bids);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Failed to load bids');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBids();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isWinning = (bid: UserBid) => {
    return bid.item.currentBid === bid.amount;
  };

  const isAuctionEnded = (endTime: string) => {
    return new Date(endTime) <= new Date();
  };

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col">
      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Bids</h1>
          <p className="text-muted-foreground">
            View all your bidding activity across active auctions
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoaderPinwheel className="animate-spin text-emerald-300" />
            <span className="ml-2">Loading your bids...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {bids.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't placed any bids yet.
                </p>
                <button
                  onClick={() => navigate('/auctions')}
                  className="text-emerald-300 hover:text-emerald-200 underline"
                >
                  Browse auctions
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bids.map(bid => (
                  <Card
                    key={bid.id}
                    className="bg-card/70 border-border/60 shadow-lg shadow-black/40 hover:border-primary/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/auctions`)}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {bid.item.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Bid placed{' '}
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {isWinning(bid) &&
                        !isAuctionEnded(bid.item.auctionEndTime) && (
                          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40">
                            Winning
                          </Badge>
                        )}
                      {!isWinning(bid) &&
                        !isAuctionEnded(bid.item.auctionEndTime) && (
                          <Badge className="bg-red-500/15 text-red-300 border-red-500/40">
                            Outbid
                          </Badge>
                        )}
                      {isAuctionEnded(bid.item.auctionEndTime) && (
                        <Badge className="bg-muted text-muted-foreground">
                          Ended
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground mb-1">
                          Your Bid
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-emerald-300">
                          ${bid.amount.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-muted-foreground mb-1">
                          Current Bid
                        </p>
                        <p className="text-lg font-semibold">
                          ${bid.item.currentBid.toLocaleString()}
                        </p>
                      </div>

                      {!isAuctionEnded(bid.item.auctionEndTime) && (
                        <div>
                          <p className="text-xs uppercase text-muted-foreground mb-1">
                            Time Remaining
                          </p>
                          <p className="text-sm font-mono">
                            {formatTimeRemaining(bid.item.auctionEndTime, now)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
