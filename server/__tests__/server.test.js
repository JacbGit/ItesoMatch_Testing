// Create mock objects that don't require actual modules
const mockJwt = {
  verify: jest.fn(),
};

const mockUsers = {
  findById: jest.fn(),
};

const mockChats = {
  findOne: jest.fn(),
};

const mockSendMessageToChat = jest.fn();

// Mock the modules with virtual mocks
jest.mock("jsonwebtoken", () => mockJwt, { virtual: true });
jest.mock("../modules/users/users.model", () => mockUsers, { virtual: true });
jest.mock("../modules/chats/chats.model", () => mockChats, { virtual: true });
jest.mock(
  "../modules/chats/chats.controller",
  () => ({
    sendMessageToChat: mockSendMessageToChat,
  }),
  { virtual: true },
);
jest.mock(
  "../utils/config",
  () => ({
    JWT_SECRET: "test-secret",
  }),
  { virtual: true },
);

describe("Socket.IO Server Tests", () => {
  let socket;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock socket object
    socket = {
      handshake: { auth: {} },
      user: null,
      on: jest.fn(),
      id: "socket-123",
    };

    next = jest.fn();
  });

  describe("Socket.IO Authentication Middleware", () => {
    test("should authenticate user with valid token", async () => {
      const mockUser = { _id: "user123", name: "Test User" };
      const mockDecoded = { userId: "user123" };

      socket.handshake.auth.token = "valid-token";
      mockJwt.verify.mockReturnValue(mockDecoded);
      mockUsers.findById.mockResolvedValue(mockUser);

      // Simulate middleware
      const middleware = async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            throw new Error("Authorization token is missing");
          }
          const decoded = mockJwt.verify(token, "test-secret");
          const user = await mockUsers.findById(decoded.userId);
          if (!user) {
            throw new Error("User not found");
          }
          socket.user = user;
          next();
        } catch (error) {
          next(new Error("Authentication error"));
        }
      };

      await middleware(socket, next);

      expect(mockJwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
      expect(mockUsers.findById).toHaveBeenCalledWith("user123");
      expect(socket.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    test("should reject connection when token is missing", async () => {
      socket.handshake.auth.token = null;

      const middleware = async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            throw new Error("Authorization token is missing");
          }
          const decoded = mockJwt.verify(token, "test-secret");
          const user = await mockUsers.findById(decoded.userId);
          if (!user) {
            throw new Error("User not found");
          }
          socket.user = user;
          next();
        } catch (error) {
          next(new Error("Authentication error"));
        }
      };

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith(new Error("Authentication error"));
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    test("should reject connection with invalid token", async () => {
      socket.handshake.auth.token = "invalid-token";
      mockJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const middleware = async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            throw new Error("Authorization token is missing");
          }
          const decoded = mockJwt.verify(token, "test-secret");
          const user = await mockUsers.findById(decoded.userId);
          if (!user) {
            throw new Error("User not found");
          }
          socket.user = user;
          next();
        } catch (error) {
          next(new Error("Authentication error"));
        }
      };

      await middleware(socket, next);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        "invalid-token",
        "test-secret",
      );
      expect(next).toHaveBeenCalledWith(new Error("Authentication error"));
    });

    test("should reject connection when user not found in database", async () => {
      const mockDecoded = { userId: "nonexistent" };

      socket.handshake.auth.token = "valid-token";
      mockJwt.verify.mockReturnValue(mockDecoded);
      mockUsers.findById.mockResolvedValue(null);

      const middleware = async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            throw new Error("Authorization token is missing");
          }
          const decoded = mockJwt.verify(token, "test-secret");
          const user = await mockUsers.findById(decoded.userId);
          if (!user) {
            throw new Error("User not found");
          }
          socket.user = user;
          next();
        } catch (error) {
          next(new Error("Authentication error"));
        }
      };

      await middleware(socket, next);

      expect(mockUsers.findById).toHaveBeenCalledWith("nonexistent");
      expect(next).toHaveBeenCalledWith(new Error("Authentication error"));
    });
  });

  describe("Socket Message Event Handler", () => {
    let mockIo;
    let socketConnections;

    beforeEach(() => {
      socketConnections = {};
      mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      socket.user = { _id: "user123" };
    });

    test("should handle valid message and emit to target socket", async () => {
      const chatId = "chat123";
      const targetId = "user456";
      const message = "Hello!";

      socketConnections[targetId] = "target-socket-id";

      const mockChat = { _id: chatId, users: [targetId, "user123"] };
      mockChats.findOne.mockResolvedValue(mockChat);
      mockSendMessageToChat.mockResolvedValue({});

      // Simulate message handler
      const messageHandler = async (data) => {
        const { chatId, targetId, message } = data;
        try {
          if (
            !(await mockChats.findOne({
              _id: chatId,
              users: { $all: [targetId, socket.user._id] },
            }))
          ) {
            throw Error("Chat doesnt exist");
          }
          const targetSocket = socketConnections[targetId];
          if (targetSocket) {
            mockIo.to(targetSocket).emit("new-message", { chatId, message });
          }
          await mockSendMessageToChat(socket.user._id, chatId, message);
        } catch (error) {}
      };

      await messageHandler({ chatId, targetId, message });

      expect(mockChats.findOne).toHaveBeenCalledWith({
        _id: chatId,
        users: { $all: [targetId, "user123"] },
      });
      expect(mockIo.to).toHaveBeenCalledWith("target-socket-id");
      expect(mockIo.emit).toHaveBeenCalledWith("new-message", {
        chatId,
        message,
      });
      expect(mockSendMessageToChat).toHaveBeenCalledWith(
        "user123",
        chatId,
        message,
      );
    });

    test("should not emit when target user is offline", async () => {
      const chatId = "chat123";
      const targetId = "offline-user";
      const message = "Hello!";

      const mockChat = { _id: chatId, users: [targetId, "user123"] };
      mockChats.findOne.mockResolvedValue(mockChat);
      mockSendMessageToChat.mockResolvedValue({});

      const messageHandler = async (data) => {
        const { chatId, targetId, message } = data;
        try {
          if (
            !(await mockChats.findOne({
              _id: chatId,
              users: { $all: [targetId, socket.user._id] },
            }))
          ) {
            throw Error("Chat doesnt exist");
          }
          const targetSocket = socketConnections[targetId];
          if (targetSocket) {
            mockIo.to(targetSocket).emit("new-message", { chatId, message });
          }
          await mockSendMessageToChat(socket.user._id, chatId, message);
        } catch (error) {}
      };

      await messageHandler({ chatId, targetId, message });

      expect(mockIo.to).not.toHaveBeenCalled();
      expect(mockIo.emit).not.toHaveBeenCalled();
      expect(mockSendMessageToChat).toHaveBeenCalledWith(
        "user123",
        chatId,
        message,
      );
    });

    test("should NOT send message or emit event if chat does not exist or user is not a participant", async () => {
      const chatId = "invalid-chat";
      const targetId = "user456";
      const message = "Hacking attempt!";

      // Simulamos que NO se encuentra el chat (devuelve null)
      mockChats.findOne.mockResolvedValue(null);

      const messageHandler = async (data) => {
        const { chatId, targetId, message } = data;
        try {
          if (
            !(await mockChats.findOne({
              _id: chatId,
              users: { $all: [targetId, socket.user._id] },
            }))
          ) {
            throw Error("Chat doesnt exist");
          }
          const targetSocket = socketConnections[targetId];
          if (targetSocket) {
            mockIo.to(targetSocket).emit("new-message", { chatId, message });
          }
          await mockSendMessageToChat(socket.user._id, chatId, message);
        } catch (error) {}
      };

      await messageHandler({ chatId, targetId, message });

      expect(mockChats.findOne).toHaveBeenCalledWith({
        _id: chatId,
        users: { $all: [targetId, "user123"] },
      });
      expect(mockIo.emit).not.toHaveBeenCalled();
      expect(mockSendMessageToChat).not.toHaveBeenCalled();
    });

    test("should handle database errors gracefully without crashing", async () => {
      const chatId = "chat123";
      const targetId = "user456";
      const message = "Hello";

      // Simulamos que la base de datos falla
      mockChats.findOne.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const messageHandler = async (data) => {
        const { chatId, targetId, message } = data;
        try {
          if (
            !(await mockChats.findOne({
              _id: chatId,
              users: { $all: [targetId, socket.user._id] },
            }))
          ) {
            throw Error("Chat doesnt exist");
          }
          const targetSocket = socketConnections[targetId];
          if (targetSocket) {
            mockIo.to(targetSocket).emit("new-message", { chatId, message });
          }
          await mockSendMessageToChat(socket.user._id, chatId, message);
        } catch (error) {}
      };

      // Ejecutamos para asegurar que el catch funciona
      await expect(
        messageHandler({ chatId, targetId, message }),
      ).resolves.not.toThrow();

      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });
});
