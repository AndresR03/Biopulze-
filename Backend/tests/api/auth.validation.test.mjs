/**
 * Tests de validación de auth (registro y login).
 * Comprueban que con datos inválidos se devuelve 400 sin tocar BD.
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

describe("POST /register - validación", () => {
  it("falta nombre → 400", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        correo: "test@test.com",
        telefono: "+573001234567",
        password: "password123"
      });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/obligatorio|nombre/i);
  });

  it("contraseña corta (< 8) → 400", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        nombre: "Test",
        correo: "test@test.com",
        telefono: "+573001234567",
        password: "1234567"
      });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/8|caracteres/i);
  });

  it("falta correo → 400", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        nombre: "Test",
        telefono: "+573001234567",
        password: "password123"
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /login - validación", () => {
  it("falta correo → 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ password: "algo" });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/obligatorio/i);
  });

  it("falta contraseña → 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ correo: "a@b.com" });
    expect(res.status).toBe(400);
  });
});

describe("POST /forgot-password - validación", () => {
  it("falta correo → 400", async () => {
    const res = await request(app).post("/forgot-password").send({});
    expect(res.status).toBe(400);
  });
});
