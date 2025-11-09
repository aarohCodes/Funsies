"""Utility functions for model training and evaluation."""

import numpy as np
from typing import Dict, Any
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import math


def calculate_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Root Mean Squared Error."""
    return math.sqrt(mean_squared_error(y_true, y_pred))


def calculate_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Error."""
    return mean_absolute_error(y_true, y_pred)


def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Percentage Error."""
    mask = y_true != 0
    if not mask.any():
        return 0.0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100


def calculate_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate R-squared score."""
    return r2_score(y_true, y_pred)


def get_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate all regression metrics."""
    return {
        "rmse": calculate_rmse(y_true, y_pred),
        "mae": calculate_mae(y_true, y_pred),
        "mape": calculate_mape(y_true, y_pred),
        "r2": calculate_r2(y_true, y_pred),
    }


def get_classification_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, Any]:
    """Calculate classification metrics."""
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average='weighted', zero_division=0),
        "recall": recall_score(y_true, y_pred, average='weighted', zero_division=0),
        "f1": f1_score(y_true, y_pred, average='weighted', zero_division=0),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }


def calculate_confidence_interval(predictions: np.ndarray, std: np.ndarray, confidence: float = 0.95) -> Dict[str, np.ndarray]:
    """
    Calculate confidence intervals for predictions.
    
    Args:
        predictions: Predicted values
        std: Standard deviation of predictions
        confidence: Confidence level (default 0.95)
    
    Returns:
        Dictionary with upper and lower bounds
    """
    from scipy import stats
    
    z_score = stats.norm.ppf((1 + confidence) / 2)
    margin = z_score * std
    
    return {
        "lower": predictions - margin,
        "upper": predictions + margin,
    }

