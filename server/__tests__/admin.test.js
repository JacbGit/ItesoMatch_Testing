const adminMiddleware = require("../middlewares/admin"); // Ajusta la ruta a tu archivo admin.js

describe("Admin Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Reseteamos los mocks antes de cada test
    req = {
      get: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(), // Importante para encadenar .json()
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should call next() if adminToken is correct", () => {
    req.get.mockReturnValue("admin123");

    adminMiddleware(req, res, next);

    expect(req.get).toHaveBeenCalledWith("adminToken");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should return 401 if adminToken is incorrect", () => {
    req.get.mockReturnValue("wrong-token");

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      err: {
        message: "No admin token!",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if adminToken is missing", () => {
    req.get.mockReturnValue(undefined);

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
