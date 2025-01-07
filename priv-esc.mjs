/**
 * @file Minimal example reproducing access to all env vars, and privilege escalation
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Connect to the emulator per https://firebase.google.com/docs/emulator-suite/connect_firestore#admin_sdks or https://cloud.google.com/firestore/docs/emulator#server_client_libraries
process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';
// Initialize Cloud Firestore per https://firebase.google.com/docs/firestore/quickstart#initialize -> Node.js -> Initialize on your own server
console.log('Calling initializeApp()...');
initializeApp();
console.log('Calling getFirestore()...');
const db = getFirestore();
console.log('Creating ref getFirestore()...');
const resultsRef = db.collection('testdocs');
console.log('Full env access, attempt to call /bin/sh...');
const resultsSnapshot = await resultsRef.get();
console.log(resultsSnapshot.docs.length);
