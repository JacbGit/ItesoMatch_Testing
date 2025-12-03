const {
  getUsers,
  createUser,
  loginUser,
  checkToken,
  updateUser,
  deleteUser,
} = require("../modules/users/users.controller");

const Users = require("../modules/users/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../modules/users/users.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Users Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: {},
      get: jest.fn(),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------
  // GET USERS
  // ---------------------------------------------------------
  it("should return all users", async () => {
    const fakeUsers = [{ username: "nico" }, { username: "juan" }];
    Users.find.mockResolvedValue(fakeUsers);

    await getUsers(req, res);

    expect(Users.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: fakeUsers,
    });
  });

  // ---------------------------------------------------------
  // CREATE USER
  // ---------------------------------------------------------
  it("should create a user and return token", async () => {
    req.body = {
      username: "nico",
      age: 20,
      name: "Nicolás",
      email: "a@a.com",
      expediente: "123",
      phone: "555",
      password: "pass123",
      tags: "js,node",
    };

    req.files.image = {
      name: "foto.png",
      mv: jest.fn().mockResolvedValue(),
    };

    const savedUser = {
      _id: "123",
      username: "nico",
      age: 20,
      name: "Nicolás",
      email: "a@a.com",
      expediente: "123",
      phone: "555",
      imageURI: "file.png",
      tags: ["js", "node"],
    };

    Users.create.mockResolvedValue(savedUser);
    jwt.sign.mockReturnValue("FAKE_TOKEN");

    await createUser(req, res);

    expect(req.files.image.mv).toHaveBeenCalled();
    expect(Users.create).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        userData: {
          username: savedUser.username,
          age: savedUser.age,
          name: savedUser.name,
          email: savedUser.email,
          expediente: savedUser.expediente,
          phone: savedUser.phone,
          _id: savedUser._id,
          imageURI: savedUser.imageURI,
          tags: savedUser.tags,
        },
        token: "FAKE_TOKEN",
      },
    });
  });

  // ---------------------------------------------------------
  // LOGIN USER
  // ---------------------------------------------------------
  it("should return 401 if user does not exist", async () => {
    req.body = { username: "nico", password: "123" };
    Users.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Invalid credentials!",
    });
  });

  it("should return 401 if password is incorrect", async () => {
    req.body = { username: "nico", password: "123" };
    Users.findOne.mockResolvedValue({ username: "nico", password: "HASHED" });
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Invalid credentials!",
    });
  });

  it("should login and return token", async () => {
    const fakeUser = {
      _id: "123",
      username: "nico",
      password: "HASHED",
      age: 20,
      name: "Nico",
      email: "a@a.com",
      expediente: "321",
      phone: "999",
      imageURI: "a.png",
      tags: ["js"],
    };

    req.body = { username: "nico", password: "123" };

    Users.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("FAKE_TOKEN");

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        userData: {
          username: fakeUser.username,
          age: fakeUser.age,
          name: fakeUser.name,
          email: fakeUser.email,
          expediente: fakeUser.expediente,
          phone: fakeUser.phone,
          _id: fakeUser._id,
          imageURI: fakeUser.imageURI,
          tags: fakeUser.tags,
        },
        token: "FAKE_TOKEN",
      },
    });
  });

  // ---------------------------------------------------------
  // CHECK TOKEN
  // ---------------------------------------------------------
  it("should return 401 when token is missing", async () => {
    req.get.mockReturnValue(null);

    await checkToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Authorization token is missing!",
    });
  });

  it("should validate token and return ok", async () => {
    req.get.mockReturnValue("VALID_TOKEN");

    jwt.verify.mockReturnValue({ userId: "123" });
    Users.findById.mockResolvedValue({ _id: "123" });

    await checkToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  // ---------------------------------------------------------
  // UPDATE USER
  // ---------------------------------------------------------
  it("should update user and return updated data", async () => {
    req.params = { id: "123" };
    req.body = { name: "Nuevo Nombre" };

    Users.findByIdAndUpdate.mockResolvedValue({
      _id: "123",
      name: "Nuevo Nombre",
    });

    await updateUser(req, res);

    expect(Users.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if user does not exist when updating", async () => {
    req.params = { id: "123" };
    req.body = { name: "Nuevo Nombre" };

    Users.findByIdAndUpdate.mockResolvedValue(null);

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ---------------------------------------------------------
  // DELETE USER
  // ---------------------------------------------------------
  it("should delete user successfully", async () => {
    req.params = { id: "123" };

    Users.findByIdAndDelete.mockResolvedValue({ _id: "123" });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "User deleted successfully",
    });
  });

  it("should return 404 if user does not exist when deleting", async () => {
    req.params = { id: "123" };
    Users.findByIdAndDelete.mockResolvedValue(null);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
