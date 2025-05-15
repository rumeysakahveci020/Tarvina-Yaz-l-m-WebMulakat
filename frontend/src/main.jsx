// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux'; // GEÇİCİ YORUMA AL
// import { store } from './app/store.js';  // GEÇİCİ YORUMA AL
import App from './App.jsx';
// import './index.css'; // BUNU DA GEÇİCİ YORUMA AL

console.log("main.jsx çalışmaya başladı.");

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log("Root element (#root) bulundu.");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        {/* <Provider store={store}> */}
          <App />
        {/* </Provider> */}
      </React.StrictMode>
    );
    console.log("ReactDOM.render çağrıldı.");
  } catch (error) {
    console.error("ReactDOM.render sırasında HATA:", error);
    // ...
  }
} else {
  console.error("KRİTİK HATA: #root elementi DOM'da bulunamadı!");
  // ...
}