CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'calculator', 'chatbot', 'spin-wheel')),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  content JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content) = 'object'),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage their own content" ON public.content_items
  FOR ALL TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE INDEX content_items_owner_updated_idx ON public.content_items (owner_id, updated_at DESC);
CREATE INDEX content_items_published_quiz_slug_idx ON public.content_items (slug) WHERE is_published AND content_type = 'quiz';

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (length(trim(email)) BETWEEN 3 AND 255),
  phone TEXT CHECK (phone IS NULL OR length(trim(phone)) <= 50),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(responses) = 'object'),
  result_title TEXT CHECK (result_title IS NULL OR length(result_title) <= 160),
  score INTEGER,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view their own leads" ON public.leads
  FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));
CREATE INDEX leads_owner_created_idx ON public.leads (owner_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_published_quiz(p_slug TEXT)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', content_items.id,
    'title', content_items.title,
    'slug', content_items.slug,
    'content', content_items.content
  )
  FROM public.content_items
  WHERE content_items.slug = p_slug
    AND content_items.content_type = 'quiz'
    AND content_items.is_published
    AND length(p_slug) <= 180
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_published_quiz(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_quiz(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_lead(
  p_slug TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_responses JSONB,
  p_result_title TEXT,
  p_score INTEGER,
  p_consent BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_content_id UUID;
  v_owner_id UUID;
  v_lead_id UUID;
BEGIN
  IF p_consent IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Contact consent is required.' USING ERRCODE = '22023';
  END IF;
  IF p_full_name IS NULL OR length(trim(p_full_name)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Please enter a name up to 100 characters.' USING ERRCODE = '22023';
  END IF;
  IF p_email IS NULL OR length(trim(p_email)) NOT BETWEEN 3 AND 255 OR trim(p_email) !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.' USING ERRCODE = '22023';
  END IF;
  IF p_phone IS NOT NULL AND length(trim(p_phone)) > 50 THEN
    RAISE EXCEPTION 'Phone number must be 50 characters or fewer.' USING ERRCODE = '22023';
  END IF;
  IF p_responses IS NULL OR jsonb_typeof(p_responses) <> 'object' OR octet_length(p_responses::text) > 32768 THEN
    RAISE EXCEPTION 'Quiz responses are invalid or too large.' USING ERRCODE = '22023';
  END IF;
  IF p_result_title IS NOT NULL AND length(p_result_title) > 160 THEN
    RAISE EXCEPTION 'Result title must be 160 characters or fewer.' USING ERRCODE = '22023';
  END IF;
  IF p_score IS NOT NULL AND (p_score < 0 OR p_score > 100000) THEN
    RAISE EXCEPTION 'Quiz score is invalid.' USING ERRCODE = '22023';
  END IF;

  SELECT id, owner_id INTO v_content_id, v_owner_id
  FROM public.content_items
  WHERE slug = p_slug AND content_type = 'quiz' AND is_published
  LIMIT 1;

  IF v_content_id IS NULL THEN
    RAISE EXCEPTION 'This quiz is not available.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.leads (
    content_item_id, owner_id, full_name, email, phone, responses,
    result_title, score, consented_at
  ) VALUES (
    v_content_id, v_owner_id, trim(p_full_name), lower(trim(p_email)),
    NULLIF(trim(p_phone), ''), p_responses, p_result_title, p_score, now()
  ) RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_quiz_lead(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, INTEGER, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_lead(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, INTEGER, BOOLEAN) TO anon, authenticated;