/**
 * Seed Script for Supabase Database
 * Run this to populate the Pyscape curriculum
 * Usage: node src/utils/seedDatabase.js
 */

import supabase from './supabaseClient.js';

// All Python Fundamentals Skills
const SKILLS = [
  // Tier 1: Python Basics
  { name: 'Python Syntax Basics', domain: 'python', difficulty: 1, estimated_minutes: 60, icon: '🐍', description: 'Variables, print statements, basic data types' },
  { name: 'Numbers & Math', domain: 'python', difficulty: 1, estimated_minutes: 45, icon: '➕', description: 'Arithmetic operators, operator precedence' },
  { name: 'Strings & Text', domain: 'python', difficulty: 1, estimated_minutes: 50, icon: '📝', description: 'String manipulation, concatenation, formatting' },
  
  // Tier 2: Control Flow
  { name: 'Boolean Logic', domain: 'python', difficulty: 2, estimated_minutes: 40, icon: '✅', description: 'True/False, comparison and logical operators' },
  { name: 'Conditionals (If/Else)', domain: 'python', difficulty: 2, estimated_minutes: 50, icon: '🔀', description: 'If-else statements, elif chains, nested conditions' },
  { name: 'While Loops', domain: 'python', difficulty: 2, estimated_minutes: 55, icon: '🔁', description: 'While loops, break, continue' },
  { name: 'For Loops', domain: 'python', difficulty: 2, estimated_minutes: 55, icon: '🔄', description: 'For loops, range(), iteration patterns' },
  
  // Tier 3: Data Structures
  { name: 'Lists & Arrays', domain: 'python', difficulty: 2, estimated_minutes: 70, icon: '📋', description: 'List creation, indexing, slicing, methods' },
  { name: 'Dictionaries', domain: 'python', difficulty: 2, estimated_minutes: 65, icon: '📚', description: 'Key-value pairs, dict methods' },
  { name: 'Functions', domain: 'python', difficulty: 2, estimated_minutes: 80, icon: '⚙️', description: 'Defining functions, parameters, return values' },
  
  // Tier 4: Advanced Python
  { name: 'File I/O', domain: 'python', difficulty: 3, estimated_minutes: 60, icon: '📁', description: 'Reading/writing files, CSV handling' },
  { name: 'Error Handling', domain: 'python', difficulty: 3, estimated_minutes: 55, icon: '⚠️', description: 'Try-except blocks, raising exceptions' },
  { name: 'Object-Oriented Programming', domain: 'python', difficulty: 3, estimated_minutes: 90, icon: '🎯', description: 'Classes, objects, inheritance' },
  
  // Tier 5: Data Science
  { name: 'NumPy Basics', domain: 'python', difficulty: 3, estimated_minutes: 75, icon: '🔢', description: 'Arrays, vectorization, mathematical operations' },
  { name: 'Pandas DataFrames', domain: 'python', difficulty: 3, estimated_minutes: 90, icon: '🐼', description: 'DataFrames, Series, data manipulation' },
  { name: 'Data Visualization', domain: 'python', difficulty: 3, estimated_minutes: 70, icon: '📊', description: 'Matplotlib, Seaborn, plotting' },
  
  // Tier 6: Machine Learning
  { name: 'ML Fundamentals', domain: 'python', difficulty: 4, estimated_minutes: 100, icon: '🤖', description: 'Supervised/unsupervised learning' },
  { name: 'Linear Regression', domain: 'python', difficulty: 4, estimated_minutes: 85, icon: '📈', description: 'Regression, cost functions' },
  { name: 'Classification Models', domain: 'python', difficulty: 4, estimated_minutes: 90, icon: '🎯', description: 'Decision trees, evaluation metrics' },
  
  // Tier 7: Deep Learning
  { name: 'Neural Networks', domain: 'python', difficulty: 5, estimated_minutes: 120, icon: '🧠', description: 'Perceptrons, activation functions' },
  { name: 'Convolutional Networks (CNN)', domain: 'python', difficulty: 5, estimated_minutes: 110, icon: '🖼️', description: 'Conv layers, image classification' },
  { name: 'Recurrent Networks (RNN)', domain: 'python', difficulty: 5, estimated_minutes: 105, icon: '♻️', description: 'LSTM, GRU, sequence modeling' },
  
  // Tier 8: Specializations
  { name: 'NLP Fundamentals', domain: 'python', difficulty: 5, estimated_minutes: 100, icon: '💬', description: 'Text processing, tokenization' },
  { name: 'Computer Vision', domain: 'python', difficulty: 5, estimated_minutes: 105, icon: '👁️', description: 'Image processing, object detection' },
  { name: 'Web Development', domain: 'python', difficulty: 4, estimated_minutes: 95, icon: '🌐', description: 'Flask/Django, REST APIs' },
];

