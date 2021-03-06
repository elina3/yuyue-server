'use strict';
var async = require('async');
var systemError = require('../errors/system');
var memberError = require('../errors/member');
var appointmentError = require('../errors/appointment');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User'),
  DoctorSchedule = appDb.model('DoctorSchedule'),
  Payment = appDb.model('Payment'),
  Appointment = appDb.model('Appointment');

var doctorActionHistoryLogic = require('./doctor_action_history');

exports.getAllUnBookSchedules = function (doctorId, callback) {
  var now = new Date();
  var query = {
    doctor: mongoLib.generateNewObjectId(doctorId),
    end_time: {$gt: now},
  };
  DoctorSchedule.aggregate([
    {$match: query},
    {$sort: {start_time: 1}},
    {
      $group:
        {
          _id: '$date_string',
          date_string: {$first: '$date_string'},
          date: {$first: '$start_time'},
          schedules: {
            $push: {
              _id: '$_id',
              start_time: '$start_time',
              end_time: '$end_time',
              start_time_string: '$start_time_string',
              end_time_string: '$end_time_string',
              number_count: '$number_count',
              is_stopped: '$is_stopped'
            },
          },
        },
    },
    {
      $sort: {date: 1},
    },
  ], function (err, results) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, results);
  });
};

function generatePaymentOrderNumber(memberId, doctorId) {
  return 'zf' + substringById(memberId) + substringById(doctorId) +
    new Date().Format('yyyyMMddhhmmss');
}

function createOnePayment(member, doctor, schedule, appointment, callback) {
  var query = {
    member: member._id,
    IDCard: member.IDCard,
    doctor_schedule: schedule._id,
  };
  Payment.find(query).exec(function (err, payment) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (payment) {
      return callback(payment);
    }

    payment = {
      pay_method: 'wechat',
      payment_order: generatePaymentOrderNumber(member._id.toString(),
        doctor._id.toString()),
      member: member._id,
      open_id: member.open_id,//微信open_id不会变
      IDCard: member.IDCard,//绑定的身份证可能变
      doctor_schedule: schedule._id,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      appointment: appointment._id,
      appointment_time: appointment.appointment_time,
      status: 'unpaid',
      price: doctor.price,
    };
    if (member.card_type) {//用户可能没有绑定卡
      payment.card_type = member.card_type;
    }
    if (member.card_number) {//用户可能没有绑定卡
      payment.card_number = member.card_number;
    }
    payment.save(function (err, newPayment) {
      if (err) {
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newPayment);
    });
  });
}

function substringById(objectIdString) {
  return objectIdString.substring(objectIdString.length - 3,
    objectIdString.length);
}

function generateOrderNumber(memberId, doctorId) {
  return 'dd' + substringById(memberId) + substringById(doctorId) +
    new Date().Format('yyyyMMddhhmmss');
}

function createOneAppointment(member, doctor, schedule, payMethod, callback) {
  var appointment = new Appointment({
    order_number: generateOrderNumber(member._id.toString(),
      doctor._id.toString()),
    member: member._id,
    IDCard: member.IDCard,
    card_type: member.card_type,
    nickname: member.nickname,
    doctor_schedule: schedule._id,
    doctor: doctor._id,
    department: doctor.department._id,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    appointment_time: new Date(),
    pay_method: payMethod,
    status: payMethod === 'offline' ? 'booked' : 'booking',
    paid: false,
    outpatient_type: doctor.outpatient_type,
    price_type: schedule.price_type,
    price: schedule.price,
  });
  if (member.card_type) {
    appointment.card_type = member.card_type;
  }
  if (member.card_number) {
    appointment.card_number = member.card_number;
  }
  appointment.save(function (err, saved) {
    if (err) {
      console.error(err);
      return callback({err: systemError.database_save_error});
    }
    return callback(null, saved);
  });
}

