import React from 'react';
import Card from '../ui/Card';

const statusLabel = (s, hasStudentFile, hasTeacherFile, hasRequest) => {
  if (!hasRequest) return 'Începe Aplicarea';
  if (s === 'APPROVED' && hasTeacherFile) return 'Fișier Semnat - Gata de Descărcare';
  if (s === 'APPROVED' && hasStudentFile) return 'Fișier Încărcat';
  switch (s) {
    case 'APPROVED': return 'Aprobat';
    case 'REJECTED': return 'Respins';
    default: return 'În Așteptare';
  }
};

const StatusCards = ({ latestRequest }) => {
  const hasStudentFile = !!latestRequest?.studentFile;
  const hasTeacherFile = !!latestRequest?.teacherFile;
  const hasRequest = !!latestRequest;
  return (
    <div className="dashboard-grid">
      <Card>
        <div className="title">Status Curent</div>
        <div style={{ height: 8 }} />
        <span className={`status-pill ${latestRequest?.status === 'APPROVED' ? 'approved' : latestRequest?.status === 'REJECTED' ? 'rejected' : !hasRequest ? 'new' : ''}`}>
          {statusLabel(latestRequest?.status, hasStudentFile, hasTeacherFile, hasRequest)}
        </span>
        <div className="meta" style={{ marginTop: 8 }}>
          {hasRequest ? `Ultima actualizare: ${new Date(latestRequest.updatedAt).toLocaleString()}` : 'Nu ai depus încă nicio cerere'}
        </div>
      </Card>

      <Card>
        <div className="title">Pașii Următori</div>
        <div className="meta" style={{ marginTop: 8 }}>
          {latestRequest?.status === 'APPROVED' && hasTeacherFile && 'Fișierul semnat este gata de descărcare. Procesul este complet!'}
          {latestRequest?.status === 'APPROVED' && hasStudentFile && !hasTeacherFile && 'Fișierul tău a fost încărcat. Profesorul îl revizuiește și semnează.'}
          {latestRequest?.status === 'APPROVED' && !hasStudentFile && 'Încarcă cererea semnată în format PDF pentru revizuire de către profesor.'}
          {latestRequest?.status === 'REJECTED' && `Motivul respingerii: ${latestRequest?.rejectionReason || 'Nu a fost specificat'}.`}
          {!latestRequest && 'Alege o sesiune și aplică pentru a începe procesul de licență.'}
          {latestRequest?.status === 'PENDING' && 'Cererea ta a fost trimisă. Vei primi o notificare când se ia o decizie.'}
        </div>
      </Card>
    </div>
  );
};

export default StatusCards;
