const { getAllChats, getMessagesFromChat, sendMessageToChat } = require("../modules/chats/chats.controller");

const Chats = require("../modules/chats/chats.model");
const Messages = require("../modules/messages/messages.model");

// Mock de los modelos
jest.mock("../modules/chats/chats.model");
jest.mock("../modules/messages/messages.model");

// Mock del response de Express
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getAllChats", () => {

  it("should return only chats with at least 2 users", async () => {
    const req = { user: { _id: "user123" } };
    const res = mockResponse();

    const mockChats = [
      { users: ["user123", "user456"] },
      { users: ["user123"] },
    ];

    Chats.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockChats),
    });

    await getAllChats(req, res);

    expect(Chats.find).toHaveBeenCalledWith({ users: "user123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [{ users: ["user123", "user456"] }],
    });
  });

  it("should return empty list when there are no chats", async () => {
    const req = { user: { _id: "user123" } };
    const res = mockResponse();

    Chats.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    await getAllChats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: [] });
  });

  it("should return error if there is a database error", async () => {
    const req = { user: { _id: "user123" } };
    const res = mockResponse();

    Chats.find.mockReturnValue({
      populate: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(getAllChats(req, res)).rejects.toThrow("DB error");
  });
});


describe("getMessagesFromChat", () => {

  it("should return 400 if the chat does not exist or does not belong to the user", async () => {
    const req = { user: { _id: "user123" }, params: { id: "chat123" } };
    const res = mockResponse();

    Chats.findOne.mockResolvedValue(null);

    await getMessagesFromChat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false });
  });

  it("should return ordered messages when the chat exists", async () => {
    const req = { user: { _id: "user123" }, params: { id: "chat123" } };
    const res = mockResponse();

    Chats.findOne.mockResolvedValue({ _id: "chat123", users: ["user123"] });

    const mockMessages = [
      { content: "Hola", timestamp: 1 },
      { content: "Qué tal", timestamp: 2 },
    ];

    Messages.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockMessages),
    });

    await getMessagesFromChat(req, res);

    expect(Messages.find).toHaveBeenCalledWith({ chat: "chat123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: mockMessages,
    });
  });

  it("should return empty list when there are no messages", async () => {
    const req = { user: { _id: "user123" }, params: { id: "chat123" } };
    const res = mockResponse();

    Chats.findOne.mockResolvedValue({ _id: "chat123", users: ["user123"] });

    Messages.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    await getMessagesFromChat(req, res);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [],
    });
  });

  it("should throw an error if there is an error fetching messages", async () => {
    const req = { user: { _id: "user123" }, params: { id: "chat123" } };
    const res = mockResponse();

    Chats.findOne.mockResolvedValue({ _id: "chat123", users: ["user123"] });

    Messages.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(getMessagesFromChat(req, res)).rejects.toThrow("DB error");
  });

});


describe("sendMessageToChat", () => {

  it("should create a new message", async () => {
    Messages.create.mockResolvedValue({});

    await sendMessageToChat("user123", "chat123", "Hola!");

    expect(Messages.create).toHaveBeenCalledWith({
      chat: "chat123",
      sender: "user123",
      content: "Hola!",
    });
  });

  it("should throw error if creation in DB fails", async () => {
    Messages.create.mockRejectedValue(new Error("DB error"));

    await expect(
      sendMessageToChat("user123", "chat123", "Hola!")
    ).rejects.toThrow("DB error");
  });

  it("should fail if the message is missing", async () => {
    await expect(
      sendMessageToChat("user123", "chat123", null)
    ).rejects.toThrow();
  });

  it("should fail if chatId is missing", async () => {
    await expect(
      sendMessageToChat("user123", null, "Hola")
    ).rejects.toThrow();
  });

  it("should fail if userId is missing", async () => {
    await expect(
      sendMessageToChat(null, "chat123", "Hola")
    ).rejects.toThrow();
  });
});
