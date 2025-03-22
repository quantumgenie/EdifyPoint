const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

// Get all messages for a classroom (either private or group)
router.get('/classroom/:classroomId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            classroom: req.params.classroomId,
            $or: [
                { receiver: req.user._id },
                { sender: req.user._id },
                { isGroupMessage: true }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get private messages between two users
router.get('/private/:userId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            isGroupMessage: false,
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new message
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, sender, senderType, receiver, receiverType, classroom, isGroupMessage } = req.body;
        
        // Validate required fields
        if (!content || !sender || !senderType || !receiver || !receiverType || !classroom) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const message = new Message({
            content,
            sender,
            senderType,
            receiver,
            receiverType,
            classroom,
            isGroupMessage: isGroupMessage || false
        });

        const savedMessage = await message.save();
        console.log('Message saved:', savedMessage);
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
