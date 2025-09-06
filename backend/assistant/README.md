# SmartFix AI Assistant

An offline-first virtual assistant that provides troubleshooting help using a local knowledge base.

## Features

- **Offline-First**: Works without internet connection
- **RAG-Based**: Uses local vector search to find relevant solutions
- **LLM-Enhanced**: Optional local LLM for natural language understanding
- **Voice-Enabled**: Optional speech recognition and text-to-speech
- **API Integration**: Seamlessly integrates with the FastAPI backend

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Build the vector index:
   ```bash
   python build_index.py
   ```

3. Download LLM model (optional):
   - Download Llama-3-8B-Instruct GGUF from Hugging Face
   - Place in `models/llama-3-8b-instruct.gguf`

4. Download voice models (optional):
   - For STT: Download Whisper tiny model and place in `models/whisper-tiny.bin`
   - For TTS: Download Piper voice models and place in `models/piper/`

## Usage

### Text-Only Mode

```bash
python run_assistant.py
```

### LLM-Enhanced Mode

```bash
python llm_assistant.py
```

### Voice Mode

```bash
python voice_assistant.py
```

## API Integration

The assistant is integrated with the FastAPI backend via:

- `/assistant/local` - Query the local assistant
- `/assistant/status` - Check the status of the local assistant

## Model Sources

- **LLM**: [Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Llama-3-8B-Instruct)
- **Embeddings**: [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- **STT**: [Whisper CPP](https://github.com/ggerganov/whisper.cpp)
- **TTS**: [Piper](https://github.com/rhasspy/piper)
