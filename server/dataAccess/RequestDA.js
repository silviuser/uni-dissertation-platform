import Request from "../entities/Request.js";

async function createRequest(request) {
  return Request.create(request);
}

async function getRequests() {
  return Request.findAll();
}

async function getRequestById(id) {
  return Request.findByPk(id);
}

async function getRequestsByStudent(studentId) {
  return Request.findAll({ where: { studentId } });
}

async function getRequestsBySession(sessionId) {
  return Request.findAll({ where: { sessionId } });
}

async function updateRequest(id, updates) {
  const req = await Request.findByPk(id);
  if (!req) return null;
  Object.assign(req, updates);
  return req.save();
}

export {
  createRequest,
  getRequests,
  getRequestById,
  getRequestsByStudent,
  getRequestsBySession,
  updateRequest,
};