import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig)
const database = getDatabase();
const auth = getAuth();


let activeUser = JSON.parse(window.localStorage.getItem('activeUser'));
if (!activeUser) {
    alert('Please sign in to view your bookings');
    window.location.href = 'signin.html';

}
let bookingsData = [];
avatarContainer.innerHTML = `<img src="${activeUser.photoURL || activeUser.profile_picture}" alt="${activeUser.displayName || activeUser.username}">`;

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
});

walletBalance.innerHTML = activeUser.wallet.amount ? formatter.format(activeUser.wallet.amount) : "₦0.00";

const showLoadingState = () => {
    bookingsContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-12 col-md-6 col-lg-3">
                <div class="booking-card-skeleton h-100">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line skeleton-subtitle"></div>
                        <div class="skeleton-details">
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                        </div>
                        <div class="skeleton-footer">
                            <div class="skeleton-button"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
                <div class="booking-card-skeleton h-100">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line skeleton-subtitle"></div>
                        <div class="skeleton-details">
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                            <div class="skeleton-box"></div>
                        </div>
                        <div class="skeleton-footer">
                            <div class="skeleton-button"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    showLoadingState();

    const bookingsRef = ref(database, `users/${activeUser.dbId}/bookings`);
    onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val();
        bookingsData = data ? Object.values(data) : [];
        renderBookings(bookingsData);
    });
});


const renderBookings = (bookings) => {
    const upcomingTab = document.querySelector('[data-tab="upcoming"]');

    if (bookings.length === 0) {
        upcomingTab.textContent = 'Upcoming (0)';
        bookingsContainer.innerHTML = '';
        bookingsContainer.innerHTML = `
        <div class="empty-state">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format" 
                 alt="Cozy empty hotel room" 
                 class="empty-state-image">
            <h3 class="empty-state-title">No Bookings Yet</h3>
            <p class="empty-state-text">
                Start your journey with Stay With Ease! Discover comfortable accommodations 
                and book your perfect stay in just a few clicks.
            </p>
            <a href="dashboard.html" class="btn btn-success">
                <i class="bi bi-search"></i>
                Explore Hotels
            </a>
        </div>
        `;
        return;
    }

    upcomingTab.textContent = `Upcoming (${bookings.length})`;
    let html = '<div class="row g-3">';

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

        html += `
        <div class="col-12 col-md-6 col-lg-3">
            <div class="booking-card h-100">
                <div class="booking-card-image">
                    <img src="${booking.hotelDp || 'https://images.unsplash.com/photo-1631049307038-da5ec5d9cb27?w=500&h=300&fit=crop'}" alt="${booking.hotelName}">
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
        </div>
        `;
    });

    html += '</div>';
    bookingsContainer.innerHTML = html;
};

window.renderBookings = renderBookings;

const logOut = () => {
  signOut(auth).then(() => {
    console.log('Signing out')
    localStorage.setItem('activeUser', [])
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  }).catch((error) => {
    // An error happened.
    console.log(error)
    alert('Error signing out. Please try again.')
  });
}

window.logOut = logOut