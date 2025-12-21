import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import FitnessTrainer from './components/FitnessTrainer';
import WorkoutPlanner from './components/WorkoutPlanner';
import NutritionAdvisor from './components/NutritionAdvisor';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(255, 255, 255, 0.15), transparent 40%),
                radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.25), transparent 45%),
                linear-gradient(135deg, #0f1021 0%, #342160 60%, #120c2b 100%);
    font-family: 'Arial', sans-serif;
    color: white;
    background-attachment: fixed;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.15), transparent 35%);
    pointer-events: none;
  }

  #root {
    min-height: 100vh;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: clamp(20px, 4vw, 50px);
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.h1`
  color: white;
  margin: 0 0 12px 0;
  font-size: clamp(2.5rem, 5vw, 3.8rem);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.35);
`;

const Subtitle = styled.p`
  color: white;
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  margin: 0 0 clamp(20px, 2.5vw, 36px) 0;
  opacity: 0.95;
  line-height: 1.6;
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(20px, 3vw, 40px);
  align-items: center;
  margin-bottom: clamp(30px, 4vw, 60px);
`;

const HeroCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  padding: clamp(20px, 3vw, 40px);
  border-radius: 20px;
  box-shadow: 0 25px 45px rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(16px);
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeroButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 14px 22px;
  border: none;
  border-radius: 32px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  background: ${props => props.primary ? 'linear-gradient(135deg, #ff6b6b, #f94d6a)' : 'rgba(255,255,255,0.18)'};
  border: 2px solid ${props => props.primary ? 'transparent' : 'rgba(255,255,255,0.3)'};
  box-shadow: 0 14px 28px rgba(0,0,0,0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 32px rgba(0,0,0,0.3);
  }
`;

const Navigation = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
`;

const NavButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid ${props => props.active ? '#ff6b6b' : 'transparent'};

  &:hover {
    background: ${props => props.active ? '#ff5252' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
  }
`;

const MainStage = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: clamp(40px, 5vw, 80px);
`;

const FrostedPanel = styled.div`
  width: min(1300px, 95vw);
  background: rgba(15, 16, 33, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 40px;
  padding: clamp(24px, 4vw, 48px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(26px);
`;

const ContentContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 32px);
`;

const BackgroundOrbs = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    mix-blend-mode: screen;
  }

  .orb-one {
    width: 320px;
    height: 320px;
    background: rgba(78, 205, 196, 0.4);
    top: 10%;
    left: 10%;
  }

  .orb-two {
    width: 260px;
    height: 260px;
    background: rgba(255, 107, 107, 0.35);
    bottom: 15%;
    right: 12%;
  }

  .orb-three {
    width: 220px;
    height: 220px;
    background: rgba(255, 255, 255, 0.15);
    bottom: 5%;
    left: 25%;
  }
`;

const TopNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: clamp(16px, 2vw, 28px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: clamp(24px, 3vw, 40px);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);

  span {
    display: inline-flex;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    justify-content: center;
    align-items: center;
    font-size: 1.3rem;
    font-weight: 800;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transform: rotate(-5deg);
    transition: transform 0.3s ease;
  }

  &:hover span {
    transform: rotate(0deg) scale(1.05);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: clamp(10px, 1.6vw, 18px);
  flex-wrap: wrap;
  align-items: center;
`;

const NavLinkButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(16px, 2vw, 28px);
  margin-bottom: clamp(24px, 3vw, 40px);
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: clamp(20px, 2.5vw, 28px);
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 18px 30px rgba(0,0,0,0.25);
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  color: white;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const FeatureDescription = styled.p`
  color: white;
  opacity: 0.9;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 18px;
  padding: clamp(24px, 3vw, 36px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: clamp(24px, 3vw, 42px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;
const QuickStartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(16px, 2vw, 28px);
  margin-bottom: clamp(30px, 4vw, 50px);
`;

const QuickStartCard = styled.div`
  background: rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: clamp(18px, 2.5vw, 26px);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 16px 34px rgba(0,0,0,0.28);
`;

const QuickStartTitle = styled.h4`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #fff;
`;

const QuickStartList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  font-size: 0.95rem;
`;


const StatsTitle = styled.h2`
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4ecdc4;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'trainer':
        return <FitnessTrainer />;
      case 'workout':
        return <WorkoutPlanner />;
      case 'nutrition':
        return <NutritionAdvisor />;
      default:
        return (
          <Container>
            <TopNav>
              <Logo>
                <span>K</span>
                Kinetiq
              </Logo>
              <NavLinks>
                <NavLinkButton onClick={() => setActiveTab('trainer')}>Trainer</NavLinkButton>
                <NavLinkButton onClick={() => setActiveTab('workout')}>Workout</NavLinkButton>
                <NavLinkButton onClick={() => setActiveTab('nutrition')}>Nutrition</NavLinkButton>
                <HeroButton primary onClick={() => setActiveTab('trainer')}>
                  Get Started
                </HeroButton>
              </NavLinks>
            </TopNav>
            <Hero>
              <HeroCard>
                <Header>Kinetiq</Header>
                <Subtitle>
                  Your AI-powered fitness companion. Real-time form analysis, personalized workouts,
                  and smart nutrition guidance—all in one modern platform designed to elevate your training.
                </Subtitle>
                <HeroActions>
                  <HeroButton primary onClick={() => setActiveTab('trainer')}>
                    Start Training
                  </HeroButton>
                  <HeroButton onClick={() => setActiveTab('workout')}>
                    Plan Workouts
                  </HeroButton>
                </HeroActions>
              </HeroCard>
              <HeroCard>
                <StatsTitle>Your Progress Snapshot</StatsTitle>
                <StatsGrid>
                  <StatItem>
                    <StatNumber>+38%</StatNumber>
                    <StatLabel>Avg. Form Improvement</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>12</StatNumber>
                    <StatLabel>Week Guided Program</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>5</StatNumber>
                    <StatLabel>Daily Habits Tracked</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>24/7</StatNumber>
                    <StatLabel>Coach Availability</StatLabel>
                  </StatItem>
                </StatsGrid>
              </HeroCard>
            </Hero>

            <QuickStartGrid>
              <QuickStartCard>
                <QuickStartTitle>🎥 Form Analyzer</QuickStartTitle>
                <QuickStartList>
                  <li>Enable camera permissions and select your exercise</li>
                  <li>View real-time pose detection with visual feedback</li>
                  <li>Get instant form corrections and improvement tips</li>
                </QuickStartList>
              </QuickStartCard>
              <QuickStartCard>
                <QuickStartTitle>📋 Workout Builder</QuickStartTitle>
                <QuickStartList>
                  <li>Set your fitness level, goals, and available equipment</li>
                  <li>Receive AI-generated workout plans in seconds</li>
                  <li>Track your progress and adjust difficulty over time</li>
                </QuickStartList>
              </QuickStartCard>
              <QuickStartCard>
                <QuickStartTitle>🍎 Nutrition Guide</QuickStartTitle>
                <QuickStartList>
                  <li>Share your dietary preferences and fitness goals</li>
                  <li>Get personalized meal recommendations with macros</li>
                  <li>Save favorite meals and build your nutrition library</li>
                </QuickStartList>
              </QuickStartCard>
            </QuickStartGrid>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>Real-Time Form Analysis</FeatureTitle>
                <FeatureDescription>
                  Advanced computer vision technology provides instant feedback on your exercise form.
                  Get personalized corrections and tips to perfect every movement.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>💪</FeatureIcon>
                <FeatureTitle>Personalized Workouts</FeatureTitle>
                <FeatureDescription>
                  AI-generated workout plans tailored to your fitness level, goals, and available equipment.
                  Every session is optimized for maximum results.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🥗</FeatureIcon>
                <FeatureTitle>Smart Nutrition</FeatureTitle>
                <FeatureDescription>
                  Meal plans and nutrition advice aligned with your fitness goals.
                  Track macros, discover new recipes, and fuel your body right.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <StatsContainer>
              <StatsTitle>Community Wins</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatNumber>42K</StatNumber>
                  <StatLabel>Workouts Logged</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>18K</StatNumber>
                  <StatLabel>Healthy Meals Planned</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>87%</StatNumber>
                  <StatLabel>Users Hitting Weekly Goals</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>4.8★</StatNumber>
                  <StatLabel>Average Satisfaction</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsContainer>

            <Navigation>
              <NavButton 
                active={activeTab === 'trainer'} 
                onClick={() => setActiveTab('trainer')}
              >
                Start Training
              </NavButton>
              <NavButton 
                active={activeTab === 'workout'} 
                onClick={() => setActiveTab('workout')}
              >
                Workout Planner
              </NavButton>
              <NavButton 
                active={activeTab === 'nutrition'} 
                onClick={() => setActiveTab('nutrition')}
              >
                Nutrition Advisor
              </NavButton>
            </Navigation>
          </Container>
        );
    }
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundOrbs>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
      </BackgroundOrbs>
      {activeTab !== 'home' && (
        <Navigation style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, background: 'rgba(15, 16, 33, 0.85)', padding: '12px 16px', borderRadius: '20px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <NavButton 
            active={activeTab === 'trainer'} 
            onClick={() => setActiveTab('trainer')}
            aria-label="Fitness Trainer"
          >
            🎯 Trainer
          </NavButton>
          <NavButton 
            active={activeTab === 'workout'} 
            onClick={() => setActiveTab('workout')}
            aria-label="Workout Planner"
          >
            💪 Workout
          </NavButton>
          <NavButton 
            active={activeTab === 'nutrition'} 
            onClick={() => setActiveTab('nutrition')}
            aria-label="Nutrition Advisor"
          >
            🥗 Nutrition
          </NavButton>
          <NavButton 
            onClick={() => setActiveTab('home')}
            aria-label="Home"
          >
            🏠 Home
          </NavButton>
        </Navigation>
      )}
      
      <MainStage>
        <FrostedPanel>
          <ContentContainer>
            {renderContent()}
          </ContentContainer>
        </FrostedPanel>
      </MainStage>
    </>
  );
};

export default App;
