import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendOrderFulfillmentEmail } from "./email-service";
import { migrateFirebaseData } from "./firebase-migration";
import type { InsertProduct, InsertLocation, InsertTransfer, InsertUser, InsertEmailSettings } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.active) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // For demo purposes, accept "password" or "Password123" for all users
      // In production, this would verify against hashed passwords in the database
      if (password !== "password" && password !== "Password123") {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data: InsertProduct = req.body;
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const product = await storage.updateProduct(id, data);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const data: InsertLocation = req.body;
      const location = await storage.createLocation(data);
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const location = await storage.updateLocation(id, data);
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLocation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  // Transfers
  app.get("/api/transfers", async (req, res) => {
    try {
      const transfers = await storage.getAllTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", async (req, res) => {
    try {
      const data: InsertTransfer = req.body;
      const transfer = await storage.createTransfer(data);
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transfer" });
    }
  });

  app.patch("/api/transfers/:id/dispatch", async (req, res) => {
    try {
      const { id } = req.params;
      const transfer = await storage.dispatchTransfer(id, "current-user"); // Will be replaced with actual user
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: "Failed to dispatch transfer" });
    }
  });

  app.patch("/api/transfers/:id/receive", async (req, res) => {
    try {
      const { id } = req.params;
      const { shortages, damages } = req.body;
      const transfer = await storage.receiveTransfer(id, {
        receivedBy: "current-user", // Will be replaced with actual user
        shortages: shortages || [],
        damages: damages || [],
      });

      // Send email notification
      try {
        const emailSettings = await storage.getEmailSettings();
        if (emailSettings?.configured) {
          const locations = await storage.getAllLocations();
          const fromLocation = locations.find(l => l.id === transfer.fromLocationId);
          const toLocation = locations.find(l => l.id === transfer.toLocationId);

          await sendOrderFulfillmentEmail({
            transfer,
            fromLocation: fromLocation?.name || transfer.fromLocationId,
            toLocation: toLocation?.name || transfer.toLocationId,
            recipientEmail: emailSettings.recipientEmail,
          });
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the request if email fails
      }

      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: "Failed to receive transfer" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data: InsertUser = req.body;
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = await storage.updateUser(id, data);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Email Settings
  app.get("/api/email-settings", async (req, res) => {
    try {
      const settings = await storage.getEmailSettings();
      res.json(settings || { configured: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  app.post("/api/email-settings", async (req, res) => {
    try {
      const data: InsertEmailSettings = req.body;
      
      // Determine if configured based on provider
      let configured = false;
      if (data.provider === "gmail") {
        configured = !!data.recipientEmail && !!data.smtpUsername && !!data.smtpPassword;
      } else if (data.provider === "sendgrid" || data.provider === "resend") {
        configured = !!data.recipientEmail && !!data.apiKey;
      } else if (data.provider === "smtp") {
        configured = !!data.recipientEmail && !!data.smtpHost && !!data.smtpUsername && !!data.smtpPassword;
      }
      
      const settings = await storage.saveEmailSettings({
        ...data,
        configured,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save email settings" });
    }
  });

  app.post("/api/email-settings/test", async (req, res) => {
    try {
      const settings = await storage.getEmailSettings();
      if (!settings?.configured) {
        return res.status(400).json({ error: "Email not configured" });
      }

      // Send test email
      await sendOrderFulfillmentEmail({
        transfer: {
          id: "TEST-001",
          fromLocationId: "test-from",
          toLocationId: "test-to",
          driverName: "Test Driver",
          vehicleReg: "TEST-123",
          status: "received",
          items: [{
            productId: "test-product",
            productCode: "TEST-001",
            productName: "Test Product",
            quantity: 10,
            unit: "pieces",
          }],
          shortages: [],
          damages: [],
          createdBy: "system",
          createdAt: new Date(),
        },
        fromLocation: "Test Warehouse",
        toLocation: "Test Branch",
        recipientEmail: settings.recipientEmail,
        isTest: true,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send test email" });
    }
  });

  // Data migration endpoint - automatically fetch from Firebase
  app.post("/api/migrate-firebase-data", async (req, res) => {
    try {
      const result = await migrateFirebaseData();
      res.json({
        success: true,
        message: "Data migrated successfully from Firebase",
        stats: result,
      });
    } catch (error) {
      console.error("Migration error:", error);
      res.status(500).json({ error: "Failed to migrate data from Firebase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
