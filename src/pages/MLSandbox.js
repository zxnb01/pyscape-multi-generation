import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UniversalCodePlayground from "../components/sandbox/UniversalCodePlayground";

const exampleCode = {
  linearRegression: `# Linear Regression with NumPy and Scikit-learn
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# Sample data: hours studied vs exam scores
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
y = np.array([45, 50, 55, 60, 65, 70, 75, 80, 85, 90])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
X_test = np.array([[6.5], [7.5]])
predictions = model.predict(X_test)

print(f"Coefficient: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")
print(f"Predictions for 6.5 and 7.5 hours: {predictions}")

# Visualize
plt.scatter(X, y, color='blue', label='Actual Data')
plt.plot(X, model.predict(X), color='red', label='Regression Line')
plt.xlabel('Hours Studied')
plt.ylabel('Exam Score')
plt.title('Linear Regression: Hours vs Score')
plt.legend()
plt.show()

print("\n✓ Linear Regression model trained successfully!")`,

  dataVisualization: `# Data Visualization with Matplotlib and Seaborn
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)

# Generate sample data
np.random.seed(42)
data = np.random.randn(1000)

# Create a figure with multiple subplots
fig, axes = plt.subplots(2, 2)

# 1. Histogram
axes[0, 0].hist(data, bins=30, color='skyblue', edgecolor='black', alpha=0.7)
axes[0, 0].set_title('Distribution of Data')
axes[0, 0].set_xlabel('Value')
axes[0, 0].set_ylabel('Frequency')

# 2. Box plot
axes[0, 1].boxplot(data, vert=True)
axes[0, 1].set_title('Box Plot')
axes[0, 1].set_ylabel('Value')

# 3. Scatter plot
x = np.linspace(0, 10, 50)
y = np.sin(x) + np.random.normal(0, 0.2, 50)
axes[1, 0].scatter(x, y, color='coral', alpha=0.6)
axes[1, 0].plot(x, np.sin(x), color='green', linewidth=2, label='Sine wave')
axes[1, 0].set_title('Scatter Plot with Line')
axes[1, 0].legend()

# 4. Bar chart
categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 90]
axes[1, 1].bar(categories, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
axes[1, 1].set_title('Category Performance')
axes[1, 1].set_xlabel('Category')
axes[1, 1].set_ylabel('Value')

plt.tight_layout()
plt.show()

print("✓ Multiple visualizations created successfully!")`,

  neuralNetworks: `# Neural Network with TensorFlow/Keras
import numpy as np

print("=" * 50)
print("Neural Network Example (Simulated)")
print("=" * 50)

# Simulated Neural Network Training
print("\n📊 Creating model architecture...")
print("   - Input layer: 784 neurons (28x28 images)")
print("   - Hidden layer 1: 128 neurons (ReLU)")
print("   - Hidden layer 2: 64 neurons (ReLU)")
print("   - Output layer: 10 neurons (Softmax)")

# Sample data shape
X_train = np.random.rand(1000, 784)
y_train = np.random.randint(0, 10, 1000)

print(f"\n📁 Training data shape: {X_train.shape}")
print(f"📁 Labels shape: {y_train.shape}")

print("\n🏋️ Training progress:")
for epoch in range(5):
    progress = "=" * (epoch + 1) + "-" * (4 - epoch)
    accuracy = np.random.uniform(0.75, 0.95)
    loss = np.random.uniform(0.1, 0.4)
    print(f"   Epoch {epoch + 1}/5 [{progress}] - accuracy: {accuracy:.4f} - loss: {loss:.4f}")

print("\n✅ Model training complete!")
print("   Final accuracy: 94.5%")
print("   Final loss: 0.172")

# Sample prediction
sample = np.random.rand(784)
prediction = np.random.randint(0, 10)
print(f"\n🔮 Sample prediction: Class {prediction}")
print("\n💡 Note: Install TensorFlow to run real neural networks:")
print("   pip install tensorflow")`
};

const MLSandbox = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [currentCode, setCurrentCode] = useState(exampleCode.linearRegression);

  const handleTryExample = (path, code) => {
    setCurrentCode(code);
    navigate(path);
  };

  const features = [
    {
      id: 1,
      icon: "🐍",
      title: "Python Support",
      desc: "Full Python environment with NumPy, Pandas, Scikit-learn, and more"
    },
    {
      id: 2,
      icon: "⚡",
      title: "Real-time Execution",
      desc: "Run your code instantly on our secure cloud servers"
    },
    {
      id: 3,
      icon: "📊",
      title: "Data Visualization",
      desc: "Create beautiful plots and charts with Matplotlib and Seaborn"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Title Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-5xl font-mono font-bold text-white mb-2">
            ML <span className="text-primary">Sandbox</span>
          </h1>
          <p className="text-base text-slate-300 max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
            Experiment with machine learning algorithms and data science projects in our powerful cloud-based sandbox environment.
          </p>
        </motion.div>

        {/* Editor - Top Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          {/* Features as grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
                onClick={() => setSelectedFeature(feature.id)}
                className={`flex items-start gap-2 px-3 py-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                  selectedFeature === feature.id
                    ? 'bg-primary/20 border-primary shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-lg flex-shrink-0">{feature.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">{feature.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <UniversalCodePlayground 
            defaultLanguage="python"
            height="500px"
            className="mb-8"
            showThemeToggle={true}
            initialCode={currentCode}
          />
        </motion.div>

        {/* Quick Start Tutorials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Start Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
            >
              <h3 className="text-white font-semibold mb-2 text-sm">Linear Regression</h3>
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">Learn the basics of linear regression with NumPy and Scikit-learn</p>
              <button 
                onClick={() => handleTryExample('/app/learn/7/lesson/59/level/1', exampleCode.linearRegression)}
                className="text-primary hover:text-primary/80 text-xs font-medium"
              >
                Try Example →
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
            >
              <h3 className="text-white font-semibold mb-2 text-sm">Data Visualization</h3>
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">Create stunning visualizations with Matplotlib and Seaborn</p>
              <button 
                onClick={() => handleTryExample('/app/learn/7', exampleCode.dataVisualization)}
                className="text-primary hover:text-primary/80 text-xs font-medium"
              >
                Try Example →
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
            >
              <h3 className="text-white font-semibold mb-2 text-sm">Neural Networks</h3>
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">Build your first neural network with TensorFlow</p>
              <button 
                onClick={() => handleTryExample('/app/learn/4', exampleCode.neuralNetworks)}
                className="text-primary hover:text-primary/80 text-xs font-medium"
              >
                Try Example →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MLSandbox;