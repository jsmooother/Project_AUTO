# Phase 1 — Auth & Session Test Guide

## Prerequisites

- Docker running (Postgres, Redis)
- `pnpm db:migrate` applied (includes 0019_auth_sessions)
- API on 3001, Web on 3000

## Browser Test

### 1. Sign up (new account with password)

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill: Email, Password (min 8 chars), Organization Name
4. Submit → should redirect to /dashboard
5. Session cookie is set; localStorage has customerId, userId, email

### 2. Log out

1. On dashboard, click "Log out"
2. Should redirect to /login
3. Session cookie cleared

### 3. Log in

1. Go to http://localhost:3000/login
2. Enter same email + password
3. Submit → redirect to /dashboard

### 4. Protected pages

1. Log in, then visit /inventory, /runs, /templates, /connect-website
2. All should work (customerId from session/localStorage)
3. Log out, try visiting /dashboard directly → should redirect to /login

### 5. Old signup (no password) — not supported

- Existing users created before migration 0019 have no password_hash
- They cannot log in via /auth/login
- They must sign up again (new email) or a "set password" flow would need to be added

## Curl Test

### Sign up

```bash
curl -v -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test Org","password":"password123"}' \
  -c cookies.txt
```

Expect 201, Set-Cookie header, and `customerId`, `userId`, `email` in body.

### Login

```bash
curl -v -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

Expect 200, Set-Cookie.

### Get current user

```bash
curl -v http://localhost:3001/auth/me -b cookies.txt
```

Expect 200, `{ "userId", "customerId", "email" }`.

### Logout

```bash
curl -v -X POST http://localhost:3001/auth/logout -b cookies.txt -c cookies.txt
```

Expect 200. Then `curl http://localhost:3001/auth/me -b cookies.txt` should return 401.
