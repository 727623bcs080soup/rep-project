// src/pages/UploadPage.js
import React, { useState } from 'react';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css'; 

const UploadPage = () => {
  const [preview, setPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [loadingAI, setLoadingAI] = useState(false);
  const [fileName, setFileName] = useState('No file selected'); // <-- NEW: State for file name

  const { title, description, tags } = formData;
  const navigate = useNavigate();

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setPreview(URL.createObjectURL(selectedFile));
    setFileName(selectedFile.name); // <-- NEW: Set file name
    analyzeImage(selectedFile);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const analyzeImage = async (imageFile) => {
    if (!imageFile) return;
    const uploadData = new FormData();
    uploadData.append('image', imageFile);
    setLoadingAI(true);
    try {
      const res = await API.post('/posts/analyze', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { suggestions, imageUrl } = res.data;
      
      setFormData({
        title: suggestions.title,
        description: suggestions.description,
        tags: suggestions.tags,
      });
      setCategory(suggestions.category || 'Other');
      setImageUrl(imageUrl);

    } catch (err) {
      console.error('Error analyzing image:', err);
      alert('AI analysis failed. Please fill in the details manually.');
    }
    setLoadingAI(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please wait for image to upload and analyze.');
      return;
    }
    try {
      const postData = { title, description, tags, imageUrl, category };
      await API.post('/posts/create', postData);
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <div className="upload-page">
      <h2>What have you been working on?</h2>
      <div className="upload-container">
        
        {/* --- 1. UPDATED PREVIEW & FILE INPUT --- */}
        <div className="upload-preview-area">
          <div className="upload-preview-box">
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className="upload-placeholder">
                <svg /* ... (icon) ... */ >...</svg>
                <p>Drag and drop your shot</p>
              </div>
            )}
          </div>
          
          {/* This is the styled button */}
          <div className="upload-file-wrapper">
            <input 
              type="file" 
              id="file-upload" /* 1. Add ID */
              className="file-upload-input" /* 2. Hide this */
              onChange={onFileChange} 
              accept="image/png, image/jpeg, image/gif"
            />
            {/* 3. This is the new button */}
            <label htmlFor="file-upload" className="file-upload-label">
              Choose File
            </label>
            <span className="file-name">{fileName}</span>
          </div>
        </div>
        {/* --- END UPDATE --- */}
        
        <form className="upload-form" onSubmit={onSubmit}>
          {loadingAI && <div className="ai-loading">Analyzing with AI...</div>}
          
          <label htmlFor="title">Title</label>
          <input type="text" name="title" value={title} onChange={onChange} />
          
          <label htmlFor="description">Description</label>
          <textarea name="description" value={description} onChange={onChange}></textarea>
          
          <label htmlFor="category">Category (Auto-suggested)</label>
          <input type="text" name="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input type="text" name="tags" value={tags} onChange={onChange} />
          
          <button type="submit" className="publish-button" disabled={loadingAI}>
            Publish Shot
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;