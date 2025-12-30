import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig)
const database = getDatabase();
const auth = getAuth();

let activeUser = JSON.parse(window.localStorage.getItem('activeUser'));
if (!activeUser) {
    alert('Please sign in to view your profile');
    window.location.href = 'signin.html';
}

avatarContainer.innerHTML = `<img src="${activeUser.photoURL || activeUser.profile_picture}" alt="${activeUser.displayName || activeUser.username}">`;

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
});

walletBalance.innerHTML = activeUser.wallet.amount ? formatter.format(activeUser.wallet.amount) : "₦0.00";

currentUsername.innerText = activeUser.displayName || activeUser.username;
currentEmail.innerText = activeUser.email || activeUser.email_address;

editProfilePicture.src = activeUser.photoURL || activeUser.profile_picture;
editUsername.value = activeUser.displayName || activeUser.username;
editEmail.value = activeUser.email || activeUser.email_address;


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