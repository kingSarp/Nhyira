-- Nhyira database. Run with `npm run db:setup` (or paste into Supabase → SQL Editor).
-- Safe to run more than once: it only creates what's missing and never deletes data.

create table if not exists invitations (
  token          text primary key,
  household_name text not null check (length(household_name) between 1 and 120),
  greeting       text,
  phone          text,
  -- Normalised number (233…). One household per phone.
  phone_key      text unique,
  side           text,
  -- Seats per event: {"wedding": 2, "reception": 2}
  seats          jsonb not null default '{}'::jsonb,
  -- {"wedding": {"attending": true, "names": ["Kwame", "Ama"]}}; null until they reply
  responses      jsonb,
  note           text,
  responded_at   timestamptz,
  source         text not null default 'list' check (source in ('list', 'request', 'open')),
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

create table if not exists join_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  phone_key   text not null,
  party_size  int not null check (party_size between 1 and 10),
  side        text,
  message     text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  -- The invitation made when approved.
  token       text references invitations (token) on delete set null
);

-- A phone can have only one request waiting.
create unique index if not exists join_requests_one_pending_per_phone
  on join_requests (phone_key) where status = 'pending';

create table if not exists signup_links (
  kind          text primary key check (kind in ('request', 'open')),
  code          text not null unique,
  enabled       boolean not null default false,
  events        text[] not null default array['engagement', 'wedding', 'reception'],
  signup_limit  int check (signup_limit > 0),
  -- Old codes stay here so their pages say "no longer taking sign-ups" for good.
  retired_codes text[] not null default '{}'
);

-- Both shared links start switched off.
insert into signup_links (kind, code) values
  ('request', 'ask-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  ('open', 'join-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
on conflict (kind) do nothing;

-- Arrival at the entrance (/checkin). Added after launch, so added here too.
alter table invitations add column if not exists checked_in_at timestamptz;
alter table invitations add column if not exists checked_in_by text;

-- What organisers edit on /admin/details (names, dates, venues, times, dress
-- colours, contact, RSVP deadline, story photo links). One row; the shape is
-- validated in code (lib/wedding.ts). No row yet means the code defaults.
create table if not exists wedding_details (
  id         smallint primary key default 1 check (id = 1),
  details    jsonb not null,
  updated_at timestamptz not null default now()
);

-- The site reads and writes these tables only from its server, as the database
-- owner. Row level security with no policies means the public API keys
-- (publishable / anon) can't see or change anything.
alter table invitations enable row level security;
alter table join_requests enable row level security;
alter table signup_links enable row level security;
alter table wedding_details enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on invitations, join_requests, signup_links, wedding_details from anon, authenticated;
  end if;
end $$;

-- Photos organisers upload (story photos), in Supabase Storage. Anyone can
-- view them (they're on the invitations); only signed-in organisers can add or
-- remove them. Organisers are the only accounts, because sign-ups are off
-- (see lib/auth.ts). The site re-encodes every upload as a JPEG under 4 MB.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('wedding-photos', 'wedding-photos', true, 4194304, array['image/jpeg'])
    on conflict (id) do update
      set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

    drop policy if exists "Organisers read wedding photos" on storage.objects;
    drop policy if exists "Organisers add wedding photos" on storage.objects;
    drop policy if exists "Organisers remove wedding photos" on storage.objects;
    create policy "Organisers read wedding photos" on storage.objects
      for select to authenticated using (bucket_id = 'wedding-photos');
    create policy "Organisers add wedding photos" on storage.objects
      for insert to authenticated with check (bucket_id = 'wedding-photos');
    create policy "Organisers remove wedding photos" on storage.objects
      for delete to authenticated using (bucket_id = 'wedding-photos');
  end if;
end $$;
