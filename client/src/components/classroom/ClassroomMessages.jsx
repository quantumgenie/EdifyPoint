import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomMessages.css';

const ClassroomMessages = ({ classroom }) => {
    return (
        <div>
            <h2>Messages</h2>
        </div>
    );
}

ClassroomMessages.propTypes = {
    classroom: PropTypes.object.isRequired
};

export default ClassroomMessages;