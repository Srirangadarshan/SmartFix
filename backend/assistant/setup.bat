@echo off
echo SmartFix AI Assistant Setup
echo ===========================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Please install Python 3.8 or newer.
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Build index
echo Building vector index...
python build_index.py

echo.
echo Setup complete! You can now run the assistant with:
echo - python run_assistant.py (basic RAG)
echo - python llm_assistant.py (with LLM if available)
echo - python voice_assistant.py (with voice if available)
echo.
echo To download optional models, run:
echo - python setup.py --llm --whisper --piper
echo.

pause
