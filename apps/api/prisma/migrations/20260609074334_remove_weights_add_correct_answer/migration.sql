-- Delete existing onboarding data to allow schema changes
DELETE FROM user_onboarding_answers;
DELETE FROM user_onboarding;
DELETE FROM onboarding_questions;

-- Drop the old weight columns from onboarding_questions
ALTER TABLE "onboarding_questions" DROP COLUMN "question_weight";
ALTER TABLE "onboarding_questions" DROP COLUMN "option_weights";

-- Add the new correctAnswer column
ALTER TABLE "onboarding_questions" ADD COLUMN "correct_answer" VARCHAR(10) NOT NULL DEFAULT 'A';

-- Drop the selectedWeight column from user_onboarding_answers
ALTER TABLE "user_onboarding_answers" DROP COLUMN "selected_weight";
