# Project Overview: NeuroSnap Vision - Bio-Age Control System

## Overview
NeuroSnap Vision is a **Biological Age Optimization System** that transforms nutrition tracking into a multi-dimensional control system for body and mind. It measures biological age from 6 dimensions (nutrition, sleep, ANS, movement, light, subjective) and provides one daily leverage action with quantified impact on aging rate.

## Goals
1. **Primary**: Reduce user's biological age pace below 1.0 years/year (decelerate aging)
2. **Core**: Provide a single daily action ("Leverage Point") that maximally reduces bio-age
3. **Engagement**: Achieve >70% daily protocol completion via 10-second check-in
4. **Retention**: >60% 30-day retention through visible bio-age progress
5. **Differentiation**: First app that computes biological age from daily habits + nutrition photos, not just blood work

## Core User Flow
1. **Onboarding** (3 min): Baseline questions (wake/sleep, job type, workout freq, wearable, stressor) + nutrition goals
2. **Daily Protocol** (10 sec): 4 taps morning (recovery, energy) + 4 taps evening (stress, digestion)
3. **Nutrition Logging**: Photo scan meals → auto macros + circadian timing score
4. **Workout Logging** (optional, 30 sec): WorkoutCard - type + RPE intensity + duration
5. **Home Dashboard**: See Bio-Age, Pace of Aging, Today's Leverage Action
6. **Bio-Age Deep Dive** (`/bio-age`): 6 dimension scores, organ ages, 90-day trend, neuro graph
7. **Weekly Review** (`/reports`): Bio-age trend, dimension breakdown, experiment results

## Features

### Existing (Implemented)
- **Food Photo Recognition**: EfficientNet model → 101 food classes + macros estimation
- **Nutrition Scoring**: Healthy Score (calories/protein/fats/timing/consistency) + MIND Diet Score (brain nutrition)
- **Multi-Agent Recommendations**: Q-learning agents (protein, calories, timing, fats, consistency) → prioritized advice
- **Meal Journal**: Timeline view with daily summaries
- **Reports**: Weekly calories, macro balance, AI recommendations, brain health card
- **Profile/Goals**: Calorie/protein/fat targets, onboarding flow

### In Scope (To Build)
- **Bio-Age Computation Engine**: 6-dimension weighted composite → biological age, pace, organ ages
- **Daily Protocol** (`/protocol`): Morning/evening 4-tap check-in with streak, smart defaults
- **Circadian Nutrition**: Meal timing vs melatonin onset proxy, eating window, caloric distribution
- **WorkoutCard**: Type (strength/cardio/mobility/sport) + RPE 1-10 + duration presets
- **Intervention Engine**: Marginal gain analysis → daily leverage point with quantified impact
- **Bio-Age Dashboard** (`/bio-age`): Hero card, 6 dimension bars, 4 organ cards, 90-day trend, neuro graph
- **Enhanced Home**: BioAgeCard, DailyLeverageCard, ProtocolQuickCheck inline
- **Enhanced Onboarding**: 6 baseline questions for smart defaults

### Out of Scope (V2+)
- Blood work integration / lab result parsing
- Wearable direct API (Oura, Whoop, Garmin) — only HealthKit/GFit V1
- RAG/LLM chat assistant
- Community/social features
- Supplement tracking beyond quick tags
- Meal planning / grocery lists
- Native mobile app (PWA only V1)

## Success Criteria
1. Bio-Age computation runs daily for all users with >30 days data
2. Daily protocol completion rate >70%
3. Median Pace of Aging across users <0.9 years/year at 90 days
4. Daily Leverage Point action taken >50% of days
5. `npm run build` and `npm run lint` pass
6. All 6 context files accurate and synced with implementation