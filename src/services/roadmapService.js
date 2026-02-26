/**
 * Roadmap Service
 * Handles all adaptive skill graph roadmap logic
 */

import supabase from '../utils/supabaseClient';

// Mock data fallback for network issues
const MOCK_SKILLS = [
  // Tier 1: Python Fundamentals (Module 1)
  { id: '11111111-1111-1111-1111-111111111101', name: 'Python Syntax Basics', domain: 'python', difficulty: 1, estimated_minutes: 60, icon: '🐍', description: 'Variables, print statements, basic data types', is_published: true },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Numbers & Math', domain: 'python', difficulty: 1, estimated_minutes: 45, icon: '➕', description: 'Arithmetic operators, operator precedence, number types', is_published: true },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Strings & Text', domain: 'python', difficulty: 1, estimated_minutes: 50, icon: '📝', description: 'String manipulation, concatenation, formatting', is_published: true },
  
  // Tier 2: Control Flow (Module 1)
  { id: '11111111-1111-1111-1111-111111111201', name: 'Boolean Logic', domain: 'python', difficulty: 2, estimated_minutes: 40, icon: '✅', description: 'True/False, comparison operators, logical operators', is_published: true },
  { id: '11111111-1111-1111-1111-111111111202', name: 'Conditionals (If/Else)', domain: 'python', difficulty: 2, estimated_minutes: 50, icon: '🔀', description: 'If-else statements, elif chains, nested conditions', is_published: true },
  { id: '11111111-1111-1111-1111-111111111203', name: 'While Loops', domain: 'python', difficulty: 2, estimated_minutes: 55, icon: '🔁', description: 'While loops, break, continue, infinite loops', is_published: true },
  { id: '11111111-1111-1111-1111-111111111204', name: 'For Loops', domain: 'python', difficulty: 2, estimated_minutes: 55, icon: '🔄', description: 'For loops, range(), iteration patterns', is_published: true },
  
  // Tier 3: Data Structures (Module 1 & 2)
  { id: '11111111-1111-1111-1111-111111111301', name: 'Lists & Arrays', domain: 'python', difficulty: 2, estimated_minutes: 70, icon: '📋', description: 'List creation, indexing, slicing, list methods', is_published: true },
  { id: '11111111-1111-1111-1111-111111111302', name: 'Dictionaries', domain: 'python', difficulty: 2, estimated_minutes: 65, icon: '📚', description: 'Key-value pairs, dict methods, nested dictionaries', is_published: true },
  { id: '11111111-1111-1111-1111-111111111303', name: 'Functions', domain: 'python', difficulty: 2, estimated_minutes: 80, icon: '⚙️', description: 'Defining functions, parameters, return values', is_published: true },
  
  // Tier 4: Advanced Python (Module 1)
  { id: '11111111-1111-1111-1111-111111111401', name: 'File I/O', domain: 'python', difficulty: 3, estimated_minutes: 60, icon: '📁', description: 'Reading/writing files, CSV handling, file modes', is_published: true },
  { id: '11111111-1111-1111-1111-111111111402', name: 'Error Handling', domain: 'python', difficulty: 3, estimated_minutes: 55, icon: '⚠️', description: 'Try-except blocks, raising exceptions, debugging', is_published: true },
  { id: '11111111-1111-1111-1111-111111111403', name: 'Object-Oriented Programming', domain: 'python', difficulty: 3, estimated_minutes: 90, icon: '🎯', description: 'Classes, objects, inheritance, polymorphism', is_published: true },
  
  // Tier 5: Data Science (Module 2, 7)
  { id: '11111111-1111-1111-1111-111111111501', name: 'NumPy Basics', domain: 'python', difficulty: 3, estimated_minutes: 75, icon: '🔢', description: 'Arrays, vectorization, mathematical operations', is_published: true },
  { id: '11111111-1111-1111-1111-111111111502', name: 'Pandas DataFrames', domain: 'python', difficulty: 3, estimated_minutes: 90, icon: '🐼', description: 'DataFrames, Series, data manipulation', is_published: true },
  { id: '11111111-1111-1111-1111-111111111503', name: 'Data Visualization', domain: 'python', difficulty: 3, estimated_minutes: 70, icon: '📊', description: 'Matplotlib, Seaborn, plotting techniques', is_published: true },
  
  // Tier 6: Machine Learning (Module 3)
  { id: '11111111-1111-1111-1111-111111111601', name: 'ML Fundamentals', domain: 'python', difficulty: 4, estimated_minutes: 100, icon: '🤖', description: 'Supervised/unsupervised learning, train/test split', is_published: true },
  { id: '11111111-1111-1111-1111-111111111602', name: 'Linear Regression', domain: 'python', difficulty: 4, estimated_minutes: 85, icon: '📈', description: 'Simple/multiple regression, cost functions', is_published: true },
  { id: '11111111-1111-1111-1111-111111111603', name: 'Classification Models', domain: 'python', difficulty: 4, estimated_minutes: 90, icon: '🎯', description: 'Logistic regression, decision trees, evaluation metrics', is_published: true },
  
  // Tier 7: Deep Learning (Module 4)
  { id: '11111111-1111-1111-1111-111111111701', name: 'Neural Networks', domain: 'python', difficulty: 5, estimated_minutes: 120, icon: '🧠', description: 'Perceptrons, activation functions, backpropagation', is_published: true },
  { id: '11111111-1111-1111-1111-111111111702', name: 'Convolutional Networks (CNN)', domain: 'python', difficulty: 5, estimated_minutes: 110, icon: '🖼️', description: 'Conv layers, pooling, image classification', is_published: true },
  { id: '11111111-1111-1111-1111-111111111703', name: 'Recurrent Networks (RNN)', domain: 'python', difficulty: 5, estimated_minutes: 105, icon: '♻️', description: 'LSTM, GRU, sequence modeling', is_published: true },
  
  // Tier 8: Specializations
  { id: '11111111-1111-1111-1111-111111111801', name: 'NLP Fundamentals', domain: 'python', difficulty: 5, estimated_minutes: 100, icon: '💬', description: 'Text processing, tokenization, embeddings', is_published: true },
  { id: '11111111-1111-1111-1111-111111111802', name: 'Computer Vision', domain: 'python', difficulty: 5, estimated_minutes: 105, icon: '👁️', description: 'Image processing, object detection, OpenCV', is_published: true },
  { id: '11111111-1111-1111-1111-111111111803', name: 'Web Development', domain: 'python', difficulty: 4, estimated_minutes: 95, icon: '🌐', description: 'Flask/Django, REST APIs, web frameworks', is_published: true },
];

