"""
Enhanced FastAPI Backend for Extreme Weather Prediction
Auto-fetches NASA data and generates proper features
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
import yaml
import os
import joblib
import json
import requests
from datetime import datetime, timedelta

# Initialize FastAPI app
app = FastAPI(
    title="Extreme Weather Prediction API - Enhanced",
    description="Predicts extreme weather using real-time NASA data",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load configuration
with open("config.yaml", 'r') as f:
    config = yaml.safe_load(f)


class PredictionRequest(BaseModel):
    """Request model for predictions"""
    latitude: float = Field(..., description="Latitude of location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of location", ge=-180, le=180)
    date: str = Field(..., description="Date for prediction (YYYY-MM-DD)")


class PredictionResponse(BaseModel):
    """Response model for predictions"""
    location: Dict[str, float]
    date: str
    predictions: Dict[str, float]
    risk_level: str
    timestamp: str
    data_source: str


class NASADataFetcher:
    """Fetches real-time NASA POWER data"""
    
    @staticmethod
    def fetch_historical_data(latitude, longitude, end_date_str, days_back=60):
        """
        Fetch historical NASA data for feature engineering
        
        Args:
            latitude: Location latitude
            longitude: Location longitude  
            end_date_str: End date (prediction date)
            days_back: Number of days to fetch for lag/rolling features
            
        Returns:
            DataFrame with weather data
        """
        end_date = pd.to_datetime(end_date_str)
        start_date = end_date - timedelta(days=days_back)
        
        url = config['data']['power_api_url']
        params = {
            'parameters': ','.join(config['data']['parameters']),
            'community': 'AG',
            'longitude': longitude,
            'latitude': latitude,
            'start': start_date.strftime('%Y%m%d'),
            'end': end_date.strftime('%Y%m%d'),
            'format': 'JSON'
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'properties' in data and 'parameter' in data['properties']:
                params_data = data['properties']['parameter']
                df = pd.DataFrame(params_data)
                df.index = pd.to_datetime(df.index, format='%Y%m%d')
                df.reset_index(inplace=True)
                df.rename(columns={'index': 'date'}, inplace=True)
                df['latitude'] = latitude
                df['longitude'] = longitude
                df['location_name'] = 'temp_location'
                
                return df
            else:
                raise ValueError("Unexpected API response format")
                
        except Exception as e:
            raise HTTPException(status_code=503, 
                detail=f"Failed to fetch NASA data: {str(e)}")


class EnhancedFeatureBuilder:
    """Builds complete features including lag and rolling statistics"""
    
    @staticmethod
    def create_temporal_features(date_str):
        """Create temporal features from date"""
        date = pd.to_datetime(date_str)
        
        features = {
            'day_of_year': date.dayofyear,
            'month': date.month,
            'day_of_week': date.dayofweek,
            'is_weekend': int(date.dayofweek >= 5),
            'year': date.year,
            'season': (date.month % 12 + 3) // 3,
        }
        
        # Cyclical encoding
        features['day_of_year_sin'] = np.sin(2 * np.pi * features['day_of_year'] / 365.25)
        features['day_of_year_cos'] = np.cos(2 * np.pi * features['day_of_year'] / 365.25)
        features['month_sin'] = np.sin(2 * np.pi * features['month'] / 12)
        features['month_cos'] = np.cos(2 * np.pi * features['month'] / 12)
        
        return features
    
    @staticmethod
    def create_lag_features(df, target_date):
        """Create lag features for the target date"""
        lag_days = config['features']['lag_days']
        weather_columns = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 
                          'WS2M', 'RH2M', 'PS', 'CLOUD_AMT']
        
        df = df.sort_values('date')
        target_row = df[df['date'] == target_date].iloc[-1]
        features = {}
        
        for col in weather_columns:
            if col in df.columns:
                for lag in lag_days:
                    lag_date = pd.to_datetime(target_date) - timedelta(days=lag)
                    lag_row = df[df['date'] == lag_date]
                    if len(lag_row) > 0:
                        features[f'{col}_lag_{lag}'] = float(lag_row[col].values[0])
                    else:
                        features[f'{col}_lag_{lag}'] = 0
        
        return features
    
    @staticmethod
    def create_rolling_features(df, target_date):
        """Create rolling window statistics"""
        rolling_windows = config['features']['rolling_window_days']
        weather_columns = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR',
                          'WS2M', 'RH2M', 'PS', 'CLOUD_AMT']
        
        df = df.sort_values('date')
        features = {}
        
        for col in weather_columns:
            if col in df.columns:
                for window in rolling_windows:
                    window_end = pd.to_datetime(target_date)
                    window_start = window_end - timedelta(days=window)
                    window_data = df[(df['date'] >= window_start) & (df['date'] < window_end)][col]
                    
                    if len(window_data) > 0:
                        features[f'{col}_rolling_mean_{window}'] = float(window_data.mean())
                        features[f'{col}_rolling_std_{window}'] = float(window_data.std()) if len(window_data) > 1 else 0
                        features[f'{col}_rolling_max_{window}'] = float(window_data.max())
                        features[f'{col}_rolling_min_{window}'] = float(window_data.min())
                    else:
                        features[f'{col}_rolling_mean_{window}'] = 0
                        features[f'{col}_rolling_std_{window}'] = 0
                        features[f'{col}_rolling_max_{window}'] = 0
                        features[f'{col}_rolling_min_{window}'] = 0
        
        return features
    
    @staticmethod
    def create_trend_features(df, target_date):
        """Create trend features"""
        weather_columns = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR',
                          'WS2M', 'RH2M', 'PS', 'CLOUD_AMT']
        
        df = df.sort_values('date')
        features = {}
        
        target_date_dt = pd.to_datetime(target_date)
        target_row = df[df['date'] == target_date_dt]
        
        if len(target_row) == 0:
            return features
            
        target_row = target_row.iloc[0]
        
        for col in weather_columns:
            if col in df.columns:
                # 1-day change
                prev_1d = df[df['date'] == target_date_dt - timedelta(days=1)]
                if len(prev_1d) > 0:
                    features[f'{col}_change_1d'] = float(target_row[col] - prev_1d[col].values[0])
                    if prev_1d[col].values[0] != 0:
                        features[f'{col}_pct_change_1d'] = float((target_row[col] - prev_1d[col].values[0]) / prev_1d[col].values[0])
                    else:
                        features[f'{col}_pct_change_1d'] = 0
                else:
                    features[f'{col}_change_1d'] = 0
                    features[f'{col}_pct_change_1d'] = 0
                
                # 7-day change
                prev_7d = df[df['date'] == target_date_dt - timedelta(days=7)]
                if len(prev_7d) > 0:
                    features[f'{col}_change_7d'] = float(target_row[col] - prev_7d[col].values[0])
                else:
                    features[f'{col}_change_7d'] = 0
        
        return features
    
    @staticmethod
    def create_interaction_features(df, target_date):
        """Create interaction features"""
        target_row = df[df['date'] == pd.to_datetime(target_date)]
        if len(target_row) == 0:
            return {}
        
        target_row = target_row.iloc[0]
        features = {}
        
        # Temp * Humidity
        if 'T2M' in target_row and 'RH2M' in target_row:
            features['temp_humidity_interaction'] = float(target_row['T2M'] * target_row['RH2M'])
        
        # Wind * Precipitation
        if 'WS2M' in target_row and 'PRECTOTCORR' in target_row:
            features['wind_precip_interaction'] = float(target_row['WS2M'] * target_row['PRECTOTCORR'])
        
        # Temperature range
        if 'T2M_MAX' in target_row and 'T2M_MIN' in target_row:
            features['temp_range'] = float(target_row['T2M_MAX'] - target_row['T2M_MIN'])
        
        # Heat index
        if 'T2M' in target_row and 'RH2M' in target_row:
            T = target_row['T2M']
            RH = target_row['RH2M']
            features['heat_index'] = float(T + (0.5 * (T + 61.0 + ((T-68.0)*1.2) + (RH*0.094))))
        
        return features
    
    @staticmethod
    def build_complete_features(request: PredictionRequest):
        """
        Build complete feature set by fetching NASA data
        """
        # Fetch historical NASA data
        df = NASADataFetcher.fetch_historical_data(
            request.latitude, 
            request.longitude,
            request.date,
            days_back=60
        )
        
        # Build all features
        all_features = {}
        
        # 1. Temporal features
        temporal = EnhancedFeatureBuilder.create_temporal_features(request.date)
        all_features.update(temporal)
        
        # 2. Current day weather values
        target_row = df[df['date'] == pd.to_datetime(request.date)]
        if len(target_row) > 0:
            target_row = target_row.iloc[0]
            for col in ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'RH2M', 'PS', 'CLOUD_AMT']:
                if col in target_row:
                    all_features[col] = float(target_row[col])
        
        # 3. Lag features
        lag_features = EnhancedFeatureBuilder.create_lag_features(df, pd.to_datetime(request.date))
        all_features.update(lag_features)
        
        # 4. Rolling features
        rolling_features = EnhancedFeatureBuilder.create_rolling_features(df, pd.to_datetime(request.date))
        all_features.update(rolling_features)
        
        # 5. Trend features
        trend_features = EnhancedFeatureBuilder.create_trend_features(df, pd.to_datetime(request.date))
        all_features.update(trend_features)
        
        # 6. Interaction features
        interaction_features = EnhancedFeatureBuilder.create_interaction_features(df, pd.to_datetime(request.date))
        all_features.update(interaction_features)
        
        return all_features


class ModelLoader:
    """Loads and manages trained models"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_names = []
        self.metadata = {}
        self.model_dir = config['api']['model_path']
        
        self.load_models()
    
    def load_models(self):
        """Load all trained models"""
        metadata_path = os.path.join(self.model_dir, "metadata.json")
        
        if not os.path.exists(metadata_path):
            raise FileNotFoundError("Model metadata not found. Train models first.")
        
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        
        # Load feature names
        feature_path = os.path.join(self.model_dir, "feature_names.pkl")
        self.feature_names = joblib.load(feature_path)
        
        # Load each target's model
        for target in self.metadata['targets']:
            best_model_name = self.metadata['model_performance'][target]['best_model']
            
            # Load model
            model_path = os.path.join(self.model_dir, f"{target}_{best_model_name}.pkl")
            self.models[target] = joblib.load(model_path)
            
            # Load scaler if exists
            scaler_path = os.path.join(self.model_dir, f"{target}_{best_model_name}_scaler.pkl")
            if os.path.exists(scaler_path):
                self.scalers[target] = joblib.load(scaler_path)
            else:
                self.scalers[target] = None
        
        print(f"✓ Loaded models for {len(self.models)} targets")


