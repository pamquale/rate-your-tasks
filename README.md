﻿# 📊 Team Performance Evaluation System

**Team Performance Evaluation System** is a tool for tracking completed tasks, analyzing team performance, and providing improvement recommendations.

## Demo:
https://github.com/user-attachments/assets/0375a199-cc49-4f4e-af33-87943991aa81

## 🚀 Project Setup

### 1️⃣ Configure Environment Files
1. Copy and update the data in `.env-tmp` and `.env.docker-tmp` files according to your settings.
2. Rename the files:
   - `.env-tmp` → **`.env`**
   - `.env.docker-tmp` → **`.env.docker`**

### 2️⃣ Start Docker Containers
1. Open a terminal and stop any running containers (if applicable):
   ```bash
   docker-compose down
   ```
2. Start the project:
   ```bash
   docker-compose up --build
   ```

### 3️⃣ Configure Admin Panel
1. Open [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin) and log in with the root user and password.
2. Update site settings:
   - Navigate to the **Sites** table.
   - Change `example.com` domain to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.
   - Save changes.
3. Add Google authentication:
   - Navigate to the **Social applications** table.
   - Add a new record with the following fields:
     - **Provider**: Google
     - **Name**: Google
     - **Client ID**: Use `client_id` from `client_secret.json`
     - **Secret Key**: Use `client_secret` from `client_secret.json`
4. Move the site to chosen sites:
   - Transfer **[http://127.0.0.1:8000](http://127.0.0.1:8000)** from **"Available Sites"** to **"Chosen Sites"**.
   - Save changes.

✅ **Done! The project is now set up and ready to use.**
