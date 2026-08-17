CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  default_tone TEXT NOT NULL DEFAULT 'Professional',
  default_depth TEXT NOT NULL DEFAULT 'Standard',
  default_length TEXT NOT NULL DEFAULT 'Medium',
  language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'Professional',
  length TEXT NOT NULL DEFAULT 'Medium',
  purpose TEXT NOT NULL DEFAULT '',
  recipient TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  call_to_action TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emails TO authenticated;
GRANT ALL ON public.emails TO service_role;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own emails" ON public.emails FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  meeting_date DATE,
  participants TEXT NOT NULL DEFAULT '',
  transcript TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  open_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meetings" ON public.meetings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question TEXT NOT NULL DEFAULT '',
  depth TEXT NOT NULL DEFAULT 'Standard',
  format TEXT NOT NULL DEFAULT 'Research Brief',
  summary TEXT NOT NULL DEFAULT '',
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis TEXT NOT NULL DEFAULT '',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research TO authenticated;
GRANT ALL ON public.research TO service_role;
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own research" ON public.research FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER research_updated_at BEFORE UPDATE ON public.research FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();