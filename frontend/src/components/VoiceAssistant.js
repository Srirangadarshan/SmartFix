import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Fade,
  Tooltip,
  LinearProgress,
  useTheme,
  Chip,
  Button
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  SettingsVoice as SettingsVoiceIcon,
  Computer as ComputerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Screenshot as ScreenshotIcon,
  BrightnessLow as BrightnessLowIcon,
  BrightnessHigh as BrightnessHighIcon,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { queryAssistant } from '../services/assistantApi';

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

const VoiceAssistant = () => {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [visualFeedback, setVisualFeedback] = useState(null);
  const [volume, setVolume] = useState(1.0); // 0.0 to 1.0
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [automationStatus, setAutomationStatus] = useState(null);
  
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  
  // Initialize device info on mount
  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/query/device/health');
        if (response.ok) {
          const data = await response.json();
          setDeviceInfo(data);
        }
      } catch (err) {
        console.error('Error fetching device info:', err);
      }
    };
    
    getDeviceInfo();
    
    // Set up video for screenshot capability
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
        });
    }
    
    return () => {
      // Clean up
      if (recognition) {
        recognition.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Set up speech recognition event handlers
  useEffect(() => {
    if (!recognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setError(null);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(interimTranscript);
      
      if (finalTranscript) {
        setFinalTranscript(finalTranscript.trim());
        handleFinalTranscript(finalTranscript.trim());
      }
    };
  }, []);
  
  // Process final transcript and get response
  const handleFinalTranscript = async (text) => {
    if (!text) return;
    
    // Check for automation commands first
    if (handleAutomationCommand(text)) {
      return; // Command was handled by automation
    }
    
    // If not an automation command, query the assistant
    setLoading(true);
    
    try {
      // Determine if we need to include a screenshot
      const shouldIncludeScreenshot = 
        text.includes('screen') || 
        text.includes('display') || 
        text.includes('showing') ||
        text.includes('see');
      
      // Take a screenshot if needed
      let imageData = null;
      if (shouldIncludeScreenshot) {
        imageData = await takeScreenshot();
        setScreenshot(imageData);
        setIsScreenshotMode(true);
      }
      
      // Prepare context with device info and screenshot
      const context = {
        device_info: {
          type: 'laptop', // Default to laptop, could be detected more accurately
          os: navigator.platform,
          browser: navigator.userAgent
        },
        system_metrics: deviceInfo ? {
          cpu_usage: deviceInfo.metrics?.cpu_usage,
          memory_usage: deviceInfo.metrics?.memory_usage,
          disk_usage: deviceInfo.metrics?.disk_usage
        } : null,
        screenshot: imageData
      };
      
      // Query the assistant
      const result = await queryAssistant(text, context);
      setResponse(result);
      
      // Speak the response
      speakResponse(result.answer);
      
      // If there's a solution that requires automation, execute it
      if (result.solution_steps && result.solution_steps.length > 0) {
        executeAutomation(result.solution_steps);
      }
    } catch (err) {
      console.error('Error processing voice command:', err);
      setError('Failed to process your request. Please try again.');
      speakResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle automation commands directly
  const handleAutomationCommand = (text) => {
    const command = text.toLowerCase();
    
    // Screen brightness commands
    if (command.includes('brightness up') || command.includes('increase brightness')) {
      setVisualFeedback('brightness_up');
      setAutomationStatus('Increasing screen brightness');
      speakResponse('Increasing screen brightness');
      // In a real implementation, we would call the backend to control brightness
      setTimeout(() => setVisualFeedback(null), 3000);
      return true;
    }
    
    if (command.includes('brightness down') || command.includes('decrease brightness')) {
      setVisualFeedback('brightness_down');
      setAutomationStatus('Decreasing screen brightness');
      speakResponse('Decreasing screen brightness');
      // In a real implementation, we would call the backend to control brightness
      setTimeout(() => setVisualFeedback(null), 3000);
      return true;
    }
    
    // Volume commands
    if (command.includes('volume up') || command.includes('increase volume')) {
      setVisualFeedback('volume_up');
      setVolume(Math.min(volume + 0.2, 1.0));
      setAutomationStatus('Increasing volume');
      speakResponse('Increasing volume');
      setTimeout(() => setVisualFeedback(null), 3000);
      return true;
    }
    
    if (command.includes('volume down') || command.includes('decrease volume')) {
      setVisualFeedback('volume_down');
      setVolume(Math.max(volume - 0.2, 0.0));
      setAutomationStatus('Decreasing volume');
      speakResponse('Decreasing volume');
      setTimeout(() => setVisualFeedback(null), 3000);
      return true;
    }
    
    if (command.includes('mute') || command.includes('silence')) {
      setVisualFeedback('mute');
      setVolume(0);
      setAutomationStatus('Muting audio');
      speakResponse('Muting audio');
      setTimeout(() => setVisualFeedback(null), 3000);
      return true;
    }
    
    // Screenshot command
    if (command.includes('screenshot') || command.includes('take a picture')) {
      takeScreenshot().then(data => {
        setScreenshot(data);
        setIsScreenshotMode(true);
        setAutomationStatus('Screenshot captured');
        speakResponse('Screenshot captured');
      });
      return true;
    }
    
    // No automation command detected
    return false;
  };
  
  // Execute automation based on solution steps
  const executeAutomation = (steps) => {
    // In a real implementation, this would communicate with the backend
    // to execute the automation steps
    setAutomationStatus('Executing automation...');
    
    // Simulate automation execution
    setTimeout(() => {
      setAutomationStatus('Automation completed');
      setTimeout(() => setAutomationStatus(null), 3000);
    }, 2000);
  };
  
  // Take a screenshot using canvas and video
  const takeScreenshot = async () => {
    return new Promise((resolve, reject) => {
      try {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = canvas.toDataURL('image/png');
          resolve(imageData);
        } else {
          // Fallback to a simulated screenshot
          resolve(null);
        }
      } catch (err) {
        console.error('Error taking screenshot:', err);
        reject(err);
      }
    });
  };
  
  // Speak text using speech synthesis
  const speakResponse = (text) => {
    if (!text || !speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    // Add a small delay to ensure previous speech is fully stopped
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      speechSynthesisRef.current.speak(utterance);
    }, 100);
  };
  
  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setFinalTranscript('');
      recognition.start();
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Exit screenshot mode
  const exitScreenshotMode = () => {
    setIsScreenshotMode(false);
    setScreenshot(null);
    // Also stop any ongoing speech when exiting screenshot mode
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Render visual feedback for automation
  const renderVisualFeedback = () => {
    switch (visualFeedback) {
      case 'brightness_up':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <BrightnessHighIcon fontSize="large" color="primary" />
            <LinearProgress variant="determinate" value={80} sx={{ mt: 1, mb: 1 }} />
            <Typography variant="body2">Brightness Increased</Typography>
          </Box>
        );
      case 'brightness_down':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <BrightnessLowIcon fontSize="large" color="primary" />
            <LinearProgress variant="determinate" value={30} sx={{ mt: 1, mb: 1 }} />
            <Typography variant="body2">Brightness Decreased</Typography>
          </Box>
        );
      case 'volume_up':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <VolumeUpIcon fontSize="large" color="primary" />
            <LinearProgress variant="determinate" value={volume * 100} sx={{ mt: 1, mb: 1 }} />
            <Typography variant="body2">Volume Increased</Typography>
          </Box>
        );
      case 'volume_down':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <VolumeDownIcon fontSize="large" color="primary" />
            <LinearProgress variant="determinate" value={volume * 100} sx={{ mt: 1, mb: 1 }} />
            <Typography variant="body2">Volume Decreased</Typography>
          </Box>
        );
      case 'mute':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <VolumeMuteIcon fontSize="large" color="primary" />
            <LinearProgress variant="determinate" value={0} sx={{ mt: 1, mb: 1 }} />
            <Typography variant="body2">Audio Muted</Typography>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Hidden video element for screenshots */}
      <video 
        ref={videoRef} 
        style={{ display: 'none', position: 'absolute', top: 0, left: 0 }} 
        autoPlay 
        muted
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Screenshot mode overlay */}
      <AnimatePresence>
        {isScreenshotMode && screenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <Typography variant="h6" color="white" gutterBottom>
              Analyzing Screenshot
            </Typography>
            
            <Box sx={{ position: 'relative', maxWidth: '80%', maxHeight: '60%', mb: 2 }}>
              <img 
                src={screenshot} 
                alt="Screenshot" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  border: '2px solid white'
                }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={exitScreenshotMode}
                startIcon={<CloseIcon />}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Status area */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 2, 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <ComputerIcon sx={{ fontSize: 120 }} />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                SmartFix Voice Assistant
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<SettingsVoiceIcon />} 
                  label={isListening ? 'Listening...' : 'Ready'} 
                  color={isListening ? 'success' : 'primary'} 
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                />
                
                {deviceInfo && (
                  <Chip 
                    icon={deviceInfo.status === 'healthy' ? <CheckCircleIcon /> : <WarningIcon />} 
                    label={`System: ${deviceInfo.status || 'Unknown'}`} 
                    color={deviceInfo.status === 'healthy' ? 'success' : 
                           deviceInfo.status === 'warning' ? 'warning' : 'default'} 
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                  />
                )}
              </Box>
            </Box>
            
            <Box>
              <Tooltip title={isListening ? "Stop Listening" : "Start Listening"}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleListening}
                  disabled={!recognition}
                  sx={{ 
                    bgcolor: isListening ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                    },
                    width: 56,
                    height: 56
                  }}
                >
                  {isListening ? (
                    <MicIcon fontSize="large" sx={{ color: '#4caf50' }} />
                  ) : (
                    <MicOffIcon fontSize="large" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
        
        {/* Transcript area */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 2, 
            flexGrow: 0,
            minHeight: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body1" fontWeight="medium" color="text.secondary" gutterBottom>
            {isListening ? 'Listening...' : 'Say something...'}
          </Typography>
          
          <Typography variant="h6" sx={{ minHeight: 32 }}>
            {transcript || finalTranscript || (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                {recognition ? 'Click the microphone button and speak' : 'Speech recognition not supported in this browser'}
              </Typography>
            )}
          </Typography>
        </Paper>
        
        {/* Response area */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 2, 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              Assistant Response
            </Typography>
            
            {isSpeaking && (
              <Tooltip title="Stop Speaking">
                <IconButton 
                  size="small" 
                  onClick={stopSpeaking}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                >
                  <PauseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Processing your request...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
              <ErrorIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{error}</Typography>
            </Box>
          ) : response ? (
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" paragraph>
                {response.answer}
              </Typography>
              
              {response.solution_steps && response.solution_steps.length > 0 && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  borderRadius: 1
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Recommended Solution:
                  </Typography>
                  
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {response.solution_steps.map((step, index) => (
                      <Box component="li" key={index} sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: 0.7 }}>
              <VolumeUpIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Responses will appear here
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Visual feedback for automation */}
        <AnimatePresence>
          {visualFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                {renderVisualFeedback()}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Automation status */}
        <AnimatePresence>
          {automationStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: 'info.light',
                  color: 'info.contrastText'
                }}
              >
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{automationStatus}</Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default VoiceAssistant;
