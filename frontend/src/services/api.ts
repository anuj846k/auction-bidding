import type {
  AuctionItem,
  ServerTimeResponse,
  UserBidsResponse,
} from '@/types/auction';
import type { AuthUser } from '@/types/user';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type ApiErrorResponse = {
  error: string;
  message?: string;
};

type AuthSuccessResponse = {
  message: string;
  user: AuthUser;
};

export const fetchItems = async (): Promise<AuctionItem[]> => {
  const res = await fetch(`${API_BASE_URL}/items`);

  if (!res.ok) {
    throw new Error('Failed to fetch items');
  }

  const data = (await res.json()) as Array<{
    id: number;
    title: string;
    startingPrice: string | number;
    currentBid: string | number;
    auctionEndTime: string;
    lastBidderId?: number | null;
  }>;

  return data.map(item => ({
    id: item.id,
    title: item.title,
    startingPrice: Number(item.startingPrice),
    currentBid: Number(item.currentBid),
    auctionEndTime: item.auctionEndTime,
    lastBidderId: item.lastBidderId ?? undefined,
  }));
};

export const fetchServerTime = async (): Promise<ServerTimeResponse> => {
  const res = await fetch(`${API_BASE_URL}/items/server-time`);
  if (!res.ok) {
    throw new Error('Failed to fetch server time');
  }
  return (await res.json()) as ServerTimeResponse;
};

export const getMe = async (): Promise<{ user: AuthUser }> => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
  });

  const data = (await res.json()) as ApiErrorResponse | { user: AuthUser };
  if (!res.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(error?.error ?? 'Unauthorized');
  }
  return data as { user: AuthUser };
};

export const signUp = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as ApiErrorResponse | AuthSuccessResponse;
  if (!res.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(error?.error ?? 'Signup failed');
  }
  return data as AuthSuccessResponse;
};

export const signIn = async (payload: {
  email: string;
  password: string;
}): Promise<AuthSuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as ApiErrorResponse | AuthSuccessResponse;
  if (!res.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(error?.error ?? 'Signin failed');
  }
  return data as AuthSuccessResponse;
};

export const signOut = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = (await res.json()) as ApiErrorResponse | { message: string };
  if (!res.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(error?.error ?? 'Signout failed');
  }
  return data as { message: string };
};

export const fetchUserBids = async (): Promise<UserBidsResponse> => {
  const res = await fetch(`${API_BASE_URL}/bids/my`, {
    credentials: 'include',
  });

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(error?.error ?? 'Failed to fetch bids');
  }
  return data as UserBidsResponse;
};
