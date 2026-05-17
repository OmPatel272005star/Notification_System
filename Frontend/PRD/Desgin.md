# Modern Email Campaign Platform — Complete UI/UX Design Specification

# Project Vision

Build a modern, premium, clean, SaaS-style Email Campaign Management Platform inspired by the structure and workflows observed in the provided Commotion dashboard screenshots/videos, but redesigned completely with:

* Modern UI/UX
* Dark + Light mode
* Better visual hierarchy
* Simplified flows
* Email-only focus
* Smooth animations
* Responsive layout
* Clean dashboards
* Enterprise-grade feel
* Fast navigation
* Minimal clutter

The final product should feel like a combination of:

* Notion
* Resend
* Brevo
* Framer
* Linear
* Mailchimp
* Vercel dashboard

while still keeping the modular business workflow from the reference application.

---

# Technology + UI Stack Recommendation

## Frontend

* React.js
* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Framer Motion
* React Query / TanStack Query
* Zustand (global state)
* React Hook Form
* Zod validation

---

# Theme System

## Light Theme

### Backgrounds

* Main background: #F7F8FC
* Card background: #FFFFFF
* Sidebar background: #FFFFFF
* Border: #E4E7EC

### Primary Brand Color

* Purple Gradient:

  * #6D5EF5
  * #8B7CFF

### Text

* Primary: #111827
* Secondary: #6B7280
* Muted: #9CA3AF

---

## Dark Theme

### Backgrounds

* Main background: #0F1117
* Card background: #161B22
* Sidebar background: #111827
* Border: #2A2F3A

### Accent

* Purple Glow:

  * #8B7CFF
  * #6D5EF5

### Text

* Primary: #F9FAFB
* Secondary: #CBD5E1
* Muted: #94A3B8

---

# Global Layout Structure

## Layout Sections

### 1. Sidebar

Left fixed navigation bar.

### 2. Top Navbar

Top sticky navbar.

### 3. Main Content Area

Scrollable page content.

### 4. Floating Notifications

Top-right toast notifications.

### 5. Modal Layer

Centered modals with blur backdrop.

---

# Sidebar Design

## Sidebar Width

* Expanded: 260px
* Collapsed: 80px

## Sidebar Items

1. Home
2. Audience
3. Templates
4. Campaigns
5. Connections
6. Users
7. Settings

---

## Sidebar Style

### Active Item

* Purple gradient background
* White icon
* Soft glow shadow
* Rounded-xl

### Hover

* Slight background tint
* Smooth transition
* Icon scale animation

---

## Sidebar Footer

Bottom section:

* Theme Toggle
* Support
* Documentation
* Logout Button

---

# Navbar Design

## Left Section

* Breadcrumbs
* Page title
* Workspace selector

---

## Right Section

### Components

1. Global Search
2. Notification Bell
3. Dark/Light Toggle
4. Profile Dropdown

---

## Profile Dropdown Menu

### Menu Items

* My Profile
* Account Settings
* Preferences
* Billing
* Activity Logs
* Logout

---

# Login Page Design

# Layout

Split screen design.

## Left Section

Large branding section.

### Content

* Gradient background
* Animated blobs
* Product illustration
* Marketing text

### Headline

"Modern Email Campaign Platform"

### Subheadline

"Create, manage, and scale email campaigns beautifully."

---

## Right Section

Centered auth card.

### Card Style

* Rounded-3xl
* Soft shadow
* Glass effect
* 480px width

---

# Login Form Fields

1. Email
2. Password
3. Remember Me checkbox
4. Forgot Password link
5. Login button
6. Google Login
7. GitHub Login

---

# Login Button Design

* Purple gradient
* Hover lift animation
* Glow shadow
* Loading spinner

---

# Signup Page

## Fields

1. Full Name
2. Email
3. Password
4. Confirm Password
5. Company Name
6. Create Workspace

---

# Forgot Password Flow

## Step 1

Enter email.

## Step 2

OTP verification.

## Step 3

Reset password.

---

# Home Dashboard Page

# Goal

Provide complete overview.

---

# Layout Structure

## Top Stats Row

Cards:

1. Total Campaigns
2. Total Audience
3. Emails Sent
4. Open Rate
5. Click Rate
6. Active Templates

---

## Stats Card Design

* Large metric number
* Small trend graph
* Growth percentage
* Hover animation
* Gradient border

---

# Main Dashboard Sections

## 1. Campaign Performance Graph

Large chart.

### Metrics

* Opens
* Clicks
* Delivered
* Bounce

---

## 2. Recent Campaigns

Modern table.

Columns:

* Campaign Name
* Status
* Audience
* Sent Time
* Open Rate
* Actions

---

## 3. Quick Actions

