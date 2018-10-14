import openSocket from 'socket.io-client';
import firebase from 'firebase/app';
import 'firebase/database';
import config from './config';
import pako from 'pako';

function subscribeToSocketIO(cb) {
  const socket = openSocket('http://localhost:10000');
  socket.on('to_client', data => cb(JSON.parse(pako.inflate(data, { to: 'string' }))));
}

function subscribeToFirebase(cb) {
  firebase.initializeApp(config);
  const ref = firebase.database().ref('gameState');
  let initialLoad = true;
  ref.on('value', (snapshot) => {
    if (!initialLoad) cb(snapshot.val());
    initialLoad = false;
  });
}

export { subscribeToSocketIO, subscribeToFirebase };