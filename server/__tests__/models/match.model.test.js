const mongoose = require("mongoose");
const Match = require("../../modules/shared/match/match.model");
const User = require("../../modules/users/users.model");

describe("Match Model Tests", () => {
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    await Match.deleteMany({});
    await User.deleteMany({ username: /^modelmatchtest_/ });
    // Create test users to use in match tests
    const user1 = new User({
      username: "modelmatchtest_user1",
      age: 20,
      name: "Match User 1",
      email: "matchuser1@iteso.mx",
      expediente: "999991",
      phone: "9999999991",
      password: "password123",
    });
    const savedUser1 = await user1.save();
    user1Id = savedUser1._id;

    const user2 = new User({
      username: "modelmatchtest_user2",
      age: 21,
      name: "Match User 2",
      email: "matchuser2@iteso.mx",
      expediente: "999992",
      phone: "9999999992",
      password: "password123",
    });
    const savedUser2 = await user2.save();
    user2Id = savedUser2._id;
  });

  afterAll(async () => {
    await Match.deleteMany({});
    await User.deleteMany({ username: /^modelmatchtest_/ });
  });

  describe("Schema Validation", () => {
    it("should create a match with all required fields", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch._id).toBeDefined();
      expect(savedMatch.user1.toString()).toBe(user1Id.toString());
      expect(savedMatch.user2.toString()).toBe(user2Id.toString());
    });

    it("should fail to create match without user1", async () => {
      const matchData = {
        user2: user2Id,
      };

      const match = new Match(matchData);

      await expect(match.save()).rejects.toThrow();
    });

    it("should fail to create match without user2", async () => {
      const matchData = {
        user1: user1Id,
      };

      const match = new Match(matchData);

      await expect(match.save()).rejects.toThrow();
    });
  });

  describe("Default Values", () => {
    it("should have default value false for user1Liked", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.user1Liked).toBe(false);
    });

    it("should have default value false for user2Liked", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.user2Liked).toBe(false);
    });

    it("should have default value false for matched", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.matched).toBe(false);
    });
  });

  describe("Boolean Fields", () => {
    it("should accept true for user1Liked", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
        user1Liked: true,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.user1Liked).toBe(true);
    });

    it("should accept true for user2Liked", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
        user2Liked: true,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.user2Liked).toBe(true);
    });

    it("should accept true for matched", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
        matched: true,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.matched).toBe(true);
    });

    it("should create a mutual match", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
        user1Liked: true,
        user2Liked: true,
        matched: true,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(savedMatch.user1Liked).toBe(true);
      expect(savedMatch.user2Liked).toBe(true);
      expect(savedMatch.matched).toBe(true);
    });
  });

  describe("ObjectId References", () => {
    it("should store valid ObjectId for user1", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(mongoose.Types.ObjectId.isValid(savedMatch.user1)).toBe(true);
    });

    it("should store valid ObjectId for user2", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      expect(mongoose.Types.ObjectId.isValid(savedMatch.user2)).toBe(true);
    });

    it("should populate user1 reference", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      const populatedMatch = await Match.findById(savedMatch._id).populate(
        "user1",
      );

      expect(populatedMatch.user1.username).toBe("modelmatchtest_user1");
    });

    it("should populate user2 reference", async () => {
      const matchData = {
        user1: user1Id,
        user2: user2Id,
      };

      const match = new Match(matchData);
      const savedMatch = await match.save();

      const populatedMatch = await Match.findById(savedMatch._id).populate(
        "user2",
      );

      expect(populatedMatch.user2.username).toBe("modelmatchtest_user2");
    });
  });

  describe("Multiple Matches", () => {
    it("should allow creating multiple matches for same user with different users", async () => {
      const user3 = new User({
        username: "modelmatchtest_user3",
        age: 22,
        name: "Match User 3",
        email: "matchuser3@iteso.mx",
        expediente: "999993",
        phone: "9999999993",
        password: "password123",
      });
      const savedUser3 = await user3.save();

      const match1 = new Match({
        user1: user1Id,
        user2: user2Id,
      });
      await match1.save();

      const match2 = new Match({
        user1: user1Id,
        user2: savedUser3._id,
      });
      await match2.save();

      const matches = await Match.find({ user1: user1Id });
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });
  });
});
