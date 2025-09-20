-- Jetlag Planner Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    timezone TEXT DEFAULT 'UTC',
    chronotype TEXT DEFAULT 'intermediate' CHECK (chronotype IN ('morning', 'evening', 'intermediate')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    origin_timezone TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_timezone TEXT NOT NULL,
    departure_utc TIMESTAMPTZ NOT NULL,
    arrival_utc TIMESTAMPTZ NOT NULL,
    flight_duration_minutes INTEGER NOT NULL,
    layovers JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table (extended to support all plan types)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    plan_type TEXT DEFAULT 'trip' CHECK (plan_type IN ('trip', 'shift_work', 'sleep_schedule')),
    plan_id UUID, -- References trips.id, shift_work_plans.id, or sleep_schedule_plans.id
    version TEXT DEFAULT '1.0',
    raw_ai_response JSONB NOT NULL,
    normalized_schedule JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift Work Plans table
CREATE TABLE IF NOT EXISTS shift_work_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_schedule JSONB NOT NULL, -- {bedtime, waketime, duration}
    desired_schedule JSONB NOT NULL,
    shift_details JSONB NOT NULL, -- {type, work_start, work_end, work_days}
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep Schedule Plans table
CREATE TABLE IF NOT EXISTS sleep_schedule_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_schedule JSONB NOT NULL,
    desired_schedule JSONB NOT NULL,
    sleep_issues JSONB NOT NULL, -- {difficulty_falling_asleep, etc.}
    preferences JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions table for checklist tracking
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL, -- The action_id from the schedule (e.g., "a1", "a2")
    day_index INTEGER DEFAULT 0,
    local_date DATE,
    action_time_local TIME,
    action_time_utc TIMESTAMPTZ,
    type TEXT NOT NULL CHECK (type IN ('light', 'avoid_light', 'sleep', 'nap', 'meal', 'hydrate', 'melatonin', 'caffeine', 'activity', 'repeat')),
    duration_minutes INTEGER,
    details TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    remind_at_utc TIMESTAMPTZ NOT NULL,
    method TEXT DEFAULT 'in_app' CHECK (method IN ('in_app', 'calendar_export')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wearable data table (optional)
CREATE TABLE IF NOT EXISTS wearable_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_payload JSONB NOT NULL,
    source TEXT DEFAULT 'user_upload' CHECK (source IN ('user_upload', 'garmin', 'fitbit')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_trip_id ON schedules(trip_id);
CREATE INDEX IF NOT EXISTS idx_schedules_plan_type ON schedules(plan_type);
CREATE INDEX IF NOT EXISTS idx_schedules_plan_id ON schedules(plan_id);
CREATE INDEX IF NOT EXISTS idx_shift_work_plans_user_id ON shift_work_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_shift_work_plans_created_at ON shift_work_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_schedule_plans_user_id ON sleep_schedule_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_schedule_plans_created_at ON sleep_schedule_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_schedule_id ON actions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_actions_completed ON actions(completed);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at_utc);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_schedule_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own shift work plans" ON shift_work_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shift work plans" ON shift_work_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shift work plans" ON shift_work_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shift work plans" ON shift_work_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep schedule plans" ON sleep_schedule_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep schedule plans" ON sleep_schedule_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep schedule plans" ON sleep_schedule_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep schedule plans" ON sleep_schedule_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING (
    (plan_type = 'trip' AND EXISTS (SELECT 1 FROM trips WHERE trips.id = schedules.plan_id AND trips.user_id = auth.uid())) OR
    (plan_type = 'shift_work' AND EXISTS (SELECT 1 FROM shift_work_plans WHERE shift_work_plans.id = schedules.plan_id AND shift_work_plans.user_id = auth.uid())) OR
    (plan_type = 'sleep_schedule' AND EXISTS (SELECT 1 FROM sleep_schedule_plans WHERE sleep_schedule_plans.id = schedules.plan_id AND sleep_schedule_plans.user_id = auth.uid()))
);
CREATE POLICY "Users can insert own schedules" ON schedules FOR INSERT WITH CHECK (
    (plan_type = 'trip' AND EXISTS (SELECT 1 FROM trips WHERE trips.id = schedules.plan_id AND trips.user_id = auth.uid())) OR
    (plan_type = 'shift_work' AND EXISTS (SELECT 1 FROM shift_work_plans WHERE shift_work_plans.id = schedules.plan_id AND shift_work_plans.user_id = auth.uid())) OR
    (plan_type = 'sleep_schedule' AND EXISTS (SELECT 1 FROM sleep_schedule_plans WHERE sleep_schedule_plans.id = schedules.plan_id AND sleep_schedule_plans.user_id = auth.uid()))
);

CREATE POLICY "Users can view own actions" ON actions FOR SELECT USING (
    EXISTS (SELECT 1 FROM schedules 
            LEFT JOIN trips ON trips.id = schedules.plan_id AND schedules.plan_type = 'trip'
            LEFT JOIN shift_work_plans ON shift_work_plans.id = schedules.plan_id AND schedules.plan_type = 'shift_work'
            LEFT JOIN sleep_schedule_plans ON sleep_schedule_plans.id = schedules.plan_id AND schedules.plan_type = 'sleep_schedule'
            WHERE schedules.id = actions.schedule_id AND 
            (trips.user_id = auth.uid() OR shift_work_plans.user_id = auth.uid() OR sleep_schedule_plans.user_id = auth.uid()))
);
CREATE POLICY "Users can update own actions" ON actions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM schedules 
            LEFT JOIN trips ON trips.id = schedules.plan_id AND schedules.plan_type = 'trip'
            LEFT JOIN shift_work_plans ON shift_work_plans.id = schedules.plan_id AND schedules.plan_type = 'shift_work'
            LEFT JOIN sleep_schedule_plans ON sleep_schedule_plans.id = schedules.plan_id AND schedules.plan_type = 'sleep_schedule'
            WHERE schedules.id = actions.schedule_id AND 
            (trips.user_id = auth.uid() OR shift_work_plans.user_id = auth.uid() OR sleep_schedule_plans.user_id = auth.uid()))
);
CREATE POLICY "Users can insert own actions" ON actions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM schedules 
            LEFT JOIN trips ON trips.id = schedules.plan_id AND schedules.plan_type = 'trip'
            LEFT JOIN shift_work_plans ON shift_work_plans.id = schedules.plan_id AND schedules.plan_type = 'shift_work'
            LEFT JOIN sleep_schedule_plans ON sleep_schedule_plans.id = schedules.plan_id AND schedules.plan_type = 'sleep_schedule'
            WHERE schedules.id = actions.schedule_id AND 
            (trips.user_id = auth.uid() OR shift_work_plans.user_id = auth.uid() OR sleep_schedule_plans.user_id = auth.uid()))
);

CREATE POLICY "Users can view own reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wearable data" ON wearable_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wearable data" ON wearable_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wearable data" ON wearable_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wearable data" ON wearable_data FOR DELETE USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_trips(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    origin TEXT,
    destination TEXT,
    departure_utc TIMESTAMPTZ,
    arrival_utc TIMESTAMPTZ,
    flight_duration_minutes INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.origin, t.destination, t.departure_utc, t.arrival_utc, t.flight_duration_minutes, t.created_at
    FROM trips t
    WHERE t.user_id = user_uuid
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
