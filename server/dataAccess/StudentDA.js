import Student from "../entities/Student.js";

async function createStudent(student) {
    return Student.create(student);
}

async function getStudents() {
    return Student.findAll();
}

async function getStudentById(id) {
    return Student.findByPk(id);
}

async function getStudentByEmail(email) {
    return Student.findOne({ where: { email } });
}

export {
    createStudent,
    getStudents,
    getStudentById,
    getStudentByEmail,
};