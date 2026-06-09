# Onboarding Assessment Refactor — Gap Analysis

## Current State

### ✅ Database Schema (apps/api/prisma/schema.prisma)

- **OnboardingQuestion** model exists with:
  - `questionWeight: Float` (multiplier)
  - `optionWeights: Json` (per-option scores)
  - Missing: `correctAnswer` field
- **UserOnboardingAnswer** stores:
  - `selectedOption: String` (the option text)
  - `selectedWeight: Float` (denormalized weight)
- **UserOnboardingResult** stores:
  - `totalScore: Float`
  - `normalizedScore: Float`
  - `profileKey: String` (e.g., "beginner", "intermediate", "advanced")

### ✅ Seed Data (apps/api/prisma/seed.ts)

- **Current questions**: 4 analyst + 3 developer + 3 strategist + 3 designer + 3 manager questions
- **Issue**: Weight-based scoring, not correct-answer based
- **Action needed**: Replace with exactly 20 AI Literacy questions (Developer Assessment Q1–20)

### ❌ Missing `correctAnswer` Field

- OnboardingQuestion schema lacks `correctAnswer` column
- Must add before removing weights

### ❌ Backend Scoring Logic (apps/api/src/modules/onboarding/onboarding.service.ts)

- **Current**: Multiplies `questionWeight × optionWeights[idx]`
- **Issue**: No concept of "correct" answers
- **Action needed**: Replace with simple counting: 1 point per correct answer

### ❌ Frontend Assessment Page (apps/web/src/app/onboarding/assessment/page.tsx)

- **Current questions**: 4 generic questions (not AI Literacy)
- **Back navigation**: Allowed via `<Link href="/signup/role">` back arrow
- **Issue**: Can navigate back; should enforce linear flow
- **Action needed**: Block back navigation, replace questions with 20 AI Literacy questions

## Required Changes

### 1. Prisma Schema Changes

- ✅ Add `correctAnswer: String` to OnboardingQuestion
- ✅ Remove `questionWeight: Float` from OnboardingQuestion
- ✅ Remove `optionWeights: Json` from OnboardingQuestion
- ✅ Remove `selectedWeight: Float` from UserOnboardingAnswer

### 2. Database Migration

- ✅ Migration created and applied

### 3. New Seed Data (20 AI Literacy Questions)

- ✅ All 20 questions inserted with correct answers
- ✅ Questions cover all 5 chapters

### 4. Backend Service Scoring

- ✅ Old logic replaced: 1 point per correct answer
- ✅ Passing threshold: 18/20 = 90%

### 5. Frontend Assessment Page

- ✅ All 20 questions loaded
- ✅ Back navigation blocked (popstate handler)
- ✅ Back arrow removed
- ✅ Progress bar for 20 total questions

### 6. API Contract Updates

- No public API change; weights are server-side only

## Integration Steps

1. **Schema & Migration**
   - ✅ Prisma schema changes applied
   - ✅ Migration created and applied

2. **Backend Service**
   - ✅ `onboarding.service.ts` scoring logic updated

3. **Seed Data**
   - ✅ 20 AI Literacy questions seeded
   - ✅ Run `npx prisma db seed` to populate

4. **Frontend**
   - ✅ Assessment page updated with 20 questions
   - ✅ Back-navigation blocker added

5. **Test**
   - Complete assessment with 20 questions
   - Verify score calculation (18/20 = 90% pass)
   - Confirm back button is blocked

## Safety Notes

- **Backward compatibility**: Old submission data preserved
- **Rollback**: If issues occur, revert migration and restore old seed data
- **Existing features preserved**: Course upload, LMS, payments, rewards, reviews untouched
