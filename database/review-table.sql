-- Create review table
CREATE TABLE IF NOT EXISTS public.review (
  review_id SERIAL PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE
);