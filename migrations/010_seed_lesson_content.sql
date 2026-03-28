-- Migration: Seed comprehensive lesson content
-- This migration populates the lessons table with all lesson content structure

-- First, ensure we have modules
INSERT INTO public.modules (id, title, description, difficulty, estimated_hours, order_index, tags, is_published)
VALUES
  (1, 'Python Basics', 'Start your Python journey with fundamentals', 'beginner', 20, 1, ARRAY['python', 'beginner'], true),
  (2, 'Control Flow', 'Master conditionals and loops', 'beginner', 15, 2, ARRAY['python', 'control'], true),
  (3, 'Data Structures', 'Learn lists, dicts, and more', 'beginner', 18, 3, ARRAY['python', 'data'], true),
  (4, 'Functions & OOP', 'Write reusable code with functions and classes', 'intermediate', 25, 4, ARRAY['python', 'functions'], true),
  (5, 'Advanced Python', 'File I/O, error handling, and more', 'intermediate', 20, 5, ARRAY['python', 'advanced'], true),
  (6, 'Data Science Basics', 'NumPy, Pandas, and visualization', 'intermediate', 30, 6, ARRAY['python', 'data-science'], true),
  (7, 'Machine Learning', 'ML fundamentals and models', 'advanced', 40, 7, ARRAY['python', 'ml'], true)
ON CONFLICT (id) DO NOTHING;

-- Now seed lessons with content stored as JSONB
-- Module 1: Python Basics
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (1, 'Welcome to Python', 'read', jsonb_build_object(
    'markdown', '# Welcome to Python! 🐍\n\nPython is a high-level, interpreted programming language known for its simplicity and readability.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Your First Program', 'code', 'print("Hello, World!")', 'description', 'Your first Python program')
    ),
    'keyPoints', jsonb_build_array('Python is easy to learn', 'Great for beginners', 'Widely used in industry')
  ), 1, 20, 50, true),
  
  (1, 'Variables and Data Types', 'read', jsonb_build_object(
    'markdown', '# Variables and Data Types',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Creating Variables', 'code', 'age = 25\nname = "Alice"\nprice = 9.99', 'description', 'Different data types')
    ),
    'keyPoints', jsonb_build_array('Variables store data', 'Python has dynamic typing', 'Four basic types: int, float, str, bool')
  ), 2, 25, 50, true),

  (1, 'String Formatting', 'read', jsonb_build_object(
    'markdown', '# Modern String Formatting\n\nF-strings are the most modern and readable way to format strings!',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'F-Strings', 'code', 'name = "Alice"\nage = 25\nprint(f"Hello, {name}! You are {age} years old")', 'description', 'Using f-strings')
    ),
    'keyPoints', jsonb_build_array('F-strings are readable', 'Supports expressions', 'Format with precision')
  ), 3, 30, 50, true),

  (1, 'Numbers and Math', 'read', jsonb_build_object(
    'markdown', '# Working with Numbers\n\nPython handles integers and floats seamlessly.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Arithmetic Operators', 'code', 'x = 10\ny = 3\nprint(x + y)\nprint(x ** y)', 'description', 'Basic math operations'),
      jsonb_build_object('title', 'Operator Precedence', 'code', 'result = 2 + 3 * 4\nprint(result)  # 14', 'description', 'PEMDAS applies in Python')
    ),
    'keyPoints', jsonb_build_array('Addition, subtraction, multiplication, division', 'Integer division: //', 'Exponentiation: **')
  ), 4, 25, 50, true),

  (1, 'Comments and Documentation', 'read', jsonb_build_object(
    'markdown', '# Writing Good Comments and Docstrings',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Comments', 'code', '# This is a comment\nx = 5  # Variable for storing iteration count', 'description', 'Single-line comments'),
      jsonb_build_object('title', 'Docstrings', 'code', 'def add(a, b):\n    """Add two numbers and return the result."""\n    return a + b', 'description', 'Function documentation')
    ),
    'keyPoints', jsonb_build_array('Use # for comments', 'Write clear docstrings', 'Comments should explain the why')
  ), 5, 20, 50, true),

  (1, 'Output and Printing', 'read', jsonb_build_object(
    'markdown', '# Printing Output\n\nThe print() function is your window to see program results.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Basic Print', 'code', 'print("Hello")\nprint(42)\nprint(3.14)', 'description', 'Printing different types'),
      jsonb_build_object('title', 'Multiple Values', 'code', 'print("John", 25, "Engineer", sep=", ")', 'description', 'Multiple arguments with separator')
    ),
    'keyPoints', jsonb_build_array('print() outputs to console', 'Multiple values separated by commas', 'Use sep and end parameters')
  ), 6, 15, 50, true);

