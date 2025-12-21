import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(16px, 2vw, 32px);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  color: white;
`;

const Header = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: clamp(12px, 3vw, 28px);
  font-size: clamp(2rem, 4vw, 3rem);
  text-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: clamp(20px, 3vw, 36px);
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  max-width: 640px;
  line-height: 1.6;
`;

const CameraContainer = styled.div`
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 15, 45, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  margin-bottom: clamp(20px, 3vw, 40px);
  width: min(90vw, 780px);
  aspect-ratio: 4 / 3;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 35px 70px rgba(15, 15, 45, 0.6), 0 0 0 1px rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.5);
  }
`;

const WebcamStyled = styled(Webcam)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PoseOverlayImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0.85;
  border-radius: 15px;
`;

const Controls = styled.div`
  display: flex;
  gap: clamp(10px, 2vw, 20px);
  margin-bottom: clamp(20px, 3vw, 40px);
  flex-wrap: wrap;
  justify-content: center;
  width: min(95vw, 780px);
`;

const Button = styled.button`
  padding: 14px clamp(20px, 3vw, 32px);
  border: none;
  border-radius: 32px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.12)'};
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.primary 
    ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
    : '0 8px 20px rgba(0,0,0,0.25)'};
  border: 2px solid ${props => props.primary ? 'transparent' : 'rgba(255,255,255,0.25)'};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props => props.primary 
      ? '0 12px 32px rgba(102, 126, 234, 0.5)' 
      : '0 12px 28px rgba(0,0,0,0.35)'};
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }
`;

const Select = styled.select`
  padding: 14px clamp(18px, 2vw, 28px);
  border: none;
  border-radius: 32px;
  background: rgba(255,255,255,0.95);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 200px;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;

  &:hover {
    box-shadow: 0 12px 28px rgba(0,0,0,0.2);
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3), 0 8px 24px rgba(0,0,0,0.15);
  }
`;

const InfoGrid = styled.div`
  width: min(95vw, 780px);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: clamp(24px, 3vw, 36px);
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const InfoValue = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  color: white;
`;

const TipBanner = styled.div`
  width: min(95vw, 780px);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: clamp(20px, 3vw, 32px);
  color: #e8eaff;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
`;

const OverlayBadge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
  color: white;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: clamp(16px, 2vw, 24px);
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
`;

