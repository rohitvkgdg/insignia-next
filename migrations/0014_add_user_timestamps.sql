-- Add timestamp columns to user table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='createdat') THEN
        ALTER TABLE "user" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='updatedat') THEN
        ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;
    END IF;
END $$;
