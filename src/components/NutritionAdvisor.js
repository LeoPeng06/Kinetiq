import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Html5Qrcode } from 'html5-qrcode';
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

const Card = styled.div`
  background: rgba(255,255,255,0.98);
  border-radius: 28px;
  padding: clamp(28px, 4vw, 42px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.4), 0 0 0 1px rgba(0,0,0,0.05);
  width: min(95vw, 900px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const DateButton = styled.button`
  padding: 10px 20px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.9)'};
  color: ${props => props.active ? 'white' : '#333'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const DateInput = styled.input`
  padding: 10px 16px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background: rgba(255,255,255,0.9);
  color: #333;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 2px solid rgba(102, 126, 234, 0.2);
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const StatUnit = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: normal;
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
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
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
  transition: all 0.3s ease;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.5);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FoodList = styled.div`
  margin-top: 30px;
`;

const FoodItem = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const FoodInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FoodName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const FoodMacros = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
`;

const MacroItem = styled.span`
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
`;

const FoodCalories = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  text-align: right;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: scale(1.05);
  }
`;

const ProgressSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid rgba(0,0,0,0.1);
`;

const ProgressTitle = styled.h3`
  color: #1f2937;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const ProgressCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(0,0,0,0.1);
`;

const ProgressDate = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const getDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

const getTodayDate = () => {
  return new Date();
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const FoodTracker = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [foodEntries, setFoodEntries] = useState({});
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('foodTracker');
    if (saved) {
      try {
        setFoodEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading food tracker data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever foodEntries changes
  useEffect(() => {
    localStorage.setItem('foodTracker', JSON.stringify(foodEntries));
  }, [foodEntries]);

  const getCurrentDateKey = () => getDateKey(selectedDate);
  
  const getCurrentDayEntries = () => {
    const dateKey = getCurrentDateKey();
    return foodEntries[dateKey] || [];
  };

  const getCurrentDayTotals = () => {
    const entries = getCurrentDayEntries();
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (parseFloat(entry.calories) || 0),
      protein: totals.protein + (parseFloat(entry.protein) || 0),
      carbs: totals.carbs + (parseFloat(entry.carbs) || 0),
      fat: totals.fat + (parseFloat(entry.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const addFood = () => {
    if (!newFood.name.trim()) return;
    
    const dateKey = getCurrentDateKey();
    const entry = {
      id: Date.now(),
      name: newFood.name,
      calories: parseFloat(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0
    };

    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), entry]
    }));

    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const deleteFood = (id) => {
    const dateKey = getCurrentDateKey();
    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(entry => entry.id !== id)
    }));
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(getTodayDate());
  };

  const getRecentDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getDayTotals = (date) => {
    const dateKey = getDateKey(date);
    const entries = foodEntries[dateKey] || [];
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (parseFloat(entry.calories) || 0)
    }), { calories: 0 });
  };

  const totals = getCurrentDayTotals();
  const recentDays = getRecentDays();
  const dailyGoal = 2000; // Default calorie goal

  return (
    <Container>
      <Header>Food Tracker</Header>
      <Subtitle>Track your daily nutrition and monitor your progress day by day</Subtitle>
      
      <Card>
        <DateSelector>
          <DateButton onClick={() => changeDate(-1)}>← Previous</DateButton>
          <DateInput
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <DateButton onClick={goToToday} active={getDateKey(selectedDate) === getDateKey(getTodayDate())}>
            Today
          </DateButton>
          <DateButton onClick={() => changeDate(1)}>Next →</DateButton>
        </DateSelector>

        <StatsGrid>
          <StatCard>
            <StatLabel>Calories</StatLabel>
            <StatValue>
              {Math.round(totals.calories)}
              <StatUnit> / {dailyGoal} kcal</StatUnit>
            </StatValue>
            <ProgressBar style={{ marginTop: '10px' }}>
              <ProgressFill percentage={(totals.calories / dailyGoal) * 100} />
            </ProgressBar>
          </StatCard>
          <StatCard>
            <StatLabel>Protein</StatLabel>
            <StatValue>
              {Math.round(totals.protein)}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Carbs</StatLabel>
            <StatValue>
              {Math.round(totals.carbs)}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Fat</StatLabel>
            <StatValue>
              {Math.round(totals.fat)}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
        </StatsGrid>

        <FormGroup>
          <Label>Add Food Entry</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <Input
              placeholder="Food name"
              value={newFood.name}
              onChange={(e) => setNewFood({...newFood, name: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
            <Input
              type="number"
              placeholder="Calories"
              value={newFood.calories}
              onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
            <Input
              type="number"
              placeholder="Protein (g)"
              value={newFood.protein}
              onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
            <Input
              type="number"
              placeholder="Carbs (g)"
              value={newFood.carbs}
              onChange={(e) => setNewFood({...newFood, carbs: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
            <Input
              type="number"
              placeholder="Fat (g)"
              value={newFood.fat}
              onChange={(e) => setNewFood({...newFood, fat: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
          </div>
          <Button onClick={addFood}>+ Add Food</Button>
        </FormGroup>

        <FoodList>
          <h3 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '1.3rem' }}>
            {formatDate(selectedDate)} - Food Entries
          </h3>
          {getCurrentDayEntries().length === 0 ? (
            <EmptyState>
              <p>No food entries for this day. Add your first meal above!</p>
            </EmptyState>
          ) : (
            getCurrentDayEntries().map(entry => (
              <FoodItem key={entry.id}>
                <FoodInfo>
                  <FoodName>{entry.name}</FoodName>
                  <FoodMacros>
                    <MacroItem>P: {Math.round(entry.protein)}g</MacroItem>
                    <MacroItem>C: {Math.round(entry.carbs)}g</MacroItem>
                    <MacroItem>F: {Math.round(entry.fat)}g</MacroItem>
                  </FoodMacros>
                </FoodInfo>
                <FoodCalories>{Math.round(entry.calories)} kcal</FoodCalories>
                <DeleteButton onClick={() => deleteFood(entry.id)}>Delete</DeleteButton>
              </FoodItem>
            ))
          )}
        </FoodList>

        <ProgressSection>
          <ProgressTitle>7-Day Progress</ProgressTitle>
          <ProgressGrid>
            {recentDays.map(date => {
              const dayTotals = getDayTotals(date);
              const isToday = getDateKey(date) === getDateKey(getTodayDate());
              const isSelected = getDateKey(date) === getCurrentDateKey();
              
              return (
                <ProgressCard 
                  key={getDateKey(date)}
                  style={{ 
                    border: isSelected ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  <ProgressDate>{formatDate(date)} {isToday && '(Today)'}</ProgressDate>
                  <StatValue style={{ fontSize: '20px' }}>
                    {Math.round(dayTotals.calories)} <StatUnit>kcal</StatUnit>
                  </StatValue>
                  <ProgressBar>
                    <ProgressFill percentage={(dayTotals.calories / dailyGoal) * 100} />
                  </ProgressBar>
                </ProgressCard>
              );
            })}
          </ProgressGrid>
        </ProgressSection>
      </Card>
    </Container>
  );
};

export default FoodTracker;
