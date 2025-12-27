"""
Advanced algorithms for more accurate posture analysis
Includes temporal tracking, advanced geometric calculations, and biomechanical analysis
"""
import numpy as np
from typing import Dict, List, Tuple, Optional, Deque
from collections import deque
from scipy.spatial.distance import euclidean
from scipy.interpolate import interp1d
from scipy.signal import savgol_filter
import cv2


class TemporalAnalyzer:
    """Temporal analysis for tracking movement patterns across frames"""
    
    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.pose_history: Deque[np.ndarray] = deque(maxlen=window_size)
        self.angle_history: Deque[Dict[str, float]] = deque(maxlen=window_size)
        self.timestamps: Deque[float] = deque(maxlen=window_size)
    
    def add_frame(self, landmarks: np.ndarray, angles: Dict[str, float], timestamp: float):
        """Add a new frame to the temporal analysis"""
        self.pose_history.append(landmarks.copy())
        self.angle_history.append(angles.copy())
        self.timestamps.append(timestamp)
    
    def calculate_movement_velocity(self, joint_indices: List[int]) -> Dict[int, float]:
        """Calculate velocity of specific joints over time"""
        if len(self.pose_history) < 2:
            return {}
        
        velocities = {}
        for joint_idx in joint_indices:
            positions = []
            for pose in self.pose_history:
                if joint_idx < len(pose.reshape(-1, 3)):
                    point = pose.reshape(-1, 3)[joint_idx]
                    positions.append(point[:2])  # x, y only
            
            if len(positions) >= 2:
                # Calculate velocity as change in position over time
                total_distance = 0
                for i in range(1, len(positions)):
                    total_distance += euclidean(positions[i], positions[i-1])
                
                if len(self.timestamps) > 1:
                    time_span = self.timestamps[-1] - self.timestamps[0]
                    velocities[joint_idx] = total_distance / time_span if time_span > 0 else 0
        
        return velocities
    
    def calculate_angle_smoothness(self, angle_key: str) -> float:
        """Calculate how smooth angle changes are (lower = smoother)"""
        if len(self.angle_history) < 3:
            return 1.0  # No data = not smooth
        
        angles = [angles.get(angle_key, 0) for angles in self.angle_history]
        
        # Calculate second derivative (acceleration) - smoother = lower acceleration
        if len(angles) >= 3:
            second_derivatives = []
            for i in range(1, len(angles) - 1):
                # Second derivative approximation
                accel = abs(angles[i+1] - 2*angles[i] + angles[i-1])
                second_derivatives.append(accel)
            
            avg_accel = np.mean(second_derivatives) if second_derivatives else 1.0
            # Normalize to 0-1 scale (smooth = close to 0)
            smoothness = 1.0 / (1.0 + avg_accel / 10.0)
            return min(smoothness, 1.0)
        
        return 0.5
    
    def detect_movement_phase(self, angle_key: str) -> str:
        """Detect if movement is in eccentric (down) or concentric (up) phase"""
        if len(self.angle_history) < 3:
            return "unknown"
        
        angles = [angles.get(angle_key, 0) for angles in self.angle_history]
        
        # Calculate trend
        recent_change = angles[-1] - angles[-3] if len(angles) >= 3 else 0
        
        if recent_change > 5:  # Angle increasing
            return "concentric"  # Coming up
        elif recent_change < -5:  # Angle decreasing
            return "eccentric"  # Going down
        else:
            return "static"  # Holding position
    
    def calculate_consistency_score(self) -> float:
        """Calculate how consistent the form is across recent frames"""
        if len(self.angle_history) < 3:
            return 0.5
        
        # Get all angle keys
        all_keys = set()
        for angles in self.angle_history:
            all_keys.update(angles.keys())
        
        consistency_scores = []
        for key in all_keys:
            angles = [angles.get(key, 0) for angles in self.angle_history]
            if len(angles) > 1:
                # Lower variance = more consistent
                variance = np.var(angles)
                # Normalize variance (assuming angles in 0-180 range)
                normalized_variance = variance / (180.0 ** 2)
                consistency = 1.0 / (1.0 + normalized_variance * 10)
                consistency_scores.append(consistency)
        
        return np.mean(consistency_scores) if consistency_scores else 0.5


