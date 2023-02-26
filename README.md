
# PodJot

A react web-app for tracking notes and ratings of podcasts and individual podcast episodes.


## Installation

Open your terminal and then type

```bash
    git clone https://github.com/jessndots/podjot
```
This clones the repo. 

Cd into the new folder and type

```bash
    npm install
``` 
This installs the required dependencies.

Cd into backend folder
```bash
    cd backend
```
Start a psql server and open psql in the terminal
```bash
    sudo service postgresql start;
    psql
```
In psql, run the 'podjot.sql' file to create the database (if needed). Exit psql.
```sql
    \i podjot.sql
```

Use nodemon to start the backend server
```bash
    nodemon server.js
```

In a new terminal window, from the root folder,  run the React project
```bash
    npm start
```

    
## Features

- Quickly rate or take notes from any podcast or episode page
- Featured podcasts on home page
- Listen right from the app



## Usage/Examples

Test user

## Roadmap

- A way to view all saved podcasts and notes

- More detailed search

- Pagination of search results

- Recommendations of podcasts and episodes

- More testing

- Playlist feature

- Queue feature

