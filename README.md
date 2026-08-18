# Insight Hub

AI WORKPLACE PRODUCTIVITY ASSISTANT

1. ROLE

You are a senior full-stack software engineer, AI architect, UX/UI designer, and product developer.

Your task is to design and build a complete web application called:

AI Workplace Productivity Assistant

The application must combine three AI-powered workplace tools into one integrated platform:

Smart Email Generator

Meeting Notes Summarizer

AI Research Assistant

The three tools must share the same user account, dashboard, AI services, database, workspace, and document system.

2. OBJECTIVE

Build a professional AI productivity platform that helps employees, managers, entrepreneurs, students, researchers, and business professionals automate common workplace tasks.

The application should allow users to:

Generate professional emails.

Rewrite and improve emails.

Change email tone and length.

Summarize meeting notes and transcripts.

Extract action items and decisions from meetings.

Identify deadlines and responsibilities.

Research business and workplace topics using AI.

Generate research summaries.

Ask follow-up questions about research.

Save generated content.

Edit generated content.

Copy and export results.

Transfer information between the three AI assistants.

The core objective is:

Create one intelligent workspace where workplace communication, meetings, and research are connected through AI.

3. CONTEXT

Professionals often use different applications for email writing, meeting notes, research, document creation, and task management.

This creates unnecessary switching between applications and causes information to become fragmented.

The AI Workplace Productivity Assistant solves this problem by integrating these functions into a single workspace.

Example workflow:

Meeting Notes
     ↓
AI Meeting Summarizer
     ↓
Summary + Decisions + Action Items
     ↓
Create Follow-Up Email
     ↓
Smart Email Generator
     ↓
Professional Email
     ↓
Research an Open Question
     ↓
AI Research Assistant
     ↓
Research Report


Information should be transferable between tools without requiring the user to manually copy and paste it.

4. CORE APPLICATION MODULES

The application must contain:

AI Workplace Productivity Assistant
│
├── Dashboard
│
├── Smart Email Generator
│
├── Meeting Notes Summarizer
│
├── AI Research Assistant
│
├── Integrated AI Workspace
│
├── Document History
│
├── User Profile
│
├── Authentication
│
└── Settings


5. REQUIREMENTS

5.1 Dashboard

Create a central dashboard displaying:

Welcome

Welcome back, [User Name]

What would you like to accomplish today?


Quick Actions

Three main cards:

Smart Email Generator

Generate professional workplace emails.

Button:

Create Email

Meeting Notes Summarizer

Convert meeting notes into summaries and action items.

Button:

Summarize Meeting

AI Research Assistant

Research topics and generate structured insights.

Button:

Start Research

Productivity Statistics

Display:

Emails Generated
Meetings Summarized
Research Reports
Time Saved


Recent Activity

Display recently created:

Emails

Meetings

Research reports

6. SMART EMAIL GENERATOR

Create a dedicated module:

/email

INPUT

The user should provide:

Email Purpose

Example:

Explain the purpose of the email.


Recipient

Optional.

Context

Provide background information.


Tone

Options:

Professional

Formal

Friendly

Casual

Persuasive

Apologetic

Executive

Length

Options:

Short

Medium

Detailed

Call to Action

Optional.

7. EMAIL AI PROCESSING

The AI should analyze the user's input and generate a professional email.

The output must include:

Subject
Greeting
Email Body
Closing


Example:

Subject: Project Meeting Follow-Up

Dear Team,

Thank you for attending today's meeting...

Kind regards,
[User Name]


Provide controls:

Copy
Edit
Save
Regenerate
Improve
Shorten
Expand
Change Tone


8. MEETING NOTES SUMMARIZER

Create:

/meetings

The user must be able to:

Paste meeting notes.

Paste a transcript.

Upload a supported document.

Supported formats:

TXT
PDF
DOCX


INPUT

Meeting Title
Date
Participants
Meeting Notes / Transcript


Button:

Summarize Meeting

9. MEETING AI PROCESSING

The AI must analyze the meeting content and generate:

Executive Summary

A concise summary of the meeting.

Key Discussion Points

Important topics discussed.

Decisions

Decisions made during the meeting.

Action Items

Extract tasks from the discussion.

Each action item should contain:

Task
Owner
Deadline
Status


Open Questions

Identify unresolved issues.

Next Steps

Recommend or extract the next actions.

10. MEETING → EMAIL INTEGRATION

The Meeting Notes Summarizer must include:

Create Follow-Up Email

