import React, { useState, useEffect, useRef } from 'react';
import '../styles/EditClassModal.css';
import axios from 'axios';

const EditClassModal = ({ isOpen, onClose, classroom, onSave, onStudentsUpdate }) => {
  const [activeTab, setActiveTab] = useState('Class Details');
  const [formData, setFormData] = useState({
    name: classroom.name,
    school: classroom.school
  });
  const [studentInput, setStudentInput] = useState('');
  const [newStudents, setNewStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localStudents, setLocalStudents] = useState(classroom?.students || []);
  const [lastRemovedStudent, setLastRemovedStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [studentParents, setStudentParents] = useState({});
  const [loadingParents, setLoadingParents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  const [lastRemovedParentLink, setLastRemovedParentLink] = useState(null);

  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage('');
        if (!successMessage.includes('restored')) {
          setLastRemovedStudent(null);
        }
      }, 10000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [successMessage]);

  useEffect(() => {
    setLocalStudents(classroom?.students || []);
  }, [classroom]);

  const fetchUpdatedClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/${classroom._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLocalStudents(response.data.students);
      if (onStudentsUpdate) {
        onStudentsUpdate(response.data.students);
      }
    } catch (err) {
      console.error('Error fetching updated classroom:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStudentInput = (e) => {
    setStudentInput(e.target.value);
    // Split input by newlines and filter out empty lines
    const students = e.target.value
      .split('\n')
      .filter(name => name.trim())
      .map(name => ({
        name: name.trim(),
        isValid: true
      }));
    setNewStudents(students);
  };

  const handleRemoveStudent = async (studentId, firstName, lastName) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/classrooms/${classroom._id}/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLastRemovedStudent({
        id: studentId,
        firstName,
        lastName,
        fullData: localStudents.find(s => s._id === studentId)
      });

      setSuccessMessage(`${firstName} ${lastName} studentwas removed successfully`);
      await fetchUpdatedClassroom();
    } catch (err) {
      console.error('Error removing student:', err);
      setError('Failed to remove student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoStudentRemoval = async () => {
    if (!lastRemovedStudent) return;

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/classrooms/${classroom._id}/students/restore`,
        { student: lastRemovedStudent.fullData },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage(`${lastRemovedStudent.firstName} ${lastRemovedStudent.lastName} was restored successfully`);
      setLastRemovedStudent(null);
      await fetchUpdatedClassroom();
    } catch (err) {
      console.error('Error restoring student:', err);
      setError('Failed to restore student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (activeTab === 'Students' && newStudents.length > 0) {
        await axios.put(
          `http://localhost:8080/api/classrooms/${classroom._id}/students`,
          {
            newStudents: newStudents.map(student => student.name)
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSuccessMessage('Students added successfully');
        setStudentInput(''); // Clear the input
        setNewStudents([]); // Clear the preview
        await fetchUpdatedClassroom(); // Refresh the students list
      } else if (activeTab === 'Class Details') {
        await onSave(formData);
        setSuccessMessage('Class details updated successfully');
        onClose();
      }
    } catch (err) {
      console.error('Error saving:', err);
      setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use the same sortStudents function for both Students and Parents tabs
  const sortStudents = (students) => {
    return [...students].sort((a, b) => {
      // First compare by last name
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      // If last names are the same, compare by first name
      if (lastNameCompare === 0) {
        return a.firstName.localeCompare(b.firstName);
      }
      return lastNameCompare;
    });
  };

  // Add this function to fetch student-parent relationships
  const fetchStudentParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/${classroom._id}/students/parents`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Create a map of studentId -> parentId
      const parentMap = {};
      response.data.forEach(student => {
        if (student.parentId) {
          parentMap[student._id] = student.parentId;
        }
      });
      
      setStudentParents(parentMap);
    } catch (err) {
      console.error('Error fetching student parents:', err);
      setError('Failed to load student-parent relationships');
    }
  };

  // Fetch parents and student-parent relationships when Parents tab is selected
  useEffect(() => {
    if (activeTab === 'Parents') {
      fetchParents();
      fetchStudentParents();
    }
  }, [activeTab]);

  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const token = localStorage.getItem('token');
      console.log('Fetching parents...'); // Debug log
      
      const response = await axios.get(
        'http://localhost:8080/api/parents',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Parents response:', response.data); // Debug log
      
      const sortedParents = response.data.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare === 0) {
          return a.firstName.localeCompare(b.firstName);
        }
        return lastNameCompare;
      });
      
      setParents(sortedParents);
      console.log('Sorted parents:', sortedParents); // Debug log
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Failed to load parents');
    } finally {
      setLoadingParents(false);
    }
  };

  // Add this useEffect to log when parents state changes
  useEffect(() => {
    console.log('Parents state updated:', parents);
  }, [parents]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(studentId => {
        if (dropdownRefs.current[studentId] && !dropdownRefs.current[studentId].contains(event.target)) {
          setIsDropdownOpen(prev => ({ ...prev, [studentId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter parents based on search query
  const getFilteredParents = (query) => {
    return parents.filter(parent => 
      `${parent.firstName} ${parent.lastName} ${parent.email || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  };

  // Handle parent selection
  const handleParentSelect = async (studentId, parent) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage(''); // Clear any existing message
      
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/students/${studentId}/parent`,
        { parentId: parent._id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setStudentParents(prev => ({
        ...prev,
        [studentId]: parent._id
      }));
      
      setIsDropdownOpen(prev => ({ ...prev, [studentId]: false }));
      const student = localStudents.find(s => s._id === studentId);
      setSuccessMessage(`Assigned ${parent.title} ${parent.lastName} as parent of ${student.firstName} ${student.lastName}`);
    } catch (err) {
      console.error('Error assigning parent:', err);
      setError('Failed to assign parent');
    } finally {
      setLoading(false);
    }
  };

  // Update the dropdown display
  const getSelectedParentName = (studentId) => {
    const parentId = studentParents[studentId];
    if (!parentId) return 'Select Parent';
    
    const parent = parents.find(p => p._id === parentId);
    if (!parent) return 'Select Parent';
    
    return `${parent.title} ${parent.firstName} ${parent.lastName}`;
  };

  // Add function to remove parent link
  const handleRemoveParent = async (studentId) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage(''); // Clear any existing message
      
      const token = localStorage.getItem('token');
      
      // Store the current relationship for potential undo
      const currentParentId = studentParents[studentId];
      const student = localStudents.find(s => s._id === studentId);
      const parent = parents.find(p => p._id === currentParentId);
      
      setLastRemovedParentLink({
        studentId,
        parentId: currentParentId,
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: `${parent.title} ${parent.firstName} ${parent.lastName}`
      });

      await axios.delete(
        `http://localhost:8080/api/students/${studentId}/parent`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStudentParents(prev => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });

      setSuccessMessage(`Removed ${parent.title} ${parent.lastName} as parent of ${student.firstName} ${student.lastName}`);
    } catch (err) {
      console.error('Error removing parent link:', err);
      setError('Failed to remove parent link');
    } finally {
      setLoading(false);
    }
  };

  // Add function to restore parent link
  const handleUndoParentRemoval = async () => {
    if (!lastRemovedParentLink) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMessage(''); // Clear any existing message
      
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:8080/api/students/${lastRemovedParentLink.studentId}/parent`,
        { parentId: lastRemovedParentLink.parentId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStudentParents(prev => ({
        ...prev,
        [lastRemovedParentLink.studentId]: lastRemovedParentLink.parentId
      }));

      setSuccessMessage(`Restored ${lastRemovedParentLink.parentName} as parent of ${lastRemovedParentLink.studentName}`);
      setLastRemovedParentLink(null);
    } catch (err) {
      console.error('Error restoring parent link:', err);
      setError('Failed to restore parent link');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect for success message timer
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage('');
        // Only clear lastRemovedParentLink if it was a removal action that wasn't undone
        if (!successMessage.includes('Restored')) {
          setLastRemovedParentLink(null);
        }
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [successMessage]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{classroom.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={activeTab === 'Class Details' ? 'active' : ''} 
            onClick={() => setActiveTab('Class Details')}
          >
            Class Details
          </button>
          <button 
            className={activeTab === 'Students' ? 'active' : ''} 
            onClick={() => setActiveTab('Students')}
          >
            Students
          </button>
          <button 
            className={activeTab === 'Parents' ? 'active' : ''} 
            onClick={() => setActiveTab('Parents')}
          >
            Parents
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">
              {successMessage}
              {((lastRemovedStudent && !successMessage.includes('restored')) || 
                (lastRemovedParentLink && !successMessage.includes('Restored'))) && (
                <button 
                  className="undo-button"
                  onClick={() => {
                    if (lastRemovedStudent) {
                      handleUndoStudentRemoval();
                    } else if (lastRemovedParentLink) {
                      handleUndoParentRemoval();
                    }
                  }}
                  disabled={loading}
                >
                  Undo
                </button>
              )}
            </div>
          )}

          {activeTab === 'Class Details' && (
            <div className="class-details-form">
              <div className="form-group">
                <label>Class</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>School</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {activeTab === 'Students' && (
            <div className="students-tab">
              <div className="add-students-section">
                <div className="input-header">
                  <span>Copy/Paste from text editor</span>
                  <span className="input-hint">(one per line)</span>
                </div>
                <textarea
                  value={studentInput}
                  onChange={handleStudentInput}
                  placeholder="Enter names of students you want to add then press Save..."
                  rows={6}
                  className="students-input"
                />
              </div>
              
              {newStudents.length > 0 && (
                <div className="students-preview">
                  {newStudents.map((student, index) => (
                    <div key={index} className="student-preview-item">
                      <div className="student-avatar">
                        <img src="/student-avatar.png" alt="Student" />
                      </div>
                      <span>{student.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="existing-students">
                {sortStudents(localStudents).map(student => (
                  <div key={student._id} className="student-item">
                    <div className="student-info">
                      <div className="student-avatar">
                        <img src="/student-avatar.png" alt="Student" />
                      </div>
                      <span>{student.firstName} {student.lastName}</span>
                    </div>
                    <button 
                      className="remove-student"
                      onClick={() => handleRemoveStudent(
                        student._id,
                        student.firstName,
                        student.lastName
                      )}
                      disabled={loading}
                    >
                      {loading ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Parents' && (
            <div className="parents-tab">
              <div className="parents-list">
                {sortStudents(localStudents).map(student => (
                  <div key={student._id} className="student-parent-item">
                    <div className="student-info">
                      <div className="student-avatar">
                        <img src="/student-avatar.png" alt="Student" />
                      </div>
                      <span className="student-name">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="parent-controls">
                      <div 
                        className={`custom-select-container ${studentParents[student._id] ? 'has-selection' : ''}`}
                        ref={el => dropdownRefs.current[student._id] = el}
                      >
                        <div 
                          className={`select-header ${studentParents[student._id] ? 'has-selection' : ''}`}
                          onClick={() => setIsDropdownOpen(prev => ({
                            ...prev,
                            [student._id]: !prev[student._id]
                          }))}
                        >
                          <span>{getSelectedParentName(student._id)}</span>
                          <span className="dropdown-arrow">▼</span>
                        </div>
                        {isDropdownOpen[student._id] && (
                          <div className="select-dropdown">
                            <input
                              type="text"
                              placeholder="Search parents..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="parent-search"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="options-container">
                              {getFilteredParents(searchQuery).map(parent => (
                                <div
                                  key={parent._id}
                                  className={`option ${studentParents[student._id] === parent._id ? 'selected' : ''}`}
                                  onClick={() => handleParentSelect(student._id, parent)}
                                >
                                  <span className="parent-name">
                                    {parent.title} {parent.lastName}, {parent.firstName}
                                  </span>
                                  {parent.email && (
                                    <span className="parent-email">
                                      {parent.email}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {getFilteredParents(searchQuery).length === 0 && (
                                <div className="no-results">No parents found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {studentParents[student._id] && (
                        <button
                          className="remove-parent-button"
                          onClick={() => handleRemoveParent(student._id)}
                          disabled={loading}
                        >
                          <span className="remove-icon">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal; 