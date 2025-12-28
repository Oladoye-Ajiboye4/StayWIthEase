// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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
const database = getDatabase(app);
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

let userId = 0;
let dbSnapshot = [];
let allUsers = []; 

document.addEventListener('DOMContentLoaded', () => {
  const userRef = ref(database, 'users/');
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data != null) {
      dbSnapshot = Object.values(data); 
      allUsers = Object.values(data);  
      userId = dbSnapshot.length;
    } else {
      dbSnapshot = [];
      allUsers = [];
      userId = 0;
    }
  });
});

// Helper: Generate a Random ID safely
const generateUserID = () => {
  let mainUserID = parseInt(Math.random() * 10000000000);
  let checkUserID = dbSnapshot.length > 0 ? dbSnapshot.find(user => user && user.id == mainUserID) : false;

  if (checkUserID) {
    return generateUserID();
  } else {
    return mainUserID;
  }
}
window.generateUserID = generateUserID;

// Google Sign-In
const googleSigninBtn = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      const isUserExist = dbSnapshot.find(u => u && u.email === user.email);

      if (isUserExist) {
        mainErrorMessage.style.display = 'block';
        mainErrorMessage.textContent = 'An account with this email already exists. Please sign in instead.';
        setTimeout(() => {
          mainErrorMessage.style.display = 'none';
        }, 5000);
        return;
      } else {
        saveUser(user.displayName, user.email, user.photoURL);
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);
      }
    }).catch((error) => {
      handleAuthError(error);
    });
}
window.googleSigninBtn = googleSigninBtn;

// Github Sign-In
const githubSigninBtn = () => {
  signInWithPopup(auth, githubProvider)
    .then((result) => {
      const user = result.user;

      const isUserExist = dbSnapshot.find(u => u && u.email === user.email);

      if (isUserExist) {
        mainErrorMessage.style.display = 'block';
        mainErrorMessage.textContent = 'An account with this email already exists. Please sign in instead.';
        setTimeout(() => {
          mainErrorMessage.style.display = 'none';
        }, 5000);
        return;
      } else {
        saveUser(user.displayName, user.email, user.photoURL);
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);
      }
    }).catch((error) => {
      handleAuthError(error);
    });
}
window.githubSigninBtn = githubSigninBtn;

// Error Handler Helper
const handleAuthError = (error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  console.log(errorCode, errorMessage);

  if (error.code === 'auth/account-exists-with-different-credential') {
    mainErrorMessage.style.display = 'block';
    mainErrorMessage.textContent = 'An account with this email already exists with a different sign-in method. Please use that method to sign in.';
    setTimeout(() => {
      mainErrorMessage.style.display = 'none';
    }, 5000);
    return;
  }
  if (mainErrorMessage) {
    mainErrorMessage.style.display = 'block';
    mainErrorMessage.textContent = 'An error occurred. Please try again.';
    setTimeout(() => {
      mainErrorMessage.style.display = 'none';
    }, 2000);
  }
}

window.handleAuthError = handleAuthError;


// Manual Signup Logic
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[^\s]+$/;

const manualSignup = () => {
  if (fullName.value.trim() === '' || email.value.trim() === '' || password.value.trim() === '' || confirmPassword.value.trim() === '') {
    showError(mainErrorMessage);
  } else if (!emailRegex.test(email.value)) {
    showError(emailError);
  } else if (fullName.value.length <= 2) {
    showError(fullNameError);
  } else if (!passwordRegex.test(password.value) || !passwordRegex.test(confirmPassword.value.trim())) {
    passwordError.style.display = 'block';
    passwordError.textContent = 'Password is not strong enough or doesn\'t match';
    setTimeout(() => { passwordError.style.display = 'none' }, 2000);
  } else if (password.value.trim() !== confirmPassword.value.trim()) {
    passwordError.style.display = 'block';
    passwordError.textContent = 'Passwords don\'t match';
    setTimeout(() => { passwordError.style.display = 'none' }, 2000);
  } else {
    // Validated
    submitBtn.style.display = 'none';

    let existingLoader = document.getElementById('loadingBtn');
    if (!existingLoader) {
      formGroup.insertAdjacentHTML('beforeend', `<button class="bg-success border-0 btn btn-primary btn-lg w-100 mt-3 fw-semibold" type="button" disabled id="loadingBtn">
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">Loading...</span>
        </button>`);
    } else {
      existingLoader.style.display = 'block';
    }

    const userFullName = fullName.value.trim();
    const userEmail = email.value.trim();
    const userPassword = password.value.trim();

    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        const user = userCredential.user;

        const currentId = dbSnapshot.length;

        const userObj = {
          dbFullName: userFullName,
          dbEmail: userEmail,
          dbPassword: userPassword,
          dbId: currentId,
        }

        savePasswordUser(userObj.dbFullName, userObj.dbEmail, userObj.dbPassword, `https://ui-avatars.com/api/?name=${userObj.dbFullName[0]}&background=10b981&color=fff&bold=true`);

        setTimeout(() => {
          window.location.href = "signin.html";
        }, 500);
      })
      .catch((error) => {
        const loader = document.getElementById('loadingBtn');
        if (loader) loader.style.display = 'none';
        submitBtn.style.display = 'block';

        mainErrorMessage.style.display = 'block';
        mainErrorMessage.textContent = error.code === 'auth/email-already-in-use' ? 'Email already exists.' : 'An error occurred.';

        setTimeout(() => { mainErrorMessage.style.display = 'none' }, 2000);
      });
  }
}
window.manualSignup = manualSignup;

// Helper to show errors briefly
const showError = (element) => {
  element.style.display = 'block';
  setTimeout(() => { element.style.display = 'none' }, 2000);
}

// SAVE USER (Social Auth)
const saveUser = (name, email, imageUrl) => {
  const currentId = dbSnapshot.length;
  const usersRef = ref(database, 'users/' + currentId);

  const userObj = {
    id: generateUserID(),
    username: name,
    email: email,
    profile_picture: imageUrl,
    wallet: { amount: 0 },
    dbId: currentId,
  }

  set(usersRef, userObj).then(() => {
    console.log("User saved successfully!");
    localStorage.setItem('activeUser', JSON.stringify(userObj));
    dbSnapshot.push(userObj);
    allUsers.push(userObj);
    window.localStorage.setItem('users', JSON.stringify(allUsers));
  }).catch((error) => {
    console.error("Error saving user: ", error);
  });
}
window.saveUser = saveUser;

// SAVE PASSWORD USER
const savePasswordUser = (name, email, password, imageUrl) => {
  const currentId = dbSnapshot.length;
  const usersRef = ref(database, 'users/' + currentId);

  const userObj = {
    id: generateUserID(),
    username: name,
    email: email,
    password: password,
    profile_picture: imageUrl,
    wallet: { amount: 0 },
    dbId: currentId,
  }

  set(usersRef, userObj).then(() => {
    console.log("User saved successfully!");
    dbSnapshot.push(userObj);
    allUsers.push(userObj);
    window.localStorage.setItem('users', JSON.stringify(allUsers));
  }).catch((error) => {
    console.error("Error saving user: ", error);
    if (mainErrorMessage) {
      mainErrorMessage.style.display = 'block';
      mainErrorMessage.textContent = 'Error saving data.';
      setTimeout(() => { mainErrorMessage.style.display = 'none' }, 2000);
    }
  });
}
window.savePasswordUser = savePasswordUser;