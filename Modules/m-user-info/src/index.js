import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import configureStore from './store';
import { setUserData } from './store/actions';
import "../src/assets/index.less";

// The setup function that will be called by the parent application
export const setup = (containerId, params) => {
  // Validate container ID
  if (!containerId) {
    console.error('Container ID is required');
    return;
  }

  // Get the container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  // Create the Redux store
  const store = configureStore();
  
  // Initialize with user data
  if (params && typeof params === 'object') {
    store.dispatch(setUserData({
      username: params.username || '',
      age: params.age || null
    }));
  }

  // Create root and render
  const root = createRoot(container);
  root.render(<App store={store} />);

  // Return an API for the parent application
  return {
    // Method to update user data
    updateUserData: (newParams) => {
      if (newParams && typeof newParams === 'object') {
        store.dispatch(setUserData({
          username: newParams.username || store.getState().username,
          age: newParams.age || store.getState().age
        }));
      }
    },
    // Method to unmount the component
    unmount: () => {
      root.unmount();
    }
  };
};

// Default export for the setup function
export default { setup };