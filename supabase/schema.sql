-- Run this once in the Supabase SQL editor (safe to re-run).

create table if not exists public.player_saves (
    user_id uuid not null references auth.users (id) on delete cascade,
    slot smallint not null default 1 check (slot between 1 and 3),
    save_data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    primary key (user_id, slot)
);

-- Upgrade path for the earlier single-save table.
alter table public.player_saves add column if not exists slot smallint not null default 1;
alter table public.player_saves drop constraint if exists player_saves_pkey;
alter table public.player_saves add primary key (user_id, slot);

alter table public.player_saves enable row level security;

drop policy if exists "Players can read their own save" on public.player_saves;
create policy "Players can read their own save"
    on public.player_saves
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Players can create their own save" on public.player_saves;
create policy "Players can create their own save"
    on public.player_saves
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own save" on public.player_saves;
create policy "Players can update their own save"
    on public.player_saves
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete their own save" on public.player_saves;
create policy "Players can delete their own save"
    on public.player_saves
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Lets a signed-in player delete their own account (and, via cascade, their saves).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'Not signed in';
    end if;

    delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
