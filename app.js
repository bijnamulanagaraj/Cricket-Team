const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1
app.get("/players/", async (request, response) => {
  const getPlayerDetails = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playerArray = await database.all(getPlayerDetails);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// API 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerDetails = `
     INSERT INTO
       cricket_team(player_Name, jersey_Number, role)
       VALUES
       ('${playerName}', '${jerseyNumber}', '${role}');`;

  const player = await database.run(addPlayerDetails);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await database.get(getPlayerDetails);
  response.send(convertDbObjectToResponseObject(player));
});

// API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE 
      cricket_team
    SET
      player_name = "${playerName}",
      jersey_number = ${jerseyNumber},
      role = "${role}"
    WHERE 
      player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE 
      player_id = ${playerId};`;

  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
