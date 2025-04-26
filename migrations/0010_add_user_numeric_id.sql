-- Add numeric_id column
ALTER TABLE "user" ADD COLUMN "numeric_id" integer;

-- Create a temporary sequence to generate numeric IDs
CREATE TEMPORARY SEQUENCE temp_numeric_id_seq START WITH 10001;

-- Update existing users with sequential IDs
UPDATE "user" SET "numeric_id" = nextval('temp_numeric_id_seq');

-- Make the column non-nullable and unique after populating
ALTER TABLE "user" ALTER COLUMN "numeric_id" SET NOT NULL;
ALTER TABLE "user" ADD CONSTRAINT "user_numeric_id_unique" UNIQUE ("numeric_id");

-- Drop the temporary sequence
DROP SEQUENCE temp_numeric_id_seq;