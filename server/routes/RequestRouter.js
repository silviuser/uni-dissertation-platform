import express from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  getRequestsByStudent,
  getRequestsBySession,
  updateRequest,
} from "../dataAccess/RequestDA.js";

const router = express.Router();

function toPublicRequest(r) {
  if (!r) return null;
  const { id, studentId, sessionId, status, rejectionReason, studentFile, teacherFile, createdAt, updatedAt } = r;
  return { id, studentId, sessionId, status, rejectionReason, studentFile, teacherFile, createdAt, updatedAt };
}

router.post("/", async (req, res) => {
  try {
    const { studentId, sessionId } = req.body;
    if (!studentId || !sessionId) {
      return res.status(400).json({ message: "studentId și sessionId sunt obligatorii" });
    }

    const created = await createRequest({ studentId, sessionId, status: "PENDING" });
    return res.status(201).json(toPublicRequest(created));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la creare cerere", error: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const list = await getRequests();
    return res.json(list.map(toPublicRequest));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la listare cererilor", error: err.message });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const list = await getRequestsByStudent(req.params.studentId);
    return res.json(list.map(toPublicRequest));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la cautare cererilor studentului", error: err.message });
  }
});

router.get("/session/:sessionId", async (req, res) => {
  try {
    const list = await getRequestsBySession(req.params.sessionId);
    return res.json(list.map(toPublicRequest));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la cautare cererilor sesiunii", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const r = await getRequestById(req.params.id);
    if (!r) return res.status(404).json({ message: "Cerere inexistentă" });
    return res.json(toPublicRequest(r));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la obtinere cerere", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, rejectionReason, studentFile, teacherFile } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status este obligatoriu" });
    }

    if (status === "REJECTED" && !rejectionReason) {
      return res.status(400).json({ message: "rejectionReason este obligatoriu pentru status REJECTED" });
    }

    const updates = { status };
    if (rejectionReason) updates.rejectionReason = rejectionReason;
    if (studentFile) updates.studentFile = studentFile;
    if (teacherFile) updates.teacherFile = teacherFile;

    const updated = await updateRequest(req.params.id, updates);
    if (!updated) return res.status(404).json({ message: "Cerere inexistentă" });
    return res.json(toPublicRequest(updated));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la actualizare cerere", error: err.message });
  }
});

export default router;
