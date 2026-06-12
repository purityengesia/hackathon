SkillConnect: Informal Sector Job Matcher

A simple, mobile-responsive web application designed to connect informal sector workers (plumbers, carpenters, laundry, etc.) with local clients in areas where formal street addresses or GPS mapping is unreliable.

🌟 The Problem & Solution
The Problem:In many informal settlements, skilled workers struggle to find consistent work because they lack a digital presence or a formal address (GPS mapping is often inaccurate). Conversely, local residents struggle to find reliable help nearby.

The Solution:SkillConnect removes the complexity of GPS by using hyper-local landmarks and locality names. It provides a clean, text-based directory where workers can list their trade, rate, and experience, and clients can book them instantly via SMS alerts.

✨ Key Features
Dual-User System: Separate flows for Workers (Manage profile, accept jobs) and Clients (Search directory, track requests).
Hyper-Local Search: Filter workers by trade type and specific localities/landmarks (e.g., "Near Main Market").
Flexible Profiles: Workers can specify standard trades or enter "Other" for niche jobs. Includes an optional "Work Experience" field.
Booking & Status Tracker: Clients send requests -> Workers Accept/Decline -> Status updates to "Completed".
SMS Integration: Simulates real-time SMS alerts via Twilio API when a client requests a gig.
Mobile First Design: Optimized for simple, fast loading on mobile devices.

🛠 Tech Stack
Backend: Node.js, Express.js
Frontend: EJS (Embedded JavaScript templating), HTML5, CSS3
Communication: Twilio API
Database: In-Memory (Arrays) for demo purposes.


🚀 How to Run (Installation)
Follow these steps to run the project on any computer:

1.PrerequisitesEnsure you have Node.js installed on your computer.
2.Install DependenciesOpen your terminal/command prompt in the project folder and run:
npm install
3.Environment SetupCreate a file named .env in the root folder to ensure the server starts smoothly (even if you don't have a Twilio account).Paste this into .env:
TWILIO_ACCOUNT_SID=AC00000000000000000000000000000000TWILIO_AUTH_TOKEN=your_auth_token_placeholderTWILIO_PHONE_NUMBER=+1234567890
4.Start the ServerIn your terminal, run:
npm start
5.Access the AppOpen your web browser and go to:http://localhost:3000


👥 Demo Credentials (For Quick Testing)
Since the app uses in-memory data, you can use these pre-loaded workers to test the booking flow immediately without registering:

Worker Name: Mike Ross (Trade: Plumbing, Rate: 500/hr)
Worker Name: James Bond (Trade: Electrical, Rate: 800/hr)

To Test Booking:

1.Log in as a Client (Register with any name/phone).
2.Search for "Plumbing".
3.Click "Request Booking" on Mike Ross.
4.Log out and Log in as Mike Ross (Worker).
5.You will see the pending job and can "Accept" it.