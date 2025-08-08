// Student Registration Form with Firebase Firestore Integration

// Firebase Configuration
// IMPORTANT: Replace this with your actual Firebase configuration
// You can find your config in Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
  apiKey: "AIzaSyAiD24tu0BeTrPMVzBor4RtJNFly5tuESo",
  authDomain: "student-form-app-acfa0.firebaseapp.com",
  projectId: "student-form-app-acfa0",
  storageBucket: "student-form-app-acfa0.firebasestorage.app",
  messagingSenderId: "172721786990",
  appId: "1:172721786990:web:b31b7a49833965a532967f"
};

// Initialize Firebase
let db = null;
let isFirebaseInitialized = false;

function initializeFirebase() {
    try {
        // Check if Firebase config has been updated from placeholder values
        if (firebaseConfig.apiKey === "your-api-key-here" || 
            firebaseConfig.projectId === "your-project-id") {
            console.warn("Firebase configuration not updated. Please update the firebaseConfig object in app.js");
            return false;
        }

        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        showMessage("Firebase configuration error. Please check your configuration.", "error");
        return false;
    }
}

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const messageArea = document.getElementById('messageArea');
const messageContent = document.getElementById('messageContent');

// Form fields
const studentNameField = document.getElementById('studentName');
const rollNoField = document.getElementById('rollNo');
const studentClassField = document.getElementById('studentClass');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log("Student Registration Form loaded");
    
    // Initialize Firebase
    initializeFirebase();
    
    // Add form event listeners
    registrationForm.addEventListener('submit', handleFormSubmit);
    
    // Add input event listeners for real-time validation feedback
    const formInputs = [studentNameField, rollNoField, studentClassField];
    formInputs.forEach(input => {
        input.addEventListener('input', clearValidationErrors);
        input.addEventListener('blur', validateField);
    });
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Clear any existing messages
    hideMessage();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Check Firebase initialization
    if (!isFirebaseInitialized) {
        showMessage("Firebase is not properly configured. Please update your Firebase configuration in app.js", "error");
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Get form data
        const formData = getFormData();
        
        // Add timestamp
        formData.registrationDate = firebase.firestore.FieldValue.serverTimestamp();
        formData.createdAt = new Date().toISOString();
        
        // Save to Firestore
        const docRef = await db.collection('students').add(formData);
        
        console.log("Student registered with ID:", docRef.id);
        
        // Show success message
        showMessage(`Student registered successfully! Registration ID: ${docRef.id}`, "success");
        
        // Reset form
        resetForm();
        
    } catch (error) {
        console.error("Error registering student:", error);
        
        // Show user-friendly error message
        let errorMessage = "Failed to register student. ";
        
        if (error.code === 'permission-denied') {
            errorMessage += "Permission denied. Please check your Firestore security rules.";
        } else if (error.code === 'unavailable') {
            errorMessage += "Service temporarily unavailable. Please try again later.";
        } else {
            errorMessage += "Please try again or contact support.";
        }
        
        showMessage(errorMessage, "error");
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
}

// Get form data
function getFormData() {
    return {
        name: studentNameField.value.trim(),
        rollNo: rollNoField.value.trim(),
        class: studentClassField.value.trim()
    };
}

// Form validation
function validateForm() {
    let isValid = true;
    const fields = [
        { element: studentNameField, name: 'Student Name' },
        { element: rollNoField, name: 'Roll Number' },
        { element: studentClassField, name: 'Class' }
    ];
    
    fields.forEach(field => {
        if (!validateField(field.element, field.name)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage("Please fill in all required fields correctly.", "error");
    }
    
    return isValid;
}

// Validate individual field
function validateField(element, fieldName = null) {
    const field = element.target || element;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.classList.remove('error');
    
    if (!value) {
        field.classList.add('error');
        return false;
    }
    
    // Additional validation for roll number (should not be empty and should be unique)
    if (field === rollNoField && value.length < 1) {
        field.classList.add('error');
        return false;
    }
    
    return true;
}

// Clear validation errors
function clearValidationErrors(event) {
    const field = event.target;
    field.classList.remove('error');
    
    // Hide message if all fields are valid
    if (isFormValid()) {
        hideMessage();
    }
}

// Check if form is valid without showing errors
function isFormValid() {
    const fields = [studentNameField, rollNoField, studentClassField];
    return fields.every(field => field.value.trim() !== '');
}

// Show message
function showMessage(message, type) {
    messageContent.textContent = message;
    messageArea.className = `message-area ${type} fade-in`;
    messageArea.classList.remove('hidden');
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Hide message
function hideMessage() {
    messageArea.classList.add('hidden');
    messageArea.classList.remove('success', 'error', 'fade-in');
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Reset form
function resetForm() {
    registrationForm.reset();
    
    // Remove any error styling
    const formInputs = [studentNameField, rollNoField, studentClassField];
    formInputs.forEach(input => {
        input.classList.remove('error');
    });
    
    // Focus on first field
    studentNameField.focus();
}

// Add CSS class for error styling
const style = document.createElement('style');
style.textContent = `
    .form-control.error {
        border-color: var(--color-error) !important;
        box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.1) !important;
    }
    
    .form-control.error:focus {
        border-color: var(--color-error) !important;
        box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.2) !important;
    }
`;
document.head.appendChild(style);

// Utility function to check if running in development
function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
}

// Log helpful information for developers
if (isDevelopment()) {
    console.log(`
    🔥 Student Registration Form - Development Mode
    
    To connect to Firebase:
    1. Create a Firebase project at https://console.firebase.google.com
    2. Enable Firestore Database
    3. Get your Firebase configuration from Project Settings
    4. Replace the firebaseConfig object in app.js with your actual config
    5. Update Firestore security rules to allow read/write access
    
    Example Firestore rules for testing:
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /students/{document} {
          allow read, write: if true;
        }
      }
    }
    
    Note: Use more restrictive rules in production!
    `);
}