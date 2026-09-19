// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  initializeFirestore,
  memoryLocalCache, // ใช้ Memory Cache แทนเพื่อลดปัญหา Assertion Failed ในเบราว์เซอร์
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBV7wfLbozLaCunnCzI-9Vx41LfjTULSbw',
  authDomain: 'hsk12345-6e2e8.firebaseapp.com',
  projectId: 'hsk12345-6e2e8',
  storageBucket: 'hsk12345-6e2e8.firebasestorage.app',
  messagingSenderId: '888331545701',
  appId: '1:888331545701:web:ab9215d7797b5f0f6c6a8c',
  measurementId: 'G-QGNG3W266P',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// แก้ไขปัญหา Internal Assertion Failed โดยการใช้ memoryLocalCache
// วิธีนี้จะช่วยให้ SDK ไม่พยายามไปยุ่งกับ IndexedDB ของเบราว์เซอร์ที่มีปัญหาเรื่อง Symbol
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;
