const request = require("supertest");
const app = require("../app");

describe("Users API - Login Endpoint", () => {
  describe("POST /api/users/login", () => {
    test("should return 401 when credentials are missing", async () => {
      const response = await request(app).post("/api/users/login").send({});

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("ok");
      expect(response.body.ok).toBe(false);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 401 when username is missing", async () => {
      const response = await request(app).post("/api/users/login").send({
        password: "testpassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("ok");
      expect(response.body.ok).toBe(false);
    });

    test("should return 401 when password is missing", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("ok");
      expect(response.body.ok).toBe(false);
    });

    test("should return JSON content type", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "nonexistent",
        password: "wrongpass",
      });

      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
