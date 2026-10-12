# AIMST University Intelligent Online Exam Proctoring System
## Step-by-Step Vercel Deployment & Production Handbook

This handbook provides beginner-friendly, sequentially numbered instructions on how to take this project from your local computer, push it to GitHub, connect it to Vercel, configure MongoDB Atlas, and verify that the live system works end-to-end with webcam access.

---

## Prerequisites Checklist
Before starting, ensure you have:
1. A **GitHub account** ([github.com](https://github.com/))
2. A **Vercel account** ([vercel.com](https://vercel.com/))
3. A **MongoDB Atlas account** ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
4. **Git** installed on your local computer

---

## Phase 1: Database Choice (Zero-Database vs. MongoDB Atlas)

### Option A: Zero-Database In-Memory Mode (Recommended — 0 Database Setup Required)
If you **cannot or do not want to use MongoDB**, you don't need any external database at all!
The system includes an enterprise-grade in-memory database pre-seeded with:
- **Examiner Account**: `examiner@aimst.edu.my` (Password: `AimstExaminer2026!`)
- **Student Candidates**: `student@aimst.edu.my` (Password: `AimstStudent2026!`)
- **Pre-configured exams & questions** (MIS3014 Information Systems Security)
- **Real-time AI proctoring logging & instant grading**

To use this, simply configure `DISABLE_MONGODB=true` and `MONGODB_URI=memory` in your Vercel Environment Variables. You can skip MongoDB Atlas completely.

---

### Option B: Cloud MongoDB Atlas (Optional)
If you do wish to use MongoDB Atlas:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **Build a Database** and choose the **M0 Free** cluster tier.
3. Under **Security Quickstart**:
   - Create a database user and password.
   - Set IP Access List to **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Copy the connection string and insert `/aimst_proctor` before the `?` mark:
   ```text
   mongodb+srv://aimst_admin:YourSecretPass123@cluster0.abcde.mongodb.net/aimst_proctor?retryWrites=true&w=majority
   ```

---

## Phase 2: Push Project to GitHub

1. Open your terminal in the project directory (`aimst-proctor`).
2. Initialize Git if not already initialized:
   ```bash
   git init
   ```
3. Create a `.gitignore` file to ensure secrets and build artifacts are never pushed to GitHub:
   ```text
   node_modules/
   .next/
   .env.local
   .env*.local
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   .DS_Store
   ```
4. Stage and commit all files:
   ```bash
   git add .
   git commit -m "feat: AIMST Online Exam Proctoring System FYP initial release"
   ```
5. Go to [GitHub](https://github.com/new) and click **New Repository**.
   - Repository Name: `aimst-exam-proctor`
   - Visibility: **Public** or **Private** (Private is fine; Vercel can access private repos)
   - Do not check "Initialize with README".
   - Click **Create repository**.
6. Follow GitHub's instructions to push your existing repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/aimst-exam-proctor.git
   git push -u origin main
   ```

---

## Phase 3: Import Project into Vercel

1. Log in to [Vercel](https://vercel.com/).
2. On your Vercel Dashboard, click **Add New...** > **Project**.
3. Under **Import Git Repository**, find `aimst-exam-proctor` and click **Import**.
4. On the **Configure Project** screen:
   - **Project Name**: Keep default (`aimst-exam-proctor`) or customize it.
   - **Framework Preset**: Verify it says **Next.js**.
   - **Root Directory**: Leave as `./` (or select the subfolder if the repository has a nested structure).
   - **Build and Output Settings**: Leave all at defaults (Vercel automatically detects `npm run build` and `.next`).
   - **Node.js Version**: Standard Vercel default is 20.x or 22.x, both work seamlessly.

---

## Phase 4: Configure Environment Variables in Vercel

Before clicking "Deploy", expand the **Environment Variables** accordion section. Add the following environment variables:

### For Zero-Database In-Memory Mode (No MongoDB):
| Variable Name | Value to Enter | Environments to Select |
| :--- | :--- | :--- |
| `DISABLE_MONGODB` | `true` | Check: **Production**, **Preview**, **Development** |
| `MONGODB_URI` | `memory` | Check: **Production**, **Preview**, **Development** |
| `JWT_SECRET` | `aimst_jwt_access_prod_secret_2026_mis` | Check: **Production**, **Preview**, **Development** |
| `JWT_REFRESH_SECRET` | `aimst_jwt_refresh_prod_secret_2026_mis` | Check: **Production**, **Preview**, **Development** |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_token_placeholder` | Check: **Production**, **Preview**, **Development** |

*(If you chose Option B with MongoDB Atlas, set `MONGODB_URI` to your Atlas string and omit `DISABLE_MONGODB`).*

> [!NOTE]
> Ensure there are no leading or trailing whitespace characters in any variable value when pasting.

---

## Phase 5: (Optional) Connect Vercel Blob Storage for Photos

If you wish to store candidate webcam photos in a dedicated cloud storage bucket:
1. In the Vercel Dashboard, go to **Storage** tab in the top navigation bar.
2. Click **Create Database** > Select **Blob**.
3. Name it `aimst-proctor-blobs` and click **Create**.
4. In the Blob store page, click **Connect to Project** and choose `aimst-exam-proctor`.
5. Vercel will automatically inject `BLOB_READ_WRITE_TOKEN` into your project environment variables.

---

## Phase 6: Trigger Deployment & Access Live URL

1. Click the blue **Deploy** button on Vercel.
2. Vercel will display the live deployment terminal stream:
   - Cloning repository
   - Installing dependencies (`npm install`)
   - Executing Next.js production build (`next build`)
   - Generating static and serverless edge routes
3. When the build completes, fireworks appear with the message: **"Congratulations! What's next?"**
4. Click the preview card or the **Visit** button to open your live production site.
5. Your live URL will look like:
   ```text
   https://aimst-exam-proctor.vercel.app
   ```

---

## Phase 7: Live HTTPS Webcam Confirmation

Web browsers enforce a strict security requirement: **webcam access (`getUserMedia`) is blocked over unencrypted HTTP connections** (with the exception of `localhost`).

Because Vercel automatically issues an SSL certificate for your `.vercel.app` domain with HTTPS:
1. Open your live URL: `https://aimst-exam-proctor.vercel.app`.
2. Click **Sign In** or **Candidate Biometric Registration**.
3. When the browser prompts **"aimst-exam-proctor.vercel.app wants to use your camera"**, click **Allow**.
4. Verify the live video stream displays within the verification viewfinder with the green biometric scanning line.

---

## Phase 8: Troubleshooting & Common Fixes

### 1. Build Failed during `next build`
- **Where to look**: In Vercel, go to the **Deployments** tab, click the failed deployment, and inspect the red error lines under **Build Logs**.
- **Fix**: Run `npm run build` locally on your computer to see the exact TypeScript or lint error before pushing. Fix the issue, commit, and push to GitHub (`git push`). Vercel will auto-redeploy.

### 2. "Direct MongoDB connection warning" or Mongo timeout
- **Symptom**: User login hangs or shows "Internal server error".
- **Cause**: MongoDB Atlas IP whitelist does not allow Vercel's cloud servers.
- **Fix**: In MongoDB Atlas, go to **Network Access** > Click **Add IP Address** > Choose **Allow Access from Anywhere** (`0.0.0.0/0`) > Save. Wait 2 minutes for changes to propagate.

### 3. Modifying Environment Variables
- To change an environment variable after deployment:
  1. Go to **Settings** > **Environment Variables** in your Vercel project.
  2. Edit the variable and save.
  3. Go to **Deployments** tab > Click the `...` menu on the latest deployment > Click **Redeploy**. (Environment variables only take effect on new deployments).

---

## Phase 9: Viva Oral Defense Presentation Tips

When presenting to your examination panel:
1. Open the live Vercel URL on your laptop: `https://your-app.vercel.app`.
2. Open a second browser window in Incognito/Private mode.
3. Log in as **Dr. Ramesh Kumar** (Examiner) in the first window and as **Ahmad Faiz** (Student) in the second window.
4. Demonstrate creating an exam as the examiner, entering it as the student, testing the liveness check, intentionally switching tabs or exiting full-screen to demonstrate automatic violation capture, and finally showing the examiner's incident evidence review screen with the timestamped photos and PDF report download.
