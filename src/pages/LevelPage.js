// src/pages/LevelPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, BookOpen, Code, Lightbulb, Target } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import UniversalCodePlayground from "../components/sandbox/UniversalCodePlayground";

const levelContent = {
  1: {
    1: {
      1: {
        title: "Welcome to Python!",
        description: "Begin your journey into one of the world's most popular programming languages",
        content: `
### What is Python? 🐍

Python is a **high-level, interpreted programming language** known for its simplicity and readability. It's designed to be easy to learn and use, allowing developers to focus on solving problems rather than dealing with complex syntax.

**Key Features:**
- Clear, readable syntax that resembles plain English
- Versatile: Used for web development, data science, AI, automation, and more
- Extensive library ecosystem with packages for almost anything
- Active, supportive community worldwide

### Origin Story 📚

Python was created by **Guido van Rossum** and first released in **1991**. The name "Python" was inspired by the British comedy series "Monty Python's Flying Circus," not the snake! 

Guido designed Python with a focus on:
- **Code readability** - Making code easy to understand
- **Simplicity** - Reducing the complexity of programming
- **Productivity** - Enabling faster development

### Why Learn Python?

1. **Beginner-Friendly**: Python's syntax is intuitive and easy to grasp
2. **Career Opportunities**: High demand in tech, finance, research, and more
3. **Versatility**: Build websites, analyze data, create AI models, automate tasks
4. **Community Support**: Millions of developers and extensive documentation
        `,
        examples: [
          {
            title: "Your First Python Program",
            code: `# This is a comment - Python ignores these lines
# Let's write our first program!

print("Hello, World!")
print("Welcome to Python programming!")

# Python is that simple! 🎉`,
            description: "Run this code to see Python in action. The print() function displays text on the screen."
          },
          {
            title: "Python is Easy to Read",
            code: `# Python code is almost like reading English!

name = "Alice"
age = 25
is_student = True

print(f"My name is {name}")
print(f"I am {age} years old")
print(f"Am I a student? {is_student}")

# No complex syntax - just straightforward code!`,
            description: "Variables in Python are declared simply, without type declarations."
          }
        ],
        keyPoints: [
          "Python is a high-level, interpreted language",
          "Created by Guido van Rossum in 1991",
          "Known for simplicity and readability",
          "Used in web dev, data science, AI, and more"
        ],
        exercise: {
          title: "Your First Challenge",
          instructions: "Write a Python program that prints your name and favorite hobby. Use the print() function!",
          starterCode: `# Write your code here
# Hint: Use print("Your text here")

`,
          solution: `# Solution example
print("My name is John")
print("My favorite hobby is coding!")

# Your answer can be different - personalize it!`
        }
      },
      2: {
        title: "The Print Statement",
        description: "Master the fundamental output function in Python",
        content: `
### The print() Function 🖨️

The **print()** function is your primary tool for displaying output in Python. It's one of the first functions you'll learn, and you'll use it constantly throughout your programming journey!

**Basic Syntax:**
\`\`\`python
print("Your message here")
\`\`\`

Messages can be enclosed with either **single quotes (' ')** or **double quotes (" ")**.

### How Print Works

By default, \`print()\` adds a **newline character** at the end, so each print statement starts on a new line:

\`\`\`python
print("First line")
print("Second line")
# Output:
# First line
# Second line
\`\`\`

### Printing Multiple Items

You can print multiple items by separating them with commas:

\`\`\`python
name = "Alice"
age = 25
print("Name:", name, "Age:", age)
# Output: Name: Alice Age: 25
\`\`\`

### Customizing Output

Use the \`end\` parameter to control what appears at the end of the print output:

\`\`\`python
print("Hello", end=" ")
print("World!")
# Output: Hello World!
\`\`\`

Use the \`sep\` parameter to define the separator between multiple items:

\`\`\`python
print("Python", "is", "awesome", sep="-")
# Output: Python-is-awesome
\`\`\`
        `,
        examples: [
          {
            title: "Basic Printing",
            code: `# Simple print statements
print("Hello, World!")
print('Python is fun!')

# Printing multiple lines
print("Line 1")
print("Line 2")
print("Line 3")`,
            description: "The simplest way to display output in Python."
          },
          {
            title: "Printing on the Same Line",
            code: `# Using the end parameter
print("Loading", end="...")
print("Done!")

# Output: Loading...Done!

# Create a countdown
for i in range(5, 0, -1):
    print(i, end=" ")
print("Blastoff!")

# Output: 5 4 3 2 1 Blastoff!`,
            description: "Control how print statements end to create custom output patterns."
          },
          {
            title: "Advanced Print Tricks",
            code: `# Using separators
print("Python", "Java", "C++", sep=" | ")

# Printing variables with text
score = 95
name = "Alice"
print("Student:", name, "Score:", score)

# Using format strings (f-strings)
print(f"{name} scored {score} points!")

# Creating patterns
print("*" * 20)
print("Welcome to Python!")
print("*" * 20)`,
            description: "Combine text, variables, and special characters for formatted output."
          }
        ],
        keyPoints: [
          "print() displays output on the screen",
          "Use quotes (single or double) for text",
          "Default behavior adds a newline after each print",
          "Customize with 'end' and 'sep' parameters"
        ],
        exercise: {
          title: "Print Practice Challenge",
          instructions: "Create a program that prints your name, age, and favorite color on the same line, separated by vertical bars ( | ). Then create a decorative border using asterisks.",
          starterCode: `# Your code here
# Example output:
# ********************
# Name | Age | Color
# ********************

`,
          solution: `# Solution
name = "John"
age = 25
color = "Blue"

print("*" * 30)
print(name, age, color, sep=" | ")
print("*" * 30)

# Alternative using f-strings:
print("*" * 30)
print(f"{name} | {age} | {color}")
print("*" * 30)`
        }
      },
      3: {
        title: "Advanced Print Techniques",
        description: "Learn professional formatting and output control",
        content: `
### Multiple Arguments in print()

The print() function can take multiple arguments, separated by commas. By default, it adds a **space** between them:

\`\`\`python
print("Hello", "World", "from", "Python")
# Output: Hello World from Python
\`\`\`

### The 'end' Parameter

Control what character appears at the end of your print statement:

\`\`\`python
print("Hello", end=" ")
print("World!")
# Output: Hello World! (on the same line)

print("Processing", end="...\n")
print("Complete!")
# Output:
# Processing...
# Complete!
\`\`\`

### The 'sep' Parameter

Define a custom separator between multiple arguments:

\`\`\`python
print("2024", "12", "25", sep="-")
# Output: 2024-12-25

print("Python", "Java", "JavaScript", sep=" | ")
# Output: Python | Java | JavaScript
\`\`\`

### Escape Characters

Special characters that create formatting effects:

- \`\\n\` - New line
- \`\\t\` - Tab (4 spaces)
- \`\\"\` - Double quote
- \`\\\'\` - Single quote
- \`\\\\\` - Backslash

\`\`\`python
print("Line 1\\nLine 2\\nLine 3")
# Output:
# Line 1
# Line 2
# Line 3

print("Name\\t\\tAge\\t\\tCity")
print("Alice\\t\\t25\\t\\tNew York")
\`\`\`
        `,
        examples: [
          {
            title: "Creating Formatted Tables",
            code: `# Using tabs for alignment
print("Name\\t\\tAge\\tCity")
print("-" * 30)
print("Alice\\t\\t25\\tNew York")
print("Bob\\t\\t30\\tLondon")
print("Charlie\\t\\t28\\tParis")

# Using sep for CSV-style output
print("Name", "Age", "City", sep=", ")
print("Alice", 25, "New York", sep=", ")`,
            description: "Create organized, tabular output for better readability."
          },
          {
            title: "Dynamic Progress Indicators",
            code: `import time

print("Loading", end="")
for i in range(5):
    print(".", end="", flush=True)
    time.sleep(0.5)
print(" Done!")

# Progress bar
print("\\nDownloading: [", end="")
for i in range(20):
    print("#", end="", flush=True)
    time.sleep(0.1)
print("] 100%")`,
            description: "Create animated loading indicators (note: time.sleep adds delays)."
          },
          {
            title: "Creative Text Art",
            code: `# Create a box around text
message = "Welcome to Python!"
width = len(message) + 4

print("+" + "-" * (width - 2) + "+")
print("|" + " " * (width - 2) + "|")
print(f"| {message} |")
print("|" + " " * (width - 2) + "|")
print("+" + "-" * (width - 2) + "+")

# Diamond pattern
print("    *")
print("   ***")
print("  *****")
print(" *******")
print("  *****")
print("   ***")
print("    *")`,
            description: "Use print creatively to draw shapes and patterns with text."
          }
        ],
        keyPoints: [
          "'end' parameter controls line endings",
          "'sep' defines separator between arguments",
          "Escape sequences create special formatting",
          "Combine techniques for professional output"
        ],
        exercise: {
          title: "Build a Receipt Printer",
          instructions: "Create a program that prints a shopping receipt with items, prices, and a total. Use tabs and separators to make it look professional!",
          starterCode: `# Create a receipt that looks like:
# ================================
# SHOPPING RECEIPT
# ================================
# Item              Price
# --------------------------------
# Apple             $2.50
# Bread             $3.00
# Milk              $4.25
# --------------------------------
# Total:            $9.75
# ================================

`,
          solution: `# Solution
print("=" * 40)
print("SHOPPING RECEIPT".center(40))
print("=" * 40)
print("Item\\t\\t\\tPrice")
print("-" * 40)
print("Apple\\t\\t\\t$2.50")
print("Bread\\t\\t\\t$3.00")
print("Milk\\t\\t\\t$4.25")
print("-" * 40)
print("Total:\\t\\t\\t$9.75")
print("=" * 40)`
        }
      },
      4: {
        title: "Comments in Python",
        description: "Document your code like a professional",
        content: `
### What are Comments? 💬

Comments are lines in your code that Python **ignores completely**. They're for humans, not computers! Comments help you:

- **Explain** what your code does
- **Remind** yourself why you made certain decisions
- **Help others** understand your logic
- **Temporarily disable** code during testing

**Golden Rule:** Write code for humans to read, and only incidentally for machines to execute!

### Single-Line Comments

Use the hash symbol (\`#\`) to create a single-line comment:

\`\`\`python
# This is a single-line comment
print("Hello, World!")  # This is an inline comment
\`\`\`

### Multi-Line Comments

For longer explanations, use triple quotes (\`"""\` or \`'''\`):

\`\`\`python
"""
This is a multi-line comment.
It can span multiple lines and is often used
for documentation at the top of files or functions.
"""

def calculate_total(price, tax):
    '''
    Calculate the total price including tax.
    
    Parameters:
    - price: The base price
    - tax: The tax rate as a decimal
    
    Returns:
    - The total price
    '''
    return price * (1 + tax)
\`\`\`

### Best Practices

✅ **DO:**
- Write clear, concise comments
- Explain *why*, not *what* (code shows what)
- Update comments when you update code
- Use comments to document complex logic

❌ **DON'T:**
- State the obvious: \`x = 5  # Set x to 5\`
- Leave outdated comments
- Use comments as a substitute for clear code
- Write comments for every single line
        `,
        examples: [
          {
            title: "Good vs Bad Comments",
            code: `# ❌ Bad: Stating the obvious
x = 10  # Set x to 10

# ✅ Good: Explaining why
x = 10  # Maximum retries for API calls

# ❌ Bad: What the code does (obvious)
total = price * 1.08  # Multiply price by 1.08

# ✅ Good: Why this value
total = price * 1.08  # Apply 8% sales tax

# ❌ Bad: Outdated comment
# Calculate discount using old formula
total = price * 0.9  # Actually using 10% discount now

# ✅ Good: Current and informative
# Apply 10% discount for loyalty members
total = price * 0.9`,
            description: "Learn what makes a comment helpful versus redundant."
          },
          {
            title: "Documenting Your Code",
            code: `# File: calculator.py
# Purpose: Basic arithmetic operations
# Author: Your Name
# Date: 2024-02-26

def add(a, b):
    """Add two numbers and return the result."""
    return a + b

def complex_calculation(data):
    """
    Perform statistical analysis on dataset.
    
    This function calculates mean, median, and mode
    using a custom algorithm optimized for large datasets.
    
    Args:
        data (list): List of numerical values
        
    Returns:
        dict: Statistics including mean, median, mode
    """
    # Implementation details...
    pass`,
            description: "Professional documentation helps others understand your code."
          },
          {
            title: "Commenting Out Code",
            code: `# Active code
print("This runs!")

# Temporarily disabled for testing
# print("This is disabled")
# print("This too")

# You can quickly enable/disable code sections
def test_feature():
    # Old implementation - keeping for reference
    # result = slow_method()
    
    # New optimized implementation
    result = fast_method()
    return result

"""
Debugging notes:
- Bug found on line 45
- Issue with null values
- Fixed by adding validation
- TODO: Add unit tests
"""`,
            description: "Use comments to disable code temporarily or leave debugging notes."
          }
        ],
        keyPoints: [
          "Comments are ignored by Python (for humans only)",
          "# creates single-line comments",
          "Triple quotes create multi-line comments",
          "Good comments explain *why*, not *what*"
        ],
        exercise: {
          title: "Document a Program",
          instructions: "Write a program that calculates the area of a rectangle. Add meaningful comments to explain each step and why you're doing it.",
          starterCode: `# Your code here
# Remember: Good comments explain reasoning, not obvious things!

`,
          solution: `# Rectangle Area Calculator
# Purpose: Calculate and display the area of a rectangle

# Get dimensions from user
# Using float() to allow decimal values
length = float(input("Enter length: "))
width = float(input("Enter width: "))

# Calculate area using the formula: Area = length × width
area = length * width

# Display result with 2 decimal places for clarity
print(f"The area is: {area:.2f} square units")

"""
Future improvements:
- Add input validation (positive numbers only)
- Support different units (cm, inches, meters)
- Calculate perimeter as well
"""`
        }
      }
    },
    2: {  
      1: {
        title: "Declaring Variables",
        description: "Learn to store and manage data using variables",
        content: `
### What are Variables? 📦

A **variable** is a container that stores data. Think of it as a labeled box where you can put values and retrieve them later. In Python, variables make your code dynamic and reusable!

**Key Feature:** Python uses **dynamic typing** - you don't need to declare the type of a variable. Python figures it out automatically!

\`\`\`python
x = 5           # Integer
name = "Alice"  # String
price = 9.99    # Float
is_active = True # Boolean
\`\`\`

### Variable Naming Rules 📝

✅ **DO:**
- Start with a letter (a-z, A-Z) or underscore (_)
- Use letters, numbers, and underscores
- Use descriptive names: \`user_age\` not \`x\`
- Use snake_case for multi-word names

❌ **DON'T:**
- Start with a number: \`2fast\` ❌
- Use spaces: \`my var\` ❌
- Use reserved keywords: \`if, for, while\` ❌
- Use special characters: \`my@var\` ❌

### Case Sensitivity

Python is **case-sensitive** - these are all different variables:

\`\`\`python
name = "Alice"
Name = "Bob"
NAME = "Charlie"
# All three are different variables!
\`\`\`

### Reassigning Variables

Variables can be changed anytime:

\`\`\`python
score = 10
print(score)  # 10

score = 20
print(score)  # 20

score = score + 5
print(score)  # 25
\`\`\`
        `,
        examples: [
          {
            title: "Creating Variables",
            code: `# Basic variable assignment
name = "Alice"
age = 25
height = 5.6
is_student = True

# Print all variables
print("Name:", name)
print("Age:", age)
print("Height:", height)
print("Student:", is_student)

# Multiple assignment
x, y, z = 10, 20, 30
print(f"x={x}, y={y}, z={z}")`,
            description: "Learn the basics of creating and using variables in Python."
          },
          {
            title: "Variable Naming Styles",
            code: `# Good variable names (descriptive)
user_name = "John"
total_score = 95
is_valid = True
max_attempts = 3

# Poor variable names (not descriptive)
x = "John"  # What is x?
n = 95      # What does n mean?
f = True    # What is f?

# Snake case (Python convention)
first_name = "Alice"
last_name = "Smith"
full_name = first_name + " " + last_name

print("Full name:", full_name)`,
            description: "Follow Python naming conventions for readable, maintainable code."
          },
          {
            title: "Updating Variables",
            code: `# Counter example
clicks = 0
print("Initial clicks:", clicks)

# Increment
clicks = clicks + 1
print("After 1 click:", clicks)

# Shorthand operators
clicks += 5  # Same as: clicks = clicks + 5
print("After 5 more clicks:", clicks)

# Other shorthand operators
score = 100
score -= 20  # Subtract
score *= 2   # Multiply
score //= 3  # Integer division

print("Final score:", score)`,
            description: "Variables can be updated and modified throughout your program."
          }
        ],
        keyPoints: [
          "Variables store data values",
          "Python uses dynamic typing (no type declaration needed)",
          "Variable names must follow naming rules",
          "Variables are case-sensitive",
          "Use descriptive names for better code readability"
        ],
        exercise: {
          title: "Create a Personal Profile",
          instructions: "Create variables to store your personal information: name, age, city, and favorite hobby. Then print them in a formatted way using f-strings.",
          starterCode: `# Create your variables here
# Example: name = "Your Name"



# Print your profile
# Use f-strings to format the output nicely
`,
          solution: `# Solution
name = "Alice"
age = 25
city = "New York"
hobby = "Programming"

# Print formatted profile
print("=" * 40)
print("PERSONAL PROFILE".center(40))
print("=" * 40)
print(f"Name: {name}")
print(f"Age: {age}")
print(f"City: {city}")
print(f"Hobby: {hobby}")
print("=" * 40)`
        }
      },

      2: {
        title: "Data Type Basics",
        description: "Understand different types of data in Python",
        content: `
### Python Data Types 🔢

Python has several built-in data types to represent different kinds of information:

### Numeric Types

**1. Integer (int)** - Whole numbers
\`\`\`python
age = 25
year = 2024
negative = -10
\`\`\`

**2. Float** - Decimal numbers
\`\`\`python
price = 9.99
temperature = -3.5
pi = 3.14159
\`\`\`

### Text Type

**3. String (str)** - Text data
\`\`\`python
name = "Alice"
message = 'Hello, World!'
paragraph = """This is a
multi-line string"""
\`\`\`

### Boolean Type

**4. Boolean (bool)** - True or False
\`\`\`python
is_student = True
is_active = False
has_permission = True
\`\`\`

### Checking Data Types

Use the \`type()\` function to check a variable's type:

\`\`\`python
x = 42
print(type(x))  # <class 'int'>

y = 3.14
print(type(y))  # <class 'float'>

name = "Alice"
print(type(name))  # <class 'str'>
\`\`\`

### Why Data Types Matter

Different data types support different operations:
- Numbers: math operations (+, -, *, /)
- Strings: concatenation, slicing, formatting
- Booleans: logical operations (and, or, not)
        `,
        examples: [
          {
            title: "Working with Different Types",
            code: `# Integer examples
age = 25
year = 2024
print(f"Age: {age}, Type: {type(age)}")

# Float examples
price = 19.99
temperature = 98.6
print(f"Price: \${price}, Type: {type(price)}")

# String examples
first_name = "Alice"
last_name = "Smith"
full_name = first_name + " " + last_name
print(f"Name: {full_name}, Type: {type(full_name)}")

# Boolean examples
is_logged_in = True
has_access = False
print(f"Logged in: {is_logged_in}, Type: {type(is_logged_in)}")`,
            description: "See how different data types work and how to check their types."
          },
          {
            title: "Type Checking in Action",
            code: `# Create different variables
number = 42
decimal = 3.14
text = "Hello"
flag = True

# Check all types
print("Variable Types:")
print(f"number ({number}): {type(number).__name__}")
print(f"decimal ({decimal}): {type(decimal).__name__}")
print(f"text ({text}): {type(text).__name__}")
print(f"flag ({flag}): {type(flag).__name__}")

# Type comparison
print(f"\\nIs number an int? {type(number) == int}")
print(f"Is decimal a float? {type(decimal) == float}")`,
            description: "Use type() to inspect and verify variable types."
          },
          {
            title: "Type-Based Operations",
            code: `# Numeric operations
x = 10
y = 3
print(f"Addition: {x + y}")
print(f"Multiplication: {x * y}")
print(f"Division: {x / y}")

# String operations
greeting = "Hello"
name = "World"
print(f"Concatenation: {greeting + ' ' + name}")
print(f"Repetition: {greeting * 3}")

# Boolean operations
is_sunny = True
is_warm = False
print(f"AND: {is_sunny and is_warm}")
print(f"OR: {is_sunny or is_warm}")
print(f"NOT: {not is_warm}")`,
            description: "Different types support different operations."
          }
        ],
        keyPoints: [
          "int: Whole numbers (42, -10, 0)",
          "float: Decimal numbers (3.14, -0.5)",
          "str: Text data ('Hello', \"Python\")",
          "bool: True or False values",
          "Use type() to check variable types"
        ],
        exercise: {
          title: "Data Type Explorer",
          instructions: "Create variables of each type (int, float, str, bool), print their values and types. Then perform one operation with each type.",
          starterCode: `# Create one variable of each type
# int_var = 
# float_var = 
# str_var = 
# bool_var = 

# Print each variable and its type


# Perform operations
# (e.g., add numbers, concatenate strings, etc.)

`,
          solution: `# Solution
# Create variables
int_var = 100
float_var = 3.14
str_var = "Python"
bool_var = True

# Print values and types
print("Variable Values and Types:")
print(f"{int_var} is a {type(int_var).__name__}")
print(f"{float_var} is a {type(float_var).__name__}")
print(f"{str_var} is a {type(str_var).__name__}")
print(f"{bool_var} is a {type(bool_var).__name__}")

# Perform operations
print("\\nOperations:")
print(f"int doubled: {int_var * 2}")
print(f"float squared: {float_var ** 2}")
print(f"string repeated: {str_var * 3}")
print(f"bool negated: {not bool_var}")`
        }
      },
      3: {
        title: "Type Casting in Python",
        description: "Convert between different data types",
        content: `
### What is Type Casting? 🔄

**Type casting** (or type conversion) is the process of converting a value from one data type to another. This is essential when you need to perform operations that require specific types.

### Built-in Casting Functions

**1. int() - Convert to Integer**
\`\`\`python
x = "10"      # String
y = int(x)    # Convert to integer: 10

z = 3.14
w = int(z)    # Convert to integer: 3 (decimal part removed!)
\`\`\`

**2. float() - Convert to Float**
\`\`\`python
x = "3.14"     # String
y = float(x)   # Convert to float: 3.14

z = 10         # Integer
w = float(z)   # Convert to float: 10.0
\`\`\`

**3. str() - Convert to String**
\`\`\`python
x = 42         # Integer
y = str(x)     # Convert to string: "42"

z = True       # Boolean
w = str(z)     # Convert to string: "True"
\`\`\`

**4. bool() - Convert to Boolean**
\`\`\`python
# Non-zero numbers → True
print(bool(1))    # True
print(bool(-5))   # True
print(bool(0))    # False

# Non-empty strings → True
print(bool("Hi")) # True
print(bool(""))   # False
\`\`\`

### When to Use Casting

🔹 **User Input:** \`input()\` always returns a string
\`\`\`python
age = input("Enter age: ")  # Returns string "25"
age = int(age)              # Convert to integer 25
\`\`\`

🔹 **Mixed Operations:** Combining different types
\`\`\`python
# Can't directly add string and number
score = 95
message = "Your score is " + str(score)  # Convert score to string
\`\`\`

🔹 **Data Processing:** Cleaning and formatting data

### Common Pitfalls ⚠️

\`\`\`python
# This will cause an error!
int("Hello")  # ValueError: invalid literal

# Decimal in string → Need float first
int("3.14")   # ValueError
int(float("3.14"))  # Works! Result: 3
\`\`\`
        `,
        examples: [
          {
            title: "Basic Type Conversions",
            code: `# String to Number
str_num = "100"
int_num = int(str_num)
float_num = float(str_num)

print(f"Original: '{str_num}' (type: {type(str_num).__name__})")
print(f"As int: {int_num} (type: {type(int_num).__name__})")
print(f"As float: {float_num} (type: {type(float_num).__name__})")

# Number to String
number = 42
text = str(number)
print(f"\\nNumber: {number} → String: '{text}'")

# Float to Int (truncates decimal)
decimal = 9.99
whole = int(decimal)
print(f"\\nFloat: {decimal} → Int: {whole}")`,
            description: "Convert between strings, integers, and floats."
          },
          {
            title: "User Input Casting",
            code: `# Simulating user input (normally use input())
# In console: age_input = input("Enter your age: ")
age_input = "25"  # Simulated input

# Convert string to integer
age = int(age_input)

# Perform calculations
years_to_30 = 30 - age
print(f"You are {age} years old")
print(f"You'll be 30 in {years_to_30} years")

# Another example with float
# price_input = input("Enter price: ")
price_input = "19.99"
price = float(price_input)
tax = price * 0.08
total = price + tax

print(f"\nPrice: \${price:.2f}")
print(f"Tax: \${tax:.2f}")
print(f"Total: \${total:.2f}")`,
            description: "Convert user input strings to numbers for calculations."
          },
          {
            title: "Boolean Conversions",
            code: `# Numbers to Boolean
print("Number to Boolean:")
print(f"bool(0) = {bool(0)}")      # False
print(f"bool(1) = {bool(1)}")      # True
print(f"bool(-5) = {bool(-5)}")    # True
print(f"bool(100) = {bool(100)}")  # True

# Strings to Boolean
print("\\nString to Boolean:")
print(f"bool('') = {bool('')}")         # False (empty)
print(f"bool('Hello') = {bool('Hello')}")  # True
print(f"bool('0') = {bool('0')}")       # True (non-empty string!)

# Boolean to other types
print("\\nBoolean to Other Types:")
print(f"int(True) = {int(True)}")    # 1
print(f"int(False) = {int(False)}")  # 0
print(f"str(True) = '{str(True)}'")  # "True"`,
            description: "Understand how boolean conversions work with different values."
          }
        ],
        keyPoints: [
          "int() converts to integer (truncates decimals)",
          "float() converts to floating-point number",
          "str() converts any type to string",
          "bool() converts to True/False",
          "User input is always a string - cast it!"
        ],
        exercise: {
          title: "Temperature Converter",
          instructions: "Create a Celsius to Fahrenheit converter. Take a temperature as a string, convert it to a float, calculate F = (C × 9/5) + 32, and display the result rounded to 1 decimal place.",
          starterCode: `# Simulated user input
celsius_input = "25.5"

# Your code here:
# 1. Convert string to float
# 2. Calculate Fahrenheit
# 3. Display result

`,
          solution: `# Solution
celsius_input = "25.5"

# Convert string to float
celsius = float(celsius_input)

# Calculate Fahrenheit
fahrenheit = (celsius * 9/5) + 32

# Display result
print(f"{celsius}°C = {fahrenheit:.1f}°F")

# Bonus: Add error handling
try:
    celsius = float(celsius_input)
    fahrenheit = (celsius * 9/5) + 32
    print(f"\\nConversion: {celsius}°C = {fahrenheit:.1f}°F")
except ValueError:
    print("Error: Please enter a valid number!")`
        }
      },
    },
    3: {
      1: {
        title: "If-Else Statements",
        description: "Make decisions in your code with conditional logic",
        content: `
### Making Decisions with If-Else 🔀

**Control flow** allows your program to make decisions and execute different code based on conditions. The **if-else statement** is the foundation of decision-making in Python!

### Basic If Statement

\`\`\`python
age = 18
if age >= 18:
    print("You are an adult.")
# Output: You are an adult.
\`\`\`

### If-Else Statement

\`\`\`python
age = 15
if age >= 18:
    print("You can vote")
else:
    print("You cannot vote yet")
# Output: You cannot vote yet
\`\`\`

### If-Elif-Else Statement

Check multiple conditions:

\`\`\`python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
# Output: Grade: B
\`\`\`

### Indentation is CRUCIAL! ⚠️

Python uses **indentation** (4 spaces or 1 tab) to define code blocks:

\`\`\`python
# Correct
if temperature > 30:
    print("It's hot!")     # Indented
    print("Stay hydrated") # Also indented

# Wrong!
if temperature > 30:
print("It's hot!")  # IndentationError!
\`\`\`

### Comparison Operators

- \`==\` Equal to
- \`!=\` Not equal to
- \`>\` Greater than
- \`<\` Less than
- \`>=\` Greater than or equal
- \`<=\` Less than or equal

### Logical Operators

Combine conditions:
- \`and\` - Both conditions must be True
- \`or\` - At least one condition must be True
- \`not\` - Reverses the condition

\`\`\`python
age = 25
has_license = True

if age >= 18 and has_license:
    print("You can drive!")
\`\`\`
        `,
        examples: [
          {
            title: "Simple If-Else",
            code: `# Check if a number is positive or negative
number = 10

if number >= 0:
    print(f"{number} is positive")
else:
    print(f"{number} is negative")

# Age verification
age = 20
if age >= 18:
    print("Access granted: You are an adult")
else:
    years_left = 18 - age
    print(f"Access denied: Wait {years_left} more years")`,
            description: "Basic if-else statements for simple binary decisions."
          },
          {
            title: "Multiple Conditions with Elif",
            code: `# Grade calculator
score = 87

if score >= 90:
    grade = "A"
    message = "Excellent!"
elif score >= 80:
    grade = "B"
    message = "Great job!"
elif score >= 70:
    grade = "C"
    message = "Good work!"
elif score >= 60:
    grade = "D"
    message = "You passed."
else:
    grade = "F"
    message = "Need improvement."

print(f"Score: {score}")
print(f"Grade: {grade}")
print(f"Comment: {message}")`,
            description: "Use elif to handle multiple conditions efficiently."
          },
          {
            title: "Logical Operators",
            code: `# Login system check
username = "alice"
password = "pass123"
is_verified = True

if username == "alice" and password == "pass123" and is_verified:
    print("✓ Login successful!")
elif username != "alice":
    print("✗ Invalid username")
elif password != "pass123":
    print("✗ Invalid password")
else:
    print("✗ Account not verified")

# Weekend checker
day = "Saturday"

if day == "Saturday" or day == "Sunday":
    print("It's the weekend! 🎉")
else:
    print("It's a weekday. Time to work! 💼")`,
            description: "Combine multiple conditions using and, or, not operators."
          }
        ],
        keyPoints: [
          "if-else allows conditional code execution",
          "elif checks additional conditions",
          "Indentation (4 spaces) defines code blocks",
          "Use comparison operators: ==, !=, >, <, >=, <=",
          "Combine conditions with and, or, not"
        ],
        exercise: {
          title: "Movie Ticket Pricer",
          instructions: "Create a ticket price calculator: Children (<12): $5, Teens (12-17): $8, Adults (18-64): $12, Seniors (65+): $7. Ask for age and display the appropriate price.",
          starterCode: `# Simulated user input
age_input = "25"

# Convert to integer
age = int(age_input)

# Your code here:
# Use if-elif-else to determine ticket price

`,
          solution: `# Solution
age_input = "25"
age = int(age_input)

# Determine ticket price
if age < 12:
    price = 5
    category = "Child"
elif age < 18:
    price = 8
    category = "Teen"
elif age < 65:
    price = 12
    category = "Adult"
else:
    price = 7
    category = "Senior"

print(f"Age: {age}")
print(f"Category: {category}")
print(f"Ticket Price: \${price}")`
        }
      },
      2: {
        title: "Loops in Python",
        description: "Repeat code efficiently with for and while loops",
        content: `
### Repeating Code with Loops 🔁

**Loops** allow you to execute a block of code multiple times without writing it repeatedly. Python has two main types of loops:

### For Loops

Used to iterate over a **sequence** (range, list, string):

\`\`\`python
for i in range(5):
    print(i)
# Output: 0, 1, 2, 3, 4
\`\`\`

**The range() Function:**

\`\`\`python
range(5)        # 0, 1, 2, 3, 4 (start=0, stop=5)
range(1, 6)     # 1, 2, 3, 4, 5 (start=1, stop=6)
range(0, 10, 2) # 0, 2, 4, 6, 8 (start=0, stop=10, step=2)
\`\`\`

**Looping Through Strings:**

\`\`\`python
for letter in "Python":
    print(letter)
# Output: P, y, t, h, o, n (each on new line)
\`\`\`

### While Loops

Repeats **while a condition is True**:

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
# Output: 0, 1, 2, 3, 4
\`\`\`

⚠️ **Beware of Infinite Loops!**

\`\`\`python
# This runs forever!
while True:
    print("Help!")

# Always update the condition:
count = 0
while count < 5:
    print(count)
    count += 1  # Don't forget this!
\`\`\`

### Loop Control Statements

**break** - Exit the loop immediately:

\`\`\`python
for i in range(10):
    if i == 5:
        break
    print(i)
# Output: 0, 1, 2, 3, 4
\`\`\`

**continue** - Skip to next iteration:

\`\`\`python
for i in range(5):
    if i == 2:
        continue
    print(i)
# Output: 0, 1, 3, 4 (skips 2)
\`\`\`

### Nested Loops

Loops inside loops:

\`\`\`python
for i in range(3):
    for j in range(2):
        print(f"i={i}, j={j}")
\`\`\`
        `,
        examples: [
          {
            title: "For Loop Basics",
            code: `# Count from 1 to 10
print("Counting to 10:")
for num in range(1, 11):
    print(num, end=" ")

# Even numbers from 0 to 20
print("\\n\\nEven numbers:")
for num in range(0, 21, 2):
    print(num, end=" ")

# Countdown
print("\\n\\nCountdown:")
for num in range(10, 0, -1):
    print(num, end=" ")
print("Blastoff! 🚀")`,
            description: "Use range() to create different counting patterns."
          },
          {
            title: "While Loop Examples",
            code: `# Simple counter
count = 1
print("While loop counting:")
while count <= 5:
    print(f"Count: {count}")
    count += 1

# Password attempts (simulated)
attempts = 0
max_attempts = 3
password = "secret"

while attempts < max_attempts:
    # Simulated input
    user_input = "wrong" if attempts < 2 else "secret"
    
    if user_input == password:
        print("✓ Access granted!")
        break
    else:
        attempts += 1
        remaining = max_attempts - attempts
        print(f"✗ Wrong! {remaining} attempts left")
else:
    print("Account locked!")`,
            description: "While loops for unknown iteration counts."
          },
          {
            title: "Break and Continue",
            code: `# Find first number divisible by 7
print("Finding first multiple of 7 after 20:")
for num in range(20, 100):
    if num % 7 == 0:
        print(f"Found: {num}")
        break

# Skip negative numbers
print("\\nPositive numbers only:")
numbers = [-2, -1, 0, 1, 2, 3, -4, 5]
for num in numbers:
    if num <= 0:
        continue
    print(num, end=" ")

# Nested loop pattern
print("\\n\\nTriangle pattern:")
for i in range(1, 6):
    for j in range(i):
        print("*", end="")
    print()  # New line`,
            description: "Control loop flow with break and continue."
          }
        ],
        keyPoints: [
          "for loops iterate over sequences",
          "while loops run while condition is True",
          "range(start, stop, step) generates numbers",
          "break exits loop, continue skips iteration",
          "Watch out for infinite loops!"
        ],
        exercise: {
          title: "Multiplication Table Generator",
          instructions: "Create a program that generates a multiplication table for a given number (1-10). Use a for loop to calculate and display each row of the table.",
          starterCode: `# Generate multiplication table
number = 7  # Change this to generate different tables

# Your code here:
# Use a for loop to print: 7 x 1 = 7, 7 x 2 = 14, etc.

`,
          solution: `# Solution
number = 7

print(f"Multiplication Table for {number}")
print("=" * 25)

for i in range(1, 11):
    result = number * i
    print(f"{number} x {i:2d} = {result:3d}")

# Bonus: Create a grid (nested loops)
print("\\n\\nMultiplication Grid (1-5):")
print("   ", end="")
for i in range(1, 6):
    print(f"{i:4d}", end="")
print()
print("   " + "-" * 20)

for i in range(1, 6):
    print(f"{i} |", end="")
    for j in range(1, 6):
        print(f"{i*j:4d}", end="")
    print()`
        }
      }
    },
    4: {
       1: {
    title: "Introduction to Strings",
    description: "Master text data in Python",
    content: `
### What is a String? 📝

A **string** is a sequence of characters enclosed in quotes. Strings are one of the most commonly used data types in Python for handling text.

### Creating Strings

You can use **single quotes** or **double quotes**:

\`\`\`python
name = "Alice"
message = 'Hello World'
both_work = "Both are valid!"
\`\`\`

### Quotes Inside Strings

Use opposite quotes to include quotes in your string:

\`\`\`python
quote1 = "She said, 'Hello!'"
quote2 = 'He said, "Hi!"'
\`\`\`

Or use **escape characters**:

\`\`\`python
quote3 = "She said, \\"Hello!\\""
quote4 = 'He said, \\'Hi!\\''
\`\`\`

### Multi-line Strings

Use **triple quotes** for multi-line text:

\`\`\`python
poem = """
Roses are red,
Violets are blue,
Python is awesome,
And so are you!
"""
\`\`\`

### Strings are Immutable

Once created, strings **cannot be changed** (immutable):

\`\`\`python
text = "Hello"
# text[0] = "h"  # This causes an error!

# Instead, create a new string:
text = "h" + text[1:]  # "hello"
\`\`\`

### String Length

Use \`len()\` to get the number of characters:

\`\`\`python
name = "Python"
print(len(name))  # 6
\`\`\`

### Accessing Characters

Use **indexing** to access individual characters:

\`\`\`python
text = "Python"
print(text[0])   # P (first character)
print(text[-1])  # n (last character)
\`\`\`
    `,
    examples: [
      {
        title: "Creating and Using Strings",
        code: `# Different ways to create strings
single = 'Hello'
double = "World"
multi_line = """This is a
multi-line
string"""

print("Single quotes:", single)
print("Double quotes:", double)
print("Multi-line:")
print(multi_line)

# Quotes inside strings
dialog = "He said, 'Python is amazing!'"
print("\\nDialog:", dialog)

# Empty string
empty = ""
print("Empty string length:", len(empty))`,
        description: "Learn different ways to create and display strings."
      },
      {
        title: "String Indexing",
        code: `# Accessing characters by index
text = "Python"

# Positive indexing (0, 1, 2...)
print("First character:", text[0])   # P
print("Second character:", text[1])  # y
print("Last character:", text[5])    # n

# Negative indexing (-1, -2, -3...)
print("\\nNegative indexing:")
print("Last character:", text[-1])   # n
print("Second to last:", text[-2])   # o
print("First character:", text[-6])  # P

# String length
print(f"\\nString '{text}' has {len(text)} characters")`,
        description: "Access individual characters using positive and negative indices."
      },
      {
        title: "String Immutability",
        code: `# Strings cannot be changed
original = "Hello"
print("Original:", original)

# This would cause an error:
# original[0] = "h"  # TypeError!

# Instead, create a new string
lowercase_first = "h" + original[1:]
print("Modified:", lowercase_first)

# String concatenation
greeting = "Hello"
name = "Alice"
full_message = greeting + ", " + name + "!"
print("\\nConcatenated:", full_message)

# Using f-strings (modern way)
full_message_f = f"{greeting}, {name}!"
print("F-string:", full_message_f)`,
        description: "Understand string immutability and how to work with it."
      }
    ],
    keyPoints: [
      "Strings are sequences of characters in quotes",
      "Use single ' ' or double \" \" quotes",
      "Triple quotes \"\"\" for multi-line strings",
      "Strings are immutable (cannot be changed)",
      "Use len() for string length, [] for indexing"
    ],
    exercise: {
      title: "Name Badge Generator",
      instructions: "Create a program that takes a first name and last name, then creates a formatted name badge. Display the full name, its length, and the first and last letters.",
      starterCode: `# Your variables
first_name = "Alice"
last_name = "Smith"

# Your code here:
# 1. Create full name
# 2. Display length
# 3. Show first and last letters

`,
      solution: `# Solution
first_name = "Alice"
last_name = "Smith"

# Create full name
full_name = first_name + " " + last_name

# Display name badge
print("=" * 40)
print("NAME BADGE".center(40))
print("=" * 40)
print(f"Name: {full_name}")
print(f"Length: {len(full_name)} characters")
print(f"First Letter: {full_name[0]}")
print(f"Last Letter: {full_name[-1]}")
print("=" * 40)`
    }
  },

  2: {
    title: "String Slicing",
    description: "Extract parts of strings with slicing",
    content: `
### String Slicing ✂️

**Slicing** allows you to extract a portion (substring) of a string. It's one of the most powerful string operations!

### Basic Syntax

\`\`\`python
string[start:end]
\`\`\`

- **start**: Index where slice begins (inclusive)
- **end**: Index where slice ends (exclusive)

### Examples

\`\`\`python
text = "Python"

print(text[0:4])   # "Pyth" (characters 0,1,2,3)
print(text[2:5])   # "tho" (characters 2,3,4)
print(text[:3])    # "Pyt" (start omitted = 0)
print(text[3:])    # "hon" (end omitted = to end)
\`\`\`

### Step Parameter

Add a **step** to skip characters:

\`\`\`python
text = "Python"

print(text[::2])   # "Pto" (every 2nd character)
print(text[1::2])  # "yhn" (start at 1, every 2nd)
print(text[::-1])  # "nohtyP" (reverse!)
\`\`\`

### Negative Indices

Use negative numbers to count from the end:

\`\`\`python
text = "Python"

print(text[-3:])    # "hon" (last 3 characters)
print(text[:-2])    # "Pyth" (all except last 2)
print(text[-5:-2])  # "yth" (negative range)
\`\`\`

### Common Patterns

\`\`\`python
text = "Hello World"

# Get first 5 characters
print(text[:5])    # "Hello"

# Get last 5 characters
print(text[-5:])   # "World"

# Remove first and last character
print(text[1:-1])  # "ello Worl"

# Reverse string
print(text[::-1])  # "dlroW olleH"
\`\`\`

### Why Slicing?

- Extract parts of usernames, emails
- Get file extensions
- Parse formatted data
- Validate input formats
    `,
    examples: [
      {
        title: "Basic Slicing",
        code: `# Extract parts of a string
text = "Programming"

# Get first part
print("First 7 chars:", text[:7])    # "Program"

# Get last part
print("Last 4 chars:", text[-4:])    # "ming"

# Get middle part
print("Middle:", text[3:8])          # "grамm"

# Extract every other character
print("Every 2nd:", text[::2])       # "Pormiлg"

# Reverse the string
print("Reversed:", text[::-1])       # "gnimmargorP"`,
        description: "Master the basics of string slicing with start:end:step."
      },
      {
        title: "Practical Slicing",
        code: `# Email extraction
email = "user@example.com"

# Get username (before @)
username = email[:email.index("@")]
print("Username:", username)

# Get domain (after @)
domain = email[email.index("@")+1:]
print("Domain:", domain)

# File extension
filename = "document.pdf"
extension = filename[-3:]
print("\\nFile extension:", extension)

# Phone number formatting
phone = "1234567890"
formatted = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
print("\\nFormatted phone:", formatted)`,
        description: "Use slicing for real-world text processing tasks."
      },
      {
        title: "Slicing with Step",
        code: `# Different step values
alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

print("Every letter:", alphabet)
print("Every 2nd:", alphabet[::2])
print("Every 3rd:", alphabet[::3])
print("Every 5th:", alphabet[::5])

# Reverse with different steps
text = "123456789"
print("\\nOriginal:", text)
print("Reversed:", text[::-1])
print("Reverse every 2nd:", text[::-2])

# Get alternating characters
message = "HSeelclroeWtoMrledsge"
hidden = message[::2]  # Every 2nd character
print("\\nHidden message:", hidden)`,
        description: "Use step parameter for advanced slicing patterns."
      }
    ],
    keyPoints: [
      "Slicing syntax: string[start:end:step]",
      "end index is exclusive (not included)",
      "Omit start = from beginning, omit end = to end",
      "Negative indices count from the end",
      "Use [::-1] to reverse a string"
    ],
    exercise: {
      title: "String Slicer",
      instructions: "Given a sentence, extract: 1) First word, 2) Last word, 3) Middle portion, 4) Reversed sentence. Use slicing only!",
      starterCode: `# Given sentence
sentence = "Python is awesome"

# Your code here:
# Hint: Find spaces using sentence.index(" ")
# Use slicing to extract parts

`,
      solution: `# Solution
sentence = "Python is awesome"

# Find space positions
first_space = sentence.index(" ")
last_space = sentence.rindex(" ")

# Extract parts
first_word = sentence[:first_space]
last_word = sentence[last_space+1:]
middle = sentence[first_space+1:last_space]
reversed_sentence = sentence[::-1]

# Display results
print("Original:", sentence)
print("First word:", first_word)
print("Last word:", last_word)
print("Middle:", middle)
print("Reversed:", reversed_sentence)`
    }
  },

  3: {
    title: "String Modification & Concatenation",
    description: "Transform and combine strings effectively",
    content: `
### String Methods 🔧

Strings have built-in **methods** to create modified copies (remember, strings are immutable!):

### Case Conversion

\`\`\`python
text = "Hello World"

print(text.upper())      # "HELLO WORLD"
print(text.lower())      # "hello world"
print(text.title())      # "Hello World"
print(text.capitalize()) # "Hello world"
print(text.swapcase())   # "hELLO wORLD"
\`\`\`

### String Concatenation ➕

**Using + operator:**

\`\`\`python
first = "Hello"
second = "World"
result = first + " " + second
print(result)  # "Hello World"
\`\`\`

**Using join():**

\`\`\`python
words = ["Python", "is", "awesome"]
sentence = " ".join(words)
print(sentence)  # "Python is awesome"
\`\`\`

**Using f-strings (modern):**

\`\`\`python
name = "Alice"
age = 25
message = f"Hello, I'm {name} and I'm {age} years old"
\`\`\`

### String Repetition

\`\`\`python
star = "*"
border = star * 20
print(border)  # ********************

laugh = "ha" * 5
print(laugh)  # hahahahahahaha
\`\`\`

### Escape Characters

Special characters that create formatting:

- \`\\n\` - New line
- \`\\t\` - Tab
- \`\\\\\` - Backslash
- \`\\'\` - Single quote
- \`\\"\` - Double quote

\`\`\`python
print("Line 1\\nLine 2")
print("Name:\\tAlice\\nAge:\\t25")
print("She said, \\"Hello!\\"")
\`\`\`

### Replace & Remove

\`\`\`python
text = "Hello World"

# Replace substring
new_text = text.replace("World", "Python")
print(new_text)  # "Hello Python"

# Remove whitespace
messy = "  spaces  "
clean = messy.strip()   # "spaces"
clean_left = messy.lstrip()  # "spaces  "
clean_right = messy.rstrip()  # "  spaces"
\`\`\`
    `,
    examples: [
      {
        title: "String Methods",
        code: `# Case conversion
text = "python programming"

print("Original:", text)
print("Upper:", text.upper())
print("Title:", text.title())
print("Capitalize:", text.capitalize())

# Checking string properties
email = "user@example.com"
print("\\nString checks:")
print("Is lowercase?", email.islower())
print("Is alpha?", email.isalpha())
print("Contains '@'?", "@" in email)

# Replace
sentence = "I love Java"
fixed = sentence.replace("Java", "Python")
print("\\nFixed:", fixed)`,
        description: "Explore built-in string methods for text transformation."
      },
      {
        title: "Concatenation Techniques",
        code: `# Method 1: + operator
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name
print("Using +:", full_name)

# Method 2: join()
words = ["Python", "is", "amazing"]
sentence = " ".join(words)
print("Using join():", sentence)

# Method 3: f-strings (recommended!)
age = 25
occupation = "Developer"
bio = f"{full_name} is a {age}-year-old {occupation}"
print("Using f-string:", bio)

# Repeat strings
print("\\n" + "=" * 40)
print("ANNOUNCEMENT".center(40))
print("=" * 40)`,
        description: "Learn different ways to combine and format strings."
      },
      {
        title: "Escape Characters & Formatting",
        code: `# Escape characters
print("Line 1\\nLine 2\\nLine 3")
print("\\nTabbed list:")
print("Name:\\tAlice")
print("Age:\\t25")
print("City:\\tNew York")

# Quotes in strings
quote = "He said, \\"Python is awesome!\\""
print("\\n" + quote)

# Path with backslashes
path = "C:\\\\Users\\\\Documents\\\\file.txt"
print("\\nFile path:", path)

# Raw strings (ignore escapes)
raw_path = r"C:\\Users\\Documents\\file.txt"
print("Raw string:", raw_path)

# Multi-line with triple quotes
message = """
Dear User,

Welcome to Python!

Best regards,
The Team
"""
print(message)`,
        description: "Master escape sequences and special formatting."
      }
    ],
    keyPoints: [
      "Use .upper(), .lower(), .title() for case conversion",
      "Concatenate with +, join(), or f-strings",
      "Repeat strings with * operator",
      "Escape sequences: \\n (newline), \\t (tab)",
      ".replace() and .strip() modify strings"
    ],
    exercise: {
      title: "Name Formatter",
      instructions: "Create a program that takes a messy name input (with extra spaces, wrong case), cleans it up, and displays it in different formats: UPPERCASE, lowercase, Title Case, and a formatted greeting.",
      starterCode: `# Messy input
messy_name = "  jOhN   DOE  "

# Your code here:
# 1. Clean up the name (remove extra spaces)
# 2. Display in different formats
# 3. Create a greeting

`,
      solution: `# Solution
messy_name = "  jOhN   DOE  "

# Clean up
clean_name = messy_name.strip().title()

# Different formats
uppercase = clean_name.upper()
lowercase = clean_name.lower()
title_case = clean_name.title()

# Create greeting
greeting = f"Hello, {clean_name}! Welcome aboard!"

# Display
print("=" * 50)
print("NAME FORMATTER".center(50))
print("=" * 50)
print(f"Original:   '{messy_name}'")
print(f"Cleaned:    {clean_name}")
print(f"UPPERCASE:  {uppercase}")
print(f"lowercase:  {lowercase}")
print(f"Title Case: {title_case}")
print("\\n" + greeting)
print("=" * 50)`
    }
  },

  4: {
    title: "String Formatting",
    description: "Create dynamic strings with embedded values",
    content: `
### Modern String Formatting 🎨

Python offers multiple ways to embed values into strings. **F-strings** (Python 3.6+) are the most modern and readable!

### F-Strings (Recommended!)

**Basic syntax:**

\`\`\`python
name = "Alice"
age = 25
greeting = f"Hello, I'm {name} and I'm {age} years old"
print(greeting)
# Output: Hello, I'm Alice and I'm 25 years old
\`\`\`

**Expressions inside f-strings:**

\`\`\`python
x = 10
y = 5
print(f"{x} + {y} = {x + y}")  # 10 + 5 = 15
print(f"Is {x} greater than {y}? {x > y}")  # True
\`\`\`

### Format Specifiers

Control how numbers and text are displayed:

**Number formatting:**

\`\`\`python
price = 49.9876
print(f"Price: \${price:.2f}")  # $49.99 (2 decimals)

percentage = 0.856
print(f"Success rate: {percentage:.1%}")  # 85.6%

large = 1234567
print(f"Population: {large:,}")  # 1,234,567 (commas)
\`\`\`

**Text alignment:**

\`\`\`python
text = "Python"
print(f"|{text:<10}|")  # Left align:  |Python    |
print(f"|{text:>10}|")  # Right align: |    Python|
print(f"|{text:^10}|")  # Center:      |  Python  |
\`\`\`

**Padding with characters:**

\`\`\`python
number = 42
print(f"{number:05}")  # 00042 (pad with zeros)
\`\`\`

### The .format() Method

Older but still widely used:

\`\`\`python
template = "Hello, {} and {}"
result = template.format("Alice", "Bob")
print(result)  # Hello, Alice and Bob

# Named placeholders
message = "I'm {name}, age {age}".format(name="Charlie", age=30)
\`\`\`

### % Formatting (Legacy)

The oldest method, still seen in older code:

\`\`\`python
name = "Diana"
age = 28
print("My name is %s and I'm %d years old" % (name, age))
\`\`\`

### Practical Use Cases

**Creating tables:**

\`\`\`python
print(f"{'Name':<15} {'Age':>5} {'City':<12}")
print("-" * 35)
print(f"{'Alice':<15} {25:>5} {'New York':<12}")
print(f"{'Bob':<15} {30:>5} {'Seattle':<12}")
\`\`\`

**Currency formatting:**

\`\`\`python
prices = [19.99, 149.5, 2.99, 999.99]
for price in prices:
    print(f"\${price:>8.2f}")
\`\`\`
    `,
    examples: [
      {
        title: "F-String Basics",
        code: `# Simple variable insertion
name = "Alice"
age = 25
city = "Paris"

print(f"Hello! My name is {name}.")
print(f"I am {age} years old.")
print(f"I live in {city}.")

# Expressions in f-strings
x = 10
y = 5
print(f"\\n{x} + {y} = {x + y}")
print(f"{x} * {y} = {x * y}")
print(f"{x} > {y} is {x > y}")

# Method calls
text = "python"
print(f"\\nOriginal: {text}")
print(f"Uppercase: {text.upper()}")
print(f"Capitalized: {text.capitalize()}")

# Multi-line f-strings
message = f"""
Name: {name}
Age: {age}
City: {city}
"""
print(message)`,
        description: "Master f-string basics for clean, readable code."
      },
      {
        title: "Advanced Formatting",
        code: `# Number formatting
price = 1234.5678
percentage = 0.8567
population = 7890123

print("CURRENCY & NUMBERS")
print(f"Price: \${price:.2f}")  # 2 decimal places
print(f"Percentage: {percentage:.1%}")  # As percentage
print(f"Population: {population:,}")  # With commas

# Text alignment
print("\\nALIGNMENT")
word = "Python"
print(f"|{word:<15}|")  # Left
print(f"|{word:>15}|")  # Right
print(f"|{word:^15}|")  # Center

# Padding with zeros
number = 42
print(f"\\nPADDING")
print(f"Order #{number:05}")  # 00042
print(f"ID: {number:08}")     # 00000042

# Creating tables
print("\\nTABLE FORMATTING")
print(f"{'Product':<20} {'Price':>10}")
print("-" * 30)
print(f"{'Laptop':<20} \${1299.99:>9.2f}")
print(f"{'Mouse':<20} \${29.99:>9.2f}")
print(f"{'Keyboard':<20} \${79.99:>9.2f}")`,
        description: "Use format specifiers for professional output."
      },
      {
        title: "Real-World Invoice",
        code: `# Invoice generator
customer = "John Doe"
invoice_id = 1234
items = [
    ("Laptop", 1, 1299.99),
    ("Mouse", 2, 29.99),
    ("USB Cable", 3, 9.99)
]

# Header
print("=" * 50)
print("INVOICE".center(50))
print("=" * 50)
print(f"Customer: {customer}")
print(f"Invoice #: {invoice_id:05}")
print("=" * 50)

# Items
print(f"{'Item':<20} {'Qty':>5} {'Price':>10} {'Total':>10}")
print("-" * 50)

subtotal = 0
for item, qty, price in items:
    total = qty * price
    subtotal += total
    print(f"{item:<20} {qty:>5} \${price:>9.2f} \${total:>9.2f}")

# Summary
tax_rate = 0.08
tax = subtotal * tax_rate
grand_total = subtotal + tax

print("-" * 50)
print(f"{'Subtotal:':>40} \${subtotal:>9.2f}")
print(f"{'Tax (8%):':>40} \${tax:>9.2f}")
print("=" * 50)
print(f"{'TOTAL:':>40} \${grand_total:>9.2f}")
print("=" * 50)`,
        description: "Build a professional invoice with formatted output."
      }
    ],
    keyPoints: [
      "F-strings are the modern way: f\"text {variable}\"",
      "Use :.2f for 2 decimal places",
      "Use :, for thousands separator",
      "Alignment: < (left), > (right), ^ (center)",
      "Format specifiers create professional output"
    ],
    exercise: {
      title: "Student Report Card",
      instructions: "Create a formatted report card that displays student information and grades. Calculate the average and display everything with proper alignment and formatting.",
      starterCode: `# Student data
student_name = "Alice Johnson"
student_id = 12345
subjects = ["Math", "English", "Science", "History"]
grades = [92, 88, 95, 85]

# Your code here:
# 1. Calculate average grade
# 2. Create a formatted report card
# 3. Use proper alignment and number formatting

`,
      solution: `# Solution
student_name = "Alice Johnson"
student_id = 12345
subjects = ["Math", "English", "Science", "History"]
grades = [92, 88, 95, 85]

# Calculate average
average = sum(grades) / len(grades)

# Report card header
print("=" * 60)
print("STUDENT REPORT CARD".center(60))
print("=" * 60)
print(f"Student: {student_name}")
print(f"ID: {student_id:05}")
print("=" * 60)

# Grades table
print(f"{'Subject':<20} {'Grade':>10} {'Status':<15}")
print("-" * 60)

for subject, grade in zip(subjects, grades):
    status = "Excellent" if grade >= 90 else "Good" if grade >= 80 else "Pass"
    print(f"{subject:<20} {grade:>10} {status:<15}")

# Summary
print("=" * 60)
print(f"{'Average Grade:':>30} {average:>10.2f}")

if average >= 90:
    comment = "Outstanding performance!"
elif average >= 80:
    comment = "Great work!"
else:
    comment = "Keep it up!"

print(f"{'Comment:':>30} {comment:>20}")
print("=" * 60)`
    }
  },

  5: {
    title: "Common String Methods",
    description: "Master essential string manipulation techniques",
    content: `
### Essential String Methods 🛠️

Strings come with powerful **built-in methods** for common tasks. Let's explore the most useful ones!

### Trimming Whitespace

Remove unwanted spaces:

\`\`\`python
text = "  hello world  "

print(text.strip())   # "hello world" (both sides)
print(text.lstrip())  # "hello world  " (left side)
print(text.rstrip())  # "  hello world" (right side)
\`\`\`

### Splitting & Joining

**Split strings into lists:**

\`\`\`python
sentence = "Python is awesome"
words = sentence.split()  # ['Python', 'is', 'awesome']

csv_data = "apple,banana,cherry"
fruits = csv_data.split(",")  # ['apple', 'banana', 'cherry']

data = "2024-01-15"
parts = data.split("-")  # ['2024', '01', '15']
\`\`\`

**Join lists into strings:**

\`\`\`python
words = ["Python", "is", "great"]
sentence = " ".join(words)  # "Python is great"

path_parts = ["home", "user", "documents"]
path = "/".join(path_parts)  # "home/user/documents"
\`\`\`

### Searching Strings

**Find substrings:**

\`\`\`python
text = "Hello World"

print(text.find("World"))    # 6 (index of "World")
print(text.find("Python"))   # -1 (not found)
print(text.index("World"))   # 6 (raises error if not found)

print(text.count("l"))       # 3 (how many times)
\`\`\`

**Check string content:**

\`\`\`python
email = "user@example.com"

print(email.startswith("user"))  # True
print(email.endswith(".com"))    # True
print("@" in email)              # True
\`\`\`

### String Validation

Check what type of characters a string contains:

\`\`\`python
"hello".isalpha()    # True (only letters)
"hello123".isalnum() # True (letters or numbers)
"12345".isdigit()    # True (only digits)
"hello".islower()    # True (all lowercase)
"HELLO".isupper()    # True (all uppercase)
"  ".isspace()       # True (only whitespace)
\`\`\`

### Replacing Content

\`\`\`python
text = "I love Java"

# Replace all occurrences
new_text = text.replace("Java", "Python")
print(new_text)  # "I love Python"

# Replace limited times
data = "one one one"
result = data.replace("one", "two", 2)  # "two two one"
\`\`\`

### Practical Combinations

**Clean user input:**

\`\`\`python
user_input = "  HELLO@EXAMPLE.COM  "
cleaned = user_input.strip().lower()
print(cleaned)  # "hello@example.com"
\`\`\`

**Parse CSV data:**

\`\`\`python
csv_line = "Alice,25,New York"
name, age, city = csv_line.split(",")
\`\`\`

**Build file paths:**

\`\`\`python
folders = ["documents", "projects", "python"]
path = "/".join(folders)  # "documents/projects/python"
\`\`\`
    `,
    examples: [
      {
        title: "Cleaning & Parsing Text",
        code: `# Messy user input
raw_input = "  alice@EXAMPLE.com  "

# Clean it up
cleaned_email = raw_input.strip().lower()
print("Cleaned email:", cleaned_email)

# Validate email format
has_at = "@" in cleaned_email
has_dot = "." in cleaned_email
is_valid = has_at and has_dot and not cleaned_email.startswith("@")

print("Is valid?", is_valid)

# Parse CSV data
csv_data = "Alice,25,Developer,New York"
name, age, job, city = csv_data.split(",")

print("\\nParsed Data:")
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Job: {job}")
print(f"City: {city}")

# Split by multiple words
sentence = "Python is awesome and fun"
words = sentence.split()
print(f"\\nWords ({len(words)}): {words}")`,
        description: "Clean, validate, and parse text data effectively."
      },
      {
        title: "Searching & Validation",
        code: `# Search for substrings
text = "Python Programming Language"

print("SEARCHING")
print("'Programming' starts at:", text.find("Programming"))
print("'Java' found?", text.find("Java"))  # -1 means not found
print("Number of 'a's:", text.count("a"))

# Check prefix/suffix
filename = "document.pdf"
print("\\nFILE CHECKS")
print("Is PDF?", filename.endswith(".pdf"))
print("Starts with 'doc'?", filename.startswith("doc"))

# Validate input types
password = "MyPass123"
username = "alice_99"
pin = "1234"

print("\\nVALIDATION")
print("Password is alphanumeric?", password.isalnum())
print("Username is alphanumeric?", username.isalnum())  # False (has _)
print("PIN is digits only?", pin.isdigit())

# Check case
message = "hello world"
title = "BREAKING NEWS"
print("\\nCASE CHECKS")
print("Message all lowercase?", message.islower())
print("Title all uppercase?", title.isupper())`,
        description: "Search text and validate string properties."
      },
      {
        title: "Real-World Text Processor",
        code: `# Log file processor
log_entries = [
    "  ERROR: Failed to connect  ",
    "  INFO: Server started successfully  ",
    "  WARNING: High memory usage  ",
    "  ERROR: Database timeout  "
]

print("LOG PROCESSOR")
print("=" * 50)

errors = []
warnings = []
infos = []

for entry in log_entries:
    # Clean the entry
    clean_entry = entry.strip()
    
    # Categorize
    if clean_entry.startswith("ERROR"):
        errors.append(clean_entry)
    elif clean_entry.startswith("WARNING"):
        warnings.append(clean_entry)
    elif clean_entry.startswith("INFO"):
        infos.append(clean_entry)

# Display results
print(f"Errors ({len(errors)}):")
for error in errors:
    print(f"  - {error}")

print(f"\\nWarnings ({len(warnings)}):")
for warning in warnings:
    print(f"  - {warning}")

print(f"\\nInfo ({len(infos)}):")
for info in infos:
    print(f"  - {info}")

# Generate summary
print("\\n" + "=" * 50)
summary_parts = [
    f"{len(errors)} errors",
    f"{len(warnings)} warnings",
    f"{len(infos)} info messages"
]
summary = ", ".join(summary_parts)
print(f"Summary: {summary}")`,
        description: "Process and categorize log file entries."
      }
    ],
    keyPoints: [
      ".strip() removes whitespace from both ends",
      ".split() breaks strings into lists",
      ".join() combines lists into strings",
      ".find() returns index or -1 if not found",
      ".startswith() and .endswith() check prefixes/suffixes"
    ],
    exercise: {
      title: "Email Validator & Parser",
      instructions: "Create a program that validates email addresses and extracts the username and domain. Check if the email has @ symbol, proper format, and ends with common domains (.com, .org, .edu).",
      starterCode: `# Test emails
emails = [
    "alice@example.com",
    "bob@university.edu",
    "invalid-email",
    "charlie@company.org"
]

# Your code here:
# 1. Validate each email
# 2. Extract username and domain for valid emails
# 3. Display results in a formatted way

`,
      solution: `# Solution
emails = [
    "alice@example.com",
    "bob@university.edu",
    "invalid-email",
    "charlie@company.org"
]

print("=" * 60)
print("EMAIL VALIDATOR & PARSER".center(60))
print("=" * 60)

valid_domains = [".com", ".org", ".edu", ".net"]

for email in emails:
    email = email.strip().lower()
    
    # Validation checks
    has_at = "@" in email
    at_count = email.count("@")
    has_valid_domain = any(email.endswith(domain) for domain in valid_domains)
    
    is_valid = has_at and at_count == 1 and has_valid_domain
    
    print(f"\\nEmail: {email}")
    print(f"Status: {'✓ VALID' if is_valid else '✗ INVALID'}")
    
    if is_valid:
        # Parse username and domain
        parts = email.split("@")
        username = parts[0]
        domain = parts[1]
        
        print(f"  Username: {username}")
        print(f"  Domain: {domain}")
        
        # Check domain type
        if domain.endswith(".edu"):
            print(f"  Type: Educational")
        elif domain.endswith(".com"):
            print(f"  Type: Commercial")
        elif domain.endswith(".org"):
            print(f"  Type: Organization")
    else:
        print(f"  Reason: ", end="")
        if not has_at:
            print("Missing @ symbol")
        elif at_count != 1:
            print("Multiple @ symbols")
        elif not has_valid_domain:
            print("Invalid domain extension")

print("\\n" + "=" * 60)`
    }
  }

    }
  }
};