-- Module 2: Control Flow
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (2, 'Boolean Logic', 'read', jsonb_build_object(
    'markdown', '# Boolean Logic\n\nUnderstanding True and False values.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Comparison Operators', 'code', 'print(5 > 3)\nprint(10 == 10)\nprint("a" != "b")', 'description', 'Comparing values'),
      jsonb_build_object('title', 'Logical Operators', 'code', 'x = True\ny = False\nprint(x and y)\nprint(x or y)\nprint(not x)', 'description', 'Combining booleans')
    ),
    'keyPoints', jsonb_build_array('Comparison operators return bool', 'and, or, not operators', 'De Morgans laws apply')
  ), 1, 20, 50, true),

  (2, 'If Statements', 'read', jsonb_build_object(
    'markdown', '# Conditional Statements\n\nMake decisions in your programs with if/elif/else.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Simple If', 'code', 'age = 18\nif age >= 18:\n    print("You are an adult")', 'description', 'Basic if statement'),
      jsonb_build_object('title', 'If-Else', 'code', 'score = 85\nif score >= 90:\n    print("A")\nelse:\n    print("B")', 'description', 'If with else'),
      jsonb_build_object('title', 'If-Elif-Else', 'code', 'grade = 85\nif grade >= 90:\n    print("A")\nelif grade >= 80:\n    print("B")\nelif grade >= 70:\n    print("C")\nelse:\n    print("F")', 'description', 'Multiple conditions')
    ),
    'keyPoints', jsonb_build_array('if checks a condition', 'elif for multiple conditions', 'else is the fallback')
  ), 2, 30, 50, true),

  (2, 'While Loops', 'read', jsonb_build_object(
    'markdown', '# While Loops\n\nRepeat code while a condition is true.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Simple While Loop', 'code', 'count = 0\nwhile count < 5:\n    print(count)\n    count += 1', 'description', 'Count to 5'),
      jsonb_build_object('title', 'Break and Continue', 'code', 'while True:\n    x = input("Enter q to quit: ")\n    if x == "q":\n        break', 'description', 'Control loop flow')
    ),
    'keyPoints', jsonb_build_array('while repeats while condition is true', 'break exits the loop', 'continue skips to next iteration')
  ), 3, 25, 50, true),

  (2, 'For Loops', 'read', jsonb_build_object(
    'markdown', '# For Loops\n\nIterate over sequences like lists and ranges.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'For Loop with Range', 'code', 'for i in range(5):\n    print(i)', 'description', 'Loop 0 to 4'),
      jsonb_build_object('title', 'For Loop with List', 'code', 'fruits = ["apple", "banana", "orange"]\nfor fruit in fruits:\n    print(fruit)', 'description', 'Iterate through list')
    ),
    'keyPoints', jsonb_build_array('for iterates over sequences', 'range() creates sequences', 'range(start, stop, step) syntax')
  ), 4, 25, 50, true);

-- Module 3: Data Structures
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (3, 'Lists - Fundamentals', 'read', jsonb_build_object(
    'markdown', '# Working with Lists\n\nLists are ordered, mutable collections.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Creating Lists', 'code', 'fruits = ["apple", "banana", "orange"]\nprint(fruits[0])\nprint(len(fruits))', 'description', 'List basics'),
      jsonb_build_object('title', 'Modifying Lists', 'code', 'numbers = [1, 2, 3]\nnumbers.append(4)\nnumbers.remove(1)\nprint(numbers)', 'description', 'Add and remove items')
    ),
    'keyPoints', jsonb_build_array('Lists are mutable', 'Use [] to create', 'Indexing starts at 0')
  ), 1, 30, 50, true),

  (3, 'Dictionaries', 'read', jsonb_build_object(
    'markdown', '# Dictionaries\n\nStore key-value pairs with dictionaries.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Creating Dicts', 'code', 'person = {"name": "Alice", "age": 25, "city": "NYC"}\nprint(person["name"])\nprint(person.get("age"))', 'description', 'Dictionary access'),
      jsonb_build_object('title', 'Modifying Dicts', 'code', 'person["email"] = "alice@email.com"\nperson.update({"age": 26})\nprint(person)', 'description', 'Add and update items')
    ),
    'keyPoints', jsonb_build_array('Dictionaries map keys to values', 'Keys must be unique', 'Use get() for safe access')
  ), 2, 25, 50, true),

  (3, 'Tuples and Sets', 'read', jsonb_build_object(
    'markdown', '# Tuples and Sets\n\nUnmutable sequences and unique collections.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Tuples', 'code', 'coords = (10, 20)\nprint(coords[0])\n# tuples are immutable', 'description', 'Immutable sequences'),
      jsonb_build_object('title', 'Sets', 'code', 'unique = {1, 2, 3, 2, 1}\nprint(unique)  # {1, 2, 3}\nprint(len(unique))', 'description', 'Unique values only')
    ),
    'keyPoints', jsonb_build_array('Tuples are immutable', 'Sets contain unique values', 'No ordering in sets')
  ), 3, 20, 50, true);

