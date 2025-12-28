import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import apiService from '../../services/apiService';

const ApprovedUploadSection = ({
  approvedRequest,
  signedFormFile,
  setSignedFormFile,
  uploadingSignedForm,
  onUpload,
  onDelete
}) => {
  const hasUploadedFile = !!approvedRequest?.studentFile;

  const handleDownload = async () => {
    try {
      const url = apiService.downloadStudentFile(approvedRequest.id);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `request-${approvedRequest.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  const handleDownloadSignedFile = async () => {
    try {
      const url = apiService.downloadTeacherFile(approvedRequest.id);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `signed-request-${approvedRequest.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  return (
    <>
      <h2 className="section-title">{approvedRequest?.teacherFile ? 'Download Signed Request' : 'Upload Signed Request'}</h2>
      <Card>
        <div className="title">Your approved placement</div>
        <div className="meta" style={{ marginTop: 8 }}>
          {approvedRequest?.session?.universitySession?.name && approvedRequest?.session?.professor?.fullName
            ? `${approvedRequest.session.universitySession.name} - ${approvedRequest.session.professor.fullName}`
            : `Request #${approvedRequest?.id?.slice(0, 6).toUpperCase()}`}
        </div>
        {approvedRequest?.session?.professor?.department && (
          <div className="meta" style={{ marginTop: 4 }}>
            Department: {approvedRequest.session.professor.department}
          </div>
        )}
        {approvedRequest?.teacherFile ? (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              <strong>✓ Signed Request Ready:</strong>
            </div>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#e8f5e9', borderRadius: 4 }}>
              <div className="meta" style={{ marginBottom: 8 }}>
                ✓ Professor has signed and uploaded your request
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  onClick={handleDownloadSignedFile}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4,
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Download Signed File
                </Button>
              </div>
              <div className="meta" style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                Your signed request is ready for download. The process is complete!
              </div>
            </div>
          </div>
        ) : hasUploadedFile ? (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              <strong>Uploaded File:</strong>
            </div>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#e7f3ff', borderRadius: 4 }}>
              <div className="meta" style={{ marginBottom: 8 }}>
                📄 Request file uploaded
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  onClick={handleDownload}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4,
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Download
                </Button>
                <Button
                  onClick={() => onDelete(approvedRequest.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </Button>
              </div>
              <div className="meta" style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                To replace this file, delete it first and then upload a new one.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              Upload the signed request PDF so your professor can access it. Only PDF files are accepted.
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSignedFormFile(e.target.files[0] || null)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={onUpload} disabled={uploadingSignedForm}>
                  {uploadingSignedForm ? 'Uploading...' : 'Upload PDF'}
                </Button>
                {signedFormFile && (
                  <div className="meta">Selected: {signedFormFile.name}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default ApprovedUploadSection;
