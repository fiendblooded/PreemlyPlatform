Codebase for Preemly Platform at platform.preemly.eu

# **Preemly**

![Frame 1160445212](https://github.com/user-attachments/assets/8290146c-8054-459e-8288-4ed23d2fa9ce)

Preemly is an AI-driven event management platform designed to **save event teams time**, streamline workflows, and deliver advanced tools for organizing events of all sizes.

---

## 🚀 **Features**

1. **AI Assistant – PreemBot**

   - Create events by simply **chatting** with our AI assistant.
   - PreemBot helps you define event details like title, time, venue, and description.

2. **Attendance Management**

   - QR code-based check-ins for guests.
   - Attendance tracking updated in real-time.

3. **Guest Management**

   - Bulk upload guests via CSV or manual inputs.
   - Automatically send personalized event tickets with QR codes via email.

4. **Customizable Event Posters**

   - Upload event posters or use provided templates.

5. **Dashboard & Analytics**

   - View event stats, guest attendance, and event distribution.
   - Clean, interactive visualizations for better insights.

6. **AI-Powered Invoice Analysis**

   - Extract data from invoice PDFs automatically.
   - Categorize expenses and generate financial insights.
   - Track budget, analyze spending patterns, and identify cost-saving opportunities.
   - Compare expenses across events for better financial planning.

7. **Welcome Screen for Attendees**

   - Show personalized welcome messages as attendees arrive.

8. **Multi-platform Ready**
   - Web-based solution with plans for tablet and mobile support.

---

## 🛠️ **Tech Stack**

**Frontend**:

- React.js with TypeScript
- Styled-components
- React-router
- Chart.js (for analytics)

**Backend**:

- Node.js (Express.js)
- Sequelize ORM with PostgreSQL
- AWS SES / Mailgun (for email delivery)
- OpenAI API (for PreemBot functionality)
- QR Code generation (Node libraries)

**AI & Data Processing**:

- Python with Flask for invoice analysis API
- CrewAI for orchestrating AI agents
- PyMuPDF for PDF extraction
- OpenAI GPT-4o for advanced text analysis
- LangChain for AI workflow management

**Tools & Integrations**:

- Auth0 for Authentication
- Mailgun for email services
- AWS for hosting future resources
- Docker-ready (future integration)

---

## 📈 **Roadmap**

### Upcoming Features:

- AI-driven agenda creation.
- Multimodal attendance: Face recognition and fingerprints.
- Event mobile stations for real-time analytics and communication.
- Stripe integration for ticket payments.
- Multi-language support.

---

## 📝 **License**

This project is licensed under the **MIT License**.

---

## 🧠 **Invoice Analysis System**

The AI-powered invoice analysis system helps event managers track and analyze expenses by automatically extracting data from invoice PDFs.

### Setup & Running

1. **Prerequisites**

   - Python 3.8+ with pip
   - Node.js and npm
   - OpenAI API key

2. **Installation**

   ```bash
   # Install Python dependencies
   pip install -r backend/scripts/requirements.txt

   # Set your OpenAI API key
   export OPENAI_API_KEY=your_openai_api_key
   ```

3. **Running the System**

   ```bash
   # Start all services with one command
   ./start_invoice_analysis.sh
   ```

   Or start each component separately:

   ```bash
   # Start the Python API
   ./backend/scripts/run_invoice_api.sh

   # Start the Node.js backend
   cd backend && npm run dev

   # Start the frontend
   cd frontend && npm run dev
   ```

4. **Using the Feature**
   - Navigate to an event in the frontend
   - Go to the Budget & Invoices section
   - Upload a PDF invoice
   - Click "Analyze with AI" on any invoice
   - View the analysis results and budget dashboard
