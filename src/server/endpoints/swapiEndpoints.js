const applySwapiEndpoints = (server, app) => {
    server.get("/hfswapi/test", async (req, res) => {
        const data = await app.swapiFunctions.genericRequest(
            "https://swapi.dev/api/",
            "GET",
            null,
            true
        );
        res.send(data);
    });

    server.get("/hfswapi/getPeople/:id", async (req, res) => {
        const { id } = req.params;
        let data; //Variable to set the data

        data = data = await app.db.swPeople.findOne({ where: { id: id } }); //Get data from DB if exist

        if (data) return res.send(data); //Evaluate if DB contains data for the previus Query

        //Fetch character and planet data from API
        const { name, mass, height, homeworld } = await app.swapiFunctions.genericRequest(
            `https://swapi.dev/api/people/${id}`,
            "GET",
            null,
            true
        );
        const planet = await app.swapiFunctions.genericRequest(homeworld, "GET", null, true);
        data = {
            name,
            mass,
            height,
            homeworld_name: planet.name,
            homeworld_id: homeworld.substring(21, homeworld.length),
        };
        res.send(data);
    });

    server.get("/hfswapi/getPlanet/:id", async (req, res) => {
        res.sendStatus(501);
    });

    server.get("/hfswapi/getWeightOnPlanetRandom", async (req, res) => {
        res.sendStatus(501);
    });

    server.get("/hfswapi/getLogs", async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });
};

module.exports = applySwapiEndpoints;
