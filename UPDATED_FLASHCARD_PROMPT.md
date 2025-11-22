📚 Expert-Level PDF-to-Flashcard Generator Prompt (Updated for Adaptive Learning System)

📋 TASK OVERVIEW

Convert any educational PDF into a comprehensive set of high-quality flashcards optimized for active recall and spaced repetition. Each flashcard must be clear, focused, and designed to test understanding rather than just memorization. The flashcards must comprehensively cover ALL areas and topics in the PDF document.

**IMPORTANT**: This content will be displayed in an adaptive learning interface that automatically adjusts formatting, spacing, colors, and typography based on the user's neurodivergence profile (ADHD, Dyslexia, Autism, or AUDHD). Structure your flashcards to work optimally with these adaptive display features.

**CRITICAL REQUIREMENTS**:
- Generate the EXACT number of flashcards requested by the user (between 20-40 cards)
- Ensure flashcards cover ALL major topics, concepts, and areas in the PDF
- Distribute flashcards evenly across all sections and topics
- Include a mix of question types: definitions, concepts, processes, formulas, examples, and applications
- Each flashcard must be self-contained and clear

🔍 ANALYSIS PHASES

1. **Comprehensive Topic Mapping** – Identify ALL major topics, subtopics, and concepts in the document
2. **Concept Prioritization** – Determine which concepts are most important and should have multiple cards
3. **Coverage Distribution** – Ensure even distribution across all identified topics
4. **Question Variety** – Create diverse question types to test different levels of understanding

📝 FLASHCARD FORMATTING GUIDELINES

**Output Format** (JSON Array):

Your output MUST be a valid JSON array of flashcard objects. Each flashcard must follow this exact structure:

```json
[
  {
    "id": 1,
    "question": "What is [concept]?",
    "answer": "Detailed answer explaining the concept clearly.",
    "topic": "Main topic or section this card belongs to",
    "difficulty": "easy|medium|hard"
  },
  {
    "id": 2,
    "question": "Explain [process] step by step.",
    "answer": "Step 1: ...\nStep 2: ...\nStep 3: ...",
    "topic": "Main topic or section",
    "difficulty": "easy|medium|hard"
  }
]
```

**Question Guidelines**:

- **Be specific and clear** – Questions should test understanding, not just recall
- **Use varied question types**:
  - Definition questions: "What is X?"
  - Explanation questions: "Explain how X works"
  - Comparison questions: "What is the difference between X and Y?"
  - Process questions: "What are the steps in X?"
  - Application questions: "When would you use X?"
  - Formula questions: "What is the formula for X?"
  - Example questions: "Give an example of X"
- **Avoid vague or overly broad questions**
- **One concept per card** – Don't combine multiple unrelated concepts
- **Use active voice** – Make questions engaging and direct

**Answer Guidelines**:

- **Be comprehensive but concise** – Answers should be complete but not overwhelming
- **Use clear, simple language** – Avoid unnecessary jargon
- **Include context when helpful** – Help the learner understand why this matters
- **For processes**: Use numbered steps or bullet points
- **For formulas**: Include the formula and explain what each variable means
- **For definitions**: Provide the definition plus a brief example or context
- **For comparisons**: Clearly state differences and similarities
- **Use formatting**:
  - **Bold** for key terms
  - Bullet points (`-`) for lists
  - Numbered lists (`1.`, `2.`) for sequential steps
  - Inline math: `$E = mc^2$` for formulas within text
  - Block math: `$$\nE = mc^2\n$$` for standalone formulas

**Mathematical Content**:

- Use **inline math**: `$E = mc^2$` for short equations within answers
- Use **block math** for standalone equations:
  ```
  $$
  E = mc^2
  $$
  ```
- Always format mathematical expressions using LaTeX notation
- If no formulas are found in the source material, do not include any

**Topic Classification**:

- Assign each flashcard to a specific topic or section from the PDF
- Use clear, descriptive topic names (e.g., "Photosynthesis", "Set Theory Operations", "Newton's Laws")
- This helps users organize and study by topic

**Difficulty Levels**:

- **Easy**: Basic definitions, simple facts, introductory concepts
- **Medium**: Concepts requiring understanding, comparisons, moderate complexity
- **Hard**: Complex processes, advanced applications, multi-step reasoning

📊 COVERAGE REQUIREMENTS

**Comprehensive Topic Coverage**:

1. **Identify ALL major topics** in the PDF:
   - Main sections and chapters
   - Key concepts and theories
   - Important processes and procedures
   - Formulas and equations (if present)
   - Examples and applications
   - Historical context or background (if relevant)

2. **Distribute flashcards evenly**:
   - If the PDF has 5 major topics and user requests 25 cards, aim for ~5 cards per topic
   - Adjust distribution based on topic importance and complexity
   - Ensure no major topic is completely omitted

3. **Cover different learning levels**:
   - Include foundational concepts (easy)
   - Include intermediate understanding (medium)
   - Include advanced applications (hard)
   - Mix of difficulty levels across all topics

4. **Question type variety**:
   - Definitions: 20-30% of cards
   - Explanations/Processes: 30-40% of cards
   - Comparisons/Relationships: 15-20% of cards
   - Applications/Examples: 15-20% of cards
   - Formulas (if applicable): 10-15% of cards

