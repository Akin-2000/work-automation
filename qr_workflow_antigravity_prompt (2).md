# Antigravity Prompt --- QR Based Internal Automation Web App

## Role

You are a **Senior Software Architect + Staff Frontend Engineer**.\
Your task is to design and implement a **production‑grade React web
application** that automates internal employee workflows using **QR code
based dynamic forms**.

The system must be **fully responsive, highly accessible, modular,
configurable via JSON, and built only with open‑source technologies**.

The implementation must strictly follow **best practices for
scalability, maintainability, accessibility, and UI consistency**.

Do NOT skip any requirement described below.

------------------------------------------------------------------------

# 1. Core Objective

Build an **internal company web application** that allows:

• Employees to **scan QR codes and fill dynamic forms**\
• Admins to **configure the form structure and behavior**\
• The system to **record submissions and show analytics on a
dashboard**\
• Each form configuration to be **exportable as an independent
JavaScript script**

The entire system must work initially using **mock JSON data**.

------------------------------------------------------------------------

# 2. Technology Requirements

Use only **modern open‑source technologies**.

## Frontend

React\
Vite\
TypeScript

## UI / Styling

Tailwind CSS\
Radix UI (for accessibility primitives)\
Lucide Icons

## State Management

Zustand

## Forms

React Hook Form\
Zod for validation

## QR Code

html5-qrcode for scanning\
qrcode.react for generating QR

## Data Grid

TanStack Table

## Charts

Recharts

## Excel Export

SheetJS (xlsx)

## Accessibility

axe-core

------------------------------------------------------------------------

# 3. Application Layout

The application must contain:

### Login Page

After login the app must show a **main layout with:**

Sidebar\
Main Content Area\
Top Profile Section

### Layout Structure

    -----------------------------------
    Sidebar (Collapsible)
    -----------------------------------
    | Dashboard                      |
    | QR Scanner                     |
    | QR Scan Configuration (Admin)  |
    | BookMyShow Details             |
    -----------------------------------

    -----------------------------------
    Main Content
    -----------------------------------
    Top Bar
    User Profile
    Page Content
    -----------------------------------

Requirements:

• Sidebar must be collapsible\
• Fully keyboard accessible\
• Mobile responsive (drawer on mobile)\
• Dark and Light theme support

------------------------------------------------------------------------

# 4. Authentication (Mock)

Use a **mock JSON file for users**.

Example:

    users.json

    [
     {
      "id":1,
      "name":"Admin",
      "email":"admin@company.com",
      "password":"123",
      "role":"admin"
     },
     {
      "id":2,
      "name":"Employee",
      "email":"user@company.com",
      "password":"123",
      "role":"user"
     }
    ]

Requirements:

• Login validation\
• Role based access\
• Admin vs User permissions

Admin permissions:

• Configure QR forms\
• Edit form configuration

User permissions:

• Scan QR\
• Submit forms

------------------------------------------------------------------------

# 5. Dashboard

The dashboard must show:

## KPI Cards

Examples:

Total QR Scans\
Total Submissions\
Total Cancelled\
Total Pending

## Data Grid

Columns:

User Name\
Form Name\
Submission Status\
Submission Date\
Device\
Location

Features:

Sorting\
Filtering\
Pagination

## Export

Users must be able to:

Download the dashboard table as **Excel (.xlsx)**.

------------------------------------------------------------------------

# 6. QR Scanner Page

Employees open:

    /scan

Features:

• Camera QR scanning\
• Real time detection\
• QR code contains form identifier

Example QR content:

    https://companyapp.com/form?id=entry_gate

Flow:

Employee scans QR\
↓\
App reads formId\
↓\
Loads configuration from JSON\
↓\
Renders the dynamic form

------------------------------------------------------------------------

# 7. QR Form Configuration (Admin)

This is the **core feature of the system**.

Route:

    /qr-config

Only accessible to **Admin users**.

Admin can configure:

Form name\
Fields\
Validation rules\
Input types\
Submit behavior\
Cancel behavior\
Reset behavior\
Success pages\
Error pages

------------------------------------------------------------------------

# 8. Form Configuration JSON

