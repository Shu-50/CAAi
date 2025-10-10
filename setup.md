# 🚀 Quick Setup Guide

Follow these steps to get BillTracker running on your machine:

## 1. Prerequisites Check
Make sure you have:
- ✅ Node.js (v18+) installed
- ✅ PostgreSQL database running
- ✅ Google AI API key ready

## 2. Environment Configuration

Create `Backend/.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/billtracker"
GOOGLE_API_KEY="your-google-ai-api-key"
```

## 3. Installation Commands

Run these commands in order:

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies  
cd ../Frontend
npm install

# Setup database
cd ../Backend
npx prisma migrate dev
npx prisma generate
```

## 4. Start the Application

**Terminal 1 (Backend):**
```bash
cd Backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

## 5. Access Points
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:5000

## 6. First Steps
1. Open http://localhost:5173
2. Navigate to "Upload Bills"
3. Upload a bill image to test AI extraction
4. Explore the dashboard and analytics
5. Chat with the CA Assistant

## 🔧 Troubleshooting

### Database Issues
```bash
# Reset database
cd Backend
npx prisma migrate reset
npx prisma migrate dev
```

### Port Conflicts
- Frontend: Change port in `Frontend/vite.config.js`
- Backend: Change port in `Backend/server.js`

### API Key Issues
- Verify Google AI API key is correct
- Check API key has proper permissions
- Ensure .env file is in Backend directory

## 🎯 Test the Features

1. **Upload Test**: Upload a receipt image
2. **Dashboard**: Check analytics and stats
3. **Bills Management**: Edit and delete bills
4. **Chatbot**: Ask "What's my total spending?"
5. **Analytics**: View spending breakdowns

## 📞 Need Help?
- Check the main README.md for detailed documentation
- Verify all prerequisites are installed
- Ensure database connection is working
- Check console for error messages