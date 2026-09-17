ALTER TABLE public.staff_time_entries
ADD CONSTRAINT staff_time_entries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;