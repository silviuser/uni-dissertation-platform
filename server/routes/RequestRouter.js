import express from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  getRequestsByStudent,
  getRequestsBySession,
  updateRequest,
  deleteRequest,
} from "../dataAccess/RequestDA.js";
import { getSessionById } from "../dataAccess/SessionDA.js";
import { authenticate, requireProfessor, requireStudent } from "../middleware/auth.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads/studentFiles");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

function toPublicRequest(r) {
  if (!r) return null;
  const sessionData = r.session ? (r.session.toJSON ? r.session.toJSON() : r.session) : null;
  const { id, studentId, sessionId, status, rejectionReason, studentFile, teacherFile, applicationMessage, createdAt, updatedAt } = r;
  
  return { 
    id, 
    studentId, 
    sessionId, 
    status, 
    rejectionReason, 
    studentFile, 
    teacherFile, 
    applicationMessage, 
    createdAt, 
    updatedAt,
    session: sessionData ? {
      id: sessionData.id,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      professor: sessionData.professor ? {
        id: sessionData.professor.id,
        fullName: sessionData.professor.fullName,
        department: sessionData.professor.department
      } : null,
      universitySession: sessionData.universitySession ? {
        id: sessionData.universitySession.id,
        name: sessionData.universitySession.name
      } : null
    } : null
  };
}

