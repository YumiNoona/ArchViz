-- ================================================================
-- IPDS ArchViz — COMPLETE DATABASE RESET
-- ⚠️ WARNING: THIS WILL DELETE ALL EXISTING DATA AND IMAGES ⚠️
-- ================================================================

-- 1. RESET
DROP TABLE IF EXISTS project_auth CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 2. PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  image_url_dark TEXT,
  image_url_light TEXT,
  stream_url TEXT,
  type TEXT DEFAULT 'Residential',
  location TEXT,
  year TEXT,
  access_type TEXT DEFAULT 'public',
  access_password TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'discarded')) DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  narrative_sections JSONB DEFAULT '[]'::jsonb,
  gallery_updates JSONB DEFAULT '[]'::jsonb,
  story TEXT,
  has_live_updates BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin manage projects" ON projects FOR ALL USING (auth.role() = 'anon');

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);

-- 3. VISITORS
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT,
  project TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public write visitors" ON visitors FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Admin read visitors" ON visitors FOR SELECT USING (auth.role() = 'anon');

CREATE INDEX idx_visitors_project_id ON visitors(project_id);

-- 4. ENQUIRIES
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public write enquiries" ON enquiries FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Admin read enquiries" ON enquiries FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Admin delete enquiries" ON enquiries FOR DELETE USING (auth.role() = 'anon');

-- 5. PROJECT AUTH
CREATE TABLE project_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_auth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write auth" ON project_auth FOR ALL USING (auth.role() = 'anon');

-- 6. STORAGE
-- Recreate buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-updates', 'site-updates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access project-images read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access project-images insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Access project-images update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access project-images delete" ON storage.objects;
CREATE POLICY "Public Access project-images read" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Public Access project-images insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'anon');
CREATE POLICY "Public Access project-images update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND auth.role() = 'anon');
CREATE POLICY "Public Access project-images delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND auth.role() = 'anon');

DROP POLICY IF EXISTS "Public Access site-updates read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access site-updates insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Access site-updates update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access site-updates delete" ON storage.objects;
CREATE POLICY "Public Access site-updates read" ON storage.objects FOR SELECT USING (bucket_id = 'site-updates');
CREATE POLICY "Public Access site-updates insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-updates' AND auth.role() = 'anon');
CREATE POLICY "Public Access site-updates update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-updates' AND auth.role() = 'anon');
CREATE POLICY "Public Access site-updates delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-updates' AND auth.role() = 'anon');