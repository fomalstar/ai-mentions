2.Workflow File 
---
alwaysApply: true
---

# Development Agent Workflow - Cursor Rules

## Primary Directive
You are a development agent implementing a project. Follow established documentation and maintain consistency.

## Core Workflow Process

### Before Starting Any Task
- Consult `/Docs/Implementation.md` for current stage and available tasks
- Check task dependencies and prerequisites
- Verify scope understanding
- **CRITICAL:** Review `/Docs/Bug_tracking.md` for known issues and recent fixes

### Task Execution Protocol

#### 1. Task Assessment
- Read subtask from `/Docs/Implementation.md`
- Assess subtask complexity:
  - **Simple subtask:** Implement directly
  - **Complex subtask:** Create a todo list 

#### 2. Bug Prevention Check
- **MANDATORY:** Check `/Docs/Bug_tracking.md` before starting any task
- Look for similar issues that were previously resolved
- Follow established patterns for common problems
- Understand root causes to avoid regression

#### 3. Documentation Research
- Check `/Docs/Implementation.md` for relevant documentation links in the subtask
- Read and understand documentation before implementing

#### 4. UI/UX Implementation
- Consult `/Docs/UI_UX_doc.md` before implementing any UI/UX elements
- Follow design system specifications and responsive requirements

#### 5. Project Structure Compliance
- Check `/Docs/project_structure.md` before:
  - Running commands
  - Creating files/folders
  - Making structural changes
  - Adding dependencies

#### 6. Error Handling & Documentation
- **FIRST:** Check `/Docs/Bug_tracking.md` for similar issues before fixing
- **ALWAYS:** Document new errors and solutions in Bug_tracking.md
- Include error details, root cause, and resolution steps
- Update bug status when issues are resolved
- Add prevention strategies for future occurrences

#### 7. Task Completion
Mark tasks complete only when:
- All functionality implemented correctly
- Code follows project structure guidelines
- UI/UX matches specifications (if applicable)
- No errors or warnings remain
- All task list items completed (if applicable)
- **NEW:** Any bugs encountered have been documented in Bug_tracking.md

### File Reference Priority
1. `/Docs/Bug_tracking.md` - **ALWAYS CHECK FIRST** for known issues and patterns
2. `/Docs/Implementation.md` - Main task reference and current stage
3. `/Docs/project_structure.md` - Structure guidance and best practices
4. `/Docs/UI_UX_doc.md` - Design requirements and component specifications

## Critical Rules
- **NEVER** skip documentation consultation
- **NEVER** mark tasks complete without proper testing
- **NEVER** ignore project structure guidelines
- **NEVER** implement UI without checking UI_UX_doc.md
- **NEVER** fix errors without checking Bug_tracking.md first
- **NEVER** leave bugs undocumented
- **ALWAYS** document errors and solutions in Bug_tracking.md
- **ALWAYS** follow the established workflow process
- **ALWAYS** update bug status when resolved

## Bug Documentation Requirements

### When Encountering Any Issue:
1. **Check Bug_tracking.md first** - Is this a known issue?
2. **If known:** Follow established resolution pattern
3. **If new:** Document using the bug reporting template
4. **Include:** Error messages, root cause analysis, resolution steps
5. **Update:** Bug status when resolved (🔴 OPEN → 🟢 RESOLVED)

### Mandatory Bug Documentation Sections:
- **Description:** Clear explanation of the issue
- **Root Cause:** Technical analysis of why it happened  
- **Resolution:** Step-by-step fix implemented
- **Files Modified:** List of changed files with descriptions
- **Prevention:** How to avoid this issue in future

Remember: Build a cohesive, well-documented, and maintainable project. Every decision should support overall project goals and maintain consistency with established patterns. **Bug prevention through documentation is as important as feature development.**
