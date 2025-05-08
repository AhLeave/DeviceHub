import { 
  users, type User, type InsertUser,
  tenants, type Tenant, type InsertTenant,
  devices, type Device, type InsertDevice,
  enrollmentTokens, type EnrollmentToken, type InsertEnrollmentToken
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByTenant(tenantId: number): Promise<User[]>;
  
  // Tenant methods
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getAllTenants(): Promise<Tenant[]>;
  
  // Device methods
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<Device>): Promise<Device | undefined>;
  getDevicesByTenant(tenantId: number): Promise<Device[]>;
  getDevicesByUser(userId: number): Promise<Device[]>;
  
  // Enrollment token methods
  createEnrollmentToken(token: InsertEnrollmentToken): Promise<EnrollmentToken>;
  getEnrollmentToken(token: string): Promise<EnrollmentToken | undefined>;
  markEnrollmentTokenUsed(id: number): Promise<EnrollmentToken | undefined>;
  getEnrollmentTokensByTenant(tenantId: number): Promise<EnrollmentToken[]>;
  
  // Session store
  sessionStore: any; // Using any for compatibility with express-session
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenants: Map<number, Tenant>;
  private devices: Map<number, Device>;
  private enrollmentTokens: Map<number, EnrollmentToken>;
  
  sessionStore: any; // Using any for compatibility with express-session
  
  currentUserId: number;
  currentTenantId: number;
  currentDeviceId: number;
  currentTokenId: number;

  constructor() {
    this.users = new Map();
    this.tenants = new Map();
    this.devices = new Map();
    this.enrollmentTokens = new Map();
    
    this.currentUserId = 1;
    this.currentTenantId = 1;
    this.currentDeviceId = 1;
    this.currentTokenId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with a demo tenant
    this.seedData();
  }

  private seedData() {
    // Create a demo tenant
    const tenant = {
      id: this.currentTenantId++,
      name: "Acme Corp",
      domain: "acme.com",
      plan: "business"
    } as Tenant;
    this.tenants.set(tenant.id, tenant);

    // Create admin user
    const adminUser = {
      id: this.currentUserId++,
      username: "admin",
      password: "password", // This will be hashed in real app
      email: "admin@acme.com",
      fullName: "John Doe",
      role: "admin",
      tenantId: tenant.id
    } as User;
    this.users.set(adminUser.id, adminUser);

    // Add some sample devices
    const devices: Partial<Device>[] = [
      {
        deviceId: "MD1024A87",
        name: "iPhone 13 Pro",
        model: "iPhone 13 Pro",
        platform: "ios",
        osVersion: "15.4",
        status: "online",
        lastSeen: new Date(),
        enrollmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        userId: adminUser.id,
        tenantId: tenant.id,
        compliance: "compliant"
      },
      {
        deviceId: "MD9387B21",
        name: "Samsung Galaxy S22",
        model: "Samsung Galaxy S22",
        platform: "android",
        osVersion: "12",
        status: "online",
        lastSeen: new Date(Date.now() - 10 * 60 * 1000),
        enrollmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        userId: adminUser.id,
        tenantId: tenant.id,
        compliance: "compliant"
      },
      {
        deviceId: "MD2458C39",
        name: "iPad Pro 12.9\"",
        model: "iPad Pro 12.9",
        platform: "ipados",
        osVersion: "15.4",
        status: "offline",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        enrollmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        userId: adminUser.id,
        tenantId: tenant.id,
        compliance: "compliant"
      },
      {
        deviceId: "MD7721D15",
        name: "Google Pixel 6",
        model: "Google Pixel 6",
        platform: "android",
        osVersion: "12",
        status: "warning",
        lastSeen: new Date(Date.now() - 35 * 60 * 1000),
        enrollmentDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        userId: adminUser.id,
        tenantId: tenant.id,
        compliance: "warning"
      }
    ];

    devices.forEach((device) => {
      const id = this.currentDeviceId++;
      const newDevice = {
        ...device,
        id
      } as Device;
      this.devices.set(newDevice.id, newDevice);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser = { ...user, id } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.tenantId === tenantId
    );
  }

  // Tenant methods
  async getTenant(id: number): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(
      (tenant) => tenant.domain === domain
    );
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const id = this.currentTenantId++;
    const newTenant = { ...tenant, id } as Tenant;
    this.tenants.set(id, newTenant);
    return newTenant;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  // Device methods
  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(
      (device) => device.deviceId === deviceId
    );
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const newDevice = { ...device, id } as Device;
    this.devices.set(id, newDevice);
    return newDevice;
  }

  async updateDevice(id: number, device: Partial<Device>): Promise<Device | undefined> {
    const existingDevice = this.devices.get(id);
    if (!existingDevice) return undefined;
    
    const updatedDevice = { ...existingDevice, ...device } as Device;
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async getDevicesByTenant(tenantId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.tenantId === tenantId
    );
  }

  async getDevicesByUser(userId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.userId === userId
    );
  }

  // Enrollment token methods
  async createEnrollmentToken(token: InsertEnrollmentToken): Promise<EnrollmentToken> {
    const id = this.currentTokenId++;
    const newToken = { ...token, id } as EnrollmentToken;
    this.enrollmentTokens.set(id, newToken);
    return newToken;
  }

  async getEnrollmentToken(token: string): Promise<EnrollmentToken | undefined> {
    return Array.from(this.enrollmentTokens.values()).find(
      (t) => t.token === token
    );
  }

  async markEnrollmentTokenUsed(id: number): Promise<EnrollmentToken | undefined> {
    const token = this.enrollmentTokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, used: true } as EnrollmentToken;
    this.enrollmentTokens.set(id, updatedToken);
    return updatedToken;
  }

  async getEnrollmentTokensByTenant(tenantId: number): Promise<EnrollmentToken[]> {
    return Array.from(this.enrollmentTokens.values()).filter(
      (token) => token.tenantId === tenantId
    );
  }
}

export const storage = new MemStorage();
