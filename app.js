"use strict";

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const Routes = require("./routes");
// global.db = require("./config/dbConfig").connection;
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const server = await new Hapi.Server({
      host: "0.0.0.0",
      port: PORT,
      routes: { cors: true },
    });

    const swaggerOptions = {
      info: {
        title: "Sahib Previlege Documentation",
        version: "0.0.1",
      },
    };

    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions,
      },
    ]);

    try {
      await server.start();
      // await db.connect();
      console.log("Server running at:", server.info.uri);
    } catch (err) {
      console.log("err", err);
    }

    server.route({
      method: 'GET',
      path: '/',
      handler: (req, h) => {
          return '<h1>Please append /documentation in url for opening swagger link</h1>'
      }
    })
    server.route(Routes);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
