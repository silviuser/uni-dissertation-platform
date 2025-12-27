import express from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  getSessionsByProfessor,
  findOverlappingSessions,
  updateSession,
} from "../dataAccess/SessionDA.js";

const router = express.Router();

function toPublicSession(s) {
  if (!s) return null;
  const { id, professorId, description, startTime, endTime, maxSpots } = s;
  return { id, professorId, description, startTime, endTime, maxSpots };
}

router.post("/", async (req, res) => {
  try {
    const { professorId, description, startTime, endTime, maxSpots } = req.body;
    if (!professorId || !startTime || !endTime || !maxSpots) {
      return res.status(400).json({ message: "professorId, startTime, endTime, maxSpots sunt obligatorii" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      return res.status(400).json({ message: "endTime trebuie să fie după startTime" });
    }

    const overlaps = await findOverlappingSessions(professorId, startDate, endDate);
    if (overlaps && overlaps.length > 0) {
      return res.status(409).json({ message: "Sesiune suprapusă pentru acest profesor la intervalul dat" });
    }

    const created = await createSession({ professorId, description, startTime: startDate, endTime: endDate, maxSpots });
    return res.status(201).json(toPublicSession(created));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la creare sesiune", error: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const list = await getSessions();
    return res.json(list.map(toPublicSession));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la listare sesiuni", error: err.message });
  }
});

router.get("/professor/:professorId", async (req, res) => {
  try {
    const list = await getSessionsByProfessor(req.params.professorId);
    return res.json(list.map(toPublicSession));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la cautare sesiuni profesor", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const s = await getSessionById(req.params.id);
    if (!s) return res.status(404).json({ message: "Sesiune inexistentă" });
    return res.json(toPublicSession(s));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la obtinere sesiune", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { description, startTime, endTime, maxSpots } = req.body;
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (startTime !== undefined) updates.startTime = new Date(startTime);
    if (endTime !== undefined) updates.endTime = new Date(endTime);
    if (maxSpots !== undefined) updates.maxSpots = maxSpots;

    const updated = await updateSession(req.params.id, updates);
    if (!updated) return res.status(404).json({ message: "Sesiune inexistentă" });
    return res.json(toPublicSession(updated));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la actualizare sesiune", error: err.message });
  }
});

export default router;
