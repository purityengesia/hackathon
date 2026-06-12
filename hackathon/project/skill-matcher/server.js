const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');
const multer = require('multer');
const fs = require('fs');
const http = require('http'); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Socket.io
const axios = require('axios'); // Required for M-Pesa
require('dotenv').config();

const app = express();
const PORT = 3000;

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server);

// --- CONFIGURATION ---
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- AUDIO UPLOAD SETUP (Multer) ---
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '.webm')
});
const upload = multer({ storage: storage });

// --- MOCK DATABASE (Updated with reviews and Open Jobs) ---
let workers = [
    { id: 1, name: 'Mike Ross', trade: 'Plumbing', rate: 500, rateType: 'Per Hour', locality: 'Near Main Market', phone: '+254700000000', rating: 4.8, isAvailable: true, qualification: 'Certified Plumber', voiceIntro: true, reviews: [] },
    { id: 2, name: 'Sarah Connor', trade: 'Laundry', rate: 200, rateType: 'Per Hour', locality: 'Block D', phone: '+254711111111', rating: 4.5, isAvailable: false, qualification: 'Fabrics expert', voiceIntro: true, reviews: [] },
    { id: 3, name: 'James Bond', trade: 'Electrical', rate: 800, rateType: 'Per Hour', locality: 'Industrial Area', phone: '+254722222222', rating: 5.0, isAvailable: true, qualification: 'Master Electrician', voiceIntro: false, reviews: [] }, 
    { id: 4, name: 'Green Thumb', trade: 'Gardening', rate: 1500, rateType: 'Per Day', locality: 'Near Park', phone: '+254733333333', rating: 4.9, isAvailable: true, qualification: 'Landscaper', voiceIntro: true, reviews: [] } 
];

let clients = [];
// Seed an Open Job for testing the Worker Browsing feature
let jobs = [
    { id: 999, clientId: 'c_test', clientName: 'Test Client', workerId: null, description: 'Need to fix a leaking sink urgently.', status: 'Open', timestamp: new Date(), clientVoiceNote: null, workerVoiceNote: null, isUrgent: true }
];
let messages = []; 
let currentUser = null;

// --- TWILIO CONFIG ---
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// --- ROUTES ---

// 1. Landing Page
app.get('/', (req, res) => res.render('index'));

// 2. Login Pages
app.get('/login/worker', (req, res) => res.render('worker_login', { error: null }));
app.get('/login/client', (req, res) => res.render('client_login', { error: null }));

// 3. Worker Login Logic
app.post('/login/worker', (req, res) => {
    const { name } = req.body;
    if (!name) return res.render('worker_login', { error: 'Name is required' });
    const worker = workers.find(w => w.name.toLowerCase() === name.toLowerCase());
    if (worker) {
        currentUser = { ...worker, role: 'worker' };
        return res.redirect('/dashboard/worker');
    }
    return res.render('worker_login', { error: 'Worker not found. Please register below.' });
});

// 4. Client Login Logic
app.post('/login/client', (req, res) => {
    const { name } = req.body;
    if (!name) return res.render('client_login', { error: 'Name is required' });
    const client = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (client) {
        currentUser = { ...client, role: 'client' };
        return res.redirect('/dashboard/client');
    } 
    return res.render('client_login', { error: 'Client not found. Please register below.' });
});

// 5. Register Worker
app.post('/register', (req, res) => {
    let { name, trade, otherTrade, rate, rateType, locality, phone, qualification } = req.body;
    if (trade === 'Other') trade = otherTrade;
    const newWorker = {
        id: Date.now(), name, trade, rate, rateType, locality, phone, qualification,
        rating: 5.0, isAvailable: true, voiceIntro: false, reviews: []
    };
    workers.push(newWorker);
    currentUser = { ...newWorker, role: 'worker' };
    res.redirect('/dashboard/worker');
});

// 6. Register Client
app.post('/register/client', (req, res) => {
    const { name, phone, locality } = req.body;
    if (!name || !phone) return res.render('client_login', { error: 'Name and Phone are required.' });
    const newClient = { id: 'c_' + Date.now(), name, phone, locality };
    clients.push(newClient);
    currentUser = { ...newClient, role: 'client' };
    res.redirect('/dashboard/client');
});

// 7. Update Worker Profile
app.post('/update-profile', (req, res) => {
    const { name, trade, otherTrade, rate, rateType, locality, phone, qualification } = req.body;
    const finalTrade = trade === 'Other' ? otherTrade : trade;
    const index = workers.findIndex(w => w.id === currentUser.id);
    if (index !== -1) {
        workers[index] = { ...workers[index], name, trade: finalTrade, rate, rateType, locality, phone, qualification };
        currentUser = workers[index];
    }
    res.redirect('/dashboard/worker');
});

// 8. Client Dashboard (Search & Job View)
app.get('/dashboard/client', (req, res) => {
    if (!currentUser || currentUser.role !== 'client') return res.redirect('/');
    const { trade, locality } = req.query;
    let filteredWorkers = workers;
    if (trade) filteredWorkers = filteredWorkers.filter(w => w.trade.toLowerCase().includes(trade.toLowerCase()));
    if (locality) filteredWorkers = filteredWorkers.filter(w => w.locality.toLowerCase().includes(locality.toLowerCase()));
    const myJobs = jobs.filter(j => j.clientId === currentUser.id);

    res.render('client_dash', { 
        user: currentUser, 
        workers: filteredWorkers, 
        allWorkers: workers, 
        jobs: myJobs,
        query: req.query 
    });
});