class AdvancedGeometricAnalyzer:
    """Advanced geometric algorithms for precise form analysis"""
    
    @staticmethod
    def calculate_spine_curvature(points: np.ndarray) -> Dict[str, float]:
        """Calculate spine curvature using multiple points along the spine"""
        if len(points) < 33:
            return {'curvature': 0.0, 'is_straight': True}
        
        points_3d = points.reshape(-1, 3)
        
        # Spine landmarks: nose, shoulders, hips
        spine_points = []
        spine_indices = [0, 11, 12, 23, 24]  # nose, left shoulder, right shoulder, left hip, right hip
        
        for idx in spine_indices:
            if idx < len(points_3d):
                spine_points.append(points_3d[idx])
        
        if len(spine_points) < 3:
            return {'curvature': 0.0, 'is_straight': True}
        
        # Calculate curvature using angle between spine segments
        spine_points = np.array(spine_points)
        
        # Project to 2D (side view) - use y and z coordinates
        spine_2d = spine_points[:, [1, 2]]  # y, z coordinates
        
        # Calculate angles between consecutive segments
        angles = []
        for i in range(len(spine_2d) - 2):
            v1 = spine_2d[i+1] - spine_2d[i]
            v2 = spine_2d[i+2] - spine_2d[i+1]
            
            if np.linalg.norm(v1) > 0 and np.linalg.norm(v2) > 0:
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                angles.append(angle)
        
        if angles:
            # Straight spine should have angles close to 180 degrees
            avg_angle = np.mean(angles)
            curvature = abs(180 - avg_angle) / 180.0  # Normalize to 0-1
            is_straight = avg_angle > 170  # Within 10 degrees of straight
            
            return {
                'curvature': curvature,
                'is_straight': is_straight,
                'avg_angle': avg_angle
            }
        
        return {'curvature': 0.0, 'is_straight': True}
    
    @staticmethod
    def calculate_knee_tracking_accuracy(points: np.ndarray) -> Dict[str, float]:
        """Calculate if knees track properly over toes using 2D projection"""
        if len(points) < 33:
            return {'left_tracking': 0.0, 'right_tracking': 0.0, 'overall': 0.0}
        
        points_3d = points.reshape(-1, 3)
        
        # Get key points (project to 2D - x, y plane)
        # Left side
        left_hip = points_3d[23] if len(points_3d) > 23 else None
        left_knee = points_3d[25] if len(points_3d) > 25 else None
        left_ankle = points_3d[27] if len(points_3d) > 27 else None
        left_foot = points_3d[31] if len(points_3d) > 31 else None  # Left foot index
        
        # Right side
        right_hip = points_3d[24] if len(points_3d) > 24 else None
        right_knee = points_3d[26] if len(points_3d) > 26 else None
        right_ankle = points_3d[28] if len(points_3d) > 28 else None
        right_foot = points_3d[32] if len(points_3d) > 32 else None  # Right foot index
        
        def calculate_tracking_score(hip, knee, ankle, foot):
            """Calculate how well knee tracks over foot"""
            if hip is None or knee is None or ankle is None or foot is None:
                return 0.0
            
            # Project to 2D (x, y plane - front view)
            hip_2d = hip[:2]
            knee_2d = knee[:2]
            ankle_2d = ankle[:2]
            foot_2d = foot[:2]
            
            # Calculate if knee is aligned with foot (x-coordinate alignment)
            # Good tracking: knee x should be between ankle x and foot x
            foot_ankle_center_x = (foot_2d[0] + ankle_2d[0]) / 2
            knee_offset = abs(knee_2d[0] - foot_ankle_center_x)
            
            # Normalize offset (assuming normalized coordinates 0-1)
            # Smaller offset = better tracking
            tracking_score = 1.0 / (1.0 + knee_offset * 20)
            
            return tracking_score
        
        left_tracking = calculate_tracking_score(left_hip, left_knee, left_ankle, left_foot)
        right_tracking = calculate_tracking_score(right_hip, right_knee, right_ankle, right_foot)
        
        overall = (left_tracking + right_tracking) / 2.0
        
        return {
            'left_tracking': left_tracking,
            'right_tracking': right_tracking,
            'overall': overall
        }
    
    @staticmethod
    def calculate_body_alignment_score(points: np.ndarray) -> Dict[str, float]:
        """Calculate overall body alignment using multiple reference lines"""
        if len(points) < 33:
            return {'alignment': 0.0, 'shoulder_hip_parallel': 0.0, 'vertical_alignment': 0.0}
        
        points_3d = points.reshape(-1, 3)
        
        # 1. Check if shoulders are parallel to hips (good alignment indicator)
        left_shoulder = points_3d[11] if len(points_3d) > 11 else None
        right_shoulder = points_3d[12] if len(points_3d) > 12 else None
        left_hip = points_3d[23] if len(points_3d) > 23 else None
        right_hip = points_3d[24] if len(points_3d) > 24 else None
        
        shoulder_hip_score = 0.5
        if all([left_shoulder, right_shoulder, left_hip, right_hip]):
            # Calculate angles of shoulder and hip lines
            shoulder_line = right_shoulder[:2] - left_shoulder[:2]
            hip_line = right_hip[:2] - left_hip[:2]
            
            if np.linalg.norm(shoulder_line) > 0 and np.linalg.norm(hip_line) > 0:
                cos_angle = np.dot(shoulder_line, hip_line) / (
                    np.linalg.norm(shoulder_line) * np.linalg.norm(hip_line)
                )
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle = np.degrees(np.arccos(cos_angle))
                
                # Parallel lines should have angle close to 0 or 180
                parallel_score = 1.0 - min(angle, 180 - angle) / 90.0
                shoulder_hip_score = max(0, parallel_score)
        
        # 2. Check vertical alignment (shoulders, hips, knees in line)
        vertical_alignment_score = 0.5
        if all([left_shoulder, left_hip]):
            # Check if key points are vertically aligned
            shoulder_hip_vertical_diff = abs(left_shoulder[0] - left_hip[0])  # x-coordinate difference
            # Smaller difference = better vertical alignment
            vertical_alignment_score = 1.0 / (1.0 + shoulder_hip_vertical_diff * 10)
        
        # Overall alignment is average of both scores
        overall_alignment = (shoulder_hip_score + vertical_alignment_score) / 2.0
        
        return {
            'alignment': overall_alignment,
            'shoulder_hip_parallel': shoulder_hip_score,
            'vertical_alignment': vertical_alignment_score
        }
    
    @staticmethod
    def calculate_hip_hinge_angle(points: np.ndarray) -> float:
        """Calculate hip hinge angle for deadlift analysis"""
        if len(points) < 33:
            return 0.0
        
        points_3d = points.reshape(-1, 3)
        
        # Get hip, knee, and shoulder points
        left_hip = points_3d[23] if len(points_3d) > 23 else None
        left_knee = points_3d[25] if len(points_3d) > 25 else None
        left_shoulder = points_3d[11] if len(points_3d) > 11 else None
        
        if not all([left_hip, left_knee, left_shoulder]):
            return 0.0
        
        # Calculate angle between hip-knee line and hip-shoulder line
        hip_knee = left_knee[:2] - left_hip[:2]
        hip_shoulder = left_shoulder[:2] - left_hip[:2]
        
        if np.linalg.norm(hip_knee) > 0 and np.linalg.norm(hip_shoulder) > 0:
            cos_angle = np.dot(hip_knee, hip_shoulder) / (
                np.linalg.norm(hip_knee) * np.linalg.norm(hip_shoulder)
            )
            cos_angle = np.clip(cos_angle, -1.0, 1.0)
            angle = np.degrees(np.arccos(cos_angle))
            return angle
        
        return 0.0


