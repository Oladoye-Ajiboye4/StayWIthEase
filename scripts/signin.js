import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
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
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

let allUsers = [];

const dataBase = getDatabase();
const userRef = ref(dataBase, 'users/');
onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data != null) {
        allUsers = data;
    }
});
const googleSigninBtn = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            const mainUser = allUsers.find(u => u.email === user.email);
            if (mainUser) {
                window.localStorage.setItem('activeUser', JSON.stringify(mainUser))
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                mainErrorMessage.style.display = 'block';
                mainErrorMessage.textContent = 'No account found with this email. Please sign up first.';
                setTimeout(() => {
                    mainErrorMessage.style.display = 'none';
                }, 5000);
                return;
            }


        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);

            if (email) {
                mainErrorMessage.style.display = 'block';
                mainErrorMessage.textContent = 'No account found with this email. Please sign up first.';
                setTimeout(() => {
                    mainErrorMessage.style.display = 'none';
                }, 5000);
                return;
            } else if (errorCode || errorMessage || credential) {
                mainErrorMessage.style.display = 'block';
                mainErrorMessage.textContent = 'An error occurred during sign-in. Please try again.';
                setTimeout(() => {
                    mainErrorMessage.style.display = 'none';
                }, 2000);
            }
            console.log(errorCode, errorMessage, email, credential);
        });
}
window.googleSigninBtn = googleSigninBtn;

const githubSigninBtn = () => {
    signInWithPopup(auth, githubProvider)
        .then((result) => {
            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            const mainUser = allUsers.find(u => u.email === user.email);
            if (mainUser) {
                window.localStorage.setItem('activeUser', JSON.stringify(mainUser))
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                mainErrorMessage.style.display = 'block';
                mainErrorMessage.textContent = 'No account found with this email. Please sign up first.';
                setTimeout(() => {
                    mainErrorMessage.style.display = 'none';
                }, 5000);
                return;
            }

        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GithubAuthProvider.credentialFromError(error);

            if (errorCode || errorMessage || email || credential) {
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


// Manual sign in

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[^\s]+$/;

document.addEventListener('DOMContentLoaded', () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users/');
    onValue(usersRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            allUsers.push(userData);
        });
    });
})


const manualSignin = () => {
    if (email.value.trim() === '' || password.value.trim() === '') {
        mainErrorMessage.style.display = 'block'

        setTimeout(() => {
            mainErrorMessage.style.display = 'none'
        }, 2000)

    } else if (!emailRegex.test(email.value)) {
        emailError.style.display = 'block'

        setTimeout(() => {
            emailError.style.display = 'none'
        }, 2000)

    } else {
        const userEmail = email.value.trim()
        const userPassword = password.value.trim()

        submitBtn.style.display = 'none'
        formGroup.innerHTML += `<button class="bg-success border-0 btn btn-primary btn-lg w-100 mt-3 fw-semibold" type="button" disabled id="loadingBtn">
                                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span role="status">Loading...</span>
                            </button>`

        signInWithEmailAndPassword(auth, userEmail, userPassword)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                const currentUser = allUsers.find(u => u.email === userEmail);
                if (currentUser) {
                    localStorage.setItem('activeUser', JSON.stringify(currentUser))
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'
                    }, 500)
                } else {
                    mainErrorMessage.style.display = 'block';
                    mainErrorMessage.textContent = 'No account found with this email. Please sign up first.';
                    setTimeout(() => {
                        mainErrorMessage.style.display = 'none';
                    }, 5000);
                    return;
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error:', errorCode, errorMessage);
                submitBtn.style.display = 'block'
                const loadingBtn = document.getElementById('loadingBtn');
                if (loadingBtn) loadingBtn.remove();

                if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
                    mainErrorMessage.style.display = 'block'
                    mainErrorMessage.textContent = 'Invalid email or password.'
                    setTimeout(() => {
                        mainErrorMessage.style.display = 'none'
                    }, 2000)
                } else {
                    mainErrorMessage.style.display = 'block'
                    mainErrorMessage.textContent = 'Error signing in. Please try again.'
                    setTimeout(() => {
                        mainErrorMessage.style.display = 'none'
                    }, 2000)
                }
            });
    }
}

window.manualSignin = manualSignin