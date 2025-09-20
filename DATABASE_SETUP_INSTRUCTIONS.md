# Database Setup Instructions

## Issue
The shift work and sleep schedule plans are not working because the required database tables don't exist yet.

## Solution
You need to run the database schema in your Supabase SQL editor.

## Steps

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the "SQL Editor" tab

### 2. Run the Schema
- Copy the entire contents of `backend/schema.sql`
- Paste it into the SQL editor
- Click "Run" to execute the schema

### 3. Verify Tables Created
After running the schema, you should see these new tables:
- `shift_work_plans`
- `sleep_schedule_plans`
- Updated `schedules` table with `plan_type` and `plan_id` columns

### 4. Test the Functionality
Once the tables are created, the shift work and sleep schedule plans will work just like trip plans:
- Create plans through the frontend
- View them in "My Schedules"
- Edit them using the "Edit Plan" button
- Get AI-generated schedules

## What's Already Implemented

✅ **Backend API Endpoints**
- `/api/v1/shift-work/generate-plan` - Create shift work plans
- `/api/v1/sleep-schedule/generate-plan` - Create sleep schedule plans
- `/api/v1/plans/all` - Get all plans (trips, shift work, sleep schedule)

✅ **Gemini AI Integration**
- Real AI-generated schedules for shift work plans
- Real AI-generated schedules for sleep schedule plans
- Fallback to placeholder schedules if AI fails

✅ **Frontend Integration**
- Shift work and sleep schedule creation forms
- Unified "My Schedules" page showing all plan types
- Edit functionality for all plan types
- Notification system for all plan types

✅ **Database Schema**
- Complete schema with all required tables
- Proper foreign key relationships
- Row Level Security (RLS) policies
- Indexes for performance

## Current Status

- **Trip Plans**: ✅ Working (tables exist)
- **Shift Work Plans**: ⏳ Waiting for database tables
- **Sleep Schedule Plans**: ⏳ Waiting for database tables

Once you run the schema, all three plan types will work identically!
