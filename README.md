# 🚗 Hamburg ParkFinder - Kirchdorf-Süd

A community-powered, real-time parking availability app for Hamburg's Kirchdorf-Süd neighborhood. Users become both consumers and contributors of parking data, creating a cooperative ecosystem where everyone helps each other find parking.

## 🎯 Features

### Core Functionality
- **Interactive Map** - Real-time visualization of parking spots using Leaflet/OpenStreetMap
- **User-Powered Updates** - Check in/out of parking spots to update availability in real-time
- **GeoJSON Support** - Upload custom parking zone data with drag & drop
- **Bilingual** - Full German and English language support
- **Gamification** - Earn points for parking actions and helping the community

### Key Features
✅ Real-time parking spot availability
✅ Multiple parking types (Free, Paid, Resident, Disabled)
✅ Check-in/Check-out system with geolocation
✅ Community reporting for spot status
✅ Points & rewards system
✅ GeoJSON layer management
✅ Responsive design for mobile/desktop
✅ User profiles and statistics

## 🗺️ Coverage Area

**Location:** Kirchdorf-Süd, Hamburg, Germany
**Coordinates:** 53.484574, 10.018416
**Radius:** 1 kilometer

## 🏗️ Architecture

```
hamburg-parkfinder/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types.ts      # TypeScript types
│   │   ├── translations.ts # i18n support
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   └── server.ts    # REST API
│   └── package.json
└── package.json       # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/kirchDorfStreets.git
cd kirchDorfStreets
```

2. **Install dependencies**
```bash
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend (React app)
- Backend (Express API)

### Development

**Run both frontend and backend concurrently:**
```bash
npm run dev
```

**Or run them separately:**

Frontend (http://localhost:3000):
```bash
npm run dev:frontend
```

Backend API (http://localhost:5000):
```bash
npm run dev:backend
```

### Build for Production

```bash
npm run build
```

## 📱 Usage

### Login
- Use any username and password (demo mode)
- In production, implement proper authentication

### Find Parking
1. View the interactive map centered on Kirchdorf-Süd
2. Green markers = Available spots
3. Red markers = Occupied spots
4. Click on any marker or list item to see details

### Park Your Car
1. Select an available parking spot
2. Click "Hier parken" (Park Here)
3. Earn +5 points

### Leave a Parking Spot
1. When parked, click "Verlassen" (Leave)
2. The spot becomes available for others
3. Earn +10 points

### Report Spot Status
- Help the community by reporting if a spot is free or occupied
- Earn +3 points per report

### Upload GeoJSON
1. Click the "GeoJSON" button in the header
2. Drag & drop your parking data file
3. Supported formats: `.geojson` or `.json`
4. The map will automatically display your zones and spots

### Manage Layers
1. Open menu (☰)
2. Click "Ebenen verwalten" (Manage Layers)
3. Toggle visibility or remove uploaded layers

## 📊 GeoJSON Format

Your GeoJSON file should follow this structure:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[10.018, 53.484], [10.019, 53.484], ...]]
      },
      "properties": {
        "name": "Kirchdorfer Straße Parking",
        "type": "paid",
        "price": "1.50€/h",
        "hours": "Mo-Sa 8:00-20:00",
        "capacity": 50
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [10.018416, 53.484574]
      },
      "properties": {
        "name": "Disabled Parking Spot",
        "type": "disabled"
      }
    }
  ]
}
```

### Supported Properties
- `name` - Location name
- `type` - Parking type: `free`, `paid`, `resident`, `disabled`
- `price` - Pricing info (e.g., "1.50€/h")
- `hours` - Operating hours (e.g., "Mo-Sa 8:00-20:00")
- `capacity` - Number of spots
- `description` - Additional info

## 🎮 Gamification System

| Action | Points |
|--------|--------|
| Park at a spot | +5 |
| Leave a spot | +10 |
| Report spot status | +3 |

### Levels
- **Beginner**: 0-50 points
- **Community Helper**: 51-200 points
- **Parking Pro**: 201-500 points
- **Parking Master**: 501+ points

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Parking Spots
- `GET /api/parking-spots` - Get all spots
- `GET /api/parking-spots/:id` - Get specific spot
- `POST /api/parking-spots/:id/park` - Park at spot
- `POST /api/parking-spots/:id/leave` - Leave spot
- `POST /api/parking-spots/:id/report` - Report spot status

## 🌐 Language Support

Toggle between German (DE) and English (EN) using the 🌐 button in the header.

All UI text is fully translated including:
- Login screen
- Navigation
- Buttons and actions
- Notifications
- Map popups

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📈 Future Enhancements

- [ ] Persistent database (PostgreSQL/MongoDB)
- [ ] Real user authentication with email verification
- [ ] Push notifications for nearby available spots
- [ ] Predictive availability based on historical data
- [ ] Integration with Hamburg's official parking APIs
- [ ] Photo upload for parking spots
- [ ] User ratings and reviews
- [ ] Spot reservation system
- [ ] Mobile apps (React Native)
- [ ] Admin dashboard

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Created for Hamburg's Kirchdorf-Süd community

## 🙏 Acknowledgments

- OpenStreetMap contributors
- Hamburg Open Data Portal (transparenz.hamburg.de)
- Leaflet.js community
- React community

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Made with ❤️ for Hamburg's Kirchdorf-Süd neighborhood**
