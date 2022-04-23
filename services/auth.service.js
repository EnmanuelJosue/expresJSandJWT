const boom = require('@hapi/boom');
const UserService = require('./user.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {config} = require('../config/config');
const nodemailer = require('nodemailer');

const {models} = require('../libs/sequelize');

const service = new UserService();

class AuthService {
  async getUser(email, password){
    const user = await service.findByEmail(email);
    if(!user){
      throw boom.unauthorized();
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      throw boom.unauthorized();
    }
    delete user.dataValues.password;
    delete user.dataValues.recoveryToken;

    return user;
  }

  signToken(user){
      const payload = {
        sub: user.id,
        role: user.role
      }
      const token = jwt.sign(payload, config.jwtSecret);
      return{
        user,
        token
      };
  }

  async sendRecovery(email){
    const user = await service.findByEmail(email);
    if(!user){
      throw boom.unauthorized();
    }
    const payload = {
      sub: user.id
    };
    const token = jwt.sign(payload, config.jwtSecret, {expiresIn: '15min'});
    await service.update(user.id, {
      recoveryToken: token
    });
    const link = `http://myfrontend.com/recovery?token=${token}`;
    const mail = {
      from: 'manuelcanaima2612@gmail.com',
      to: `${user.email}`,
      subject: "Email para recuperar contraseña",
      html: `<b>Ingresa a este link => ${link} </b>`,
    }

    const rta = await this.sendMail(mail);
    return rta;
  }

  async changePassword(token, newPassword){
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOne(payload.sub);
      if(user.recoveryToken !== token){
        throw boom.unauthorized();
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, {recoveryToken: null, password:hash});
      return {message: 'password changed'};
    }catch (error) {
      throw boom.unauthorized(error);
    }
  }

  async sendMail(infoMail){
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
          user: config.smtpEmail,
          pass: config.smtpPassword
      }
    });
    await transporter.sendMail(infoMail);
    return { message: 'mail sent'}
  }
}

module.exports = AuthService;
