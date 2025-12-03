const request = require("supertest");
const app = require("../app");
const Users = require("../modules/users/users.model");
const bcrypt = require("bcrypt");

describe("Users API - Login Endpoint", () => {
  beforeAll(async () => {
    await Users.deleteMany({ username: /^testuser/ });

    await Users.create({
      username: "testuser_login",
      age: 20,
      name: "Test User",
      email: "testuser@iteso.mx",
      expediente: "123456",
      phone: "1234567890",
      password: "testpassword123",
      tags: ["programming", "gaming"],
      imageURI: "test-image.jpg",
    });
  });

  afterAll(async () => {
    await Users.deleteMany({ username: /^testuser/ });
  });

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

    test("should return 401 when user does not exist", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "nonexistentuser",
        password: "anypassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("ok", false);
      expect(response.body).toHaveProperty("error", "Invalid credentials!");
    });

    test("should return 401 when password is incorrect", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser_login",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("ok", false);
      expect(response.body).toHaveProperty("error", "Invalid credentials!");
    });

    test("should return 200 and token when credentials are valid", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser_login",
        password: "testpassword123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("userData");
    });

    test("should return valid JWT token structure on successful login", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser_login",
        password: "testpassword123",
      });

      const { token } = response.body.data;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    test("should return complete userData on successful login", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser_login",
        password: "testpassword123",
      });

      const { userData } = response.body.data;
      expect(userData).toHaveProperty("username", "testuser_login");
      expect(userData).toHaveProperty("age", 20);
      expect(userData).toHaveProperty("name", "Test User");
      expect(userData).toHaveProperty("email", "testuser@iteso.mx");
      expect(userData).toHaveProperty("expediente", "123456");
      expect(userData).toHaveProperty("phone", "1234567890");
      expect(userData).toHaveProperty("_id");
      expect(userData).toHaveProperty("imageURI", "test-image.jpg");
      expect(userData).toHaveProperty("tags");
      expect(userData.tags).toEqual(["programming", "gaming"]);
    });

    test("should not return password in userData", async () => {
      const response = await request(app).post("/api/users/login").send({
        username: "testuser_login",
        password: "testpassword123",
      });

      const { userData } = response.body.data;
      expect(userData).not.toHaveProperty("password");
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

describe("Users API - Register Endpoint", () => {
  beforeEach(async () => {
    await Users.deleteMany({ username: /^testregister/ });
  });

  afterAll(async () => {
    await Users.deleteMany({ username: /^testregister/ });
  });

  describe("POST /api/users", () => {
    test("should return error when image is missing", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_noimage")
        .field("age", "22")
        .field("name", "Test Register User")
        .field("email", "testregister@iteso.mx")
        .field("expediente", "789012")
        .field("phone", "9876543210")
        .field("password", "password123")
        .field("tags", "music,sports");

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("ok", false);
    });

    test("should register user successfully with all valid data", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_success")
        .field("age", "21")
        .field("name", "Test Success User")
        .field("email", "testsuccess@iteso.mx")
        .field("expediente", "654321")
        .field("phone", "5551234567")
        .field("password", "securepass123")
        .field("tags", "reading,coding,music")
        .attach("image", Buffer.from("fake-image-data"), "test-profile.jpg");

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("userData");
    });

    test("should return valid JWT token on successful registration", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_token")
        .field("age", "23")
        .field("name", "Test Token User")
        .field("email", "testtoken@iteso.mx")
        .field("expediente", "111222")
        .field("phone", "5559998888")
        .field("password", "mypassword123")
        .field("tags", "gaming,movies")
        .attach("image", Buffer.from("fake-image-data"), "test-token.jpg");

      const { token } = response.body.data;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    test("should return complete userData on successful registration", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_userdata")
        .field("age", "24")
        .field("name", "Test UserData User")
        .field("email", "testuserdata@iteso.mx")
        .field("expediente", "333444")
        .field("phone", "5557778888")
        .field("password", "datapass123")
        .field("tags", "art,music,sports")
        .attach("image", Buffer.from("fake-image-data"), "test-userdata.jpg");

      const { userData } = response.body.data;
      expect(userData).toHaveProperty("username", "testregister_userdata");
      expect(userData).toHaveProperty("age", 24);
      expect(userData).toHaveProperty("name", "Test UserData User");
      expect(userData).toHaveProperty("email", "testuserdata@iteso.mx");
      expect(userData).toHaveProperty("expediente", "333444");
      expect(userData).toHaveProperty("phone", "5557778888");
      expect(userData).toHaveProperty("_id");
      expect(userData).toHaveProperty("imageURI");
      expect(userData).toHaveProperty("tags");
      expect(userData.tags).toEqual(["art", "music", "sports"]);
    });

    test("should not return password in userData on registration", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_nopass")
        .field("age", "25")
        .field("name", "Test NoPass User")
        .field("email", "testnopass@iteso.mx")
        .field("expediente", "555666")
        .field("phone", "5554443333")
        .field("password", "secretpass123")
        .field("tags", "technology")
        .attach("image", Buffer.from("fake-image-data"), "test-nopass.jpg");

      const { userData } = response.body.data;
      expect(userData).not.toHaveProperty("password");
    });

    test("should hash password before storing in database", async () => {
      const plainPassword = "plaintextpassword123";

      await request(app)
        .post("/api/users")
        .field("username", "testregister_hash")
        .field("age", "26")
        .field("name", "Test Hash User")
        .field("email", "testhash@iteso.mx")
        .field("expediente", "777888")
        .field("phone", "5556665555")
        .field("password", plainPassword)
        .field("tags", "security")
        .attach("image", Buffer.from("fake-image-data"), "test-hash.jpg");

      const savedUser = await Users.findOne({ username: "testregister_hash" });
      expect(savedUser.password).not.toBe(plainPassword);
      expect(savedUser.password).toMatch(/^\$2[aby]\$.{56}$/);

      const isValidPassword = await bcrypt.compare(
        plainPassword,
        savedUser.password,
      );
      expect(isValidPassword).toBe(true);
    });

    test("should parse and store tags as array", async () => {
      await request(app)
        .post("/api/users")
        .field("username", "testregister_tags")
        .field("age", "27")
        .field("name", "Test Tags User")
        .field("email", "testtags@iteso.mx")
        .field("expediente", "999000")
        .field("phone", "5553332222")
        .field("password", "tagspass123")
        .field("tags", "tag1,tag2,tag3,tag4")
        .attach("image", Buffer.from("fake-image-data"), "test-tags.jpg");

      const savedUser = await Users.findOne({ username: "testregister_tags" });
      expect(Array.isArray(savedUser.tags)).toBe(true);
      expect(savedUser.tags).toHaveLength(4);
      expect(savedUser.tags).toEqual(["tag1", "tag2", "tag3", "tag4"]);
    });

    test("should save image with timestamped filename", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_image")
        .field("age", "28")
        .field("name", "Test Image User")
        .field("email", "testimage@iteso.mx")
        .field("expediente", "121212")
        .field("phone", "5558889999")
        .field("password", "imagepass123")
        .field("tags", "photography")
        .attach("image", Buffer.from("fake-image-data"), "profile-pic.jpg");

      const { userData } = response.body.data;
      expect(userData.imageURI).toBeDefined();
      expect(userData.imageURI).toMatch(/^\d+-profile-pic\.jpg$/);

      const savedUser = await Users.findOne({
        username: "testregister_image",
      });
      expect(savedUser.imageURI).toBe(userData.imageURI);
    });

    test("should return 500 when username already exists", async () => {
      await request(app)
        .post("/api/users")
        .field("username", "testregister_duplicate")
        .field("age", "29")
        .field("name", "Test Duplicate User")
        .field("email", "testduplicate@iteso.mx")
        .field("expediente", "343434")
        .field("phone", "5557776666")
        .field("password", "duppass123")
        .field("tags", "testing")
        .attach("image", Buffer.from("fake-image-data"), "test-dup.jpg");

      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_duplicate")
        .field("age", "30")
        .field("name", "Test Duplicate 2")
        .field("email", "testduplicate2@iteso.mx")
        .field("expediente", "454545")
        .field("phone", "5554445555")
        .field("password", "duppass456")
        .field("tags", "testing")
        .attach("image", Buffer.from("fake-image-data"), "test-dup2.jpg");

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("ok", false);
      expect(response.body).toHaveProperty("error", "Register error!");
    });

    test("should return JSON content type", async () => {
      const response = await request(app)
        .post("/api/users")
        .field("username", "testregister_json")
        .field("age", "31")
        .field("name", "Test JSON User")
        .field("email", "testjson@iteso.mx")
        .field("expediente", "565656")
        .field("phone", "5552221111")
        .field("password", "jsonpass123")
        .field("tags", "json")
        .attach("image", Buffer.from("fake-image-data"), "test-json.jpg");

      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