# Initialize model loader
try:
    model_loader = ModelLoader()
except Exception as e:
    print(f"Warning: Could not load models - {e}")
    print("Models need to be trained first. Run train_models.py")
    model_loader = None


def assess_risk_level(predictions: Dict[str, float]) -> str:
    """Assess overall risk level based on predictions"""
    max_prob = max(predictions.values())
    
    if max_prob >= 0.8:
        return "EXTREME"
    elif max_prob >= 0.6:
        return "HIGH"
    elif max_prob >= 0.4:
        return "MODERATE"
    elif max_prob >= 0.2:
        return "LOW"
    else:
        return "MINIMAL"


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Extreme Weather Prediction API - Enhanced",
        "version": "2.0.0",
        "features": ["Real-time NASA data fetching", "Automatic feature engineering"],
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "model_info": "/model/info"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": model_loader is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/model/info")
async def model_info():
    """Get model information"""
    if model_loader is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return {
        "targets": model_loader.metadata['targets'],
        "feature_count": model_loader.metadata['feature_count'],
        "trained_date": model_loader.metadata['trained_date'],
        "performance": model_loader.metadata['model_performance']
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make extreme weather predictions with real NASA data
    
    Args:
        request: PredictionRequest with location and date
        
    Returns:
        PredictionResponse with probabilities for each extreme condition
    """
    if model_loader is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Fetch real NASA data and build complete features
        print(f"Fetching NASA data for ({request.latitude}, {request.longitude}) on {request.date}...")
        features = EnhancedFeatureBuilder.build_complete_features(request)
        
        # Convert to DataFrame
        feature_df = pd.DataFrame([features])
        
        # Fill any missing features with median or 0
        missing_features = {}
        for feature_name in model_loader.feature_names:
            if feature_name not in feature_df.columns:
                missing_features[feature_name] = 0
        
        if missing_features:
            missing_df = pd.DataFrame([missing_features])
            feature_df = pd.concat([feature_df, missing_df], axis=1)
        
        # Reorder columns to match training
        feature_df = feature_df[model_loader.feature_names]
        X = feature_df.values
        
        # Make predictions for each target
        predictions = {}
        
        for target, model in model_loader.models.items():
            # Apply scaling if needed
            if model_loader.scalers[target] is not None:
                X_scaled = model_loader.scalers[target].transform(X)
            else:
                X_scaled = X
            
            # Predict probability
            prob = float(model.predict_proba(X_scaled)[0, 1])
            predictions[target] = round(prob, 4)
        
        # Assess risk level
        risk_level = assess_risk_level(predictions)
        
        # Prepare response
        response = PredictionResponse(
            location={
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            date=request.date,
            predictions=predictions,
            risk_level=risk_level,
            timestamp=datetime.now().isoformat(),
            data_source="NASA POWER API (Real-time)"
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = config['api']['host']
    port = config['api']['port']
    
    print(f"\n{'='*60}")
    print("Starting Enhanced Extreme Weather Prediction API")
    print("Features:")
    print("  - Real-time NASA data fetching")
    print("  - Automatic lag/rolling feature generation")
    print("  - Temporal constraint handling")
    print(f"Server: http://{host}:{port}")
    print(f"Docs: http://{host}:{port}/docs")
    print('='*60 + "\n")
    
    uvicorn.run(app, host=host, port=port)

