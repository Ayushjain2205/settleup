-- Only the full save_expense signature survives. The older 11- and 12-arg
-- overloads made PostgREST calls ambiguous ("could not choose the best
-- candidate") for any client not sending p_items. Trailing defaults keep
-- old callers working against the single remaining function.
drop function if exists public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid);
drop function if exists public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid, jsonb);
