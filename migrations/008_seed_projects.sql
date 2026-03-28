-- ============================================
-- SEED: Projects
-- Migration 008: Populate projects table
-- from the hardcoded projectsData.js
-- ============================================

-- Clear existing data (for clean re-seeding)
TRUNCATE public.artifacts, public.projects CASCADE;

-- Reset sequence
ALTER SEQUENCE projects_id_seq RESTART WITH 1;

-- ============================================
-- PROJECTS (5 projects from projectsData.js)
-- ============================================

INSERT INTO public.projects (id, title, description, difficulty, estimated_hours, steps, repo_template, xp_reward, unlock_threshold, is_published) VALUES
(1, 'Sentiment Analyzer',
 'Build a model to analyze text sentiment using NLP techniques.',
 'beginner', 1,
 '{
   "onYourOwn": [
     "Set up your Python environment and install NLTK",
     "Load the movie reviews dataset from NLTK corpus",
     "Preprocess text: lowercase, remove stopwords, tokenize",
     "Build a feature extractor using bag-of-words",
     "Train a Naive Bayes classifier on labeled data",
     "Evaluate accuracy on the test split",
     "Write a function to classify new custom text"
   ],
   "someGuidance": [
     {"step": 1, "title": "Environment Setup", "hint": "Use `pip install nltk` and download the movie_reviews corpus with `nltk.download()`."},
     {"step": 2, "title": "Load & Explore Data", "hint": "The NLTK movie_reviews corpus has 2000 labeled reviews — 1000 positive, 1000 negative."},
     {"step": 3, "title": "Text Preprocessing", "hint": "Use `word_tokenize()` and filter out stopwords from `nltk.corpus.stopwords.words(\"english\")`."},
     {"step": 4, "title": "Feature Extraction", "hint": "Convert each document into a dictionary of `{word: True}` pairs for Naive Bayes."},
     {"step": 5, "title": "Train the Classifier", "hint": "Use `nltk.NaiveBayesClassifier.train(training_features)`."},
     {"step": 6, "title": "Evaluate the Model", "hint": "Check accuracy with `nltk.classify.accuracy(classifier, test_features)`."},
     {"step": 7, "title": "Predict on New Text", "hint": "Pass a cleaned, tokenized version of any sentence into `classifier.classify()`."}
   ],
   "stepByStep": [
     {"step": 1, "title": "Environment Setup", "content": "Install NLTK and download the required datasets:\n\n```python\npip install nltk\n```\n\n```python\nimport nltk\nnltk.download(''movie_reviews'')\nnltk.download(''stopwords'')\nnltk.download(''punkt'')\n```"},
     {"step": 2, "title": "Load the Dataset", "content": "The NLTK movie_reviews corpus contains 2000 labeled reviews. Load them:\n\n```python\nfrom nltk.corpus import movie_reviews\nimport random\n\ndocuments = [(list(movie_reviews.words(fileid)), category)\n             for category in movie_reviews.categories()\n             for fileid in movie_reviews.fileids(category)]\n\nrandom.shuffle(documents)\nprint(f\"Total documents: {len(documents)}\")\n```"},
     {"step": 3, "title": "Preprocessing & Feature Extraction", "content": "Build a feature extractor using the most common words:\n\n```python\nfrom nltk.corpus import stopwords\n\nstop_words = set(stopwords.words(''english''))\nall_words = nltk.FreqDist(\n    w.lower() for w in movie_reviews.words()\n    if w.isalpha() and w.lower() not in stop_words\n)\n\nword_features = list(all_words.keys())[:2000]\n\ndef document_features(document):\n    doc_words = set(document)\n    return {word: (word in doc_words) for word in word_features}\n```"},
     {"step": 4, "title": "Train & Evaluate", "content": "Split the data, train, and evaluate your classifier:\n\n```python\nfeaturesets = [(document_features(d), c) for (d, c) in documents]\ntrain_set, test_set = featuresets[200:], featuresets[:200]\n\nclassifier = nltk.NaiveBayesClassifier.train(train_set)\nprint(f\"Accuracy: {nltk.classify.accuracy(classifier, test_set):.2%}\")\nclassifier.show_most_informative_features(10)\n```"},
     {"step": 5, "title": "Classify New Text", "content": "Now use your model to classify any sentence:\n\n```python\ndef classify_sentiment(text):\n    tokens = nltk.word_tokenize(text.lower())\n    features = document_features(tokens)\n    return classifier.classify(features)\n\nprint(classify_sentiment(\"This movie was absolutely fantastic!\"))  # pos\nprint(classify_sentiment(\"Terrible film, waste of time.\"))          # neg\n```"}
   ],
   "category": "NLP",
   "keywords": ["NLP", "Python", "NLTK"],
   "keyConcepts": ["NLP", "Tokenization", "Sentiment Analysis", "NLTK", "Text Preprocessing"],
   "timeEstimate": "45 min",
   "completions": 847,
   "difficultyLabel": "Easy peasy",
   "status": "available",
   "series": [
     {"id": 1, "title": "Sentiment Analyzer", "current": true},
     {"id": 7, "title": "Text Classifier with TF-IDF", "current": false},
     {"id": 8, "title": "Named Entity Recognition", "current": false},
     {"id": 9, "title": "Build a Chatbot with NLTK", "current": false}
   ],
   "summary": {
     "headline": "Welcome to your first NLP project!",
     "intro": "In this project, you''ll build a Sentiment Analyzer — a model that reads a piece of text and determines whether it''s positive, negative, or neutral.",
     "whatYoullLearn": [
       {"emoji": "🔤", "text": "Tokenize and clean raw text data"},
       {"emoji": "📊", "text": "Extract features using Bag-of-Words and TF-IDF"},
       {"emoji": "🤖", "text": "Train a Naive Bayes classifier on sentiment labels"},
       {"emoji": "🧪", "text": "Evaluate model accuracy using precision, recall and F1"},
       {"emoji": "🚀", "text": "Run inference on custom user input text"}
     ],
     "previewCaption": "Your finished Sentiment Analyzer in action, classifying movie reviews."
   }
 }'::jsonb,
 NULL, 50, 0, true),