const MOCK_MASTERY = [
  // Completed: Tier 1 - Python Fundamentals
  { skill_id: '11111111-1111-1111-1111-111111111101', mastery: 1.0, status: 'mastered', completed_at: new Date() },
  { skill_id: '11111111-1111-1111-1111-111111111102', mastery: 1.0, status: 'mastered', completed_at: new Date() },
  { skill_id: '11111111-1111-1111-1111-111111111103', mastery: 0.95, status: 'mastered', completed_at: new Date() },
  
  // In Progress: Tier 2
  { skill_id: '11111111-1111-1111-1111-111111111201', mastery: 0.6, status: 'in_progress' },
  { skill_id: '11111111-1111-1111-1111-111111111202', mastery: 0.3, status: 'in_progress' },
  
  // Eligible: Rest of Tier 2
  { skill_id: '11111111-1111-1111-1111-111111111203', mastery: 0.0, status: 'eligible' },
  { skill_id: '11111111-1111-1111-1111-111111111204', mastery: 0.0, status: 'eligible' },
];

const MOCK_DEPENDENCIES = [
  // Tier 2 depends on Tier 1
  { skill_id: '11111111-1111-1111-1111-111111111201', depends_on: '11111111-1111-1111-1111-111111111101' },
  { skill_id: '11111111-1111-1111-1111-111111111202', depends_on: '11111111-1111-1111-1111-111111111201' },
  { skill_id: '11111111-1111-1111-1111-111111111203', depends_on: '11111111-1111-1111-1111-111111111202' },
  { skill_id: '11111111-1111-1111-1111-111111111204', depends_on: '11111111-1111-1111-1111-111111111203' },
  
  // Tier 3 depends on Tier 2
  { skill_id: '11111111-1111-1111-1111-111111111301', depends_on: '11111111-1111-1111-1111-111111111204' },
  { skill_id: '11111111-1111-1111-1111-111111111302', depends_on: '11111111-1111-1111-1111-111111111301' },
  { skill_id: '11111111-1111-1111-1111-111111111303', depends_on: '11111111-1111-1111-1111-111111111202' },
  
  // Tier 4 depends on Tier 3
  { skill_id: '11111111-1111-1111-1111-111111111401', depends_on: '11111111-1111-1111-1111-111111111303' },
  { skill_id: '11111111-1111-1111-1111-111111111402', depends_on: '11111111-1111-1111-1111-111111111303' },
  { skill_id: '11111111-1111-1111-1111-111111111403', depends_on: '11111111-1111-1111-1111-111111111303' },
  
  // Tier 5 depends on Tier 3 & 4
  { skill_id: '11111111-1111-1111-1111-111111111501', depends_on: '11111111-1111-1111-1111-111111111301' },
  { skill_id: '11111111-1111-1111-1111-111111111502', depends_on: '11111111-1111-1111-1111-111111111501' },
  { skill_id: '11111111-1111-1111-1111-111111111503', depends_on: '11111111-1111-1111-1111-111111111502' },
  
  // Tier 6 depends on Tier 5
  { skill_id: '11111111-1111-1111-1111-111111111601', depends_on: '11111111-1111-1111-1111-111111111502' },
  { skill_id: '11111111-1111-1111-1111-111111111602', depends_on: '11111111-1111-1111-1111-111111111601' },
  { skill_id: '11111111-1111-1111-1111-111111111603', depends_on: '11111111-1111-1111-1111-111111111602' },
  
  // Tier 7 depends on Tier 6
  { skill_id: '11111111-1111-1111-1111-111111111701', depends_on: '11111111-1111-1111-1111-111111111603' },
  { skill_id: '11111111-1111-1111-1111-111111111702', depends_on: '11111111-1111-1111-1111-111111111701' },
  { skill_id: '11111111-1111-1111-1111-111111111703', depends_on: '11111111-1111-1111-1111-111111111701' },
  
  // Tier 8 Specializations depend on Tier 7
  { skill_id: '11111111-1111-1111-1111-111111111801', depends_on: '11111111-1111-1111-1111-111111111701' },
  { skill_id: '11111111-1111-1111-1111-111111111802', depends_on: '11111111-1111-1111-1111-111111111702' },
  { skill_id: '11111111-1111-1111-1111-111111111803', depends_on: '11111111-1111-1111-1111-111111111403' },
];

