-- $1 grocery test item for live checkout (tax-exempt Snack category).
-- Run in Supabase → SQL Editor → Run once.

insert into public.products (name, description, price, category, image_url, in_stock)
values (
  'Checkout test item ($1)',
  'Internal test product for live payment verification. Not for resale.',
  1,
  'Snack',
  null,
  true
);

select id, name, price, category, in_stock, created_at
from public.products
where name = 'Checkout test item ($1)'
order by created_at desc
limit 1;
