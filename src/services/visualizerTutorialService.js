import supabase from '../utils/supabaseClient';

/**
 * Service for fetching visualizer tutorial data from Supabase
 * Replaces hardcoded tutorial data in visualizer components
 */

let tutorialCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch all visualizer tutorials from the database
 * @returns {Promise<Object>} Object with visualizer type as key and tutorial data as value
 */
export async function fetchAllTutorials() {
  try {
    // Check cache
    const now = Date.now();
    if (Object.keys(tutorialCache).length > 0 && now - cacheTimestamp < CACHE_DURATION) {
      console.log('📓 Using cached tutorials');
      return tutorialCache;
    }

    console.log('📚 Fetching visualizer tutorials from Supabase...');

    const { data, error } = await supabase
      .from('visualizer_tutorials')
      .select('*');

    if (error) {
      console.error('❌ Error fetching tutorials:', error.message);
      return getFallbackTutorials();
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No tutorials found in database');
      return getFallbackTutorials();
    }

    // Transform data into tutorial cache by type
    tutorialCache = {};
    data.forEach(tutorial => {
      tutorialCache[tutorial.visualizer_type] = {
        title: tutorial.title,
        description: tutorial.description,
        steps: tutorial.tutorial_steps
      };
    });

    cacheTimestamp = now;
    console.log('✅ Successfully loaded tutorials from database');
    return tutorialCache;
  } catch (err) {
    console.error('❌ Unexpected error fetching tutorials:', err);
    return getFallbackTutorials();
  }
}

/**
 * Fetch a specific visualizer's tutorial
 * @param {string} visualizerType - The type of visualizer (e.g., 'gradient-descent', 'kmeans')
 * @returns {Promise<Object|null>} Tutorial data or null if not found
 */
export async function fetchTutorial(visualizerType) {
  try {
    const allTutorials = await fetchAllTutorials();
    return allTutorials[visualizerType] || null;
  } catch (err) {
    console.error(`❌ Error fetching ${visualizerType} tutorial:`, err);
    return null;
  }
}

/**
 * Fallback tutorials in case database is unavailable
 * These match the original hardcoded data structure
 */
function getFallbackTutorials() {
  console.log('⚠️ Using fallback (hardcoded) tutorials');
  return {
    'gradient-descent': {
      title: 'Gradient Descent Optimization',
      description: 'Learn how gradient descent iteratively finds the minimum of a loss function',
      steps: [
        {
          id: 1,
          title: 'Understanding the Landscape',
          description: 'The blue surface represents the loss function L(w,b). Gradient descent finds the lowest point on this surface.',
          keyInstructions: [
            'Observe the shape of the surface',
            'Red dot = current position',
            'Lower altitude = lower loss'
          ]
        },
        {
          id: 2,
          title: 'Computing the Gradient',
          description: 'The gradient is a vector pointing in the direction of steepest increase. We move opposite to it.',
          keyInstructions: [
            'Gradient = ∇L = [∂L/∂w, ∂L/∂b]',
            'Shows direction of steepest ascent',
            'We descend by moving opposite'
          ]
        },
        {
          id: 3,
          title: 'The Learning Rate',
          description: 'Learning rate controls step size. Too large = overshoot; too small = slow convergence.',
          keyInstructions: [
            'η (eta) = learning rate',
            'New weights: w = w - η * ∇L',
            'Try different rates to see effect'
          ]
        },
        {
          id: 4,
          title: 'One Iteration',
          description: 'Each iteration: compute gradient at current point, move in opposite direction by η * gradient.',
          keyInstructions: [
            'Step 1: Compute ∂L/∂w and ∂L/∂b at current (w,b)',
            'Step 2: Update w ← w - η * ∂L/∂w',
            'Step 3: Update b ← b - η * ∂L/∂b'
          ]
        },
        {
          id: 5,
          title: 'Convergence',
          description: 'After many iterations, the algorithm converges to a local minimum where gradients are near zero.',
          keyInstructions: [
            'Red dot gets closer to minimum',
            'Loss decreases each step',
            'May get stuck in local minima'
          ]
        },
        {
          id: 6,
          title: 'Real-World Application',
          description: 'Neural networks use gradient descent to minimize prediction error and learn from data.',
          keyInstructions: [
            'Used in backpropagation',
            'Works with millions of parameters',
            'Variants: SGD, Adam, RMSprop'
          ]
        }
      ]
    },
    'kmeans': {
      title: 'K-Means Clustering Algorithm',
      description: 'Discover how K-Means partitions data into K clusters by minimizing within-cluster variance',
      steps: [
        {
          id: 1,
          title: 'The Goal',
          description: 'K-Means groups similar data points together. We start by randomly placing K centroids (cluster centers).',
          keyInstructions: [
            'K = number of clusters',
            'Red, green, blue dots = K random centroids',
            'Goal: minimize total distance from points to centroids'
          ]
        },
        {
          id: 2,
          title: 'Assignment Step',
          description: 'Each data point is assigned to the nearest centroid, forming K clusters.',
          keyInstructions: [
            'Color each point by nearest centroid',
            'Red points → red centroid',
            'Green points → green centroid',
            'Blue points → blue centroid'
          ]
        },
        {
          id: 3,
          title: 'Update Step',
          description: 'After assignment, recalculate each centroid as the mean (average) of all points in that cluster.',
          keyInstructions: [
            'New red centroid = average of all red points',
            'New green centroid = average of all green points',
            'Centroids move to cluster centers'
          ]
        },
        {
          id: 4,
          title: 'Iteration & Convergence',
          description: 'Repeat assignment and update steps until centroids stop moving (convergence).',
          keyInstructions: [
            'Iteration count increases',
            'Watch centroids stabilize',
            'Stop when no changes occur'
          ]
        },
        {
          id: 5,
          title: 'Evaluation',
          description: 'K-Means minimizes intra-cluster variance. Good clustering has tight, well-separated clusters.',
          keyInstructions: [
            'Inertia = sum of squared distances to nearest centroid',
            'Lower inertia = better clustering',
            'Silhouette score measures separation'
          ]
        },
        {
          id: 6,
          title: 'Real-World Applications',
          description: 'K-Means is used for customer segmentation, image compression, document clustering, and more.',
          keyInstructions: [
            'Unsupervised learning algorithm',
            'Scales well to large datasets',
            'Sensitive to initial centroid placement'
          ]
        }
      ]
    }
  };
}

/**
 * Preload all tutorials to warm up the cache
 * Call this on app startup if desired
 */
export async function preloadTutorials() {
  try {
    console.log('🔄 Preloading visualizer tutorials...');
    await fetchAllTutorials();
    console.log('✅ Tutorials preloaded');
  } catch (err) {
    console.error('❌ Failed to preload tutorials:', err);
  }
}