Cards:

* Create Campaign
* Create Template
* Import Audience
* Connect Email Provider

---

## 4. Recent Activity Feed

Timeline style.

---

# Audience Page

# Purpose

Manage contacts/subscribers.

---

# Layout

## Top Toolbar

Contains:

* Search bar
* Filter button
* Import CSV
* Export CSV
* Add Audience button

---

# Audience Table Design

Columns:

1. Checkbox
2. Name
3. Email
4. Tags
5. Status
6. Created Date
7. Last Campaign
8. Actions

---

# Table Style

* Sticky header
* Zebra rows
* Row hover effect
* Rounded table container
* Smooth pagination

---

# Add Audience Modal

## Fields

1. Full Name
2. Email Address
3. Phone (optional)
4. Tags
5. Notes

Buttons:

* Save
* Cancel

---

# Audience Profile Drawer

Right-side sliding panel.

## Sections

### Basic Info

### Campaign History

### Email Activity

### Tags

### Notes

### Timeline

---

# Template Page

# Most Important Module

This should feel modern like:

* Canva
* BeeFree
* Stripo
* Framer

---

# Recommended Free Email Template Builders

## Option 1 — GrapesJS

Best option.

### GitHub

[https://github.com/GrapesJS/grapesjs](https://github.com/GrapesJS/grapesjs)

### Email Plugin

[https://github.com/GrapesJS/preset-newsletter](https://github.com/GrapesJS/preset-newsletter)

### Features

* Drag-drop editor
* Free
* HTML export
* Email-safe templates
* React integration
* Open source

RECOMMENDED.

---

## Option 2 — Unlayer

[https://github.com/unlayer/react-email-editor](https://github.com/unlayer/react-email-editor)

Very professional.

But some features paid.

---

## Option 3 — Easy Email Editor

[https://github.com/zalify/easy-email-editor](https://github.com/zalify/easy-email-editor)

Modern React email editor.

---

# Recommended Final Choice

Use:

## GrapesJS + Newsletter Plugin

because:

* Completely free
* Highly customizable
* Large community
* Easy React integration
* Fast implementation

---

# Template Gallery Page

Inspired from screenshots but redesigned.

---

# Layout

## Top Toolbar

Contains:

* Search
* Filters
* Sort dropdown
* Grid/List toggle
* Create Template button

---

# Template Cards

Each template card contains:

* Template thumbnail
* Template name
* Last updated
* Category tag
* Status badge
* Preview button
* Edit button
* Duplicate button
* Delete button

---

# Template Card Style

* Glass morphism
* Rounded-2xl
* Smooth hover scale
* Shadow glow
* Image preview

---

# Template Categories

1. Welcome
2. Newsletter
3. Product Launch
4. Promotion
5. Transactional
6. Announcement

---

# Template Builder Page

# Layout

Three-panel layout.

## Left Sidebar

Blocks/components.

### Blocks

* Text
* Image
* Button
* Divider
* Spacer
* Columns
* Social Icons
* Header
* Footer

---

## Center Canvas

Live template editor.

---

## Right Panel

Properties/settings.

### Settings

* Font
* Padding
* Margin
* Colors
* Alignment
* Border radius
* Background

---

# Top Toolbar

Contains:

* Save Draft
* Preview
* Desktop/Mobile Toggle
* Export HTML
* Publish

---

# Preview Modal

Tabs:

* Desktop
* Mobile
* HTML

---

# Campaign Page

# Goal

Create and manage email campaigns.

---

# Campaign List Page

## Toolbar

* Search
* Filters
* Status dropdown
* Date range
* Create Campaign button

---

# Campaign Table

Columns:

1. Campaign Name
2. Audience Count
3. Template Used
4. Status
5. Sent Time
6. Open Rate
7. Click Rate
8. Actions

---

# Status Types

* Draft
* Scheduled
* Sending
* Completed
* Failed

---

# Create Campaign Flow

# Step 1

Campaign Details.

Fields:

* Campaign Name
* Subject Line
* Preview Text
* Sender Name
* Sender Email

---

# Step 2

Select Audience.

Options:

* Audience groups
* Tags
* CSV import

---

# Step 3

Select Template.

Grid preview selector.

---

# Step 4

Schedule.

Options:

* Send Now
* Schedule Later
* Timezone selector

---

# Step 5

Review + Send.

Shows:

* Audience count
* Spam score
* Preview
* Estimated delivery

---

# Campaign Analytics Page

## Graphs

1. Open Rate
2. Click Rate
3. Bounce Rate
4. Device Breakdown
5. Geographic Map

---

# Connections Page

# Purpose

Connect email sending providers.

---

# Supported Providers

1. Resend
2. SendGrid
3. Mailgun
4. AWS SES
5. SMTP

---

# Connection Cards

Each card contains:

* Provider logo
* Status
* API health
* Connected email
* Last sync
* Actions

---

# Add Connection Modal

## Fields

### SMTP

* Host
* Port
* Username
* Password
* Encryption type

### API Providers

* API Key
* Domain
* Sender email

---

# Connection Health Indicators

* Green = Healthy
* Yellow = Warning
* Red = Failed

---

# Users Page

# Purpose

Team collaboration.

---

# Users Table

Columns:

1. Avatar
2. Name
3. Email
4. Role
5. Status
6. Last Active
7. Actions

---

# Roles

1. Owner
2. Admin
3. Editor
4. Viewer

---

# Add User Modal

Fields:

* Full Name
* Email
* Role
* Permissions

---

# Permissions System

### Audience

* Read
* Write
* Delete

### Templates

* Read
* Write
* Publish

### Campaigns

* Read
* Send
* Delete

---

# Settings Page

# Sections

1. Workspace Settings
2. Branding
3. Notification Preferences
4. Security
5. API Keys
6. Billing
7. Theme Preferences

---

# Workspace Settings

Fields:

* Workspace name
* Logo upload
* Timezone
* Default sender

---

# Branding Settings

Fields:

* Primary color
* Secondary color
* Logo
* Email footer branding

---

# Notification Settings

Options:

* Campaign completion
* Failed emails
* User invites
* Security alerts

---

# Profile Page

# Sections

## Personal Information

* Name
* Email
* Phone
* Profile photo

---

## Security

* Change password
* Two-factor authentication
* Active sessions

---

# Search System

Global search should search:

* Campaigns
* Templates
* Users
* Audience

---

# Empty States

Every page must have beautiful empty states.

Examples:

* No campaigns yet
* No templates found
* No audience imported

Use:

* illustrations
* CTA buttons
* helpful onboarding text

---

# Loading States

Use:

* Skeleton loaders
* Shimmer effects
* Progress indicators

Never use boring spinner-only loaders.

---

# Notification System

Toast notifications.

Types:

* Success
* Error
* Warning
* Info

---

# Modal Design

## Style

* Rounded-3xl
* Backdrop blur
* Smooth animation
* Keyboard accessible

---

# Animation System

Use Framer Motion.

## Animations

* Fade in
* Slide up
* Card hover
* Sidebar expand
* Modal transitions
* Table row hover

---

# Mobile Responsive Design

# Sidebar

Becomes bottom navigation.

---

# Tables

Convert into cards.

---

# Navbar

Hamburger menu.

---

# Accessibility

* Keyboard navigation
* Proper contrast
* ARIA labels
* Screen reader support

---

# Recommended Backend Structure

# Modules

1. Auth Service
2. Audience Service
3. Template Service
4. Campaign Service
5. Email Provider Service
6. Analytics Service
7. User Service

---

# Database Collections

## users

## audiences

## campaigns

## templates

## email_connections

## analytics

## activity_logs

---

# Recommended Modern UI Components

## Cards

Rounded-xl.

## Buttons

Gradient primary buttons.

## Inputs

Floating labels.

## Tables

Modern data grid.

## Charts

Recharts.

## Icons

Lucide React.

---

# Dashboard Experience Goal

The user should feel:

* premium experience
* minimal clutter
* smooth workflow
* beautiful interactions
* enterprise trust
* modern SaaS quality

---

# Final UX Philosophy

## Important Rule

DO NOT overload screen with too many controls like old enterprise dashboards.

Instead:

* progressive disclosure
* clean spacing
* modern typography
* minimal forms
* contextual actions
* floating action buttons
* smart defaults

---

# Final Recommended Design Direction

Style combination:

* Vercel simplicity
* Linear smoothness
* Notion spacing
* Framer animations
* Mailchimp workflows
* Resend elegance

---

# Final Suggested Development Phases

# Phase 1

* Auth
* Dashboard
* Sidebar/Navbar
* Audience CRUD

---

# Phase 2

* Template Gallery
* GrapesJS Integration
* Template CRUD

---

# Phase 3

* Campaign builder
* Email provider integration
* Scheduling

---

# Phase 4

* Analytics
* Team management
* Notifications

---

# Phase 5

* Performance optimization
* Dark mode polish
* Animations
* Mobile responsiveness

---

# Final Recommendation

Keep the first version SIMPLE.

Do not recreate the entire enterprise platform.

Focus on:

1. Beautiful UI
2. Smooth workflow
3. Email-only simplicity
4. Fast template creation
5. Excellent UX
6. Clean analytics
7. Modern dashboard experience

That alone will already look significantly more modern and better than the reference website shown in the screenshots/videos.
