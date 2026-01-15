# Deployment Guide - Vercel + MongoDB Atlas

This guide walks you through deploying the Document Tracker application on Vercel with MongoDB Atlas.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) account
3. Git repository with your code pushed

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in
2. Click **"Build a Database"**
3. Choose the **FREE tier** (M0 Sandbox)
4. Select a cloud provider and region closest to your users
5. Name your cluster (e.g., `document-tracker-cluster`)
6. Click **"Create Cluster"**

### 1.2 Set Up Database Access

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and generate a secure password
5. **Save this password** - you'll need it for the connection string
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Configure Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Vercel serverless functions)
   - This sets the IP to `0.0.0.0/0`
4. Click **"Confirm"**

### 1.4 Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster-name.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add your database name before the `?`:
   ```
   mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/document-tracker?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Set the **Root Directory** to `backend`
5. Vercel should auto-detect it as a Node.js project

### 2.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable       | Value                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`  | `mongodb+srv://username:password@cluster.mongodb.net/document-tracker?retryWrites=true&w=majority` |
| `JWT_SECRET`   | `your-super-secret-jwt-key-min-32-chars`                                                           |
| `JWT_EXPIRE`   | `7d`                                                                                               |
| `NODE_ENV`     | `production`                                                                                       |
| `CORS_ORIGIN`  | `https://your-frontend-app.vercel.app` (add after frontend deploy)                                 |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` (add after frontend deploy)                                 |

### 2.3 Deploy

1. Click **"Deploy"**
2. Wait for the deployment to complete
3. Note down your backend URL (e.g., `https://your-backend-app.vercel.app`)
4. Test the health endpoint: `https://your-backend-app.vercel.app/api/health`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create a New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the same Git repository
4. Set the **Root Directory** to `frontend`

### 3.2 Configure Environment Variables

| Variable            | Value                                 |
| ------------------- | ------------------------------------- |
| `REACT_APP_API_URL` | `https://your-backend-app.vercel.app` |

### 3.3 Build Settings

Vercel should auto-detect Create React App settings:

- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for the deployment to complete
3. Your frontend is now live!

---

## Step 4: Update Backend CORS

After deploying the frontend:

1. Go to your **backend project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `CORS_ORIGIN` and `FRONTEND_URL` with your frontend URL
4. **Redeploy** the backend for changes to take effect

---

## Step 5: Verify Deployment

1. Visit your frontend URL
2. Try to register a new account
3. Log in and test document upload
4. Verify all features work correctly

---

## Troubleshooting

### CORS Errors

- Ensure `CORS_ORIGIN` and `FRONTEND_URL` are set correctly in backend
- Redeploy backend after adding environment variables

### MongoDB Connection Issues

- Verify the connection string is correct
- Ensure Network Access allows `0.0.0.0/0`
- Check that the database user has the correct permissions

### 500 Internal Server Errors

- Check Vercel Function Logs in the dashboard
- Verify all environment variables are set
- Ensure `MONGODB_URI` is a valid connection string

### Build Failures

- Check the build logs in Vercel
- Ensure all dependencies are in `package.json`
- Try building locally first: `npm run build`

---

## Environment Variables Summary

### Backend (Vercel)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```
REACT_APP_API_URL=https://your-backend.vercel.app
```

---

## Optional: Custom Domain

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS
4. Update `CORS_ORIGIN` in backend with the new domain

---

## Security Recommendations

1. Use strong, unique passwords for MongoDB users
2. Set a complex JWT_SECRET (32+ characters)
3. Regularly rotate your JWT_SECRET
4. Consider enabling MongoDB Atlas IP whitelisting for specific IPs if possible
5. Enable Vercel's security headers in production
