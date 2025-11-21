-- Database Schema for Study Better AI
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  neurodivergence_type TEXT CHECK (neurodivergence_type IN ('none', 'adhd', 'dyslexia', 'autism', 'audhd')),
  learning_preferences JSONB DEFAULT '{}'::jsonb,
  academic_level TEXT CHECK (academic_level IN ('high_school', 'undergraduate', 'graduate', 'professional', 'other')),
  subject_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create saved_responses table
CREATE TABLE IF NOT EXISTS saved_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('summarize', 'explain')),
  original_filename TEXT,
  instructions_used TEXT,
  neurodivergence_type_used TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('summary', 'download')),
  action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  count INTEGER DEFAULT 1,
  UNIQUE(user_id, action_type)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_responses_user_id ON saved_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_responses_created_at ON saved_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_type ON usage_tracking(action_type);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_responses_updated_at
  BEFORE UPDATE ON saved_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create function to check usage limit (24-hour rolling window)
CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID, p_action_type TEXT)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_limit INTEGER;
  v_hours_elapsed NUMERIC;
BEGIN
  -- Set limits based on action type
  IF p_action_type = 'summary' THEN
    v_limit := 3;
  ELSIF p_action_type = 'download' THEN
    v_limit := 1;
  ELSE
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'error', 'Invalid action type');
  END IF;

  -- Get or create usage tracking record
  SELECT * INTO v_record
  FROM usage_tracking
  WHERE user_id = p_user_id AND action_type = p_action_type;

  -- If no record exists, allow action
  IF v_record IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', v_limit,
      'first_action', NULL
    );
  END IF;

  -- Calculate hours since first action
  v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_record.first_action_timestamp)) / 3600;

  -- If 24 hours have passed, reset
  IF v_hours_elapsed >= 24 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', v_limit,
      'first_action', NULL
    );
  END IF;

  -- Check if limit reached
  IF v_record.count >= v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'first_action', v_record.first_action_timestamp,
      'hours_until_reset', 24 - v_hours_elapsed
    );
  END IF;

  -- Return remaining count
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_limit - v_record.count,
    'first_action', v_record.first_action_timestamp,
    'count', v_record.count
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_action_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_record RECORD;
  v_hours_elapsed NUMERIC;
BEGIN
  -- Get existing record
  SELECT * INTO v_record
  FROM usage_tracking
  WHERE user_id = p_user_id AND action_type = p_action_type;

  -- If no record exists, create one
  IF v_record IS NULL THEN
    INSERT INTO usage_tracking (user_id, action_type, first_action_timestamp, count)
    VALUES (p_user_id, p_action_type, NOW(), 1);
    RETURN;
  END IF;

  -- Calculate hours since first action
  v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_record.first_action_timestamp)) / 3600;

  -- If 24 hours have passed, reset
  IF v_hours_elapsed >= 24 THEN
    UPDATE usage_tracking
    SET first_action_timestamp = NOW(),
        action_timestamp = NOW(),
        count = 1
    WHERE user_id = p_user_id AND action_type = p_action_type;
  ELSE
    -- Increment count
    UPDATE usage_tracking
    SET action_timestamp = NOW(),
        count = count + 1
    WHERE user_id = p_user_id AND action_type = p_action_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 11. Create RLS Policies for saved_responses
CREATE POLICY "Users can view their own responses"
  ON saved_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
  ON saved_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON saved_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON saved_responses FOR DELETE
  USING (auth.uid() = user_id);

-- 12. Create RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);









