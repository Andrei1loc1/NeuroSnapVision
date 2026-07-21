.\venv\Scripts\activate
Set-Location -LiteralPath "hf-space"
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000