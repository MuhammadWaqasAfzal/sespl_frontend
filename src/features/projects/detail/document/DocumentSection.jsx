import React, { useState, useRef } from 'react';
import { FaDownload, FaTrashAlt } from 'react-icons/fa';
import { BASE_URL } from '../../../../utils/constants';
import Helper from '../../../../utils/hepler';
import '../ProjectDetail.css'


export default function DocumentsSection({
  documents = [],
  projectId,
  onRefresh = () => {},
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = () => {
    if (!selectedFiles.length) return alert("Please select at least one file.");

    const formData = new FormData();
    formData.append("projectId", projectId);
    selectedFiles.forEach(file => formData.append("files", file));

    setIsUploading(true);

    fetch(`${BASE_URL}/projectDocuments/upload`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          alert(`${data?.data?.uploadedCount || 'Some'} file(s) uploaded successfully.`);
          setSelectedFiles([]);
          onRefresh();
        } else {
          alert(`Upload failed: ${data.message || "Unknown error"}`);
        }
      })
      .catch(() => {
        alert("An error occurred during upload.");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleDelete = id => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    fetch(`${BASE_URL}/projectDocuments/delete/${id}`, { method: 'DELETE' })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          alert("Document deleted successfully.");
          onRefresh();
        } else {
          alert(data.message || "Failed to delete document.");
        }
      });
  };

  const handleDownload = async (docId, fileName) => {
    try {
      setDownloadingDocId(docId);
      const res = await fetch(`${BASE_URL}/projectDocuments/download/${docId}`);
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download document.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="dropdown-section">
      <div className="dropdown-section-header" onClick={() => setVisible(!visible)}>
        <h3>🔐 Documents</h3>
        <span>{visible ? '▲' : '▼'}</span>
      </div>
      {visible && (
        <div className="section-box">
          <h2>Project Documents</h2>

          {Helper.checkPermission('editDocuments') && (
            <div className="header-buttons">
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
              >
                Upload New Document
              </button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSelectedFiles(prev => [...prev, ...files]);
                }}
                disabled={isUploading}
              />
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="selected-files horizontal-scroll">
              <p><strong>Selected Files:</strong></p>
              <div className="file-list-horizontal">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      disabled={isUploading}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Selected Files"}
              </button>
              {isUploading && (
                <div className="upload-spinner">
                  <div className="spinner"></div>
                  <p>Uploading files, please wait...</p>
                </div>
              )}
            </div>
          )}

          {documents.length === 0 ? (
            <p className="no-data">⚠️ No documents found for this project.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  {Helper.checkPermission('editDocuments') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc.id}>
                    <td>{index + 1}</td>
                    <td>{doc.file_name}</td>
                    <td>{doc.file_type}</td>
                    {Helper.checkPermission('editDocuments') && (
                      <td>
                        <button
                          className="small-btn delete"
                          onClick={() => handleDelete(doc.id)}
                          disabled={isUploading}
                        >
                          <FaTrashAlt />
                        </button>
                        <button
                          className="download"
                          onClick={() => handleDownload(doc.id, doc.file_name)}
                          disabled={downloadingDocId === doc.id || isUploading}
                        >
                          {downloadingDocId === doc.id ? "⬇️ Downloading..." : <FaDownload />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