// 9. Worker Dashboard (Jobs & Marketplace)
app.get('/dashboard/worker', (req, res) => {
    if (!currentUser || currentUser.role !== 'worker') return res.redirect('/');

    // 1. Jobs assigned to me
    const myJobs = jobs.filter(j => j.workerId === currentUser.id && j.status !== 'Completed');

    // 2. NEW: Jobs available to everyone (Open Jobs)
    const openJobs = jobs.filter(j => !j.workerId && j.status === 'Open');

    res.render('worker_dash', { 
        user: currentUser, 
        jobs: myJobs,
        openJobs: openJobs // Pass open jobs to the view
    });
});

// 10. Audio Upload
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ audioUrl: `/uploads/${req.file.filename}` });
});

// 11. Booking API (Updated to handle Open Jobs)
app.post('/api/book', async (req, res) => {
    const { workerId, description, clientVoiceNote, isUrgent, postToMarket } = req.body;
    
    // If 'postToMarket' is checked or workerId is empty, create an Open Job
    const isOpen = postToMarket === 'on' || !workerId;
    
    const newJob = {
        id: Date.now(),
        clientId: currentUser.id,
        clientName: currentUser.name,
        workerId: isOpen ? null : parseInt(workerId),
        description,
        status: isOpen ? 'Open' : 'Pending',
        timestamp: new Date(),
        clientVoiceNote: clientVoiceNote || null, 
        workerVoiceNote: null,
        isUrgent: isUrgent === 'on'
    };

    jobs.push(newJob);

    if (!isOpen && workerId) {
        // Direct Booking: Notify specific worker
        const worker = workers.find(w => w.id == workerId);
        if (worker) {
            console.log(`[Twilio Simulation] SMS sent to ${worker.phone}: New Job Request`);
        }
        io.emit('new_job_notification', newJob);
    } else {
        // Open Job: Notify all workers
        io.emit('new_open_job', newJob);
    }

    res.redirect('/dashboard/client');
});

// 12. Status Update API
app.post('/api/update-status', (req, res) => {
    const { jobId, status, workerVoiceNote } = req.body;
    const job = jobs.find(j => j.id == jobId);
    if (job) {
        job.status = status;
        if (workerVoiceNote) job.workerVoiceNote = workerVoiceNote;
        io.emit('job_status_update', job);
    }
    res.redirect('/dashboard/worker');
});

// 13. Toggle Availability
app.post('/toggle-availability', (req, res) => {
    const worker = workers.find(w => w.id === currentUser.id);
    if (worker) {
        worker.isAvailable = !worker.isAvailable;
        currentUser = worker;
    }
    res.redirect('/dashboard/worker');
});

// 14. Rate Worker
app.post('/api/rate-worker', (req, res) => {
    const { workerId, rating, comment } = req.body;
    const worker = workers.find(w => w.id == workerId);
    if (worker) {
        worker.rating = ((worker.rating * 10) + parseInt(rating)) / 11;
        if (!worker.reviews) worker.reviews = [];
        worker.reviews.push({
            client: currentUser.name,
            rating: rating,
            comment: comment || "No comment provided.",
            date: new Date()
        });
    }
    res.redirect('/dashboard/client');
});

// 15. M-Pesa Payment Route
app.post('/api/mpesa/pay', (req, res) => {
    const { phone, amount, jobId } = req.body;
    console.log(`[M-Pesa Sim] Initiating STK Push to ${phone} for Ksh ${amount}`);
    setTimeout(() => {
        const job = jobs.find(j => j.id == jobId);
        if(job) {
            job.status = 'Paid';
            io.emit('payment_received', { jobId: job.id, amount: amount });
        }
    }, 2000);
    res.json({ success: true, message: "STK Push sent. Please enter your PIN." });
});

// 16. Apply for Open Job (Marketplace)
app.post('/api/apply-job', (req, res) => {
    const { jobId } = req.body;
    const job = jobs.find(j => j.id == jobId);
    if (job) {
        job.workerId = currentUser.id;
        job.status = 'Pending'; // Pending client confirmation (or auto accept)
        // Notify Client
        io.emit('worker_applied', { job: job, workerName: currentUser.name });
    }
    res.redirect('/dashboard/worker');
});

// --- GUILD CHAT ROUTES ---
app.get('/guild-chat', (req, res) => {
    if (!currentUser || currentUser.role !== 'worker') return res.redirect('/');
    const tradeMessages = messages.filter(m => m.trade === currentUser.trade);
    res.render('guild_chat', { user: currentUser, messages: tradeMessages });
});

app.post('/api/send-guild-message', (req, res) => {
    const { text } = req.body;
    if (!text) return res.redirect('/guild-chat');
    const msg = {
        id: Date.now(),
        senderName: currentUser.name,
        trade: currentUser.trade,
        text: text,
        timestamp: new Date()
    };
    messages.push(msg);
    io.emit('guild_message', msg);
    res.redirect('/guild-chat');
});

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});