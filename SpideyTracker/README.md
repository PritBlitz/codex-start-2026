# SpideyTracker

Spider-Man sighting tracking website (**Fan-made / Unofficial** reference site).

An interactive map compiling global Spider-Man sighting intelligence, supporting user registration, posting sightings (including photo uploads), saving favorites, and sharing community updates.

## Features

- 🗺️ Interactive Map (Mapbox integration): Sighting point rendering, radar sensing, point popup tracking.
- 👤 User System: Email verification code registration, login (JWT + httpOnly Cookie).
- 📍 Post Sightings: Select point on map, rumored/confirmed types, up to 6 photos.
- ⭐ Favorites and "My Records" management.
- 💬 Community Panel: Sighting timeline, posting entry.
- 📜 Activity log, about/disclaimer page.

## Tech Stack

- **Backend**: Node.js + Express + MySQL 8
- **Frontend**: Vanilla JS + Mapbox GL JS adapter
- **Deployment**: Docker Compose (App container)

## Running Locally

```bash
# 1. Prepare MySQL 8, create .env (refer to template)
# 2. Install dependencies and start
npm install
node server/server.js
# Access at http://127.0.0.1:8899
```

> Email verification codes are printed to the server console during local development.

## Docker Deployment

```bash
tar -xzf spidey-tracker-deploy.tar.gz
cd spidey-tracker-deploy
./install.sh   # Auto-build App container
# Access at http://SERVER_IP:8899
```

## Directory Structure

```
server/             # Express backend (API, Auth, Uploads)
spideytracker.net/  # Frontend site (Pages, Scripts, Styles)
deploy/             # Docker deployment configs and export tools
```

## Disclaimer

This site is a fan-made mirror site created by Spider-Man movie fans, strictly for learning and entertainment purposes. It has no affiliation or sponsorship with Marvel, Sony Pictures, or their associated companies. All assets are copyrighted by their respective owners.