When clicked, the application should automatically transfer:

Meeting Summary
Decisions
Action Items
Deadlines
Next Steps


into the Smart Email Generator.

The Email Generator should then create a professional follow-up email.

Example:

Meeting
   ↓
AI Summary
   ↓
Action Items
   ↓
Create Follow-Up Email
   ↓
Smart Email Generator
   ↓
Email


11. AI RESEARCH ASSISTANT

Create:

/research

The user should enter a research question.

INPUT

Example:

What would you like to research?


Example questions:

What are the benefits of remote work?

Compare agile and waterfall project management.

What are current AI trends in business?

How can companies improve employee productivity?


Allow the user to select:

Research Depth

Quick
Standard
Detailed


Output Format

Executive Summary
Research Brief
Business Report
Comparison
Strategic Analysis


12. RESEARCH AI PROCESSING

The Research Assistant should generate:

Research Summary

Short overview of the topic.

Key Findings

Important findings.

Detailed Analysis

Structured explanation.

Benefits

Relevant advantages.

Risks

Potential disadvantages or risks.

Recommendations

Practical recommendations.

Sources

Display sources used by the research system.

The system must not invent sources or citations.

If web access is available, use current and credible sources for time-sensitive research.

13. RESEARCH FOLLOW-UP ASSISTANT

After generating research, provide an AI chat interface.

Example:

Ask a follow-up question...

[Send]


The user could ask:

Explain finding number 3.

Give me three practical recommendations.

Turn this research into an email.

Create a presentation outline.


The AI must maintain context from the current research session.

14. RESEARCH → EMAIL INTEGRATION

Add a button:

Create Email From Research

The system should transfer relevant research information to the Smart Email Generator.

Example:

Research Report
      ↓
Select Findings
      ↓
Create Email
      ↓
AI Email Generator
      ↓
Professional Email


15. MEETING → RESEARCH INTEGRATION

The Meeting Notes Summarizer should identify unresolved questions.

For each open question, provide:

Research This

When clicked:

Meeting Question
      ↓
AI Research Assistant
      ↓
Research
      ↓
Research Report


This allows the user to continue working without leaving the application.

16. INTEGRATED AI WORKSPACE

Create a shared workspace:

/workspace

The workspace should contain:

All
Emails
Meetings
Research


Every saved AI result should appear here.

Each document should contain:

Title
Type
Created Date
Modified Date
Owner
Tags
Content


Actions:

Open
Edit
Copy
Rename
Save
Delete
Export
Share


17. INPUT SYSTEM

The application should support structured and unstructured inputs.

Text Input

Users can enter:

Email instructions

Meeting notes

Research questions

File Input

Users can upload:

PDF

DOCX

TXT

AI Input

Each AI tool should accept contextual information from other tools.

Example:

Meeting Summary
+
Research Report
+
User Instruction


can become the input for the Email Generator.

18. OUTPUT SYSTEM

All AI outputs must be editable.

The output interface should provide:

Generated Result

[Edit] [Copy] [Save] [Regenerate]


Additional contextual actions should be available.

Email Output

Subject
Body


Meeting Output

Summary
Discussion Points
Decisions
Action Items
Open Questions
Next Steps


Research Output

Summary
Key Findings
Analysis
Benefits
Risks
Recommendations
Sources


19. AUTHENTICATION

Implement secure authentication.

Registration

Fields:

Full Name
Email
Password
Confirm Password


Button:

Create Account

Login

Fields:

Email
Password


Options:

Remember Me
Forgot Password
Login


User Session

After authentication, users should access:

/dashboard
/email
/meetings
/research
/workspace
/settings


Unauthenticated users must not be able to access private application data.

20. USER PROFILE

Create a profile section containing:

Name
Email
Profile Picture
Job Title
Company
AI Preferences


Allow the user to configure:

Default email tone.

Default research depth.

Default response length.

Preferred language.

21. CONTRAINTS

The application must follow these constraints.

Security

Never expose AI API keys in frontend code.

Protect user data.

Validate all inputs.

Protect API endpoints.

Use secure authentication.

Prevent users from accessing another user's documents.

AI Reliability

The AI must:

Avoid fabricating facts.

Avoid inventing sources.

Clearly identify uncertainty.

Preserve the user's intended meaning.

Never create fake meeting decisions or deadlines.

Only identify owners and deadlines when supported by the source material.

Performance

Use asynchronous AI requests.

Display loading states.

Avoid blocking the entire interface during AI processing.

Cache appropriate data.

