import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const METRICS_FILE = path.join(__dirname, '../data/metrics.json');

export class MetricsService {
  constructor() {
    this.liveOnlineUsers = 0;
    this.totalRoundsPlayed = 0;
    this.totalMatchesPlayed = 0;
    this.activeRoomsCount = 0;
    this.loadMetrics();
  }

  loadMetrics() {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
        this.totalRoundsPlayed = typeof data.totalRoundsPlayed === 'number' ? data.totalRoundsPlayed : 0;
        this.totalMatchesPlayed = typeof data.totalMatchesPlayed === 'number' ? data.totalMatchesPlayed : 0;
      }
    } catch (e) {
      console.warn('Metrics file could not be read, using in-memory baseline', e.message);
    }
  }

  saveMetrics() {
    try {
      const dir = path.dirname(METRICS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(METRICS_FILE, JSON.stringify({
        totalRoundsPlayed: this.totalRoundsPlayed,
        totalMatchesPlayed: this.totalMatchesPlayed,
        lastUpdated: new Date().toISOString()
      }, null, 2));
    } catch (e) {
      console.warn('Could not save metrics to disk:', e.message);
    }
  }

  userConnected() {
    this.liveOnlineUsers++;
    return this.getGlobalStats();
  }

  userDisconnected() {
    this.liveOnlineUsers = Math.max(0, this.liveOnlineUsers - 1);
    return this.getGlobalStats();
  }

  incrementRound() {
    this.totalRoundsPlayed++;
    this.saveMetrics();
    return this.getGlobalStats();
  }

  incrementMatch() {
    this.totalMatchesPlayed++;
    this.saveMetrics();
    return this.getGlobalStats();
  }

  setRoomCount(count) {
    this.activeRoomsCount = Math.max(0, count);
  }

  getGlobalStats(io = null) {
    let users = this.liveOnlineUsers;
    if (io && io.sockets && io.sockets.sockets) {
      users = io.sockets.sockets.size;
      this.liveOnlineUsers = users;
    }
    return {
      liveOnlineUsers: users,
      totalRoundsPlayed: this.totalRoundsPlayed,
      totalMatchesPlayed: this.totalMatchesPlayed,
      activeRoomsCount: this.activeRoomsCount
    };
  }
}

export const globalMetrics = new MetricsService();
