-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null, -- Storing product ID or Name
  product_name text not null,
  price numeric not null,
  status text default 'clicked_whatsapp',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;

-- Policy: Users can view their own orders
create policy "Users can view own orders"
  on orders for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own orders
create policy "Users can insert own orders"
  on orders for insert
  with check ( auth.uid() = user_id );

-- Policy: Admin can view all orders (Example: if admin email matches)
-- For now, allowing all authenticated users to insert, but only specific reads if needed.
-- But since we are using Supabase Dashboard for admin, RLS mainly protects user data.
