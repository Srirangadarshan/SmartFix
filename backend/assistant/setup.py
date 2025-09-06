#!/usr/bin/env python
# setup.py - Setup script for the SmartFix AI Assistant
import os
import sys
import argparse
import logging
import subprocess
import shutil
import requests
from tqdm import tqdm
import zipfile
import tarfile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
FAISS_INDEX_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "faiss_index")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# Model URLs
LLM_MODEL_URL = "https://huggingface.co/TheBloke/Llama-3-8B-Instruct-GGUF/resolve/main/llama-3-8b-instruct.Q4_K_M.gguf"
WHISPER_MODEL_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin"
PIPER_MODEL_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx"
PIPER_CONFIG_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json"

def download_file(url, destination, description=None):
    """Download a file with progress bar"""
    if os.path.exists(destination):
        logger.info(f"File already exists: {destination}")
        return
    
    logger.info(f"Downloading {description or url} to {destination}")
    
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as f, tqdm(
        desc=os.path.basename(destination),
        total=total_size,
        unit='B',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024):
            size = f.write(data)
            bar.update(size)

def setup_environment():
    """Set up the environment"""
    # Create directories
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(os.path.join(MODELS_DIR, "piper"), exist_ok=True)
    os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    logger.info("Environment setup complete")

def install_dependencies():
    """Install dependencies"""
    logger.info("Installing dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing dependencies: {e}")
        return False
    
    return True

def download_models(args):
    """Download models"""
    if args.llm:
        llm_path = os.path.join(MODELS_DIR, "llama-3-8b-instruct.gguf")
        download_file(LLM_MODEL_URL, llm_path, "LLM model")
    
    if args.whisper:
        whisper_path = os.path.join(MODELS_DIR, "whisper-tiny.bin")
        download_file(WHISPER_MODEL_URL, whisper_path, "Whisper model")
    
    if args.piper:
        piper_model_path = os.path.join(MODELS_DIR, "piper", "en_US-ryan-medium.onnx")
        piper_config_path = os.path.join(MODELS_DIR, "piper", "en_US-ryan-medium.onnx.json")
        download_file(PIPER_MODEL_URL, piper_model_path, "Piper TTS model")
        download_file(PIPER_CONFIG_URL, piper_config_path, "Piper TTS config")

def build_index():
    """Build the vector index"""
    logger.info("Building vector index...")
    
    try:
        subprocess.check_call([sys.executable, "build_index.py"])
        logger.info("Vector index built successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error building vector index: {e}")
        return False
    
    return True

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Set up the SmartFix AI Assistant")
    parser.add_argument("--deps", action="store_true", help="Install dependencies")
    parser.add_argument("--llm", action="store_true", help="Download LLM model")
    parser.add_argument("--whisper", action="store_true", help="Download Whisper model")
    parser.add_argument("--piper", action="store_true", help="Download Piper TTS model")
    parser.add_argument("--index", action="store_true", help="Build vector index")
    parser.add_argument("--all", action="store_true", help="Do everything")
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if not (args.deps or args.llm or args.whisper or args.piper or args.index or args.all):
        parser.print_help()
        return
    
    # Set up environment
    setup_environment()
    
    # Install dependencies
    if args.deps or args.all:
        install_dependencies()
    
    # Download models
    if args.llm or args.whisper or args.piper or args.all:
        download_models(args if not args.all else argparse.Namespace(llm=True, whisper=True, piper=True))
    
    # Build index
    if args.index or args.all:
        build_index()
    
    logger.info("Setup complete!")

if __name__ == "__main__":
    main()
