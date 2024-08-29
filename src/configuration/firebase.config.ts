import * as admin from "firebase-admin";

admin.initializeApp({
	credential: admin.credential.cert(
		require("../../assets/shopperfirebase.json"),
	),
	storageBucket: "shopperbackend-7acbd.appspot.com",
});

export const firebaseStorage = admin.storage();
