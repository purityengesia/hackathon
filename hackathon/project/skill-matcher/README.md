🛠️ Kazi Connect
Kazi Connect is a dynamic, local service marketplace platform designed to connect skilled workers (plumbers, electricians, etc.) with clients in need of their services.

Built with Node.js, Express, and EJS, it features real-time communication, voice note job descriptions, M-Pesa integration simulations, and an open job marketplace.

✨ Key Features
Dual Role System: Separate dashboards and workflows for Workers and Clients.
Smart Search: Filter workers by trade (Plumbing, Electrical, etc.) and locality.
Job Marketplace:
Direct Booking: Clients can book a specific worker directly.
Open Jobs: Clients can post jobs to a public marketplace for any worker to apply for.
Voice Notes: Integrated audio recording for job descriptions and worker replies using the MediaRecorder API.
Real-Time Notifications: Uses Socket.io for instant alerts on job status updates and new applications.
Guild Chat: A real-time chat room specific to the worker's trade.
M-Pesa Integration: Simulated STK Push payment flow for completed jobs.
Multi-language Support: Instant toggle between English and Swahili on the Client Dashboard.
Reviews & Ratings: Clients can rate workers and leave text feedback.
Worker Availability: Workers can toggle their online status.
🛠️ Tech Stack
Backend:

Node.js & Express.js - Server framework.
Socket.io - Real-time bidirectional event-based communication.
Multer - File handling (audio uploads).
Axios - HTTP client (for external API calls).
Frontend:

EJS (Embedded JavaScript) - Templating engine.
Vanilla JavaScript - Client-side logic (recording, socket client, translations).
CSS3 - Custom styling with a focus on responsive mobile-first design.
External Services (Simulated/Integrated):

Twilio - SMS notifications (Logic included, requires API keys).
M-Pesa - Payment gateway (Logic included, requires API keys).
Database:

In-Memory (Mock) - Uses local arrays (workers, clients, jobs). Note: Data resets when the server stops.
📋 Prerequisites
Node.js (v14 or higher recommended)
npm or yarn
🚀 Installation & Setup
Clone the repository
bash

git clone <your-repo-url>
cd Kazi-connect
Install dependencies
bash

npm install
Environment Variables
Create a .env file in the root directory. While the app can run without these for core features, they are required for SMS and advanced features.
env

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
Run the server
bash

node server.js
Or using nodemon (recommended for development):
bash

nodemon server.js
Access the Application
Open your browser and navigate to:
http://localhost:3000
📂 Project Structure
bash

skill-connect/
├── public/
│   └── uploads/           # Directory for storing voice note audio files
├── views/                 # EJS Templates (implied by app.set('view engine', 'ejs'))
│   ├── index.ejs          # Landing page
│   ├── worker_login.ejs   # Worker login and registration
│   ├── client_login.ejs   # Client login (implied)
│   ├── client_dash.ejs    # Client dashboard (Search, Book, Pay)
│   ├── worker_dash.ejs    # Worker dashboard (My Jobs, Open Jobs, Guild Chat)
│   └── guild_chat.ejs     # Trade-specific chat interface
├── .env                   # Environment variables
├── package.json           # Dependencies
└── server.js              # Main server file (Routes, Socket.io, Logic)
🎮 Usage Guide
For Clients
Login/Register: Sign up as a client.
Find a Worker: Use the search bar to filter by trade (e.g., "Plumbing") or location.
Book a Job:
Direct: Select a specific worker, describe the issue (text or hold the mic to record), and submit.
Marketplace: Check "Post to Marketplace" to make the job visible to all workers.
Track & Pay: Monitor job status. Once marked "Completed", pay via the simulated M-Pesa button.
Review: Rate the worker and leave a comment.
For Workers
Login/Register: Create a profile with your trade, rate, and location.
Browse Open Jobs: Go to the dashboard to see jobs posted in the marketplace. Click "Apply" to claim them.
Manage My Jobs: See direct bookings and applied jobs. Update status (Pending -> Accepted -> Completed).
Guild Chat: Access the chat room to discuss trade-specific topics with other workers.
Availability: Toggle the "Available" switch to appear in search results.
🔧 API Endpoints (Summary)
Method
Endpoint
Description
POST	/login/worker	Authenticate worker
POST	/register	Register new worker
POST	/api/book	Create a new job booking
POST	/api/upload-audio	Upload voice note (WebM)
POST	/api/update-status	Update job status (Accept/Complete)
POST	/api/mpesa/pay	Trigger M-Pesa STK Push (Simulated)
POST	/api/rate-worker	Submit rating and review
POST	/api/apply-job	Worker applies for an open job

🚧 Known Limitations
Data Persistence: The application uses in-memory arrays. All data (jobs, users, messages) will be lost if the server is restarted.
Audio Formats: Voice notes are recorded in .webm format, which is widely supported on Chrome/Android but may need conversion for Safari/iOS.
M-Pesa/Twilio: These are currently simulated in the console or return mock success responses. Real payments require valid API credentials and a live backend.
📄 License
This project is open source and available for educational purposes.

👨‍💻 Author
Created by[purity and stephen]

Happy Connecting! 🚀