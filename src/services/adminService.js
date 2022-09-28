const AdminModel = require('../models/adminModel');
const mailer = require('../utility/email/sendEmail');

class AdminService {
  async create(data) {
    const admin = await AdminModel.create(data);
    return admin;
  }

  async findByEmail(email) {
    const admin = await AdminModel.findOne({ email });
    return admin;
  }

  async getAll() {
    const admins = await AdminModel.find({}).select(['-password', '-updatedAt', '-type']);
    return admins;
  }

  async sendPasswordMail(admin, password) {
    const adminMail = await mailer(
      admin.email,
      'BBWE Admin Password',
      {
        name: admin.firstName,
        password,
      },
    );
    return adminMail;
  }

  async delete(id) {
    const deletedAdmin = await AdminModel.findByIdAndDelete(id);
    return deletedAdmin;
  }
}

module.exports = new AdminService();
