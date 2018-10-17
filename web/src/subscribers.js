function subscribeToSocketIO(cb) {
  const pako = require('pako');
  const openSocket = require('socket.io-client');
  const socket = openSocket('http://localhost:10000');
  socket.on('to_client', data => cb(JSON.parse(pako.inflate(data, { to: 'string' }))));
}

function subscribeToFirebase(cb) {
  const config = require('./config').default;
  const firebase = require('firebase/app');
  firebase.initializeApp(config);
  require("firebase/database");
  const ref = firebase.database().ref('gameState');
  let initialLoad = true;
  ref.on('value', (snapshot) => {
    if (!initialLoad) cb(snapshot.val());
    initialLoad = false;
  });
}

export { subscribeToSocketIO, subscribeToFirebase };