const MOCK_LESSONS = {
  // ============ TIER 1: Python Fundamentals (Module 1) ============
  '11111111-1111-1111-1111-111111111101': [ // Python Syntax Basics
    { id: 1, moduleId: 1, title: 'Introduction to Python', description: 'Get started with Python basics and syntax', difficulty: 'beginner', estimated_minutes: 20, status: 'completed', score: 1.0 },
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'Learn how to store and use values in Python', difficulty: 'beginner', estimated_minutes: 25, status: 'completed', score: 1.0 },
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Master the fundamentals', difficulty: 'beginner', estimated_minutes: 15, status: 'completed', score: 1.0 },
  ],
  '11111111-1111-1111-1111-111111111102': [ // Numbers & Math
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'Working with numbers and arithmetic', difficulty: 'beginner', estimated_minutes: 20, status: 'completed', score: 1.0 },
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Mathematical operations in Python', difficulty: 'beginner', estimated_minutes: 15, status: 'completed', score: 1.0 },
  ],
  '11111111-1111-1111-1111-111111111103': [ // Strings & Text
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'String data type and operations', difficulty: 'beginner', estimated_minutes: 20, status: 'completed', score: 0.95 },
    { id: 1, moduleId: 1, title: 'Playing with Strings', description: 'String manipulation and essential operations', difficulty: 'beginner', estimated_minutes: 25, status: 'completed', score: 0.85 },
  ],
  
  // ============ TIER 2: Control Flow (Module 1) ============
  '11111111-1111-1111-1111-111111111201': [ // Boolean Logic
    { id: 3, moduleId: 1, title: 'Control Flow', description: 'Boolean values and logical operators', difficulty: 'beginner', estimated_minutes: 20, status: 'in_progress', score: 0.6 },
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'Understanding True/False and comparisons', difficulty: 'beginner', estimated_minutes: 15, status: 'completed', score: 1.0 },
  ],
  '11111111-1111-1111-1111-111111111202': [ // Conditionals
    { id: 3, moduleId: 1, title: 'Control Flow', description: 'If-else statements and decision making', difficulty: 'beginner', estimated_minutes: 30, status: 'in_progress', score: 0.3 },
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Conditional logic basics', difficulty: 'beginner', estimated_minutes: 15, status: 'eligible' },
  ],
  '11111111-1111-1111-1111-111111111203': [ // While Loops
    { id: 3, moduleId: 1, title: 'Control Flow', description: 'While loops and iteration patterns', difficulty: 'beginner', estimated_minutes: 25, status: 'eligible' },
  ],
  '11111111-1111-1111-1111-111111111204': [ // For Loops
    { id: 3, moduleId: 1, title: 'Control Flow', description: 'For loops, range(), and list iteration', difficulty: 'beginner', estimated_minutes: 25, status: 'eligible' },
  ],
  
  // ============ TIER 3: Data Structures (Module 1) ============
  '11111111-1111-1111-1111-111111111301': [ // Lists & Arrays
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Working with lists and collections', difficulty: 'beginner', estimated_minutes: 30, status: 'locked' },
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'List data structures', difficulty: 'beginner', estimated_minutes: 25, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111302': [ // Dictionaries
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Key-value pairs with dictionaries', difficulty: 'beginner', estimated_minutes: 30, status: 'locked' },
    { id: 2, moduleId: 1, title: 'Variables and Data Types', description: 'Dictionary operations', difficulty: 'beginner', estimated_minutes: 20, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111303': [ // Functions
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Defining and using functions', difficulty: 'beginner', estimated_minutes: 35, status: 'locked' },
  ],
  
  // ============ TIER 4: Advanced Python (Module 1) ============
  '11111111-1111-1111-1111-111111111401': [ // File I/O
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Reading and writing files', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111402': [ // Error Handling
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Exception handling and debugging', difficulty: 'intermediate', estimated_minutes: 25, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111403': [ // OOP
    { id: 1, moduleId: 1, title: 'Python Basics', description: 'Classes and object-oriented programming', difficulty: 'intermediate', estimated_minutes: 40, status: 'locked' },
  ],
  
  // ============ TIER 5: Data Science (Modules 2, 7) ============
  '11111111-1111-1111-1111-111111111501': [ // NumPy
    { id: 1, moduleId: 2, title: 'Introduction to Pandas', description: 'NumPy fundamentals for data science', difficulty: 'intermediate', estimated_minutes: 35, status: 'locked' },
    { id: 2, moduleId: 2, title: 'Data Frames and Series', description: 'Working with NumPy arrays', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111502': [ // Pandas DataFrames
    { id: 1, moduleId: 2, title: 'Introduction to Pandas', description: 'Getting started with Pandas', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
    { id: 2, moduleId: 2, title: 'Data Frames and Series', description: 'Master DataFrames and Series', difficulty: 'intermediate', estimated_minutes: 35, status: 'locked' },
    { id: 3, moduleId: 2, title: 'Data Cleaning', description: 'Clean and prepare data', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111503': [ // Data Visualization
    { id: 1, moduleId: 7, title: 'Visualization Principles', description: 'Learn data visualization best practices', difficulty: 'intermediate', estimated_minutes: 25, status: 'locked' },
    { id: 2, moduleId: 7, title: 'Creating Basic Charts', description: 'Build charts with Matplotlib & Seaborn', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
    { id: 3, moduleId: 7, title: 'Interactive Visualizations', description: 'Create interactive plots', difficulty: 'intermediate', estimated_minutes: 25, status: 'locked' },
    { id: 5, projectId: 5, title: 'Data Visualization Dashboard', description: 'Build an interactive COVID-19 dashboard', difficulty: 'medium', estimated_minutes: 120, status: 'locked', isProject: true },
  ],
  
  // ============ TIER 6: Machine Learning (Module 3) ============
  '11111111-1111-1111-1111-111111111601': [ // ML Fundamentals
    { id: 1, moduleId: 3, title: 'Introduction to ML', description: 'Machine learning concepts and overview', difficulty: 'intermediate', estimated_minutes: 40, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111602': [ // Linear Regression
    { id: 2, moduleId: 3, title: 'Linear Regression', description: 'Build regression models', difficulty: 'intermediate', estimated_minutes: 35, status: 'locked' },
    { id: 3, projectId: 3, title: 'Predict Stock Prices', description: 'Time series prediction project', difficulty: 'hard', estimated_minutes: 180, status: 'locked', isProject: true },
  ],
  '11111111-1111-1111-1111-111111111603': [ // Classification
    { id: 3, moduleId: 3, title: 'Classification', description: 'Classification algorithms and metrics', difficulty: 'intermediate', estimated_minutes: 35, status: 'locked' },
  ],
  
  // ============ TIER 7: Deep Learning (Module 4) ============
  '11111111-1111-1111-1111-111111111701': [ // Neural Networks
    { id: 1, moduleId: 4, title: 'Neural Network Fundamentals', description: 'Learn how neural networks work', difficulty: 'advanced', estimated_minutes: 45, status: 'locked' },
    { id: 2, moduleId: 4, title: 'Building Your First Neural Network', description: 'Create your first neural net', difficulty: 'advanced', estimated_minutes: 40, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111702': [ // CNN
    { id: 3, moduleId: 4, title: 'Convolutional Neural Networks', description: 'CNNs for image processing', difficulty: 'advanced', estimated_minutes: 50, status: 'locked' },
    { id: 2, projectId: 2, title: 'Image Classifier (CIFAR-10)', description: 'Build a CNN for image classification', difficulty: 'medium', estimated_minutes: 150, status: 'locked', isProject: true },
  ],
  '11111111-1111-1111-1111-111111111703': [ // RNN
    { id: 1, moduleId: 4, title: 'Neural Network Fundamentals', description: 'Recurrent neural networks', difficulty: 'advanced', estimated_minutes: 40, status: 'locked' },
  ],
  
  // ============ TIER 8: Specializations ============
  '11111111-1111-1111-1111-111111111801': [ // NLP
    { id: 1, moduleId: 5, title: 'Text Processing Basics', description: 'NLP fundamentals', difficulty: 'advanced', estimated_minutes: 35, status: 'locked' },
    { id: 2, moduleId: 5, title: 'Sentiment Analysis', description: 'Analyze sentiment in text', difficulty: 'advanced', estimated_minutes: 40, status: 'locked' },
    { id: 3, moduleId: 5, title: 'Building a Text Classifier', description: 'Create an NLP classifier', difficulty: 'advanced', estimated_minutes: 35, status: 'locked' },
    { id: 1, projectId: 1, title: 'Sentiment Analyzer', description: 'Build sentiment analysis model', difficulty: 'easy', estimated_minutes: 90, status: 'locked', isProject: true },
    { id: 4, projectId: 4, title: 'Chatbot with Transformer', description: 'Build an AI chatbot', difficulty: 'hard', estimated_minutes: 180, status: 'locked', isProject: true },
  ],
  '11111111-1111-1111-1111-111111111802': [ // Computer Vision
    { id: 1, moduleId: 6, title: 'Image Processing Fundamentals', description: 'Computer vision basics', difficulty: 'advanced', estimated_minutes: 35, status: 'locked' },
    { id: 2, moduleId: 6, title: 'Object Detection', description: 'Detect objects in images', difficulty: 'advanced', estimated_minutes: 40, status: 'locked' },
    { id: 3, moduleId: 6, title: 'Building an Image Classifier', description: 'Create image classification models', difficulty: 'advanced', estimated_minutes: 40, status: 'locked' },
  ],
  '11111111-1111-1111-1111-111111111803': [ // Web Development
    { id: 1, moduleId: 9, title: 'Web Development Basics', description: 'Web framework fundamentals', difficulty: 'intermediate', estimated_minutes: 30, status: 'locked' },
    { id: 2, moduleId: 9, title: 'Building a Flask API', description: 'Create REST APIs with Flask', difficulty: 'intermediate', estimated_minutes: 40, status: 'locked' },
    { id: 3, moduleId: 9, title: 'Full Stack Integration', description: 'Build full stack applications', difficulty: 'intermediate', estimated_minutes: 50, status: 'locked' },
  ],
};

class RoadmapService {
  /**
   * Get personalized roadmap for a user
   * @param {string} userId - User ID
   * @param {string} domain - Domain filter (python, ml, dsa, ai)
   * @returns {Object} Roadmap with recommended and all skills
   */
  async getRoadmap(userId, domain = 'python') {
    try {
      // Add timeout to fail fast if network is slow
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      // 1. Get all skills for domain
      const skillsPromise = supabase
        .from('skills')
        .select('*')
        .eq('domain', domain)
        .eq('is_published', true)
        .order('difficulty', { ascending: true });

      const { data: skills, error: skillsError } = await Promise.race([skillsPromise, timeoutPromise]);

      if (skillsError) throw skillsError;

      // 2. Get user's mastery records
      const masteryPromise = supabase
        .from('user_skill_mastery')
        .select('skill_id, mastery, status, started_at, completed_at')
        .eq('user_id', userId);

      const { data: masteryData, error: masteryError } = await Promise.race([masteryPromise, timeoutPromise]);

      if (masteryError) throw masteryError;

      // Build mastery lookup by skill_id
      const masteryMap = {};
      (masteryData || []).forEach(m => {
        masteryMap[m.skill_id] = m;
      });

      // Attach mastery to each skill
      const skillsWithMastery = skills.map(skill => ({
        ...skill,
        user_skill_mastery: masteryMap[skill.id] ? [masteryMap[skill.id]] : []
      }));

      // 3. Get all dependencies
      const depsPromise = supabase
        .from('skill_dependencies')
        .select('skill_id, depends_on');

      const { data: dependencies, error: depsError } = await Promise.race([depsPromise, timeoutPromise]);

      if (depsError) throw depsError;

      // 4. Process skills with user mastery
      const processedSkills = await this._processSkills(skillsWithMastery, dependencies, userId);

      // 5. Get eligible skills and rank them
      const eligibleSkills = processedSkills.filter(s => s.status === 'eligible');
      const recommendedSkills = this._rankSkills(eligibleSkills);

      // 6. Calculate stats
      const stats = this._calculateStats(processedSkills);

      return {
        recommended: recommendedSkills.slice(0, 5),
        all: processedSkills,
        stats,
        dependencies: this._buildDependencyMap(dependencies)
      };
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      console.warn('Using mock data fallback due to network error');
      
      // Fallback to mock data for network issues
      return this._getMockRoadmap(userId, domain);
    }
  }

  /**
   * Get mock roadmap data (fallback for network issues)
   */
  _getMockRoadmap(userId, domain) {
    // Build mastery map
    const masteryMap = {};
    MOCK_MASTERY.forEach(m => {
      masteryMap[m.skill_id] = m;
    });

    // Attach mastery to skills
    const skillsWithMastery = MOCK_SKILLS.map(skill => ({
      ...skill,
      user_skill_mastery: masteryMap[skill.id] ? [masteryMap[skill.id]] : []
    }));

    // Process skills
    const processedSkills = this._processSkills(skillsWithMastery, MOCK_DEPENDENCIES, userId);

    // Get eligible and rank
    const eligibleSkills = processedSkills.filter(s => s.status === 'eligible');
    const recommendedSkills = this._rankSkills(eligibleSkills);

    // Calculate stats
    const stats = this._calculateStats(processedSkills);

    return {
      recommended: recommendedSkills.slice(0, 5),
      all: processedSkills,
      stats,
      dependencies: this._buildDependencyMap(MOCK_DEPENDENCIES)
    };
  }

  /**
   * Update mastery when a lesson is completed
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {number} score - Score (0-1)
   */
  async updateMasteryFromLesson(userId, lessonId, score) {
    try {
      // 1. Get skills linked to this lesson
      const { data: lessonSkills, error } = await supabase
        .from('lesson_skills')
        .select('skill_id, contribution')
        .eq('lesson_id', lessonId);

      if (error) throw error;

      // 2. Update mastery for each skill
      for (const { skill_id, contribution } of lessonSkills) {
        const delta = score * contribution;
        
        await supabase.rpc('increment_mastery', {
          p_user_id: userId,
          p_skill_id: skill_id,
          p_delta: delta
        });
      }

      // 3. Check for newly unlocked skills
      await this.checkAndUnlockSkills(userId);

      return { success: true };
    } catch (error) {
      console.error('Error updating mastery:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and unlock skills whose dependencies are met
   * @param {string} userId - User ID
   */
  async checkAndUnlockSkills(userId) {
    try {
      // Get all locked skills
      const { data: lockedSkills, error: lockedError } = await supabase
        .from('user_skill_mastery')
        .select('skill_id')
        .eq('user_id', userId)
        .eq('status', 'locked');

      if (lockedError) throw lockedError;

      // Check each locked skill
      for (const { skill_id } of lockedSkills || []) {
        const { data: depsMet } = await supabase.rpc('check_dependencies_met', {
          p_user_id: userId,
          p_skill_id: skill_id
        });

        if (depsMet) {
          // Unlock the skill
          await supabase
            .from('user_skill_mastery')
            .update({ status: 'eligible' })
            .eq('user_id', userId)
            .eq('skill_id', skill_id);
        }
      }
    } catch (error) {
      console.error('Error checking unlocks:', error);
    }
  }

  /**
   * Initialize roadmap for new user
   * @param {string} userId - User ID
   */
  async initializeUserRoadmap(userId) {
    try {
      // Get all skills
      const { data: allSkills, error } = await supabase
        .from('skills')
        .select('id')
        .eq('is_published', true);

      if (error) throw error;

      // Get all skill IDs that have dependencies (i.e., are NOT root)
      const { data: depSkills, error: depError } = await supabase
        .from('skill_dependencies')
        .select('skill_id');

      if (depError) throw depError;

      const nonRootIds = new Set((depSkills || []).map(d => d.skill_id));

      // Create mastery records for all skills
      const masteryRecords = allSkills.map(skill => ({
        user_id: userId,
        skill_id: skill.id,
        mastery: 0.0,
        status: nonRootIds.has(skill.id) ? 'locked' : 'eligible'
      }));

      const { error: insertError } = await supabase
        .from('user_skill_mastery')
        .insert(masteryRecords);

      if (insertError) throw insertError;

      return { success: true };
    } catch (error) {
      console.error('Error initializing roadmap:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get skill details with lessons
   * @param {string} skillId - Skill ID
   */
  async getSkillDetails(skillId) {
    try {
      // Get skill
      const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();

      if (skillError) throw skillError;

      // Get lesson mappings for this skill
      const { data: lessonSkills } = await supabase
        .from('lesson_skills')
        .select('lesson_id, contribution')
        .eq('skill_id', skillId);

      // Get dependency skill IDs
      const { data: deps } = await supabase
        .from('skill_dependencies')
        .select('depends_on')
        .eq('skill_id', skillId);

      // Fetch dependency skill names
      let dependencies = [];
      if (deps && deps.length > 0) {
        const depIds = deps.map(d => d.depends_on);
        const { data: depSkills } = await supabase
          .from('skills')
          .select('id, name, icon')
          .in('id', depIds);
        dependencies = (depSkills || []).map(s => ({ depends_on: s.id, skills: s }));
      }

      return {
        ...skill,
        lesson_skills: lessonSkills || [],
        dependencies
      };
    } catch (error) {
      console.error('Error fetching skill details:', error);
      
      // Fallback to mock data
      const mockSkill = MOCK_SKILLS.find(s => s.id === skillId);
      if (mockSkill) {
        const mockDeps = MOCK_DEPENDENCIES.filter(d => d.skill_id === skillId);
        const dependencies = mockDeps.map(d => {
          const depSkill = MOCK_SKILLS.find(s => s.id === d.depends_on);
          return { depends_on: d.depends_on, skills: depSkill };
        });
        
        return {
          ...mockSkill,
          lesson_skills: [],
          dependencies
        };
      }
      
      throw error;
    }
  }

  /**
   * Get lessons for a specific skill (MVP: Duolingo-style lesson list)
   * @param {string} skillId - Skill ID
   * @param {string} userId - User ID (for progress tracking)
   * @returns {Object} Skill with lessons and progress
   */
  async getLessonsForSkill(skillId, userId) {
    try {
      // Get skill info
      const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();

      if (skillError) throw skillError;

      // Get lessons linked to this skill
      const { data: lessonSkills, error: lessonError } = await supabase
        .from('lesson_skills')
        .select(`
          lesson_id,
          contribution,
          lessons (
            id,
            title,
            description,
            difficulty,
            estimated_minutes,
            type
          )
        `)
        .eq('skill_id', skillId);

      if (lessonError) throw lessonError;

      // Get user's lesson progress
      const lessonIds = (lessonSkills || []).map(ls => ls.lessons?.id).filter(Boolean);
      let userProgress = [];
      
      if (lessonIds.length > 0) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('lesson_id, status, score, completed_at')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds);
        
        userProgress = progress || [];
      }

      // Build progress map
      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.lesson_id] = p;
      });

      // Combine lessons with progress
      const lessons = (lessonSkills || []).map(ls => {
        const lesson = ls.lessons;
        const progress = progressMap[lesson.id];
        
        return {
          ...lesson,
          contribution: ls.contribution,
          status: progress?.status || 'locked',
          score: progress?.score || null,
          completed_at: progress?.completed_at || null
        };
      });

      return {
        skill,
        lessons,
        totalLessons: lessons.length,
        completedLessons: lessons.filter(l => l.status === 'completed').length
      };
    } catch (error) {
      console.error('Error fetching lessons for skill:', error);
      console.warn('Using mock lesson data fallback');
      
      // Fallback to mock data
      const mockSkill = MOCK_SKILLS.find(s => s.id === skillId);
      const mockLessons = MOCK_LESSONS[skillId] || [];
      
      if (!mockSkill) throw error;

      return {
        skill: mockSkill,
        lessons: mockLessons,
        totalLessons: mockLessons.length,
        completedLessons: mockLessons.filter(l => l.status === 'completed').length
      };
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Process skills with user mastery data
   */
  _processSkills(skills, dependencies, userId) {
    return skills.map(skill => {
      const userMastery = skill.user_skill_mastery?.[0] || null;
      
      return {
        id: skill.id,
        name: skill.name,
        domain: skill.domain,
        difficulty: skill.difficulty,
        estimatedMinutes: skill.estimated_minutes,
        icon: skill.icon,
        description: skill.description,
        mastery: userMastery?.mastery || 0.0,
        status: userMastery?.status || 'locked',
        startedAt: userMastery?.started_at,
        completedAt: userMastery?.completed_at,
        dependencies: dependencies
          .filter(d => d.skill_id === skill.id)
          .map(d => d.depends_on)
      };
    });
  }

  /**
   * Rank skills by priority
   */
  _rankSkills(eligibleSkills) {
    return eligibleSkills
      .map(skill => ({
        ...skill,
        priority: this._calculatePriority(skill)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate priority score for a skill
   */
  _calculatePriority(skill) {
    // Priority formula:
    // - Higher for low mastery (room to grow)
    // - Higher for appropriate difficulty
    // - Boost for skills that unlock many others
    
    const masteryGap = 1 - skill.mastery; // 0.0 to 1.0
    const difficultyScore = skill.difficulty / 5; // normalize to 0-1
    
    return (
      masteryGap * 0.6 +           // 60% weight on learning potential
      difficultyScore * 0.2 +      // 20% weight on challenge
      Math.random() * 0.2          // 20% randomization for variety
    );
  }

  /**
   * Calculate roadmap statistics
   */
  _calculateStats(skills) {
    const total = skills.length;
    const mastered = skills.filter(s => s.status === 'mastered').length;
    const inProgress = skills.filter(s => s.status === 'in_progress').length;
    const eligible = skills.filter(s => s.status === 'eligible').length;
    const locked = skills.filter(s => s.status === 'locked').length;

    const avgMastery = skills.reduce((sum, s) => sum + s.mastery, 0) / total;
    
    return {
      total,
      mastered,
      inProgress,
      eligible,
      locked,
      percentComplete: Math.round((mastered / total) * 100),
      averageMastery: Math.round(avgMastery * 100)
    };
  }

  /**
   * Build dependency map for visualization
   */
  _buildDependencyMap(dependencies) {
    const map = {};
    dependencies.forEach(({ skill_id, depends_on }) => {
      if (!map[skill_id]) map[skill_id] = [];
      map[skill_id].push(depends_on);
    });
    return map;
  }
}

// Export singleton instance
const roadmapServiceInstance = new RoadmapService();
export default roadmapServiceInstance;
