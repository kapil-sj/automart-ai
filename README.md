# AutoMart AI

AutoMart AI is a work-in-progress e-commerce and dropshipping platform built with Next.js and Supabase.

The goal is to build a platform that can automate parts of the dropshipping workflow, including product management, order processing, supplier selection, pricing, procurement, and eventually AI-assisted decisions around products and advertising.

The project is being developed incrementally, starting with the core e-commerce system before adding the automation and AI components.

## Current Status

The current version includes:

* User authentication
* Product catalog
* Product categories
* Shopping cart
* Checkout flow
* Supabase database
* Row Level Security (RLS)
* Order and order-item database structure
* Payment database structure
* Supplier and procurement database structure
* Inventory and shipment database structure
* Financial transaction tracking structure

The basic order creation flow is currently being implemented.

AI-based product discovery, supplier automation, procurement, advertising automation, and autonomous decision-making are planned for later stages.

## Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Supabase**
* **PostgreSQL**
* **Git / GitHub**

## Project Structure

```text
automart-ai/
├── app/                # Next.js application routes and pages
├── components/         # Reusable UI components
├── lib/                # Application logic and Supabase utilities
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
├── package.json
└── README.md
```

## Planned Development

The project is being developed in stages.

### Phase 1 — E-commerce Foundation

* Authentication
* Product catalog
* Categories
* Cart
* Checkout
* Orders
* Customer order history

### Phase 2 — Orders & Payments

* Order processing
* Payment integration
* Payment status tracking
* Refund handling
* Financial transaction tracking

### Phase 3 — Supplier & Fulfillment

* Supplier management
* Supplier offer comparison
* Landed-cost calculation
* Supplier selection
* Inventory tracking
* Procurement
* Shipment and tracking management

### Phase 4 — AI Commerce Engine

Planned AI capabilities include:

* Product discovery
* Demand analysis
* Competition analysis
* Price recommendations
* Supplier scoring
* Profit estimation
* Product testing decisions
* Product scaling and stopping decisions
* AI-generated product descriptions and marketing content

### Phase 5 — Advertising & Automation

The longer-term goal is to integrate advertising platforms and build systems that can help automate:

* Ad creation
* Audience testing
* Campaign analysis
* ROAS and CAC analysis
* Product performance monitoring
* Scaling and stopping decisions

## Database

Supabase is used as the backend database and authentication layer.

The database is designed around separate entities for products, orders, order items, payments, suppliers, supplier offers, procurement decisions, inventory, shipments, and financial transactions.

Row Level Security is enabled so customer-facing access is restricted to the appropriate data.

## Development

To run the project locally:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

Environment variables are required for Supabase connectivity. Secret keys should be kept in the local `.env.local` file and should never be committed to Git.

## Project Status

This project is actively being developed. Some database structures and features are already in place, while the supplier automation and AI components are still under development.
