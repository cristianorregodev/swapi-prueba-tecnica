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

        data = data = await app.db.swPeople.findOne({ where: { id: id } }); //Get character from DB if exist

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
        const { id } = req.params;
        let data; //Variable to set the data

        //Get the planet from BD if exist
        data = await app.db.swPlanet.findOne({ where: { id: id } });

        if (data) return res.send(data); //Evaluate if DB contains data for the previus Query

        //Get planet from API
        const { name, gravity } = await app.swapiFunctions.genericRequest(
            `https://swapi.dev/api/planets/${id}`,
            "GET",
            null,
            true
        );
        data = {
            name,
            gravity: Number(gravity.split(" ")[0]), //Convert the value to a number
        };
        res.send(data);
    });

    server.get(
        "/hfswapi/getWeightOnPlanetRandom/character/:charId/planet/:planetId",
        async (req, res) => {
            const { charId, planetId } = req.params;

            //Get character and planet from DB
            const character = await app.db.swPeople.findOne({ where: { id: charId } });
            const planet = await app.db.swPlanet.findOne({ where: { id: planetId } });

            //Evaluate if the database contains data to continue
            if (character && planet) {
                //Evaluate the character homeworld
                if (character.homeworld_name === planet.name) {
                    return res.sendStatus(404);
                }
                const weigth = await app.swapiFunctions.getWeightOnPlanet(
                    character.mass,
                    planet.gravity
                );
                return res.send({ weigth });
            }
            //Fetchind character and planet from API
            const { mass, homeworld } = await app.swapiFunctions.genericRequest(
                `https://swapi.dev/api/people/${charId}`,
                "GET",
                null,
                true
            );
            const { gravity, url } = await app.swapiFunctions.genericRequest(
                `https://swapi.dev/api/planets/${planetId}`,
                "GET",
                null,
                true
            );

            const weigth = await app.swapiFunctions.getWeightOnPlanet(
                mass,
                Number(gravity.split(" ")[0])
            );

            if (url === homeworld) {
                return res.sendStatus(404);
            }
            res.send({ weigth });
        }
    );

    server.get("/hfswapi/getLogs", async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });
};

module.exports = applySwapiEndpoints;
