const properties = {
  PORT: 8000,
  IP_REPORTER_PORT: 14236,
  REST_PORT: 8100,
  email_password: "",
  email_user: "inacio@versates.com",
  email_from: "inacio@versates.com",
  email_to: "dashboard-monitor@versates.pagerduty.com",
  email_send_shutdown_alert: true,
  monitor_maxtemp: 82,
  monitor_shutdowntemp: 84,
  database_url: "mongodb://localhost:27017/vminer",
  rabbit_url: "amqp://guest:guest@localhost",
  database_history_interval: "30", // minutes
  mysql_database: "vminer",
  mysql_database_host: "localhost",
  mysql_database_user: "vminer",
  mysql_database_passwd: "vminer"
};

for (var key in process.env) {
  if (process.env.hasOwnProperty(key) && properties[key] && process.env[key]) {
    properties[key] = process.env[key];
  }
}

module.exports = properties;
