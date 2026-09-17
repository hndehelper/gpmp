import { io as Client } from 'socket.io-client';
import assert from 'assert';

console.log('🧪 Running GPMP Real-Time Socket.IO Integration Test...\n');

const SERVER_URL = 'http://localhost:4000';

async function runTest() {
  const hostSocket = Client(SERVER_URL);
  const playerSocket = Client(SERVER_URL);

  await new Promise((resolve) => {
    let connectedCount = 0;
    const check = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    hostSocket.on('connect', check);
    playerSocket.on('connect', check);
  });

  console.log('✅ Both sockets connected to server successfully');

  // Step 1: Create room
  const roomData = await new Promise((resolve) => {
    hostSocket.emit('create_room', { hostName: 'Kasun Host', avatar: '😎' });
    hostSocket.on('room_created', (data) => resolve(data));
  });

  console.log(`✅ Room created with code: ${roomData.room.code}`);
  assert.ok(roomData.room.code);
  assert.strictEqual(roomData.room.players.length, 1);

  // Step 2: Player 2 joins room
  const joinData = await new Promise((resolve) => {
    playerSocket.emit('join_room', {
      roomCode: roomData.room.code,
      playerName: 'Amal Player',
      avatar: '🦁'
    });
    playerSocket.on('room_joined', (data) => resolve(data));
  });

  console.log('✅ Player 2 joined successfully');
  assert.strictEqual(joinData.room.players.length, 2);

  // Step 3: Add bot
  const botRoom = await new Promise((resolve) => {
    const handler = (data) => {
      if (data.room && data.room.players.length === 3) {
        hostSocket.off('room_state_update', handler);
        resolve(data.room);
      }
    };
    hostSocket.on('room_state_update', handler);
    hostSocket.emit('add_bot', { roomCode: roomData.room.code });
  });

  console.log(`✅ Bot added successfully. Players count: ${botRoom.players.length}`);
  assert.strictEqual(botRoom.players.length, 3);

  // Clean disconnect
  hostSocket.disconnect();
  playerSocket.disconnect();

  console.log('\n🎉 ALL SOCKET INTEGRATION TESTS PASSED WITHOUT ERRORS!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
