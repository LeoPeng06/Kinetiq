import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(16px, 2vw, 32px);
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  color: white;
`;

const Header = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 12px;
  font-size: clamp(2rem, 4vw, 3rem);
  text-shadow: 0 10px 25px rgba(0,0,0,0.4);
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.9);
  text-align: center;
  margin-bottom: clamp(20px, 3vw, 36px);
  font-size: clamp(1rem, 1.7vw, 1.2rem);
  max-width: 640px;
  line-height: 1.6;
`;

const FormContainer = styled.div`
  background: rgba(255,255,255,0.98);
  border-radius: 28px;
  padding: clamp(28px, 4vw, 42px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.4), 0 0 0 1px rgba(0,0,0,0.05);
  width: min(90vw, 680px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: 14px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(255,255,255,0.9);
  transition: all 0.3s ease;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
    background: white;
  }

  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: 14px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(255,255,255,0.9);
  transition: all 0.3s ease;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
    background-color: white;
  }

  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  background: rgba(17,24,39,0.03);

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 3px rgba(78,205,196,0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.02em;

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: 3px solid rgba(102, 126, 234, 0.4);
    outline-offset: 2px;
  }
`;

const WorkoutPlanContainer = styled.div`
  background: rgba(255,255,255,0.98);
  border-radius: 28px;
  padding: clamp(28px, 4vw, 42px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.4), 0 0 0 1px rgba(0,0,0,0.05);
  width: min(95vw, 760px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
`;

const ExerciseCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
  border-radius: 20px;
  padding: 24px;
  margin: 18px 0;
  border: 2px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(102, 126, 234, 0.25);
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const ExerciseTitle = styled.h3`
  color: #1f2937;
  margin: 0 0 16px 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
  margin: 10px 0;
`;

const DetailItem = styled.div`
  background: white;
  padding: 10px 12px;
  border-radius: 10px;
  text-align: center;
  font-size: 0.95rem;
  border: 1px solid rgba(0,0,0,0.05);
`;

const Instructions = styled.p`
  background: rgba(25, 118, 210, 0.12);
  padding: 14px;
  border-radius: 12px;
  margin: 12px 0;
  font-style: italic;
  color: #0d3c61;
  border: 1px solid rgba(25,118,210,0.15);
`;

const MusclesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const MuscleTag = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 0.85rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
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
  background: rgba(244, 67, 54, 0.12);
  color: #b71c1c;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(244, 67, 54, 0.25);
`;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const WorkoutPlanner = () => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    fitness_level: 'beginner',
    goals: [],
    available_equipment: ['bodyweight'],
    workout_duration: 30
  });
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'strength', label: 'Strength' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'general_fitness', label: 'General Fitness' }
  ];

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = (goal) => {
    setUserProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setUserProfile(prev => ({
      ...prev,
      available_equipment: prev.available_equipment.includes(equipment)
        ? prev.available_equipment.filter(e => e !== equipment)
        : [...prev.available_equipment, equipment]
    }));
  };

  const generateWorkoutPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/workout-plan`, {
        user_profile: userProfile,
        goals: userProfile.goals,
        available_equipment: userProfile.available_equipment,
        workout_duration: userProfile.workout_duration
      });

      setWorkoutPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while generating workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>Workout Builder</Header>
      <Subtitle>Tell us about your fitness goals, available equipment, and time constraints. We'll create a personalized workout plan designed just for you.</Subtitle>
      
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937', fontSize: '1.8rem', fontWeight: 700 }}>
          Create Your Profile
        </h2>
        
        <FormGroup>
          <Label>Age</Label>
          <Input
            type="number"
            value={userProfile.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter your age"
          />
        </FormGroup>

        <FormGroup>
          <Label>Fitness Level</Label>
          <Select
            value={userProfile.fitness_level}
            onChange={(e) => handleInputChange('fitness_level', e.target.value)}
          >
            {fitnessLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Goals (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            {goalOptions.map(goal => (
              <label 
                key={goal.value} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  background: userProfile.goals.includes(goal.value) 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' 
                    : 'rgba(0,0,0,0.05)',
                  border: `2px solid ${userProfile.goals.includes(goal.value) ? 'rgba(102, 126, 234, 0.4)' : 'rgba(0,0,0,0.1)'}`,
                  transition: 'all 0.2s ease',
                  fontWeight: userProfile.goals.includes(goal.value) ? 600 : 500,
                  color: userProfile.goals.includes(goal.value) ? '#667eea' : '#4b5563'
                }}
              >
                <input
                  type="checkbox"
                  checked={userProfile.goals.includes(goal.value)}
                  onChange={() => handleGoalChange(goal.value)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {goal.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Available Equipment (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            {equipmentOptions.map(equipment => (
              <label 
                key={equipment.value} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  background: userProfile.available_equipment.includes(equipment.value) 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' 
                    : 'rgba(0,0,0,0.05)',
                  border: `2px solid ${userProfile.available_equipment.includes(equipment.value) ? 'rgba(102, 126, 234, 0.4)' : 'rgba(0,0,0,0.1)'}`,
                  transition: 'all 0.2s ease',
                  fontWeight: userProfile.available_equipment.includes(equipment.value) ? 600 : 500,
                  color: userProfile.available_equipment.includes(equipment.value) ? '#667eea' : '#4b5563'
                }}
              >
                <input
                  type="checkbox"
                  checked={userProfile.available_equipment.includes(equipment.value)}
                  onChange={() => handleEquipmentChange(equipment.value)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {equipment.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Workout Duration (minutes)</Label>
          <Input
            type="number"
            value={userProfile.workout_duration}
            onChange={(e) => handleInputChange('workout_duration', parseInt(e.target.value))}
            min="10"
            max="120"
          />
        </FormGroup>

        <Button onClick={generateWorkoutPlan} disabled={isLoading} aria-label="Generate workout plan">
          {isLoading ? <LoadingSpinner /> : '💪'}
          {isLoading ? 'Generating Plan...' : 'Generate Workout Plan'}
        </Button>
      </FormContainer>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {workoutPlan && (
        <WorkoutPlanContainer>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937', fontSize: '1.8rem', fontWeight: 700 }}>
            Your Personalized Workout Plan
          </h2>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}>
            <p><strong>Total Exercises:</strong> {workoutPlan.total_exercises}</p>
            <p><strong>Estimated Duration:</strong> {workoutPlan.estimated_duration} minutes</p>
          </div>

          {workoutPlan.workout_plans.map((exercise, index) => (
            <ExerciseCard key={index}>
              <ExerciseTitle>{exercise.exercise_name}</ExerciseTitle>
              
              <ExerciseDetails>
                <DetailItem>
                  <strong>Sets:</strong> {exercise.sets}
                </DetailItem>
                <DetailItem>
                  <strong>Reps:</strong> {exercise.reps}
                </DetailItem>
                {exercise.duration && (
                  <DetailItem>
                    <strong>Duration:</strong> {exercise.duration}s
                  </DetailItem>
                )}
                <DetailItem>
                  <strong>Difficulty:</strong> {exercise.difficulty}
                </DetailItem>
              </ExerciseDetails>

              <Instructions>
                <strong>Instructions:</strong> {exercise.instructions}
              </Instructions>

              <div>
                <strong>Target Muscles:</strong>
                <MusclesList>
                  {exercise.target_muscles.map((muscle, muscleIndex) => (
                    <MuscleTag key={muscleIndex}>{muscle}</MuscleTag>
                  ))}
                </MusclesList>
              </div>
            </ExerciseCard>
          ))}
        </WorkoutPlanContainer>
      )}
    </Container>
  );
};

export default WorkoutPlanner;
