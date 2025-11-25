import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { storage } from "./storage";

// Load Firebase config from environment variables
function getFirebaseConfig() {
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
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
    db = getDatabase(firebaseApp);
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
    const productsRef = ref(db, "products");
    const productsSnapshot = await get(productsRef);
    const existingProducts = await storage.getAllProducts();
    const existingCodes = new Set(existingProducts.map(p => p.code));
    
    if (productsSnapshot.exists()) {
      const productsData = productsSnapshot.val();
      for (const [key, data] of Object.entries(productsData)) {
        const productData = data as any;
        const productCode = productData.code || key;
        
        // Skip if already exists
        if (existingCodes.has(productCode)) {
          console.log(`Skipping duplicate product: ${productCode}`);
          continue;
        }
        
        try {
          await storage.createProduct({
            code: productCode,
            name: productData.name || productData.productName || "Unknown Product",
            category: productData.category || "General",
            unit: productData.unit || "pieces",
          });
          productsCount++;
        } catch (error) {
          console.error(`Error migrating product ${key}:`, error);
        }
      }
    }

    // Migrate Locations (with deduplication)
    const locationsRef = ref(db, "locations");
    const locationsSnapshot = await get(locationsRef);
    const existingLocations = await storage.getAllLocations();
    const existingLocationNames = new Set(existingLocations.map(l => l.name));
    
    if (locationsSnapshot.exists()) {
      const locationsData = locationsSnapshot.val();
      for (const [key, data] of Object.entries(locationsData)) {
        const locationData = data as any;
        const locationName = locationData.name || key;
        
        // Skip if already exists
        if (existingLocationNames.has(locationName)) {
          console.log(`Skipping duplicate location: ${locationName}`);
          continue;
        }
        
        try {
          await storage.createLocation({
            name: locationName,
            address: locationData.address || "",
          });
          locationsCount++;
        } catch (error) {
          console.error(`Error migrating location ${key}:`, error);
        }
      }
    }

    // Migrate Transfers (idempotent - always import, storage handles deduplication)
    const transfersRef = ref(db, "transfers");
    const transfersSnapshot = await get(transfersRef);
    
    if (transfersSnapshot.exists()) {
      const transfersData = transfersSnapshot.val();
      for (const [key, data] of Object.entries(transfersData)) {
        const transferData = data as any;
        try {
          await storage.createTransfer({
            fromLocationId: transferData.fromLocationId || transferData.fromLocation || "unknown",
            toLocationId: transferData.toLocationId || transferData.toLocation || "unknown",
            driverName: transferData.driverName || transferData.driver || "Unknown Driver",
            vehicleReg: transferData.vehicleReg || transferData.vehicle || "N/A",
            status: transferData.status || "pending",
            items: transferData.items || transferData.products || [],
            createdBy: transferData.createdBy || "migration",
            dispatchedBy: transferData.dispatchedBy,
            dispatchedAt: transferData.dispatchedAt ? new Date(transferData.dispatchedAt.seconds * 1000) : undefined,
            receivedBy: transferData.receivedBy,
            receivedAt: transferData.receivedAt ? new Date(transferData.receivedAt.seconds * 1000) : undefined,
            shortages: transferData.shortages || [],
            damages: transferData.damages || [],
          });
          transfersCount++;
        } catch (error) {
          console.error(`Error migrating transfer ${key}:`, error);
        }
      }
    }

    // Migrate Users (with deduplication by email)
    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);
    const existingUsers = await storage.getAllUsers();
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    if (usersSnapshot.exists()) {
      const usersData = usersSnapshot.val();
      for (const [key, data] of Object.entries(usersData)) {
        const userData = data as any;
        const userEmail = userData.email || `${key}@fairfield.com`;
        
        // Skip if already exists
        if (existingEmails.has(userEmail)) {
          console.log(`Skipping duplicate user: ${userEmail}`);
          continue;
        }
        
        try {
          await storage.createUser({
            email: userEmail,
            name: userData.name || userData.displayName || key,
            role: userData.role || "view_only",
            permissions: userData.permissions || [],
            active: userData.active !== false,
          });
          usersCount++;
        } catch (error) {
          console.error(`Error migrating user ${key}:`, error);
        }
      }
    }

    return { productsCount, locationsCount, transfersCount, usersCount };
  } catch (error) {
    console.error("Firebase migration error:", error);
    throw error;
  }
}
