/**
 * Tests de rutas protegidas: sin token deben devolver 401.
 */
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

let app;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  const { app: expressApp } = await import("../../servidor.mjs");
  app = expressApp;
});

afterAll(() => {
  process.env.NODE_ENV = undefined;
});

describe("Rutas protegidas sin token", () => {
  it("GET /equipos sin Authorization → 401", async () => {
    const res = await request(app).get("/equipos");
    expect(res.status).toBe(401);
    expect(res.body.mensaje).toMatch(/token|requerido/i);
  });

  it("POST /equipos sin Authorization → 401", async () => {
    const res = await request(app)
      .post("/equipos")
      .send({ nombre: "Test" });
    expect(res.status).toBe(401);
  });
});
