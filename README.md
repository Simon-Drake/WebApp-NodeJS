Progressive Web App designed for festivals. Handles connection interruptions. Still not robust and UI needs (a lot) of work.

Uses NodeJS, Ajax, MongoDB and more. 

Requirements: 

Needs MondoDB installed: 
- sudo apt install mongodb
- sudo systemctl status mongodb (Should show active: active (running))
- sudo mongod --dbpath ./data/db --port 27017 --fork --logpath mongolog.log


To run: 
- Run NPM install on package.json
- Run ‘google-chrome --ignore-certificate-errors’ in terminal for Linux (or a
windows equivalent)
- Visit ‘https://localhost:3001/’
