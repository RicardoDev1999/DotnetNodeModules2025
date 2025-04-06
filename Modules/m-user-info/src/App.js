import React, { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';

// Lazy-load the UserInfo component
const LazyUserInfo = lazy(() => import('./components/UserInfo'));

const App = ({ store }) => {
  return (
    <Provider store={store}>
      <div className="app-container">
        {/* The Suspense component shows the fallback while LazyUserInfo loads */}
        <Suspense fallback={<div>Loading User Info...</div>}>
          <LazyUserInfo />
        </Suspense>
      </div>
    </Provider>
  );
};

export default App;
