// --- LOCAL STORAGE INITIALIZATION ---

// Initial Jobs Data
const initialJobs = [
    {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechFlow Inc.",
        type: "Full-time",
        salary: "$80k - $120k",
        posted: "2 days ago",
        description: "We are looking for an expert in React and Tailwind CSS.",
        logo: "fa-brands fa-react",
        applied: false
    },
    {
        id: 2,
        title: "UX/UI Designer",
        company: "Creative Studio",
        type: "Contract",
        salary: "$50/hr",
        posted: "5 hours ago",
        description: "Design beautiful interfaces for mobile apps.",
        logo: "fa-solid fa-pen-nib",
        applied: false
    },
    {
        id: 3,
        title: "Customer Success Manager",
        company: "HelpDesk Global",
        type: "Full-time",
        salary: "$60k - $80k",
        posted: "1 day ago",
        description: "Manage client relationships and ensure satisfaction.",
        logo: "fa-solid fa-headset",
        applied: false
    }
];

// Initial Users Data
const initialUsers = [
    {
        email: "admin@remotify.com",
        password: "admin",
        name: "Super Admin",
        role: "admin",
        status: "active",
        paymentProof: null,
        notification: null
    },
    {
        email: "user@remotify.com",
        password: "user",
        name: "Demo User",
        role: "user",
        status: "active",
        paymentProof: "PRE_VERIFIED",
        notification: null
    }
];

// Initial Settings
const initialSettings = {
    price: "50.00",
    currency: "$",
    bankName: "Global Remote Bank",
    accountNumber: "1234-5678-9000",
    supportEmail: "support@remotify.com",
    contactPhone: "+1 (555) 0123-4567"
};

