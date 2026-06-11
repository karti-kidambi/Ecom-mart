# EcomMart | Full-Stack Indian E-Commerce Application

EcomMart is a premium, fully responsive, and highly interactive e-commerce application. It showcases best practices in modern web design, utilizing a sleek color palette, typography from Google Fonts (Outfit), smooth transitions, glassmorphic containers, and hover-triggered micro-animations.

---

## 🚀 Key Features

*   **Free Browsing/Viewing**: Guests can browse the catalog, view detailed product specs, and apply categories/search filters. Login or registration is prompted only upon trying to add to cart or purchase.
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

## 🔒 Test Accounts (Sandbox Credentials)

Use these credentials to test the different roles in action:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ecommart.com` | `password123` | View and search products, add items to cart, enter delivery address, pay via Razorpay Mockup, view order history. |
| **Admin** | `admin@ecommart.com` | `admin123` | View sales metrics, add new products, edit/update pricing and stock, delete inventory, update customer shipping status. |