class BiomechanicalAnalyzer:
    """Biomechanical analysis for exercise-specific form evaluation"""
    
    @staticmethod
    def analyze_squat_biomechanics(points: np.ndarray, angles: Dict[str, float]) -> Dict[str, float]:
        """Advanced squat biomechanical analysis"""
        results = {}
        
        # 1. Depth analysis using knee angle
        knee_angle = angles.get('left_knee_angle', 180)
        if 85 <= knee_angle <= 95:
            results['depth_score'] = 1.0
        elif 75 <= knee_angle <= 105:
            results['depth_score'] = 0.8
        elif 65 <= knee_angle <= 115:
            results['depth_score'] = 0.6
        else:
            results['depth_score'] = 0.3
        
        # 2. Back alignment using spine curvature
        spine_analysis = AdvancedGeometricAnalyzer.calculate_spine_curvature(points)
        results['back_straightness'] = 1.0 - spine_analysis['curvature']
        
        # 3. Knee tracking
        tracking = AdvancedGeometricAnalyzer.calculate_knee_tracking_accuracy(points)
        results['knee_tracking'] = tracking['overall']
        
        # 4. Overall biomechanical score
        results['overall_score'] = (
            results['depth_score'] * 0.4 +
            results['back_straightness'] * 0.3 +
            results['knee_tracking'] * 0.3
        )
        
        return results
    
    @staticmethod
    def analyze_pushup_biomechanics(points: np.ndarray, angles: Dict[str, float]) -> Dict[str, float]:
        """Advanced push-up biomechanical analysis"""
        results = {}
        
        # 1. Body alignment
        alignment = AdvancedGeometricAnalyzer.calculate_body_alignment_score(points)
        results['body_alignment'] = alignment['alignment']
        
        # 2. Elbow angle (depth)
        elbow_angle = angles.get('left_elbow_angle', 180)
        if 80 <= elbow_angle <= 100:
            results['depth_score'] = 1.0
        elif 70 <= elbow_angle <= 110:
            results['depth_score'] = 0.7
        else:
            results['depth_score'] = 0.4
        
        # 3. Core engagement (estimated from body alignment)
        results['core_engagement'] = alignment['vertical_alignment']
        
        # Overall score
        results['overall_score'] = (
            results['body_alignment'] * 0.4 +
            results['depth_score'] * 0.4 +
            results['core_engagement'] * 0.2
        )
        
        return results
    
    @staticmethod
    def analyze_plank_biomechanics(points: np.ndarray, angles: Dict[str, float]) -> Dict[str, float]:
        """Advanced plank biomechanical analysis"""
        results = {}
        
        # 1. Body straightness
        alignment = AdvancedGeometricAnalyzer.calculate_body_alignment_score(points)
        results['body_straightness'] = alignment['vertical_alignment']
        
        # 2. Hip position (check if hips are too high or too low)
        if len(points.reshape(-1, 3)) >= 33:
            points_3d = points.reshape(-1, 3)
            left_shoulder = points_3d[11]
            left_hip = points_3d[23]
            left_ankle = points_3d[27]
            
            # Calculate if body is in straight line
            shoulder_hip = left_hip[1] - left_shoulder[1]  # y-coordinate difference
            hip_ankle = left_ankle[1] - left_hip[1]
            
            # In perfect plank, these should be roughly equal
            hip_position_score = 1.0 / (1.0 + abs(shoulder_hip - hip_ankle) * 5)
            results['hip_position'] = hip_position_score
        else:
            results['hip_position'] = 0.5
        
        # Overall score
        results['overall_score'] = (
            results['body_straightness'] * 0.6 +
            results['hip_position'] * 0.4
        )
        
        return results


