-- ================================================================
-- VastuChitra ArchViz — REFINED SCHEMA
-- Key improvements: Foreign Keys, RLS Hardening, and Cleanup
-- ================================================================

-- 1. Hardening Site Settings (Remove dev-only permissive access)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename='site_settings' AND policyname='Public read settings'
  ) THEN
    CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
  END IF;

  -- Drop permissive anon policies if they exist (cleanup from previous iterations)
  DROP POLICY IF EXISTS "Admin write settings" ON site_settings;
  DROP POLICY IF EXISTS "Admin update settings" ON site_settings;
END $$;

-- Recommendation: Use the Supabase dashboard to allow specific user roles, 
-- or use the following for strictly authenticated admin access:
CREATE POLICY "Admin write settings" ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');


-- 2. Visitors Table Refinement (Data Integrity)
-- Convert project_id to UUID and add Foreign Key
ALTER TABLE visitors 
  ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

ALTER TABLE visitors
  ADD CONSTRAINT fk_visitors_projects 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE SET NULL;


-- 3. Cleanup: Remove old Debug Presets if they are no longer used
-- DELETE FROM site_settings WHERE key IN ('debug_layout', 'debug_presets');


-- 4. Projects RLS Refinement
-- Ensure anon can only READ, keep write access for authenticated admins only
DROP POLICY IF EXISTS "Admin insert" ON projects;
DROP POLICY IF EXISTS "Admin update" ON projects;
DROP POLICY IF EXISTS "Admin delete" ON projects;

CREATE POLICY "Admin insert" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete" ON projects FOR DELETE TO authenticated USING (true);
