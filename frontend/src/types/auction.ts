export type AuctionItem = {
  id: number;
  title: string;
  startingPrice: number;
  currentBid: number;
  auctionEndTime: string;
  lastBidderId?: number;
};

export type ServerTimeResponse = {
  serverTime: string;
  timestamp: number;
};

export type UserBid = {
  id: number;
  amount: number;
  createdAt: string;
  item: {
    id: number;
    title: string;
    currentBid: number;
    startingPrice: number;
    auctionEndTime: string;
  };
};

export type UserBidsResponse = {
  bids: UserBid[];
  count: number;
};
