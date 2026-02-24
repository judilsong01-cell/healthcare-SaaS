import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, ApiError } from "@/services/api";

/**
 * API Service Tests
 * 
 * Design Philosophy: Testes Robustos e Completos
 * - Testes de sucesso e erro
 * - Mocking de fetch
 * - Validação de tipos
 */

describe("API Service", () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    vi.clearAllMocks();
  });

  describe("Patient API", () => {
    it("should fetch patient data successfully", async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              id: "1",
              name: "João Silva",
              email: "joao@example.com",
            }),
        } as Response)
      );

      // Chamar API
      const response = await api.patient.getPatient("1");

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        id: "1",
        name: "João Silva",
        email: "joao@example.com",
      });
      expect(response.statusCode).toBe(200);
    });

    it("should handle API errors", async () => {
      // Mock fetch com erro
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ error: "Patient not found" }),
        } as Response)
      );

      // Chamar API e esperar erro
      try {
        await api.patient.getPatient("999");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(404);
      }
    });
  });

  describe("File API", () => {
    it("should upload file successfully", async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              id: "file-1",
              name: "document.pdf",
              size: 1024,
              type: "application/pdf",
              status: "pending",
            }),
        } as Response)
      );

      // Criar arquivo mock
      const file = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });

      // Chamar API
      const response = await api.file.uploadFile("patient-1", file, "report", "Test document");

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data?.name).toBe("document.pdf");
      expect(response.data?.status).toBe("pending");
    });
  });

  describe("Auth API", () => {
    it("should login successfully", async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              token: "jwt-token-123",
              user: {
                id: "user-1",
                email: "user@example.com",
                role: "patient",
              },
            }),
        } as Response)
      );

      // Chamar API
      const response = await api.auth.login("user@example.com", "password123");

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data?.token).toBe("jwt-token-123");
      expect(response.data?.user.role).toBe("patient");
    });

    it("should handle login failure", async () => {
      // Mock fetch com erro
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ error: "Invalid credentials" }),
        } as Response)
      );

      // Chamar API e esperar erro
      try {
        await api.auth.login("user@example.com", "wrongpassword");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(401);
      }
    });
  });
});
