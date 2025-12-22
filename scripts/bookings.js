import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyD1vLXPDNusc2X6iYSKxwM_2043SiU3i-Q",
  authDomain: "staywithease-85926.firebaseapp.com",
  projectId: "staywithease-85926",
  storageBucket: "staywithease-85926.firebasestorage.app",
  messagingSenderId: "629558215453",
  databaseURL: "https://staywithease-85926-default-rtdb.firebaseio.com",
  appId: "1:629558215453:web:8d9b4f40f44bd8c69f97f4"
};

const app = initializeApp(firebaseConfig)
const database = getDatabase();
const auth = getAuth();


let activeUser = JSON.parse(window.localStorage.getItem('activeUser'));
if (!activeUser) {
    alert('Please sign in to view your bookings');
    window.location.href = 'signin.html';
}
let bookingsData = [];

document.addEventListener('DOMContentLoaded', () => {
    const bookingsRef = ref(database, `users/${activeUser.dbId}/bookings`);
    onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val();
        bookingsData = data ? Object.values(data) : [];
        renderBookings(bookingsData);
    });
});

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
});

const renderBookings = (bookings) => {
    bookingsContainer.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = `
        <div class="empty-state">
            <img src="https://images.unsplash.com/photo-1631049307038-da5ec5d9cb27?w=400&h=300&fit=crop" alt="No bookings" class="empty-state-image">
            <h3 class="empty-state-title">No Bookings Yet</h3>
            <p class="empty-state-text">You haven't made any bookings yet. Start exploring and book your perfect stay!</p>
            <a href="dashboard.html" class="btn btn-success mt-3">Browse Hotels</a>
        </div>
        `;
        return;
    }
    
    bookings.forEach((booking) => {
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        bookingsContainer.innerHTML += `
        <div class="booking-card">
            <div class="booking-card-image">
                <img src="${booking.hotelImage || 'https://images.unsplash.com/photo-1631049307038-da5ec5d9cb27?w=500&h=300&fit=crop'}" alt="${booking.hotelName}">
                <span class="booking-status-badge">${booking.status || 'Upcoming'}</span>
            </div>
            <div class="booking-card-body">
                <div class="booking-card-header">
                    <div>
                        <h4 class="booking-hotel-name">${booking.hotelName}</h4>
                        <p class="booking-location">
                            <i class="bi bi-geo-alt"></i> ${booking.location}
                        </p>
                    </div>
                    <div class="booking-price">
                        ${formatter.format(booking.totalAmount || 0)}
                    </div>
                </div>
                
                <div class="booking-details">
                    <div class="booking-detail-item">
                        <i class="bi bi-calendar-check"></i>
                        <div>
                            <span class="detail-label">Check-in</span>
                            <span class="detail-value">${checkInDate}</span>
                        </div>
                    </div>
                    <div class="booking-detail-item">
                        <i class="bi bi-calendar-x"></i>
                        <div>
                            <span class="detail-label">Check-out</span>
                            <span class="detail-value">${checkOutDate}</span>
                        </div>
                    </div>
                    <div class="booking-detail-item">
                        <i class="bi bi-door-open"></i>
                        <div>
                            <span class="detail-label">Room Type</span>
                            <span class="detail-value">${booking.roomType}</span>
                        </div>
                    </div>
                    <div class="booking-detail-item">
                        <i class="bi bi-people"></i>
                        <div>
                            <span class="detail-label">Guests</span>
                            <span class="detail-value">${booking.guests || 2}</span>
                        </div>
                    </div>
                </div>
                
                <div class="booking-card-footer">
                    <button class="btn btn-outline-success btn-sm">
                        <i class="bi bi-eye"></i> View Details
                    </button>
                    <button class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-x-circle"></i> Cancel Booking
                    </button>
                </div>
            </div>
        </div>
        `;
    });
};

window.renderBookings = renderBookings;

// const logoutBtn = document.getElementById('logoutBtn');
// logoutBtn.addEventListener('click', () => {
//     signOut(auth).then(() => {
//         window.localStorage.removeItem('activeUser');
//         window.location.href = 'signin.html';
//     }).catch((error) => {
//         console.error('Error signing out:', error);
//     });
// });

// window.logoutBtn = logoutBtn;