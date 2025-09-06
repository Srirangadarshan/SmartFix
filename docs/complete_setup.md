# SmartFix-AI Complete Offline Mode Setup

This guide provides step-by-step instructions to set up SmartFix-AI's offline mode with all models downloaded and configured.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Double-click the batch file or run in command prompt
setup_offline_mode.bat
```

#### Linux/Mac
```bash
# Make executable and run
chmod +x setup_offline_mode.sh
./setup_offline_mode.sh
```

#### Manual Python Script
```bash
cd backend
python setup_offline_mode.py
```

### Option 2: Manual Setup

Follow the detailed steps below if you prefer manual control.

## 📋 Prerequisites

- **Python 3.11+** installed
- **5GB+ free disk space** for models
- **Internet connection** for initial model download
- **Git** (optional, for cloning the repository)

## 🔧 Step-by-Step Setup

### 1. Clone/Download the Project

```bash
git clone https://github.com/your-repo/SmartFix-AI.git
cd SmartFix-AI
```

### 2. Navigate to Backend

```bash
cd backend
```

### 3. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# For Linux/Mac, install system dependencies (optional)
sudo apt-get update
sudo apt-get install -y tesseract-ocr libtesseract-dev ffmpeg
```

### 4. Configure Environment

Create a `.env` file in the backend directory:

```bash
# Application Settings
DEBUG=true
ENVIRONMENT=development
SECRET_KEY=your_secret_key_here_change_in_production

# Database
DATABASE_URL=sqlite:///./smartfix_ai.db
POSTGRES_PASSWORD=your_postgres_password

# Cache
REDIS_URL=redis://localhost:6379

# Offline Mode Settings
OFFLINE_MODE_ENABLED=true
OFFLINE_MODELS_PATH=./offline_models
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# AI Service API Keys (optional for offline mode)
GEMINI_API_KEY=your_gemini_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Retry and Rate Limiting
MAX_RETRIES=3
RETRY_DELAY=1.0
RATE_LIMIT_PER_MINUTE=60

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
HEALTH_CHECK_INTERVAL=30

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

### 5. Download Models

#### Option A: Using the Demo Script
```bash
python download_offline_models.py --download-only
```

#### Option B: Using the API (after starting server)
```bash
# Start the server
uvicorn app.main:app --reload

# In another terminal, trigger download
curl -X POST "http://localhost:8000/api/v1/offline/download-models"
```

#### Option C: Automatic Download
Models will be downloaded automatically when the service starts if `OFFLINE_MODE_ENABLED=true`.

### 6. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Verify Setup

#### Check Health Endpoint
```bash
curl http://localhost:8000/health
```

#### Check Offline Status
```bash
curl http://localhost:8000/api/v1/offline/status
```

#### Access API Documentation
Open your browser and go to: `http://localhost:8000/docs`

## 📊 Model Download Status

The setup script will show the download progress for each model:

| Model | Size | Status | Purpose |
|-------|------|--------|---------|
| faster-whisper-small | 244MB | ✅ Downloaded | Speech-to-Text |
| distilbert-base-uncased | 260MB | ✅ Downloaded | Text Analysis |
| all-MiniLM-L6-v2 | 90MB | ✅ Downloaded | Embeddings |
| paddleocr | 100MB | ✅ Downloaded | OCR |
| llama-2-3b-chat-ggml | ~1.8GB | ✅ Downloaded | Text Generation |
| t5-small | 60MB | ✅ Downloaded | Summarization |

**Total Size**: ~2.5GB

## 🧪 Testing the Setup

### 1. Test Offline Solution Generation

```bash
curl -X POST "http://localhost:8000/api/v1/query/text" \
  -H "Content-Type: application/json" \
  -d '{
    "text_query": "My WiFi is not connecting",
    "device_category": "laptop"
  }'
```

### 2. Test Audio Transcription

```bash
curl -X POST "http://localhost:8000/api/v1/offline/transcribe" \
  -F "audio_file=@your_audio_file.wav"
```

### 3. Test Image Text Extraction

```bash
curl -X POST "http://localhost:8000/api/v1/offline/extract-text" \
  -F "image_file=@your_image.png"
```

