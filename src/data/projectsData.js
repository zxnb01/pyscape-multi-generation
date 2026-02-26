export const projects = [
  {
    id: 1,
    title: 'Sentiment Analyzer',
    tagline: "Build a model to analyze text sentiment using NLP techniques.",
    difficulty: 'Easy',
    difficultyLabel: 'Easy peasy',
    category: 'NLP',
    xp: 50,
    status: 'available',
    completions: 847,
    timeEstimate: '45 min',
    keywords: ['NLP', 'Python', 'NLTK'],
    keyConcepts: ['NLP', 'Tokenization', 'Sentiment Analysis', 'NLTK', 'Text Preprocessing'],
    series: [
      { id: 1, title: 'Sentiment Analyzer', current: true },
      { id: 7, title: 'Text Classifier with TF-IDF', current: false },
      { id: 8, title: 'Named Entity Recognition', current: false },
      { id: 9, title: 'Build a Chatbot with NLTK', current: false },
    ],
    summary: {
      headline: 'Welcome to your first NLP project!',
      intro: `In this project, you'll build a Sentiment Analyzer — a model that reads a piece of text and determines whether it's positive, negative, or neutral. This is one of the most widely-used NLP tasks in the real world, powering things like product review analysis, social media monitoring, and customer feedback systems.`,
      whatYoullLearn: [
        { emoji: '🔤', text: 'Tokenize and clean raw text data' },
        { emoji: '📊', text: 'Extract features using Bag-of-Words and TF-IDF' },
        { emoji: '🤖', text: 'Train a Naive Bayes classifier on sentiment labels' },
        { emoji: '🧪', text: 'Evaluate model accuracy using precision, recall and F1' },
        { emoji: '🚀', text: 'Run inference on custom user input text' },
      ],
      previewCaption: 'Your finished Sentiment Analyzer in action, classifying movie reviews.',
    },
    steps: {
      onYourOwn: [
        'Set up your Python environment and install NLTK',
        'Load the movie reviews dataset from NLTK corpus',
        'Preprocess text: lowercase, remove stopwords, tokenize',
        'Build a feature extractor using bag-of-words',
        'Train a Naive Bayes classifier on labeled data',
        'Evaluate accuracy on the test split',
        'Write a function to classify new custom text',
      ],
      someGuidance: [
        { step: 1, title: 'Environment Setup', hint: 'Use `pip install nltk` and download the movie_reviews corpus with `nltk.download()`.' },
        { step: 2, title: 'Load & Explore Data', hint: 'The NLTK movie_reviews corpus has 2000 labeled reviews — 1000 positive, 1000 negative.' },
        { step: 3, title: 'Text Preprocessing', hint: 'Use `word_tokenize()` and filter out stopwords from `nltk.corpus.stopwords.words("english")`.' },
        { step: 4, title: 'Feature Extraction', hint: 'Convert each document into a dictionary of `{word: True}` pairs for Naive Bayes.' },
        { step: 5, title: 'Train the Classifier', hint: 'Use `nltk.NaiveBayesClassifier.train(training_features)`.' },
        { step: 6, title: 'Evaluate the Model', hint: 'Check accuracy with `nltk.classify.accuracy(classifier, test_features)`.' },
        { step: 7, title: 'Predict on New Text', hint: 'Pass a cleaned, tokenized version of any sentence into `classifier.classify()`.' },
      ],
      stepByStep: [
        {
          step: 1,
          title: 'Environment Setup',
          content: `Install NLTK and download the required datasets:

\`\`\`python
pip install nltk
\`\`\`

\`\`\`python
import nltk
nltk.download('movie_reviews')
nltk.download('stopwords')
nltk.download('punkt')
\`\`\``,
        },
        {
          step: 2,
          title: 'Load the Dataset',
          content: `The NLTK movie_reviews corpus contains 2000 labeled reviews. Load them:

\`\`\`python
from nltk.corpus import movie_reviews
import random

documents = [(list(movie_reviews.words(fileid)), category)
             for category in movie_reviews.categories()
             for fileid in movie_reviews.fileids(category)]

random.shuffle(documents)
print(f"Total documents: {len(documents)}")
\`\`\``,
        },
        {
          step: 3,
          title: 'Preprocessing & Feature Extraction',
          content: `Build a feature extractor using the most common words:

\`\`\`python
from nltk.corpus import stopwords

stop_words = set(stopwords.words('english'))
all_words = nltk.FreqDist(
    w.lower() for w in movie_reviews.words()
    if w.isalpha() and w.lower() not in stop_words
)

word_features = list(all_words.keys())[:2000]

def document_features(document):
    doc_words = set(document)
    return {word: (word in doc_words) for word in word_features}
\`\`\``,
        },
        {
          step: 4,
          title: 'Train & Evaluate',
          content: `Split the data, train, and evaluate your classifier:

\`\`\`python
featuresets = [(document_features(d), c) for (d, c) in documents]
train_set, test_set = featuresets[200:], featuresets[:200]

classifier = nltk.NaiveBayesClassifier.train(train_set)
print(f"Accuracy: {nltk.classify.accuracy(classifier, test_set):.2%}")
classifier.show_most_informative_features(10)
\`\`\``,
        },
        {
          step: 5,
          title: 'Classify New Text',
          content: `Now use your model to classify any sentence:

\`\`\`python
def classify_sentiment(text):
    tokens = nltk.word_tokenize(text.lower())
    features = document_features(tokens)
    return classifier.classify(features)

print(classify_sentiment("This movie was absolutely fantastic!"))  # → pos
print(classify_sentiment("Terrible film, waste of time."))          # → neg
\`\`\``,
        },
      ],
    },
  },
  {
    id: 2,
    title: 'Image Classifier (CIFAR-10)',
    tagline: 'Create a CNN to classify images from the CIFAR-10 dataset.',
    difficulty: 'Medium',
    difficultyLabel: 'Intermediate',
    category: 'Computer Vision',
    xp: 150,
    status: 'locked',
    completions: 412,
    timeEstimate: '90 min',
    keywords: ['CNN', 'TensorFlow', 'Computer Vision'],
    keyConcepts: ['Convolutional Neural Networks', 'Image Preprocessing', 'Pooling Layers', 'Softmax Classification'],
    series: [
      { id: 2, title: 'Image Classifier (CIFAR-10)', current: true },
      { id: 10, title: 'Transfer Learning with ResNet', current: false },
      { id: 11, title: 'Object Detection with YOLO', current: false },
    ],
    summary: {
      headline: 'Build your first Computer Vision model!',
      intro: 'Train a Convolutional Neural Network to classify images into 10 categories from the classic CIFAR-10 dataset.',
      whatYoullLearn: [
        { emoji: '🖼️', text: 'Load and preprocess image datasets' },
        { emoji: '🧱', text: 'Build CNN layers with Conv2D and MaxPooling' },
        { emoji: '📈', text: 'Train with callbacks like EarlyStopping' },
        { emoji: '🎯', text: 'Evaluate and visualize predictions' },
      ],
      previewCaption: 'CNN correctly classifying a car, airplane, and frog from CIFAR-10.',
    },
    steps: { onYourOwn: [], someGuidance: [], stepByStep: [] },
  },
  {
    id: 3,
    title: 'Predict Stock Prices',
    tagline: 'Use time series analysis to predict stock market trends.',
    difficulty: 'Hard',
    difficultyLabel: 'Advanced',
    category: 'Time Series',
    xp: 300,
    status: 'locked',
    completions: 198,
    timeEstimate: '120 min',
    keywords: ['LSTM', 'Time Series', 'Pandas'],
    keyConcepts: ['LSTM Networks', 'Time Series', 'Feature Engineering', 'MinMax Scaling'],
    series: [
      { id: 3, title: 'Predict Stock Prices', current: true },
    ],
    summary: {
      headline: 'Master time series forecasting!',
      intro: 'Use an LSTM (Long Short-Term Memory) neural network to predict future stock prices based on historical data.',
      whatYoullLearn: [
        { emoji: '📉', text: 'Fetch and clean real-world stock data' },
        { emoji: '🔁', text: 'Build sequence windows for LSTM input' },
        { emoji: '🧠', text: 'Design and train an LSTM model' },
        { emoji: '📊', text: 'Visualize actual vs. predicted prices' },
      ],
      previewCaption: 'LSTM predictions vs actual AAPL stock prices over 30 days.',
    },
    steps: { onYourOwn: [], someGuidance: [], stepByStep: [] },
  },
  {
    id: 4,
    title: 'Chatbot with Transformer',
    tagline: 'Build a simple chatbot using transformer architecture.',
    difficulty: 'Hard',
    difficultyLabel: 'Advanced',
    category: 'NLP',
    xp: 250,
    status: 'locked',
    completions: 156,
    timeEstimate: '120 min',
    keywords: ['Transformers', 'NLP', 'HuggingFace'],
    keyConcepts: ['Attention Mechanism', 'Transformers', 'HuggingFace', 'Fine-tuning'],
    series: [
      { id: 1, title: 'Sentiment Analyzer', current: false },
      { id: 4, title: 'Chatbot with Transformer', current: true },
    ],
    summary: {
      headline: 'Build with cutting-edge Transformer models!',
      intro: 'Use HuggingFace Transformers to fine-tune a pre-trained model and power a simple conversational chatbot.',
      whatYoullLearn: [
        { emoji: '🤗', text: 'Load pre-trained models from HuggingFace Hub' },
        { emoji: '🔧', text: 'Fine-tune on a custom conversation dataset' },
        { emoji: '💬', text: 'Build an interactive chat loop' },
      ],
      previewCaption: 'Your chatbot holding a multi-turn conversation.',
    },
    steps: { onYourOwn: [], someGuidance: [], stepByStep: [] },
  },
  {
    id: 5,
    title: 'Data Visualization Dashboard',
    tagline: 'Create an interactive dashboard to visualize COVID-19 data.',
    difficulty: 'Medium',
    difficultyLabel: 'Intermediate',
    category: 'Data Visualization',
    xp: 120,
    status: 'available',
    completions: 623,
    timeEstimate: '60 min',
    keywords: ['Plotly', 'Dash', 'Pandas'],
    keyConcepts: ['Plotly Express', 'Dash Callbacks', 'Data Cleaning', 'Pandas GroupBy'],
    series: [
      { id: 5, title: 'Data Visualization Dashboard', current: true },
      { id: 12, title: 'Real-time Dashboard with WebSockets', current: false },
    ],
    summary: {
      headline: 'Turn raw data into stunning visuals!',
      intro: 'Build an interactive Plotly Dash dashboard to explore and visualize COVID-19 statistics across countries.',
      whatYoullLearn: [
        { emoji: '📊', text: 'Fetch and clean public COVID-19 datasets' },
        { emoji: '🗺️', text: 'Create choropleth maps with Plotly Express' },
        { emoji: '⚡', text: 'Add interactive dropdowns with Dash callbacks' },
        { emoji: '🎨', text: 'Style your dashboard with a dark theme' },
      ],
      previewCaption: 'Interactive global COVID-19 map with dropdown filters.',
    },
    steps: { onYourOwn: [], someGuidance: [], stepByStep: [] },
  },
];

export const getProjectById = (id) => projects.find(p => p.id === parseInt(id));