(2, 'Image Classifier (CIFAR-10)',
 'Create a CNN to classify images from the CIFAR-10 dataset.',
 'intermediate', 2,
 '{
   "onYourOwn": [], "someGuidance": [], "stepByStep": [],
   "category": "Computer Vision",
   "keywords": ["CNN", "TensorFlow", "Computer Vision"],
   "keyConcepts": ["Convolutional Neural Networks", "Image Preprocessing", "Pooling Layers", "Softmax Classification"],
   "timeEstimate": "90 min",
   "completions": 412,
   "difficultyLabel": "Intermediate",
   "status": "locked",
   "series": [
     {"id": 2, "title": "Image Classifier (CIFAR-10)", "current": true},
     {"id": 10, "title": "Transfer Learning with ResNet", "current": false},
     {"id": 11, "title": "Object Detection with YOLO", "current": false}
   ],
   "summary": {
     "headline": "Build your first Computer Vision model!",
     "intro": "Train a Convolutional Neural Network to classify images into 10 categories from the classic CIFAR-10 dataset.",
     "whatYoullLearn": [
       {"emoji": "🖼️", "text": "Load and preprocess image datasets"},
       {"emoji": "🧱", "text": "Build CNN layers with Conv2D and MaxPooling"},
       {"emoji": "📈", "text": "Train with callbacks like EarlyStopping"},
       {"emoji": "🎯", "text": "Evaluate and visualize predictions"}
     ],
     "previewCaption": "CNN correctly classifying a car, airplane, and frog from CIFAR-10."
   }
 }'::jsonb,
 NULL, 150, 500, true),

