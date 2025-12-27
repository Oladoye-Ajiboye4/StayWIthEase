import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1vLXPDNusc2X6iYSKxwM_2043SiU3i-Q",
  authDomain: "staywithease-85926.firebaseapp.com",
  projectId: "staywithease-85926",
  storageBucket: "staywithease-85926.firebasestorage.app",
  messagingSenderId: "629558215453",
  databaseURL: "https://staywithease-85926-default-rtdb.firebaseio.com",
  appId: "1:629558215453:web:8d9b4f40f44bd8c69f97f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

let activeUser = [];

document.addEventListener('DOMContentLoaded', () => {

  try {
    const db = JSON.parse(localStorage.getItem('activeUser'));
    if (db) {
      activeUser = db;

      avatarContainer.innerHTML = `<img src="${activeUser.photoURL || activeUser.profile_picture}" alt="${activeUser.displayName || activeUser.username}">`;
      const activeUsername = document.getElementById('username');
      activeUsername.innerHTML = activeUser.username || activeUser.displayName;

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      });

      walletBalance.innerHTML = activeUser.wallet.amount ? formatter.format(activeUser.wallet.amount) : "₦0.00";
      navWalletBalance.innerHTML = walletBalance.innerHTML
    }
  } catch (error) {
    console.log(error)
    alert('Sign in to access this page')
    setTimeout(() => {
      window.location.href = "signin.html"
    }, 500)
  }
});

const payWithPayStack = () => {
  if (!activeUser) {
    alert('Please sign in to make a payment.');
    return;
  }

  // Get the value and convert to a Number immediately
  const depositAmount = parseFloat(document.getElementById('depositAmount').value);
  const userEmail = activeUser.email;

  if (!depositAmount || depositAmount <= 100) {
    alert("Please enter a valid amount");
    return;
  }

  const paystack = new window.PaystackPop();
  paystack.newTransaction({
    key: 'pk_test_494c394de29705cccc9b4a3577a7e12e4bb507ca',
    email: userEmail,
    amount: depositAmount * 100, // Convert to Kobo

    onSuccess: (transaction) => {
      updateFirebaseWallet(depositAmount);
    },

    onCancel: () => {
      alert('Transaction was closed.');
    }
  });
}

window.payWithPayStack = payWithPayStack;

const updateFirebaseWallet = (amountToAdd) => {
  const db = getDatabase();
  const walletRef = ref(db, `users/${activeUser.dbId}/wallet`);
  runTransaction(walletRef, (currentData) => {
    if (currentData === null) {
      return {
        amount: amountToAdd,
        timestamp: Date.now()
      };
    } else {
      return {
        amount: (currentData.amount || 0) + amountToAdd,
        timestamp: Date.now()
      };
    }
  })
    .then((result) => {
      // result.snapshot contains the new wallet object
      const newWallet = result.snapshot.val();
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      });

      walletBalance.innerHTML = formatter.format(newWallet.amount);
      activeUser.wallet = newWallet;
      localStorage.setItem('activeUser', JSON.stringify(activeUser));
      alert("Wallet funded successfully!");
      document.getElementById('depositAmount').value = '';
    })
    .catch((error) => {
      console.error('Error updating wallet:', error);
      alert("Payment successful but wallet update failed. Contact Admin.");
    });
}

window.updateFirebaseWallet = updateFirebaseWallet;

// MAP API INTEGRATION

let map = L.map('mapContainer').setView([9.0820, 8.6753], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

const hotelImages = [
  // --- EXTERIORS (Buildings) ---
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  "https://images.unsplash.com/photo-1571896349842-6e53ce41e86a?w=600&q=80",

  // --- BEDROOMS (Interiors) ---
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
  "https://images.unsplash.com/photo-1595576560481-efe5d7ecd713?w=600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80",

  // --- LOBBY / POOL / AMENITIES ---
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80",
  "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80",
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=80",
  "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&q=80"
];

// Helper to pick one:
const getRandomHotelImage = () => {
  return hotelImages[Math.floor(Math.random() * hotelImages.length)];
};

const hotelDescriptions = [
  "A luxury stay in the heart of the city with stunning skyline views.",
  "Cozy and affordable, perfect for travelers on a budget.",
  "Experience world-class service and a rooftop infinity pool.",
  "A boutique hotel offering a unique blend of modern and traditional styles.",
  "Located just steps away from the main market and nightlife.",
  "Quiet and serene, ideal for business trips and focused work.",
  "Family-friendly resort with spacious rooms and a kids' play area.",
  "An eco-friendly hotel designed with sustainability in mind.",
  "Enjoy complimentary breakfast and high-speed fiber internet.",
  "A historic building renovated with contemporary luxury amenities.",
  "Minimalist design meets maximum comfort in this urban retreat.",
  "Features a 24-hour fitness center and an award-winning restaurant.",
  "Escape the noise in this lush, garden-surrounded hideaway.",
  "Budget-friendly suites with fully equipped kitchenettes.",
  "Pet-friendly accommodation with a large outdoor park nearby.",
  "Top-rated security and privacy for exclusive guests.",
  "A vibrant hotel with a popular bar and social lounge.",
  "Elegant rooms with king-sized beds and marble bathrooms.",
  "Conveniently located near the airport with free shuttle service.",
  "Experience the ultimate relaxation in our full-service spa."
];

// Helper to pick a random description
const getRandomDesc = () => {
  return hotelDescriptions[Math.floor(Math.random() * hotelDescriptions.length)];
};

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',
});


