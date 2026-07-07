---
title: NeuroSnap Vision Backend
emoji: 🥗
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
tags:
  - food-recognition
  - yolo
  - efficientnet
  - health
  - longevity
---

# NeuroSnap Vision Backend

FastAPI backend for the NeuroSnap Vision health app.

## Features

- **Food recognition**: YOLO segmentation + EfficientNetB4 classification (270 food classes)
- **Bio-age calculation**: 7-dimension biological age scoring with hazard ratio mapping
- **Protocol tracking**: Daily check-in system with streak tracking
- **Nutrition scoring**: Healthy score, MIND score, protein timing, circadian nutrition
- **Reports analysis**: Food diversity, UPF%, P:E ratio, compliance, week-over-week trends

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/predict` | POST | Food recognition from image |
| `/healthy-score` | POST | Nutrition healthy score |
| `/mind-score` | POST | Brain nutrition (MIND) score |
| `/recommendation` | POST | Multi-agent recommendation |
| `/protocol/morning` | POST | Morning check-in |
| `/protocol/evening` | POST | Evening check-in |
| `/protocol/today` | GET | Today's protocol |
| `/bio-age/current` | GET | Current bio-age snapshot |
| `/bio-age/history` | GET | Bio-age history |
| `/workout/log` | POST | Log workout |
| `/workout/weekly` | GET | Weekly movement quality |
| `/intervention/today` | GET | Today's leverage intervention |
| `/circadian/score` | POST | Circadian nutrition score |

## Models

- `yolo_foodseg_best.pt` — YOLO segmentation model (103 food classes)
- `nutritrack_B4_SUPREM.keras` — EfficientNetB4 classifier (270 food classes, 380×380 input)
- `mind_pattern_model.pkl` — MIND diet pattern classifier