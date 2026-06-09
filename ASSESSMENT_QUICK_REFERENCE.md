# AI Literacy Assessment Refactor — Quick Reference

## ✅ What's Been Done

### Backend Changes

- **Prisma Schema**: Removed weight fields, added `correctAnswer`
- **Database Migration**: Applied successfully
- **Repository**: Updated with `findQuestionsForScoring()`
- **Service**: New scoring: 1 point per correct, 18/20 = 90% to pass
- **Seed Data**: 20 AI Literacy questions inserted
- **Build**: Compiles successfully ✅

### Frontend Changes

- **Assessment Page**: All 20 AI Literacy questions loaded
- **Back Navigation**: Blocked using popstate handler
- **UI**: Updated heading and button text

## 🚀 Next Steps

### 1. Test the Backend API

```bash
cd apps/api
npm run start:dev
```

Then test in another terminal:

```bash
# Get questions
curl "http://localhost:3000/api/v1/onboarding/questions?role=developer"

# Submit answers
curl -X POST "http://localhost:3000/api/v1/onboarding/submit" \
  -H "Content-Type: application/json" \
  -d '{"role": "developer", "answers": [...]}'
```

### 2. Test the Frontend

```bash
cd apps/web
npm run dev
```

Visit: `http://localhost:3000/onboarding/assessment`

Test:

- [ ] All 20 questions display
- [ ] Can select answers
- [ ] Progress bar shows correct count
- [ ] Browser back button does NOT work
- [ ] Can complete the assessment

### 3. Verify Scoring

- [ ] 18–20 correct → Advanced (90–100%)
- [ ] 10–17 correct → Intermediate (50–85%)
- [ ] <10 correct → Beginner (<50%)

## 📊 Scoring Rules

| Correct | Score  | Profile      | Pass |
| ------- | ------ | ------------ | ---- |
| 20      | 100%   | Advanced     | ✅   |
| 18–19   | 90–95% | Advanced     | ✅   |
| 10–17   | 50–85% | Intermediate | ❌   |
| <10     | <50%   | Beginner     | ❌   |

**Passing threshold**: 18 or more correct (90%)

## 🔑 Key Files

### Backend

- `apps/api/prisma/schema.prisma` — Database schema
- `apps/api/prisma/seed.ts` — 20 questions with answers
- `apps/api/src/modules/onboarding/onboarding.service.ts` — Scoring logic

### Frontend

- `apps/web/src/app/onboarding/assessment/page.tsx` — Assessment UI

## 📝 Question Coverage

- **Q1–4**: AI Foundations (models, hallucinations, probabilistic outputs)
- **Q5–8**: Building with AI (structured outputs, architecture, tool controls)
- **Q9–12**: Data & Privacy (data handling, minimization, fine-tuning)
- **Q13–16**: Reliability & Risk (accuracy, bias, monitoring, fairness)
- **Q17–20**: Shipping Products (harm assessment, responsibility, metrics)

## ⚡ Important Notes

1. **No Back Button**: Users cannot go back once they answer
2. **All 20 Required**: Must answer all 20 to complete
3. **Linear Flow**: Questions must be answered in order
4. **Simple Scoring**: 1 point per correct, no weighting
5. **Clear Pass**: 18/20 = 90% required to pass

## 🎯 Git Commits

Commits are organized as:

1. `refactor(assessment): update schema and service` — Database & logic
2. `feat(assessment): add 20 AI literacy questions` — Seed & frontend
3. `docs(assessment): add refactor documentation` — Documentation

---

**Status**: ✅ Ready for Testing
**Build**: ✅ Passing
