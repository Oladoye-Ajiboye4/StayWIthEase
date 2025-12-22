
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
let dbSnapshot = []


document.addEventListener('DOMContentLoaded', () => {
  const db = getDatabase();
  const userRef = ref(db, 'users/');
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data != null) {
      dbSnapshot = data
      userId = data.length
    } else {
      userId = 0
    }
  });

});

const googleSigninBtn = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      user.dbId = userId
      console.log(user)
      window.localStorage.setItem('activeUser', JSON.stringify(user))

      saveUser(user.displayName, user.email, user.photoURL)
      console.log('User saved')
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message; 
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);

      if (errorCode || email || credential) {
        mainErrorMessage.style.display = 'block';
        mainErrorMessage.textContent = 'An error occurred during sign-in. Please try again.';
        setTimeout(() => {
          mainErrorMessage.style.display = 'none';
        }, 2000);
      }
      console.log(errorCode, errorMessage, email);
    });
}
window.googleSigninBtn = googleSigninBtn;

const githubSigninBtn = () => {
  signInWithPopup(auth, githubProvider)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      user.dbId = userId
      window.localStorage.setItem('activeUser', JSON.stringify(user))

      saveUser(user.displayName, user.email, user.photoURL)

      console.log('User saved')
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GithubAuthProvider.credentialFromError(error);

      if (errorCode || email || credential) {
        mainErrorMessage.style.display = 'block';
        mainErrorMessage.textContent = 'An error occurred during sign-in. Please try again.';
        setTimeout(() => {
          mainErrorMessage.style.display = 'none';
        }, 2000);
      }
      console.log(errorCode, errorMessage, email);
    });
}

window.githubSigninBtn = githubSigninBtn;

const generateUserID = () => {
  let mainUserID = parseInt(Math.random() * 10000000000)
  let checkUserID = dbSnapshot.find(user => user.id == mainUserID)
  if (checkUserID) {
    return generateUserID()
  } else {
    return mainUserID
  }
}

window.generateUserID = generateUserID


// Manuel sign up

let allUsers = [];
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[^\s]+$/;
const db = JSON.parse(localStorage.getItem('users'))

if (db) {
  allUsers = db;
}

const manualSignup = () => {
  if (fullName.value.trim() === '' || email.value.trim() === '' || password.value.trim() === '' || confirmPassword.value.trim() === '') {
    mainErrorMessage.style.display = 'block'

    setTimeout(() => {
      mainErrorMessage.style.display = 'none'
    }, 2000)

  } else if (!emailRegex.test(email.value)) {
    emailError.style.display = 'block'

    setTimeout(() => {
      emailError.style.display = 'none'
    }, 2000)
  } else if (fullName.value.length <= 2) {
    fullNameError.style.display = 'block'
    setTimeout(() => {
      fullNameError.style.display = 'none'
    }, 2000)
  } else if (!passwordRegex.test(password.value) || !passwordRegex.test(confirmPassword.value.trim())) {
    passwordError.style.display = 'block'
    passwordError.textContent = 'Password is not strong enough or don\'t match'

    setTimeout(() => {
      passwordError.style.display = 'none'
    }, 2000)
  } else if (password.value.trim() != confirmPassword.value.trim()) {
    passwordError.textContent = 'Passwords don\'t match'

    setTimeout(() => {
      passwordError.style.display = 'none'
    }, 2000)
  } else {
    submitBtn.style.display = 'none'
    formGroup.innerHTML += `<button class="bg-success border-0 btn btn-primary btn-lg w-100 mt-3 fw-semibold" type="button" disabled id="loadingBtn">
                                            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                            <span role="status">Loading...</span>
                                        </button>`


    const userObj = {
      dbFullName: fullName.value.trim(),
      dbEmail: email.value.trim(),
      dbPassword: password.value.trim(),
      dbId: userId,
    }
    const userEmail = userObj.dbEmail
    const userPassword = userObj.dbPassword
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        console.log('User signed up:', user)

        savePasswordUser(userObj.dbFullName, userEmail, userPassword, `https://ui-avatars.com/api/?name=${userObj.dbFullName[0]}&background=10b981&color=fff&bold=true`)

        console.log('User saved')
        setTimeout(() => {
          window.location.href = "signin.html";
        }, 500);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Error here', errorCode, errorMessage)
        mainErrorMessage.style.display = 'block'
        mainErrorMessage.textContent = 'An error occurred during sign-up. Please try again.';
        setTimeout(() => {
          mainErrorMessage.style.display = 'none'
        }, 2000)
      });
  }
}
window.manualSignup = manualSignup

const saveUser = (name, email, imageUrl) => {
  const db = getDatabase();
  const usersRef = ref(db, 'users/' + userId);

  // Write the data once
  const userObj = {
    id: generateUserID(),
    username: name,
    email: email,
    profile_picture: imageUrl,
    wallet: {
      amount: 0
    },
    dbId: userId,

  }
  set(usersRef, userObj).then(() => {
    console.log("User saved successfully!");
  }).catch((error) => {
    console.error("Error saving user: ", error);
  });

  allUsers.push(userObj)
  window.localStorage.setItem('users', JSON.stringify(allUsers))

}

window.saveUser = saveUser


const savePasswordUser = (name, email, password, imageUrl) => {
  const db = getDatabase();
  const usersRef = ref(db, 'users/' + userId);

  // Write the data once
  const userObj = {
    id: generateUserID(),
    username: name,
    email: email,
    password: password,
    profile_picture: imageUrl,
    wallet: {
      amount: 0
    },
    dbId: userId,

  }
  set(usersRef, userObj).then(() => {
    console.log("User saved successfully!");
  }).catch((error) => {
    console.error("Error saving user: ", error);
    mainErrorMessage.style.display = 'block'
    mainErrorMessage.textContent = 'An error occurred while saving user data. Please try again.';
    setTimeout(() => {
      mainErrorMessage.style.display = 'none'
    }, 2000)
  });

  allUsers.push(userObj)
  window.localStorage.setItem('users', JSON.stringify(allUsers))

}

window.savePasswordUser = savePasswordUser