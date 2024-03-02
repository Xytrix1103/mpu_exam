import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
	apiKey: "AIzaSyC-pma9RYr2t9vGeg5Z5nX08A_tTlBfbmU",
	authDomain: "mpuexam-9ee76.firebaseapp.com",
	projectId: "mpuexam-9ee76",
	storageBucket: "mpuexam-9ee76.appspot.com",
	messagingSenderId: "660940980826",
	appId: "1:660940980826:web:eeb3484233901809a14e63",
	databaseURL: "https://mpuexam-9ee76-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);