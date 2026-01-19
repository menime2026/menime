# 🛍️ Meni-me - Next-Gen Fashion E-Commerce

![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)

**Meni-me** is a cutting-edge, full-stack e-commerce platform designed for modern fashion brands. Built with the latest web technologies, it features a fully dynamic, admin-controlled storefront, immersive video shopping experiences, and a robust backend for managing products, orders, and customers.

---

## ✨ Key Features

### 🎨 Dynamic Storefront Experience
*   **⚡ Dynamic Homepage Engine**: Fully customizable homepage managed directly from the Admin panel.
    *   **Hero Carousel**: Full-screen, high-impact visual sliders.
    *   **Shop by Category**: Visual category navigation.
    *   **🔥 Trending Now**: Highlight hot products.
    *   **🎥 The Edit (Video Shopping)**: Immersive video banners with "Shop the Look" product integration.
    *   **✨ Curated For You**: Personalized selections separate from standard arrivals.
    *   **📰 Editorial / Modern Minimalism**: Story-driven content blocks.
*   **🛍️ Advanced Product Browsing**: Filter by size, color, price, and collection.
*   **🛒 Seamless Cart & Checkout**: Optimized flow for higher conversion.

### 🛠️ Powerful Admin Dashboard
*   **🎨 CMS-like Homepage Builder**: Drag-and-drop reordering, toggle visibility, and edit content for all homepage sections.
*   **📹 Video Management**: Upload and manage video assets for "The Look" sections directly via ImageKit integration.
*   **📦 Product Management**: Create, edit, and organize products with variants and inventory tracking.
*   **📊 Analytics & Reporting**: Insights into sales, orders, and customer growth.
*   **🚚 Order Fulfillment**: Manage order status, generate PDF invoices, and track shipments.

### 🔐 Security & Performance
*   **Authentication**: Secure user sessions via **Better Auth**.
*   **Database**: High-performance **PostgreSQL** with **Prisma ORM**.
*   **Media**: Optimized image and video delivery via **ImageKit**.
*   **Styling**: Ultra-fast styling with **Tailwind CSS v4**.

---

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Components** | [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Auth** | [Better Auth](https://www.better-auth.com/) |
| **State Mgmt** | [TanStack Query](https://tanstack.com/query/latest) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Uploads** | [ImageKit](https://imagekit.io/) |

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sanjeev0303/menime.git
cd Meni-me-main
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/menime?schema=public"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your_secret_key"
BETTER_AUTH_URL="http://localhost:3000"

# ImageKit (Media)
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"

# Admin
ADMIN_EMAIL="admin@example.com"
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push Schema to DB
npx prisma db push

# (Optional) Seed Database
npx prisma db seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the dashboard.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication routes (Sign In/Up)
│   ├── (public)/        # Storefront routes (Home, Products, Cart)
│   ├── (protected)/     # User account routes (Profile, Orders)
│   ├── admin/           # Admin dashboard routes
│   └── api/             # API endpoints
├── components/
│   ├── ui/              # Reusable UI components (Shadcn)
│   ├── storefront/      # Storefront-specific components
│   └── admin/           # Admin-specific components
├── lib/
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Auth configuration
│   └── utils.ts         # Helper functions
├── config/              # App constants & configuration
└── prisma/
    └── schema.prisma    # Database schema
```

---

## 📸 Screenshots

### Dynamic Homepage
*(Add screenshots of your new homepage here)*

### Admin Dashboard - Homepage Builder
*(Add screenshots of the element form here)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
