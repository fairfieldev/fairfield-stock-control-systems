import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Location,
  type InsertLocation,
  type Transfer,
  type InsertTransfer,
  type EmailSettings,
  type InsertEmailSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Locations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, data: Partial<Location>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;

  // Transfers
  getAllTransfers(): Promise<Transfer[]>;
  getTransfer(id: string): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  dispatchTransfer(id: string, dispatchedBy: string): Promise<Transfer>;
  receiveTransfer(
    id: string,
    data: {
      receivedBy: string;
      shortages?: any[];
      damages?: any[];
    }
  ): Promise<Transfer>;

  // Email Settings
  getEmailSettings(): Promise<EmailSettings | undefined>;
  saveEmailSettings(settings: InsertEmailSettings): Promise<EmailSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private locations: Map<string, Location>;
  private transfers: Map<string, Transfer>;
  private emailSettings: EmailSettings | undefined;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.locations = new Map();
    this.transfers = new Map();
    this.emailSettings = undefined;

    // Create default test users
    this.createUser({
      email: "admin@fairfield.com",
      name: "Admin User",
      role: "admin",
      permissions: [
        "dashboard",
        "products",
        "locations",
        "new-transfer",
        "dispatch",
        "receive",
        "all-transfers",
        "reports",
        "users",
        "integration",
      ],
      active: true,
    });

    this.createUser({
      email: "dispatch@fairfield.com",
      name: "Dispatch User",
      role: "dispatch",
      permissions: [
        "dashboard",
        "products",
        "locations",
        "new-transfer",
        "dispatch",
        "all-transfers",
      ],
      active: true,
    });

    this.createUser({
      email: "receiver@fairfield.com",
      name: "Receiver User",
      role: "receiver",
      permissions: [
        "dashboard",
        "products",
        "locations",
        "receive",
        "all-transfers",
      ],
      active: true,
    });

    this.createUser({
      email: "viewer@fairfield.com",
      name: "View Only User",
      role: "view_only",
      permissions: [
        "dashboard",
        "all-transfers",
      ],
      active: true,
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");

    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");

    const updated = { ...product, ...data };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  // Locations
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const location: Location = {
      ...insertLocation,
      id,
      createdAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    const location = this.locations.get(id);
    if (!location) throw new Error("Location not found");

    const updated = { ...location, ...data };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: string): Promise<void> {
    this.locations.delete(id);
  }

  // Transfers
  async getAllTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values());
  }

  async getTransfer(id: string): Promise<Transfer | undefined> {
    return this.transfers.get(id);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = `TRF-${Date.now()}-${randomUUID().slice(0, 4).toUpperCase()}`;
    const transfer: Transfer = {
      ...insertTransfer,
      id,
      createdAt: new Date(),
    };
    this.transfers.set(id, transfer);
    return transfer;
  }

  async dispatchTransfer(id: string, dispatchedBy: string): Promise<Transfer> {
    const transfer = this.transfers.get(id);
    if (!transfer) throw new Error("Transfer not found");

    const updated: Transfer = {
      ...transfer,
      status: "in_transit",
      dispatchedBy,
      dispatchedAt: new Date(),
    };
    this.transfers.set(id, updated);
    return updated;
  }

  async receiveTransfer(
    id: string,
    data: {
      receivedBy: string;
      shortages?: any[];
      damages?: any[];
    }
  ): Promise<Transfer> {
    const transfer = this.transfers.get(id);
    if (!transfer) throw new Error("Transfer not found");

    const updated: Transfer = {
      ...transfer,
      status: "received",
      receivedBy: data.receivedBy,
      receivedAt: new Date(),
      shortages: data.shortages || [],
      damages: data.damages || [],
    };
    this.transfers.set(id, updated);
    return updated;
  }

  // Email Settings
  async getEmailSettings(): Promise<EmailSettings | undefined> {
    return this.emailSettings;
  }

  async saveEmailSettings(settings: InsertEmailSettings): Promise<EmailSettings> {
    this.emailSettings = {
      ...settings,
      id: "default",
      configured: true,
      updatedAt: new Date(),
    };
    return this.emailSettings;
  }
}

export const storage = new MemStorage();
