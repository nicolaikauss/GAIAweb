# API Reference

## Overview

This application uses **Supabase** (via Lovable Cloud) as its backend. All database operations use the Supabase JavaScript client with Row Level Security (RLS) policies enforcing authentication and authorization.

## Base URL
- **Development**: `http://localhost:8080`
- **Production**: `https://[your-domain].lovable.app`
- **Supabase API**: `https://kolmcuyorzrbdteqeysi.supabase.co`

## Authentication

### Sign In
- **Method**: Supabase Auth (`supabase.auth.signInWithPassword`)
- **Endpoint**: Handled by Supabase Auth API
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: User session with JWT token
- **Error Codes**: 400 (Invalid credentials), 422 (Invalid email format)

### Sign Up
- **Method**: Supabase Auth (`supabase.auth.signUp`)
- **Endpoint**: Handled by Supabase Auth API
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "options": {
      "data": {
        "full_name": "John Doe"
      }
    }
  }
  ```
- **Response**: User session
- **Configuration**: Auto-confirm email enabled (no email verification required)

### Sign Out
- **Method**: `supabase.auth.signOut()`
- **Response**: Clears session

## Database Tables & Operations

All operations require authentication. RLS policies ensure users can only access their own data.

### Artworks (`artworks`)

#### List Artworks
```typescript
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Get Single Artwork
```typescript
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .eq('id', artworkId)
  .single();
```

#### Create Artwork
```typescript
const { data, error } = await supabase
  .from('artworks')
  .insert({
    title: "Artwork Title",
    artist: "Artist Name",
    year: 2024,
    medium: "Oil on Canvas",
    dimensions: "24x36",
    price: 5000,
    status: "available",
    user_id: userId, // Required for RLS
    // ... other fields
  })
  .select()
  .single();
```

#### Update Artwork
```typescript
const { data, error } = await supabase
  .from('artworks')
  .update({
    price: 6000,
    status: "sold",
    // ... other fields
  })
  .eq('id', artworkId)
  .select()
  .single();
```

#### Delete Artwork
```typescript
const { error } = await supabase
  .from('artworks')
  .delete()
  .eq('id', artworkId);
```

### Profiles (`profiles`)

#### Get User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Update Profile
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: "New Name",
    // ... other fields
  })
  .eq('id', userId);
```

## Edge Functions

### AI Assistant
- **Path**: `/ai-assistant`
- **Method**: POST
- **Purpose**: AI-powered artwork analysis and insights
- **Payload**:
  ```json
  {
    "message": "Analyze this artwork",
    "context": { /* artwork data */ }
  }
  ```
- **Response**: AI-generated analysis

### Analyze Artwork
- **Path**: `/analyze-artwork`
- **Method**: POST
- **Purpose**: Image analysis and metadata extraction
- **Payload**:
  ```json
  {
    "imageUrl": "https://...",
    "artworkData": { /* artwork metadata */ }
  }
  ```
- **Response**: Analyzed data and suggestions

### Healthcheck
- **Path**: `/healthcheck`
- **Method**: GET
- **Purpose**: Service health monitoring
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-10-11T12:00:00.000Z",
    "service": "gaia-capital-api",
    "uptime": 123456.78
  }
  ```
- **Status Codes**: 200 (healthy), 503 (unhealthy)

## Storage

### Artwork Images
- **Bucket**: `artwork-images`
- **Public**: Yes
- **Upload**:
  ```typescript
  const { data, error } = await supabase.storage
    .from('artwork-images')
    .upload(`${userId}/${filename}`, file);
  ```
- **Get URL**:
  ```typescript
  const { data } = supabase.storage
    .from('artwork-images')
    .getPublicUrl(filePath);
  ```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional context */ }
  }
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (authenticated but not authorized)
- **404**: Not Found
- **422**: Unprocessable Entity (invalid data)
- **500**: Internal Server Error
- **503**: Service Unavailable

## Rate Limiting

Supabase applies default rate limits:
- **Anonymous requests**: ~100 requests per hour
- **Authenticated requests**: Higher limits based on plan

## Data Validation

### Required Fields (Artwork)
- `title`: string (required)
- `artist`: string (required)
- `user_id`: uuid (required, auto-set from auth)

### Optional Fields
All other artwork fields are optional and nullable.

## Row Level Security Policies

### Artworks
- **SELECT**: Users can view only their own artworks
- **INSERT**: Users can create artworks (user_id must match auth.uid())
- **UPDATE**: Users can update only their own artworks
- **DELETE**: Users can delete only their own artworks

### Profiles
- **SELECT**: Users can view only their own profile
- **INSERT**: Handled by trigger on user creation
- **UPDATE**: Users can update only their own profile
- **DELETE**: Not allowed

## Testing Endpoints

Use the healthcheck endpoint to verify service availability:
```bash
curl https://kolmcuyorzrbdteqeysi.supabase.co/functions/v1/healthcheck
```
