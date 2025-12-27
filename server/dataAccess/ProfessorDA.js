import Professor from "../entities/Professor.js";

async function createProfessor(professor) {
  return Professor.create(professor);
}

async function getProfessors() {
  return Professor.findAll();
}

async function getProfessorById(id) {
  return Professor.findByPk(id);
}

async function getProfessorByEmail(email) {
  return Professor.findOne({ where: { email } });
}

export {
  createProfessor,
  getProfessors,
  getProfessorById,
  getProfessorByEmail,
};