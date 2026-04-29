# Route Inventory

## Frontend Routes

All frontend routes are defined in `src/App.tsx` and should use constants from `src/lib/routes.ts`.

### Public Routes
| Route | Component | Description | Example URLs |
|-------|-----------|-------------|--------------|
| `/` | Landing | Landing page with app overview | `https://app.com/` |
| `/auth` | Auth | Authentication (sign in/sign up) | `https://app.com/auth` |

### Protected Routes (Require Authentication)
| Route | Component | Description | Example URLs |
|-------|-----------|-------------|--------------|
| `/dashboard` | Dashboard | Main dashboard with overview statistics | `https://app.com/dashboard` |
| `/inventory` | Inventory | View all artworks in inventory | `https://app.com/inventory` |
| `/inventory/add` | AddArtwork | Add new artwork form | `https://app.com/inventory/add` |
| `/inventory/:id` | ArtworkDetails | View/edit specific artwork details | `https://app.com/inventory/abc-123` |
| `/transactions` | Transactions | View sales transactions | `https://app.com/transactions` |
| `/consignments` | Consignments | Manage consigned artworks | `https://app.com/consignments` |
| `/reports` | Reports | Generate and view reports | `https://app.com/reports` |

### Payment Routes
| Route | Component | Description | Example URLs |
|-------|-----------|-------------|--------------|
| `/success` | Success | Payment success confirmation | `https://app.com/success?sessionId=cs_123` |
| `/cancel` | Cancel | Payment cancellation page | `https://app.com/cancel` |

### Error Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `*` (catch-all) | NotFound | 404 page for unmatched routes |

## Dynamic Routes

### Parameters
- `:id` - Artwork UUID (used in `/inventory/:id`)

### Query Parameters
- `sessionId` - Stripe session ID (used in `/success?sessionId=...`)

## Route Guards

Currently, the application does not implement route guards. **TODO**: Add authentication guards to protected routes to redirect unauthenticated users to `/auth`.

## API Endpoints

See [API_REFERENCE.md](./API_REFERENCE.md) for backend API routes.

## Healthcheck

- **Endpoint**: `/healthcheck` (Edge Function)
- **Purpose**: Monitor service availability
- **Response**: JSON with status, timestamp, service name
