import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/storage';

import { FIREBASE_CONFIG } from './_config'

firebase.initializeApp(FIREBASE_CONFIG);

export const firestore = firebase.firestore();
export const firebaseStorage = firebase.storage();
