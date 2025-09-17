# Project Setup Guide

This document provides step-by-step instructions to set up the Turbo Monorepo project, including both backend (NestJS) and frontend (React Chrome Extension).

***

## **Prerequisites**

Before starting, make sure you have the following installed:

* **Node.js** >= 20
* **pnpm** >= 8
* **Docker**
* **OPEN AI API KEY**

***

## **Installation**

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd turbo-monorepo
    pnpm install
    ```

2.  **Start services with Docker Compose**:

    ```bash
    docker compose up
    ```

***

## **Running the Project**

### **Backend (NestJS)**

Navigate to the `apps/server` directory to run the backend.

1.  **Run migrations** (for the first time):

    ```bash
    cd apps/server
    pnpm run migration:run:dev
    ```

2.  **Set up environment variables for the backend:**

    ```bash
    create a .env.development file and add values to each fields referenced from .env.example file
    ```


3.  **Start the development server**:

    ```bash
    pnpm run dev
    ```

### **Frontend (React Chrome Extension)**

Navigate to the `apps/extension` directory to run the React Vite project and load it as a Chrome extension.

1.  **Start the development server**:

    ```bash
    cd apps/extension
    pnpm run dev
    ```

2.  **Load the extension in Chrome**:

    -   Open Chrome and go to `chrome://extensions`.
    -   Enable **Developer mode** using the toggle in the top-right corner.
    -   Click the **Load unpacked** button.
    -   Select the `dist` directory inside your `apps/extension` folder after running `pnpm run build`.

The extension will now be available in your browser and will automatically update when you make changes to the source code.