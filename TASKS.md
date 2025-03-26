# Squint Game - Development Tasks

## Core Game Mechanics

- [ ] **Complete Blink Detection Logic**

  - [ ] Improve blink detection accuracy with better thresholds
  - [ ] Connect blink detection to game state (disqualify when blinking while doll is looking)

- [ ] **Improve doll animation and aesthetics**

  - [ ] Create more polished doll design (or use images from the PRD)
  - [ ] Add animation transitions for more dramatic effect
  - [ ] Implement taunts/messages when player blinks

- [ ] **Implement Scoring System**

  - [ ] Add point accumulation (1 point per second when not blinking while doll is looking)
  - [ ] Display progress towards the goal (100 points)

- [ ] **Round Management**

  - [ ] Implement 60-second round timer
  - [ ] Add 10-second break between rounds
  - [ ] Handle round progression (1 to 5)

- [ ] **Game Win/Loss Conditions**
  - [ ] Implement disqualification when blinking at wrong time
  - [ ] Add victory condition when reaching 100 points
  - [ ] Create endgame screen with stats and replay option

## User Experience Improvements

- [ ] **Add Sound Effects**

  - [ ] Implement doll turning sound
  - [ ] Add disqualification sound
  - [ ] Create round start/end sounds

- [ ] **Game Instructions Modal**

  - [ ] Connect the "How to Play" button to show game instructions
  - [ ] Create a modal with clear instructions and visuals

- [ ] **Visual Feedback**

  - [ ] Add visual indicator for "Don't Blink!" and "Blink Freely!" states
  - [ ] Implement progress bar showing advancement toward the finish line
  - [ ] Add countdown timer for each round

- [ ] **Doll Character Improvements**
  - [ ] Create more polished doll design (or use images from the PRD)
  - [ ] Add animation transitions for more dramatic effect
  - [ ] Implement taunts/messages when player blinks

## Multiplayer Features

- [ ] **Set Up WebSocket Server**

  - [ ] Create a simple Node.js server with WebSockets
  - [ ] Implement player connection/disconnection handling

- [ ] **Lobby System**

  - [ ] Create a lobby interface for players to join
  - [ ] Implement unique session URLs/codes

- [ ] **Player Management**

  - [ ] Add player list showing active/disqualified status
  - [ ] Implement spectator mode for disqualified players

- [ ] **Synchronization**
  - [ ] Ensure all players see the same doll state
  - [ ] Synchronize game timers and state
  - [ ] Share player progress in real-time

## Polish and Optimization

- [ ] **Performance Optimization**

  - [ ] Improve face detection performance
  - [ ] Optimize WebSocket communication
  - [ ] Add fallbacks for poor network conditions

- [ ] **Browser Compatibility**

  - [ ] Test and fix issues across different browsers
  - [ ] Ensure webcam access works consistently

- [ ] **Mobile Support** (future enhancement)
  - [ ] Adapt UI for different screen sizes
  - [ ] Test webcam access on mobile devices

## Deployment

- [ ] **Static Frontend Hosting**

  - [ ] Deploy frontend to GitHub Pages or similar
  - [ ] Configure build process

- [ ] **Server Deployment**
  - [ ] Deploy WebSocket server (Heroku, Vercel, etc.)
  - [ ] Set up environment variables and configuration
