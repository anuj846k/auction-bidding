import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingPage = () => {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 bg-linear-to-br from-black via-emerald-950/60 to-black">
        <div className="text-center space-y-6 max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tight">
            Welcome to Levich Live Auction
          </h2>
          <p className="text-lg text-muted-foreground">
            Compete in real-time auctions where every second counts. Place your
            bids and watch as prices update instantly across all connected
            clients.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auctions">
              <Button
                size="lg"
                className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-300/60"
              >
                View Auctions
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
