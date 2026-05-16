// prisma/seed.ts — Seed database with demo data

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await hash('demo1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@peblo.ai' },
    update: {},
    create: {
      id: '507f1f77bcf86cd799439011',
      name: 'Demo User',
      email: 'demo@peblo.ai',
      passwordHash,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create demo tags
  const tagNames = ['productivity', 'ideas', 'learning', 'work', 'personal'];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // Create demo notes
  const notes = [
    {
      title: 'Getting started with Peblo Notes',
      content: `# Welcome to Peblo Notes 🎉

Peblo is your AI-powered collaborative workspace. Here's what you can do:

## Core Features

- **📝 Rich Markdown Editor** — Write notes using full Markdown syntax
- **🤖 AI Insights** — Generate summaries, action items, and title suggestions using Claude
- **🏷️ Smart Tags** — Organise notes with tags for easy filtering
- **🔗 Public Sharing** — Share notes via a public link
- **📊 Insights Dashboard** — Track your writing habits and productivity

## Getting Started

1. Create a new note using the **New Note** button in the sidebar
2. Write your note content using Markdown
3. Add tags by typing in the tag input and pressing Enter
4. Click **AI Insights** to generate a smart summary with Claude
5. Share your note publicly via the **Share** button

## Markdown Quick Reference

| Syntax | Result |
|--------|--------|
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`# Heading\` | Heading |
| \`- item\` | Bullet |
| \`- [ ] task\` | Todo |

Enjoy your workspace! ✨`,
      tagIds: [tags[0].id, tags[2].id],
    },
    {
      title: 'Product Roadmap Q3 2025',
      content: `# Product Roadmap Q3 2025

## Goals
The primary objective for Q3 is to hit 10,000 MAU and improve retention to 40%.

## Key Initiatives

### 1. AI-Powered Features (High Priority)
- Implement streaming AI responses for real-time UX
- Add AI-powered tag suggestions based on note content
- Build a "knowledge graph" view linking related notes

### 2. Collaboration (Medium Priority)
- Real-time collaborative editing via Operational Transformation
- Comment threads on notes
- Team workspaces with permission levels

### 3. Integrations (Medium Priority)
- Notion import/export
- Slack notifications for shared notes
- Calendar integration for deadline tracking

## Metrics to Track
- Daily Active Users (DAU)
- Notes created per user per week
- AI insights generation rate
- Share link click-through rate

## Timeline
- July: AI streaming + tag suggestions
- August: Real-time collaboration MVP
- September: Integrations + analytics refresh`,
      tagIds: [tags[3].id, tags[0].id],
    },
    {
      title: 'Book Notes: Atomic Habits',
      content: `# Atomic Habits — James Clear

## Core Concept
Small improvements compound over time. 1% better every day = 37x better over a year.

## The 4 Laws of Behaviour Change

### Law 1: Make It Obvious
- Design your environment so good habits are the obvious choice
- Use implementation intentions: "I will [behaviour] at [time] in [location]"
- Habit stacking: "After [current habit], I will [new habit]"

### Law 2: Make It Attractive
- Temptation bundling: pair habits you want to do with habits you need to do
- Join a culture where your desired behaviour is the normal behaviour

### Law 3: Make It Easy
- Reduce friction for good habits; increase friction for bad habits
- The Two-Minute Rule: scale down habits until they take 2 minutes or less
- Automate good decisions where possible

### Law 4: Make It Satisfying
- Use immediate rewards to reinforce the habit loop
- Habit tracking gives you visual evidence of progress
- Never miss twice — breaking the streak once is recoverable

## Key Quotes
> "You do not rise to the level of your goals. You fall to the level of your systems."

> "Every action is a vote for the type of person you wish to become."

## Action Items
- [ ] Set up habit tracker for daily writing
- [ ] Identify 3 habits to build this month using the 4 Laws
- [ ] Reduce friction: lay out workout clothes the night before`,
      tagIds: [tags[2].id, tags[4].id],
    },
    {
      title: 'Ideas dump — startup concepts',
      content: `# Startup Ideas 💡

Brainstorming session — no filtering, just capturing.

## Validated Pain Points
- **Meeting recorder + AI minutes** — people hate writing meeting notes
- **Code review mentor** — junior devs need async feedback
- **Personal finance for freelancers** — the existing apps are too complex

## Wild Ideas
- AI that summarises your entire email inbox into daily bullet points
- "Anti-social media" — a platform where posts auto-delete after 24 hours
- Sleep coaching app that uses phone motion data to improve sleep quality
- "Micro-SaaS marketplace" — buy and sell small productised services

## Currently Most Excited About
The meeting recorder angle feels most urgent. Every company has this problem.

**Validation questions:**
1. How much time do people spend on meeting notes currently?
2. What's the competitive landscape? (Otter.ai, Fireflies.ai)
3. What's the wedge — what can we do 10x better?

## Next Steps
- [ ] Interview 10 people about their meeting notes workflow
- [ ] Try Fireflies.ai and identify gaps
- [ ] Prototype a simple Zoom plugin`,
      tagIds: [tags[1].id, tags[3].id],
    },
  ];

  for (const noteData of notes) {
    const noteTagObjects = tags.filter(t => noteData.tagIds.includes(t.id));
    const note = await prisma.note.create({
      data: {
        title: noteData.title,
        content: noteData.content,
        userId: user.id,
        tags: { connect: noteTagObjects.map(t => ({ id: t.id })) },
      },
    });
    console.log('✅ Created note:', note.title);
  }

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@peblo.ai');
  console.log('  Password: demo1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