router.post("/", authenticate, requireStudent, async (req, res) => {
  try {
    const { studentId, sessionId, applicationMessage } = req.body;
    if (!studentId || !sessionId) {
      return res.status(400).json({ message: "studentId și sessionId sunt obligatorii" });
    }

    // Verifică dacă studentul logat creează cerere pentru el însuși
    if (studentId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți crea cereri pentru alți studenți" });
    }

    const created = await createRequest({ studentId, sessionId, status: "PENDING", applicationMessage });
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

router.get("/:id/download-student-file", async (req, res) => {
  try {
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    if (!currentRequest.studentFile) {
      return res.status(404).json({ message: "Nu există fișier de descărcat" });
    }

    // Extract filename from the public path
    const filename = path.basename(currentRequest.studentFile);
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fișierul nu a fost găsit pe server", details: { filePath, uploadDir } });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ message: "Eroare la descărcare fișier", error: err.message });
  }
});

router.get("/:id/download-teacher-file", async (req, res) => {
  try {
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    if (!currentRequest.teacherFile) {
      return res.status(404).json({ message: "Nu există fișier de descărcat" });
    }

    // Extract filename from the public path
    const filename = path.basename(currentRequest.teacherFile);
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fișierul nu a fost găsit pe server" });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ message: "Eroare la descărcare fișier", error: err.message });
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

router.post("/:id/upload-student-file", authenticate, requireStudent, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    if (currentRequest.studentId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți încărca fișiere pentru cereri ale altor studenți" });
    }

    if (currentRequest.status !== "APPROVED") {
      return res.status(400).json({ message: "Poți încărca fișierul doar după aprobarea cererii" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Fișierul PDF este obligatoriu" });
    }

    const publicPath = `/uploads/studentFiles/${req.file.filename}`;
    await updateRequest(req.params.id, { studentFile: publicPath });

    const studentRequests = await getRequestsByStudent(currentRequest.studentId);
    const updatedFull = studentRequests.find(r => r.id === req.params.id) || currentRequest;

    return res.json(toPublicRequest(updatedFull));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la upload fișier", error: err.message });
  }
});

router.delete("/:id/student-file", authenticate, requireStudent, async (req, res) => {
  try {
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    if (currentRequest.studentId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți șterge fișiere pentru cereri ale altor studenți" });
    }

    if (!currentRequest.studentFile) {
      return res.status(400).json({ message: "Nu există fișier de șters" });
    }

    if (currentRequest.status !== "APPROVED") {
      return res.status(400).json({ message: "Poți șterge fișierul doar de pe o cerere aprobată" });
    }

    // Optionally delete the physical file
    if (fs.existsSync(path.join(uploadDir, path.basename(currentRequest.studentFile)))) {
      fs.unlinkSync(path.join(uploadDir, path.basename(currentRequest.studentFile)));
    }

    await updateRequest(req.params.id, { studentFile: null });

    const studentRequests = await getRequestsByStudent(currentRequest.studentId);
    const updated = studentRequests.find(r => r.id === req.params.id) || currentRequest;

    return res.json(toPublicRequest(updated));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la ștergere fișier", error: err.message });
  }
});

router.post("/:id/upload-teacher-file", authenticate, requireProfessor, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    // Verifică dacă sesiunea aparține profesorului logat
    const session = await getSessionById(currentRequest.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Sesiunea nu există" });
    }
    
    if (session.professorId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți încărca fișiere pentru sesiunile altor profesori" });
    }

    if (currentRequest.status !== "APPROVED") {
      return res.status(400).json({ message: "Poți încărca fișierul semnat doar de pe o cerere aprobată" });
    }

    if (!currentRequest.studentFile) {
      return res.status(400).json({ message: "Studentul trebuie să încarce mai întâi cererea sa" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Fișierul PDF este obligatoriu" });
    }

    const publicPath = `/uploads/studentFiles/${req.file.filename}`;
    await updateRequest(req.params.id, { teacherFile: publicPath });

    const updatedRequest = await getRequestById(req.params.id);

    return res.json(toPublicRequest(updatedRequest));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la upload fișier semnat", error: err.message });
  }
});

router.put("/:id", authenticate, requireProfessor, async (req, res) => {
  try {
    const { status, rejectionReason, studentFile, teacherFile } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status este obligatoriu" });
    }

    if (status === "REJECTED" && !rejectionReason) {
      return res.status(400).json({ message: "rejectionReason este obligatoriu pentru status REJECTED" });
    }

    // Obține cererea curentă pentru a verifica studentId și sessionId
    const currentRequest = await getRequestById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    // Verifică dacă sesiunea aparține profesorului logat
    const session = await getSessionById(currentRequest.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Sesiunea nu există" });
    }
    
    if (session.professorId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți modifica cereri pentru sesiunile altor profesori" });
    }

    // Verificări suplimentare dacă statusul devine APPROVED
    if (status === "APPROVED") {
      // 1. Verifică dacă studentul are deja o cerere APPROVED la alt profesor
      const studentRequests = await getRequestsByStudent(currentRequest.studentId);
      const existingApproved = studentRequests.find(
        r => r.status === "APPROVED" && r.id !== currentRequest.id
      );
      
      if (existingApproved) {
        return res.status(400).json({ 
          message: "Studentul are deja o cerere aprobată la un alt profesor" 
        });
      }

      // 2. Verifică numărul de locuri disponibile la sesiune
      const sessionRequests = await getRequestsBySession(currentRequest.sessionId);
      const approvedCount = sessionRequests.filter(r => r.status === "APPROVED").length;

      if (approvedCount >= session.maxSpots) {
        return res.status(400).json({ 
          message: `Sesiunea a atins limita maximă de ${session.maxSpots} locuri` 
        });
      }
    }

    const updates = { status };
    if (rejectionReason) updates.rejectionReason = rejectionReason;
    if (studentFile) updates.studentFile = studentFile;
    if (teacherFile) updates.teacherFile = teacherFile;

    const updated = await updateRequest(req.params.id, updates);
    if (!updated) return res.status(404).json({ message: "Cerere inexistentă" });

    // Dacă aprobăm o cerere, ștergem automat celelalte cereri ale studentului
    if (status === "APPROVED") {
      const studentRequests = await getRequestsByStudent(currentRequest.studentId);
      const toDelete = studentRequests.filter(r => r.id !== currentRequest.id);
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(r => deleteRequest(r.id)));
      }
    }

    return res.json(toPublicRequest(updated));
  } catch (err) {
    return res.status(500).json({ message: "Eroare la actualizare cerere", error: err.message });
  }
});

router.delete("/:id", authenticate, requireStudent, async (req, res) => {
  try {
    // Verifică dacă cererea aparține studentului logat
    const request = await getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Cerere inexistentă" });
    }

    if (request.studentId !== req.user.id) {
      return res.status(403).json({ message: "Nu poți șterge cereri ale altor studenți" });
    }

    const deleted = await deleteRequest(req.params.id);
    return res.json({ message: "Cerere ștearsă cu succes", request: toPublicRequest(deleted) });
  } catch (err) {
    return res.status(500).json({ message: "Eroare la ștergere cerere", error: err.message });
  }
});

export default router;
