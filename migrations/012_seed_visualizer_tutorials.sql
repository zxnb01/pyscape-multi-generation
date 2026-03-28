-- ============================================
-- SEED: Visualizer Tutorials
-- Migration 012: Tutorial content for algorithm visualizers
-- ============================================

-- Create a table for visualizer tutorials if it doesn't exist
CREATE TABLE IF NOT EXISTS public.visualizer_tutorials (
  id SERIAL PRIMARY KEY,
  visualizer_type VARCHAR(100) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  tutorial_steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visualizer_tutorials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY visualizer_tutorials_read_policy ON public.visualizer_tutorials
  FOR SELECT
  USING (true);

-- Clear existing tutorials (for re-seeding)
TRUNCATE public.visualizer_tutorials CASCADE;

-- ============================================
-- GRADIENT DESCENT VISUALIZER TUTORIAL
-- ============================================
INSERT INTO public.visualizer_tutorials (visualizer_type, title, description, tutorial_steps) VALUES
(
  'gradient-descent',
  'Gradient Descent Optimization',
  'Learn how gradient descent iteratively finds the minimum of a loss function',
  '[
    {
      "id": 1,
      "title": "Understanding the Landscape",
      "description": "The blue surface represents the loss function L(w,b). Gradient descent finds the lowest point on this surface.",
      "keyInstructions": ["Observe the shape of the surface", "Red dot = current position", "Lower altitude = lower loss"]
    },
    {
      "id": 2,
      "title": "Computing the Gradient",
      "description": "The gradient is a vector pointing in the direction of steepest increase. We move opposite to it.",
      "keyInstructions": ["Gradient = ∇L = [∂L/∂w, ∂L/∂b]", "Shows direction of steepest ascent", "We descend by moving opposite"]
    },
    {
      "id": 3,
      "title": "The Learning Rate",
      "description": "Learning rate controls step size. Too large = overshoot; too small = slow convergence.",
      "keyInstructions": ["η (eta) = learning rate", "New weights: w = w - η * ∇L", "Try different rates to see effect"]
    },
    {
      "id": 4,
      "title": "One Iteration",
      "description": "Each iteration: compute gradient at current point, move in opposite direction by η * gradient.",
      "keyInstructions": ["Step 1: Compute ∂L/∂w and ∂L/∂b at current (w,b)", "Step 2: Update w ← w - η * ∂L/∂w", "Step 3: Update b ← b - η * ∂L/∂b"]
    },
    {
      "id": 5,
      "title": "Convergence",
      "description": "After many iterations, the algorithm converges to a local minimum where gradients are near zero.",
      "keyInstructions": ["Red dot gets closer to minimum", "Loss decreases each step", "May get stuck in local minima"]
    },
    {
      "id": 6,
      "title": "Real-World Application",
      "description": "Neural networks use gradient descent to minimize prediction error and learn from data.",
      "keyInstructions": ["Used in backpropagation", "Works with millions of parameters", "Variants: SGD, Adam, RMSprop"]
    }
  ]'::jsonb
);

-- ============================================
-- K-MEANS CLUSTERING VISUALIZER TUTORIAL
-- ============================================
INSERT INTO public.visualizer_tutorials (visualizer_type, title, description, tutorial_steps) VALUES
(
  'kmeans',
  'K-Means Clustering Algorithm',
  'Discover how K-Means partitions data into K clusters by minimizing within-cluster variance',
  '[
    {
      "id": 1,
      "title": "The Goal",
      "description": "K-Means groups similar data points together. We start by randomly placing K centroids (cluster centers).",
      "keyInstructions": ["K = number of clusters", "Red, green, blue dots = K random centroids", "Goal: minimize total distance from points to centroids"]
    },
    {
      "id": 2,
      "title": "Assignment Step",
      "description": "Each data point is assigned to the nearest centroid, forming K clusters.",
      "keyInstructions": ["Color each point by nearest centroid", "Red points → red centroid", "Green points → green centroid", "Blue points → blue centroid"]
    },
    {
      "id": 3,
      "title": "Update Step",
      "description": "After assignment, recalculate each centroid as the mean (average) of all points in that cluster.",
      "keyInstructions": ["New red centroid = average of all red points", "New green centroid = average of all green points", "Centroids move to cluster centers"]
    },
    {
      "id": 4,
      "title": "Iteration & Convergence",
      "description": "Repeat assignment and update steps until centroids stop moving (convergence).",
      "keyInstructions": ["Iteration count increases", "Watch centroids stabilize", "Stop when no changes occur"]
    },
    {
      "id": 5,
      "title": "Evaluation",
      "description": "K-Means minimizes intra-cluster variance. Good clustering has tight, well-separated clusters.",
      "keyInstructions": ["Inertia = sum of squared distances to nearest centroid", "Lower inertia = better clustering", "Silhouette score measures separation"]
    },
    {
      "id": 6,
      "title": "Real-World Applications",
      "description": "K-Means is used for customer segmentation, image compression, document clustering, and more.",
      "keyInstructions": ["Unsupervised learning algorithm", "Scales well to large datasets", "Sensitive to initial centroid placement"]
    }
  ]'::jsonb
);

-- ============================================
-- INDEX FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_visualizer_tutorials_type ON public.visualizer_tutorials(visualizer_type);