// Skill Dependencies (DAG)
const DEPENDENCIES = [
  // Tier 2 depends on Tier 1
  { depends_on: 0, depends_on_target: 1 }, // Boolean Logic depends on Python Syntax
  { depends_on: 0, depends_on_target: 2 }, // Conditionals depends on Boolean Logic (via index)
  
  // Control flow is hierarchical
  { depends_on: 3, depends_on_target: 4 }, // Conditionals depends on Boolean Logic
  { depends_on: 4, depends_on_target: 5 }, // While Loops depends on Conditionals
  { depends_on: 5, depends_on_target: 6 }, // For Loops depends on While Loops
  
  // Data structures depend on basics
  { depends_on: 6, depends_on_target: 7 }, // Lists depend on For Loops
  { depends_on: 7, depends_on_target: 8 }, // Dicts depend on Lists
  { depends_on: 4, depends_on_target: 9 }, // Functions depend on Conditionals
  
  // Advanced depends on basics
  { depends_on: 9, depends_on_target: 10 }, // File I/O depends on Functions
  { depends_on: 10, depends_on_target: 11 }, // Error Handling depends on File I/O
  { depends_on: 11, depends_on_target: 12 }, // OOP depends on Error Handling
  
  // Data Science depends on Data Structures
  { depends_on: 12, depends_on_target: 13 }, // NumPy depends on OOP
  { depends_on: 13, depends_on_target: 14 }, // Pandas depends on NumPy
  { depends_on: 14, depends_on_target: 15 }, // Visualization depends on Pandas
  
  // ML depends on Data Science
  { depends_on: 15, depends_on_target: 16 }, // ML Fund depends on Visualization
  { depends_on: 16, depends_on_target: 17 }, // Linear Regression depends on ML
  { depends_on: 17, depends_on_target: 18 }, // Classification depends on LR
  
  // Deep Learning depends on ML
  { depends_on: 18, depends_on_target: 19 }, // Neural Networks depends on Classification
  { depends_on: 19, depends_on_target: 20 }, // CNN depends on Neural Networks
  { depends_on: 19, depends_on_target: 21 }, // RNN depends on Neural Networks
  
  // Specializations depend on Deep Learning
  { depends_on: 21, depends_on_target: 22 }, // NLP depends on RNN
  { depends_on: 20, depends_on_target: 23 }, // CV depends on CNN
  { depends_on: 12, depends_on_target: 24 }, // Web Dev depends on OOP
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Insert skills
    console.log('📚 Inserting skills...');
    const { data: insertedSkills, error: skillsError } = await supabase
      .from('skills')
      .insert(SKILLS.map(s => ({ ...s, is_published: true })))
      .select();

    if (skillsError) throw skillsError;
    console.log(`✅ Inserted ${insertedSkills.length} skills`);

    // 2. Build skill ID map (name -> UUID)
    const skillMap = {};
    insertedSkills.forEach((skill, idx) => {
      skillMap[idx] = skill.id;
    });

    // 3. Insert dependencies using the UUIDs
    console.log('🔗 Inserting skill dependencies...');
    const dependencyRecords = DEPENDENCIES.map(dep => ({
      skill_id: skillMap[dep.depends_on],
      depends_on: skillMap[dep.depends_on_target]
    })).filter(d => d.skill_id && d.depends_on);

    const { data: insertedDeps, error: depsError } = await supabase
      .from('skill_dependencies')
      .insert(dependencyRecords);

    if (depsError) throw depsError;
    console.log(`✅ Inserted ${insertedDeps?.length || dependencyRecords.length} dependencies`);

    console.log('🎉 Database seed completed successfully!');
    return { success: true, skillCount: insertedSkills.length };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(result => {
      console.log('✨ Seed complete:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
