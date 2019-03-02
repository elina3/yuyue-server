'use strict';
var async = require('async');
var cryptoLib = require('../libraries/crypto'),
    publicLib = require('../libraries/public'),
  enumLib = require('../enums/business');
var userLogic  = require('../logics/user'),
  appointmentLogic = require('../logics/appointment');
var systemError = require('../errors/system'),
userError = require('../errors/user'),
appointmentError = require('../errors/appointment');

//后台获取所有预约
exports.getAllAppointments = function(req, res, next){
  appointmentLogic.getAllAppointments({
    search_key: req.query.search_key,
    department_id: req.query.department_id,
    outpatient_type: req.query.outpatient_type
  }, req.pagination, function(err, results){
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
        outpatient_type: results.getDoctor.outpatient_type,
        price: results.getDoctor.price,
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
          price: user.price
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
        return autoCallback(err, appointment);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      appointment_info: results.createAppointment
    };
    return next();
  });
};

exports.getMyAppointments = function(req, res, next){
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

