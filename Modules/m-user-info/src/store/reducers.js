// Initial state based on the setup parameters
const initialState = {
    username: '',
    age: null
  };
  
  // Main reducer
  const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER_DATA':
        return {
          ...state,
          username: action.payload.username,
          age: action.payload.age
        };
      default:
        return state;
    }
  };
  
  export default rootReducer;