// Initialize Data on Load
function initStorage() {
    if (!localStorage.getItem('remotify_jobs')) {
        localStorage.setItem('remotify_jobs', JSON.stringify(initialJobs));
    }
    if (!localStorage.getItem('remotify_users')) {
        localStorage.setItem('remotify_users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('remotify_settings')) {
        localStorage.setItem('remotify_settings', JSON.stringify(initialSettings));
    }
    if (!localStorage.getItem('remotify_requests')) {
        localStorage.setItem('remotify_requests', JSON.stringify([]));
    }
}

initStorage();

// --- HELPERS ---
function getUsers() {
    return JSON.parse(localStorage.getItem('remotify_users'));
}

function saveUsers(users) {
    localStorage.setItem('remotify_users', JSON.stringify(users));
}

function getJobs() {
    return JSON.parse(localStorage.getItem('remotify_jobs'));
}

function saveJobs(jobs) {
    localStorage.setItem('remotify_jobs', JSON.stringify(jobs));
}

function getSettings() {
    return JSON.parse(localStorage.getItem('remotify_settings'));
}

function saveSettings(settings) {
    localStorage.setItem('remotify_settings', JSON.stringify(settings));
}

function getRequests() {
    return JSON.parse(localStorage.getItem('remotify_requests'));
}

function saveRequests(requests) {
    localStorage.setItem('remotify_requests', JSON.stringify(requests));
}

function getCurrentUser() {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return null;
    const users = getUsers();
    return users.find(u => u.email === email);
}

// --- EASTER EGG ---
let copyrightClicks = 0;
function handleCopyrightClick() {
    copyrightClicks++;
    if (copyrightClicks === 10) {
        window.location.href = 'admin.html';
    }
}

// --- AUTHENTICATION ---

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const users = getUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUserEmail', user.email);
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        alert('Invalid email or password.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }

    const newUser = {
        email: email,
        password: password,
        name: `${fname} ${lname}`,
        role: 'user',
        status: 'new', 
        paymentProof: null,
        notification: null
    };

    users.push(newUser);
    saveUsers(users);

    // Auto Login and Redirect to Payment flow
    localStorage.setItem('currentUserEmail', newUser.email);
    window.location.href = 'dashboard.html';
}

function logout() {
    localStorage.removeItem('currentUserEmail');
    window.location.href = 'index.html';
}

// Forgot Password Logic
function showForgotModal() {
    document.getElementById('forgot-modal').classList.remove('hidden');
}

function hideForgotModal() {
    document.getElementById('forgot-modal').classList.add('hidden');
}

function submitForgotPassword(e) {
    e.preventDefault();
    const name = document.getElementById('reset-name').value;
    const email = document.getElementById('reset-email').value;
    const phone = document.getElementById('reset-phone').value;

    const requests = getRequests();
    requests.push({
        id: Date.now(),
        name, 
        email, 
        phone, 
        date: new Date().toLocaleDateString()
    });
    saveRequests(requests);

    alert("Request submitted! Admin will send you the password soon.");
    hideForgotModal();
}

// --- DASHBOARD LOGIC ---

function loadDashboard() {
    const user = getCurrentUser();
    if (!user) { 
        window.location.href = 'login.html'; 
        return;
    }

    document.getElementById('user-greeting').innerText = `Welcome, ${user.name}`;
    
    const paymentSection = document.getElementById('payment-section');
    const pendingSection = document.getElementById('pending-section');
    const dashboardContent = document.getElementById('dashboard-content');
    const notifArea = document.getElementById('notification-area');

    // Check for push notifications
    if (user.notification) {
        notifArea.classList.remove('hidden');
        document.getElementById('notification-message').textContent = user.notification;
        
        // Clear notification after showing
        const users = getUsers();
        const uIndex = users.findIndex(u => u.email === user.email);
        users[uIndex].notification = null;
        saveUsers(users);
    }

    // State Management
    if (user.status === 'new') {
        // Load Settings into Payment Form
        const settings = getSettings();
        document.getElementById('pay-amount').textContent = `${settings.currency}${settings.price}`;
        document.getElementById('pay-bank').textContent = settings.bankName;
        document.getElementById('pay-acc').textContent = settings.accountNumber;

        paymentSection.classList.remove('hidden');
    } 
    else if (user.status === 'pending') {
        pendingSection.classList.remove('hidden');
        document.getElementById('pending-txn').textContent = user.paymentProof;
    } 
    else {
        dashboardContent.classList.remove('hidden');
        loadJobs();
    }
}

function loadJobs() {
    const jobs = getJobs();
    const container = document.getElementById('job-container');
    if (!container) return;

    container.innerHTML = jobs.map(job => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition hover:shadow-md">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xl">
                        <i class="${job.logo || 'fa-solid fa-briefcase'}"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-900">${job.title}</h3>
                        <p class="text-sm text-slate-500">${job.company} • ${job.posted}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">${job.type}</span>
                    <span class="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">${job.salary}</span>
                </div>
            </div>
            <div class="mt-4 text-slate-600 text-sm">
                ${job.description}
            </div>
            <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span class="text-xs text-slate-400">Verified Listing <i class="fa-solid fa-check-circle text-blue-400 ml-1"></i></span>
                ${getApplyButton(job)}
            </div>
        </div>
    `).join('');
}

function getApplyButton(job) {
    if (job.applied) {
        return `<button class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-default">
                    <i class="fa-solid fa-check mr-1"></i> Applied
                </button>`;
    } else {
        return `<button onclick="applyJob(${job.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Apply Now
                </button>`;
    }
}

function applyJob(jobId) {
    let jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
        jobs[jobIndex].applied = true;
        saveJobs(jobs);
        loadJobs();
        alert("Application sent successfully!");
    }
}

function submitPayment(e) {
    e.preventDefault();
    const txnId = document.getElementById('txn-input').value;
    if(!txnId) return;

    const userEmail = localStorage.getItem('currentUserEmail');
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === userEmail);

    if(userIndex !== -1) {
        users[userIndex].status = 'pending';
        users[userIndex].paymentProof = txnId;
        saveUsers(users);
        
        alert("Payment submitted! Waiting for verification.");
        location.reload();
    }
}

// --- ADMIN LOGIC ---

function loadAdminDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    updateStats();
    loadAdminData();
    loadAdminRequests();
    loadAdminUsers();
    loadAdminJobs();
    loadPaymentSettingsIntoForm();
}

function updateStats() {
    const users = getUsers();
    const jobs = getJobs();
    const requests = getRequests();
    const pending = users.filter(u => u.status === 'pending').length;
    
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-users').innerText = users.length;
    document.getElementById('stat-jobs').innerText = jobs.length;
    document.getElementById('stat-requests').innerText = requests.length;
}

function loadAdminData() {
    const users = getUsers();
    const pendingUsers = users.filter(u => u.status === 'pending');
    const list = document.getElementById('activation-list');

    if(pendingUsers.length === 0) {
        list.innerHTML = '<li class="px-6 py-8 text-center text-gray-500">No pending activations.</li>';
        return;
    }

    list.innerHTML = pendingUsers.map(u => `
        <li class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">${u.name} (${u.email})</p>
                    <p class="text-sm text-gray-500">Transaction ID: <span class="font-mono font-bold text-slate-700">${u.paymentProof}</span></p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="adminAction('${u.email}', 'approve')" class="px-4 py-2 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700">Approve</button>
                <button onclick="adminAction('${u.email}', 'reject')" class="px-4 py-2 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700">Reject</button>
            </div>
        </li>
    `).join('');
}

function loadAdminRequests() {
    const requests = getRequests();
    const tbody = document.getElementById('password-requests-list');
    if (!tbody) return;

    if(requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No password requests.</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map(req => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${req.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${req.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${req.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="adminSendPassword(${req.id}, '${req.email}')" class="text-blue-600 hover:text-blue-900 font-medium">
                    Send Password
                </button>
            </td>
        </tr>
    `).join('');
}

function adminSendPassword(id, email) {
    alert(`System: Password sent to ${email} successfully!`);
    let requests = getRequests();
    requests = requests.filter(r => r.id !== id);
    saveRequests(requests);
    loadAdminRequests();
    updateStats();
}

function loadAdminUsers() {
    const users = getUsers();
    const tbody = document.getElementById('admin-all-users-list');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${u.name} <br> <span class="text-gray-500 font-normal">${u.email}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(u.status)}">
                    ${u.status.toUpperCase()}
                </span>
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${u.paymentProof || '-'}
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-red-100 text-red-800';
    }
}

