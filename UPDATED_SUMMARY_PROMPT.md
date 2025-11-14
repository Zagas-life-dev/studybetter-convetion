📚 Expert-Level PDF-to-Study Guide Transformer Prompt (Updated for Adaptive Learning System)

📋 TASK OVERVIEW

Convert any educational PDF into a comprehensive, exam-ready study guide using logical structure, visual formatting, and practical insights. The guide must be self-contained and optimized for deep learning, active recall, and quick revision. 

**IMPORTANT**: This content will be displayed in an adaptive reading interface that automatically adjusts formatting, spacing, colors, and typography based on the user's neurodivergence profile (ADHD, Dyslexia, Autism, or AUDHD). Structure your content to work optimally with these adaptive display features.

🔍 ANALYSIS PHASES

1. **Initial Scan**: Detect document layout, headings, and academic level
2. **Concept Extraction**: Identify terms, theories, comparisons, and examples
3. **Pattern Mapping**: Highlight relationships, processes, frameworks
4. **Contextual Enrichment**: Add historical background, applications, and scholar views

📝 FORMATTING GUIDELINES

**Markdown Structure** (Use clear, progressive headings):
- `#` for the main title
- `##` for top-level sections
- `###` for subsections
- `####` for nested examples or theories

**Text Formatting**:
- **Bold** all key definitions, distinctions, and theorist names
- Use bullet points (`-` or `*`) for concept lists
- Use numbered lists (`1.`, `2.`, etc.) for sequential steps or classifications
- Use *italics* sparingly for side notes, examples, or cultural context (note: italics are automatically converted to bold for dyslexic users)
- Use `---` (horizontal rules) to divide major sections
- Leave adequate spacing between sections for easy reading and scanning

**Mathematical Content**:
- Use **inline math**: `$E = mc^2$` for short equations within a sentence
- Use **block math** for standalone equations or derivations:
  ```
  $$
  E = mc^2
  $$
  ```
- Ensure block math is centered and on its own line
- Always format mathematical expressions using LaTeX notation
- If no formulas are found in the source material, do not include any

**Images and Visual Content**:
- **CRITICAL**: If the PDF contains images, charts, diagrams, or visual elements, you MUST include them using image links/URLs
- Use standard Markdown image syntax with accessible URLs: `![Alt text](image-url)`
- The image URL should be a direct link to the image file (HTTP/HTTPS URL, data URL, or base64 encoded image)
- For images extracted from the PDF, convert them to accessible URLs or data URLs (base64 format: `data:image/png;base64,...`)
- Always provide meaningful, descriptive alt text that explains what the image shows
- Place images near the relevant text they illustrate
- **Image URL formats supported**:
  - HTTP/HTTPS URLs: `![Description](https://example.com/image.png)`
  - Data URLs (base64): `![Description](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)`
  - Relative URLs: `![Description](/path/to/image.png)`
- If you cannot generate an accessible image URL, provide a comprehensive text description
- Example formats:
  - `![Chart showing quarterly sales trends](https://example.com/chart.png)`
  - `![Diagram of the process flow](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)`
- For complex diagrams, provide both the image link and a detailed text description
- Ensure all image links are valid and accessible

**Visual Structure** (Optimized for Adaptive Display):
- Create clear visual hierarchy with consistent heading levels
- Use spacing strategically to create visual breaks (especially important for ADHD users)
- Structure content in digestible chunks (2-3 sentence paragraphs work best)
- Use lists liberally to break up dense text
- Include clear transitions between topics

📊 CONTENT STRUCTURE

```
# [Subject Name]: Exam-Ready Study Guide

---

## 1. Core Concepts Overview

- Key definitions
- Fundamental principles
- Scope of the subject

---

## 2. Essential Components/Frameworks

- Main theories/methods
- Critical formulas/equations (only if present in source)
- Classification systems

---

## 3. Step-by-Step Processes

1. First step
2. Second step
3. Third step

---

## 4. Practical Applications

- Real-world example 1
- Real-world example 2

---

## 5. Visual Elements

- Include any images, charts, or diagrams from the PDF using Markdown image syntax: `![Description](image-url)`
- Provide detailed descriptions of visual content
- Explain relationships shown in diagrams
- If images cannot be embedded, provide comprehensive text descriptions

---

## 6. Exam Preparation

### Key Points to Remember

- Concept 1
- Concept 2

---

### Common Mistakes

- Mistake 1
- Mistake 2

---

### Practice Questions

- MCQ-style questions
- Problem-solving examples

---

## 7. Additional Important Information

- Supplementary concepts
- Historical context
- Related topics
```

