import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, runTransaction, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCs90pz0oHzfuLDBkbw-4WrqG0mhT48DlU",
    authDomain: "staywithease-85926.firebaseapp.com",
    projectId: "staywithease-85926",
    storageBucket: "staywithease-85926.firebasestorage.app",
    messagingSenderId: "588421621127",
    databaseURL: "https://staywithease-85926-default-rtdb.firebaseio.com",
    appId: "1:588421621127:web:20d23ed2f0f17fea1cfc15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const activeHotel = JSON.parse(localStorage.getItem('activeHotel'))

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
});
let currentRoomType = ''
let executivePrice;
let deluxePrice = 0
let regularPrice = activeHotel ? activeHotel.price : 0
let checkInDate = ''
let checkOutDate = ''
let duration;

const setCheckInDate = new Date().toISOString().split('T')[0];
const setCheckOutDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
checkIn.setAttribute('min', setCheckInDate);
checkOut.setAttribute('min', setCheckOutDate);

document.addEventListener('DOMContentLoaded', () => {
    if (activeHotel) {

        hotelName.textContent = activeHotel.name
        location.textContent = activeHotel.location
        price.innerHTML = formatter.format(activeHotel.price) + '<span>/night</span>'
        hotelCard.innerHTML = `
        <img class="hotel-card w-100" src="${activeHotel.hotelDp}" alt="Main Room" style="height: 100% !important;" />
    `
        hotelDescription.textContent = activeHotel.hotelDes

        // Initialize map with hotel location
        if (activeHotel.lat && activeHotel.lon) {
            let hotelMap = L.map('roomMapContainer').setView([activeHotel.lat, activeHotel.lon], 20);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(hotelMap);

            const marker = L.marker([activeHotel.lat, activeHotel.lon]);
            marker.bindPopup(`
            <strong>${activeHotel.name}</strong><br/>
            ${activeHotel.location}<br/>
            <a href="https://www.google.com/maps?q=${activeHotel.lat},${activeHotel.lon}" target="_blank" style="color: #10b981;">Open in Google Maps</a>
        `);
            marker.addTo(hotelMap);
        }

        executivePrice = activeHotel.price + (0.1 * activeHotel.price);
        executiveRoomPrice.textContent = formatter.format(executivePrice);
        deluxePrice = activeHotel.price + (0.2 * activeHotel.price);
        deluxeRoomPrice.textContent = formatter.format(deluxePrice);
        regularRoomPrice.textContent = formatter.format(activeHotel.price);

        checkInDate = checkIn.value
        checkOutDate = checkOut.value
        duration = ((new Date(checkOutDate).getTime()) - (new Date(checkInDate).getTime())) / (1000 * 3600 * 24);


    } else {
        alert('Hotel details not available')
        setTimeout(() => {
            window.location.href = 'dashboard.html'
        }, 500)
    }
});

