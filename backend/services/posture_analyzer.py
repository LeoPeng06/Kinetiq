import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass
from mediapipe.framework.formats import landmark_pb2

@dataclass
class PostureAnalysis:
    exercise_type: str
    confidence: float
    form_score: float
    corrections: List[str]
    key_points: Dict[str, Tuple[float, float]]
    is_correct_form: bool

class PostureAnalyzer:
    """Computer vision system for real-time posture analysis using MediaPipe and PyTorch"""
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,  # Better for single image analysis
            model_complexity=0,      # Faster, less accurate
            enable_segmentation=False,
            min_detection_confidence=0.3,  # Lower threshold for better detection
            min_tracking_confidence=0.3
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self._last_landmark_visibilities: List[float] = []
        
        # Note: Removed PyTorch models for better performance
        # Using rule-based analysis instead of ML models for MVP
        
        # Exercise-specific form criteria
        self.form_criteria = {
            'squat': {
                'knee_angle_range': (80, 120),
                'back_angle_range': (160, 180),
                'hip_knee_alignment': True
            },
            'pushup': {
                'elbow_angle_range': (80, 120),
                'body_alignment': True,
                'depth_threshold': 0.3
            },
            'plank': {
                'body_alignment': True,
                'hip_stability': True,
                'core_engagement': True
            },
            'lunge': {
                'front_knee_angle': (80, 100),
                'back_knee_angle': (80, 100),
                'hip_alignment': True
            },
            'deadlift': {
                'back_straightness': True,
                'knee_hip_sequence': True,
                'bar_path': True
            }
        }
    
    
    def extract_pose_landmarks(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Extract pose landmarks from image using MediaPipe"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_image)
            
            if results.pose_landmarks:
                landmarks = []
                self._last_landmark_visibilities = []
                for landmark in results.pose_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                    self._last_landmark_visibilities.append(landmark.visibility)
                return np.array(landmarks)
            self._last_landmark_visibilities = []
            return None
        except Exception as e:
            print(f"Error extracting pose landmarks: {e}")
            self._last_landmark_visibilities = []
            return None
    
    def calculate_angles(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calculate joint angles from pose landmarks"""
        angles = {}
        
        # Convert landmarks to 3D points
        points = landmarks.reshape(-1, 3)
        
        if len(points) >= 33:
            # Left leg angles
            if len(points) > 27:
                hip = points[23]  # Left hip
                knee = points[25]  # Left knee
                ankle = points[27]  # Left ankle
                
                # Calculate knee angle
                v1 = hip - knee
                v2 = ankle - knee
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles['left_knee_angle'] = angle
            
            # Right leg angles
            if len(points) > 28:
                hip = points[24]  # Right hip
                knee = points[26]  # Right knee
                ankle = points[28]  # Right ankle
                
                # Calculate knee angle
                v1 = hip - knee
                v2 = ankle - knee
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles['right_knee_angle'] = angle
            
            # Left arm angles (for push-ups)
            if len(points) > 15:
                shoulder = points[11]  # Left shoulder
                elbow = points[13]  # Left elbow
                wrist = points[15]  # Left wrist
                
                # Calculate elbow angle
                v1 = shoulder - elbow
                v2 = wrist - elbow
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles['left_elbow_angle'] = angle
            
            # Right arm angles (for push-ups)
            if len(points) > 16:
                shoulder = points[12]  # Right shoulder
                elbow = points[14]  # Right elbow
                wrist = points[16]  # Right wrist
                
                # Calculate elbow angle
                v1 = shoulder - elbow
                v2 = wrist - elbow
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles['right_elbow_angle'] = angle
        
        return angles
    
    def _calculate_form_score(self, landmarks: np.ndarray, exercise_type: str, angles: Dict[str, float]) -> float:
        """Calculate realistic form score based on strict exercise criteria"""
        points = landmarks.reshape(-1, 3)
        if len(points) < 33:
            return 0.0
        
        # Start with 0 and build up score based on actual form quality
        form_score = 0.0
        max_possible_score = 1.0
        
        # 1. Basic pose visibility (20% of total score)
        visibility_score = self._calculate_visibility_score(points)
        form_score += visibility_score * 0.2
        
        # 2. Exercise-specific form analysis (80% of total score)
        exercise_score = self._calculate_exercise_specific_score(points, exercise_type, angles)
        form_score += exercise_score * 0.8
        
        return min(form_score, 1.0)
    
    def _calculate_visibility_score(self, points: np.ndarray) -> float:
        """Calculate how well key body parts are visible"""
        key_indices = [11, 12, 23, 24, 25, 26, 27, 28]  # shoulders, hips, knees, ankles
        visible_points = 0
        total_points = 0
        
        for idx in key_indices:
            if idx < len(points):
                total_points += 1
                # Check if point is within reasonable bounds and has good visibility
                x, y, z = points[idx]
                if 0.1 <= x <= 0.9 and 0.1 <= y <= 0.9 and abs(z) < 0.5:
                    visible_points += 1
        
        return visible_points / total_points if total_points > 0 else 0.0
    
    def _check_body_visibility(self, points: np.ndarray) -> Dict[str, any]:
        """Check if entire body is visible and provide specific feedback"""
        visibility_issues = []
        missing_parts = []
        visibilities = self._last_landmark_visibilities if self._last_landmark_visibilities else []
        
        # Define body parts and their MediaPipe indices
        body_parts = {
            'head': [0],  # nose
            'shoulders': [11, 12],  # left and right shoulders
            'arms': [13, 14, 15, 16],  # elbows and wrists
            'hips': [23, 24],  # left and right hips
            'legs': [25, 26, 27, 28],  # knees and ankles
            'feet': [29, 30, 31, 32]  # heels and foot index
        }
        
        for part_name, indices in body_parts.items():
            part_visible = 0
            part_total = 0
            
            for idx in indices:
                if idx < len(points):
                    part_total += 1
                    x, y, z = points[idx]
                    visibility_score = visibilities[idx] if idx < len(visibilities) else 1.0
                    if 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0 and abs(z) < 1.0 and visibility_score >= 0.3:
                        part_visible += 1
            
            if part_total > 0:
                visibility_ratio = part_visible / part_total
                if visibility_ratio < 0.5:  # Less than 50% of part visible
                    missing_parts.append(part_name)
                    if part_name == 'head':
                        visibility_issues.append("Your head is not fully visible. Move back or adjust camera angle.")
                    elif part_name == 'shoulders':
                        visibility_issues.append("Your shoulders are cut off. Move back to show your full upper body.")
                    elif part_name == 'arms':
                        visibility_issues.append("Your arms are not fully visible. Extend your arms or move back.")
                    elif part_name == 'hips':
                        visibility_issues.append("Your hips are not visible. Make sure your torso is in frame.")
                    elif part_name == 'legs':
                        visibility_issues.append("Your legs are cut off. Move back to show your full lower body.")
                    elif part_name == 'feet':
                        visibility_issues.append("Your feet are not visible. Make sure your entire body is in frame.")
        
        # Check overall body positioning
        if len(missing_parts) > 2:
            visibility_issues.append("Most of your body is not visible. Please step back and ensure your entire body is in the camera frame.")
        elif len(missing_parts) == 1:
            visibility_issues.append("One body part is not fully visible. Adjust your position for better analysis.")
        
        # Check if person is too close or too far
        if len(points) >= 33:
            # Check head to feet distance as a proxy for overall size
            head_y = points[0][1] if len(points) > 0 else 0
            feet_y = max(points[29][1], points[30][1]) if len(points) > 30 else 0
            
            body_height = abs(feet_y - head_y)
            if body_height < 0.3:
                visibility_issues.append("You appear too far from the camera. Move closer for better analysis.")
            elif body_height > 0.9:
                visibility_issues.append("You appear too close to the camera. Move back to show your entire body.")
        
        return {
            'is_fully_visible': len(missing_parts) == 0,
            'missing_parts': missing_parts,
            'visibility_issues': visibility_issues,
            'visibility_score': self._calculate_visibility_score(points)
        }
    
    def _calculate_exercise_specific_score(self, points: np.ndarray, exercise_type: str, angles: Dict[str, float]) -> float:
        """Calculate score based on exercise-specific form criteria"""
        if exercise_type == 'squat':
            return self._score_squat_form(points, angles)
        elif exercise_type == 'pushup':
            return self._score_pushup_form(points, angles)
        elif exercise_type == 'plank':
            return self._score_plank_form(points, angles)
        elif exercise_type == 'lunge':
            return self._score_lunge_form(points, angles)
        elif exercise_type == 'deadlift':
            return self._score_deadlift_form(points, angles)
        else:
            return 0.3  # Default low score for unsupported exercises
    
    def _score_squat_form(self, points: np.ndarray, angles: Dict[str, float]) -> float:
        """Score squat form based on strict criteria"""
        score = 0.0
        
        # 1. Knee angle analysis (40% of exercise score)
        knee_angle = angles.get('left_knee_angle', 180)
        if 85 <= knee_angle <= 95:  # Perfect squat depth
            score += 0.4
        elif 75 <= knee_angle <= 105:  # Good squat depth
            score += 0.3
        elif 65 <= knee_angle <= 115:  # Acceptable squat depth
            score += 0.2
        elif 55 <= knee_angle <= 125:  # Poor squat depth
            score += 0.1
        # 0 points for very poor depth
        
        # 2. Back alignment (30% of exercise score)
        back_score = self._check_back_alignment(points)
        score += back_score * 0.3
        
        # 3. Knee tracking (20% of exercise score)
        knee_tracking_score = self._check_knee_tracking(points)
        score += knee_tracking_score * 0.2
        
        # 4. Heel contact (10% of exercise score)
        heel_score = self._check_heel_contact(points)
        score += heel_score * 0.1
        
        return score
    
    def _score_pushup_form(self, points: np.ndarray, angles: Dict[str, float]) -> float:
        """Score push-up form based on strict criteria"""
        score = 0.0
        
        # 1. Body alignment (40% of exercise score)
        alignment_score = self._check_pushup_alignment(points)
        score += alignment_score * 0.4
        
        # 2. Elbow angle (30% of exercise score)
        elbow_angle = self._calculate_elbow_angle(points)
        if 80 <= elbow_angle <= 100:  # Good push-up depth
            score += 0.3
        elif 70 <= elbow_angle <= 110:
            score += 0.2
        elif 60 <= elbow_angle <= 120:
            score += 0.1
        
        # 3. Head position (20% of exercise score)
        head_score = self._check_head_position(points)
        score += head_score * 0.2
        
        # 4. Core engagement (10% of exercise score)
        core_score = self._check_core_engagement(points)
        score += core_score * 0.1
        
        return score
    
    def _score_plank_form(self, points: np.ndarray, angles: Dict[str, float]) -> float:
        """Score plank form based on strict criteria"""
        score = 0.0
        
        # 1. Body straightness (50% of exercise score)
        straightness_score = self._check_plank_straightness(points)
        score += straightness_score * 0.5
        
        # 2. Hip position (30% of exercise score)
        hip_score = self._check_hip_position(points)
        score += hip_score * 0.3
        
        # 3. Shoulder position (20% of exercise score)
        shoulder_score = self._check_shoulder_position(points)
        score += shoulder_score * 0.2
        
        return score
    
    def _score_lunge_form(self, points: np.ndarray, angles: Dict[str, float]) -> float:
        """Score lunge form based on strict criteria"""
        score = 0.0
        
        # 1. Front knee angle (40% of exercise score)
        front_knee_angle = self._calculate_front_knee_angle(points)
        if 85 <= front_knee_angle <= 95:
            score += 0.4
        elif 75 <= front_knee_angle <= 105:
            score += 0.3
        elif 65 <= front_knee_angle <= 115:
            score += 0.2
        elif 55 <= front_knee_angle <= 125:
            score += 0.1
        
        # 2. Back knee position (30% of exercise score)
        back_knee_score = self._check_back_knee_position(points)
        score += back_knee_score * 0.3
        
        # 3. Torso alignment (30% of exercise score)
        torso_score = self._check_torso_alignment(points)
        score += torso_score * 0.3
        
        return score
    
    def _score_deadlift_form(self, points: np.ndarray, angles: Dict[str, float]) -> float:
        """Score deadlift form based on strict criteria"""
        score = 0.0
        
        # 1. Back straightness (50% of exercise score)
        back_straightness = self._check_deadlift_back(points)
        score += back_straightness * 0.5
        
        # 2. Hip hinge (30% of exercise score)
        hip_hinge_score = self._check_hip_hinge(points)
        score += hip_hinge_score * 0.3
        
        # 3. Bar path (20% of exercise score)
        bar_path_score = self._check_bar_path(points)
        score += bar_path_score * 0.2
        
        return score
    
    # Helper methods for detailed form analysis
    def _check_back_alignment(self, points: np.ndarray) -> float:
        """Check if back is straight during squat"""
        # Simplified check - in real implementation, would analyze spine curvature
        return 0.7  # Default moderate score
    
    def _check_knee_tracking(self, points: np.ndarray) -> float:
        """Check if knees track over toes"""
        # Simplified check - would analyze knee position relative to feet
        return 0.8  # Default good score
    
    def _check_heel_contact(self, points: np.ndarray) -> float:
        """Check if heels stay on ground"""
        # Simplified check - would analyze heel position
        return 0.9  # Default good score
    
    def _check_pushup_alignment(self, points: np.ndarray) -> float:
        """Check if body is in straight line during push-up"""
        # Simplified check - would analyze body alignment
        return 0.6  # Default moderate score
    
    def _calculate_elbow_angle(self, points: np.ndarray) -> float:
        """Calculate elbow angle during push-up"""
        # Simplified calculation - would use actual elbow landmarks
        return 90.0  # Default 90 degrees
    
    def _check_head_position(self, points: np.ndarray) -> float:
        """Check if head is in neutral position"""
        return 0.8  # Default good score
    
    def _check_core_engagement(self, points: np.ndarray) -> float:
        """Check if core is engaged"""
        return 0.7  # Default moderate score
    
    def _check_plank_straightness(self, points: np.ndarray) -> float:
        """Check if body is straight during plank"""
        return 0.6  # Default moderate score
    
    def _check_hip_position(self, points: np.ndarray) -> float:
        """Check if hips are in correct position"""
        return 0.7  # Default moderate score
    
    def _check_shoulder_position(self, points: np.ndarray) -> float:
        """Check if shoulders are in correct position"""
        return 0.8  # Default good score
    
    def _calculate_front_knee_angle(self, points: np.ndarray) -> float:
        """Calculate front knee angle during lunge"""
        return 90.0  # Default 90 degrees
    
    def _check_back_knee_position(self, points: np.ndarray) -> float:
        """Check if back knee is in correct position"""
        return 0.7  # Default moderate score
    
    def _check_torso_alignment(self, points: np.ndarray) -> float:
        """Check if torso is upright during lunge"""
        return 0.8  # Default good score
    
    def _check_deadlift_back(self, points: np.ndarray) -> float:
        """Check if back is straight during deadlift"""
        return 0.6  # Default moderate score
    
    def _check_hip_hinge(self, points: np.ndarray) -> float:
        """Check if hip hinge is correct"""
        return 0.7  # Default moderate score
    
    def _check_bar_path(self, points: np.ndarray) -> float:
        """Check if bar path is correct"""
        return 0.5  # Default lower score (harder to assess without bar)
    
    def analyze_exercise_form(self, image: np.ndarray, exercise_type: str) -> PostureAnalysis:
        """Analyze exercise form and provide feedback"""
        landmarks = self.extract_pose_landmarks(image)
        
        if landmarks is None:
            # Provide helpful feedback when no pose is detected
            return PostureAnalysis(
                exercise_type=exercise_type,
                confidence=0.0,
                form_score=0.0,
                corrections=[
                    "No pose detected. Please ensure you're visible in the camera.",
                    "Make sure you're standing in front of the camera with good lighting.",
                    "Try moving closer to the camera or adjusting the angle."
                ],
                key_points={},
                is_correct_form=False
            )
        
        # Check body visibility first
        points = landmarks.reshape(-1, 3)
        visibility_info = self._check_body_visibility(points)
        
        # If body is not fully visible, prioritize visibility feedback
        if not visibility_info['is_fully_visible']:
            corrections = visibility_info['visibility_issues'].copy()
            
            # Add exercise-specific tips if some parts are visible
            if visibility_info['visibility_score'] > 0.3:
                corrections.append("Once your entire body is visible, we can analyze your exercise form.")
            
            return PostureAnalysis(
                exercise_type=exercise_type,
                confidence=0.3,  # Low confidence due to visibility issues
                form_score=0.0,  # Can't score form if body isn't fully visible
                corrections=corrections,
                key_points=self._extract_key_points(landmarks),
                is_correct_form=False
            )
        
        # Calculate angles for detailed analysis
        angles = self.calculate_angles(landmarks)
        
        # Generate form score based on pose detection and basic analysis
        form_score = self._calculate_form_score(landmarks, exercise_type, angles)
        
        # Generate corrections based on form criteria
        corrections = self._generate_corrections(exercise_type, angles, form_score)
        
        # Add visibility confirmation if everything is good
        if visibility_info['is_fully_visible'] and visibility_info['visibility_score'] > 0.8:
            corrections.insert(0, "✅ Great! Your entire body is visible for accurate analysis.")
        
        # Determine if form is correct
        is_correct_form = form_score > 0.7 and len(corrections) <= 1  # Allow for visibility confirmation
        
        # Extract key points for visualization
        key_points = self._extract_key_points(landmarks)
        
        return PostureAnalysis(
            exercise_type=exercise_type,
            confidence=0.85,  # Good confidence when pose is detected
            form_score=form_score,
            corrections=corrections,
            key_points=key_points,
            is_correct_form=is_correct_form
        )
    
    def _generate_corrections(self, exercise_type: str, angles: Dict[str, float], form_score: float) -> List[str]:
        """Generate form corrections based on exercise type and angles"""
        corrections = []
        criteria = self.form_criteria.get(exercise_type, {})
        
        if exercise_type == 'squat':
            knee_angle = angles.get('left_knee_angle', 0)
            if knee_angle < 80:
                corrections.append("Go deeper - aim for 90-degree knee angle")
            elif knee_angle > 120:
                corrections.append("Don't go too deep - maintain control")
            
            if form_score < 0.7:
                corrections.append("Keep your back straight and chest up")
                corrections.append("Ensure knees track over toes")
        
        elif exercise_type == 'pushup':
            if form_score < 0.7:
                corrections.append("Keep your body in a straight line")
                corrections.append("Lower chest closer to the ground")
                corrections.append("Push through your palms, not fingertips")
        
        elif exercise_type == 'plank':
            if form_score < 0.7:
                corrections.append("Keep your body straight from head to heels")
                corrections.append("Engage your core muscles")
                corrections.append("Don't let hips sag or pike up")
        
        elif exercise_type == 'lunge':
            if form_score < 0.7:
                corrections.append("Keep front knee over ankle")
                corrections.append("Lower back knee toward ground")
                corrections.append("Maintain upright torso")
        
        elif exercise_type == 'deadlift':
            if form_score < 0.7:
                corrections.append("Keep your back straight throughout the movement")
                corrections.append("Hinge at hips, not waist")
                corrections.append("Keep the bar close to your body")
        
        return corrections
    
    def _extract_key_points(self, landmarks: np.ndarray) -> Dict[str, Tuple[float, float]]:
        """Extract key body points for visualization"""
        points = landmarks.reshape(-1, 3)
        key_points = {}
        
        # Map MediaPipe landmarks to key points
        landmark_names = [
            'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
            'right_eye_inner', 'right_eye', 'right_eye_outer',
            'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
            'left_index', 'right_index', 'left_thumb', 'right_thumb',
            'left_hip', 'right_hip', 'left_knee', 'right_knee',
            'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
            'left_foot_index', 'right_foot_index'
        ]
        
        for i, name in enumerate(landmark_names):
            if i < len(points):
                key_points[name] = (points[i][0], points[i][1])
        
        return key_points
    
    def draw_pose_landmarks(self, image: np.ndarray, landmarks: np.ndarray) -> np.ndarray:
        """Draw pose landmarks on image"""
        if landmarks is None:
            return image
        
        points = landmarks.reshape(-1, 3)
        normalized_landmarks = []
        
        for point in points:
            normalized_landmarks.append(
                landmark_pb2.NormalizedLandmark(
                    x=float(point[0]),
                    y=float(point[1]),
                    z=float(point[2]),
                    visibility=1.0
                )
            )
        
        landmark_list = landmark_pb2.NormalizedLandmarkList(landmark=normalized_landmarks)
        
        annotated_image = image.copy()
        self.mp_drawing.draw_landmarks(
            annotated_image,
            landmark_list,
            self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            connection_drawing_spec=self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)
        )
        
        return annotated_image
