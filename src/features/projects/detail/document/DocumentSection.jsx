import React, { useState, useRef } from 'react';
import { FaDownload, FaTrashAlt } from 'react-icons/fa';
import { BASE_URL } from '../../../../utils/constants';
import Helper from '../../../../utils/hepler';

// export default function DocumentsSection({ documents, selectedFiles, setSelectedFiles, downloadingDocId, setDownloadingDocId, projectId, onRefresh }) {
//   const [visible, setVisible] = useState(false);
//   const fileInputRef = useRef(null);


export default function DocumentsSection({
  documents = [],            // parent sends this
  projectId,                 // parent sends this
  onRefresh = () => {},      // parent callback
}) {
  /* move these into local state */
  const [selectedFiles,    setSelectedFiles]    = useState([]);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  const [visible, setVisible] = useState(false);
  const fileInputRef = useRef(null);



  const handleUpload = () => {
    if (!selectedFiles.length) return alert("Please select at least one file.");

    const formData = new FormData();
    formData.append("projectId", projectId);
    selectedFiles.forEach(file => formData.append("files", file));

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
      .catch(() => alert("An error occurred during upload."));
  };

  const handleDelete = id => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    fetch(`${BASE_URL}/projectDocuments/delete/${id}`, { method: 'DELETE' })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status }) => {
        if (status === 200) {
          alert("Document deleted successfully.");
          onRefresh();
        } else {
          alert("Failed to delete document.");
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
              <button onClick={() => fileInputRef.current.click()}>Upload New Document</button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSelectedFiles(prev => [...prev, ...files]);
                }}
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
                    <button className="remove-btn" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}>❌</button>
                  </div>
                ))}
              </div>
              <button onClick={handleUpload}>Upload Selected Files</button>
            </div>
          )}

          {documents.length === 0 ? (
            <p className="no-data">⚠️ No documents found for this project.</p>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Type</th>
                
                {Helper.checkPermission('editDocuments') && (
                  <th>Actions</th>
                )}
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
                        <button className="small-btn delete" onClick={() => handleDelete(doc.id)}>
                          <FaTrashAlt />
                        </button>
                        <button
                          className="small-btn download"
                          onClick={() => handleDownload(doc.id, doc.file_name)}
                          disabled={downloadingDocId === doc.id}
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
