# Onboarding Assessment Refactor — Integration & Testing Guide

## ✅ Completed Steps

### 1. Prisma Schema Changes

- ✅ Removed `questionWeight: Float` from OnboardingQuestion
- ✅ Removed `optionWeights: Json` from OnboardingQuestion
- ✅ Added `correctAnswer: String` to OnboardingQuestion
- ✅ Removed `selectedWeight: Float` from UserOnboardingAnswer
- Schema migration created and applied: `20260609074334_remove_weights_add_correct_answer`

### 2. Database Migration

- ✅ Migration applied successfully
- ✅ Deleted all existing onboarding data (questions, answers, submissions)
- ✅ Dropped old weight columns
- ✅ Added new correctAnswer column

### 3. New Seed Data (20 AI Literacy Questions)

- ✅ All 20 AI Literacy questions with correct answers seeded
- ✅ Questions cover 5 chapters:
  - Chapter 1: Foundations (Q1–4)
  - Chapter 2: Building with AI (Q5–8)
  - Chapter 3: Customer Data & Privacy (Q9–12)
  - Chapter 4: Reliability & Risk (Q13–16)
  - Chapter 5: Shipping AI Products (Q17–20)

### 4. Backend Service Scoring Logic

- ✅ Updated `OnboardingRepository`:
  - Replaced `findQuestionsWithWeights()` with `findQuestionsForScoring()`
  - Updated `AnswerRecord` interface to remove `selectedWeight`
  - Updated `saveSubmission()` to not store weights
- ✅ Updated `OnboardingService`:
  - New scoring: 1 point per correct answer (out of 20 total)
  - Passing threshold: 18/20 = 90%
  - Profile derivation: advanced (≥18), intermediate (≥10), beginner (<10)

### 5. Frontend Assessment Page

- ✅ Updated `apps/web/src/app/onboarding/assessment/page.tsx`:
  - Replaced 4 generic questions with all 20 AI Literacy questions
  - Added back-navigation blocker using `popstate` handler
  - Removed back arrow link
  - Updated heading and button text

## 🧪 Testing Instructions

### Test 1: Database Verification

```bash
# Start database studio
npm run db:studio
# Navigate to onboarding_questions table
# Verify:
# - 20 rows with correct_answer field populated
# - No question_weight or option_weights columns
# - user_onboarding_answers has no selected_weight column
```

### Test 2: Backend API Testing

```bash
# Start the API server
cd apps/api
npm run start:dev

# In another terminal, test the questions endpoint
curl http://localhost:3000/api/v1/onboarding/questions?role=developer

# Expected: 20 questions without correctAnswer exposed
```

### Test 3: Assessment Submission

```bash
# Test the submission endpoint
curl -X POST http://localhost:3000/api/v1/onboarding/submit \
  -H "Content-Type: application/json" \
  -d '{
    "role": "developer",
    "answers": [...]
  }'

# Expected response includes totalScore, normalizedScore, profileKey
```

### Test 4: Frontend Assessment Flow

```bash
# Start the web server
cd apps/web
npm run dev

# Navigate to http://localhost:3000/onboarding/assessment
# Test:
# 1. All 20 questions display
# 2. Can select answers
# 3. Progress bar updates
# 4. Back button blocked
# 5. Complete all 20 questions
# 6. Submit button on last question
```

### Test 5: Scoring Verification

- 18+ correct: Advanced, 90%+
- 10–17 correct: Intermediate, 50–85%
- <10 correct: Beginner, <50%

## 📋 Checklist

- [ ] Database migration applied
- [ ] Prisma client regenerated
- [ ] Seed data applied (20 questions)
- [ ] Questions endpoint returns 20 questions without correctAnswer
- [ ] Submission endpoint calculates score correctly
- [ ] Frontend loads all 20 questions
- [ ] Back navigation is blocked
- [ ] Progress bar updates correctly
- [ ] Score calculation matches thresholds (18/20 = advanced)

## 🔄 Rollback Plan

If critical issues occur:

1. Create a new migration to restore old columns
2. Restore old seed data from git history
3. Redeploy

## 📝 Notes

- API contract unchanged for clients
- No breaking changes
- Old submission data preserved
- Linear flow enforced

---

**Status**: Ready for testing
