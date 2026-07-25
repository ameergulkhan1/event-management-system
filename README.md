# 🎓 University Event Management System

A comprehensive event management platform for universities to manage events, registrations, and feedback.

## 🚀 Features

### 👨‍🎓 Students
- Browse and search events
- Register for events
- Submit feedback and ratings
- View registration history
- Profile management

### 🎯 Organizers
- Create and manage events
- View registrations
- Track event analytics
- Manage event capacity
- View feedback from attendees

### 👑 Admin
- Manage users (students, organizers)
- Approve/reject events
- View platform analytics
- Manage all events
- System oversight

## 🛠️ Tech Stack

### Frontend
- React.js 18
- Vite
- React Router DOM
- Axios
- CSS3 (with custom variables)

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Bcrypt

## 📁 Project Structure

\\\
event-management-system/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   └── package.json
└── README.md
\\\

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
\\\ash
git clone https://github.com/ameergulkhan1/event-management-system.git
cd event-management-system
\\\

2. **Setup Backend**
\\\ash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
\\\

3. **Setup Frontend**
\\\ash
cd frontend
npm install
cp .env.example .env
npm run dev
\\\

4. **Setup Database**
\\\sql
-- Run the SQL script
mysql -u root -p < database.sql
\\\

### Environment Variables

#### Backend (.env)
\\\env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=university_event_management
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@eventhub.com
ADMIN_PASSWORD=Admin@123
\\\

#### Frontend (.env)
\\\env
VITE_API_URL=http://localhost:5000/api
\\\

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | User registration |
| POST | /api/auth/login | User login |
| GET | /api/events | Get all events |
| POST | /api/events | Create event |
| PUT | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |
| POST | /api/registrations | Register for event |
| GET | /api/registrations/my | Get my registrations |
| POST | /api/feedback | Submit feedback |

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
\\\ash
npm install -g vercel
\\\

2. **Deploy Backend**
\\\ash
cd backend
vercel --prod
\\\

3. **Deploy Frontend**
\\\ash
cd frontend
vercel --prod
\\\

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - *Initial work* - [ameergulkhan1](https://github.com/ameergulkhan1)

## 🙏 Acknowledgments

- University management team
- All contributors and testers

---
Made with ❤️ for the university community