🧠 CONTENT QUALITY GUIDELINES

1. **Be comprehensive but concise**
   - Capture all essential information from the PDF
   - Eliminate redundancy
   - Focus on exam-relevant material
   - Ensure the summary contains everything from the uploaded document

2. **Enhance understandability**
   - Define all technical terms when first introduced
   - Use clear, direct language
   - Create logical flow between concepts
   - Provide context for abstract ideas

3. **Add pedagogical value**
   - Include memory aids where helpful
   - Highlight relationships between concepts
   - Point out common confusions/mistakes
   - Create connections across sections

4. **Maintain subject-appropriate depth**
   - Match the technical level of the source material
   - Preserve mathematical precision (if applicable)
   - Include discipline-specific conventions
   - Maintain academic rigor

5. **Optimize for adaptive display**
   - Structure content to work well with automatic formatting adjustments
   - Use consistent heading hierarchies
   - Break content into scannable sections
   - Create clear visual separation between topics

⚙️ GENERATION STRATEGIES

1. **Apply progressive detail**
   - Start with general overview
   - Build to specific details
   - End with synthesis/application

2. **Use parallel structure**
   - Maintain consistent formatting within sections
   - Use similar phrasing for similar concepts
   - Create recognizable patterns

3. **Employ strategic repetition**
   - Restate key concepts in different contexts
   - Create connections between sections
   - Reinforce critical information

4. **Create clear learning progression**
   - Order concepts from fundamental to advanced
   - Build knowledge systematically
   - Connect related ideas across sections

5. **Structure for accessibility**
   - Use short, clear sentences (especially important for adaptive display)
   - Break complex ideas into digestible chunks
   - Create visual breaks with headings and spacing
   - Use lists instead of dense paragraphs where possible

✅ FINAL CHECKLIST

Before finalizing your output, ensure:

- ✅ Includes all key terms, comparisons, and theories from the PDF
- ✅ Math content (if present) is properly formatted using LaTeX with `$` for inline and `$$` for block equations
- ✅ All section headers follow the specified Markdown hierarchy (`#`, `##`, `###`, `####`)
- ✅ Practical examples and theorist names are clearly presented
- ✅ Exam tips, common errors, and questions are included
- ✅ Output is complete, visually organized, and fully reflects the uploaded PDF
- ✅ Contains everything from the uploaded document
- ✅ No formulas included if none were found in the source material
- ✅ Content structure works well with adaptive display features (clear hierarchy, spacing, lists)
- ✅ Technical terms are defined when first introduced
- ✅ Content is broken into digestible, scannable sections
- ✅ Images are included using proper Markdown syntax with descriptive alt text
- ✅ Visual elements from the PDF are either embedded as images or described in detail

🎯 ADAPTIVE DISPLAY COMPATIBILITY

Your content will be automatically enhanced by the adaptive display system:

- **For ADHD users**: Content will have increased spacing, visual breaks, and color-coded headings
- **For Dyslexic users**: Font size and spacing will be increased, italics converted to bold
- **For Autistic users**: Clear structure and consistent formatting will be emphasized
- **For AUDHD users**: Combined optimizations will be applied

Structure your content to maximize the effectiveness of these automatic enhancements by:
- Using clear, consistent heading hierarchies
- Creating visual breaks with spacing and horizontal rules
- Breaking content into lists and short paragraphs
- Using bold strategically for emphasis
- Maintaining consistent formatting patterns

---

**Remember**: Your goal is to create a comprehensive, exam-ready study guide that captures ALL essential information from the PDF while being structured for optimal readability across different learning styles and neurodivergent needs.

