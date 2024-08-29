import * as admin from "firebase-admin";

// Initialize Firebase Admin with service account credentials and bucket (for stoarge)
admin.initializeApp({
	credential: admin.credential.cert(
		require("../../assets/firebase (leia o readme)/shopperfirebase.json"),
	),
	storageBucket: "shopperbackend-7acbd.appspot.com",
});

// Export Firebase Storage
export const firebaseStorage = admin.storage();
