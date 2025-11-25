import { storage } from "./storage";

// Use Firestore REST API
async function firestoreQuery(projectId: string, apiKey: string, collection: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  const response = await fetch(`${url}?key=${apiKey}`);
  
  if (!response.ok) {
    throw new Error(`Firestore query failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function migrateFirebaseData(): Promise<{
  productsCount: number;
  locationsCount: number;
  transfersCount: number;
  usersCount: number;
}> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!apiKey || !projectId) {
    throw new Error("Firebase API Key and Project ID are required");
  }
  
  let productsCount = 0;
  let locationsCount = 0;
  let transfersCount = 0;
  let usersCount = 0;

  try {
    // Migrate Products (with deduplication)
    const productsData = await firestoreQuery(projectId, apiKey, "products");
    const existingProducts = await storage.getAllProducts();
    const existingCodes = new Set(existingProducts.map(p => p.code));
    
    if (productsData.documents) {
      for (const doc of productsData.documents) {
        const fields = doc.fields || {};
        const productCode = fields.code?.stringValue || fields.code?.mapValue?.fields?.stringValue || doc.name.split('/').pop();
        
        // Skip if already exists
        if (existingCodes.has(productCode)) {
          console.log(`Skipping duplicate product: ${productCode}`);
          continue;
        }
        
        try {
          const name = fields.name?.stringValue || fields.productName?.stringValue || "Unknown Product";
          const category = fields.category?.stringValue || "General";
          const unit = fields.unit?.stringValue || "pieces";
          
          await storage.createProduct({
            code: productCode,
            name,
            category,
            unit,
          });
          productsCount++;
        } catch (error) {
          console.error(`Error migrating product:`, error);
        }
      }
    }

    // Migrate Locations (with deduplication)
    const locationsData = await firestoreQuery(projectId, apiKey, "locations");
    const existingLocations = await storage.getAllLocations();
    const existingLocationNames = new Set(existingLocations.map(l => l.name));
    
    if (locationsData.documents) {
      for (const doc of locationsData.documents) {
        const fields = doc.fields || {};
        const locationName = fields.name?.stringValue || doc.name.split('/').pop();
        
        // Skip if already exists
        if (existingLocationNames.has(locationName)) {
          console.log(`Skipping duplicate location: ${locationName}`);
          continue;
        }
        
        try {
          const address = fields.address?.stringValue || "";
          
          await storage.createLocation({
            name: locationName,
            address,
          });
          locationsCount++;
        } catch (error) {
          console.error(`Error migrating location:`, error);
        }
      }
    }

    // Migrate Transfers
    const transfersData = await firestoreQuery(projectId, apiKey, "transfers");
    
    if (transfersData.documents) {
      for (const doc of transfersData.documents) {
        const fields = doc.fields || {};
        
        try {
          const items = fields.items?.arrayValue?.values?.map((v: any) => ({
            productId: v.mapValue?.fields?.productId?.stringValue || "",
            productCode: v.mapValue?.fields?.productCode?.stringValue || "",
            productName: v.mapValue?.fields?.productName?.stringValue || "",
            quantity: parseInt(v.mapValue?.fields?.quantity?.integerValue || "0"),
            unit: v.mapValue?.fields?.unit?.stringValue || "",
          })) || [];
          
          await storage.createTransfer({
            fromLocationId: fields.fromLocationId?.stringValue || fields.fromLocation?.stringValue || "unknown",
            toLocationId: fields.toLocationId?.stringValue || fields.toLocation?.stringValue || "unknown",
            driverName: fields.driverName?.stringValue || fields.driver?.stringValue || "Unknown Driver",
            vehicleReg: fields.vehicleReg?.stringValue || fields.vehicle?.stringValue || "N/A",
            status: fields.status?.stringValue || "pending",
            items,
            createdBy: fields.createdBy?.stringValue || "migration",
            dispatchedBy: fields.dispatchedBy?.stringValue,
            dispatchedAt: fields.dispatchedAt?.timestampValue ? new Date(fields.dispatchedAt.timestampValue) : undefined,
            receivedBy: fields.receivedBy?.stringValue,
            receivedAt: fields.receivedAt?.timestampValue ? new Date(fields.receivedAt.timestampValue) : undefined,
            shortages: fields.shortages?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [],
            damages: fields.damages?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [],
          });
          transfersCount++;
        } catch (error) {
          console.error(`Error migrating transfer:`, error);
        }
      }
    }

    // Migrate Users (with deduplication by email)
    const usersData = await firestoreQuery(projectId, apiKey, "users");
    const existingUsers = await storage.getAllUsers();
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    if (usersData.documents) {
      for (const doc of usersData.documents) {
        const fields = doc.fields || {};
        const userEmail = fields.email?.stringValue || `${doc.name.split('/').pop()}@fairfield.com`;
        
        // Skip if already exists
        if (existingEmails.has(userEmail)) {
          console.log(`Skipping duplicate user: ${userEmail}`);
          continue;
        }
        
        try {
          const permissions = fields.permissions?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [];
          
          await storage.createUser({
            email: userEmail,
            name: fields.name?.stringValue || fields.displayName?.stringValue || doc.name.split('/').pop(),
            role: fields.role?.stringValue || "view_only",
            permissions,
            active: fields.active?.booleanValue !== false,
          });
          usersCount++;
        } catch (error) {
          console.error(`Error migrating user:`, error);
        }
      }
    }

    return { productsCount, locationsCount, transfersCount, usersCount };
  } catch (error) {
    console.error("Firebase migration error:", error);
    throw error;
  }
}
