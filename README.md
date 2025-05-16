# 💰 DebtWatch – AI-Powered Personal Finance Risk Advisor

DebtWatch is a smart, mobile-first web application that helps users monitor their financial health, calculate debt risk, and manage money smarter with the help of AI.

## 🚀 Features

-   🧑‍💼 **User Profile:** Track income, dependents, and occupation.
-   💸 **Transaction Management:** Log income and expenses with categorization.
-   🏠 **Asset Tracking:** Monitor assets like houses, land, vehicles, gold, and custom assets.
-   📄 **Debt Management:** Keep track of installments, interest rates, and debt payoff progress.
-   🧠 **AI Risk Scoring:** Utilizes Google Gemini to analyze your financial risk.
-   📊 **Dynamic Dashboard:** Displays a comprehensive financial summary and actionable risk insights.

## ⚙️ Technology Stack

### Frontend

-   React + Vite
-   TailwindCSS
-   React Router


### Backend

-   FastAPI
-   Google Firestore (NoSQL DB)
-   Google Generative AI (Gemini)

## 🧠 How Risk Scoring Works (Powered by AI)

1.  **Data Collection:** The backend gathers essential financial data:
    * Income
    * Expenses
    * Active Debts
    * Number of Dependents
2.  **AI Analysis:** This data is then passed to an AI model (Google Gemini) with a prompt to analyze the user's financial risk level.
3.  **Risk Output:** The AI returns a risk label:
    * Low
    * Medium
    * High
    It also provides a concise 1–2 sentence explanation for the assessed risk level.
4.  **Storage and Display:** The risk assessment result (label and explanation) is saved to Firestore and prominently displayed on the user's dashboard.

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/debtwatch.git](https://github.com/your-username/debtwatch.git)
cd debtwatch
```

### 2. Run the Backend (Python + FastAPI)
```bash
Copy
Edit
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Run the Frontend (React + Vite)
```bash
Copy
Edit
cd frontend
npm install
npm run dev
```
