# parent-teacher-platform

## Deploy the frontend to Vercel

Create a Vercel project with `frontend` as the root directory and set:

```text
NEXT_PUBLIC_API_URL=https://your-backend.example.com
```

The backend must allow the Vercel origin in its CORS configuration. The current Docker Compose setup remains the local full-stack deployment; Vercel runs the Next.js frontend only.