-- Module 4: Functions & OOP
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (4, 'Defining Functions', 'read', jsonb_build_object(
    'markdown', '# Functions\n\nWrite reusable blocks of code.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Basic Function', 'code', 'def greet(name):\n    """Greet a person by name."""\n    return f"Hello, {name}!"\n\nprint(greet("Alice"))', 'description', 'Simple function with return'),
      jsonb_build_object('title', 'Multiple Parameters', 'code', 'def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)', 'description', 'Functions with multiple args')
    ),
    'keyPoints', jsonb_build_array('def keyword defines functions', 'Functions can return values', 'Parameters and arguments')
  ), 1, 35, 75, true),

  (4, 'Classes and Objects', 'read', jsonb_build_object(
    'markdown', '# Object-Oriented Programming\n\nOrganize code with classes and objects.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Simple Class', 'code', 'class Dog:\n    def __init__(self, name):\n        self.name = name\n    \n    def bark(self):\n        print(f"{self.name} says woof!")\n\ndog = Dog("Buddy")\ndog.bark()', 'description', 'Creating and using a class')
    ),
    'keyPoints', jsonb_build_array('class keyword defines class', '__init__ initializes objects', 'self refers to instance')
  ), 2, 40, 100, true);

-- Module 5: Advanced Python
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (5, 'File Input/Output', 'read', jsonb_build_object(
    'markdown', '# File Handling\n\nRead from and write to files.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Writing Files', 'code', 'with open("data.txt", "w") as f:\n    f.write("Hello, World!")', 'description', 'Write to file'),
      jsonb_build_object('title', 'Reading Files', 'code', 'with open("data.txt", "r") as f:\n    content = f.read()\n    print(content)', 'description', 'Read from file')
    ),
    'keyPoints', jsonb_build_array('Use with statement for files', 'Modes: r (read), w (write), a (append)', 'Automatic file closing')
  ), 1, 30, 75, true),

  (5, 'Error Handling', 'read', jsonb_build_object(
    'markdown', '# Exception Handling\n\nHandle errors gracefully.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Try-Except', 'code', 'try:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")', 'description', 'Catch specific errors'),
      jsonb_build_object('title', 'Multiple Exceptions', 'code', 'try:\n    num = int(input("Enter number: "))\nexcept ValueError:\n    print("Invalid input")\nexcept KeyboardInterrupt:\n    print("User cancelled")', 'description', 'Multiple exception handlers')
    ),
    'keyPoints', jsonb_build_array('try-except catches errors', 'Specific exceptions first', 'else and finally blocks available')
  ), 2, 25, 75, true);

-- Module 6: Data Science Basics
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (6, 'NumPy Basics', 'read', jsonb_build_object(
    'markdown', '# NumPy Fundamentals\n\nWorks with arrays and numerical computing.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Creating Arrays', 'code', 'import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr.shape)\nprint(arr.mean())', 'description', 'NumPy arrays')
    ),
    'keyPoints', jsonb_build_array('NumPy is for numerical computing', 'Arrays are fast and efficient', 'Broadcasting enables operations')
  ), 1, 40, 100, true),

  (6, 'Pandas DataFrames', 'read', jsonb_build_object(
    'markdown', '# Pandas for Data Analysis\n\nWork with tabular data using DataFrames.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Creating DataFrames', 'code', 'import pandas as pd\ndf = pd.DataFrame({"name": ["Alice", "Bob"], "age": [25, 30]})\nprint(df)\nprint(df.describe())', 'description', 'DataFrame basics')
    ),
    'keyPoints', jsonb_build_array('DataFrames organize data in tables', 'Easy filtering and grouping', 'CSV read/write support')
  ), 2, 45, 100, true),

  (6, 'Data Visualization', 'read', jsonb_build_object(
    'markdown', '# Matplotlib and Visualization\n\nCreate charts and plots.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Simple Plot', 'code', 'import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [1, 4, 9])\nplt.show()', 'description', 'Basic plotting')
    ),
    'keyPoints', jsonb_build_array('Matplotlib creates visualizations', 'Plot types: line, bar, scatter', 'Seaborn for advanced styling')
  ), 3, 35, 100, true);

-- Module 7: Machine Learning
INSERT INTO public.lessons (module_id, title, type, content, order_index, estimated_minutes, xp_reward, is_published)
VALUES
  (7, 'ML Fundamentals', 'read', jsonb_build_object(
    'markdown', '# Machine Learning Basics\n\nUnderstand supervised and unsupervised learning.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Train-Test Split', 'code', 'from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y)', 'description', 'Splitting data')
    ),
    'keyPoints', jsonb_build_array('Supervised learning uses labels', 'Unsupervised finds patterns', 'Train-test split prevents overfitting')
  ), 1, 50, 150, true),

  (7, 'Linear Regression', 'read', jsonb_build_object(
    'markdown', '# Linear Regression\n\nPredict continuous values.',
    'examples', jsonb_build_array(
      jsonb_build_object('title', 'Simple Regression', 'code', 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)', 'description', 'Linear regression model')
    ),
    'keyPoints', jsonb_build_array('Regression predicts continuous values', 'Calculates best-fit line', 'R-squared measures fit quality')
  ), 2, 35, 100, true);
