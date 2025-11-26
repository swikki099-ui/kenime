-- KENIME Platform Database Schema
-- This file contains the complete database schema for the KENIME static site hosting platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_sites INTEGER DEFAULT 10,
  daily_deploy_limit INTEGER DEFAULT 50,
  max_upload_size_mb INTEGER DEFAULT 100
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  storage_bytes BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  last_deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  file_count INTEGER DEFAULT 0,
  size_bytes BIGINT DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  preview_id VARCHAR(50),
  error_message TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_path VARCHAR(500) NOT NULL,
  views BIGINT DEFAULT 1,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id, page_path, date)
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL,
  action_count INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type)
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_is_published ON sites(is_published);
CREATE INDEX IF NOT EXISTS idx_deployments_site_id ON deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_site_id ON analytics(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Sites policies
CREATE POLICY "Users can view their own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" ON sites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sites" ON sites
  FOR ALL USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Deployments policies
CREATE POLICY "Users can view their own deployments" ON deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deployments" ON deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view analytics for their sites" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sites WHERE sites.id = analytics.site_id AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics can be inserted by anyone" ON analytics
  FOR INSERT WITH CHECK (true);

-- Rate limits policies
CREATE POLICY "Users can view their own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Admin logs policies
CREATE POLICY "Admins can view admin logs" ON admin_logs
  FOR SELECT USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment analytics views
CREATE OR REPLACE FUNCTION increment_analytics_view(
  p_site_id UUID,
  p_page_path VARCHAR,
  p_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics (site_id, page_path, views, date)
  VALUES (p_site_id, p_page_path, 1, p_date)
  ON CONFLICT (site_id, page_path, date)
  DO UPDATE SET views = analytics.views + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type VARCHAR,
  p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT action_count, reset_at INTO current_count, reset_time
  FROM rate_limits
  WHERE user_id = p_user_id AND action_type = p_action_type;

  IF current_count IS NULL THEN
    INSERT INTO rate_limits (user_id, action_type, action_count, reset_at)
    VALUES (p_user_id, p_action_type, 1, NOW() + INTERVAL '1 day');
    RETURN TRUE;
  END IF;

  IF reset_time < NOW() THEN
    UPDATE rate_limits
    SET action_count = 1, reset_at = NOW() + INTERVAL '1 day'
    WHERE user_id = p_user_id AND action_type = p_action_type;
    RETURN TRUE;
  END IF;

  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE rate_limits
  SET action_count = action_count + 1
  WHERE user_id = p_user_id AND action_type = p_action_type;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