(3, 'Predict Stock Prices',
 'Use time series analysis to predict stock market trends.',
 'advanced', 2,
 '{
   "onYourOwn": [], "someGuidance": [], "stepByStep": [],
   "category": "Time Series",
   "keywords": ["LSTM", "Time Series", "Pandas"],
   "keyConcepts": ["LSTM Networks", "Time Series", "Feature Engineering", "MinMax Scaling"],
   "timeEstimate": "120 min",
   "completions": 198,
   "difficultyLabel": "Advanced",
   "status": "locked",
   "series": [{"id": 3, "title": "Predict Stock Prices", "current": true}],
   "summary": {
     "headline": "Master time series forecasting!",
     "intro": "Use an LSTM (Long Short-Term Memory) neural network to predict future stock prices based on historical data.",
     "whatYoullLearn": [
       {"emoji": "📉", "text": "Fetch and clean real-world stock data"},
       {"emoji": "🔁", "text": "Build sequence windows for LSTM input"},
       {"emoji": "🧠", "text": "Design and train an LSTM model"},
       {"emoji": "📊", "text": "Visualize actual vs. predicted prices"}
     ],
     "previewCaption": "LSTM predictions vs actual AAPL stock prices over 30 days."
   }
 }'::jsonb,
 NULL, 300, 1000, true),

(4, 'Chatbot with Transformer',
 'Build a simple chatbot using transformer architecture.',
 'advanced', 2,
 '{
   "onYourOwn": [], "someGuidance": [], "stepByStep": [],
   "category": "NLP",
   "keywords": ["Transformers", "NLP", "HuggingFace"],
   "keyConcepts": ["Attention Mechanism", "Transformers", "HuggingFace", "Fine-tuning"],
   "timeEstimate": "120 min",
   "completions": 156,
   "difficultyLabel": "Advanced",
   "status": "locked",
   "series": [
     {"id": 1, "title": "Sentiment Analyzer", "current": false},
     {"id": 4, "title": "Chatbot with Transformer", "current": true}
   ],
   "summary": {
     "headline": "Build with cutting-edge Transformer models!",
     "intro": "Use HuggingFace Transformers to fine-tune a pre-trained model and power a simple conversational chatbot.",
     "whatYoullLearn": [
       {"emoji": "🤗", "text": "Load pre-trained models from HuggingFace Hub"},
       {"emoji": "🔧", "text": "Fine-tune on a custom conversation dataset"},
       {"emoji": "💬", "text": "Build an interactive chat loop"}
     ],
     "previewCaption": "Your chatbot holding a multi-turn conversation."
   }
 }'::jsonb,
 NULL, 250, 1500, true),

(5, 'Data Visualization Dashboard',
 'Create an interactive dashboard to visualize COVID-19 data.',
 'intermediate', 1,
 '{
   "onYourOwn": [], "someGuidance": [], "stepByStep": [],
   "category": "Data Visualization",
   "keywords": ["Plotly", "Dash", "Pandas"],
   "keyConcepts": ["Plotly Express", "Dash Callbacks", "Data Cleaning", "Pandas GroupBy"],
   "timeEstimate": "60 min",
   "completions": 623,
   "difficultyLabel": "Intermediate",
   "status": "available",
   "series": [
     {"id": 5, "title": "Data Visualization Dashboard", "current": true},
     {"id": 12, "title": "Real-time Dashboard with WebSockets", "current": false}
   ],
   "summary": {
     "headline": "Turn raw data into stunning visuals!",
     "intro": "Build an interactive Plotly Dash dashboard to explore and visualize COVID-19 statistics across countries.",
     "whatYoullLearn": [
       {"emoji": "📊", "text": "Fetch and clean public COVID-19 datasets"},
       {"emoji": "🗺️", "text": "Create choropleth maps with Plotly Express"},
       {"emoji": "⚡", "text": "Add interactive dropdowns with Dash callbacks"},
       {"emoji": "🎨", "text": "Style your dashboard with a dark theme"}
     ],
     "previewCaption": "Interactive global COVID-19 map with dropdown filters."
   }
 }'::jsonb,
 NULL, 120, 500, true);

-- Reset sequence
SELECT setval('projects_id_seq', 5);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT id, title, difficulty, xp_reward, is_published
FROM public.projects
ORDER BY id;

DO $$
BEGIN
    RAISE NOTICE '✅ Successfully seeded 5 projects!';
END $$;
