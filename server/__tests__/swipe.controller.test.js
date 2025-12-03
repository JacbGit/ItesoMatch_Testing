const {
    getTopMatches,
    postLikeUser,
} = require("../modules/swipe/swipe.controller");

const Users = require("../modules/users/users.model")
const Chats = require("../modules/chats/chats.model")
const Match = require("../modules/shared/match/match.model")

jest.mock("../modules/users/users.model")
jest.mock("../modules/shared/match/match.model")
jest.mock("../modules/chats/chats.model") 

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
};

const createMockObjectId = (id) => {
    return {
        toString: () => id,
        equals: jest.fn((otherId) => {
            const thisId = typeof id === 'string' ? id : id.toString();
            const compareId = typeof otherId === 'string' ? otherId : otherId.toString();
            return thisId === compareId;
        }),
    };
};

describe("getTopMatches", () =>{
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("Should return orden by similarity", async() => {
        const userId = createMockObjectId("user1")
        const req = {
            user: {
                _id: userId,
                tags: ["Cine", "Fitness", "Diseño"]
            }
        }
        const res = mockResponse();
        
        const user2Id = createMockObjectId("user2")

        Match.find.mockResolvedValue([
            {
                user1: userId,
                user2: user2Id,     
                user1Liked: true
            }
        ]);

        const mockFoundUsers = [
            {_id: "user3", tags: ["Psicologia", "Arquitectura", "Diseño"], name: "User tres"},
            {_id: "user4", tags: ["Física", "Comunicación", "Abogacía"], name: "User cuatro"},
            {_id: "user5", tags: ["Informática", "Química", "Música"], name: "User cinco"},
        ];
        
        Users.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockFoundUsers),
        });

        await getTopMatches(req, res);

        expect(Match.find).toHaveBeenCalledWith({
            $or: [
                { $and: [{ user1: userId }, { user1Liked: true }] },
                { $and: [{ user2: userId }, { user2Liked: true }] },
            ],
        });

        expect(res.status).toHaveBeenCalledWith(200);

        const returnedData = res.json.mock.calls[0][0];

        expect(returnedData[0].similarityScore).toBeGreaterThanOrEqual(
            returnedData[1].similarityScore
        );

        expect(returnedData[1].similarityScore).toBeGreaterThanOrEqual(
            returnedData[2].similarityScore
        );
    })

    it("If there are no users to match, return empty", async () => {
        const req = {
            user: {
                _id: createMockObjectId("user1"),
                tags: ["coding"],
            },
        };
        const res = mockResponse();

        Match.find.mockResolvedValue([]);
        Users.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
        });

        await getTopMatches(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should exclude matching user and matched users", async () => {
        const userId = createMockObjectId("user1");
        const user2Id = createMockObjectId("user2");
        
        const req = {
            user: {
                _id: userId,
                tags: ["coding"],
            },
        };
        const res = mockResponse();

        Match.find.mockResolvedValue([
            {
                user1: userId,
                user2: user2Id,
                user1Liked: true,
            },
        ]);

        Users.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
        });

        await getTopMatches(req, res);

        // Verificar Users find
        expect(Users.find).toHaveBeenCalled();
        const callArg = Users.find.mock.calls[0][0];
        expect(callArg._id.$nin).toBeDefined();
    });

    it("should calculate similarity score correctly", async () => {
        const req = {
            user: {
                _id: createMockObjectId("user1"),
                tags: ["coding", "music"],
            },
        };
        const res = mockResponse();

        Match.find.mockResolvedValue([]);

        const mockUsers = [
            { _id: "user3", tags: ["coding", "music"], name: "User tres" }, // 2 tags en común
            { _id: "user4", tags: ["coding"], name: "User cuatro" }, // 1 tag en común
        ];

        Users.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUsers),
        });

        await getTopMatches(req, res);

        const returnedData = res.json.mock.calls[0][0];
        
        // A similarityScore de 2
        expect(returnedData[0].similarityScore).toBe(2);
        expect(returnedData[0].user._id).toBe("user3");
        
        // B similarityScore de 1
        expect(returnedData[1].similarityScore).toBe(1);
        expect(returnedData[1].user._id).toBe("user4");
    });
})

describe("postLikeUser", () =>{
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new match when no existing match", async () => {
        const req = {
            user: { _id: "user1" },
            body: { targetUser: "user2" },
        };
        const res = mockResponse();

        Match.findOne.mockResolvedValue(null);
            Match.create.mockResolvedValue({
            user1: "user1",
            user2: "user2",
            user1Liked: true,
        });

        await postLikeUser(req, res);

        expect(Match.create).toHaveBeenCalledWith({
            user1: "user1",
            user2: "user2",
            user1Liked: true,
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ok: true, data: {} });
    });

    it("should create mutual match and chat when both users liked", async () => {
        const req = {
            user: { _id: "user2" },
            body: { targetUser: "user1" },
        };
        const res = mockResponse();

        const existingMatch = {
            user1: "user1",
            user2: "user2",
            user1Liked: true,
            user2Liked: false,
            matched: false,
            save: jest.fn().mockResolvedValue(true),
        };

        Match.findOne.mockResolvedValue(existingMatch);

        const mockChat = {
            _id: "chat3",
            users: ["user1", "user2"],
        };

        // Configurar el mock de Chats.create correctamente
        Chats.create = jest.fn().mockResolvedValue(mockChat);

        await postLikeUser(req, res);

        expect(existingMatch.matched).toBe(true);
        expect(existingMatch.user2Liked).toBe(true);
        expect(existingMatch.save).toHaveBeenCalled();

        expect(Chats.create).toHaveBeenCalledWith({
            users: ["user1", "user2"],
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            data: { mutualMatch: true, newChat: mockChat },
        });
    });

    it("should not create mutual match if not mutual likes", async () => {
        const req = {
            user: { _id: "user2" },
            body: { targetUser: "user1" },
        };
        const res = mockResponse();

        const existingMatch = {
            user1: "user1",
            user2: "user2",
            user1Liked: false, // No like
            user2Liked: false,
            matched: false,
        };

        Match.findOne.mockResolvedValue(existingMatch);
        
        Chats.create = jest.fn();
        await postLikeUser(req, res);

        expect(Chats.create).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(200);
    });

    it("should return error when database operation fails", async () => {
        const req = {
            user: { _id: "user1" },
            body: { targetUser: "user2" },
        };
        const res = mockResponse();

        Match.findOne.mockRejectedValue(new Error("DB error"));

        await postLikeUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            error: "Server error!",
        });
    });

    it("should handle when Match.create fails", async () => {
        const req = {
            user: { _id: "user1" },
            body: { targetUser: "user2" },
        };
        const res = mockResponse();

        Match.findOne.mockResolvedValue(null);
        Match.create.mockRejectedValue(new Error("DB error"));

        await postLikeUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            error: "Server error!",
        });
    });

    it("should handle when Chat.create fails on mutual match", async () => {
        const req = {
            user: { _id: "user2" },
            body: { targetUser: "user1" },
        };
        const res = mockResponse();

        const existingMatch = {
            user1: "user1",
            user2: "user2",
            user1Liked: true,
            user2Liked: false,
            matched: false,
            save: jest.fn().mockResolvedValue(true),
        };

        Match.findOne.mockResolvedValue(existingMatch);
        
        // Chat mock fail
        Chats.create = jest.fn().mockRejectedValue(new Error("Chat creation failed"));

        await postLikeUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            error: "Server error!",
        });
    });

})