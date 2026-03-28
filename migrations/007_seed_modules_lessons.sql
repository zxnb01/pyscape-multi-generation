-- ============================================
-- SEED: Modules and Lessons
-- Migration 007: Populate modules & lessons tables
-- from the hardcoded modules.json data
-- ============================================

-- Clear existing data (for clean re-seeding)
TRUNCATE public.lessons, public.modules CASCADE;

-- Reset sequences
ALTER SEQUENCE modules_id_seq RESTART WITH 1;
ALTER SEQUENCE lessons_id_seq RESTART WITH 1;

-- ============================================
-- MODULES (10 modules from modules.json)
-- ============================================

INSERT INTO public.modules (id, title, description, difficulty, prerequisites, estimated_hours, order_index, tags, is_published) VALUES
(1,  'Python Fundamentals',           'Learn the basics of Python programming language including variables, data types, control flow, functions, and more.',                      'beginner',      '{}',       15, 1,  ARRAY['python', 'programming', 'learn-programming'],                          true),
(2,  'Data Science with Pandas',      'Master data manipulation and analysis with Pandas, a powerful Python library for working with structured data.',                             'intermediate',  '{1}',      14, 2,  ARRAY['data-science', 'pandas', 'data-analytics', 'numpy'],                    true),
(3,  'Machine Learning Basics',       'Introduction to machine learning concepts and algorithms including supervised and unsupervised learning.',                                   'intermediate',  '{1,2}',    15, 3,  ARRAY['machine-learning', 'supervised-ml', 'unsupervised-ml'],                 true),
(4,  'Neural Networks & Deep Learning','Build and train neural networks for various applications using modern deep learning techniques.',                                           'advanced',      '{1,3}',    18, 4,  ARRAY['deep-learning', 'neural-networks', 'cnn', 'rnn'],                       true),
(5,  'Natural Language Processing',   'Process and analyze text data using NLP techniques and transformer models.',                                                                 'advanced',      '{1,4}',    14, 5,  ARRAY['nlp', 'text-preprocessing', 'transformers', 'sentiment-analysis'],       true),
(6,  'Computer Vision',               'Learn computer vision techniques for image processing, object detection, and recognition.',                                                  'advanced',      '{1,4}',    16, 6,  ARRAY['computer-vision', 'image-processing', 'object-detection', 'opencv'],    true),
(7,  'Data Visualization',            'Create effective data visualizations using Python libraries like Matplotlib, Seaborn, and Plotly.',                                           'intermediate',  '{1,2}',    10, 7,  ARRAY['data-visualization', 'matplotlib', 'seaborn', 'plotly'],                true),
(8,  'MLOps Fundamentals',            'Learn how to deploy, monitor, and maintain machine learning models in production.',                                                          'advanced',      '{1,3}',    12, 8,  ARRAY['mlops', 'model-deployment', 'model-monitoring', 'data-pipelines'],      true),
(9,  'Web Development with Python',   'Build web applications using Python frameworks like Flask and Django.',                                                                      'intermediate',  '{1}',      14, 9,  ARRAY['python', 'webdev', 'backend', 'fullstack'],                             true),
(10, 'Data Engineering Fundamentals', 'Learn data engineering concepts including ETL processes, data warehousing, and big data technologies.',                                      'advanced',      '{1,2}',    16, 10, ARRAY['bigdata', 'data-pipelines', 'sql', 'data-science'],                     true);

-- Reset the sequence to continue after ID 10
SELECT setval('modules_id_seq', 10);

-- ============================================
-- LESSONS
-- Module 1: Python Fundamentals (9 lessons)
-- ============================================

INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published) VALUES
-- Module 1: Python Fundamentals
(1, 'Python Basics',              'read', NULL, 1, 30, 50, true),
(1, 'Variables and Data Types',   'code', NULL, 2, 35, 50, true),
(1, 'Control Flow',               'code', NULL, 3, 40, 50, true),
(1, 'Lists and Collections',      'code', NULL, 4, 35, 50, true),
(1, 'Dictionaries and Sets',      'code', NULL, 5, 35, 50, true),
(1, 'Functions',                   'code', NULL, 6, 40, 50, true),
(1, 'File Operations',            'code', NULL, 7, 35, 50, true),
(1, 'Error Handling',             'code', NULL, 8, 35, 50, true),
(1, 'Object-Oriented Programming','code', NULL, 9, 45, 50, true),

-- Module 2: Data Science with Pandas (4 lessons)
(2, 'Introduction to Pandas',     'read', NULL, 1, 30, 50, true),
(2, 'Data Frames and Series',     'code', NULL, 2, 40, 50, true),
(2, 'Data Cleaning',              'code', NULL, 3, 40, 50, true),
(2, 'Data Analysis',              'code', NULL, 4, 40, 50, true),

-- Module 3: Machine Learning Basics (3 lessons)
(3, 'Introduction to ML',         'read', NULL, 1, 35, 50, true),
(3, 'Linear Regression',          'code', NULL, 2, 45, 50, true),
(3, 'Classification',             'quiz', NULL, 3, 40, 50, true),

-- Module 4: Neural Networks & Deep Learning (3 lessons)
(4, 'Neural Network Fundamentals','read', NULL, 1, 40, 50, true),
(4, 'Building Your First Neural Network', 'code', NULL, 2, 50, 50, true),
(4, 'Convolutional Neural Networks', 'code', NULL, 3, 55, 50, true),

-- Module 5: Natural Language Processing (3 lessons)
(5, 'Text Processing Basics',     'read', NULL, 1, 35, 50, true),
(5, 'Sentiment Analysis',         'code', NULL, 2, 45, 50, true),
(5, 'Building a Text Classifier', 'code', NULL, 3, 50, 50, true),

-- Module 6: Computer Vision (3 lessons)
(6, 'Image Processing Fundamentals','read', NULL, 1, 35, 50, true),
(6, 'Object Detection',           'code', NULL, 2, 45, 50, true),
(6, 'Building an Image Classifier','code', NULL, 3, 50, 50, true),

-- Module 7: Data Visualization (3 lessons)
(7, 'Visualization Principles',   'read', NULL, 1, 30, 50, true),
(7, 'Creating Basic Charts',      'code', NULL, 2, 40, 50, true),
(7, 'Interactive Visualizations',  'code', NULL, 3, 45, 50, true),

-- Module 8: MLOps Fundamentals (3 lessons)
(8, 'MLOps Introduction',         'read', NULL, 1, 35, 50, true),
(8, 'Model Deployment',           'code', NULL, 2, 45, 50, true),
(8, 'Monitoring and Maintenance',  'code', NULL, 3, 45, 50, true),

-- Module 9: Web Development with Python (3 lessons)
(9, 'Web Development Basics',     'read', NULL, 1, 30, 50, true),
(9, 'Building a Flask API',       'code', NULL, 2, 45, 50, true),
(9, 'Full Stack Integration',     'code', NULL, 3, 50, 50, true),

-- Module 10: Data Engineering Fundamentals (3 lessons)
(10, 'Data Engineering Concepts', 'read', NULL, 1, 35, 50, true),
(10, 'Building ETL Pipelines',    'code', NULL, 2, 50, 50, true),
(10, 'Working with Big Data',     'code', NULL, 3, 55, 50, true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT m.id, m.title, m.difficulty, COUNT(l.id) as lesson_count
FROM public.modules m
LEFT JOIN public.lessons l ON l.module_id = m.id
GROUP BY m.id, m.title, m.difficulty
ORDER BY m.id;

DO $$
BEGIN
    RAISE NOTICE '✅ Successfully seeded 10 modules and their lessons!';
END $$;
