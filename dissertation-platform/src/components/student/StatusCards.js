import React from 'react';
import Card from '../ui/Card';

const statusLabel = (s, hasStudentFile, hasTeacherFile) => {
  if (s === 'APPROVED' && hasTeacherFile) return 'File Signed - Ready to Download';
  if (s === 'APPROVED' && hasStudentFile) return 'File Uploaded';
  switch (s) {
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    default: return 'Pending Approval';
  }
};

const StatusCards = ({ latestRequest }) => {
  const hasStudentFile = !!latestRequest?.studentFile;
  const hasTeacherFile = !!latestRequest?.teacherFile;
  return (
    <div className="dashboard-grid">
      <Card>
        <div className="title">Current Status</div>
        <div style={{ height: 8 }} />
        <span className={`status-pill ${latestRequest?.status === 'APPROVED' ? 'approved' : latestRequest?.status === 'REJECTED' ? 'rejected' : ''}`}>
          {statusLabel(latestRequest?.status, hasStudentFile, hasTeacherFile)}
        </span>
        <div className="meta" style={{ marginTop: 8 }}>
          Last updated {latestRequest ? new Date(latestRequest.updatedAt).toLocaleString() : '—'}
        </div>
      </Card>

      <Card>
        <div className="title">Next Steps</div>
        <div className="meta" style={{ marginTop: 8 }}>
          {latestRequest?.status === 'APPROVED' && hasTeacherFile && 'Your signed request file is ready to download. The process is complete!'}
          {latestRequest?.status === 'APPROVED' && hasStudentFile && !hasTeacherFile && 'Your request file has been uploaded. The professor is now reviewing and signing it.'}
          {latestRequest?.status === 'APPROVED' && !hasStudentFile && 'Upload your signed request PDF so your professor can review it.'}
          {latestRequest?.status === 'REJECTED' && `Review feedback: ${latestRequest?.rejectionReason || 'No reason provided'}.`}
          {!latestRequest && 'Apply to a session to start your application.'}
          {latestRequest?.status === 'PENDING' && 'Your application has been submitted. You will receive an email notification once a decision has been made.'}
        </div>
      </Card>
    </div>
  );
};

export default StatusCards;