class KalmanFilter:
    """Simple Kalman filter for smoothing pose estimates"""
    
    def __init__(self, process_variance: float = 0.01, measurement_variance: float = 0.1):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.estimated_value = None
        self.estimation_error = 1.0
    
    def update(self, measurement: float) -> float:
        """Update filter with new measurement"""
        if self.estimated_value is None:
            self.estimated_value = measurement
            return measurement
        
        # Prediction step
        prediction = self.estimated_value
        prediction_error = self.estimation_error + self.process_variance
        
        # Update step
        kalman_gain = prediction_error / (prediction_error + self.measurement_variance)
        self.estimated_value = prediction + kalman_gain * (measurement - prediction)
        self.estimation_error = (1 - kalman_gain) * prediction_error
        
        return self.estimated_value


class AngleSmoother:
    """Smooth angle measurements using Kalman filtering"""
    
    def __init__(self):
        self.filters: Dict[str, KalmanFilter] = {}
    
    def smooth_angle(self, angle_key: str, angle_value: float) -> float:
        """Smooth an angle value using Kalman filter"""
        if angle_key not in self.filters:
            self.filters[angle_key] = KalmanFilter()
        
        return self.filters[angle_key].update(angle_value)
    
    def smooth_angles(self, angles: Dict[str, float]) -> Dict[str, float]:
        """Smooth all angles in a dictionary"""
        smoothed = {}
        for key, value in angles.items():
            smoothed[key] = self.smooth_angle(key, value)
        return smoothed

