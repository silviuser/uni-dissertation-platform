import express from "express";
import { createStudent, getStudents, getStudentById, getStudentByEmail } from "../dataAccess/StudentDA.js";
import bcrypt from "bcryptjs";

const router = express.Router();

function toPublicStudent(s) {
	if (!s) return null;
	const { id, email, fullName, group, createdAt } = s;
	return { id, email, fullName, group, createdAt };
}

router.post("/", async (req, res) => {
	try {
		const { email, password, fullName, group } = req.body;
		if (!email || !password || !fullName || !group) {
			return res.status(400).json({ message: "email, password, fullName, group sunt obligatorii" });
		}

		const existing = await getStudentByEmail(email);
		if (existing) {
			return res.status(409).json({ message: "Email deja folosit" });
		}

		const hash = bcrypt.hashSync(password, 10);
		const created = await createStudent({ email, password: hash, fullName, group });
		return res.status(201).json(toPublicStudent(created));
	} catch (err) {
		return res.status(500).json({ message: "Eroare la creare student", error: err.message });
	}
});

router.get("/", async (_req, res) => {
	try {
		const list = await getStudents();
		return res.json(list.map(toPublicStudent));
	} catch (err) {
		return res.status(500).json({ message: "Eroare la listare studenti", error: err.message });
	}
});

router.get("/by-email", async (req, res) => {
	try {
		const { email } = req.query;
		if (!email) return res.status(400).json({ message: "Parametrul email este necesar" });
		const s = await getStudentByEmail(String(email));
		if (!s) return res.status(404).json({ message: "Student inexistent" });
		return res.json(toPublicStudent(s));
	} catch (err) {
		return res.status(500).json({ message: "Eroare la cautare dupa email", error: err.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const s = await getStudentById(req.params.id);
		if (!s) return res.status(404).json({ message: "Student inexistent" });
		return res.json(toPublicStudent(s));
	} catch (err) {
		return res.status(500).json({ message: "Eroare la obtinere student", error: err.message });
	}
});

export default router;
