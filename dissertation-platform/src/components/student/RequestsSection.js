import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const RequestsSection = ({ myRequests, onDelete }) => {
  return (
    <>
      <h2 className="section-title">My Requests</h2>
      <Card>
        {myRequests && myRequests.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myRequests.map((req) => (
              <div key={req.id} style={{
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                backgroundColor: req.status === 'APPROVED' ? '#d4edda' : req.status === 'REJECTED' ? '#f8d7da' : '#fff'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '14px' }}>
                  {req.session?.universitySession?.name && req.session?.professor?.fullName
                    ? `${req.session.universitySession.name} - ${req.session.professor.fullName}`
                    : `Request #${req.id.slice(0, 6).toUpperCase()}`
                  }
                </div>
                <div className="meta" style={{ marginBottom: 4 }}>
                  <strong>Status:</strong> <span style={{
                    padding: '2px 6px',
                    borderRadius: 3,
                    backgroundColor: req.status === 'APPROVED' ? '#28a745' : req.status === 'REJECTED' ? '#dc3545' : '#ffc107',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {req.status}
                  </span>
                </div>
                <div className="meta" style={{ marginBottom: 4 }}>
                  <strong>Submitted:</strong> {new Date(req.createdAt).toLocaleDateString()}
                </div>
                {req.applicationMessage && (
                  <div className="meta" style={{ marginBottom: 4, fontSize: '12px', maxHeight: 60, overflow: 'auto' }}>
                    <strong>Message:</strong> {req.applicationMessage}
                  </div>
                )}
                {req.status === 'REJECTED' && req.rejectionReason && (
                  <div className="meta" style={{ marginBottom: 12, fontSize: '12px', color: '#dc3545', maxHeight: 60, overflow: 'auto' }}>
                    <strong>Reason:</strong> {req.rejectionReason}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button onClick={() => onDelete(req.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="meta">No requests yet. Browse sessions and apply to get started.</div>
        )}
      </Card>
    </>
  );
};

export default RequestsSection;
