// --- CONFIGURACIÓN DE FIREBASE ---
// IMPORTANTE: Reemplaza esto con la configuración de tu propio proyecto de Firebase

const firebaseConfig = {
  apiKey: "AIzaSyDfbnJu3C45PvBSkwuMfQoWH4Xridm718s",
  authDomain: "appac-d069c.firebaseapp.com",
  projectId: "appac-d069c",
  storageBucket: "appac-d069c.firebasestorage.app",
  messagingSenderId: "204739581057",
  appId: "1:204739581057:web:536511d8028ad956fba980"
};

// --- INICIALIZACIÓN DE FIREBASE Y SERVICIOS ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let userDbRef; // Referencia a la colección del usuario logueado

// --- REGISTRO DEL SERVICE WORKER (PARA PWA) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// --- LÓGICA DE AUTENTICACIÓN Y VISTAS ---
const views = document.querySelectorAll('.view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

const showView = (viewId) => {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
};

document.getElementById('show-register-btn').addEventListener('click', () => showView('register-view'));
document.getElementById('show-login-btn').addEventListener('click', () => showView('login-view'));

auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario ha iniciado sesión
        userDbRef = db.collection('users').doc(user.uid);
        app.init(); // Inicia la aplicación principal
        showView('app-view');
    } else {
        // Usuario no ha iniciado sesión
        showView('login-view');
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => loginError.textContent = error.message);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => registerError.textContent = error.message);
});

// --- APLICACIÓN PRINCIPAL (NUESTRO CÓDIGO ANTERIOR, ADAPTADO) ---
const appContainer = document.getElementById('app-view');
// Inyectamos el HTML de nuestra app dentro del contenedor
appContainer.innerHTML = `
    <!-- Aquí va el HTML completo de las vistas landing, calendar y selector -->
    <!-- Por brevedad, se omite el HTML y se enfoca en la lógica JS que cambia -->
`;

const app = {
    // ... (Toda la lógica de la app que ya teníamos: state, foodData, etc.)
    // ... (Las funciones init, showView, etc. se adaptan o mueven fuera del objeto)

    // --- FUNCIONES DE SINCRONIZACIÓN ADAPTADAS PARA FIRESTORE ---
    async saveData() {
        if (!userDbRef) return;
        const selectorState = { ...this.state.selector, usedFoods: [...this.state.selector.usedFoods] };
        try {
            await userDbRef.set({ plannerData: selectorState }, { merge: true });
            console.log("Datos guardados en Firestore");
        } catch (error) {
            console.error("Error al guardar datos: ", error);
        }
    },
    async loadData() {
        if (!userDbRef) return;
        try {
            const doc = await userDbRef.get();
            if (doc.exists && doc.data().plannerData) {
                const savedState = doc.data().plannerData;
                this.state.selector = savedState;
                this.state.selector.usedFoods = new Set(savedState.usedFoods);
                console.log("Datos cargados desde Firestore");
            } else {
                console.log("No se encontraron datos para este usuario.");
            }
        } catch (error) {
            console.error("Error al cargar datos: ", error);
        }
    },

    // ... (El resto de las funciones de la app: initCalendar, initSelector, getDaySpecificPlanHTML, etc.)
    // ... (Estas funciones permanecen casi iguales, ya que la lógica de la UI no cambia)
    // ... (Solo se debe asegurar que `init` llame a `loadData` al principio)
    
    async init() {
        // Inyectar el HTML de la app aquí
        // ...
        await this.loadData();
        this.initCalendar();
        this.initSelector();
        // ...
    }
};

// NOTA: El código completo de la lógica de la app (el objeto 'app' del script anterior) 
// debe ser pegado y adaptado aquí, modificando las funciones saveData y loadData como se muestra.
