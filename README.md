# EcomMart | Full-Stack Indian E-Commerce Application

EcomMart is a premium, fully responsive, and highly interactive e-commerce application. It showcases best practices in modern web design, utilizing a sleek color palette, typography from Google Fonts (Outfit), smooth transitions, glassmorphic containers, and hover-triggered micro-animations.

---

## 🚀 Key Features

*   **Free Browsing/Viewing**: Guests can browse the catalog, view detailed product specs, and apply categories/search filters. Login or registration is prompted only upon trying to add to cart or purchase.
*   **Indian Mock Data**: Pre-seeded database with high-quality Indian products spanning Furniture (Sheesham Wood Table, Sofa, Office Chair), Tech/Electronics (boAt Earbuds, Noise Smartwatch, Redmi Phone), Decor (Ceramic Vase, Bedsheets), and Appliances (Kent Purifier, Prestige Cooktop).
*   **Sandbox Credentials Panel**: Displays test credentials on-screen for login and checkout. Login forms include **Autofill Buttons** for immediate, frictionless testing.
*   **Dummy Razorpay Gateway**: Custom-designed mockup interface modeled directly after Razorpay's overlay payment gateway with Card simulation, test inputs, and sandbox success/failure triggers.
*   **Customer Dashboard**: Profile settings and detailed transaction/purchase history tables.
*   **Admin Dashboard**: Store analytics/KPI cards (sales, order volume, low stock warning), a product management CRUD console (add, update, delete products), and customer order tracking with status updates (Placed, Confirmed, Shipped, Delivered).

---

## 🛠️ Tech Stack & Architecture

*   **Backend**: Spring Boot 3.x (Java 21, Spring Data JPA, Spring Security, Spring Web)
*   **Frontend**: React JS (Vite, HSL CSS variables, Lucide Icons)
*   **Database**: 
    *   **Local (H2)**: Auto-seeds on launch in-memory with zero local database configuration required (H2 Console enabled).
    *   **Production (MySQL)**: Standard dialect configuration configured for AWS RDS deployment.

---

## 💻 Running the App Locally

### 1. Launch Spring Boot Backend
No database installation needed! The backend automatically falls back to H2 in-memory DB and seeds mock data:
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using Maven Wrapper:
   *   **Windows**:
       ```cmd
       mvnw.cmd spring-boot:run
       ```
   *   **Mac/Linux**:
       ```bash
       ./mvnw spring-boot:run
       ```
3. The server starts on `http://localhost:8080`.
4. To inspect database records visually, visit: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:ecommartdb`, Username: `sa`, Password: empty).

### 2. Launch React Frontend
1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Start the local dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## ☁️ AWS Full-Stack Deployment Guide

Here is a clean, hassle-free path to host EcomMart live.

```
                  ┌──────────────────────┐
                  │     AWS Amplify      │
                  │   (React Frontend)   │
                  └──────────┬───────────┘
                             │ (REST calls)
                             ▼
                  ┌──────────────────────┐
                  │ AWS Elastic Beanstalk│
                  │ (Spring Boot Backend)│
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │       AWS RDS        │
                  │   (MySQL Database)   │
                  └──────────────────────┘
```

### Phase 1: Deploy Database (AWS RDS MySQL)
1. Sign in to the AWS Management Console and open the **Amazon RDS** console.
2. Click **Create database** and select **Standard create** > **MySQL**.
3. Choose the **Free Tier** template (highly cost-effective for portfolio projects).
4. Configure DB Settings:
   *   **DB Instance Identifier**: `ecommart-db`
   *   **Master Username**: `ecommart_admin`
   *   **Master Password**: Select a secure password.
5. Under **Connectivity**:
   *   Ensure **Public access** is set to **Yes** (or configure security groups to allow access from Elastic Beanstalk).
   *   Create a new VPC Security Group (e.g., `ecommart-db-sg`) allowing inbound traffic on port `3306`.
6. Click **Create Database**. Once active, copy the **Endpoint URL** (e.g. `ecommart-db.c123456789.us-east-1.rds.amazonaws.com`).

### Phase 2: Deploy Backend (AWS Elastic Beanstalk)
Elastic Beanstalk handles the EC2 provisioning, Java environment configuration, and SSL provisioning automatically.
1. Open the backend project and compile the deployable `.jar` file:
   ```bash
   cd backend
   ./mvnw clean package
   ```
   This generates `backend-0.0.1-SNAPSHOT.jar` inside the `backend/target/` folder.
2. Go to the **AWS Elastic Beanstalk** console and click **Create Application**.
3. Fill details:
   *   **Application Name**: `ecommart-backend`
   *   **Platform**: `Managed platform` > **Java** (select Corretto 21 or equivalent Java 21).
   *   **Application code**: Select **Upload your code** and choose the compiled `.jar` file from `backend/target/`.
4. Click **Configure more options** or **Next** to set Environment Properties:
   *   Go to **Configuration** > **Updates, monitoring, and logging** > **Environment properties** and add these variables to connect MySQL:
       *   `SPRING_PROFILES_ACTIVE` = `prod`
       *   `RDS_HOSTNAME` = *(Your RDS Endpoint URL)*
       *   `RDS_PORT` = `3306`
       *   `RDS_DB_NAME` = `ecommart` (You can create this schema or let hibernate create it automatically)
       *   `RDS_USERNAME` = `ecommart_admin`
       *   `RDS_PASSWORD` = *(Your RDS Master Password)*
5. Launch the environment. Once ready, copy the green **Elastic Beanstalk Environment URL** (e.g., `http://ecommart-backend.eba-abcde.us-east-1.elasticbeanstalk.com`).

### Phase 3: Deploy Frontend (AWS Amplify Hosting)
1. Go to the **AWS Amplify** console and click **New App** > **Host web app**.
2. If the code is on GitHub, authorize GitHub and select the `ecommart` repository. Alternatively, choose **Deploy without Git** and drag-and-drop the compiled `dist/` directory (created by running `npm run build` inside the `frontend/` folder).
3. Set the Environment Variables under **Build settings** or in **Environment Variables**:
   *   Add variable: `VITE_API_URL` = `http://(Your Elastic Beanstalk Environment URL)/api`
4. Click **Save and Deploy**. AWS Amplify will automatically provision a secure global CDN, build the React bundle, and provide a live `amplifyapp.com` link.

---

## 🔒 Test Accounts (Sandbox Credentials)

Use these credentials to test the different roles in action:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ecommart.com` | `password123` | View and search products, add items to cart, enter delivery address, pay via Razorpay Mockup, view order history. |
| **Admin** | `admin@ecommart.com` | `admin123` | View sales metrics, add new products, edit/update pricing and stock, delete inventory, update customer shipping status. |
