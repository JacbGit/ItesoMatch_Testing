const authMiddleware = require("../middlewares/userAuth"); // Ajusta la ruta
const jwt = require("jsonwebtoken");
const Users = require("../modules/users/users.model");

// Mockeamos las dependencias
jest.mock("jsonwebtoken");
jest.mock("../modules/users/users.model");
jest.mock("../utils/config", () => ({
  JWT_SECRET: "test-secret",
}));

describe("User Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      get: jest.fn(),
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should return 401 if Authorization header is missing", async () => {
    req.get.mockReturnValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Authorization token is missing!",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() and attach user if token is valid and user exists", async () => {
    const mockUser = { _id: "user123", name: "Test User" };
    const mockDecoded = { userId: "user123" };

    req.get.mockReturnValue("valid-token");
    jwt.verify.mockReturnValue(mockDecoded);
    Users.findById.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    expect(Users.findById).toHaveBeenCalledWith("user123");
    expect(req.user).toEqual(mockUser); // Verifica que el usuario se adjuntó a la request
    expect(next).toHaveBeenCalled();
  });

  test("should return 404 if user is not found in database", async () => {
    const mockDecoded = { userId: "deleted-user-id" };

    req.get.mockReturnValue("valid-token");
    jwt.verify.mockReturnValue(mockDecoded);
    Users.findById.mockResolvedValue(null); // Simulamos que no encuentra al usuario

    await authMiddleware(req, res, next);

    expect(Users.findById).toHaveBeenCalledWith("deleted-user-id");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "User not found!",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid (jwt verify throws error)", async () => {
    req.get.mockReturnValue("invalid-token");
    // Simulamos error en la verificación del token
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Invalid token!",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
