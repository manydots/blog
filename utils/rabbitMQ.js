/**
 * 对RabbitMQ的封装
 */
let amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.hosts = [{
            hostname: "47.98.58.14",
            username: "",
            password: "",
            authMechanism: "AMQPLAIN",
            pathname: "/",
            ssl: {
                enabled: false
            }
        }];
        this.index = 0;
        this.length = this.hosts.length;
        this.open = amqp.connect(this.hosts[this.index]);
    }
    sendQueueMsg(queueName, msg, errCallBack) {
        let self = this;
        self.open
            .then(function(conn) {
                return conn.createChannel();
            })
            .then(function(channel) {
                return channel.assertQueue(queueName).then(function(ok) {
                        return channel.sendToQueue(queueName, new Buffer(JSON.stringify(msg)), {
                            persistent: true
                        });
                    })
                    .then(function(data) {
                        if (data) {
                            errCallBack && errCallBack("success");
                            channel.close();
                        }
                    })
                    .catch(function() {
                        setTimeout(() => {
                            if (channel) {
                                channel.close();
                            }
                        }, 500)
                    });
            })
            .catch(function() {
                let num = self.index++;

                if (num <= self.length - 1) {
                    self.open = amqp.connect(self.hosts[num]);
                } else {
                    self.index == 0;
                }
            });
    }

    receiveQueueMsg(queueName, receiveCallBack, errCallBack) {
        let self = this;
        self.open
            .then(function(conn) {
                return conn.createChannel();
            })
            .then(function(channel) {
                return channel.assertQueue(queueName)
                    .then(function(ok) {
                        return channel.consume(queueName, function(msg) {
                                if (msg !== null) {
                                    let data = msg.content.toString();
                                    channel.ack(msg);
                                    receiveCallBack && receiveCallBack(data);
                                }
                            })
                            .finally(function() {
                                setTimeout(() => {
                                    if (channel) {
                                        channel.close();
                                    }
                                }, 500)
                            });
                    })
            })
            .catch(function() {
                let num = self.index++;
                if (num <= self.length - 1) {
                    self.open = amqp.connect(self.hosts[num]);
                } else {
                    self.index = 0;
                    self.open = amqp.connect(self.hosts[0]);
                }
            });
    }
}


module.exports = {
    RabbitMQ: RabbitMQ
};