function adminAction(email, action) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        if (action === 'approve') {
            users[userIndex].status = 'active';
            users[userIndex].notification = "Congratulations! Your account has been verified. You can now apply for jobs.";
            alert(`User ${email} approved!`);
        } else {
            users[userIndex].status = 'new'; // Reset to require payment
            users[userIndex].paymentProof = null;
            users[userIndex].notification = "Your payment verification failed. Please try again.";
            alert(`User ${email} rejected.`);
        }
        saveUsers(users);
        updateStats();
        loadAdminData();
        loadAdminUsers();
    }
}

function showAdminTab(tab) {
    ['activations', 'users', 'jobs', 'settings', 'requests'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.add('hidden');
    });
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
}

// Admin Jobs
function postJob(e) {
    e.preventDefault();
    const jobs = getJobs();
    const newJob = {
        id: Date.now(),
        title: document.getElementById('job-title').value,
        company: document.getElementById('job-company').value,
        type: document.getElementById('job-type').value,
        salary: document.getElementById('job-salary').value,
        description: document.getElementById('job-desc').value,
        posted: 'Just now',
        logo: 'fa-solid fa-briefcase',
        applied: false
    };
    jobs.unshift(newJob);
    saveJobs(jobs);
    alert('Job posted!');
    e.target.reset();
    loadAdminJobs();
    updateStats();
}

function loadAdminJobs() {
    const jobs = getJobs();
    const tbody = document.getElementById('admin-job-list');
    if(!tbody) return;

    tbody.innerHTML = jobs.map(job => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${job.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${job.company}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${job.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteJob(${job.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

function deleteJob(id) {
    if(!confirm('Delete this job?')) return;
    let jobs = getJobs();
    jobs = jobs.filter(j => j.id !== id);
    saveJobs(jobs);
    loadAdminJobs();
    updateStats();
}

// Admin Settings
function loadPaymentSettingsIntoForm() {
    const settings = getSettings();
    if (!document.getElementById('setting-price')) return;
    
    document.getElementById('setting-currency').value = settings.currency || "$";
    document.getElementById('setting-price').value = settings.price;
    document.getElementById('setting-bank').value = settings.bankName;
    document.getElementById('setting-account').value = settings.accountNumber;
    document.getElementById('setting-email').value = settings.supportEmail || "";
    document.getElementById('setting-phone').value = settings.contactPhone || "";
}

function updatePaymentSettings(e) {
    e.preventDefault();
    const newSettings = {
        price: document.getElementById('setting-price').value,
        currency: document.getElementById('setting-currency').value,
        bankName: document.getElementById('setting-bank').value,
        accountNumber: document.getElementById('setting-account').value,
        supportEmail: document.getElementById('setting-email').value,
        contactPhone: document.getElementById('setting-phone').value
    };
    saveSettings(newSettings);
    alert("Settings updated successfully!");
}

function loadContactPage() {
    const settings = getSettings();
    const phoneEl = document.getElementById('contact-phone-display');
    const emailEl = document.getElementById('contact-email-display');
    
    if(phoneEl && settings.contactPhone) phoneEl.innerText = settings.contactPhone;
    if(emailEl && settings.supportEmail) emailEl.innerText = settings.supportEmail;
}

// --- ROUTER --- //

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) {
        loadDashboard();
    } else if (path.includes('admin.html')) {
        loadAdminDashboard();
    } else if (path.includes('contact.html')) {
        loadContactPage();
    }
});