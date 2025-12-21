import React, { useState } from 'react';
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
    border-color: #f97362;
    box-shadow: 0 0 0 3px rgba(249,115,98,0.2);
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

const NutritionAdviceContainer = styled.div`
  background: rgba(255,255,255,0.98);
  border-radius: 28px;
  padding: clamp(28px, 4vw, 42px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.4), 0 0 0 1px rgba(0,0,0,0.05);
  width: min(95vw, 760px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
`;

const MealCard = styled.div`
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

const MealTitle = styled.h3`
  color: #1f2937;
  margin: 0 0 18px 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const NutritionItem = styled.div`
  background: white;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  }
`;

const NutritionLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const NutritionValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const FoodList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
`;

const FoodItem = styled.span`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 14px;
  border-radius: 18px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const BenefitsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
`;

const BenefitItem = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 8px 14px;
  border-radius: 18px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const TimingInfo = styled.div`
  background: rgba(25, 118, 210, 0.12);
  padding: 12px;
  border-radius: 12px;
  margin: 10px 0;
  color: #0d3c61;
  font-style: italic;
  border: 1px solid rgba(25,118,210,0.2);
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

const NutritionAdvisor = () => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    fitness_level: 'beginner',
    goals: [],
    dietary_restrictions: []
  });
  const [mealType, setMealType] = useState('general');
  const [nutritionAdvice, setNutritionAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'pre_workout', label: 'Pre-Workout' },
    { value: 'post_workout', label: 'Post-Workout' },
    { value: 'general', label: 'General Nutrition' }
  ];

  const dietaryRestrictions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten_free', label: 'Gluten-Free' },
    { value: 'dairy_free', label: 'Dairy-Free' },
    { value: 'nut_free', label: 'Nut-Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'low_carb', label: 'Low-Carb' },
    { value: 'low_fat', label: 'Low-Fat' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'strength', label: 'Strength' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'general_health', label: 'General Health' }
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

  const handleRestrictionChange = (restriction) => {
    setUserProfile(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const getNutritionAdvice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/nutrition-advice`, {
        user_profile: userProfile,
        dietary_restrictions: userProfile.dietary_restrictions,
        meal_type: mealType
      });

      setNutritionAdvice(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while getting nutrition advice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>Nutrition Guide</Header>
      <Subtitle>Get personalized meal recommendations that align with your fitness goals, dietary preferences, and lifestyle. Fuel your body right with Kinetiq's smart nutrition advisor.</Subtitle>
      
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937', fontSize: '1.8rem', fontWeight: 700 }}>
          Get Personalized Nutrition Advice
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
          <Label>Dietary Restrictions (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            {dietaryRestrictions.map(restriction => (
              <label 
                key={restriction.value} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  background: userProfile.dietary_restrictions.includes(restriction.value) 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' 
                    : 'rgba(0,0,0,0.05)',
                  border: `2px solid ${userProfile.dietary_restrictions.includes(restriction.value) ? 'rgba(102, 126, 234, 0.4)' : 'rgba(0,0,0,0.1)'}`,
                  transition: 'all 0.2s ease',
                  fontWeight: userProfile.dietary_restrictions.includes(restriction.value) ? 600 : 500,
                  color: userProfile.dietary_restrictions.includes(restriction.value) ? '#667eea' : '#4b5563'
                }}
              >
                <input
                  type="checkbox"
                  checked={userProfile.dietary_restrictions.includes(restriction.value)}
                  onChange={() => handleRestrictionChange(restriction.value)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {restriction.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Meal Type</Label>
          <Select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            {mealTypes.map(meal => (
              <option key={meal.value} value={meal.value}>
                {meal.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <Button onClick={getNutritionAdvice} disabled={isLoading} aria-label="Get nutrition advice">
          {isLoading ? <LoadingSpinner /> : '🥗'}
          {isLoading ? 'Getting Advice...' : 'Get Nutrition Advice'}
        </Button>
      </FormContainer>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {nutritionAdvice && (
        <NutritionAdviceContainer>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937', fontSize: '1.8rem', fontWeight: 700 }}>
            Your Personalized Nutrition Advice
          </h2>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}>
            <p><strong>Meal Type:</strong> {nutritionAdvice.meal_type}</p>
          </div>

          {nutritionAdvice.nutrition_advice.map((meal, index) => (
            <MealCard key={index}>
              <MealTitle>{meal.meal_type}</MealTitle>
              
              <NutritionGrid>
                <NutritionItem>
                  <NutritionLabel>Calories</NutritionLabel>
                  <NutritionValue>{meal.calories}</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Protein</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.protein}g</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Carbs</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.carbs}g</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Fat</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.fat}g</NutritionValue>
                </NutritionItem>
              </NutritionGrid>

              <div>
                <strong>Food Items:</strong>
                <FoodList>
                  {meal.food_items.map((food, foodIndex) => (
                    <FoodItem key={foodIndex}>{food}</FoodItem>
                  ))}
                </FoodList>
              </div>

              <TimingInfo>
                <strong>Timing:</strong> {meal.timing}
              </TimingInfo>

              <div>
                <strong>Benefits:</strong>
                <BenefitsList>
                  {meal.benefits.map((benefit, benefitIndex) => (
                    <BenefitItem key={benefitIndex}>{benefit}</BenefitItem>
                  ))}
                </BenefitsList>
              </div>
            </MealCard>
          ))}
        </NutritionAdviceContainer>
      )}
    </Container>
  );
};

export default NutritionAdvisor;
