# 🧾 BillTracker - AI-Powered Expense Management

A modern, full-stack expense management application with AI-powered bill extraction and a personal finance assistant. Built with React, Node.js, PostgreSQL, and Google Gemini AI.

## ✨ Features

### 📄 Smart Bill Processing
- **AI-Powered Extraction**: Upload bill images and let Google Gemini AI extract structured data
- **Automatic Categorization**: Items are automatically classified into categories (clothes, electronics, food, etc.)
- **Editable Data**: Review and edit extracted data before saving
- **Multiple Formats**: Support for various image formats (JPG, PNG, etc.)

### 📊 Comprehensive Dashboard
- **Real-time Analytics**: View spending trends, category breakdowns, and financial insights
- **Interactive Charts**: Visual representation of your spending patterns
- **Quick Stats**: Total spending, bill count, average amounts, and more
- **Recent Activity**: Track your latest expenses and transactions

### 🤖 CA Assistant Chatbot
- **AI-Powered Advice**: Get personalized financial advice from your virtual CA
- **Spending Analysis**: Ask questions about your spending patterns
- **Budget Planning**: Receive suggestions for better financial management
- **Natural Language**: Chat naturally about your finances

### 💼 Advanced Bill Management
- **CRUD Operations**: Create, read, update, and delete bills and items
- **Search & Filter**: Find bills by vendor, category, date, or amount
- **Bulk Operations**: Manage multiple bills efficiently
- **Data Export**: Export your financial data for backup or analysis

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark theme similar to Supabase/Railway
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished user experience with smooth transitions
- **Intuitive Navigation**: Easy-to-use sidebar navigation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Modern database toolkit
- **PostgreSQL** - Robust relational database
- **Google Gemini AI** - AI model for text and image processing
- **Multer** - File upload handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BillTracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `Backend/.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/billtracker"
   GOOGLE_API_KEY="your-google-ai-api-key"
   ```

5. **Database Setup**
   ```bash
   cd Backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the Application**
   
   Backend (Terminal 1):
   ```bash
   cd Backend
   node server.js
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd Frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 Usage Guide

### 1. Upload Bills
- Navigate to "Upload Bills" in the sidebar
- Drag & drop or click to select bill images
- AI will automatically extract vendor, date, total, and itemized details
- Review and edit the extracted data
- Save to database

### 2. View Dashboard
- Get an overview of your financial status
- See spending trends and category breakdowns
- View recent bills and quick statistics
- Access quick actions for common tasks

### 3. Manage Bills
- Go to "All Bills" to see all saved bills
- Search and filter bills by various criteria
- Edit bill details and items inline
- Delete bills when no longer needed

### 4. Analyze Spending
- Visit "Analytics" for detailed insights
- View spending by category, vendor, and time
- Track monthly trends and patterns
- Get recommendations for better financial management

### 5. Chat with CA Assistant
- Open "CA Assistant" to start chatting
- Ask questions about your spending
- Get personalized financial advice
- Use quick questions for common queries

## 🔧 API Endpoints

### Bills
- `GET /bills` - Get all bills
- `POST /bills` - Create new bill
- `PUT /bills/:id` - Update bill
- `DELETE /bills/:id` - Delete bill

### AI Processing
- `POST /extract` - Extract data from bill image
- `POST /chat` - Chat with CA assistant

### Analytics
- `GET /analytics` - Get spending analytics

### Items
- `DELETE /items/:id` - Delete specific item

## 🎯 Key Features Explained

### AI Bill Extraction
The app uses Google Gemini AI to process bill images and extract:
- Vendor name and details
- Bill date and total amount
- Itemized list with quantities and prices
- Tax information (GST, CGST, SGST)
- Automatic category classification

### Smart Categorization
Items are automatically categorized into:
- 👕 Clothes
- 🍽️ Utensils
- 🔧 Tools
- 📱 Electronics
- 💄 Makeup
- 🍕 Food
- 🧴 Personal Care
- 📦 Others

### CA Assistant Features
The AI assistant can help with:
- Spending analysis and breakdowns
- Budget planning and recommendations
- Financial advice and tips
- Expense tracking insights
- Category-wise spending analysis

## 🔒 Security & Privacy

- All data is encrypted and stored securely
- API keys are environment-protected
- User data remains private and local
- No sensitive information is logged
- Secure file upload handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] OCR improvements
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] Budget alerts and notifications
- [ ] Data export/import features
- [ ] Integration with banking APIs
- [ ] Receipt scanning from mobile camera

---

Built with ❤️ using modern web technologies for efficient expense management.