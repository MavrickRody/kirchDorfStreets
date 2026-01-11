import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with database in production)
interface User {
  id: string;
  username: string;
  email?: string;
  password: string;
  points: number;
  level: string;
  parkingCount: number;
  currentParkingSpot?: string;
  createdAt: Date;
}

interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: 'free' | 'paid' | 'resident' | 'disabled';
  price?: string;
  hours?: string;
  available: boolean;
  lastUpdated: Date;
  occupiedBy?: string;
  rating?: number;
  capacity?: number;
}

const users: Map<string, User> = new Map();
const parkingSpots: Map<string, ParkingSpot> = new Map();

// Initialize sample parking spots
const initParkingSpots = () => {
  const spots: ParkingSpot[] = [
    {
      id: '1',
      name: 'Kirchdorfer Straße 45',
      address: 'Kirchdorfer Straße 45, 21109 Hamburg',
      coordinates: [53.4851, 10.0189],
      type: 'free',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'Höpenstraße Parkplatz',
      address: 'Höpenstraße 20, 21109 Hamburg',
      coordinates: [53.4838, 10.0170],
      type: 'paid',
      price: '1.50€/h',
      hours: 'Mo-Sa 8:00-20:00',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '3',
      name: 'Am Neuengammer Stichkanal',
      address: 'Am Neuengammer Stichkanal, 21109 Hamburg',
      coordinates: [53.4829, 10.0195],
      type: 'free',
      available: false,
      lastUpdated: new Date(),
    },
    {
      id: '4',
      name: 'Kirchdorfer Damm 12',
      address: 'Kirchdorfer Damm 12, 21109 Hamburg',
      coordinates: [53.4863, 10.0175],
      type: 'resident',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '5',
      name: 'Behindertenparkplatz Mengestraße',
      address: 'Mengestraße 15, 21109 Hamburg',
      coordinates: [53.4842, 10.0203],
      type: 'disabled',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '6',
      name: 'Rotenhäuser Damm Parkplatz',
      address: 'Rotenhäuser Damm 30, 21109 Hamburg',
      coordinates: [53.4825, 10.0167],
      type: 'paid',
      price: '2.00€/h',
      hours: 'Mo-So 0:00-24:00',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '7',
      name: 'Veringstraße 22',
      address: 'Veringstraße 22, 21109 Hamburg',
      coordinates: [53.4855, 10.0210],
      type: 'free',
      available: true,
      lastUpdated: new Date(),
    },
    {
      id: '8',
      name: 'Dratelnstraße Parkplatz',
      address: 'Dratelnstraße 8, 21109 Hamburg',
      coordinates: [53.4870, 10.0192],
      type: 'free',
      available: false,
      lastUpdated: new Date(),
    },
  ];

  spots.forEach(spot => parkingSpots.set(spot.id, spot));
};

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Hamburg ParkFinder API is running' });
});

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      points: 0,
      level: 'Beginner',
      parkingCount: 0,
      createdAt: new Date(),
    };

    users.set(user.id, user);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        parkingCount: user.parkingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = Array.from(users.values()).find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        parkingCount: user.parkingCount,
        currentParkingSpot: user.currentParkingSpot,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req: any, res: Response) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    points: user.points,
    level: user.level,
    parkingCount: user.parkingCount,
    currentParkingSpot: user.currentParkingSpot,
  });
});

// Get all parking spots
app.get('/api/parking-spots', (req: Request, res: Response) => {
  const spots = Array.from(parkingSpots.values());
  res.json(spots);
});

// Get single parking spot
app.get('/api/parking-spots/:id', (req: Request, res: Response) => {
  const spot = parkingSpots.get(req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Parking spot not found' });
  }
  res.json(spot);
});

// Park at spot
app.post('/api/parking-spots/:id/park', authenticateToken, (req: any, res: Response) => {
  const spot = parkingSpots.get(req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Parking spot not found' });
  }

  if (!spot.available) {
    return res.status(400).json({ error: 'Parking spot not available' });
  }

  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.currentParkingSpot) {
    return res.status(400).json({ error: 'Already parked at another spot' });
  }

  spot.available = false;
  spot.occupiedBy = user.id;
  spot.lastUpdated = new Date();
  parkingSpots.set(spot.id, spot);

  user.points += 5;
  user.parkingCount += 1;
  user.currentParkingSpot = spot.id;
  users.set(user.id, user);

  res.json({ spot, user: { points: user.points, parkingCount: user.parkingCount } });
});

// Leave parking spot
app.post('/api/parking-spots/:id/leave', authenticateToken, (req: any, res: Response) => {
  const spot = parkingSpots.get(req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Parking spot not found' });
  }

  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.currentParkingSpot !== spot.id) {
    return res.status(400).json({ error: 'Not parked at this spot' });
  }

  spot.available = true;
  spot.occupiedBy = undefined;
  spot.lastUpdated = new Date();
  parkingSpots.set(spot.id, spot);

  user.points += 10;
  user.currentParkingSpot = undefined;
  users.set(user.id, user);

  res.json({ spot, user: { points: user.points } });
});

// Report parking spot status
app.post('/api/parking-spots/:id/report', authenticateToken, (req: any, res: Response) => {
  const { available } = req.body;
  const spot = parkingSpots.get(req.params.id);

  if (!spot) {
    return res.status(404).json({ error: 'Parking spot not found' });
  }

  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  spot.available = available;
  spot.lastUpdated = new Date();
  parkingSpots.set(spot.id, spot);

  user.points += 3;
  users.set(user.id, user);

  res.json({ spot, user: { points: user.points } });
});

// Initialize data and start server
initParkingSpots();

app.listen(PORT, () => {
  console.log(`🚗 Hamburg ParkFinder API running on http://localhost:${PORT}`);
  console.log(`📍 Serving Kirchdorf-Süd area (1km radius)`);
});

export default app;
