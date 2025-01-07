/**
 * @file Dump all documents from a test collection, with their creation timestamps.
 * WHERE are these documents stored? They don't show up in the Firestore emulator GUI at http://127.0.0.1:4000/firestore
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

for (const envVar of [
  'FIREBASE_CONFIG',  // env var listed at https://firebase.google.com/docs/admin/setup#initialize-sdk
  'GOOGLE_APPLICATION_CREDENTIALS',  // env var listed at https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
  'GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT'  // observed access while debugging with Deno
])
  console.log(`${envVar}:`, process.env[envVar]);  // all undefined

// Connect to the emulator per https://firebase.google.com/docs/emulator-suite/connect_firestore#admin_sdks or https://cloud.google.com/firestore/docs/emulator#server_client_libraries
process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';
// Initialize Cloud Firestore per https://firebase.google.com/docs/firestore/quickstart#initialize -> Node.js -> Initialize on your own server
console.log('Calling initializeApp()...');
initializeApp();
console.log('Calling getFirestore()...');
const db = getFirestore();
// Running the run line below triggers "INTERNAL ERROR: Client is not yet ready to issue requests"
// console.log('Where was this project ID picked up from?', db.projectId);  // .projectId is an undocumented field but a getter shows up in the debugger

const collName = 'testdocs';

const resultsRef = db.collection(collName);
const resultsSnapshot = await resultsRef.get();
const documents = resultsSnapshot.docs.map(doc => ({
  createTime: doc.createTime.toDate().toISOString(),
  ...doc.data(),
  path: doc.ref.path
}));

console.log(`Documents in collection ${collName}:`, documents);

console.log('Adding a document...');
await resultsRef.add({
  addedFrom: 'Firebase Admin SDK (tests)',
});

console.log('Done. Exiting (takes a while)...');
