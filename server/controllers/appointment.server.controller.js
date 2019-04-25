'use strict';
var async = require('async');
var cryptoLib = require('../libraries/crypto'),
    publicLib = require('../libraries/public'),
  enumLib = require('../enums/business');
var userLogic  = require('../logics/user'),
  appointmentLogic = require('../logics/appointment'),
    wechatService = require('../services/wechat');
var systemError = require('../errors/system'),
userError = require('../errors/user'),
appointmentError = require('../errors/appointment');

//后台获取所有预约
exports.getAllAppointments = function(req, res, next){


  var searchObj = {
    search_key: req.query.search_key,
    department_id: req.query.department_id,
    outpatient_type: req.query.outpatient_type
  };
  var timestamp = parseInt(req.query.appointment_timestamp) || 0;
  if(timestamp > 0){
    searchObj.appointment_time = new Date(timestamp);
  }

  appointmentLogic.getAllAppointments(searchObj, req.pagination, function(err, results){
    if(err){
      return next(err);
    }
    req.data= {
      appointments: results.appointments,
      total_count: results.totalCount
    };
    return next();
  });
};

exports.getPickupList = function(req, res, next){
  var IDCard = req.query.IDCard || '';
  var orderNumber = req.query.order_number || '';
  var cardNumber = req.query.card_number || '';
  if(!IDCard && !orderNumber && !cardNumber){
    return next({err: appointmentError.id_card_order_number_error});
  }
  appointmentLogic.getPickupList({
    IDCard: IDCard,
    order_number: orderNumber,
    card_number: cardNumber
  }, function(err, appointments){
    if(err){
      return next(err);
    }
    req.data= {
      appointments: appointments
    };
    return next();
  });
};
exports.pickupAppointment = function(req, res, next){
  var appointmentId = req.body.appointment_id || '';
  if(!appointmentId){
    return next({err: appointmentError.no_appointment_id});
  }
  appointmentLogic.pickupAppointment(req.user, appointmentId, function(err, appointment){
    if(err){
      return next(err);
    }
    req.data= {
      appointment: appointment
    };
    return next();
  });
};

//获取医生所有可预约时间段的号源--app
exports.getAllUnBookSchedules = function(req, res, next){
  var doctorId = req.query.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserDetailById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, {
          _id: doctorId,
          nickname: user.nickname,
          outpatient_type: user.outpatient_type,
          job_title: user.job_title,
          price: user.price,
          head_photo: user.head_photo
        });
      });
    },
    schedules: ['getDoctor', function(autoCallback, result){
      appointmentLogic.getAllUnBookSchedules(result.getDoctor._id, function(err, schedules){
        if(err){
          return autoCallback(err);
        }
        return autoCallback(null, schedules);
      });
    }],
    loadScheduleNumbers: ['schedules', function(autoCallback, result){
      appointmentLogic.getAppointmentCountByDateSchedules(result.schedules, function(err){
        return autoCallback(err);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      schedules: results.schedules,
      doctor: results.getDoctor
    };
    return next();
  });
};

exports.previewAppointmentInfo = function(req, res, next){
  var doctorId = req.query.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  var scheduleId = req.query.schedule_id || '';
  if(!scheduleId){
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserDetailById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, {
          _id: doctorId,
          nickname: user.nickname,
          department: user.department,
          outpatient_type: user.outpatient_type,
          price: user.price
        });
      });
    },
    getSchedule: function(autoCallback){
      userLogic.getScheduleDetail(scheduleId, function(err, schedule){
        if(err){
          return autoCallback(err);
        }

        return autoCallback(null, schedule);
      });
    }
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      appointment_info: {
        doctor_name: results.getDoctor.nickname,
        department_name: results.getDoctor.department.name,
        outpatient_type: results.getSchedule.outpatient_type || results.getDoctor.outpatient_type,
        price_type: results.getSchedule.price_type || 'price',
        price: results.getSchedule.price || results.getDoctor.price,
        date_string: results.getSchedule.date_string,
        start_time_string: results.getSchedule.start_time_string,
        end_time_string: results.getSchedule.end_time_string
      }
    };
    return next();
  });
};

//创建新预约
exports.createNewAppointmentInfo = function(req, res, next){
  var doctorId = req.query.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  var scheduleId = req.query.schedule_id || '';
  if(!scheduleId){
    return next({err: systemError.param_null_error});
  }

  var paymentMethod = req.query.payment_method || '';
  var isValid = enumLib.payment_methods.valid(paymentMethod);
  if(!isValid){
    return next({err: appointmentError.no_payment_method});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserDetailById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, {
          _id: doctorId,
          nickname: user.nickname,
          department: user.department,
          outpatient_type: user.outpatient_type,
          price: user.price,
          special_price: user.special_price,
          card_number: user.card_number
        });
      });
    },
    getSchedule: function(autoCallback){
      userLogic.getScheduleDetail(scheduleId, function(err, schedule){
        if(err){
          return autoCallback(err);
        }

        if(schedule.start_time.getTime() <= new Date().getTime()){
          return autoCallback({err: appointmentError.appointment_over});
        }

        return autoCallback(null, schedule);
      });
    },
    createAppointment: ['getDoctor', 'getSchedule', function(autoCallback, results){
      appointmentLogic.createAppointment(req.member, results.getDoctor, results.getSchedule, paymentMethod, function(err, appointment){
        if(err){
          return autoCallback(err);
        }

        wechatService.sendAppointmentSuccess(req.member.open_id, 'http://datonghao.com/client/#/me/appointment', {
          doctor: results.getDoctor,
          nickname: req.member.nickname,
          department: results.getDoctor.department,
          start_time: results.getSchedule.start_time,
          end_time: results.getSchedule.end_time,
          card_number: results.getDoctor.card_number
        }, function(err){});
        return autoCallback(null, appointment);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      appointment: results.createAppointment.appointment
    };
    return next();
  });
};

exports.getMyAppointments = function(req, res, next){
  var member = req.member;
  if(!member.IDCard && !member.card_number){
    req.data = {
      appointments: []
    };
    return next();
  }
  appointmentLogic.getMyAppointments(req.member, function(err, appointments){
    if(err){
      return next(err);
    }
    req.data= {
      appointments: appointments
    };
    return next();
  });
};
exports.getAppointmentDetail  =function(req, res, next){

  var appointmentId = req.query.appointment_id || '';
  if(!appointmentId){
    return next({err: systemError.param_null_error});
  }
  appointmentLogic.getAppointmentDetailById(appointmentId, function(err, appointment){
    if(err){
      return next(err);
    }
    req.data  = {
      appointment: appointment
    };
    return next();
  });
};

//取消新预约
exports.cancelAppointment = function(req, res, next){
  var appointmentId = req.query.appointment_id || '';
  if(!appointmentId){
    return next({err: systemError.param_null_error});
  }

  appointmentLogic.cancelAppointment(req.member._id, appointmentId, function(err, appointment){
    if(err){
      return next(err);
    }

    wechatService.sendCancelAppointmentMessage(req.member.open_id, 'http://datonghao.com/client/#/me/appointment', {
      doctor: appointment.doctor,
      nickname: req.member.nickname,
      department: appointment.department,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      card_number: appointment.card_number
    }, function(err){});

    req.data = {
      success: true
    };
    return next();
  });
};