**Example Distribution for 30 Cards**:

- Topic 1 (Introduction/Overview): 5-6 cards
- Topic 2 (Core Concepts): 6-7 cards
- Topic 3 (Processes/Methods): 6-7 cards
- Topic 4 (Applications/Examples): 5-6 cards
- Topic 5 (Advanced Topics): 4-5 cards
- Topic 6 (Summary/Review): 2-3 cards

🧠 FLASHCARD QUALITY GUIDELINES

1. **Active Recall Focus**:
   - Questions should prompt the learner to retrieve information
   - Avoid questions that can be answered with a simple "yes" or "no"
   - Encourage deeper thinking and understanding

2. **Clarity and Precision**:
   - Questions must be unambiguous
   - Answers must be accurate and complete
   - Avoid vague or confusing wording

3. **Educational Value**:
   - Each card should teach something meaningful
   - Focus on important concepts, not trivial details
   - Prioritize understanding over memorization

4. **Progressive Difficulty**:
   - Start with foundational concepts
   - Build to more complex ideas
   - Create cards that build on previous knowledge

5. **Context and Application**:
   - Include real-world applications when relevant
   - Connect concepts to broader themes
   - Help learners see the bigger picture

⚙️ GENERATION STRATEGIES

1. **Topic Analysis First**:
   - Read through the entire PDF
   - List all major topics and subtopics
   - Identify key concepts, processes, and formulas
   - Note important examples and applications

2. **Strategic Distribution**:
   - Calculate cards per topic based on total requested
   - Prioritize important topics with more cards
   - Ensure coverage of all major areas
   - Balance foundational and advanced content

3. **Question Creation**:
   - Create diverse question types for each topic
   - Mix definition, explanation, comparison, and application questions
   - Ensure questions test understanding, not just recall
   - Make questions specific and actionable

4. **Answer Crafting**:
   - Provide complete, accurate answers
   - Use clear, simple language
   - Include examples or context when helpful
   - Format for easy reading (lists, bold, spacing)

5. **Quality Check**:
   - Verify all major topics are covered
   - Ensure requested number of cards is generated
   - Check that questions are clear and answerable
   - Confirm answers are accurate and complete

📋 OUTPUT STRUCTURE

**Required JSON Format**:

```json
[
  {
    "id": 1,
    "question": "What is [concept]?",
    "answer": "**[Concept]** is [definition]. [Additional context or example if helpful].",
    "topic": "Topic Name",
    "difficulty": "easy"
  },
  {
    "id": 2,
    "question": "Explain the process of [process name].",
    "answer": "The process involves the following steps:\n\n1. **Step 1**: [Description]\n2. **Step 2**: [Description]\n3. **Step 3**: [Description]",
    "topic": "Topic Name",
    "difficulty": "medium"
  },
  {
    "id": 3,
    "question": "What is the formula for [concept] and what does each variable represent?",
    "answer": "The formula is:\n\n$$\n[Formula]\n$$\n\nWhere:\n- **Variable 1**: [Explanation]\n- **Variable 2**: [Explanation]",
    "topic": "Topic Name",
    "difficulty": "hard"
  }
]
```

**Important Notes**:

- The output MUST be valid JSON
- The array must contain EXACTLY the number of flashcards requested
- Each flashcard must have all required fields: id, question, answer, topic, difficulty
- Use proper JSON escaping for special characters
- Do not include any text before or after the JSON array

✅ FINAL CHECKLIST

Before finalizing your output, ensure:

- ✅ Generated EXACTLY the requested number of flashcards (between 20-40)
- ✅ Covered ALL major topics and areas in the PDF
- ✅ Distributed flashcards evenly across all topics
- ✅ Included a variety of question types (definitions, explanations, comparisons, applications)
- ✅ Mixed difficulty levels appropriately
- ✅ Each question is clear, specific, and testable
- ✅ Each answer is complete, accurate, and well-formatted
- ✅ Used proper formatting (bold, lists, math notation) in answers
- ✅ Assigned appropriate topics to each card
- ✅ Output is valid JSON that can be parsed
- ✅ No major topic or concept is omitted
- ✅ Questions test understanding, not just memorization
- ✅ Answers provide context and examples when helpful

🎯 ADAPTIVE DISPLAY COMPATIBILITY

Your flashcards will be automatically enhanced by the adaptive display system:

- **For ADHD users**: Content will have increased spacing, visual breaks, and color-coded topics
- **For Dyslexic users**: Font size and spacing will be increased, formatting optimized for readability
- **For Autistic users**: Clear structure and consistent formatting will be emphasized
- **For AUDHD users**: Combined optimizations will be applied

Structure your flashcards to maximize the effectiveness of these automatic enhancements by:

- Using clear, consistent formatting in answers
- Breaking complex answers into lists or steps
- Using bold strategically for key terms
- Maintaining consistent structure across all cards

---

**Remember**: Your goal is to create a comprehensive set of flashcards that covers ALL areas of the PDF topic, distributed evenly across all major concepts, with the EXACT number of cards requested. Each flashcard should be clear, focused, and designed to promote active recall and deep understanding. The output must be valid JSON that can be directly parsed and used by the flashcard display system.