const MetricValue = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffffff;
`;

const AnalysisContainer = styled.div`
  background: rgba(13, 27, 42, 0.85);
  border-radius: 24px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 30px 65px rgba(5, 8, 20, 0.45);
  width: min(95vw, 720px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ScoreCircle = styled.div`
  width: clamp(100px, 12vw, 140px);
  height: clamp(100px, 12vw, 140px);
  border-radius: 50%;
  background: ${props => {
    if (props.score >= 0.8) return 'linear-gradient(135deg, #4CAF50, #45a049)';
    if (props.score >= 0.6) return 'linear-gradient(135deg, #FF9800, #F57C00)';
    return 'linear-gradient(135deg, #F44336, #D32F2F)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const StatusText = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 0.8) return '#7df9b9';
    if (props.score >= 0.6) return '#ffd166';
    return '#ff6b6b';
  }};
`;

const CorrectionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: clamp(16px, 2vw, 24px) 0;
`;

const CorrectionItem = styled.li`
  background: rgba(78, 205, 196, 0.15);
  padding: 14px 18px;
  margin: 10px 0;
  border-radius: 12px;
  border-left: 5px solid #4ecdc4;
  font-size: 0.95rem;
  color: #e5fdf8;
`;

const FeedbackText = styled.div`
  background: rgba(25, 118, 210, 0.18);
  padding: 18px;
  border-radius: 12px;
  margin-top: 20px;
  font-style: italic;
  color: #d6ecff;
  border: 1px solid rgba(25, 118, 210, 0.35);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  color: #b71c1c;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(244, 67, 54, 0.25);
`;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FitnessTrainer = () => {
  const webcamRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState('squat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [poseOverlay, setPoseOverlay] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const exercises = [
    { value: 'squat', label: 'Squat' },
    { value: 'pushup', label: 'Push-up' },
    { value: 'plank', label: 'Plank' },
    { value: 'lunge', label: 'Lunge' },
    { value: 'deadlift', label: 'Deadlift' }
  ];

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  };

  const analyzePosture = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const imageSrc = captureImage();
      if (!imageSrc) {
        throw new Error('Could not capture image from camera');
      }

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('exercise_type', selectedExercise);
      formData.append('include_pose_overlay', 'true');

      // Send to backend
      const result = await axios.post(`${API_BASE_URL}/analyze-posture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(result.data);
      if (result.data.pose_overlay_image) {
        setPoseOverlay(`data:image/jpeg;base64,${result.data.pose_overlay_image}`);
      } else {
        setPoseOverlay(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startContinuousAnalysis = () => {
    setIsCapturing(true);
    const interval = setInterval(() => {
      if (!isAnalyzing) {
        analyzePosture();
      }
    }, 2000); // Analyze every 2 seconds

    // Store interval ID for cleanup
    webcamRef.current.intervalId = interval;
  };

  const stopContinuousAnalysis = () => {
    setIsCapturing(false);
    if (webcamRef.current?.intervalId) {
      clearInterval(webcamRef.current.intervalId);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Form!';
    if (score >= 0.6) return 'Good Form';
    if (score >= 0.4) return 'Needs Improvement';
    return 'Poor Form';
  };

  return (
    <Container>
      <Header>Form Analyzer</Header>
      <Subtitle>Get real-time feedback on your exercise form. Position yourself in front of your camera and let Kinetiq guide you to perfect technique.</Subtitle>

      <TipBanner>
        <span style={{ fontSize: '1.2rem' }}>💡</span>
        <span><strong>Pro Tip:</strong> For best results, ensure your full body is visible, your space is well-lit, and you're positioned 6-8 feet from the camera.</span>
      </TipBanner>

      <InfoGrid>
        <InfoCard>
          <InfoLabel>Exercise Selected</InfoLabel>
          <InfoValue>{selectedExercise.charAt(0).toUpperCase() + selectedExercise.slice(1)}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Analysis Status</InfoLabel>
          <InfoValue>{isAnalyzing ? 'Processing...' : 'Ready'}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Continuous Mode</InfoLabel>
          <InfoValue>{isCapturing ? 'Active' : 'Off'}</InfoValue>
        </InfoCard>
      </InfoGrid>
      
      <CameraContainer>
        {isCapturing && (
          <OverlayBadge>
            <span />
            LIVE
          </OverlayBadge>
        )}
        <WebcamStyled
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
        />
        {poseOverlay && (
          <PoseOverlayImage
            src={poseOverlay}
            alt="Pose overlay on camera"
          />
        )}
      </CameraContainer>

      <Controls>
        <Select 
          value={selectedExercise} 
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exercises.map(exercise => (
            <option key={exercise.value} value={exercise.value}>
              {exercise.label}
            </option>
          ))}
        </Select>
        
        <Button 
          onClick={analyzePosture} 
          disabled={isAnalyzing}
          aria-label="Analyze current posture"
        >
          {isAnalyzing ? <LoadingSpinner /> : '📸'}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Posture'}
        </Button>
        
        <Button 
          onClick={isCapturing ? stopContinuousAnalysis : startContinuousAnalysis}
          primary={isCapturing}
          aria-label={isCapturing ? "Stop continuous analysis" : "Start continuous analysis"}
        >
          {isCapturing ? '⏸️' : '▶️'}
          {isCapturing ? 'Stop Continuous' : 'Start Continuous'}
        </Button>
      </Controls>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

    {analysisResult && (
        <AnalysisContainer>
          {poseOverlay && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px', color: '#0d1b2a' }}>Detected Pose</h3>
              <img 
                src={poseOverlay} 
                alt="Pose overlay" 
                style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: '0 15px 35px rgba(13,27,42,0.25)' }}
              />
            </div>
          )}

          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Confidence</MetricLabel>
              <MetricValue>{Math.round(analysisResult.confidence * 100)}%</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Form Score</MetricLabel>
              <MetricValue>{Math.round(analysisResult.form_score * 100)}%</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Corrections</MetricLabel>
              <MetricValue>{analysisResult.corrections?.length || 0}</MetricValue>
            </MetricCard>
          </MetricsGrid>
          <ScoreDisplay>
            <ScoreCircle score={analysisResult.form_score}>
              {Math.round(analysisResult.form_score * 100)}%
            </ScoreCircle>
            <StatusText score={analysisResult.form_score}>
              {getScoreText(analysisResult.form_score)}
            </StatusText>
            <p>Analysis Time: {analysisResult.analysis_time_ms}ms</p>
          </ScoreDisplay>

          {analysisResult.corrections && analysisResult.corrections.length > 0 && (
            <div>
              <h3>Form Corrections:</h3>
              <CorrectionsList>
                {analysisResult.corrections.map((correction, index) => (
                  <CorrectionItem key={index}>
                    {correction}
                  </CorrectionItem>
                ))}
              </CorrectionsList>
            </div>
          )}

          {analysisResult.feedback && (
            <FeedbackText>
              <strong>Coach Feedback:</strong><br />
              {analysisResult.feedback}
            </FeedbackText>
          )}

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Exercise:</strong> {analysisResult.exercise_type}</p>
            <p><strong>Confidence:</strong> {Math.round(analysisResult.confidence * 100)}%</p>
            <p><strong>Correct Form:</strong> {analysisResult.is_correct_form ? 'Yes' : 'No'}</p>
          </div>
        </AnalysisContainer>
      )}
    </Container>
  );
};

export default FitnessTrainer;
