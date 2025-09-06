# SmartFix-AI Architecture

```mermaid
flowchart TD
    subgraph "Input Layer"
        A1["Text Query"] --> B
        A2["Virtual Assistant"] --> B
        A3["Image Upload"] --> B
        A4["Log Files"] --> B
        B["Input Preprocessing"]
    end
    
    subgraph "Processing Layer"
        C1["Speech-to-Text<br/>(Hugging Face)"]
        C2["Image Analysis<br/>(Gemini Vision)"]
        C3["Log Parsing<br/>(Gemini API)"]
        C4["Web Search<br/>(SerpAPI)"]
        B --> C1
        B --> C2
        B --> C3
        B --> C4
    end
    
    subgraph "Intelligent Brain Core"
        D["Fusion Layer"]
        E["Root Cause Analysis<br/>(Gemini API)"]
        F["Solution Ranking<br/>(Hugging Face)"]
        G["Learning System"]
        C1 --> D
        C2 --> D
        C3 --> D
        C4 --> D
        D --> E
        E --> F
        F --> G
        G --> D
    end
    
    subgraph "Device Analytics"
        H1["Health Monitoring"]
        H2["Performance Metrics"]
        H3["Security Analysis"]
        H4["Hardware Diagnostics"]
        F --> H1
        F --> H2
        F --> H3
        F --> H4
    end
    
    subgraph "Output Layer"
        I1["UI Display"]
        I2["SMS/WhatsApp<br/>(Twilio)"]
        I3["Virtual Assistant Response"]
        F --> I1
        F --> I2
        F --> I3
    end
    
    subgraph "Storage"
        J["JSON Database"]
        K["Brain Memory DB"]
        F --> J
        G --> K
        J --> D
        K --> D
    end
```

## Component Details

### Input Layer
- **Text Query**: Direct text input from the user interface
- **Voice Input**: Audio recordings converted to text
- **Image Upload**: Screenshots of errors or device issues
- **Log Files**: System or application logs for analysis

### Processing Layer
- **Speech-to-Text**: Converts voice inputs to text using Hugging Face models
- **Image Analysis**: Extracts information from images using Gemini Vision
- **Log Parsing**: Analyzes log files to identify errors and patterns
- **Web Search**: Retrieves relevant solutions from the internet using SerpAPI

### AI Reasoning Engine
- **Fusion Layer**: Combines all inputs into a unified representation
- **Root Cause Analysis**: Identifies the likely cause of the issue using Gemini API
- **Solution Ranking**: Ranks possible solutions based on relevance and effectiveness

### Output Layer
- **UI Display**: Presents solutions through an interactive user interface
- **SMS/WhatsApp**: Sends notifications and updates via Twilio
- **Voice Response**: Provides audio feedback for hands-free operation

### Storage
- **JSON Database**: Stores user queries, solutions, and feedback for future reference
