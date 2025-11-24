import json
from typing import Dict, List, Optional
from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class WorkoutPlan:
    exercise_name: str
    sets: int
    reps: int
    duration: Optional[int]  # For time-based exercises
    difficulty: str
    instructions: str
    target_muscles: List[str]

@dataclass
class NutritionAdvice:
    meal_type: str
    food_items: List[str]
    calories: int
    macronutrients: Dict[str, float]
    timing: str
    benefits: List[str]

class VirtualCoachAdvisor:
    """Virtual fitness and nutrition advisor (API/LLM-integrated)"""
    
    def __init__(self):
        # Initialize generic API client (set OPENAI_API_KEY in .env)
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your-api-key-here":
            # Replace with generic client setup if applicable
            self.client = None  # TODO: Add client initialization
            self.has_api_key = True
        else:
            self.client = None
            self.has_api_key = False
            print("⚠️  OPENAI_API_KEY not set. Using fallback responses.")
        self.exercise_database = {
            'squat': {
                'muscles': ['quadriceps', 'glutes', 'hamstrings', 'core'],
                'difficulty': 'beginner',
                'equipment': 'bodyweight',
                'benefits': ['strength', 'mobility', 'functional movement']
            },
            'pushup': {
                'muscles': ['chest', 'shoulders', 'triceps', 'core'],
                'difficulty': 'beginner',
                'equipment': 'bodyweight',
                'benefits': ['upper body strength', 'core stability']
            },
            'plank': {
                'muscles': ['core', 'shoulders', 'glutes'],
                'difficulty': 'beginner',
                'equipment': 'bodyweight',
                'benefits': ['core strength', 'stability', 'endurance']
            },
            'lunge': {
                'muscles': ['quadriceps', 'glutes', 'hamstrings', 'calves'],
                'difficulty': 'beginner',
                'equipment': 'bodyweight',
                'benefits': ['leg strength', 'balance', 'mobility']
            },
            'deadlift': {
                'muscles': ['hamstrings', 'glutes', 'lower back', 'traps'],
                'difficulty': 'intermediate',
                'equipment': 'barbell',
                'benefits': ['posterior chain strength', 'functional movement']
            }
        }

    def generate_workout_plan(self, 
                              user_profile: Dict[str, any], 
                              goals: List[str],
                              available_equipment: List[str] = None,
                              workout_duration: int = 30) -> List[WorkoutPlan]:
        """Generate personalized workout plan based on user profile and goals"""
        if available_equipment is None:
            available_equipment = ['bodyweight']
        if not self.has_api_key:
            return self._get_default_workout_plan(user_profile.get('fitness_level', 'beginner'))
        # Integrate with external API/service here if available
        return self._get_default_workout_plan(user_profile.get('fitness_level', 'beginner'))

    def generate_nutrition_advice(self, 
                                  user_profile: Dict[str, any],
                                  dietary_restrictions: List[str] = None,
                                  meal_type: str = 'general') -> List[NutritionAdvice]:
        """Generate personalized nutrition advice"""
        if dietary_restrictions is None:
            dietary_restrictions = []
        if not self.has_api_key:
            return self._get_default_nutrition_advice(meal_type)
        # Integrate with external API/service here if available
        return self._get_default_nutrition_advice(meal_type)

    def analyze_form_feedback(self, exercise_type: str, form_score: float, corrections: List[str]) -> str:
        """Generate motivational and educational feedback based on form analysis"""
        if not self.has_api_key:
            return self._get_default_form_feedback(form_score, corrections)
        # Integrate with external API/service here if available
        return self._get_default_form_feedback(form_score, corrections)

    def _get_default_workout_plan(self, fitness_level: str) -> List[WorkoutPlan]:
        """Fallback workout plan when external service is unavailable"""
        if fitness_level == 'beginner':
            return [
                WorkoutPlan(
                    exercise_name="Bodyweight Squats",
                    sets=3,
                    reps=10,
                    duration=None,
                    difficulty="beginner",
                    instructions="Stand with feet shoulder-width apart, lower down as if sitting in a chair, then return to standing.",
                    target_muscles=["quadriceps", "glutes", "hamstrings"]
                ),
                WorkoutPlan(
                    exercise_name="Push-ups",
                    sets=3,
                    reps=8,
                    duration=None,
                    difficulty="beginner",
                    instructions="Start in plank position, lower chest to ground, push back up.",
                    target_muscles=["chest", "shoulders", "triceps"]
                ),
                WorkoutPlan(
                    exercise_name="Plank",
                    sets=3,
                    reps=1,
                    duration=30,
                    difficulty="beginner",
                    instructions="Hold plank position, keeping body straight from head to heels.",
                    target_muscles=["core", "shoulders"]
                )
            ]
        else:
            return [
                WorkoutPlan(
                    exercise_name="Jump Squats",
                    sets=4,
                    reps=12,
                    duration=None,
                    difficulty="intermediate",
                    instructions="Perform squats with explosive jump at the top.",
                    target_muscles=["quadriceps", "glutes", "calves"]
                ),
                WorkoutPlan(
                    exercise_name="Diamond Push-ups",
                    sets=4,
                    reps=10,
                    duration=None,
                    difficulty="intermediate",
                    instructions="Push-ups with hands in diamond shape under chest.",
                    target_muscles=["chest", "triceps", "shoulders"]
                ),
                WorkoutPlan(
                    exercise_name="Mountain Climbers",
                    sets=4,
                    reps=20,
                    duration=None,
                    difficulty="intermediate",
                    instructions="Alternate bringing knees to chest in plank position.",
                    target_muscles=["core", "shoulders", "legs"]
                )
            ]

    def _get_default_nutrition_advice(self, meal_type: str) -> List[NutritionAdvice]:
        """Fallback nutrition advice when external service is unavailable"""
        if meal_type == 'breakfast':
            return [
                NutritionAdvice(
                    meal_type="breakfast",
                    food_items=["oatmeal", "banana", "almonds", "greek yogurt"],
                    calories=400,
                    macronutrients={"protein": 25, "carbs": 45, "fat": 15},
                    timing="Within 1 hour of waking",
                    benefits=["sustained energy", "muscle recovery", "fiber intake"]
                )
            ]
        elif meal_type == 'post_workout':
            return [
                NutritionAdvice(
                    meal_type="post_workout",
                    food_items=["protein shake", "banana", "almond butter"],
                    calories=350,
                    macronutrients={"protein": 30, "carbs": 35, "fat": 12},
                    timing="Within 30 minutes of workout",
                    benefits=["muscle recovery", "glycogen replenishment", "protein synthesis"]
                )
            ]
        else:
            return [
                NutritionAdvice(
                    meal_type="general",
                    food_items=["grilled chicken", "quinoa", "mixed vegetables"],
                    calories=500,
                    macronutrients={"protein": 35, "carbs": 40, "fat": 20},
                    timing="Main meal",
                    benefits=["balanced nutrition", "muscle maintenance", "vitamin intake"]
                )
            ]

    def _get_default_form_feedback(self, form_score: float, corrections: List[str]) -> str:
        """Fallback form feedback when external service is unavailable"""
        if form_score > 0.8:
            return "Excellent form! You're performing the exercise with great technique. Keep up the good work!"
        elif form_score > 0.6:
            return "Good form overall! Focus on the suggested corrections to perfect your technique."
        else:
            return "Let's work on improving your form. Focus on the corrections provided and practice slowly to build muscle memory."