exports.createAppointment = function (member, doctor, schedule, payMethod, callback) {
  if (!member.IDCard) {
    return callback({err: memberError.member_no_IDCard});
  }

  var query = {
    member: member._id,
    doctor_schedule: schedule._id,
    canceled: {$ne: true},
  };
  Appointment.findOne(query).exec(function (err, appointment) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (appointment) {
      return callback({err: appointmentError.has_booked});
    }

    //该医生这个时间段的排班总共预约了多少条
    Appointment.count({
      doctor_schedule: schedule._id,
      canceled: {$ne: true},
    }, function (err, totalCount) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      console.log('schedule.number_count:' + schedule.number_count);
      console.log('Appointment.count:' + totalCount);
      if (schedule.number_count <= totalCount) {
        return callback({err: appointmentError.schedule_out_of_limit});
      }

      if (payMethod === 'wechat') {
        createOneAppointment(member, doctor, schedule, payMethod,
          function (err, appointment) {
            if (err) {
              return callback(err);
            }

            createOnePayment(member, doctor, schedule, appointment,
              function (err, payment) {
                if (err) {
                  return callback(err);
                }

                //todo 调用微信支付

                return callback(null,
                  {payment: payment, appointment: appointment});
              });
          });
      } else {
        createOneAppointment(member, doctor, schedule, payMethod,
          function (err, appointment) {
            if (err) {
              return callback(err);
            }

            return callback(null, {appointment: appointment});
          });
      }
    });
  });
};

//后台管理查看所有预约情况
exports.getAllAppointments = function (filter, pagination, callback) {
  var query = {};
  if (filter.search_key) {
    var regexObj = {$regex: filter.search_key, $options: '$i'};
    query.$or = [
      {IDCard: regexObj},
      {nickname: regexObj},
      {card_number: regexObj},
      {order_number: regexObj},
    ];
  }
  if (filter.department_id) {
    query.department = filter.department_id;
  }
  if (filter.outpatient_type) {
    query.outpatient_type = filter.outpatient_type;
  }
  if (filter.appointment_time) {
    var secondDay = new Date(filter.appointment_time.getTime() + 24 * 60 * 60 *
      1000);
    console.log(secondDay.Format('yyyy-MM-dd hh:mm:ss'));
    query.$and = [
      {start_time: {$gte: filter.appointment_time}},
      {end_time: {$lt: secondDay}}];
  }
  Appointment.count(query).exec(function (err, totalCount) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (totalCount === 0) {
      return callback(null, {appointments: [], totalCount: 0});
    }

    if (pagination.limit === -1) {
      pagination.limit = 10;
    }
    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    Appointment.find(query).skip(pagination.skip_count).limit(pagination.limit).sort({appointment_time: -1}).populate('member').exec(function (err, appointments) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      return callback(null,
        {appointments: appointments, totalCount: totalCount});
    });

  });
};
exports.getPickupList = function (filter, callback) {
  var query = {};
  if (filter.IDCard && filter.order_number && filter.card_number) {
    query = {
      $or: [
        {IDcard: {$regex: filter.IDCard, $options: '$i'}},
        {card_number: {$regex: filter.card_number, $options: '$i'}},
        {order_number: {$regex: filter.order_number, $options: '$i'}}],
    };
  } else {
    if (filter.IDCard) {
      query.IDCard = {$regex: filter.IDCard, $options: '$i'};
    }
    if (filter.order_number) {
      query.order_number = {$regex: filter.order_number, $options: '$i'};
    }
    if (filter.card_number) {
      query.card_number = {$regex: filter.card_number, $options: '$i'};
    }
  }
  Appointment.find(query).sort({appointment_time: -1}).populate('doctor department member doctor_schedule').exec(function (err, appointments) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, appointments);
  });
};
exports.pickupAppointment = function (user, appointmentId, callback) {
  var query = {
    _id: appointmentId,
  };

  Appointment.findOne(query).populate('doctor_schedule').exec(function (err, appointment) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (!appointment) {
      return callback({err: appointmentError.appointment_not_exist});
    }

    if (appointment.picked) {
      return callback({err: appointmentError.has_been_picked});
    }

    if (appointment.canceled) {
      return callback({err: appointmentError.has_been_canceled});
    }

    if (appointment.doctor_schedule.is_stopped) {
      return callback({err: appointmentError.doctor_schedule_stopped});
    }

    var updateObj = {
      picked: true,
      picked_time: new Date(),
      picked_user: user._id,
      status: 'picked_up',
    };
    Appointment.update(query, {$set: updateObj}, function (err) {
      if (err) {
        return callback({err: systemError.database_update_error});
      }

      Appointment.findOne(query)//前端需要返回完整的数据用于重新渲染页面
        .populate('doctor department member').exec(function (err, newObj) {
        if (err) {
          return callback({err: systemError.database_query_error});
        }

        return callback(null, newObj);
      });
    });
  });
};

