# Space Heritage Explorer
**Abandoned but not Forgotten** | NASA Space Apps Challenge 2026
Team: Beyond Earth Solo

Space Heritage Explorer is an interactive website that tells the stories of equipment humans have left behind on the Moon and Mars. Rotate the globes, click a pin at a landing site, and follow the hardware from the first landing to the last signal.


## Challenge
*Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars.*

These objects are the first archaeology beyond Earth. Telling their stories builds public appreciation for the history of exploration and for protecting these sites.

## Features
- Draggable 3D globes of the Moon and Mars, with a pin at each landing site
- 11 objects: 4 on the Moon and 7 on Mars
- Detail panel with mission, site, agency, arrival year, last contact, purpose and story
- "Start the story" walkthrough with Earlier and Later buttons (or the arrow keys)
- Lifespan chart showing how long each object operated, from arrival to last contact
- Search by name, mission or site
- Shareable link to any object (for example `#opportunity-rover`)
- Link to NASA's image library for more photos of each object
- Keyboard accessible, responsive, and respects reduced-motion settings

## Objects covered
| World | Objects |
|-------|---------|
| Moon | Surveyor 3, Apollo 11 Lunar Module Descent Stage, Lunokhod 1, Apollo 15 Lunar Roving Vehicle |
| Mars | Mars 3 Lander, Viking 1 Lander, Viking 2 Lander, Sojourner and Pathfinder Lander, Spirit Rover, Opportunity Rover, Ingenuity Helicopter |

## How to run
No build step and no dependencies. Open `index.html` in a browser.

## Project structure
```
index.html   page structure
style.css    styling
data.js      object data and approximate landing-site coordinates
app.js       globe, star field, panel, chart, search and navigation
images/      NASA photos, one per object
```

## Quick test (2 minutes)
1. Drag the globe and click a pin.
2. Click **Start the story**, then use Earlier and Later (or the arrow keys).
3. Switch to Mars and search "rover".
4. Click a row in the lifespan chart.
5. Resize to phone width.

## Photos
Photos come from NASA's image library (https://images.nasa.gov).

## Built with
Plain HTML, CSS and JavaScript. The globes and star field are drawn on the canvas, with no frameworks or libraries.

## Data and credits
- Mission facts are based on NASA mission pages (nasa.gov and science.nasa.gov).
- Images are credited to NASA and the relevant mission teams, including NASA's Lunar Reconnaissance Orbiter and Mars Reconnaissance Orbiter.
- Landing-site coordinates are approximate.
- Lunokhod 1 and Mars 3 are Soviet missions. Their stories draw on NASA orbiter imagery of the sites.

## Team
Beyond Earth Solo, NASA Space Apps Challenge 2026.
