// Import styles
import './styles.css';

// Import the m-user-info module
import mUserInfo from 'm-user-info';

// Store the component instance
let userInfoComponent = null;

// Function to initialize or update the component
function setupOrUpdateComponent() {
  const username = document.getElementById('username').value;
  const birthdateInput = document.getElementById('birthdate').value;
  const birthdate = birthdateInput ? new Date(birthdateInput) : null;
  
  // Parameters for the component
  const params = {
    username,
    age: birthdate
  };
  
  // If already initialized, update it
  if (userInfoComponent) {
    userInfoComponent.updateUserData(params);
    console.log('Component updated with:', params);
  } else {
    // First initialization
    userInfoComponent = mUserInfo.setup('user-info-container', params);
    console.log('Component initialized with:', params);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the component
  setupOrUpdateComponent();
  
  // Add event listener for update button
  document.getElementById('update-btn').addEventListener('click', setupOrUpdateComponent);
  
  console.log('Application initialized successfully');
});