Paginate large histories.

UX

The application should be:

Simple

Fast

Responsive

Accessible

Professional

Easy to understand

22. TECHNICAL STACK

Use a modern full-stack architecture.

Frontend

Next.js
React
TypeScript
Tailwind CSS


Backend

Next.js API Routes / Server Actions


Database

PostgreSQL


Authentication

Use a secure authentication solution such as:

NextAuth/Auth.js


or an equivalent secure authentication system.

AI

Create a central AI service layer:

AIService
├── generateEmail()
├── improveEmail()
├── summarizeMeeting()
├── extractActionItems()
├── researchTopic()
├── answerResearchQuestion()
└── convertToEmail()


23. DATABASE STRUCTURE

Create the following core entities.

User

id
name
email
passwordHash
role
createdAt
updatedAt


Email

id
userId
subject
content
tone
purpose
createdAt
updatedAt


Meeting

id
userId
title
date
participants
transcript
summary
decisions
actionItems
openQuestions
nextSteps
createdAt
updatedAt


Research

id
userId
question
summary
findings
analysis
recommendations
sources
createdAt
updatedAt


WorkspaceDocument

id
userId
type
title
content
createdAt
updatedAt


24. APPLICATION NAVIGATION

Create a sidebar:

AI Workplace Productivity Assistant

Dashboard

✉ Smart Email
📝 Meeting Notes
🔎 AI Research

📁 Workspace

────────────────

Recent Documents

────────────────

Settings
Help
Logout


25. USER INTERFACE DESIGN

Use a professional SaaS design.

Design principles:

Clean white or dark interface options.

Modern typography.

Rounded cards.

Consistent spacing.

Clear hierarchy.

Professional icons.

Subtle animations.

Responsive layouts.

Avoid excessive visual effects.

The interface should feel suitable for a corporate environment.

26. LANDING PAGE

Create a public landing page.

Hero

AI Workplace Productivity Assistant

Subtitle:

Automate emails, summarize meetings, and research workplace topics with one intelligent AI workspace.

Buttons:

Get Started
Explore Features


Features

Smart Email Generator

Write better emails in seconds.

Meeting Notes Summarizer

Transform meetings into clear summaries and action items.

AI Research Assistant

Research topics and turn information into useful insights.

Integration Section

Show:

Email
  ↕
Meetings
  ↕
Research


Explain that information can move between all three assistants.

27. ERROR HANDLING

Create clear error messages.

Example:

Unable to generate your email.

Please check your input and try again.


Meeting error:

We couldn't analyze these meeting notes.

Please check the document and try again.


Research error:

We couldn't complete the research request.

Please try again.


28. LOADING STATES

When generating an email:

AI is writing your email...


When summarizing:

AI is analyzing your meeting...
Extracting decisions...
Finding action items...
Preparing summary...


When researching:

AI is researching your topic...
Analyzing information...
Preparing findings...
Creating your report...


29. FINAL INTEGRATED WORKFLOW

The complete application should support this workflow:

                USER
                  │
                  ▼
             DASHBOARD
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     EMAIL      MEETING    RESEARCH
       │          │          │
       │          ▼          │
       │      SUMMARY        │
       │          │          │
       │     ┌────┴────┐     │
       │     ▼         ▼     │
       │  ACTIONS    QUESTIONS
       │     │         │     │
       │     ▼         ▼     │
       └──► EMAIL    RESEARCH ◄──┘
              │         │
              └────┬────┘
                   ▼
              AI WORKSPACE
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        SAVE      EDIT     EXPORT


30. FINAL OUTPUT REQUIREMENT

The completed project must deliver a working web application, not merely a static interface.

The final application must include:

Public landing page.

Registration.

Login.

Authenticated dashboard.

Smart Email Generator.

Meeting Notes Summarizer.

AI Research Assistant.

Shared AI Workspace.

Persistent database.

AI API integration.

File upload capability.

Search and document history.

Editing and saving.

Copy/export functionality.

Cross-tool AI integration.

Responsive design.

Loading states.

Error handling.

Secure authentication.

User-specific data isolation.

The three primary AI assistants must behave as one connected productivity system.

The fundamental product architecture is:

INPUT → AI PROCESSING → OUTPUT → EDIT → SAVE → REUSE → NEXT AI TASK

Build the application so that a professional can start with an email, meeting, or research question and move between all three capabilities without leaving the platform.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://connect-brain.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dc1053bd-015c-4326-8d51-c572a9d813f2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
