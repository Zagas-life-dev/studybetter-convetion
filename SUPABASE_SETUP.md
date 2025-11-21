# Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql` into the SQL Editor
4. Run the SQL script to create all tables, functions, and policies

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings:
- Project URL: Settings > API > Project URL
- Anon Key: Settings > API > anon public key
- Service Role Key: Settings > API > service_role key (keep this secret!)

## Row Level Security (RLS)

The schema.sql file includes RLS policies that ensure:
- Users can only access their own profile data
- Users can only view/edit/delete their own saved responses
- Users can only view their own usage tracking data

## Database Functions

The setup includes two important functions:

1. `check_usage_limit(user_id, action_type)` - Checks if a user can perform an action (summary or download) based on 24-hour rolling window
2. `increment_usage(user_id, action_type)` - Increments usage count and handles 24-hour rolling window reset logic

## Testing

After setup:
1. Sign up a new user
2. Complete onboarding
3. Process a PDF (should work and track usage)
4. Check dashboard for saved responses
5. Verify usage limits are enforced

## Troubleshooting

- If you get "relation does not exist" errors, make sure you ran the schema.sql script
- If RLS errors occur, verify the policies were created correctly
- If usage limits don't work, check that the database functions were created









