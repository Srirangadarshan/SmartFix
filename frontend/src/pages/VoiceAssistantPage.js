import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAssistant from '../components/VoiceAssistant';
import { getDeviceHealth } from '../services/deviceAnalyzerService';

// Glass Card Component (reused from SmartFlixDashboard)
const GlassCard = ({ children, hover = false, ...props }) => {
  return (
    <Card 
      sx={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(16px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
        position: 'relative',
        '&:hover': hover ? {
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
          transform: 'translateY(-5px)',
          '&::before': {
            opacity: 1
          }
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
          borderRadius: 'inherit',
          zIndex: -1,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

// SpotlightHero Component (reused from SmartFlixDashboard)
const SpotlightHero = () => {
  return (
    <Box 
      sx={{
        position: 'relative',
        height: '25vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(255, 87, 34, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(to right, #FF5722, #FFC107)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Voice Assistant <span style={{ fontSize: '0.8em' }}>🎙️</span>
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: '600px',
            mx: 'auto',
            fontWeight: 300,
            fontFamily: '"Orbitron", sans-serif'
          }}
        >
          I'm here to troubleshoot, guide, and fix — what's on your mind
        </Typography>
      </motion.div>
    </Box>
  );
};

const VoiceAssistantPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(!isMobile);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch device health information
    const fetchDeviceInfo = async () => {
      try {
        const data = await getDeviceHealth();
        
        if (data.success === false) {
          // Handle error response from the service
          setError(data.error || 'Unable to fetch device information');
          // Still set the device info with fallback values
          setDeviceInfo(data);
        } else {
          setDeviceInfo(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching device info:', err);
        setError('Unable to fetch device information');
        
        // Set fallback device info
        setDeviceInfo({
          status: "unknown",
          metrics: {
            cpu_usage: 0,
            memory_usage: 0,
            disk_usage: 0
          }
        });
      }
    };

    fetchDeviceInfo();
    
    // Set up a polling interval to periodically refresh device info
    const interval = setInterval(fetchDeviceInfo, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="min-h-screen" sx={{ 
      minHeight: '100vh', 
      bgcolor: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.05, 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)'
      }} />

      <SpotlightHero />

      <Container maxWidth="xl" sx={{ pb: 8, px: { xs: 2, sm: 3, md: 6 }, position: 'relative', zIndex: 10 }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={showInfo ? 8 : 12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlassCard sx={{ 
                  height: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontFamily: '"Orbitron", sans-serif',
                        color: 'white'
                      }}
                    >
                      <MicIcon sx={{ mr: 1 }} fontSize="small" />
                      Voice Assistant
                    </Typography>
                    
                    {isMobile && (
                      <Tooltip title="Show/Hide Info Panel">
                        <IconButton 
                          onClick={() => setShowInfo(!showInfo)} 
                          size="small"
                          sx={{ color: 'white' }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <VoiceAssistant deviceInfo={deviceInfo} />
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Info Panel */}
            <AnimatePresence>
              {showInfo && (
                <Grid item xs={12} md={4}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Device Info Card */}
                      <GlassCard hover={true}>
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2,
                              fontFamily: '"Orbitron", sans-serif',
                              color: 'white'
                            }}
                          >
                            <Box 
                              sx={{ 
                                p: 1, 
                                borderRadius: 2, 
                                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                                display: 'flex',
                                mr: 1
                              }}
                            >
                              <ComputerIcon fontSize="small" />
                            </Box>
                            Device Information
                          </Typography>
                          
                          {deviceInfo ? (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Status:</Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{
                                    color: deviceInfo.status === 'healthy' ? '#4caf50' : 
                                           deviceInfo.status === 'warning' ? '#ff9800' : 
                                           error ? '#f44336' : 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 'medium'
                                  }}
                                >
                                  {deviceInfo.status?.toUpperCase() || 'UNKNOWN'}
                                </Typography>
                              </Box>
                              
                              <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>CPU Usage:</Typography>
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {deviceInfo.metrics?.cpu_usage?.toFixed(1) || 0}%
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Memory Usage:</Typography>
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {deviceInfo.metrics?.memory_usage?.toFixed(1) || 0}%
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Disk Usage:</Typography>
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {deviceInfo.metrics?.disk_usage?.toFixed(1) || 0}%
                                </Typography>
                              </Box>
                              
                              {error && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                                  <Typography sx={{ color: '#f44336', fontSize: '0.75rem' }}>
                                    {error}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                              <CircularProgress size={24} sx={{ mb: 1, color: '#FF5722' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Loading device information...
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </GlassCard>

                      {/* Voice Commands Card */}
                      <GlassCard hover={true}>
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2,
                              fontFamily: '"Orbitron", sans-serif',
                              color: 'white'
                            }}
                          >
                            <Box 
                              sx={{ 
                                p: 1, 
                                borderRadius: 2, 
                                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                                display: 'flex',
                                mr: 1
                              }}
                            >
                              <MicIcon fontSize="small" />
                            </Box>
                            Example Voice Commands
                          </Typography>
                          
                          <Box component="ul" sx={{ pl: 2, mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                            <Box component="li" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                "My laptop battery drains too quickly"
                              </Typography>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                "My screen is too dim"
                              </Typography>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                "Increase the volume"
                              </Typography>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                "Take a screenshot"
                              </Typography>
                            </Box>
                            <Box component="li">
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                "My WiFi keeps disconnecting"
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </GlassCard>

                      {/* How It Works Card */}
                      <GlassCard hover={true} sx={{ flexGrow: 1 }}>
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2,
                              fontFamily: '"Orbitron", sans-serif',
                              color: 'white'
                            }}
                          >
                            <Box 
                              sx={{ 
                                p: 1, 
                                borderRadius: 2, 
                                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                                display: 'flex',
                                mr: 1
                              }}
                            >
                              <SettingsIcon fontSize="small" />
                            </Box>
                            How It Works
                          </Typography>
                          
                          <Box sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                            <Typography 
                              variant="body2" 
                              paragraph 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                color: 'rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  minWidth: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  bgcolor: 'rgba(255, 87, 34, 0.2)',
                                  border: '1px solid rgba(255, 87, 34, 0.5)',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: '#FF5722'
                                }}
                              >
                                1
                              </Box>
                              Click the microphone button and speak your question or issue
                            </Typography>
                            <Typography 
                              variant="body2" 
                              paragraph 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                color: 'rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  minWidth: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  bgcolor: 'rgba(255, 87, 34, 0.2)',
                                  border: '1px solid rgba(255, 87, 34, 0.5)',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: '#FF5722'
                                }}
                              >
                                2
                              </Box>
                              The assistant will analyze your device and the issue
                            </Typography>
                            <Typography 
                              variant="body2" 
                              paragraph 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                color: 'rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  minWidth: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  bgcolor: 'rgba(255, 87, 34, 0.2)',
                                  border: '1px solid rgba(255, 87, 34, 0.5)',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: '#FF5722'
                                }}
                              >
                                3
                              </Box>
                              If needed, the assistant will take screenshots or run diagnostics
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                color: 'rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  minWidth: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  bgcolor: 'rgba(255, 87, 34, 0.2)',
                                  border: '1px solid rgba(255, 87, 34, 0.5)',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: '#FF5722'
                                }}
                              >
                                4
                              </Box>
                              You'll receive a spoken response with troubleshooting steps
                            </Typography>
                          </Box>
                        </CardContent>
                      </GlassCard>
                    </Box>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default VoiceAssistantPage;