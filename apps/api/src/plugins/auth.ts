import { FastifyInstance } from "fastify";

export async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized"
      });
    }
  });
}