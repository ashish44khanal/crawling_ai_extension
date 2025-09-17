# AI Web Crawler Chrome Extension

A **full-stack monorepo** featuring a **Chrome extension** and a **backend API** to crawl websites and extract information using an **AI-powered RAG (Retrieval-Augmented Generation) approach**.


---

## 🔗 Documentation Hub

- **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)** – High-level diagrams and component interactions.  
- **[Setup & Development Guide](docs/SETUP_GUIDE.md)** – Step-by-step instructions to run the applications locally.  
- **[RAG Pipeline](docs/RAG_PIPELINE.md)** – Detailed explanation of AI-powered Retrieval-Augmented Generation workflow.  

---

## 🏗 Applications Overview

### 1. Chrome Extension
- **Stack:** React + Vite + TypeScript + Tailwind CSS  
- Acts as the **user interface** for crawling websites.  
- Collects website content and sends it to the backend API.  

### 2. Backend API
- **Stack:** NestJS + PostgreSQL + pgvector  
- Stores crawled website data and manages **vector embeddings**.  
- Implements **RAG-based AI pipeline** to extract structured insights.  

---

## ⚡ Key Features

- Automatic website crawling and data extraction.  
- Structured storage of crawled data using **PostgreSQL + pgvector**.  
- Semantic search and AI-powered content summarization using RAG.  
- Fully modular **Turborepo monorepo** setup for scalable development.  
- Extensible and maintainable architecture for future AI enhancements.  

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20  
- pnpm >= 8  
- PostgreSQL running locally or via Docker

### Installation
```bash
git clone <repo-url>
cd turbo-monorepo
pnpm install
