"""Data preprocessing utilities for network optimization."""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Optional
import pickle
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import DATA_DIR, MODELS_DIR


class DataPreprocessor:
    """Handles data loading, cleaning, and feature engineering."""
    
    def __init__(self):
        self.scaler = None
        self.preprocessor_path = MODELS_DIR / "preprocessor.pkl"
    
    def load_dataset(self, dataset_path: Optional[Path] = None) -> pd.DataFrame:
        """
        Load dataset from Kaggle using kagglehub.
        
        Returns:
            pd.DataFrame: Loaded and basic cleaned dataset
        """
        import kagglehub
        
        # Download latest version
        path = kagglehub.dataset_download("suraj520/cellular-network-analysis-dataset")
        print(f"Path to dataset files: {path}")
        
        # Find CSV file in the dataset
        csv_files = list(Path(path).glob("*.csv"))
        if not csv_files:
            raise FileNotFoundError(f"No CSV file found in dataset path: {path}")
        
        # Load the first CSV file
        df = pd.read_csv(csv_files[0])
        print(f"Loaded dataset with shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        
        return df
    
    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess the dataset: clean, engineer features, handle missing values.
        
        Args:
            df: Raw dataset
            
        Returns:
            pd.DataFrame: Preprocessed dataset
        """
        df = df.copy()
        
        # Parse timestamps
        if 'Timestamp' in df.columns:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        elif 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            df['Timestamp'] = df['timestamp']
        
        # Remove Signal Quality column (all 0.0 as specified)
        columns_to_remove = [col for col in df.columns if 'Signal Quality' in col or 'signal_quality' in col.lower()]
        df = df.drop(columns=columns_to_remove, errors='ignore')
        
        # Handle missing values - forward fill for time-series
        df = df.sort_values('Timestamp')
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        # Use fillna with method parameter for pandas < 2.0, or ffill/bfill for newer versions
        try:
            df[numeric_columns] = df[numeric_columns].fillna(method='ffill').fillna(method='bfill')
        except TypeError:
            # For pandas >= 2.0
            df[numeric_columns] = df[numeric_columns].ffill().bfill()
        
        # Standardize column names (handle case variations)
        column_mapping = {}
        for col in df.columns:
            col_lower = col.lower()
            if 'latitude' in col_lower:
                column_mapping[col] = 'Latitude'
            elif 'longitude' in col_lower:
                column_mapping[col] = 'Longitude'
            elif 'signal strength' in col_lower or 'signal_strength' in col_lower:
                column_mapping[col] = 'Signal_Strength'
            elif 'data throughput' in col_lower or 'throughput' in col_lower:
                column_mapping[col] = 'Data_Throughput'
            elif 'network type' in col_lower or 'network_type' in col_lower:
                column_mapping[col] = 'Network_Type'
            elif 'locality' in col_lower or 'location' in col_lower:
                column_mapping[col] = 'Locality'
        
        df = df.rename(columns=column_mapping)
        
        # Create engineered features
        df = self._create_temporal_features(df)
        
        # Ensure Locality column exists (if not, create from coordinates or use index)
        if 'Locality' not in df.columns:
            # Create locality from coordinates or use a default
            if 'Latitude' in df.columns and 'Longitude' in df.columns:
                df['Locality'] = df.apply(
                    lambda x: f"Loc_{x['Latitude']:.4f}_{x['Longitude']:.4f}", 
                    axis=1
                )
            else:
                df['Locality'] = df.index
        
        return df
    
    def _create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create temporal features from timestamp."""
        if 'Timestamp' not in df.columns:
            return df
        
        df['hour_of_day'] = df['Timestamp'].dt.hour
        df['day_of_week'] = df['Timestamp'].dt.dayofweek
        df['day_of_month'] = df['Timestamp'].dt.day
        df['month'] = df['Timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Time of day category
        def get_time_category(hour):
            if 5 <= hour < 12:
                return 'morning'
            elif 12 <= hour < 17:
                return 'afternoon'
            elif 17 <= hour < 22:
                return 'evening'
            else:
                return 'night'
        
        df['time_of_day_category'] = df['hour_of_day'].apply(get_time_category)
        
        # Encode time categories
        time_category_map = {'morning': 0, 'afternoon': 1, 'evening': 2, 'night': 3}
        df['time_of_day_encoded'] = df['time_of_day_category'].map(time_category_map)
        
        return df
    
    def train_test_split(self, df: pd.DataFrame, test_size: float = 0.2) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Split data into train and test sets maintaining temporal order.
        
        Args:
            df: Preprocessed dataframe
            test_size: Proportion of data for testing
            
        Returns:
            Tuple of (train_df, test_df)
        """
        df = df.sort_values('Timestamp')
        split_idx = int(len(df) * (1 - test_size))
        train_df = df.iloc[:split_idx].copy()
        test_df = df.iloc[split_idx:].copy()
        
        return train_df, test_df
    
    def normalize_features(self, df: pd.DataFrame, feature_columns: list, fit: bool = True) -> pd.DataFrame:
        """
        Normalize features using StandardScaler.
        
        Args:
            df: Dataframe with features to normalize
            feature_columns: List of column names to normalize
            fit: Whether to fit the scaler (True for training, False for inference)
            
        Returns:
            Dataframe with normalized features
        """
        from sklearn.preprocessing import StandardScaler
        
        if fit:
            self.scaler = StandardScaler()
            df[feature_columns] = self.scaler.fit_transform(df[feature_columns])
        else:
            if self.scaler is None:
                raise ValueError("Scaler not fitted. Load preprocessor or fit first.")
            df[feature_columns] = self.scaler.transform(df[feature_columns])
        
        return df
    
    def save_preprocessor(self):
        """Save preprocessor state to disk."""
        with open(self.preprocessor_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        print(f"Preprocessor saved to {self.preprocessor_path}")
    
    def load_preprocessor(self):
        """Load preprocessor state from disk."""
        if self.preprocessor_path.exists():
            with open(self.preprocessor_path, 'rb') as f:
                self.scaler = pickle.load(f)
            print(f"Preprocessor loaded from {self.preprocessor_path}")
        else:
            print("No preprocessor found. Will create new one.")

