const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// שליחת הודעה חדשה
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;
    
    // יצירת הודעה חדשה
    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType
    });
    
    await message.save();
    
    // Populate the message after saving
    await message.populate([
      { path: 'senderId', select: 'name profilePicture' },
      { path: 'receiverId', select: 'name profilePicture' }
    ]);
    
    // חיפוש או יצירת שיחה
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        lastMessage: message._id,
        unreadCount: new Map([[receiverId, 1]])
      });
    } else {
      conversation.lastMessage = message._id;
      const unreadCount = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, unreadCount + 1);
    }
    
    await conversation.save();
    
    // שליחת הודעה בזמן אמת - רק למקבל!
    const io = req.app.get('io');
    if (io) {
      const roomId = [senderId, receiverId].sort().join("_");
      // שלח רק למקבל, לא לשולח
      io.to(roomId).emit('new-message', message);
      console.log('Message emitted to room:', roomId);
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// שאר הפונקציות נשארות כמו שהן...
const getConversationMessages = async (req, res) => {
  try {
    const { otherId } = req.params;
    const currentUserId = req.user.id;
    
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherId },
        { senderId: otherId, receiverId: currentUserId }
      ]
    })
    .populate([
      { path: 'senderId', select: 'name profilePicture' },
      { path: 'receiverId', select: 'name profilePicture' }
    ])
    .sort({ createdAt: 1 });
    
    // סימון הודעות כנקראו
    await Message.updateMany(
      { senderId: otherId, receiverId: currentUserId, isRead: false },
      { isRead: true }
    );
    
    // עדכון ספירת הודעות שלא נקראו בשיחה
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherId] }
    });
    
    if (conversation) {
      conversation.unreadCount.set(currentUserId, 0);
      await conversation.save();
    }
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate([
      { path: 'participants', select: 'name profilePicture favoriteTeam' },
      { path: 'lastMessage' }
    ])
    .sort({ updatedAt: -1 });
    
    // הכנת המידע להחזרה
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount.get(userId) || 0,
        updatedAt: conv.updatedAt
      };
    });
    
    res.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

module.exports = {
  sendMessage,
  getConversationMessages,
  getConversations
};