-- $0.55 grocery test item for live checkout / Apple Pay (tax-exempt category).
-- Run in Supabase → SQL Editor → Run once.

-- If you already inserted the $1 version, run this instead:
-- update public.products set name = 'Apple Pay test item ($0.55)', price = 0.55
-- where name ilike 'Apple Pay test item%';

insert into public.products (name, description, price, category, image_url, in_stock)
values (
  'Apple Pay test item ($0.55)',
  'Internal test product for payment verification. Not for resale.',
  0.55,
  'Snack',
  null,
  true
);

-- Show the row (most recent matching name)
select id, name, price, category, in_stock, created_at
from public.products
where name = 'Apple Pay test item ($0.55)'
order by created_at desc
limit 1;