//app端获取自己的所有预约内容
exports.getMyAppointments = function (member, callback) {
  var query = {};
  if (member.IDCard && member.card_number) {
    query.$or = [
      {IDCard: member.IDCard},
      {card_number: member.card_number}];
  } else {
    if (member.IDCard) {
      query.IDCard = member.IDCard;
    }
    if (member.card_number) {
      query.card_number = member.card_number;
    }
  }

  Appointment.find(query).sort({appointment_time: -1}).populate('doctor department member doctor_schedule').exec(function (err, appointments) {
    if (err) {
      console.log(err)
      return callback({err: systemError.database_query_error});
    }

    if (appointments.length > 0) {
      console.log('appointments:');
      console.log(appointments[0]);
    }

    return callback(null, appointments);
  });
};

exports.getAppointmentDetailById = function (appointmentId, callback) {
  var query = {
    _id: appointmentId,
  };
  Appointment.findOne(query).populate('doctor department member doctor_schedule').exec(function (err, appointment) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (!appointment) {
      return callback({err: appointmentError.appointment_not_exist});
    }

    console.log(appointment);

    return callback(null, appointment);
  });
};

function getScheduleAppointmentCount(scheduleId, callback) {
  var query = {
    doctor_schedule: scheduleId,
    canceled: false,
  };
  Appointment.count(query).exec(function (err, totalCount) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, totalCount);
  });
}

exports.getScheduleAppointmentCount = getScheduleAppointmentCount;

exports.cancelAppointment = function (memberId, appointmentId, callback) {
  Appointment.findOne({_id: appointmentId}).populate('doctor department').exec(function (err, appointment) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    if (memberId.toString() !== appointment.member.toString()) {
      return callback({err: appointmentError.no_permission_to_cancel});
    }

    if (appointment.canceled) {
      return callback({err: appointmentError.has_been_canceled});
    }

    if (appointment.picked) {
      return callback({err: appointmentError.has_been_picked});
    }

    DoctorSchedule.findOne({_id: appointment.doctor_schedule}).exec(function (err, schedule) {
      if (err) {
        return callback({err: systemError.database_query_error});
      }

      //医生就诊时间从未变更时，过了预约开始时间不允许取消；如果有医生变更了时间，都允许取消，重新预约
      if (schedule.start_time == appointment.start_time && schedule.end_time == appointment.end_time && new Date() >= appointment.start_time) {
        return callback({err: appointmentError.not_cancel_for_over_time});
      }

      Appointment.update({_id: appointmentId}, {
        $set: {
          canceled: true,
          canceled_time: new Date(),
          status: 'canceled',
        },
      }, function (err) {
        if (err) {
          return callback({err: systemError.database_update_error});
        }

        return callback(null, appointment);
      });
    });
  });
};

exports.loadScheduleAppointmentCount = function (schedules, callback) {
  async.each(schedules, function (schedule, eachCallback) {
    getScheduleAppointmentCount(schedule._id, function (err, count) {
      if (err) {
        return eachCallback(err);
      }
      schedule._doc.booked = count;
      return eachCallback();
    });
  }, function (err) {
    return callback(err);
  });
};
exports.getAppointmentCountByDateSchedules = function (dateSchedules, callback) {
  async.each(dateSchedules, function (dateSchedule, eachCallback) {
    async.each(dateSchedule.schedules, function (schedule, innerEachCallback) {
      getScheduleAppointmentCount(schedule._id, function (err, count) {
        if (err) {
          return innerEachCallback(err);
        }
        schedule.booked = count;
        return innerEachCallback();
      });
    }, function (err) {
      return eachCallback(err);
    });
  }, function (err) {
    return callback(err);
  });
};

exports.getScheduleAppointmentWithMemberInfo = function (doctorScheduleId, callback) {
  var query = {
    doctor_schedule: doctorScheduleId,
    canceled: false,
  };
  Appointment.find(query).select(
    'member.nickname member.mobile_phone member.open_id doctor department start_time nickname end_time').populate('member doctor department').exec(function (err, appointments) {
    if (err) {
      return callback({err: systemError.database_query_error});
    }

    return callback(null, appointments);
  });
};