Example configuration:

    forms.json

    {
     "formId":"entry_gate",
     "title":"Entry Gate Form",
     "fields":[
       {
        "id":"name",
        "label":"Full Name",
        "type":"text",
        "required":true,
        "regex":"^[A-Za-z ]+$"
       },
       {
        "id":"mobile",
        "label":"Mobile Number",
        "type":"tel",
        "required":true,
        "regex":"^[0-9]{10}$"
       },
       {
        "id":"department",
        "label":"Department",
        "type":"select",
        "options":["HR","IT","Finance"]
       }
     ],
     "actions":{
       "submitRedirect":"/success",
       "cancelRedirect":"/cancelled"
     }
    }

Supported input types:

text\
number\
email\
tel\
date\
textarea\
checkbox\
radio\
select

------------------------------------------------------------------------

# 9. Form Renderer

When a QR code is scanned:

The application must **dynamically render the form based on JSON
configuration**.

Requirements:

• Generate fields dynamically\
• Apply regex validation\
• Apply required validation\
• Display proper error messages\
• Submit data to submission store

------------------------------------------------------------------------

# 10. Submission Tracking

Store submission data in:

    submissions.json

Example:

    {
     "formId":"entry_gate",
     "user":"employee1",
     "status":"submitted",
     "timestamp":"2026-03-08T10:15:00",
     "data":{
       "name":"John",
       "mobile":"9876543210"
     }
    }

Statuses:

submitted\
cancelled\
reset

All submissions must appear on the **Dashboard table**.

------------------------------------------------------------------------

# 11. Form Preview

Inside the **QR Config Page**, admin must be able to:

Click **Preview**

This should render the form **exactly as the end user would see it**.

------------------------------------------------------------------------

# 12. Form Script Export

Every configured form must support:

Download as **independent JavaScript script**.

Example:

    entry-form.js

The generated script must:

Contain the form configuration\
Render the form dynamically\
Submit data via API endpoint placeholder

Usage example:

    <script src="entry-form.js"></script>

This allows the form to be embedded in other websites.

------------------------------------------------------------------------

# 13. QR Code Generation

Admins must be able to:

Generate QR codes for each form.

Example:

QR → entry_gate form

Use:

qrcode.react

------------------------------------------------------------------------

# 14. BookMyShow Page

Create a page called:

    /bookmyshow

Purpose:

Display **booking details or integrations**.

For now:

Use mock data.

Include:

Booking logs\
Ticket details\
User details

------------------------------------------------------------------------

# 15. UI Design Requirements

The UI must be:

• Professional\
• Clean\
• Consistent across pages

Features:

Light theme\
Dark theme\
Consistent spacing\
Design tokens

Responsive breakpoints:

Mobile\
Tablet\
Laptop\
Desktop

------------------------------------------------------------------------

# 16. Accessibility Requirements

The application must meet accessibility best practices.

Requirements:

Keyboard navigation\
ARIA labels\
Focus indicators\
Screen reader compatibility\
Color contrast compliance

Use:

axe-core for testing.

------------------------------------------------------------------------

# 17. Folder Structure

The project must follow this scalable architecture:

    src

    app
      router
      providers
      store

    components
      layout
      ui
      charts

    features
      auth
      dashboard
      qr-scanner
      qr-config
      qr-form-renderer
      bookmyshow

    mock-data
      users.json
      forms.json
      submissions.json

    hooks
    utils
    types

------------------------------------------------------------------------

# 18. Required Features Checklist

The final system MUST include:

Login system

Role based access

Collapsible sidebar

Dashboard

QR scanner

Dynamic form rendering

Admin form configuration

Regex validation

Form preview

Submission tracking

Data grid

Excel export

QR code generation

Downloadable form script

Responsive UI

Dark/light theme

Accessibility support

Mock JSON data storage

------------------------------------------------------------------------

# 19. Development Phases

Phase 1\
Project setup

Phase 2\
Layout + routing

Phase 3\
Login system

Phase 4\
Dashboard

Phase 5\
QR scanner

Phase 6\
Dynamic form renderer

Phase 7\
Admin form builder

Phase 8\
Submission tracking

Phase 9\
Script export

------------------------------------------------------------------------

# 20. Final Flow

Admin creates form configuration\
↓\
System generates QR code\
↓\
Employee scans QR\
↓\
Form opens dynamically\
↓\
Employee submits or cancels\
↓\
Submission recorded\
↓\
Dashboard analytics updated

------------------------------------------------------------------------

# End of Prompt
