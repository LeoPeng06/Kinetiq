from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import io
import json
from typing import Dict, List, Optional
import time
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.posture_analyzer import PostureAnalyzer, PostureAnalysis
from services.llm_advisor import VirtualCoachAdvisor, WorkoutPlan, NutritionAdvice

app = FastAPI(title="Virtual Fitness Trainer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
posture_analyzer = PostureAnalyzer()
coach_advisor = VirtualCoachAdvisor()

@app.get("/")
async def root():
    return {"message": "Virtual Fitness Trainer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/analyze-posture")
async def analyze_posture(
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    """
    Analyze exercise posture from uploaded image/video
    """
    try:
        # Validate exercise type
        valid_exercises = ['squat', 'pushup', 'plank', 'lunge', 'deadlift']
        if exercise_type not in valid_exercises:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid exercise type. Must be one of: {valid_exercises}"
            )
        
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = np.array(image)
        
        # Convert PIL image to OpenCV format
        if len(image_array.shape) == 3:
            image_cv = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        else:
            image_cv = image_array
        
        # Analyze posture
        start_time = time.time()
        analysis = posture_analyzer.analyze_exercise_form(image_cv, exercise_type)
        analysis_time = time.time() - start_time
        
        # Generate LLM feedback
        feedback = coach_advisor.analyze_form_feedback(
            exercise_type, 
            analysis.form_score, 
            analysis.corrections
        )
        
        # Prepare response
        response = {
            "exercise_type": analysis.exercise_type,
            "confidence": analysis.confidence,
            "form_score": analysis.form_score,
            "is_correct_form": analysis.is_correct_form,
            "corrections": analysis.corrections,
            "key_points": analysis.key_points,
            "feedback": feedback,
            "analysis_time_ms": round(analysis_time * 1000, 2),
            "timestamp": time.time()
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing posture: {str(e)}")

@app.post("/workout-plan")
async def generate_workout_plan(request: Dict):
    """
    Generate personalized workout plan
    """
    try:
        user_profile = request.get("user_profile", {})
        goals = request.get("goals", ["general fitness"])
        available_equipment = request.get("available_equipment", ["bodyweight"])
        workout_duration = request.get("workout_duration", 30)
        
        # Generate workout plan
        workout_plans = coach_advisor.generate_workout_plan(
            user_profile=user_profile,
            goals=goals,
            available_equipment=available_equipment,
            workout_duration=workout_duration
        )
        
        # Convert to JSON-serializable format
        plans_data = []
        for plan in workout_plans:
            plans_data.append({
                "exercise_name": plan.exercise_name,
                "sets": plan.sets,
                "reps": plan.reps,
                "duration": plan.duration,
                "difficulty": plan.difficulty,
                "instructions": plan.instructions,
                "target_muscles": plan.target_muscles
            })
        
        return JSONResponse(content={
            "workout_plans": plans_data,
            "total_exercises": len(plans_data),
            "estimated_duration": workout_duration,
            "timestamp": time.time()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating workout plan: {str(e)}")

@app.post("/nutrition-advice")
async def get_nutrition_advice(request: Dict):
    """
    Get personalized nutrition advice
    """
    try:
        user_profile = request.get("user_profile", {})
        dietary_restrictions = request.get("dietary_restrictions", [])
        meal_type = request.get("meal_type", "general")
        
        # Generate nutrition advice
        nutrition_advice = coach_advisor.generate_nutrition_advice(
            user_profile=user_profile,
            dietary_restrictions=dietary_restrictions,
            meal_type=meal_type
        )
        
        # Convert to JSON-serializable format
        advice_data = []
        for advice in nutrition_advice:
            advice_data.append({
                "meal_type": advice.meal_type,
                "food_items": advice.food_items,
                "calories": advice.calories,
                "macronutrients": advice.macronutrients,
                "timing": advice.timing,
                "benefits": advice.benefits
            })
        
        return JSONResponse(content={
            "nutrition_advice": advice_data,
            "meal_type": meal_type,
            "timestamp": time.time()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating nutrition advice: {str(e)}")

@app.get("/exercise-library")
async def get_exercise_library():
    """
    Get available exercises and their details
    """
    try:
        exercise_library = {
            "squat": {
                "name": "Squat",
                "muscles": ["quadriceps", "glutes", "hamstrings", "core"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Lower body strength exercise targeting legs and glutes",
                "benefits": ["strength", "mobility", "functional movement"]
            },
            "pushup": {
                "name": "Push-up",
                "muscles": ["chest", "shoulders", "triceps", "core"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Upper body strength exercise targeting chest and arms",
                "benefits": ["upper body strength", "core stability"]
            },
            "plank": {
                "name": "Plank",
                "muscles": ["core", "shoulders", "glutes"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Isometric core strengthening exercise",
                "benefits": ["core strength", "stability", "endurance"]
            },
            "lunge": {
                "name": "Lunge",
                "muscles": ["quadriceps", "glutes", "hamstrings", "calves"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Single-leg strength exercise for legs and glutes",
                "benefits": ["leg strength", "balance", "mobility"]
            },
            "deadlift": {
                "name": "Deadlift",
                "muscles": ["hamstrings", "glutes", "lower back", "traps"],
                "difficulty": "intermediate",
                "equipment": "barbell",
                "description": "Hip-hinge movement for posterior chain strength",
                "benefits": ["posterior chain strength", "functional movement"]
            }
        }
        
        return JSONResponse(content={
            "exercises": exercise_library,
            "total_exercises": len(exercise_library),
            "timestamp": time.time()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exercise library: {str(e)}")

@app.post("/analyze-video")
async def analyze_video(
    file: UploadFile = File(...),
    exercise_type: str = Form("squat"),
    frame_interval: int = Form(5)
):
    """
    Analyze exercise posture from uploaded video (analyzes every nth frame)
    """
    try:
        # Validate exercise type
        valid_exercises = ['squat', 'pushup', 'plank', 'lunge', 'deadlift']
        if exercise_type not in valid_exercises:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid exercise type. Must be one of: {valid_exercises}"
            )
        
        # Read video file
        contents = await file.read()
        
        # Save temporary video file
        temp_video_path = f"temp_video_{int(time.time())}.mp4"
        with open(temp_video_path, "wb") as f:
            f.write(contents)
        
        # Open video with OpenCV
        cap = cv2.VideoCapture(temp_video_path)
        
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")
        
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        analyses = []
        frame_number = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Analyze every nth frame
            if frame_number % frame_interval == 0:
                analysis = posture_analyzer.analyze_exercise_form(frame, exercise_type)
                analyses.append({
                    "frame_number": frame_number,
                    "timestamp": frame_number / fps,
                    "form_score": analysis.form_score,
                    "is_correct_form": analysis.is_correct_form,
                    "corrections": analysis.corrections
                })
            
            frame_number += 1
        
        cap.release()
        
        # Clean up temporary file
        import os
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        
        # Calculate overall performance
        if analyses:
            avg_form_score = sum(a["form_score"] for a in analyses) / len(analyses)
            correct_form_percentage = sum(1 for a in analyses if a["is_correct_form"]) / len(analyses) * 100
            
            # Generate overall feedback
            overall_feedback = coach_advisor.analyze_form_feedback(
                exercise_type, 
                avg_form_score, 
                []  # No specific corrections for overall analysis
            )
        else:
            avg_form_score = 0
            correct_form_percentage = 0
            overall_feedback = "No frames could be analyzed from the video."
        
        return JSONResponse(content={
            "exercise_type": exercise_type,
            "total_frames_analyzed": len(analyses),
            "total_frames": frame_count,
            "average_form_score": avg_form_score,
            "correct_form_percentage": correct_form_percentage,
            "frame_analyses": analyses,
            "overall_feedback": overall_feedback,
            "video_duration": frame_count / fps if fps > 0 else 0,
            "timestamp": time.time()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
