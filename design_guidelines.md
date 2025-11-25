# Fairfield Stock Control System - Design Guidelines

## Design Approach
**System-Based Approach**: Enterprise SaaS with inspiration from Linear's clean interfaces and modern ERP systems. Focus on data clarity, efficient workflows, and professional polish suitable for warehouse/logistics operations.

## Core Design Principles
1. **Professional Efficiency**: Clean, uncluttered interfaces that prioritize data visibility and task completion
2. **Information Hierarchy**: Clear visual distinction between primary actions, data displays, and secondary controls
3. **Role-Based Clarity**: Visual indicators for permissions and access levels throughout the interface
4. **Trust & Reliability**: Consistent, predictable patterns that build confidence in critical operations

## Typography
- **Primary Font**: Inter or SF Pro Display (Google Fonts CDN)
- **Headings**: 
  - Page titles: 24px, semibold (600)
  - Section headers: 18px, semibold (600)
  - Card titles: 16px, medium (500)
- **Body Text**: 14px, regular (400)
- **Small Text**: 12px for metadata, badges, timestamps
- **Monospace**: JetBrains Mono for barcodes, SKUs, tracking numbers

## Layout System
**Spacing Units**: Tailwind scale using 2, 4, 6, 8 as primary rhythm
- Component padding: `p-6` for cards, `p-8` for modals
- Section spacing: `gap-6` between cards, `gap-4` within forms
- Table cells: `p-4` for comfortable scanning
- Sidebar: Fixed 280px width with `p-6` internal spacing

## Component Library

### Navigation & Structure
**Sidebar Navigation**:
- Dark background (#1F2937) with white text
- Logo area at top with company branding
- Navigation items with left border accent on active state
- Role indicator badge below user info
- Logout button at bottom with subtle separator

**Top Bar** (Optional for breadcrumbs/actions):
- White background, subtle bottom border
- Page title on left
- Primary action buttons on right
- Height: 64px with `px-8` horizontal padding

### Data Display Components

**Enhanced Tables**:
- Zebra striping removed - use hover states only
- Header row: Light gray background (#F3F4F6), medium weight text
- Cell padding: `py-4 px-4` for breathing room
- Action buttons: Icon buttons or small text buttons in rightmost column
- Status badges: Inline with proper spacing, not cramped

**Cards & Containers**:
- White background with subtle shadow (0 1px 3px rgba(0,0,0,0.1))
- Border radius: 8px
- Padding: `p-6` standard, `p-8` for modal content
- Header section within cards uses `pb-4 border-b` to separate from content

**Status Indicators**:
- Pill-shaped badges with colored backgrounds (not just borders)
- Padding: `px-3 py-1`, font-size 12px, medium weight
- Colors: Yellow/amber for pending, blue for transit, green for received
- Role badges follow same pattern with appropriate colors

### Forms & Input

**Form Layout**:
- Two-column grid for related fields (e.g., first/last name)
- Single column for primary inputs
- Spacing: `gap-6` between form groups
- Labels above inputs, 14px medium weight
- Input height: 40px minimum with `px-3 py-2`

**Buttons**:
- Primary: Red (#DC2626), white text, `px-6 py-2.5`
- Secondary: Dark gray (#374151), white text
- Success: Green (#047857) for confirmations
- All buttons: 6px border radius, medium weight (500), 14px text
- Icon buttons in tables: 32px square, centered icon

**Integration Settings Tab**:
- Configuration cards for each email service option
- Test email button with loading state
- Connection status indicator (connected/disconnected badge)
- API key input fields with show/hide toggle
- Save configuration button prominently placed

### Permission System UI

**Tab-Level Permissions**:
- Each navigation item checks user role before rendering
- Disabled state styling for inaccessible tabs (if shown)
- Permission matrix table in admin settings:
  - Rows: User roles (Admin, Dispatch, Receiver, View-Only)
  - Columns: Tab names (Dashboard, Products, Orders, etc.)
  - Checkboxes for enable/disable with instant visual feedback

**Role Badges**:
- Admin: Red background (#FEE2E2), dark red text
- Dispatch: Blue background (#DBEAFE), dark blue text  
- Receiver: Green background (#D1FAE5), dark green text
- View-Only: Gray background (#E5E7EB), dark gray text

### Modals & Overlays

**Modal Structure**:
- Max-width: 600px for forms, 800px for detailed views
- Header: `px-8 py-6`, title + close button
- Content: `px-8 py-6` with form or information
- Footer: `px-8 py-6 border-t`, actions right-aligned
- Overlay: 50% black opacity backdrop

**Email Notification Preview**:
- Shows sample email template when configuring
- Editable subject line and body sections
- Merge tags clearly indicated (e.g., {{orderNumber}})

## Specific Enhancements

**Dashboard Refinement**:
- Stat cards in 4-column grid: Total Products, Active Orders, Low Stock Items, Pending Receives
- Large numbers (32px) with labels below (14px gray text)
- Recent activity feed with timeline-style left border
- Quick action buttons prominently placed

**Order Fulfillment Flow**:
- Clear visual progression: Pending → In Transit → Received
- Shortage/damage entry fields only appear when "Mark as Received" is clicked
- Email notification confirmation toast after successful receive
- Summary card showing what will be emailed before sending

**Professional Polish Details**:
- Consistent 8px border radius across all elements
- No harsh borders - use subtle shadows and background colors for separation
- Hover states on all interactive elements
- Loading states for all async actions
- Empty states with helpful messages and action prompts
- Confirmation dialogs for destructive actions (delete, etc.)

## Images
No hero images required. This is an enterprise application focused on data management. Use icons from Heroicons for navigation and action buttons.