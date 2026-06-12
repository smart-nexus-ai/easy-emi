# Easy EMI Manager 📱💳

An offline-first, premium web application built to generate instant EMI payment schedule slips for retail electronics and mobile shops. Fully client-side, responsive, and crafted with high-fidelity aesthetics.

---

## Key Features 🚀

*   **Offline Slip Engine**: Generates complete EMI finance grids, terms templates, and print-ready receipts 100% locally. Works without an internet connection using Service Workers.
*   **Aesthetic UI**: High-end styling with vibrant glow animations, glassmorphic headers, and cohesive dark/light theme options.
*   **Flexible Finance Providers Management**: Add, update, or remove custom finance partners (e.g. Bajaj Finserv, TVS Finance, HDFC) and define their rates and printing layout overrides.
*   **Backup & Restore**:
    *   Export configurations as local JSON files for archiving.
    *   Restore settings by fully replacing or merging configurations (with custom interactive conflict resolution UI for matching names).
*   **Print Optimization**: Styled specifically to print neat, professional physical invoice receipts.

---

## Tech Stack 🛠️

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Styling**: Vanilla CSS & [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State Management**: Zustand
*   **Deployments**: Vercel

---

## Getting Started ⚙️

### Prerequisites
*   Node.js (v18.x or later)
*   npm

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/smart-nexus-ai/easy-emi.git
    cd easy-emi
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development mode**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

4.  **Production Build**:
    ```bash
    npm run build
    npm run start
    ```

---

## Documentation 📖

Detailed design specs and architectures are outlined in the local notes:
*   [Progress Notes](.docs/PROGRESS.md)
*   [Technical Architecture Details](.docs/TECH.md)
*   [Database & Storage Logic](.docs/STORAGE.md)

---

## License 📄

This project is licensed under the MIT License.
