import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Mail, User, Gavel } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  rightSlot?: React.ReactNode;
};

export const Navbar = ({ rightSlot }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={cn(
            'text-xl font-bold tracking-tight text-emerald-300',
            'hover:text-emerald-200 transition-colors'
          )}
        >
          Levich
        </Link>

        <nav className="hidden sm:flex items-center gap-2">
          <Link to="/auctions">
            <Button
              variant="ghost"
              className={cn(
                'text-muted-foreground hover:text-foreground hover:bg-emerald-500/10',
                isActive('/auctions') && 'text-emerald-200'
              )}
            >
              Auctions
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot ??
          (user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-emerald-200 hover:bg-emerald-500/10"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover/95 backdrop-blur border-border/60"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/bids')}
                    className="cursor-pointer"
                  >
                    <Gavel className="h-4 w-4 mr-2" />
                    My Bids
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="cursor-pointer text-red-400 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
                >
                  Create account
                </Button>
              </Link>
            </>
          ))}
      </div>
    </header>
  );
};
