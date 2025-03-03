import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogin } from '../redux/state';
import '../styles/profileSettings.scss';
import URL from "../constants/api";

const ProfileSettings = () => {
  // Tab management states
  const [activeTab, setActiveTab] = useState('info');
  const dispatch = useDispatch();
  
  // Get user information and token from Redux store
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  // User data states
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [infoForm, setInfoForm] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        setError("You must be logged in to access this page");
        setLoading(false);
        return;
      }
      
      console.log("Sending request to", URL.FETCH_PROFILE);
      console.log("Token used:", authToken ? `${authToken.substring(0, 10)}...` : "No token");
      
      const response = await fetch(URL.FETCH_PROFILE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ message: "Server error" }));
        throw new Error(errorData.message || "Error retrieving data");
      }
      
      const data = await response.json();
      console.log("User data received:", data);
      setUserData(data);
      
      // Initialize form with user data
      setInfoForm({
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      });
    } catch (err) {
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      
      if (err instanceof TypeError && err.message.includes('cors')) {
        setError("CORS Error: The server doesn't allow this request. Please contact the administrator.");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchUserData();
  }, [token]);
  
  // Handlers for form changes
  const handleInfoChange = (e) => {
    setInfoForm({
      ...infoForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      
      // Create URL for image preview
      const previewURL = window.URL.createObjectURL(file);
    setImagePreview(previewURL);
  }
};
  
  // CORS pre-check utility
  const checkCorsAccess = async (url, method = 'OPTIONS') => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        },
        mode: 'cors'
      });
      return response.ok;
    } catch (err) {
      console.error("CORS Error:", err);
      return false;
    }
  };
  
  // Personal information form submission
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const authToken = token || localStorage.getItem('token');
      
      console.log("Sending request to", URL.UPDATE_PROFILE);
      console.log("Data sent:", infoForm);
      console.log("Token used:", authToken ? `${authToken.substring(0, 10)}...` : "No token");
      
      const response = await fetch(URL.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(infoForm)
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ message: "Server error" }));
        throw new Error(errorData.message || "Error updating information");
      }
      
      const data = await response.json();
      console.log("Data received after update:", data);
      setUserData(data);
      
      // Update Redux state
      if (user) {
        dispatch(setLogin({
          user: {
            ...user,
            firstName: data.firstName,
            lastName: data.lastName
          },
          token: authToken
        }));
      }
      
      setSuccess("Information updated successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      
      if (err instanceof TypeError && err.message.includes('cors')) {
        setError("CORS Error: The server doesn't allow this request. Please contact the administrator.");
      } else {
        setError(err.message || "An error occurred while updating");
      }
    }
  };
  
  // Password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Check that new passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    try {
      // CORS pre-check
      const corsOk = await checkCorsAccess(URL.UPDATE_PASSWORD);
      if (!corsOk) {
        console.warn("Potential CORS issue - attempting workaround...");
      }
      
      const authToken = token || localStorage.getItem('token');
      
      console.log("Sending request to", URL.UPDATE_PASSWORD);
      console.log("Data sent:", {
        currentPassword: "***", // masked for security
        newPassword: "***" // masked for security
      });
      console.log("Token used:", authToken ? `${authToken.substring(0, 10)}...` : "No token");
      
      const response = await fetch(URL.UPDATE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ message: "Server error" }));
        throw new Error(errorData.message || "Error updating password");
      }
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess("Password updated successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      
      if (err instanceof TypeError && err.message.includes('cors')) {
        setError("CORS Error: The server doesn't allow this request. Please contact the administrator.");
      } else {
        setError(err.message || "An error occurred while updating password");
      }
    }
  };
  
  // Profile image form submission
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError("Please select an image");
      return;
    }
    
    setError(null);
    setSuccess(null);
    setImageUploading(true);
    
    try {
      const authToken = token || localStorage.getItem('token');
      
      console.log("Sending request to", URL.UPDATE_PICTURE);
      console.log("Token used:", authToken ? `${authToken.substring(0, 10)}...` : "No token");
      
      // Create FormData object to send image
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await fetch(URL.UPDATE_PICTURE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include',
        body: formData
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ message: "Server error" }));
        throw new Error(errorData.message || "Error uploading image");
      }
      
      const data = await response.json();
      console.log("Data received after image upload:", data);
      setUserData(data);
      
      // Update Redux state with new image
      if (user) {
        dispatch(setLogin({
          user: {
            ...user,
            profileImagePath: data.profileImagePath
          },
          token: authToken
        }));
      }
      
      setSuccess("Profile picture updated successfully");
      setImageFile(null);
      setImagePreview(null);
      
      // Reset file field
      document.getElementById('imageInput').value = '';
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      
      if (err instanceof TypeError && err.message.includes('cors')) {
        setError("CORS Error: The server doesn't allow this request. Please contact the administrator.");
      } else {
        setError(err.message || "An error occurred while uploading the image");
      }
    } finally {
      setImageUploading(false);
    }
  };
  
  // Function to change active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };
  
  if (loading) {
    return (
      <div className="profile-settings-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Check if user is logged in
  if (!user && !token) {
    return (
      <div className="profile-settings-container">
        <div className="alert alert-error">
          You must be logged in to access this page.
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-settings-container">
      <h1 className="settings-title">Profile Settings</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`} 
          onClick={() => handleTabClick('info')}
        >
          Personal Information
        </div>
        <div 
          className={`tab ${activeTab === 'password' ? 'active' : ''}`} 
          onClick={() => handleTabClick('password')}
        >
          Change Password
        </div>
        <div 
          className={`tab ${activeTab === 'photo' ? 'active' : ''}`} 
          onClick={() => handleTabClick('photo')}
        >
          Profile Picture
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="card">
            <form onSubmit={handleInfoSubmit} className="form info-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={infoForm.firstName}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={infoForm.lastName}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={userData?.email || user?.email || ''}
                  disabled
                />
                <small className="form-text">Email address cannot be changed.</small>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="card">
            <form onSubmit={handlePasswordSubmit} className="form password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
                <small className="form-text">Minimum 8 characters</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'photo' && (
          <div className="card photo-card">
            <div className="profile-photo-container">
              <img
                src={imagePreview || userData?.profileImagePath || user?.profileImagePath || "/default-avatar.png"}
                alt="Profile Picture"
                className="profile-photo"
              />
            </div>
            
            <form onSubmit={handleImageSubmit} className="form photo-form">
              <div className="form-group">
                <label htmlFor="imageInput" className="file-upload-label">
                  Select Image
                </label>
                <input
                  id="imageInput"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-upload-input"
                />
                <small className="form-text">Recommended formats: JPG, PNG. Max size: 5MB</small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${imageUploading ? 'loading' : ''}`}
                  disabled={!imageFile || imageUploading}
                >
                  {imageUploading ? 'Uploading...' : 'Update Picture'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
