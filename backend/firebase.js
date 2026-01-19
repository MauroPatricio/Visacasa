
import admin from 'firebase-admin';

import serviceAccount from './firebase-visacasa.js';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;