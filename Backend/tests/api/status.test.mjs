/**
 * Tests de API: ruta pública /api/status (no requiere BD).
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

describe("GET /api/status", () => {
  it("responde 200 y mensaje de servidor activo", async () => {
    const res = await request(app).get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
    expect(res.body.mensaje).toMatch(/activo|servidor/i);
  });
});
