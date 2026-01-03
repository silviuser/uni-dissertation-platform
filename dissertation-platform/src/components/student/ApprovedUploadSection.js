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
  onDelete,
  onMessage
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
        onMessage?.({ type: 'error', text: 'Eroare la descărcarea fișierului' });
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `cerere-${approvedRequest.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      onMessage?.({ type: 'error', text: 'Eroare la descărcarea fișierului' });
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
        onMessage?.({ type: 'error', text: 'Eroare la descărcarea fișierului' });
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `cerere-semnata-${approvedRequest.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      onMessage?.({ type: 'error', text: 'Eroare la descărcarea fișierului' });
    }
  };

  return (
    <>
      <h2 className="section-title">{approvedRequest?.teacherFile ? 'Descarcă Cererea Semnată' : 'Încarcă Cererea Semnată'}</h2>
      <Card>
        <div className="title">Locul tău aprobat</div>
        <div className="meta" style={{ marginTop: 8 }}>
          {approvedRequest?.session?.universitySession?.name && approvedRequest?.session?.professor?.fullName
            ? `${approvedRequest.session.universitySession.name} - ${approvedRequest.session.professor.fullName}`
            : `Cerere #${approvedRequest?.id?.slice(0, 6).toUpperCase()}`}
        </div>
        {approvedRequest?.session?.professor?.department && (
          <div className="meta" style={{ marginTop: 4 }}>
            Departament: {approvedRequest.session.professor.department}
          </div>
        )}
        {approvedRequest?.teacherFile ? (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              <strong>✓ Cererea Semnată este Gata:</strong>
            </div>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#e8f5e9', borderRadius: 4 }}>
              <div className="meta" style={{ marginBottom: 8 }}>
                ✓ Profesorul a semnat și încărcat cererea ta
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
                  Descarcă Fișierul Semnat
                </Button>
              </div>
              <div className="meta" style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                Cererea ta semnată este gata de descărcare. Procesul este complet!
              </div>
            </div>
          </div>
        ) : hasUploadedFile ? (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              <strong>Fișier Încărcat:</strong>
            </div>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#e7f3ff', borderRadius: 4 }}>
              <div className="meta" style={{ marginBottom: 8 }}>
                📄 Cererea a fost încărcată
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
                  Descarcă
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
                  Șterge
                </Button>
              </div>
              <div className="meta" style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                Pentru a înlocui acest fișier, șterge-l mai întâi și apoi încarcă unul nou.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div className="meta">
              Încarcă cererea semnată în format PDF pentru ca profesorul să o poată accesa. Doar fișierele PDF sunt acceptate.
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSignedFormFile(e.target.files[0] || null)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={onUpload} disabled={uploadingSignedForm}>
                  {uploadingSignedForm ? 'Se încarcă...' : 'Încarcă PDF'}
                </Button>
                {signedFormFile && (
                  <div className="meta">Selectat: {signedFormFile.name}</div>
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
