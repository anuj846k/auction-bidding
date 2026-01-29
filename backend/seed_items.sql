-- SQL script to insert auction items
-- Auction end times are set to at least 48 hours from now
-- Run this script in your PostgreSQL database

INSERT INTO items (title, starting_price, current_bid, auction_end_time, created_at, updated_at)
VALUES
  -- Electronics
  ('MacBook Pro 14" M3', 1999.00, 1999.00, NOW() + INTERVAL '48 hours', NOW(), NOW()),
  ('iPhone 15 Pro Max 256GB', 1199.00, 1199.00, NOW() + INTERVAL '50 hours', NOW(), NOW()),
  ('Sony WH-1000XM5 Headphones', 399.00, 399.00, NOW() + INTERVAL '52 hours', NOW(), NOW()),
  ('Samsung 55" QLED 4K TV', 1299.00, 1299.00, NOW() + INTERVAL '54 hours', NOW(), NOW()),
  ('iPad Pro 12.9" M2', 1099.00, 1099.00, NOW() + INTERVAL '56 hours', NOW(), NOW()),
  
  -- Collectibles & Luxury
  ('Rolex Submariner Watch', 8999.00, 8999.00, NOW() + INTERVAL '58 hours', NOW(), NOW()),
  ('Vintage Gibson Les Paul Guitar', 3499.00, 3499.00, NOW() + INTERVAL '60 hours', NOW(), NOW()),
  ('Limited Edition Air Jordan 1', 599.00, 599.00, NOW() + INTERVAL '62 hours', NOW(), NOW()),
  
  -- Vehicles
  ('2020 Tesla Model 3', 29999.00, 29999.00, NOW() + INTERVAL '64 hours', NOW(), NOW()),
  ('Vintage 1965 Mustang', 45999.00, 45999.00, NOW() + INTERVAL '66 hours', NOW(), NOW()),
  
  -- Art & Collectibles
  ('Original Oil Painting - Abstract', 2499.00, 2499.00, NOW() + INTERVAL '68 hours', NOW(), NOW()),
  ('Rare First Edition Book Collection', 1299.00, 1299.00, NOW() + INTERVAL '70 hours', NOW(), NOW()),
  
  -- Tech & Gadgets
  ('DJI Mavic 3 Pro Drone', 2199.00, 2199.00, NOW() + INTERVAL '72 hours', NOW(), NOW()),
  ('Nintendo Switch OLED + Games', 449.00, 449.00, NOW() + INTERVAL '74 hours', NOW(), NOW());

-- Verify the insertions
SELECT 
  id,
  title,
  starting_price,
  current_bid,
  auction_end_time,
  created_at
FROM items
ORDER BY auction_end_time ASC;
