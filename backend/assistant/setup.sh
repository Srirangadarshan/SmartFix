#!/bin/bash
echo "SmartFix AI Assistant Setup"
echo "==========================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python not found. Please install Python 3.8 or newer."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Build index
echo "Building vector index..."
python build_index.py

echo
echo "Setup complete! You can now run the assistant with:"
echo "- python run_assistant.py (basic RAG)"
echo "- python llm_assistant.py (with LLM if available)"
echo "- python voice_assistant.py (with voice if available)"
echo
echo "To download optional models, run:"
echo "- python setup.py --llm --whisper --piper"
echo

read -p "Press Enter to continue..."
