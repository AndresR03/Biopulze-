/**
 * Tests unitarios de reglas de negocio (validaciones).
 * No dependen de Express ni de la base de datos.
 */
import { describe, it, expect } from "@jest/globals";

const MIN_PASSWORD_LENGTH = 8;

function validarLongitudPassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

function validarCamposObligatorios(obj, keys) {
  for (const k of keys) {
    if (obj[k] == null || String(obj[k]).trim() === "") return false;
  }
  return true;
}

describe("Validación de contraseña", () => {
  it("rechaza menos de 8 caracteres", () => {
    expect(validarLongitudPassword("")).toBe(false);
    expect(validarLongitudPassword("1234567")).toBe(false);
  });

  it("acepta 8 o más caracteres", () => {
    expect(validarLongitudPassword("12345678")).toBe(true);
    expect(validarLongitudPassword("password")).toBe(true);
  });
});

describe("Campos obligatorios", () => {
  it("detecta campos faltantes", () => {
    expect(validarCamposObligatorios({ nombre: "A", correo: "" }, ["nombre", "correo"])).toBe(false);
    expect(validarCamposObligatorios({ nombre: "A", correo: "a@b.com" }, ["nombre", "correo"])).toBe(true);
  });
});
