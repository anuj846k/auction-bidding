import { useEffect, useState } from 'react';
import type { AuctionItem } from '@/types/auction';
import { fetchItems, fetchServerTime } from '@/services/api';
import { AuctionItemCard } from '@/components/auction/AuctionItemCard';
import { formatTimeRemaining } from '@/lib/utils';
import { socket } from '@/services/socket';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoaderPinwheel } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

type UpdateBidPayload = {
  itemId: number;
  currentBid: number;
  bidderId?: number;
  auctionEndTime?: string;
  timestamp?: string;
};

type BidErrorPayload = {
  error?: string;
  message?: string;
};

type BidSuccessPayload = {
  message?: string;
  item?: unknown;
};

export const AuctionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [pendingItemIds, setPendingItemIds] = useState<number[]>([]);

  const startPending = (itemId: number) => {
    setPendingItemIds(prev =>
      prev.includes(itemId) ? prev : [...prev, itemId]
    );
  };

  const stopPending = (itemId: number) => {
    setPendingItemIds(prev => prev.filter(id => id !== itemId));
  };

  const isPending = (itemId: number) => pendingItemIds.includes(itemId);
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchItems();
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Failed to load items');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadServerTime = async () => {
      try {
        const data = await fetchServerTime();
        const clientNow = Date.now();
        const serverNow = data.timestamp;
        const timeDiff = serverNow - clientNow;

        if (!cancelled) {
          setServerOffsetMs(timeDiff);
          setNow(new Date(clientNow + timeDiff));
        }
      } catch (error) {
        console.error('Failed to fetch server time', error);
        if (!cancelled) {
          setServerOffsetMs(0);
          setNow(new Date());
        }
      }
    };
    loadServerTime();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (serverOffsetMs === null) return;
    const interval = setInterval(() => {
      setNow(new Date(Date.now() + serverOffsetMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [serverOffsetMs]);

  useEffect(() => {
    socket.connect();

    const onUpdateBid = (payload: UpdateBidPayload) => {
      setItems(prev =>
        prev.map(it =>
          it.id === payload.itemId
            ? {
                ...it,
                currentBid: payload.currentBid,
                lastBidderId: payload.bidderId,
              }
            : it
        )
      );
      stopPending(payload.itemId);
    };

    const onBidError = (payload: BidErrorPayload) => {
      console.error('BID_ERROR', payload);
      toast.error(payload?.error ?? 'Bid failed', {
        description: payload?.message,
      });

      setPendingItemIds([]);
      if (payload?.error === 'Authentication required') {
        navigate('/login', { replace: true });
      }
    };

    const onBidSuccess = (payload: BidSuccessPayload) => {
      toast.success('Bid placed', {
        description: payload?.message ?? 'Your bid is now live.',
      });
    };
    socket.on('UPDATE_BID', onUpdateBid);
    socket.on('BID_ERROR', onBidError);
    socket.on('BID_SUCCESS', onBidSuccess);

    return () => {
      socket.off('UPDATE_BID', onUpdateBid);
      socket.off('BID_ERROR', onBidError);
      socket.off('BID_SUCCESS', onBidSuccess);
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col">
      <main className="flex-1 px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center  ">
            <LoaderPinwheel className="animate-spin text-emerald-300" />
            <span className="ml-2">Loading items...</span>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <AuctionItemCard
                key={item.id}
                item={item}
                isWinning={item.lastBidderId === user?.id}
                timeRemainingLabel={formatTimeRemaining(
                  item.auctionEndTime,
                  now
                )}
                disabled={isPending(item.id)}
                onBid={() => {
                  if (isPending(item.id)) return;
                  const nextAmount = item.currentBid + 10;
                  startPending(item.id);
                  socket.emit('BID_PLACED', {
                    itemId: item.id,
                    amount: nextAmount,
                  });
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
