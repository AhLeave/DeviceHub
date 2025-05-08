import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { randomBytes } from "crypto";
import { insertEnrollmentTokenSchema, insertDeviceSchema } from "@shared/schema";

// Connected devices map: deviceId -> WebSocket
const connectedDevices = new Map<string, WebSocket>();

// User sessions map: userId -> Set of WebSocket connections
const userSessions = new Map<number, Set<WebSocket>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Parse auth token and identify if this is a device or admin connection
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const deviceId = url.searchParams.get('deviceId');
    const userId = url.searchParams.get('userId');
    
    if (deviceId) {
      // Device connection
      connectedDevices.set(deviceId, ws);
      
      // Update device status to online
      updateDeviceStatus(deviceId, 'online');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          handleDeviceMessage(deviceId, data);
        } catch (error) {
          console.error('Error handling device message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(`Device ${deviceId} disconnected`);
        connectedDevices.delete(deviceId);
        
        // Update device status to offline
        updateDeviceStatus(deviceId, 'offline');
      });
    } else if (userId) {
      // Admin/User connection
      const userIdNum = parseInt(userId, 10);
      
      if (!userSessions.has(userIdNum)) {
        userSessions.set(userIdNum, new Set());
      }
      
      userSessions.get(userIdNum)?.add(ws);
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          handleUserMessage(userIdNum, data);
        } catch (error) {
          console.error('Error handling user message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(`User ${userId} session disconnected`);
        userSessions.get(userIdNum)?.delete(ws);
        
        if (userSessions.get(userIdNum)?.size === 0) {
          userSessions.delete(userIdNum);
        }
      });
    }
  });

  // ---- API Routes ----
  
  // Get tenants
  app.get('/api/tenants', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get devices for tenant
  app.get('/api/devices', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.user as Express.User;
      const devices = await storage.getDevicesByTenant(user.tenantId);
      
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get device by ID
  app.get('/api/devices/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.user as Express.User;
      const deviceId = parseInt(req.params.id, 10);
      
      const device = await storage.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      if (device.tenantId !== user.tenantId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Create enrollment token
  app.post('/api/enrollment/token', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.user as Express.User;
      
      const tokenData = insertEnrollmentTokenSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        token: randomBytes(16).toString('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false
      });
      
      const token = await storage.createEnrollmentToken(tokenData);
      res.status(201).json(token);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Validate enrollment token
  app.get('/api/enrollment/validate/:token', async (req, res) => {
    try {
      const token = await storage.getEnrollmentToken(req.params.token);
      
      if (!token) {
        return res.status(404).json({ message: 'Token not found' });
      }
      
      if (token.used) {
        return res.status(400).json({ message: 'Token already used' });
      }
      
      if (new Date(token.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Token expired' });
      }
      
      res.json({ valid: true, platform: token.platform, tenantId: token.tenantId });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Enroll device
  app.post('/api/enrollment/enroll', async (req, res) => {
    try {
      const { token, device } = req.body;
      
      if (!token || !device) {
        return res.status(400).json({ message: 'Missing token or device data' });
      }
      
      const enrollmentToken = await storage.getEnrollmentToken(token);
      
      if (!enrollmentToken) {
        return res.status(404).json({ message: 'Token not found' });
      }
      
      if (enrollmentToken.used) {
        return res.status(400).json({ message: 'Token already used' });
      }
      
      if (new Date(enrollmentToken.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Token expired' });
      }
      
      const deviceData = insertDeviceSchema.parse({
        ...device,
        tenantId: enrollmentToken.tenantId,
        enrollmentDate: new Date(),
        lastSeen: new Date()
      });
      
      const newDevice = await storage.createDevice(deviceData);
      
      // Mark token as used
      await storage.markEnrollmentTokenUsed(enrollmentToken.id);
      
      res.status(201).json(newDevice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get users for tenant
  app.get('/api/users', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.user as Express.User;
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const users = await storage.getUsersByTenant(user.tenantId);
      
      // Remove password from response
      const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
      
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}

// Update device status in storage
async function updateDeviceStatus(deviceId: string, status: string) {
  try {
    const device = await storage.getDeviceByDeviceId(deviceId);
    
    if (device) {
      await storage.updateDevice(device.id, { 
        status, 
        lastSeen: new Date() 
      });
    }
  } catch (error) {
    console.error('Error updating device status:', error);
  }
}

// Handle messages from devices
function handleDeviceMessage(deviceId: string, data: any) {
  console.log(`Received message from device ${deviceId}:`, data);
  
  // TODO: Process device messages (status updates, etc.)
}

// Handle messages from users/admins
function handleUserMessage(userId: number, data: any) {
  console.log(`Received message from user ${userId}:`, data);
  
  if (data.type === 'remote_control' && data.deviceId) {
    const deviceWs = connectedDevices.get(data.deviceId);
    
    if (deviceWs && deviceWs.readyState === WebSocket.OPEN) {
      // Forward remote control command to device
      deviceWs.send(JSON.stringify({
        type: 'remote_control_command',
        command: data.command,
        params: data.params,
        userId: userId
      }));
    }
  }
}
