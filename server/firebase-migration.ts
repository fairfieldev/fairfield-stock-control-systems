import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { storage } from "./storage";

// Load Firebase config from environment variables
function getFirebaseConfig() {
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };
}

let firebaseApp: any;
let db: any;

function initializeFirebase() {
  if (!firebaseApp) {
    const config = getFirebaseConfig();
    
    // Validate that we have the minimum required config
    if (!config.apiKey || !config.projectId) {
      throw new Error("Firebase configuration is incomplete. Please set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables.");
    }
    
    firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp);
  }
  return db;
}

export async function migrateFirebaseData(): Promise<{
  productsCount: number;
  locationsCount: number;
  transfersCount: number;
  usersCount: number;
}> {
  const db = initializeFirebase();
  
  let productsCount = 0;
  let locationsCount = 0;
  let transfersCount = 0;
  let usersCount = 0;

  try {
    // Migrate Products (with deduplication)
    const productsSnapshot = await getDocs(collection(db, "products"));
    const existingProducts = await storage.getAllProducts();
    const existingCodes = new Set(existingProducts.map(p => p.code));
    
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      const productCode = data.code || doc.id;
      
      // Skip if already exists
      if (existingCodes.has(productCode)) {
        console.log(`Skipping duplicate product: ${productCode}`);
        continue;
      }
      
      try {
        await storage.createProduct({
          code: productCode,
          name: data.name || data.productName || "Unknown Product",
          category: data.category || "General",
          unit: data.unit || "pieces",
        });
        productsCount++;
      } catch (error) {
        console.error(`Error migrating product ${doc.id}:`, error);
      }
    }

    // Migrate Locations (with deduplication)
    const locationsSnapshot = await getDocs(collection(db, "locations"));
    const existingLocations = await storage.getAllLocations();
    const existingLocationNames = new Set(existingLocations.map(l => l.name));
    
    for (const doc of locationsSnapshot.docs) {
      const data = doc.data();
      const locationName = data.name || doc.id;
      
      // Skip if already exists
      if (existingLocationNames.has(locationName)) {
        console.log(`Skipping duplicate location: ${locationName}`);
        continue;
      }
      
      try {
        await storage.createLocation({
          name: locationName,
          address: data.address || "",
        });
        locationsCount++;
      } catch (error) {
        console.error(`Error migrating location ${doc.id}:`, error);
      }
    }

    // Migrate Transfers (idempotent - always import, storage handles deduplication)
    const transfersSnapshot = await getDocs(collection(db, "transfers"));
    for (const doc of transfersSnapshot.docs) {
      const data = doc.data();
      try {
        await storage.createTransfer({
          fromLocationId: data.fromLocationId || data.fromLocation || "unknown",
          toLocationId: data.toLocationId || data.toLocation || "unknown",
          driverName: data.driverName || data.driver || "Unknown Driver",
          vehicleReg: data.vehicleReg || data.vehicle || "N/A",
          status: data.status || "pending",
          items: data.items || data.products || [],
          createdBy: data.createdBy || "migration",
          dispatchedBy: data.dispatchedBy,
          dispatchedAt: data.dispatchedAt ? new Date(data.dispatchedAt.seconds * 1000) : undefined,
          receivedBy: data.receivedBy,
          receivedAt: data.receivedAt ? new Date(data.receivedAt.seconds * 1000) : undefined,
          shortages: data.shortages || [],
          damages: data.damages || [],
        });
        transfersCount++;
      } catch (error) {
        console.error(`Error migrating transfer ${doc.id}:`, error);
      }
    }

    // Migrate Users (with deduplication by email)
    const usersSnapshot = await getDocs(collection(db, "users"));
    const existingUsers = await storage.getAllUsers();
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const userEmail = data.email || `${doc.id}@fairfield.com`;
      
      // Skip if already exists
      if (existingEmails.has(userEmail)) {
        console.log(`Skipping duplicate user: ${userEmail}`);
        continue;
      }
      
      try {
        await storage.createUser({
          email: userEmail,
          name: data.name || data.displayName || doc.id,
          role: data.role || "view_only",
          permissions: data.permissions || [],
          active: data.active !== false,
        });
        usersCount++;
      } catch (error) {
        console.error(`Error migrating user ${doc.id}:`, error);
      }
    }

    return { productsCount, locationsCount, transfersCount, usersCount };
  } catch (error) {
    console.error("Firebase migration error:", error);
    throw error;
  }
}