### 4. Test Text Summarization

```bash
curl -X POST "http://localhost:8000/api/v1/offline/summarize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Long text to summarize...",
    "max_length": 150
  }'
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Model Download Failures

**Problem**: Models fail to download
```bash
# Check internet connectivity
ping huggingface.co

# Check disk space
df -h

# Check HuggingFace API key
echo $HUGGINGFACE_API_KEY
```

**Solution**:
- Ensure internet connection is stable
- Verify HuggingFace API key is correct
- Check available disk space (need 5GB+)
- Try downloading models individually

#### 2. Memory Issues

**Problem**: Out of memory errors
```bash
# Check available memory
free -h

# Monitor memory usage
htop
```

**Solution**:
- Close other applications
- Use smaller model variants
- Enable lazy loading (already configured)
- Increase system memory

#### 3. Python Version Issues

**Problem**: Python version too old
```bash
python --version
```

**Solution**:
- Install Python 3.11+
- Use virtual environment
- Update PATH environment variable

#### 4. Dependencies Installation Failures

**Problem**: pip install fails
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v
```

**Solution**:
- Upgrade pip to latest version
- Install system dependencies first
- Use virtual environment
- Check Python version compatibility

#### 5. Server Won't Start

**Problem**: uvicorn fails to start
```bash
# Check if port is in use
netstat -tulpn | grep :8000

# Check Python path
python -c "import app; print('Import successful')"
```

**Solution**:
- Kill processes using port 8000
- Check Python path and imports
- Verify .env file exists
- Check for syntax errors in code

### Debug Mode

Enable debug logging for detailed troubleshooting:

```python
import logging
logging.getLogger('app.services.offline_service').setLevel(logging.DEBUG)
logging.getLogger('app.core').setLevel(logging.DEBUG)
```

### Health Checks

Monitor system health:

```bash
# Check all endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/offline/status
curl http://localhost:8000/api/v1/offline/models/info
```

## 📈 Performance Optimization

### Memory Optimization

- **Lazy Loading**: Models load only when needed
- **CPU Optimization**: All models configured for CPU inference
- **Quantized Models**: Using smaller, optimized variants

### Storage Optimization

- **Model Compression**: Models are compressed during download
- **Efficient Storage**: Models stored in optimized format
- **Cache Management**: Automatic cache cleanup

### Response Time Optimization

- **Caching**: Solutions cached for quick access
- **Parallel Processing**: Multiple models can run concurrently
- **Background Processing**: Non-blocking operations

## 🔒 Security Considerations

### Local Processing

- All AI processing happens locally
- No data sent to external services in offline mode
- User data never leaves the system

### Model Security

- Models downloaded from trusted sources (HuggingFace)
- Model integrity verified during download
- No external API calls in offline mode

### Environment Security

- API keys stored in environment variables
- No hardcoded secrets in code
- Role-based access control for admin functions

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build the image
docker build -f backend/Dockerfile -t smartfix-ai .

# Run with offline mode
docker run -p 8000:8000 \
  -e OFFLINE_MODE_ENABLED=true \
  -e OFFLINE_MODELS_PATH=/app/offline_models \
  smartfix-ai
```

### Environment Variables for Production

```bash
# Production settings
DEBUG=false
ENVIRONMENT=production
SECRET_KEY=your_secure_secret_key_here
OFFLINE_MODE_ENABLED=true
OFFLINE_MODELS_PATH=/app/offline_models
```

## 📞 Support

If you encounter issues:

1. **Check the logs**: Look for error messages in the console
2. **Verify prerequisites**: Ensure all requirements are met
3. **Test connectivity**: Check internet and API access
4. **Review configuration**: Verify environment variables
5. **Check documentation**: Review this guide and API docs

## 🎯 Next Steps

After successful setup:

1. **Explore the API**: Visit `http://localhost:8000/docs`
2. **Test functionality**: Try different query types
3. **Integrate with frontend**: Connect to the React frontend
4. **Customize models**: Add your own models if needed
5. **Scale deployment**: Deploy to production environment

## 📚 Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Offline Mode Guide](docs/offline_mode.md)
- [Architecture Documentation](docs/architecture.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