const useMapApi = () => {
  const apiKey = '6f05ab3b9dd94123994d0842044d5116';
  const userSearch = document.getElementById('userSearch').value;
  const searchBtn = document.getElementById('searchBtn');
  const searchText = document.getElementById('searchText');

  // Show loading state
  searchBtn.classList.add('loading');
  searchText.style.opacity = '0.5';

  markersLayer.clearLayers();

  const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${userSearch}, Nigeria&apiKey=${apiKey}`;

  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const { lat, lon } = data.features[0].properties;

        // Move the map to the new city found
        map.setView([lat, lon], 13);

        const placeUrl = `https://api.geoapify.com/v2/places?categories=accommodation,building.accommodation&filter=circle:${lon},${lat},10000&limit=100&apiKey=${apiKey}`;

        fetch(placeUrl)
          .then(response => response.json())
          .then(placeData => {
            console.log('Nearby Hotels:', placeData);
            if (placeData.features.length !== 0) {
              let html = '<div class="row g-3">';
              sectionTitle.textContent = `Showing results for "${userSearch}"`;

              // Hide loading state
              searchBtn.classList.remove('loading');
              searchText.style.opacity = '1';

              let allMapData = []

              placeData.features.forEach((hotel, hotelId) => {
                const hLat = hotel.properties.lat;
                const hLon = hotel.properties.lon;
                const name = hotel.properties.name || "Unnamed Hotel";
                const price = Number(parseInt(Math.random() * 1000) + '00')
                const hotelDp = getRandomHotelImage()
                const location = hotel.properties.state
                const hotelDes = getRandomDesc()

                //create hotel in the list with grid
                html += `
                  <div class="col-12 col-md-6 col-lg-12">
                    <div class="hotel-card h-100">
                      <div class="row g-0">
                          <div class="col-md-4">
                              <img src="${hotelDp}" alt="Hotel" class="hotel-image">
                          </div>
                          <div class="col-md-8">
                              <div class="hotel-content">
                                  <div class="d-flex justify-content-between align-items-start">
                                      <div>
                                          <h3 class="hotel-name">${name}</h3>
                                          <p class="hotel-location"><i class="bi bi-geo-alt me-1"></i>${location}</p>
                                      </div>
                                      <div class="hotel-rating">
                                          <i class="bi bi-star-fill"></i> 4.9
                                      </div>
                                  </div>
                                  <p class="hotel-description">${hotelDes}</p>
                                  <div class="hotel-tags">
                                      <span class="badge">Starts from</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mt-3">
                                      <div class="hotel-price">${formatter.format(price)}<span>/night</span></div>
                                      <a class="btn btn-view" href="" onclick="showRoom(${hotelId})">View Rooms</a>
                                  </div>
                              </div>
                          </div>
                      </div>
                    </div>
                  </div>
                `
                const mapObj = {
                  hotelId: hotelId,
                  name: name,
                  lon: hLon,
                  lat: hLat,
                  location: location,
                  price: price,
                  hotelDp: hotelDp,
                  hotelDes: hotelDes
                }
                allMapData.push(mapObj)
                const marker = L.marker([hLat, hLon]);

                // FIXED URL TYPO
                const googleLink = `https://www.google.com/maps?q=${hLat},${hLon}`;

                marker.bindPopup(`
                  <img src="${getRandomHotelImage()}" style="width:100%; height:120px; object-fit:cover; border-radius:4px;">
                  <h3 style="margin:5px 0;">${name}</h3>
                  <p style="margin:5px 0; font-size:0.9em; color:#555;">${getRandomDesc()}</p> 
                  <a href="${googleLink}" target="_blank" style="display:block; margin-top:5px;">Open in Google Maps</a>
                `);

                // 3. Add to the LayerGroup, not directly to map
                markersLayer.addLayer(marker);

              });
              html += '</div>';
              hotelList.innerHTML = html;
              localStorage.setItem('allMapData', JSON.stringify(allMapData))

            }

          })
          .catch(error => {
            console.error('Error fetching hotels:', error);
            alert("Error fetching hotels. Please try again.");
            // Hide loading state on error
            searchBtn.classList.remove('loading');
            searchText.style.opacity = '1';
          });
      } else {
        alert("City not found!");
        // Hide loading state if city not found
        searchBtn.classList.remove('loading');
        searchText.style.opacity = '1';
      }
    })
    .catch(error => {
      console.error('Error fetching geocoding data:', error);
      alert("Error fetching location data. Please try again.");
      // Hide loading state on error
      const searchBtn = document.getElementById('searchBtn');
      const searchText = document.getElementById('searchText');
      searchBtn.classList.remove('loading');
      searchText.style.opacity = '1';
    });
}


window.useMapApi = useMapApi;


const showRoom = (hotelId) => {
  const allMapData = JSON.parse(localStorage.getItem('allMapData'))
  const activeHotel = allMapData[hotelId]
  localStorage.setItem('activeHotel', JSON.stringify(activeHotel))
  setTimeout(() => {
    window.location.href = 'room.html'
  }, 500)
}

window.showRoom = showRoom

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