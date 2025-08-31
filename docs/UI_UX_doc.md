# UI/UX Documentation - AI Mentions Platform

## Design System Specifications

### **Color Palette**
- **Primary Colors**: Blue (#3B82F6) for primary actions and branding
- **Secondary Colors**: Gray (#6B7280) for secondary text and borders
- **Success Colors**: Green (#10B981) for positive actions and success states
- **Warning Colors**: Yellow (#F59E0B) for warnings and alerts
- **Error Colors**: Red (#EF4444) for errors and destructive actions
- **Neutral Colors**: White (#FFFFFF), Black (#000000), and various gray shades

### **Typography**
- **Font Family**: Inter (system font stack with fallbacks)
- **Heading Sizes**:
  - H1: 3rem (48px) - Main page titles
  - H2: 2.25rem (36px) - Section headers
  - H3: 1.875rem (30px) - Subsection headers
  - H4: 1.5rem (24px) - Card titles
  - H5: 1.25rem (20px) - Component titles
  - H6: 1.125rem (18px) - Small headers
- **Body Text**: 1rem (16px) base size
- **Small Text**: 0.875rem (14px) for captions and metadata

### **Spacing System**
- **Base Unit**: 0.25rem (4px)
- **Spacing Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
- **Common Spacing**:
  - `space-y-6`: 1.5rem (24px) between sections
  - `p-4`: 1rem (16px) padding
  - `gap-2`: 0.5rem (8px) between elements
  - `m-2`: 0.5rem (8px) margin

## UI Component Guidelines

### **Button Components**
```typescript
// Primary Button
<Button className="bg-blue-500 hover:bg-blue-600 text-white">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline">
  Secondary Action
</Button>

// Destructive Button
<Button variant="destructive">
  Delete
</Button>

// Loading State
<Button disabled={isLoading}>
  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
</Button>
```

### **Card Components**
```typescript
// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>

// Interactive Card
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  {/* Card content */}
</Card>
```

### **Form Components**
```typescript
// Input Field
<div className="space-y-2">
  <Label htmlFor="fieldName">Field Label</Label>
  <Input
    id="fieldName"
    placeholder="Enter value..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>

// Form Validation
<div className="space-y-4">
  <Input
    className={errors.fieldName ? "border-red-500" : ""}
    {...register("fieldName", { required: "This field is required" })}
  />
  {errors.fieldName && (
    <p className="text-sm text-red-500">{errors.fieldName.message}</p>
  )}
</div>
```

### **Data Display Components**
```typescript
// Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.field1}</TableCell>
        <TableCell>{item.field2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Badge
<Badge variant="outline">Status</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
```

## User Experience Flow Diagrams

### **Authentication Flow**
```
1. User arrives at app
   ↓
2. Clicks "Sign In" or "Get Started"
   ↓
3. Authentication modal appears
   ↓
4. User chooses OAuth provider or email/password
   ↓
5. Authentication process
   ↓
6. Redirect to dashboard or intended page
   ↓
7. Session established
```

### **Mention Tracking Flow**
```
1. User navigates to Mention Tracking
   ↓
2. Views existing brands/projects
   ↓
3. Adds new brand with keywords
   ↓
4. Configures tracking parameters
   ↓
5. Initiates scan (manual or automated)
   ↓
6. Views real-time progress
   ↓
7. Reviews results and position rankings
   ↓
8. Analyzes data sources and URLs
   ↓
9. Takes action based on insights
```

### **Keyword Research Flow**
```
1. User navigates to Keyword Research
   ↓
2. Enters keyword or topic
   ↓
3. Views search volume and trends
   ↓
4. Explores related keywords
   ↓
5. Analyzes AI query topics
   ↓
6. Reviews strategic recommendations
   ↓
7. Saves insights or exports data
```

## Responsive Design Requirements

### **Breakpoint System**
- **Mobile**: 0px - 640px (sm)
- **Tablet**: 641px - 1024px (md)
- **Desktop**: 1025px - 1280px (lg)
- **Large Desktop**: 1281px+ (xl)

### **Mobile-First Approach**
```typescript
// Responsive classes
<div className="
  p-4                    // Mobile: 1rem padding
  md:p-6                 // Tablet+: 1.5rem padding
  lg:p-8                 // Desktop+: 2rem padding
">
  <div className="
    grid grid-cols-1     // Mobile: Single column
    md:grid-cols-2       // Tablet+: Two columns
    lg:grid-cols-3       // Desktop+: Three columns
    gap-4                // Consistent gap
  ">
    {/* Content */}
  </div>
</div>
```

### **Touch-Friendly Design**
- **Minimum touch target**: 44px × 44px
- **Button spacing**: Adequate spacing between interactive elements
- **Swipe gestures**: Support for mobile navigation patterns

## Accessibility Standards

### **WCAG 2.1 AA Compliance**
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus management**: Clear focus indicators and logical tab order

### **Semantic HTML Structure**
```typescript
// Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Header</h2>
<h3>Subsection Header</h3>

// Semantic landmarks
<main>Main content area</main>
<nav>Navigation menu</nav>
<aside>Sidebar content</aside>
<footer>Page footer</footer>
```

### **ARIA Labels and Descriptions**
```typescript
// Button with aria-label
<Button aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>

// Form with aria-describedby
<Input
  aria-describedby="email-help"
  placeholder="Enter email"
/>
<p id="email-help">We'll never share your email</p>
```

## Style Guide and Branding

### **Visual Identity**
- **Modern and Professional**: Clean, minimalist design aesthetic
- **AI-Focused**: Technology-forward visual language
- **Trustworthy**: Professional color scheme and typography
- **Accessible**: High contrast and readable fonts

### **Iconography**
- **Lucide React**: Consistent icon library
- **Icon Sizes**: 16px, 20px, 24px, 32px, 48px
- **Icon Colors**: Inherit text color or specific semantic colors
- **Icon Usage**: Descriptive and meaningful icon choices

### **Animation and Transitions**
```typescript
// Smooth transitions
<div className="transition-all duration-200 ease-in-out">
  {/* Content with transitions */}
</div>

// Loading animations
<Loader2 className="w-4 h-4 animate-spin" />

// Hover effects
<Button className="hover:scale-105 transition-transform">
  Hover Effect
</Button>
```

## Component Library Organization

### **Base Components (shadcn/ui)**
- **Layout**: Container, Grid, Stack, Divider
- **Navigation**: Menu, Tabs, Breadcrumb, Pagination
- **Forms**: Input, Select, Checkbox, Radio, Textarea
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Data Display**: Table, Card, Badge, Avatar

### **Custom Feature Components**
- **AI Tools**: Keyword research, mention tracking, competitive analysis
- **Dashboard**: Overview cards, charts, activity feeds
- **Authentication**: Login modal, user management
- **Analytics**: Data visualization, reporting tools

### **Component Composition Pattern**
```typescript
// Compound component pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Content */}
    </div>
  </CardContent>
</Card>
```

## User Journey Maps

### **New User Onboarding**
```
1. Landing Page
   ↓
2. Sign Up (OAuth or email)
   ↓
3. Welcome Tour
   ↓
4. First Project Setup
   ↓
5. Tool Introduction
   ↓
6. First Results
   ↓
7. Subscription Consideration
```

### **Power User Workflow**
```
1. Dashboard Overview
   ↓
2. Project Management
   ↓
3. Advanced Tool Usage
   ↓
4. Data Analysis
   ↓
5. Report Generation
   ↓
6. Team Collaboration
   ↓
7. Performance Optimization
```

### **Return User Experience**
```
1. Quick Access to Recent Projects
   ↓
2. Status Overview
   ↓
3. Action Items
   ↓
4. Tool Navigation
   ↓
5. Data Updates
   ↓
6. Performance Review
```

## Wireframe References

### **Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo, Navigation, User Menu                    │
├─────────────────────────────────────────────────────────┤
│ Sidebar: Tools, Projects, Settings                     │
├─────────────────────────────────────────────────────────┤
│ Main Content: Overview Cards, Recent Activity          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Stats Card  │ │ Stats Card  │ │ Stats Card  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Recent Activity Feed                                │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Mention Tracking Interface**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Title, Scan All Button, Add Brand Button       │
├─────────────────────────────────────────────────────────┤
│ Tabs: Position Tracking | Data Sources                 │
├─────────────────────────────────────────────────────────┤
│ Brand Cards with Keywords                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Brand Name [Active]                                 │
│ │ Keywords: 5 tracked • 12 scans in 24h              │
│ │ [Run Scan] [Stop]                                   │
│ │                                                     │
│ │ Keyword Table with Positions                        │
│ │ ┌─────────┬─────────┬─────────┬─────────┬─────────┐ │ │
│ │ │Keyword  │Topic    │Avg Pos  │ChatGPT  │Perplexity│ │ │
│ │ └─────────┴─────────┴─────────┴─────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Design Tool Integration

### **Figma/Design System**
- **Component Library**: Shared component definitions
- **Design Tokens**: Colors, typography, spacing
- **Icon Library**: Consistent icon usage
- **Prototype Flows**: User journey prototypes

### **Design Handoff Process**
- **Component Specifications**: Detailed component documentation
- **Responsive Guidelines**: Breakpoint specifications
- **Accessibility Requirements**: WCAG compliance notes
- **Animation Specifications**: Transition and animation details

### **Developer Handoff**
- **Design Tokens**: CSS variables and Tailwind classes
- **Component API**: Props and usage examples
- **Responsive Behavior**: Mobile-first implementation
- **Accessibility Notes**: ARIA requirements and testing

## Performance and Optimization

### **Loading States**
```typescript
// Skeleton loading
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />

// Progress indicators
<Progress value={progress} className="w-full" />
<span className="text-sm text-muted-foreground">{progress}%</span>
```

### **Error States**
```typescript
// Error boundaries
<div className="text-center py-8">
  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
  <p className="text-muted-foreground mb-4">{error.message}</p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

### **Empty States**
```typescript
// No data states
<div className="text-center py-8 text-muted-foreground">
  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
  <p>No data available</p>
  <p className="text-sm">Get started by adding your first item</p>
</div>
```

## Future Design Considerations

### **Dark Mode Support**
- **Theme switching**: Light/dark mode toggle
- **Color adaptation**: Appropriate color schemes for each theme
- **User preference**: Remember user's theme choice

### **Advanced Interactions**
- **Drag and drop**: Reordering and organization
- **Keyboard shortcuts**: Power user productivity features
- **Gesture support**: Touch and mouse interactions

### **Accessibility Enhancements**
- **High contrast mode**: Enhanced visibility options
- **Font scaling**: Adjustable text sizes
- **Reduced motion**: Respect user motion preferences