const executiveRoom = () => {
    payment.style.display = 'block'
    roomCategories.style.display = 'none'
    currentRoomType = 'Executive Room'
    nightlyRate.textContent = formatter.format(executivePrice);
    setTimeout(() => {
        payment.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

}

const regularRoom = () => {
    payment.style.display = 'block'
    roomCategories.style.display = 'none'
    currentRoomType = 'Regular Room'
    nightlyRate.textContent = formatter.format(regularPrice);
    setTimeout(() => {
        payment.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

}

const deluxeRoom = () => {
    payment.style.display = 'block'
    roomCategories.style.display = 'none'
    currentRoomType = 'Deluxe Room'
    nightlyRate.textContent = formatter.format(deluxePrice);
    setTimeout(() => {
        payment.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

}

window.executiveRoom = executiveRoom
window.regularRoom = regularRoom
window.deluxeRoom = deluxeRoom

bookingForm.addEventListener('change', () => {
    if (checkOut.value < checkIn.value) {
        alert('Check-out date cannot be earlier than check-in date.');
        checkOut.value = '';
        return;
    } else if (checkIn.value === checkOut.value) {
        return
    } else if (!checkIn.value || !checkOut.value) {
        alert('Please select both check-in and check-out dates.');
        return;
    }

    calculateBill()
})

const calculateBill = () => {
    if (!checkIn.value || !checkOut.value) {
        alert('Please select both check-in and check-out dates before calculating the bill.');
        return;
    }
    checkInDate = checkIn.value
    checkOutDate = checkOut.value
    duration = ((new Date(checkOutDate).getTime()) - (new Date(checkInDate).getTime())) / (1000 * 3600 * 24);
    let durationCost = duration * executivePrice
    nightCount.textContent = duration
    let guestsCount = parseInt(guests.value) || 2;
    guestCountDisplay.textContent = guestsCount
    let guestPriceMMultiplier = guestsCount * 0.1
    let totalPriceWithGuests = durationCost + (durationCost * guestPriceMMultiplier)
    displayTotal.innerHTML = `<h3>${formatter.format(totalPriceWithGuests)}</h3>`;

}

window.calculateBill = calculateBill

const continuePayment = () => {
    const hotelPaymentObj = {
        hotelDp: activeHotel.hotelDp,
        hotelName: activeHotel.name,
        location: activeHotel.location,
        roomType: currentRoomType,
        nightlyRate: nightlyRate.textContent,
        checkInDate: checkIn.value,
        checkOutDate: checkOut.value,
        duration: duration,
        guests: parseInt(guests.value) || 2,
        totalAmount: displayTotal.textContent.replace(/[^0-9.-]+/g, ""),
    }

    if (hotelPaymentObj.totalAmount > 0) {
        const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'), {
            backdrop: 'static',
            keyboard: false
        });
        loadingModal.show();

        let activeUser = JSON.parse(localStorage.getItem('activeUser'))
        if (activeUser) {
            let userBalance = activeUser.wallet.amount;
            if (userBalance < hotelPaymentObj.totalAmount) {
                loadingModal.hide();
                alert('Insufficient wallet balance. Please top up your wallet or use another payment method.');
                setTimeout(() => {
                    window.location.href = 'dashboard.html'
                }, 500)
                return;
            } else {
                console.log('Sufficient balance. Proceeding to payment page.');
                userBalance = userBalance - hotelPaymentObj.totalAmount;
                activeUser.wallet.amount = userBalance;
                localStorage.setItem('hotelPaymentObj', JSON.stringify(hotelPaymentObj))
                localStorage.setItem('activeUser', JSON.stringify(activeUser));

                // Update Firebase wallet
                const db = getDatabase();
                const walletRef = ref(db, `users/${activeUser.dbId}/wallet`);
                runTransaction(walletRef, (currentData) => {
                    if (currentData === null) {
                        return {
                            amount: userBalance,
                            timestamp: Date.now()
                        };
                    } else {
                        return {
                            amount: userBalance,
                            timestamp: Date.now()
                        };
                    }
                })
                    .then((result) => {
                        console.log('Firebase wallet updated successfully');
                        setTimeout(() => {
                            loadingModal.hide();
                            window.location.href = 'dashboard.html'
                        }, 500)
                    })
                    .catch((error) => {
                        console.error('Error updating Firebase wallet:', error);
                        setTimeout(() => {
                            loadingModal.hide();
                            window.location.href = 'dashboard.html'
                        }, 500)
                    });
                const bookingsRef = ref(db, `users/${activeUser.dbId}/bookings`);
                runTransaction(bookingsRef, (currentData) => {
                    if (currentData === null) {
                        return [hotelPaymentObj];
                    } else {
                        currentData.push(hotelPaymentObj);
                        return currentData;
                    }
                })
                    .then((result) => {
                        console.log('Booking saved to Firebase successfully');
                    })
                    .catch((error) => {
                        console.error('Error saving booking to Firebase:', error);
                    });

            }
        } else {
            loadingModal.hide();
            alert('Please log in to continue with the payment.')
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 500)
        }
    } else {
        alert('Please calculate the total amount before proceeding to payment.')
    }
}

window.continuePayment = continuePayment
const goBack = () => {
    payment.style.display = 'none'
    roomCategories.style.display = 'flex'

    // Smooth scroll to room categories
    setTimeout(() => {
        roomCategories.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

window.goBack = goBack


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