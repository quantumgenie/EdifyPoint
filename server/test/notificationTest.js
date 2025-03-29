const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:8080');

// Test data
const testData = {
    classroom: {
        _id: '679ecae20cece4e4f888474b', // classroom ID
        name: 'Belvoir P7 B'
    },
    message: {
        senderName: 'Test Teacher',
        content: 'Test message content',
        classroom: '679ecae20cece4e4f888474b', // classroom id
        isGroupMessage: true
    },
    event: {
        title: 'Test Event',
        description: 'Test event description',
        classroom: '679ecae20cece4e4f888474b', // classroom id
        date: new Date().toISOString()
    },
    report: {
        title: 'Test Report',
        content: 'Test report content',
        classroom: '679ecae20cece4e4f888474b', // classroom id
        studentId: '67a40e01a8696a19d1b19253' // student ID
    }
};

// Test functions
function testGroupMessage() {
    console.log('Testing group message notification...');
    socket.emit('sendMessage', testData.message);
}

function testPrivateMessage() {
    console.log('Testing private message notification...');
    const privateMessage = {
        ...testData.message,
        isGroupMessage: false,
        sender: '67939c014ef993d8482c5fd1', // teacher ID
        receiver: '67939c834ef993d8482c5fd7', // parent ID
    };
    socket.emit('sendMessage', privateMessage);
}

function testEvent() {
    console.log('Testing event notification...');
    socket.emit('createEvent', testData.event);
    
    // Test event update after 2 seconds
    setTimeout(() => {
        console.log('Testing event update notification...');
        socket.emit('updateEvent', {
            ...testData.event,
            title: 'Updated Test Event'
        });
    }, 2000);
}

function testReport() {
    console.log('Testing report notification...');
    socket.emit('createReport', testData.report);
    
    // Test report update after 2 seconds
    setTimeout(() => {
        console.log('Testing report update notification...');
        socket.emit('updateReport', {
            ...testData.report,
            title: 'Updated Test Report'
        });
    }, 2000);
}

// Run all tests with delays between them
socket.on('connect', () => {
    console.log('Connected to server');
    
    // Join the test classroom
    socket.emit('joinRoom', testData.classroom._id);
    console.log('Joined test classroom');

    // Run tests in sequence
    setTimeout(testGroupMessage, 1000);
    setTimeout(testPrivateMessage, 3000);
    setTimeout(testEvent, 5000);
    setTimeout(testReport, 8000);
});

// Listen for any errors
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});
