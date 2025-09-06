#!/usr/bin/env python
# test_assistant.py - Simple test script for the SmartFix AI Assistant
import os
import sys
import argparse
import logging
import asyncio
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_rag():
    """Test the basic RAG-based assistant"""
    from run_assistant import TroubleshootingAssistant
    
    assistant = TroubleshootingAssistant()
    
    # Test queries
    test_queries = [
        "My laptop won't turn on",
        "Windows keeps showing blue screen",
        "Printer not connecting to WiFi",
        "How do I fix overheating in my gaming PC?",
        "My smartphone battery drains too quickly"
    ]
    
    print("\n" + "="*50)
    print("Testing RAG-based Assistant")
    print("="*50)
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        answer = assistant.process_query(query, k=1)
        print(f"Answer: {answer[:200]}...")
        print("-"*50)

async def test_llm():
    """Test the LLM-enhanced assistant"""
    try:
        from llm_assistant import LLMAssistant
        
        assistant = LLMAssistant()
        
        if not assistant.llm_available:
            print("LLM not available. Skipping LLM test.")
            return
        
        # Test queries
        test_queries = [
            "My laptop won't turn on",
            "Windows keeps showing blue screen",
            "Printer not connecting to WiFi"
        ]
        
        print("\n" + "="*50)
        print("Testing LLM-enhanced Assistant")
        print("="*50)
        
        for query in test_queries:
            print(f"\nQuery: {query}")
            answer = assistant.process_query(query, k=1)
            print(f"Answer: {answer[:200]}...")
            print("-"*50)
    
    except ImportError:
        print("LLM dependencies not available. Skipping LLM test.")

async def test_api_integration():
    """Test the API integration"""
    try:
        from api_integration import get_assistant_api
        
        assistant_api = get_assistant_api()
        
        # Test queries
        test_queries = [
            "My laptop won't turn on",
            "Windows keeps showing blue screen"
        ]
        
        print("\n" + "="*50)
        print("Testing API Integration")
        print("="*50)
        
        # Test status
        status = await assistant_api.get_status()
        print(f"Assistant status: {json.dumps(status, indent=2)}")
        
        # Test queries
        for query in test_queries:
            print(f"\nQuery: {query}")
            result = await assistant_api.process_query(query)
            print(f"Result: {json.dumps(result, indent=2)[:200]}...")
            print("-"*50)
    
    except Exception as e:
        print(f"Error testing API integration: {e}")

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Test the SmartFix AI Assistant")
    parser.add_argument("--rag", action="store_true", help="Test RAG-based assistant")
    parser.add_argument("--llm", action="store_true", help="Test LLM-enhanced assistant")
    parser.add_argument("--api", action="store_true", help="Test API integration")
    parser.add_argument("--all", action="store_true", help="Test all components")
    
    args = parser.parse_args()
    
    # If no arguments provided, test all components
    if not (args.rag or args.llm or args.api):
        args.all = True
    
    if args.rag or args.all:
        await test_rag()
    
    if args.llm or args.all:
        await test_llm()
    
    if args.api or args.all:
        await test_api_integration()

if __name__ == "__main__":
    asyncio.run(main())
