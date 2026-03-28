/**
 * Extract hardcoded levelContent from LevelPage.js and generate migration SQL
 * This script converts the nested levelContent object into SQL UPDATE statements
 * for populating lessons.parts in Module 1
 */

const fs = require('fs');

// Hardcoded levelContent for Module 1 only (4 lessons)
const levelContent = {
  1: {
    1: {
      1: {
        title: "Welcome to Python!",
        description: "Begin your journey into one of the world's most popular programming languages",
        content: `### What is Python? 🐍

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
4. **Community Support**: Millions of developers and extensive documentation`,
        examples: [
          {
            title: "Your First Python Program",
            code: `# This is a comment - Python ignores these lines
# Let's write our first program!

print("Hello, World!")
print("Welcome to Python programming!")

# Python is that simple! 🎉`,
            description: "Run this code to see Python in action. The print() function displays text on the screen.",
            testCases: [
              { description: "Outputs 'Hello, World!' as first line", check: "Hello, World!" },
              { description: "Outputs the welcome message", check: "Welcome to Python programming!" }
            ]
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
        content: `### The print() Function 🖨️

The **print()** function is your primary tool for displaying output in Python.`,
        examples: [],
        keyPoints: [
          "print() displays output on the screen",
          "Use quotes (single or double) for text",
          "Default behavior adds a newline after each print"
        ],
        exercise: {
          title: "Print Practice Challenge",
          instructions: "Create a program that prints your name, age, and favorite color.",
          starterCode: `# Your code here\n`,
          solution: `print("Name: Alice")\nprint("Age: 25")\nprint("Color: Blue")`
        }
      },
      3: {
        title: "Advanced Print Techniques",
        description: "Learn professional formatting and output control",
        content: `### Multiple Arguments in print()`,
        examples: [],
        keyPoints: ["'end' parameter controls line endings"],
        exercise: {
          title: "Build a Receipt Printer",
          instructions: "Create a program that prints a shopping receipt.",
          starterCode: `# Receipt code\n`,
          solution: `print("=" * 40)\nprint("RECEIPT")`
        }
      },
      4: {
        title: "Comments in Python",
        description: "Document your code like a professional",
        content: `### What are Comments? 💬

Comments are lines in your code that Python **ignores completely**.`,
        examples: [],
        keyPoints: [
          "Comments are ignored by Python",
          "# creates single-line comments",
          "Good comments explain *why*, not *what*"
        ],
        exercise: {
          title: "Document a Program",
          instructions: "Write a program that calculates the area of a rectangle.",
          starterCode: `# Your code here\n`,
          solution: `# Rectangle calculator\nprint("Hello")`
        }
      }
    },
    2: {
      1: {
        title: "Declaring Variables",
        description: "Learn to store and manage data using variables",
        content: `### What are Variables? 📦

A **variable** is a container that stores data.`,
        examples: [],
        keyPoints: [
          "Variables store data values",
          "Python uses dynamic typing"
        ],
        exercise: {
          title: "Create a Personal Profile",
          instructions: "Create variables to store your personal information.",
          starterCode: `# Create your variables\n`,
          solution: `name = "Alice"\nage = 25`
        }
      },
      2: {
        title: "Data Type Basics",
        description: "Understand different types of data in Python",
        content: `### Python Data Types 🔢`,
        examples: [],
        keyPoints: [
          "int: Whole numbers",
          "float: Decimal numbers",
          "str: Text data",
          "bool: True or False values"
        ],
        exercise: {
          title: "Data Type Explorer",
          instructions: "Create variables of each type.",
          starterCode: `# Create one variable of each type\n`,
          solution: `int_var = 100\nfloat_var = 3.14`
        }
      },
      3: {
        title: "Type Casting in Python",
        description: "Convert between different data types",
        content: `### What is Type Casting? 🔄`,
        examples: [],
        keyPoints: [
          "int() converts to integer",
          "float() converts to floating-point",
          "str() converts any type to string"
        ],
        exercise: {
          title: "Temperature Converter",
          instructions: "Create a Celsius to Fahrenheit converter.",
          starterCode: `celsius_input = "25.5"\n`,
          solution: `celsius = float(celsius_input)`
        }
      }
    },
    3: {
      1: {
        title: "If-Else Statements",
        description: "Make decisions in your code with conditional logic",
        content: `### Making Decisions with If-Else 🔀`,
        examples: [],
        keyPoints: [
          "if-else allows conditional code execution",
          "Indentation (4 spaces) defines code blocks"
        ],
        exercise: {
          title: "Movie Ticket Pricer",
          instructions: "Create a ticket price calculator based on age.",
          starterCode: `age = 25\n`,
          solution: `if age < 12:\n    print("Child")`
        }
      },
      2: {
        title: "Loops in Python",
        description: "Repeat code efficiently with for and while loops",
        content: `### Repeating Code with Loops 🔁`,
        examples: [],
        keyPoints: [
          "for loops iterate over sequences",
          "while loops run while condition is True",
          "break exits loop, continue skips iteration"
        ],
        exercise: {
          title: "Multiplication Table Generator",
          instructions: "Create a program that generates a multiplication table.",
          starterCode: `number = 7\n`,
          solution: `for i in range(1, 11):\n    print(f"{number} x {i} = {number*i}")`
        }
      }
    },
    4: {
      1: {
        title: "Introduction to Strings",
        description: "Master text data in Python",
        content: `### What is a String? 📝

A **string** is a sequence of characters enclosed in quotes.`,
        examples: [],
        keyPoints: [
          "Strings are sequences of characters",
          "Use single ' ' or double \" \" quotes",
          "Strings are immutable (cannot be changed)"
        ],
        exercise: {
          title: "Name Badge Generator",
          instructions: "Create a program that takes a name and creates a formatted badge.",
          starterCode: `first_name = "Alice"\nlast_name = "Smith"\n`,
          solution: `full_name = first_name + " " + last_name\nprint(f"Name: {full_name}")`
        }
      },
      2: {
        title: "String Slicing",
        description: "Extract parts of strings with slicing",
        content: `### String Slicing ✂️

**Slicing** allows you to extract a portion (substring) of a string.`,
        examples: [],
        keyPoints: [
          "Slicing syntax: string[start:end:step]",
          "end index is exclusive (not included)",
          "Use [::-1] to reverse a string"
        ],
        exercise: {
          title: "String Slicer",
          instructions: "Extract parts of a sentence using slicing.",
          starterCode: `sentence = "Python is awesome"\n`,
          solution: `first_word = sentence[:6]\nlast_word = sentence[-7:]`
        }
      },
      3: {
        title: "String Modification & Concatenation",
        description: "Transform and combine strings effectively",
        content: `### String Methods 🔧`,
        examples: [],
        keyPoints: [
          "Use .upper(), .lower(), .title() for case conversion",
          "Concatenate with +, join(), or f-strings"
        ],
        exercise: {
          title: "Name Formatter",
          instructions: "Clean up and format a messy name input.",
          starterCode: `messy_name = "  jOhN   DOE  "\n`,
          solution: `clean_name = messy_name.strip().title()`
        }
      },
      4: {
        title: "String Formatting",
        description: "Create dynamic strings with embedded values",
        content: `### Modern String Formatting 🎨`,
        examples: [],
        keyPoints: [
          "F-strings are the modern way: f\"text {variable}\"",
          "Use :.2f for 2 decimal places"
        ],
        exercise: {
          title: "Student Report Card",
          instructions: "Create a formatted report card with student information.",
          starterCode: `student_name = "Alice Johnson"\nstudent_id = 12345\n`,
          solution: `print(f"Student: {student_name}")`
        }
      },
      5: {
        title: "Common String Methods",
        description: "Master essential string manipulation techniques",
        content: `### Essential String Methods 🛠️`,
        examples: [],
        keyPoints: [
          ".strip() removes whitespace from both ends",
          ".split() breaks strings into lists",
          ".join() combines lists into strings"
        ],
        exercise: {
          title: "Email Validator & Parser",
          instructions: "Validate email addresses and extract username and domain.",
          starterCode: `email = "alice@example.com"\n`,
          solution: `parts = email.split("@")\nusername = parts[0]`
        }
      }
    }
  }
};

// Function to escape JSON for SQL
function escapeSqlJson(obj) {
  return JSON.stringify(obj).replace(/'/g, "''");
}

// Generate migration SQL
function generateMigration() {
  const migrations = [];
  
  // For Module 1
  for (const lessonId in levelContent[1]) {
    const lessonData = levelContent[1][lessonId];
    
    // Convert levels object to array
    const partsArray = [];
    for (const levelId in lessonData) {
      const level = lessonData[levelId];
      partsArray.push({
        level: parseInt(levelId),
        title: level.title,
        description: level.description,
        content: level.content,
        examples: level.examples || [],
        keyPoints: level.keyPoints || [],
        exercise: level.exercise || null,
        testCases: level.examples?.flatMap(ex => ex.testCases || []) || []
      });
    }
    
    // Generate UPDATE statement
    const jsonValue = escapeSqlJson(partsArray);
    const stmt = `UPDATE lessons SET parts = '[${jsonValue.substring(1, jsonValue.length - 1)}]'::jsonb WHERE module_id = 1 AND order_index = ${lessonId};`;
    migrations.push(stmt);
  }
  
  return migrations;
}

// Generate and save migration file
const statementLines = generateMigration();
const migrationContent = `-- Migration 014: Populate lessons.parts with Module 1 lesson sublevels
-- This populates the parts column for Python Fundamentals module lessons

BEGIN;

-- Update Lesson 1: Python Basics (Print, Comments, etc.)
${statementLines[0]}

-- Update Lesson 2: Variables and Data Types
${statementLines[1]}

-- Update Lesson 3: Control Flow (If-Else, Loops)
${statementLines[2]}

-- Update Lesson 4: Strings (Intro, Slicing, Formatting, Methods)
${statementLines[3]}

-- Verify the updates
SELECT id, title, parts FROM lessons WHERE module_id = 1 ORDER BY order_index;

COMMIT;
`;

console.log("Migration SQL:\n");
console.log(migrationContent);

// Save to file
fs.writeFileSync('migrations/014_populate_lesson_parts.sql', migrationContent);
console.log("\n✅ Migration file created: migrations/014_populate_lesson_parts.sql");
