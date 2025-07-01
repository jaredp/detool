# Computed Columns

This document explains the computed columns feature that has been added to the detool project.

## Overview

Computed columns are fields that are automatically calculated based on other field values in your model. They are read-only and update automatically whenever the underlying data changes.

## Features

- **Automatic Calculation**: Values are computed on-the-fly based on other field data
- **Real-time Updates**: When editing forms, computed fields update immediately as you change other fields
- **Database Optimized**: Computed fields are excluded from database storage and operations
- **Type Safe**: Full TypeScript support with proper type inference
- **Multiple Types**: Support for string, number, date, and boolean computed fields

## Usage

### Basic Computed Fields

```typescript
import { ComputedString, ComputedNumber, ComputedBoolean } from "../detool-api/field";

export const Person = Model("Person", {
  firstName: ShortText,
  lastName: ShortText,
  birthday: DateField,
  
  // Computed fields
  fullName: ComputedString(
    (instance) => `${instance.firstName || ""} ${instance.lastName || ""}`.trim()
  ),
  
  age: ComputedNumber(
    (instance) => {
      if (!instance.birthday) return 0;
      const today = new Date();
      const birthDate = new Date(instance.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  ),
});
```

### Available Computed Field Types

1. **ComputedString**: For text-based computed values
2. **ComputedNumber**: For numeric computed values  
3. **ComputedDate**: For date-based computed values
4. **ComputedBoolean**: For boolean computed values

### Advanced Options

Each computed field type accepts optional configuration:

```typescript
ComputedString(
  computeFunction,
  {
    sqlExpression?: string;           // SQL expression for database-level computation (future feature)
    displayFormat?: (val) => ReactNode; // Custom display formatting
  }
)
```

## Examples

### Post Model with Computed Fields

```typescript
export const Post = Model("Post", {
  title: ShortText,
  body: LongText,
  posted_at: DateField,
  is_published: Checkbox,

  // Word count
  wordCount: ComputedNumber(
    (instance) => {
      if (!instance.body) return 0;
      return instance.body.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
  ),

  // Publication status
  status: ComputedString(
    (instance) => instance.is_published ? "Published" : "Draft"
  ),

  // Check if post is recent (within 7 days)
  isRecent: ComputedBoolean(
    (instance) => {
      if (!instance.posted_at) return false;
      const postDate = new Date(instance.posted_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return postDate > weekAgo;
    }
  ),
});
```

## How It Works

### Database Layer
- Computed fields are automatically excluded from database schema creation
- Only regular fields are stored in the database
- Query results are enriched with computed field values after retrieval

### API Layer
- Create/Update operations extract only database fields for storage
- List/Get operations return full instances with computed fields populated
- Filtering and sorting only work on regular fields (not computed fields)

### UI Layer
- Computed fields are displayed as read-only in edit forms
- Values update automatically when dependencies change
- Custom display formatting can be applied

## Implementation Details

### Type System
- `DatabaseInstanceOf<T>`: Type for database records (excludes computed fields)
- `InstanceOf<T>`: Type for full instances (includes computed fields)
- `isComputedField()`: Type guard to check if a field is computed

### Database Operations
- `extractDatabaseFields()`: Removes computed fields from instances before storage
- `enrichWithComputedFields()`: Adds computed field values to database records

### Real-time Updates
- Edit forms automatically recompute all computed fields when any field changes
- Uses reactive updates to ensure computed values stay in sync

## Limitations

- Computed fields cannot be used in database queries (WHERE, ORDER BY)
- Values are computed client-side and server-side, not in the database
- Circular dependencies between computed fields are not detected

## Future Enhancements

- SQL expression support for database-level computation
- Dependency tracking for optimized recomputation
- Validation of computed field dependencies
- Support for async computed functions