const LevelPage = () => {
  const { moduleId, lessonId, levelId } = useParams();
  const level = levelContent[moduleId]?.[lessonId]?.[levelId];
  const [activeTab, setActiveTab] = useState('learn');
  const [currentExample, setCurrentExample] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  // Reset solution visibility when switching examples or tabs
  useEffect(() => {
    setShowSolution(false);
  }, [currentExample, activeTab]);

  if (!level)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-400 mb-4">Level Not Found</h2>
          <p className="text-slate-300 mb-6">This lesson level doesn't exist yet.</p>
          <Link 
            to="/learn" 
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Return to Learn Page
          </Link>
        </div>
      </div>
    );

  const hasExamples = level.examples && level.examples.length > 0;
  const hasExercise = level.exercise;

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-dark-lighter/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/learn/${moduleId}`}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Module</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                Module {moduleId} • Lesson {lessonId} • Level {levelId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {level.title}
              </h1>
              {level.description && (
                <p className="text-xl text-slate-300">
                  {level.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg border border-white/10"
        >
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'learn'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn</span>
          </button>
          {hasExamples && (
            <button
              onClick={() => setActiveTab('examples')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'examples'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Examples</span>
            </button>
          )}
          {hasExercise && (
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'practice'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Practice</span>
            </button>
          )}
        </motion.div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Learn Tab */}
              {activeTab === 'learn' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
                  <div className="prose prose-invert prose-lg max-w-none
                      prose-headings:text-white 
                      prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-6
                      prose-p:text-slate-300 prose-p:leading-relaxed
                      prose-strong:text-primary prose-strong:font-semibold
                      prose-code:text-primary prose-code:bg-slate-900/50 prose-code:px-2 prose-code:py-1 prose-code:rounded
                      prose-ul:text-slate-300 prose-li:my-1
                      prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {level.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Examples Tab */}
              {activeTab === 'examples' && hasExamples && (
                <div className="space-y-6">
                  {/* Example Selector */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <label className="text-slate-300 text-sm font-medium mb-3 block">
                      Choose an Example:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {level.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentExample(idx)}
                          className={`p-4 rounded-lg text-left transition-all ${
                            currentExample === idx
                              ? 'bg-primary text-white shadow-lg shadow-primary/30'
                              : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900 border border-white/10'
                          }`}
                        >
                          <div className="font-semibold mb-1">{example.title}</div>
                          <div className="text-sm opacity-80 line-clamp-2">
                            {example.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Example Display */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {level.examples[currentExample].title}
                          </h3>
                          <p className="text-slate-300">
                            {level.examples[currentExample].description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <UniversalCodePlayground
                        defaultLanguage="python"
                        initialCode={level.examples[currentExample].code}
                        height="400px"
                        showThemeToggle={false}
                      />
                    </div>
                  </div>

                  {/* Solution/Explanation Section */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        {showSolution ? 'Hide' : 'Show'} Code Explanation
                      </span>
                      <motion.div
                        animate={{ rotate: showSolution ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>
                    {showSolution && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 bg-slate-900/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-4 h-4 text-primary" />
                            <span className="text-sm text-slate-300 font-medium">Code Breakdown</span>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-white/10">
                            <SyntaxHighlighter
                              language="python"
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: '1.5rem',
                                fontSize: '14px',
                                lineHeight: '1.6'
                              }}
                              showLineNumbers={true}
                            >
                              {level.examples[currentExample].code}
                            </SyntaxHighlighter>
                          </div>
                          <div className="mt-4 p-4 bg-dark-lighter rounded-lg">
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {level.examples[currentExample].description}
                            </p>
                            <p className="mt-3 text-sm text-primary font-medium">
                              💡 Try running the code above to see it in action!
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Practice Tab */}
              {activeTab === 'practice' && hasExercise && (
                <div className="space-y-6">
                  {/* Exercise Instructions */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Target className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {level.exercise.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                          {level.exercise.instructions}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-slate-900/30">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold">Your Solution:</h4>
                        <span className="text-xs text-slate-400">Write your code and test it!</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <UniversalCodePlayground
                        defaultLanguage="python"
                        initialCode={level.exercise.starterCode}
                        height="400px"
                        showThemeToggle={false}
                      />
                    </div>
                  </div>

                  {/* Hints Section */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Challenge Tips</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Think about the problem step by step</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Test your code with the play button</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Don't be afraid to experiment and make mistakes!</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24 space-y-6"
            >
              {/* Key Points */}
              {level.keyPoints && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {level.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="bg-dark-lighter border border-primary/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-white font-bold text-lg mb-3">Your Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Current Level:</span>
                    <span className="text-white font-semibold">{levelId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lesson:</span>
                    <span className="text-white font-semibold">{lessonId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Module:</span>
                    <span className="text-white font-semibold">{moduleId}</span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Pro Tips
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Run the examples to see how they work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Try modifying the code to experiment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Complete the practice exercise to reinforce learning</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelPage;



