import os
import joblib
import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)

print("Fetching Pima Indians Diabetes dataset...")
# Using fetch_openml to get the real diabetes dataset
data = fetch_openml(name='diabetes', version=1, as_frame=True, parser='auto')
df = data.frame

# Features are: 'preg', 'plas', 'pres', 'skin', 'insu', 'mass', 'pedi', 'age'
# Target is 'class' ('tested_negative', 'tested_positive')
X = df.drop('class', axis=1)
y = df['class'].apply(lambda x: 1 if x == 'tested_positive' else 0)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("Training Random Forest Classifier on genuine data...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate model
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Test Set: {acc * 100:.2f}%")

# Save the trained model and scaler
models_dir = os.path.join(os.path.dirname(__file__), 'models')
joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
joblib.dump(model, os.path.join(models_dir, 'best_model.pkl'))

print("Genuine model and scaler saved successfully to ml/models/")
